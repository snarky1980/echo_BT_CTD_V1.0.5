#!/usr/bin/env node
/*
Merge two JSON arrays of templates (from docx-to-templates) into a single bilingual set.

Usage:
  node scripts/merge-fr-en.mjs fr.json en.json > combined.json

Assumptions:
  - Each input is an array of objects with fields: id (optional), category, title, description, subject, body
  - Prefer matching by id. If id is missing, we attempt to match by a normalized title key.
  - Category conflicts resolve preferring FR when present, else EN.
*/
import fs from 'node:fs';

function sanitizeId(s) { return String(s || '').trim().replace(/[^A-Za-z0-9_]+/g, '_'); }
function keyFor(t, prefer) {
  if (t?.id) return t.id;
  const title = (prefer === 'fr' ? (t?.title?.fr || t?.subject?.fr) : (t?.title?.en || t?.subject?.en)) || '';
  return sanitizeId(title) || undefined;
}

function loadArray(p) {
  const raw = fs.readFileSync(p, 'utf8');
  const arr = JSON.parse(raw);
  if (!Array.isArray(arr)) throw new Error(`Not an array: ${p}`);
  return arr;
}

function asMap(arr, prefer) {
  const map = new Map();
  for (const t of arr) {
    const k = keyFor(t, prefer);
    if (!k) continue;
    if (!map.has(k)) map.set(k, t);
  }
  return map;
}

function merge(fr, en) {
  const out = [];
  const keys = new Set([...fr.keys(), ...en.keys()]);
  for (const k of keys) {
    const F = fr.get(k) || {};
    const E = en.get(k) || {};
    const id = F.id || E.id || k;
    const category = (F.category && F.category.trim()) || (E.category && E.category.trim()) || '';
    out.push({
      id,
      category,
      title: { fr: F.title?.fr || '', en: E.title?.en || '' },
      description: { fr: F.description?.fr || '', en: E.description?.en || '' },
      subject: { fr: F.subject?.fr || '', en: E.subject?.en || '' },
      body: { fr: F.body?.fr || '', en: E.body?.en || '' },
      variables: Array.from(new Set([...
        (Array.isArray(F.variables) ? F.variables : []),
        ...(Array.isArray(E.variables) ? E.variables : [])
      ]))
    });
  }
  // stable sort by id
  out.sort((a,b) => String(a.id).localeCompare(String(b.id)));
  return out;
}

function main() {
  const [frPath, enPath] = process.argv.slice(2);
  if (!frPath || !enPath) {
    console.error('Usage: node scripts/merge-fr-en.mjs fr.json en.json > combined.json');
    process.exit(1);
  }
  const frArr = loadArray(frPath);
  const enArr = loadArray(enPath);
  const frMap = asMap(frArr, 'fr');
  const enMap = asMap(enArr, 'en');
  const merged = merge(frMap, enMap);
  process.stdout.write(JSON.stringify(merged, null, 2));
}

main();
