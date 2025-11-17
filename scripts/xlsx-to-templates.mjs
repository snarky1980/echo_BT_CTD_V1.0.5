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
  // variables list
  ['variables','variables'], ['vars','variables']
]);

function norm(s) { return String(s || '').trim().toLowerCase().replace(/[_.:]/g, ' ').replace(/\s+/g, ' '); }
function sanitizeId(s) { return String(s || '').trim().replace(/[^A-Za-z0-9_]+/g, '_'); }

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
      const key = header[c];
      if (!key) continue;
      obj[key] = r[c] != null ? String(r[c]) : '';
    }
    out.push(obj);
  }
  return out;
}

function normalizeRow(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = sanitizeId(raw.id || '');
  const category = String(raw.category || '').trim();
  const title_fr = raw.title_fr || '';
  const title_en = raw.title_en || '';
  const description_fr = raw.description_fr || '';
  const description_en = raw.description_en || '';
  const subject_fr = raw.subject_fr || '';
  const subject_en = raw.subject_en || '';
  const body_fr = raw.body_fr || '';
  const body_en = raw.body_en || '';
  let variables;
  if (typeof raw.variables === 'string') {
    variables = raw.variables.split(/[;,]/).map(s => s.trim()).filter(Boolean);
  }
  return {
    id: id || undefined,
    category,
    title: { fr: title_fr, en: title_en },
    description: { fr: description_fr, en: description_en },
    subject: { fr: subject_fr, en: subject_en },
    body: { fr: body_fr, en: body_en },
    variables
  };
}

function convert(filePath) {
  const rows = loadSheet(filePath);
  const objs = toObjects(rows);
  const items = objs.map(normalizeRow).filter(Boolean).filter(t => (
    (t.title.fr || t.title.en || t.subject.fr || t.subject.en || t.body.fr || t.body.en)
  ));
  return items;
}

function main() {
  const [p] = process.argv.slice(2);
  if (!p) {
    console.error('Usage: node scripts/xlsx-to-templates.mjs <file.xlsx> > output.json');
    process.exit(1);
  }
  const abs = path.resolve(p);
  const arr = convert(abs);
  process.stdout.write(JSON.stringify(arr, null, 2));
}

main();
