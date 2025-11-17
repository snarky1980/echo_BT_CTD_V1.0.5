#!/usr/bin/env node
/*
Convert an Excel file (.xlsx) containing a Variables Library into a JSON object
suitable for merging into complete_email_templates.json under the `variables` key.

Accepted headers (case-insensitive, flexible):
- name (also: variable, var, key)
- description_fr (also: desc_fr, descriptionfr)
- description_en (also: desc_en, descriptionen)
- format (text|number|date|time)
- example_fr (also: exemple_fr, exemple)
- example_en (optional)
- example (fallback if *_fr/*_en not provided)

Usage:
  node scripts/xlsx-to-variables.mjs imports/variables.xlsx > imports/variables.json

Output shape:
{
  "VarName": {
    "description": { "fr": "..", "en": ".." },
    "format": "text",
    "example": "..",           // fallback (fr|en|example)
    "examples": { "fr": "..", "en": ".." } // optional per-language
  },
  ...
}
*/
import path from 'node:path';
import XLSX from 'xlsx';

const ALIASES = new Map([
  ['name','name'], ['variable','name'], ['var','name'], ['key','name'],
  ['description fr','description_fr'], ['desc fr','description_fr'], ['descriptionfr','description_fr'], ['description_fr','description_fr'],
  ['description en','description_en'], ['desc en','description_en'], ['descriptionen','description_en'], ['description_en','description_en'],
  ['format','format'],
  ['example fr','example_fr'], ['exemple fr','example_fr'], ['example_fr','example_fr'], ['exemple','example_fr'],
  ['example en','example_en'], ['example_en','example_en'],
  ['example','example']
]);

function norm(s){ return String(s||'').trim().toLowerCase().replace(/[_.:]/g,' ').replace(/\s+/g,' '); }

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
    const r = rows[i];
    if (!r || r.length === 0 || r.every(c => String(c||'').trim() === '')) continue;
    const obj = {};
    for (let c = 0; c < header.length; c++) {
      const key = header[c]; if (!key) continue;
      obj[key] = r[c] != null ? String(r[c]) : '';
    }
    out.push(obj);
  }
  return out;
}

function buildVar(row){
  const name = (row.name || '').trim();
  if (!name) return null;
  const description_fr = (row.description_fr || '').trim();
  const description_en = (row.description_en || '').trim();
  const format = (row.format || 'text').trim();
  const example_fr = (row.example_fr || '').trim();
  const example_en = (row.example_en || '').trim();
  const example = (row.example || example_fr || example_en || '').trim();
  const meta = { description: { fr: description_fr, en: description_en }, format, example };
  if (example_fr || example_en) meta.examples = { fr: example_fr, en: example_en };
  return { name, meta };
}

function convert(filePath){
  const rows = loadSheet(filePath);
  const objs = toObjects(rows);
  const out = {};
  for (const r of objs) {
    const v = buildVar(r); if (!v) continue;
    out[v.name] = v.meta;
  }
  return out;
}

function main(){
  const [p] = process.argv.slice(2);
  if (!p) {
    console.error('Usage: node scripts/xlsx-to-variables.mjs <file.xlsx> > output.json');
    process.exit(1);
  }
  const abs = path.resolve(p);
  const result = convert(abs);
  process.stdout.write(JSON.stringify(result, null, 2));
}

main();
