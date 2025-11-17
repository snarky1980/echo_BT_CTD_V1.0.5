#!/usr/bin/env node
/*
Convert .docx files (Word) to a JSON array of templates friendly with Admin bulk import.

Input assumptions (flexible):
- Table-based documents: each row defines a template with columns like
  ID, Category, Title FR, Title EN, Description FR, Description EN, Subject FR, Subject EN, Body FR, Body EN
  (headers are case-insensitive, commas/semicolons ignored).
- Label-based sections: repeated blocks with labels like
  ID:, Category:, Title FR:, Title EN:, Description FR:, Description EN:, Subject FR:, Subject EN:, Body FR:, Body EN:

Usage:
  node scripts/docx-to-templates.mjs input.docx > templates.json
  node scripts/docx-to-templates.mjs dir/*.docx > templates.json

Notes:
- Requires: mammoth (to convert docx to HTML), cheerio (to parse HTML)
- We try to extract tables first; if none, fall back to label-based parsing.
- We sanitize IDs and leave them missing if not present (your Admin UI will generate unique IDs on import).
*/
import fs from 'node:fs';
import path from 'node:path';
import mammoth from 'mammoth';
import cheerio from 'cheerio';

const FIELDS = {
  id: ['id', 'slug', 'key'],
  category: ['category', 'categorie', 'cat'],
  title_fr: ['title fr', 'titre fr', 'title_fr', 'titre_fr'],
  title_en: ['title en', 'titre en', 'title_en', 'titre_en'],
  description_fr: ['description fr', 'desc fr', 'description_fr', 'desc_fr'],
  description_en: ['description en', 'desc en', 'description_en', 'desc_en'],
  subject_fr: ['subject fr', 'objet fr', 'subject_fr', 'objet_fr'],
  subject_en: ['subject en', 'objet en', 'subject_en', 'objet_en'],
  body_fr: ['body fr', 'corps fr', 'body_fr', 'corps_fr'],
  body_en: ['body en', 'corps en', 'body_en', 'corps_en']
};

function norm(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }
function sanitizeId(s) { return String(s || '').trim().replace(/[^A-Za-z0-9_]+/g, '_'); }

async function docxToHtml(filePath) {
  const buf = fs.readFileSync(filePath);
  const res = await mammoth.convertToHtml({ buffer: buf }, {
    styleMap: ["p[style-name='Normal'] => p:fresh"],
    includeDefaultStyleMap: true
  });
  return res.value; // HTML string
}

function parseTables($) {
  const rows = [];
  $('table').each((_, tbl) => {
    const $tbl = $(tbl);
    const trs = $tbl.find('tr');
    if (!trs.length) return;
    const headerCells = $(trs[0]).find('th,td').map((i, el) => norm($(el).text())).get();
    for (let i = 1; i < trs.length; i++) {
      const tds = $(trs[i]).find('td');
      if (!tds.length) continue;
      const obj = {};
      headerCells.forEach((h, idx) => {
        const val = norm($(tds[idx]).text());
        obj[h] = val;
      });
      rows.push(obj);
    }
  });
  return rows;
}

function mapFields(obj) {
  const out = {};
  for (const [key, aliases] of Object.entries(FIELDS)) {
    let found = '';
    for (const alias of aliases) {
      const direct = obj[alias];
      if (direct) { found = direct; break; }
      // also try with punctuation removed
      const noPunct = Object.keys(obj).find(k => k.replace(/[_.:]/g, ' ') === alias);
      if (noPunct && obj[noPunct]) { found = obj[noPunct]; break; }
    }
    out[key] = found || '';
  }
  return out;
}

function buildTemplate(mapped) {
  const id = sanitizeId(mapped.id);
  const cat = mapped.category;
  const tfr = mapped.title_fr, ten = mapped.title_en;
  const dfr = mapped.description_fr, den = mapped.description_en;
  const sfr = mapped.subject_fr, sen = mapped.subject_en;
  const bfr = mapped.body_fr, ben = mapped.body_en;
  return {
    id: id || undefined,
    category: cat || '',
    title: { fr: tfr, en: ten },
    description: { fr: dfr, en: den },
    subject: { fr: sfr, en: sen },
    body: { fr: bfr, en: ben }
  };
}

function parseLabelBlocks($) {
  // Look for paragraphs that start with labels like "Title FR:" etc., grouping until a blank line or next label
  const text = $('body').text();
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(s => s.length);
  const blocks = [];
  let cur = {};
  const pushCur = () => { if (Object.keys(cur).length) { blocks.push(cur); cur = {}; } };
  for (const ln of lines) {
    const m = ln.match(/^([A-Za-zÀ-ÖØ-öø-ÿ _.-]+):\s*(.*)$/);
    if (m) {
      const k = norm(m[1]);
      const v = m[2];
      // if we hit a new ID/Title label and current has content, start a new block
      if (k.includes('id') || k.includes('title') || k.includes('titre')) pushCur();
      cur[k] = (cur[k] ? cur[k] + '\n' : '') + v;
    } else {
      // continuation line
      const lastKey = Object.keys(cur).slice(-1)[0];
      if (lastKey) cur[lastKey] = cur[lastKey] + '\n' + ln;
    }
  }
  pushCur();
  // map each block by fuzzy keys
  return blocks.map(b => {
    const mapped = {};
    const kv = Object.fromEntries(Object.entries(b).map(([k, v]) => [norm(k), v]));
    const look = (aliases) => aliases.find(a => kv[a]) && kv[aliases.find(a => kv[a])];
    const out = {
      id: kv['id'] || '',
      category: kv['category'] || kv['categorie'] || kv['cat'] || '',
      title_fr: look(FIELDS.title_fr) || '',
      title_en: look(FIELDS.title_en) || '',
      description_fr: look(FIELDS.description_fr) || '',
      description_en: look(FIELDS.description_en) || '',
      subject_fr: look(FIELDS.subject_fr) || '',
      subject_en: look(FIELDS.subject_en) || '',
      body_fr: look(FIELDS.body_fr) || '',
      body_en: look(FIELDS.body_en) || ''
    };
    return out;
  });
}

