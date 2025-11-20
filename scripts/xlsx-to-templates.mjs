#!/usr/bin/env node
/*
Convert an Excel file (.xlsx) to a JSON array compatible with the Admin bulk import.

Accepted headers (case-insensitive, flexible):
- id, category (or categorie/cat)
- title_fr (titre fr), title_en (titre en)
- description_fr (desc fr), description_en (desc en)
- subject_fr (objet fr), subject_en (objet en)
- body_fr (corps fr), body_en (corps en)
- variables or vars (semicolon/comma separated)

Usage:
  node scripts/xlsx-to-templates.mjs imports/templates.xlsx > imports/templates.json

If your FR and EN are in separate Excel files, convert both to JSON then merge:
  node scripts/xlsx-to-templates.mjs imports/fr.xlsx > imports/fr.json
  node scripts/xlsx-to-templates.mjs imports/en.xlsx > imports/en.json
  node scripts/merge-fr-en.mjs imports/fr.json imports/en.json > imports/combined.json
*/
import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx';

const ALIASES = new Map([
  // id/category
  ['id','id'], ['slug','id'], ['key','id'],
  ['category','category'], ['catégorie','category'], ['categorie','category'], ['cat','category'],
  ['category fr','category_fr'], ['categorie fr','category_fr'], ['category_fr','category_fr'],
  ['category en','category_en'], ['categorie en','category_en'], ['category_en','category_en'],
  // titles
  ['title fr','title_fr'], ['titre fr','title_fr'], ['title_fr','title_fr'], ['titre_fr','title_fr'],
  ['title en','title_en'], ['titre en','title_en'], ['title_en','title_en'], ['titre_en','title_en'],
  // descriptions
  ['description fr','description_fr'], ['desc fr','description_fr'], ['description_fr','description_fr'], ['desc_fr','description_fr'],
  ['description en','description_en'], ['desc en','description_en'], ['description_en','description_en'], ['desc_en','description_en'],
  // subjects
  ['subject fr','subject_fr'], ['objet fr','subject_fr'], ['subject_fr','subject_fr'], ['objet_fr','subject_fr'],
  ['subject en','subject_en'], ['objet en','subject_en'], ['subject_en','subject_en'], ['objet_en','subject_en'],
  // bodies
  ['body fr','body_fr'], ['corps fr','body_fr'], ['body_fr','body_fr'], ['corps_fr','body_fr'],
  ['body en','body_en'], ['corps en','body_en'], ['body_en','body_en'], ['corps_en','body_en'],
  ['template fr','body_fr'], ['template_fr','body_fr'],
  ['template en','body_en'], ['template_en','body_en'],
  // variables list
  ['variables','variables'], ['vars','variables'],
  ['variables description en','variables_description_en'],
  ['variables description fr','variables_description_fr']
]);

function norm(s) { return String(s || '').trim().toLowerCase().replace(/[_.:]/g, ' ').replace(/\s+/g, ' '); }
function sanitizeId(s) { return String(s || '').trim().replace(/[^A-Za-z0-9_]+/g, '_'); }