async function convertDocx(filePath) {
  const html = await docxToHtml(filePath);
  const $ = cheerio.load(html);
  // First, try language-labeled sections (e.g., "EN – Subject:", "EN – Message body:")
  let items = parseLangLabeledTemplates($);
  if (!items.length) {
    // Try tables next
    const tableRows = parseTables($);
    if (tableRows.length) {
      items = tableRows.map(mapFields).map(buildTemplate);
    } else {
      const blocks = parseLabelBlocks($);
      items = blocks.map(buildTemplate);
    }
  }
  // Filter out empty ones (no title/subject/body in both langs)
  items = items.filter(t => (t.title?.fr || t.title?.en || t.subject?.fr || t.subject?.en || t.body?.fr || t.body?.en));
  return items;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/docx-to-templates.mjs <file.docx> [more.docx...] > templates.json');
    process.exit(1);
  }
  let all = [];
  for (const p of args) {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(p).filter(f => f.toLowerCase().endsWith('.docx'));
      for (const f of files) {
        const items = await convertDocx(path.join(p, f));
        all = all.concat(items);
      }
    } else {
      const items = await convertDocx(p);
      all = all.concat(items);
    }
  }
  process.stdout.write(JSON.stringify(all, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });

// ----- Helpers for language-labeled docs -----
function parseLangLabeledTemplates($) {
  const nodes = $('h1,h2,h3,h4,h5,h6,p').toArray();
  if (!nodes.length) return [];
  const results = [];
  let cur = newEmptyTpl();
  let currentField = null; // 'subject_en' | 'body_en' | 'subject_fr' | 'body_fr'

  const pushIfNonEmpty = () => {
    if (hasContent(cur)) {
      results.push(buildTemplateFromPartial(cur));
    }
    cur = newEmptyTpl();
    currentField = null;
  };

  for (const el of nodes) {
    const tag = el.tagName.toLowerCase();
    const text = $(el).text().trim();
    if (!text) continue;

    // Heading starts a new template block
    if (/^h[1-6]$/.test(tag)) {
      if (hasContent(cur)) pushIfNonEmpty();
      cur.title_en = cur.title_en || text; // default heading as EN title if none
      continue;
    }

    // Category line
    const catMatch = text.match(/^\s*(Category|Catégorie)\s*:\s*(.+)$/i);
    if (catMatch) {
      cur.category = catMatch[2].trim();
      // Category can also act as a boundary if we already had body/subject content; start a new one after
      continue;
    }

    // Language-labeled fields, accepting -, –, — as separators and optional colon
    const langField = text.match(/^\s*(EN|FR)\s*[\-–—]\s*(Subject|Message\s*body|Message|Body|Objet|Corps)\s*:?\s*(.*)$/i);
    if (langField) {
      const lang = langField[1].toUpperCase();
      const label = langField[2].toLowerCase();
      const rest = langField[3] || '';
      const key = (label.includes('subject') || label.includes('objet')) ? `subject_${lang.toLowerCase()}` : `body_${lang.toLowerCase()}`;
      currentField = key;
      if (!cur[currentField]) cur[currentField] = '';
      if (rest) {
        cur[currentField] = (cur[currentField] ? cur[currentField] + '\n' : '') + rest;
      }
      continue;
    }

    // Continuation lines: keep appending to currentField if set
    if (currentField) {
      cur[currentField] = (cur[currentField] ? cur[currentField] + '\n' : '') + text;
      continue;
    }

    // If no field is active yet and this is the first significant paragraph, use as a title fallback
    if (!cur.title_en && !cur.title_fr) {
      cur.title_en = text;
      continue;
    }
  }

  // push the last one
  if (hasContent(cur)) results.push(buildTemplateFromPartial(cur));
  return results;
}

function newEmptyTpl() {
  return { id: '', category: '', title_fr: '', title_en: '', description_fr: '', description_en: '', subject_fr: '', subject_en: '', body_fr: '', body_en: '' };
}
function hasContent(t) {
  return Boolean(t.title_fr || t.title_en || t.subject_fr || t.subject_en || t.body_fr || t.body_en);
}
function buildTemplateFromPartial(p) {
  return {
    id: p.id || undefined,
    category: p.category || '',
    title: { fr: p.title_fr || '', en: p.title_en || '' },
    description: { fr: p.description_fr || '', en: p.description_en || '' },
    subject: { fr: p.subject_fr || '', en: p.subject_en || '' },
    body: { fr: p.body_fr || '', en: p.body_en || '' },
  };
}