function toSnakeCase(value = '') {
  if (!value) return '';
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return normalized
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .replace(/[^A-Za-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function parseVariableLine(line = '', lang = 'en') {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^<<\s*([^>]+)\s*>>\s*:?(.*)$/);
  if (!match) return null;
  const rawName = match[1].trim();
  const remainder = match[2] || '';
  let description = remainder;
  let example = '';
  const exampleMatch = remainder.match(/\(([^)]+)\)\s*$/);
  if (exampleMatch) {
    example = exampleMatch[1].trim();
    description = remainder.slice(0, exampleMatch.index).trim();
  }
  if (description.startsWith(':')) description = description.slice(1).trim();
  if (!description && !example) return null;

  const normalizedName = normalizeVariableKey(rawName);
  if (!normalizedName) return null;

  return {
    baseName: normalizedName,
    lang,
    description,
    example
  };
}

function normalizeVariableKey(rawName = '') {
  let token = rawName.replace(/^<<|>>$/g, '').trim();
  token = token.replace(/_(FR|EN)$/i, '');
  return toSnakeCase(token);
}

function parseVariableDescriptions(rawEn = '', rawFr = '') {
  const order = [];
  const meta = {};
  const register = (line, lang) => {
    const parsed = parseVariableLine(line, lang);
    if (!parsed) return;
    const { baseName, description, example } = parsed;
    if (!meta[baseName]) meta[baseName] = {};
    meta[baseName][lang] = { description, example };
    if (!order.includes(baseName)) order.push(baseName);
  };

  rawEn.split(/\r?\n/).forEach(line => register(line, 'en'));
  rawFr.split(/\r?\n/).forEach(line => register(line, 'fr'));

  return {
    list: order,
    meta
  };
}

function inferFormat(example = '') {
  const value = (example || '').trim();
  if (!value) return 'text';
  if (/^https?:\/\//i.test(value)) return 'url';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value) || /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(value) || /\d{1,2}\s+[A-Za-zÀ-ÿ]+\s+\d{4}/.test(value)) return 'date';
  const numeric = value.replace(/[\s,._]/g, '');
  if (/^[$€£]?\d+(\.\d+)?%?$/.test(value) || /^\d+(?:\.\d+)?$/.test(numeric)) {
    if (/[€$£]/.test(value)) return 'currency';
    return 'number';
  }
  return 'text';
}

function mergeVariableLibrary(target, additions) {
  Object.entries(additions || {}).forEach(([baseName, data]) => {
    if (!baseName) return;
    if (!target[baseName]) {
      target[baseName] = {
        description: {},
        example: {},
        format: 'text'
      };
    }
    const current = target[baseName];
    const exampleValue = data?.en?.example || data?.fr?.example || '';
    const guessedFormat = inferFormat(exampleValue);
    if (guessedFormat && (current.format === 'text' || !current.format)) {
      current.format = guessedFormat;
    }
    if (data?.en) {
      if (data.en.description) current.description.en = data.en.description;
      if (data.en.example) current.example.en = data.en.example;
    }
    if (data?.fr) {
      if (data.fr.description) current.description.fr = data.fr.description;
      if (data.fr.example) current.example.fr = data.fr.example;
    }
  });
}

function loadSheet(filePath) {
  const wb = XLSX.readFile(filePath);
  const name = wb.SheetNames[0];
  if (!name) throw new Error('No sheet found');
  const ws = wb.Sheets[name];
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
}

function toObjects(rows) {
  if (!rows?.length) return [];
  const header = rows[0].map(h => ALIASES.get(norm(h)) || norm(h));
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || row.every(cell => String(cell || '').trim() === '')) continue;
    const obj = {};
    for (let c = 0; c < header.length; c++) {
      const key = header[c];
      if (!key) continue;
      const value = row[c] != null ? String(row[c]) : '';
      obj[key] = value;
    }
    out.push(obj);
  }
  return out;
}
function normalizeRow(raw, context) {
  if (!raw || typeof raw !== 'object') return null;

  const id = sanitizeId(raw.id || '');
  if (!id) return null;
  if (context.seenIds.has(id)) {
    throw new Error(`Duplicate template id detected: ${id}`);
  }
  context.seenIds.add(id);

  const categoryEn = String(raw.category_en || raw['category en'] || '').trim();
  const categoryFr = String(raw.category_fr || raw['category fr'] || raw.category || '').trim();
  const fallbackLabel = categoryEn || categoryFr || 'Autres';
  let categoryKey = toSnakeCase(fallbackLabel);
  if (!categoryKey) categoryKey = 'autres';

  context.categories.add(categoryKey);
  context.categoryLabels[categoryKey] = {
    en: categoryEn || fallbackLabel,
    fr: categoryFr || fallbackLabel
  };

  const titleEn = (raw.title_en || '').trim();
  const titleFr = (raw.title_fr || '').trim();
  const descriptionEn = (raw.description_en || '').trim();
  const descriptionFr = (raw.description_fr || '').trim();
  const bodyEn = (raw.body_en || '').trim();
  const bodyFr = (raw.body_fr || '').trim();

  const variablesData = parseVariableDescriptions(
    raw.variables_description_en || raw['variables description en'] || '',
    raw.variables_description_fr || raw['variables description fr'] || ''
  );

  mergeVariableLibrary(context.variables, variablesData.meta);

  return {
    id,
    category: categoryKey,
    category_fr: categoryFr || fallbackLabel,
    category_en: categoryEn || fallbackLabel,
    title: { fr: titleFr, en: titleEn },
    description: { fr: descriptionFr, en: descriptionEn },
    subject: { fr: titleFr, en: titleEn },
    body: { fr: bodyFr, en: bodyEn },
    variables: variablesData.list
  };
}

function convert(filePath) {
  const rows = loadSheet(filePath);
  const objs = toObjects(rows);
  const context = {
    seenIds: new Set(),
    categories: new Set(),
    categoryLabels: {},
    variables: {}
  };
  const items = objs
    .map(row => normalizeRow(row, context))
    .filter(Boolean)
    .filter(t => (t.title.fr || t.title.en || t.body.fr || t.body.en));

  // Ensure category translations include both language mappings
  const metadata = {
    version: '1.0',
    totalTemplates: items.length,
    languages: ['fr', 'en'],
    categories: Array.from(new Set(items.map(t => t.category))).sort(),
    categoryLabels: context.categoryLabels,
    updatedAt: new Date().toISOString()
  };

  // Ensure variables library has consistent descriptions/examples
  Object.entries(context.variables).forEach(([key, info]) => {
    info.description = info.description || {};
    info.example = info.example || {};
    if (!info.format) info.format = 'text';
  });

  return {
    metadata,
    templates: items,
    variables: context.variables
  };
}

function main() {
  const [p] = process.argv.slice(2);
  if (!p) {
    console.error('Usage: node scripts/xlsx-to-templates.mjs <file.xlsx> > output.json');
    process.exit(1);
  }
  const abs = path.resolve(p);
  const dataset = convert(abs);
  process.stdout.write(JSON.stringify(dataset, null, 2));
}

main();
