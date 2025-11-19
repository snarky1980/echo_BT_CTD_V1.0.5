// Minimal Admin Console (Simple Mode)
(function(){
  const DRAFT_KEY = 'ea_admin_simple_v1';
  let data = null; // { metadata, variables, templates }
  let selected = null; // template id
  let term = '';

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const notice = $('#notice');
  const list = $('#list');
  const search = $('#search');
  const file = $('#file');
  const fileXlsx = $('#file-xlsx');
  const btnImportXlsx = $('#btn-import-xlsx');
  const importModeEl = $('#import-mode');
  const importAutoExportEl = $('#import-auto-export');
  const btnCsvTpl = $('#btn-dl-template-csv');
  const btnXlsxTpl = $('#btn-dl-template-xlsx');
  const btnExportXlsx = $('#btn-export-xlsx');
  const btnHelp = $('#btn-help');
  const hdr = $('#hdr');
  // editor fields
  const idEl = $('#tpl-id');
  const catFrEl = $('#tpl-cat-fr');
  const catEnEl = $('#tpl-cat-en');
  const titleFrEl = $('#tpl-title-fr');
  const titleEnEl = $('#tpl-title-en');
  const descFrEl = $('#tpl-desc-fr');
  const descEnEl = $('#tpl-desc-en');
  const subjFrEl = $('#tpl-subj-fr');
  const subjEnEl = $('#tpl-subj-en');
  const bodyFrEl = $('#tpl-body-fr');
  const bodyEnEl = $('#tpl-body-en');
  // Removed placeholders chip section (was #ph)
  const phBox = null;
  // variables chips container
  const varsBox = $('#vars');
  const varsEditorBox = $('#vars-editor');
  const varsSearchEl = $('#vars-search');
  const btnCopyVarsFr = $('#btn-copy-vars-fr');
  const btnCopyVarsEn = $('#btn-copy-vars-en');
  const btnValidateVars = $('#btn-validate-vars');
  const varsValidationBox = $('#vars-validation');
  const btnPreview = $('#btn-preview');
  const btnGithub = $('#btn-github');

  function notify(msg){ if (!notice) return; notice.textContent = msg; notice.style.display='block'; clearTimeout(notify._t); notify._t=setTimeout(()=>notice.style.display='none', 2000); }
  function ensureSchema(obj){
    obj = obj && typeof obj==='object' ? obj : {};
    obj.metadata = obj.metadata || { version:'1.0', totalTemplates:0, languages:['fr','en'], categories:[] };
    obj.metadata.categoryColors = obj.metadata.categoryColors || {};
    obj.variables = obj.variables || {};
    obj.templates = Array.isArray(obj.templates) ? obj.templates : [];
    return obj;
  }
  function saveDraft(){
    try {
      const serialized = JSON.stringify(data, null, 2);
      localStorage.setItem(DRAFT_KEY, serialized);
      // Publish for main app consumption
      localStorage.setItem('ea_admin_templates_data', serialized);
      notify('Brouillon enregistré.');
    } catch {}
  }
  function loadDraft(){ try{ const t = localStorage.getItem(DRAFT_KEY); return t ? ensureSchema(JSON.parse(t)) : null; }catch{ return null; } }
  async function fetchJson(url){ const r = await fetch(url, { cache:'no-cache' }); if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); }
  async function loadInitial(){
    const draft = loadDraft(); if (draft) { data = draft; afterLoad(); return; }
    const urls = ['/complete_email_templates.json','./complete_email_templates.json','./public/complete_email_templates.json'];
    let lastErr = null; for (const u of urls){ try{ data = ensureSchema(await fetchJson(u)); break; } catch(e){ lastErr=e; } }
    if (!data) { console.warn('No JSON found', lastErr); data = ensureSchema({}); }
    afterLoad();
  }
  function afterLoad(){
    // Normalize variable schema to support per-language defaults
    try {
      const lib = data.variables || {};
      Object.keys(lib).forEach(k => {
        const v = lib[k] || {};
        if (!v.description) v.description = { fr:'', en:'' };
        if (!v.example || typeof v.example === 'string') {
          const s = typeof v.example === 'string' ? v.example : '';
          v.example = { fr: s, en: s };
        } else {
          v.example.fr = v.example.fr || '';
          v.example.en = v.example.en || '';
        }
        if (!v.format) v.format = 'text';
        lib[k] = v;
      });
      data.variables = lib;
    } catch {}
    // Prefill category_fr/category_en from legacy category if missing
    (data.templates||[]).forEach(t => {
      if (t.category && !t.category_fr && !t.category_en){
        t.category_fr = t.category_fr || t.category;
        t.category_en = t.category_en || t.category;
      } else {
        // If only one side provided, copy to the other for initial visibility
        if (!t.category_fr && t.category_en) t.category_fr = t.category_en;
        if (!t.category_en && t.category_fr) t.category_en = t.category_fr;
      }
      // keep legacy fallback field updated
      t.category = t.category_fr || t.category_en || t.category || '';
    });
    data.metadata.totalTemplates = data.templates.length;
    if (!selected && data.templates.length) selected = data.templates[0].id;
    renderList(); renderEditor();
  }
  function syncLangButtons(){ /* no-op: both languages are shown */ }
  function escapeHtml(s){ return String(s??'').replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
  function sanitizeId(s){ const v=String(s||'').trim(); if (!v) return ''; return v.replace(/[^A-Za-z0-9_]+/g,'_'); }
  function detectPlaceholders(t){
    const parts=[];
    if (t.subject?.fr) parts.push(t.subject.fr);
    if (t.subject?.en) parts.push(t.subject.en);
    if (t.body?.fr) parts.push(t.body.fr);
    if (t.body?.en) parts.push(t.body.en);
    const keys = [...parts.join('\n').matchAll(/<<([^>]+)>>/g)]
      .map(m => canonicalVar(stripLangSuffix(m[1])))
      .filter(Boolean);
    return Array.from(new Set(keys)).sort();
  }
  function uniqueId(base){ let id = base || 'modele'; let i=1; const taken = new Set((data.templates||[]).map(x=>String(x.id||'').toLowerCase())); while(taken.has(id.toLowerCase())) id = `${base}_${i++}`; return id; }

  // Excel helpers (lazy-loaded)
  let _XLSX = null;
  async function getXLSX(){ if (_XLSX) return _XLSX; _XLSX = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm'); return _XLSX; }
  const toAscii = (s) => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const idSanitize = (s) => toAscii(String(s||'').toLowerCase())
    .replace(/[^a-z0-9_\s-]+/g,'_')
    .replace(/[\s-]+/g,'_')
    .replace(/_+/g,'_')
    .slice(0,80)
    .replace(/[^A-Za-z0-9_]/g,'');
  const normKey = (s) => String(s||'')
    .replace(/\uFEFF/g,'')
    .trim()
    .toLowerCase()
    .replace(/[_.:]/g,' ')
    .replace(/\s+/g,' ');
  const canonicalKey = (s) => normKey(s).replace(/\s+/g,'_');
  const H = new Map([
    ['id','id'],
    ['category en','category_en'], ['category fr','category_fr'], ['categorie en','category_en'], ['categorie fr','category_fr'], ['catégorie en','category_en'], ['catégorie fr','category_fr'],
    ['description en','description_en'], ['description fr','description_fr'],
    ['title en','title_en'], ['title fr','title_fr'], ['titre en','title_en'], ['titre fr','title_fr'],
    ['template en','template_en'], ['template fr','template_fr'],
    // Fix corrupted headers: accept common variants without accents as well
    ['modele en','template_en'], ['modele fr','template_fr'], ['modèle en','template_en'], ['modèle fr','template_fr'],
    ['variables description en','variables_description_en'], ['variables description fr','variables_description_fr'],
    ['variables_description_en','variables_description_en'], ['variables_description_fr','variables_description_fr']
  ]);
  const REQUIRED_KEYS = ['id','category_en','category_fr','description_en','description_fr','title_en','title_fr','template_en','template_fr','variables_description_en','variables_description_fr'];
  async function readXlsx(file){ const { read, utils } = await getXLSX(); return new Promise((resolve, reject)=>{ const fr = new FileReader(); fr.onerror=reject; fr.onload=()=>{ try{ const data=new Uint8Array(fr.result); const wb=read(data,{type:'array'}); const first=wb.SheetNames?.[0]; if(!first) throw new Error('Aucune feuille trouvee.'); const ws=wb.Sheets[first]; const rows = utils.sheet_to_json(ws, { header:1, raw:false }); resolve(rows); }catch(e){ reject(e);} }; fr.readAsArrayBuffer(file); }); }
  function rowsToObjects(rows){ if (!rows?.length) return []; let headIdx=-1, header=[]; const attempts=[]; for (let i=0;i<rows.length;i++){ const row=rows[i]; if (!Array.isArray(row) || !row.some(c=>String(c||'').trim()!=='')) continue; const raw=row.map(h=>String(h??'').trim()); const mapped=raw.map(h=>H.get(normKey(h)) || canonicalKey(h)); const set=new Set(mapped.map(canonicalKey)); const missing=REQUIRED_KEYS.filter(k=>!set.has(k)); attempts.push({index:i,missing}); if (!missing.length){ headIdx=i; header=mapped; break; } } if (headIdx<0){ const best = attempts.sort((a,b)=>a.missing.length-b.missing.length)[0]; const err = new Error('Colonnes Excel manquantes.'); err.missingColumns = best?.missing||[]; throw err; } const out=[]; for (let i=headIdx+1;i<rows.length;i++){ const r=rows[i]; if (!r || r.every(c=>String(c||'').trim()==='')) continue; const obj={}; for (let c=0;c<header.length;c++){ const k=header[c]; if (!k) continue; obj[k] = r[c]!=null ? String(r[c]).trim() : ''; } out.push(obj); } return out; }
  function extractPlaceholders(txt){ const t=String(txt||''); return Array.from(new Set([...(t.matchAll(/<<([^>]+)>>/g))].map(m=>m[1]))); }
  function canonicalVar(name){ const s = toAscii(String(name||'')).trim().toLowerCase(); if (!s) return ''; return s.replace(/[^A-Za-z0-9_]+/g,'_').replace(/_+/g,'_').replace(/^_+|_+$/g,''); }
  function inferFormat(n){ if (/Montant|Nb|Nombre/i.test(n)) return 'number'; if (/Heure/i.test(n)) return 'time'; if (/(Date|Delai|D[ée]lai|NouvelleDate|DateInitiale)/i.test(n)) return 'date'; return 'text'; }
  function exampleFor(fmt){ return fmt==='number' ? '0' : fmt==='time' ? '17:00' : fmt==='date' ? '2025-01-01' : 'Exemple'; }
  function parseVariableDescriptionEntries(raw){ const map=new Map(); const text=String(raw||'').trim(); if (!text) return { map, issues:[] }; const chunks = text.split(/\r?\n/).flatMap(line=>line.split(/(?=<<)/)).map(p=>p.trim()).filter(Boolean); chunks.forEach(entry=>{ if(!entry.startsWith('<<')) return; const closeIdx = entry.indexOf('>>'); if (closeIdx===-1) return; const varNameRaw = entry.slice(2, closeIdx).trim(); let rest = entry.slice(closeIdx+2).trim(); if (!rest.startsWith(':')) return; rest = rest.slice(1).trim(); if (!rest) return; let description = rest; let defaultValue=''; const lo = rest.lastIndexOf('('); const lc = rest.lastIndexOf(')'); if (lo!==-1 && lc>lo && lc===rest.length-1){ defaultValue = rest.slice(lo+1, lc).trim(); description = rest.slice(0, lo).trim(); } const key = canonicalVar(varNameRaw); if (!key) return; if (!map.has(key)) map.set(key, { description, defaultValue }); }); return { map, issues:[] }; }
  // Strip language suffix _fr or _en (case-insensitive) to unify variable keys
  function stripLangSuffix(k){ return String(k||'').replace(/_(fr|en)$/i,''); }
  function parseVariableDescriptionEntries(raw){
    const map = new Map();
    const text = String(raw||'').trim();
    if (!text) return { map, issues:[] };
    const chunks = text.split(/\r?\n/)
      .flatMap(line => line.split(/(?=<<)/))
      .map(p => p.trim())
      .filter(Boolean);
    chunks.forEach(entry => {
      if (!entry.startsWith('<<')) return;
      const closeIdx = entry.indexOf('>>');
      if (closeIdx === -1) return;
      const varNameRaw = entry.slice(2, closeIdx).trim();
      let rest = entry.slice(closeIdx+2).trim();
      if (!rest.startsWith(':')) return;
      rest = rest.slice(1).trim();
      if (!rest) return;
      let description = rest;
      let defaultValue='';
      const lo = rest.lastIndexOf('(');
      const lc = rest.lastIndexOf(')');
      if (lo !== -1 && lc > lo && lc === rest.length - 1){
        defaultValue = rest.slice(lo+1, lc).trim();
        description = rest.slice(0, lo).trim();
      }
      // unify key by removing language suffix
      const baseName = stripLangSuffix(varNameRaw);
      const key = canonicalVar(baseName);
      if (!key) return;
      if (!map.has(key)) map.set(key, { description, defaultValue });
    });
    return { map, issues:[] };
  }
  function buildFromObjects(objs){ const templates=[]; const variables={}; const taken=new Set((data.templates||[]).map(t=>t.id.toLowerCase())); for (const row of objs){ const rawId = String(row.id||'').trim(); if (!rawId) continue; let id = idSanitize(rawId)||'modele'; if (taken.has(id.toLowerCase())){ id = uniqueId(id); }
      taken.add(id.toLowerCase());
  const category_fr = String(row.category_fr||'').trim();
  const category_en = String(row.category_en||'').trim();
      const title_fr = String(row.title_fr||'').trim();
      const title_en = String(row.title_en||'').trim();
      const description_fr = String(row.description_fr||'').trim();
      const description_en = String(row.description_en||'').trim();
      const template_fr = String(row.template_fr||'').trim();
      const template_en = String(row.template_en||'').trim();
      const variablesDescFrRaw = row.variables_description_fr || '';
      const variablesDescEnRaw = row.variables_description_en || '';
  const category = category_fr || category_en || '';
  const { map: varDescEn } = parseVariableDescriptionEntries(variablesDescEnRaw);
  const { map: varDescFr } = parseVariableDescriptionEntries(variablesDescFrRaw);
  const varsFrSet = new Set(extractPlaceholders(template_fr).map(n=>canonicalVar(stripLangSuffix(n))).filter(Boolean));
  const varsEnSet = new Set(extractPlaceholders(template_en).map(n=>canonicalVar(stripLangSuffix(n))).filter(Boolean));
      const varsUnion = Array.from(new Set([...varsFrSet, ...varsEnSet])).sort();
      // ensure variables in catalog
      varsUnion.forEach(k=>{
        if(!k) return;
        if(!variables[k]) variables[k] = { description:{fr:'',en:''}, format:'text', example:{fr:'',en:''} };
        const metaFr = varDescFr.get(k); const metaEn = varDescEn.get(k);
        const fmt = inferFormat(k); variables[k].format = fmt;
        if (metaFr?.description && !variables[k].description.fr) variables[k].description.fr = metaFr.description;
        if (metaEn?.description && !variables[k].description.en) variables[k].description.en = metaEn.description;
        if (!variables[k].description.fr) variables[k].description.fr = `Valeur pour ${k}`;
        if (!variables[k].description.en) variables[k].description.en = `Value for ${k}`;
        if (metaFr?.defaultValue && !variables[k].example.fr) variables[k].example.fr = metaFr.defaultValue;
        if (metaEn?.defaultValue && !variables[k].example.en) variables[k].example.en = metaEn.defaultValue;
        if (!variables[k].example.fr && !variables[k].example.en){ const ex=exampleFor(fmt); variables[k].example.fr = ex; variables[k].example.en = ex; }
      });
      templates.push({ id, category, category_fr, category_en, title:{fr:title_fr,en:title_en}, description:{fr:description_fr,en:description_en}, subject:{fr:title_fr,en:title_en}, body:{fr:template_fr,en:template_en}, variables: varsUnion }); }
    return { templates, variables }; }
  async function handleXlsxImport(file, mode='merge', autoExport=false){
    try{
      const rows = await readXlsx(file);
      const objs = rowsToObjects(rows);
      const out = buildFromObjects(objs);
      if (mode === 'replace'){
        data = ensureSchema({});
        data.templates = out.templates;
        data.variables = out.variables;
        data.metadata.totalTemplates = data.templates.length;
        data.metadata.categories = Array.from(new Set(data.templates.map(t=>t.category).filter(Boolean))).sort();
        selected = data.templates[0]?.id || null;
        saveDraft(); renderList(); renderEditor();
        notify(`Import Excel (remplacement) effectué: ${data.templates.length} modèles, ${Object.keys(data.variables).length} variables.`);
        if (autoExport) {
          exportJson();
        }
        return;
      }
      // merge (default)
      let addedT=0, addedV=0; const existingVars = data.variables || (data.variables={});
      out.templates.forEach(t=>{ // ensure unique again vs current state
        if (data.templates.some(x=>x.id.toLowerCase()===t.id.toLowerCase())){ t.id = uniqueId(t.id); }
        data.templates.push(t); addedT++; });
      Object.entries(out.variables).forEach(([k,v])=>{ if (!existingVars[k]){ existingVars[k]=v; addedV++; } else {
          // fill missing descriptions/examples/format if empty
          existingVars[k].format ||= v.format;
          existingVars[k].example = existingVars[k].example || { fr:'', en:'' };
          if (v.example?.fr && !existingVars[k].example.fr) existingVars[k].example.fr = v.example.fr;
          if (v.example?.en && !existingVars[k].example.en) existingVars[k].example.en = v.example.en;
          existingVars[k].description = existingVars[k].description || {fr:'',en:''};
          if (!existingVars[k].description.fr && v.description?.fr) existingVars[k].description.fr = v.description.fr;
          if (!existingVars[k].description.en && v.description?.en) existingVars[k].description.en = v.description.en;
        }
      });
      // metadata
      data.metadata.totalTemplates = data.templates.length;
      data.metadata.categories = Array.from(new Set(data.templates.map(t=>t.category).filter(Boolean))).sort();
      saveDraft(); renderList(); selected = out.templates[0]?.id || selected; renderEditor(); notify(`Import Excel (fusion) effectué: ${addedT} modèles, ${addedV} variables.`);
      if (autoExport) exportJson();
    } catch(e){ console.error(e); notify('Import Excel invalide.'); }
  }

  function filtered(){ const t = term.toLowerCase(); return (data.templates||[]).filter(x=>{ if (!t) return true; const hay=[x.id,x.category,x.title?.fr,x.title?.en,x.description?.fr,x.description?.en,x.subject?.fr,x.subject?.en,x.body?.fr,x.body?.en].filter(Boolean).join(' ').toLowerCase(); return hay.includes(t); }); }
  function getCategoryDisplay(t){ return t.category_fr || t.category_en || t.category || ''; }
  function renderList(){ const arr = filtered(); list.innerHTML = arr.map(x=>{ const ttl = x.title?.fr || x.title?.en || x.id; return `<div class="tile ${x.id===selected?'active':''}" data-id="${escapeHtml(x.id)}"><div style="font-weight:700">${escapeHtml(ttl)}</div><div style="color:#64748b;font-size:12px">${escapeHtml(getCategoryDisplay(x))}</div></div>`; }).join(''); $$('.tile', list).forEach(el=>{ el.onclick=()=>{ selected = el.dataset.id; renderList(); renderEditor(); }; }); }

  function renderEditor(){ const t = (data.templates||[]).find(x=>x.id===selected) || null; hdr.textContent = t ? `Éditeur – ${t.id}` : 'Éditeur'; if (!t) { idEl.value=''; if (catFrEl) catFrEl.value=''; if (catEnEl) catEnEl.value=''; titleFrEl.value=''; titleEnEl.value=''; descFrEl.value=''; descEnEl.value=''; subjFrEl.value=''; subjEnEl.value=''; bodyFrEl.value=''; bodyEnEl.value=''; if (varsBox) varsBox.innerHTML=''; if (varsValidationBox) varsValidationBox.style.display='none'; return; }
    idEl.value = t.id || '';
  if (catFrEl) catFrEl.value = t.category_fr || '';
  if (catEnEl) catEnEl.value = t.category_en || '';
    titleFrEl.value = t.title?.fr || '';
    titleEnEl.value = t.title?.en || '';
    descFrEl.value = t.description?.fr || '';
    descEnEl.value = t.description?.en || '';
    subjFrEl.value = t.subject?.fr || '';
    subjEnEl.value = t.subject?.en || '';
    bodyFrEl.value = t.body?.fr || '';
    bodyEnEl.value = t.body?.en || '';
    // placeholders
  const ph = detectPlaceholders(t); // used for variables union only
  // Only show variables pertinent to this template (declared or detected placeholders)
  const tVars = t.variables || [];
  const detected = ph;
  let all = Array.from(new Set([...(tVars||[]), ...detected])).sort();
  // filter by search
  const q = (varsSearchEl?.value||'').trim().toLowerCase();
  const matches = (k) => !q || k.toLowerCase().includes(q) || (data.variables?.[k]?.description?.fr||'').toLowerCase().includes(q) || (data.variables?.[k]?.description?.en||'').toLowerCase().includes(q);
  const filteredKeys = all.filter(matches);
  if (varsBox){
    if (!filteredKeys.length){ varsBox.innerHTML = '<div class="chip" style="opacity:.7">Aucune</div>'; }
    else {
      varsBox.innerHTML = filteredKeys.map(k=>{
        const v = data.variables?.[k];
        const hasFr = !!(v?.description?.fr);
        const hasEn = !!(v?.description?.en);
        const hasDefFr = !!(v?.example?.fr);
        const hasDefEn = !!(v?.example?.en);
        const title = `FR: ${escapeHtml(v?.description?.fr||'')} | EN: ${escapeHtml(v?.description?.en||'')} | Défaut FR: ${escapeHtml(v?.example?.fr||'')} | Défaut EN: ${escapeHtml(v?.example?.en||'')}`;
        const style = (!hasFr || !hasEn || !hasDefFr || !hasDefEn) ? 'style="background:#fff7ed;border-color:#fdba74;color:#9a3412"' : '';
        return `<span class="chip" ${style} title="${title}">${escapeHtml(k)}</span>`;
      }).join('');
    }
  }
    renderVarsEditor();
  }
  
  function getTemplateVarKeys(){
    const t = (data.templates||[]).find(x=>x.id===selected);
    if (!t) return [];
    const fromList = Array.isArray(t.variables) ? t.variables : [];
    // Union with detected placeholders so user sees fresh variables even before syncing
    const detected = detectPlaceholders(t);
    return Array.from(new Set([...(fromList||[]), ...detected])).sort();
  }
  function renderVarsEditor(){
    if (!varsEditorBox) return;
    const keysAll = getTemplateVarKeys();
    const q = (varsSearchEl?.value||'').trim().toLowerCase();
    const keys = keysAll.filter(k => !q || k.toLowerCase().includes(q) || (data.variables?.[k]?.description?.fr||'').toLowerCase().includes(q) || (data.variables?.[k]?.description?.en||'').toLowerCase().includes(q));
    if (!keys.length){
      varsEditorBox.innerHTML = '<div class="vhead">Aucune variable dans ce modèle. Utilisez « Sync variables » après avoir ajouté des <<placeholders>>.</div>';
      return;
    }
    const rows = [];
    rows.push(`<div class="vgrid">
      <div class="vrow">
        <div class="vhead">Variable</div>
        <div class="vhead">Description (FR)</div>
        <div class="vhead">Description (EN)</div>
        <div class="vhead">Valeur par défaut (FR)</div>
        <div class="vhead">Valeur par défaut (EN)</div>
      </div>
    `);
    keys.forEach(k => {
      const v = (data.variables||{})[k] || { description:{fr:'',en:''}, example:{fr:'',en:''} };
      const fr = v?.description?.fr || '';
      const en = v?.description?.en || '';
      const defFr = v?.example?.fr || '';
      const defEn = v?.example?.en || '';
      rows.push(`
        <div class="vrow" data-key="${escapeHtml(k)}">
          <div class="vkey">&lt;&lt;${escapeHtml(k)}&gt;&gt;</div>
          <input class="vinput" data-role="fr" placeholder="ex: Valeur pour ${escapeHtml(k)}" value="${escapeHtml(fr)}" />
          <input class="vinput" data-role="en" placeholder="ex: Value for ${escapeHtml(k)}" value="${escapeHtml(en)}" />
          <input class="vinput" data-role="def-fr" placeholder="ex: Exemple FR" value="${escapeHtml(defFr)}" />
          <input class="vinput" data-role="def-en" placeholder="ex: Example EN" value="${escapeHtml(defEn)}" />
        </div>
      `);
    });
    rows.push('</div>');
    varsEditorBox.innerHTML = rows.join('');
    // Wire inputs with event delegation
    varsEditorBox.querySelectorAll('.vrow').forEach(row => {
      const key = row.getAttribute('data-key');
      row.querySelectorAll('input.vinput').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const role = inp.getAttribute('data-role');
          data.variables = data.variables || {};
          data.variables[key] = data.variables[key] || { description:{fr:'',en:''}, format:'text', example:{fr:'',en:''} };
          const desc = data.variables[key].description || (data.variables[key].description = {fr:'',en:''});
          if (role === 'fr' || role === 'en') {
            desc[role] = inp.value;
          } else if (role === 'def-fr') {
            data.variables[key].example.fr = inp.value;
          } else if (role === 'def-en') {
            data.variables[key].example.en = inp.value;
          }
          saveDraft();
          // update chip titles live (both descriptions) – default value not embedded, but could be shown later
          if (varsBox) {
            const chips = varsBox.querySelectorAll('.chip');
            chips.forEach(c => { if (c.textContent === key) c.title = `FR: ${desc.fr || ''} | EN: ${desc.en || ''} | Défaut FR: ${data.variables[key].example.fr || ''} | Défaut EN: ${data.variables[key].example.en || ''}`; });
          }
        });
      });
    });
  }

  // Copy variable lines (FR/EN) to clipboard
  function buildVarLinesForTemplate(t, lang){
    const keys = t.variables || [];
    return keys.map(k => {
      const v = data.variables?.[k];
      const desc = (lang==='fr' ? (v?.description?.fr || `Valeur pour ${k}`) : (v?.description?.en || `Value for ${k}`));
      const defVal = lang==='fr' ? (v?.example?.fr || '') : (v?.example?.en || '');
      const def = defVal ? `(${defVal})` : '';
      const suff = lang==='fr' ? '_FR' : '_EN';
      return `<<${k}${suff}>>:${desc}${def}`;
    }).join('\n');
  }
  async function copyVarLines(lang){
    const t = data.templates.find(x=>x.id===selected); if (!t) return;
    const lines = buildVarLinesForTemplate(t, lang);
    try { await navigator.clipboard.writeText(lines); notify(`Lignes ${lang.toUpperCase()} copiées dans le presse-papiers.`); }
    catch(e){ console.warn('Clipboard failed', e); }
  }

  // Validation: list missing FR/EN/default for current template variables
  function validateTemplateVars(){
    const t = data.templates.find(x=>x.id===selected); if (!t || !varsValidationBox) return;
    const keys = t.variables || [];
    const missingFr = []; const missingEn = []; const missingDefFr = []; const missingDefEn = [];
    keys.forEach(k => { const v=data.variables?.[k]||{}; if(!v.description?.fr) missingFr.push(k); if(!v.description?.en) missingEn.push(k); if(!v.example?.fr) missingDefFr.push(k); if(!v.example?.en) missingDefEn.push(k); });
    const parts = [];
    if (missingFr.length) parts.push(`FR manquant: ${missingFr.join(', ')}`);
    if (missingEn.length) parts.push(`EN manquant: ${missingEn.join(', ')}`);
    if (missingDefFr.length) parts.push(`Défaut FR manquant: ${missingDefFr.join(', ')}`);
    if (missingDefEn.length) parts.push(`Défaut EN manquant: ${missingDefEn.join(', ')}`);
    varsValidationBox.textContent = parts.length ? parts.join(' | ') : 'Tout est complet pour ce modèle.';
    varsValidationBox.style.display = 'block';
  }

  // simple variable actions
  function syncTemplateVariables(){
    const t = data.templates.find(x=>x.id===selected); if (!t) return;
    const ph = Array.from(new Set(detectPlaceholders(t)));
    t.variables = ph;
    saveDraft(); renderEditor(); notify('Variables synchronisées.');
  }
  function addMissingVariablesToLibrary(){
    const t = data.templates.find(x=>x.id===selected); if (!t) return;
    const ph = Array.from(new Set(detectPlaceholders(t)));
    const lib = data.variables || (data.variables = {});
    let add = 0;
    ph.forEach(k => { if (!lib[k]) { lib[k] = { description:{fr:'',en:''}, format:'text', example:{fr:'',en:''} }; add++; } });
    if (add) { saveDraft(); renderEditor(); notify(`${add} variable(s) ajoutée(s).`); }
    else { notify('Aucune variable à ajouter.'); }
  }

  // wire events
  function exportJson(){
    data.metadata.totalTemplates = data.templates.length;
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='complete_email_templates.json'; document.body.appendChild(a); a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 1000); a.remove();
  }
  $('#btn-export').onclick = exportJson;
  // Update (danger) button: confirm + timestamp then export
  const btnUpdateJson = $('#btn-update-json');
  if (btnUpdateJson) btnUpdateJson.onclick = async () => {
    if (!confirm('Publier immédiatement le JSON sur les branches main + gh-pages (remplacement) ?')) return;
    try { data.metadata.updatedAt = new Date().toISOString(); } catch {}
    // Ensure repo + token configuration
    let token = localStorage.getItem('ea_gh_token');
    let repoOverride = localStorage.getItem('ea_gh_repo');
    if (!token){
      token = prompt('GitHub Token (repo scope: contents write). Entrez-le pour publier maintenant:');
      if (token){ localStorage.setItem('ea_gh_token', token.trim()); }
    }
    if (!repoOverride){
      const guessRepo = document.querySelector('meta[name="gh-repo"]')?.content || '';
      const repoInput = prompt('Owner/Repo pour publication (ex: snarky1980/echo_BT_CTD_V1.0.5). Laissez vide pour utiliser meta.', guessRepo);
      if (repoInput && repoInput.trim()) { repoOverride = repoInput.trim(); localStorage.setItem('ea_gh_repo', repoOverride); }
    }
    publishJsonToGitHub(true).catch(err => { console.error('Publish failed, fallback to download', err); exportJson(); });
  };

  async function publishJsonToGitHub(showToast){
    // Requires a classic repo-scoped token stored locally (NEVER hard-code): localStorage.setItem('ea_gh_token', 'ghp_...')
    const token = localStorage.getItem('ea_gh_token');
    if (!token){
      notify('Token GitHub manquant (localStorage key ea_gh_token). Téléchargement local à la place.');
      exportJson();
      return;
    }
    // Derive owner/repo from homepage or location
    const homepage = (data.metadata && data.metadata.homepage) || document.querySelector('meta[name="gh-repo"]')?.content || '';
    let owner='snarky1980', repo='echo_BT_CTD_V1.0.5';
    try {
      const m = homepage.match(/github\.io\/([^/]+)\/?/); if (m) repo = m[1];
      const m2 = (document.location.href).match(/https:\/\/([^.]+)\.github\.io\//); if (m2) owner = m2[1];
      // Project pages path: /<repo>/...
      const pathSeg = (location.pathname||'').split('/').filter(Boolean)[0];
      if (pathSeg) repo = pathSeg;
    } catch{}
    // For safety allow override
    const override = localStorage.getItem('ea_gh_repo');
    if (override){ const parts = override.split('/'); if (parts.length===2){ owner = parts[0]; repo = parts[1]; } }
  if (showToast) notify('Publication GitHub (main)…');
    const path = 'complete_email_templates.json';
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const contentB64 = btoa(unescape(encodeURIComponent(JSON.stringify(data,null,2))));

    // 1. Update main branch (source of truth)
    let shaMain = null;
    try {
      const getMain = await fetch(baseUrl+`?ref=main`, { headers:{ Authorization:`Bearer ${token}`, Accept:'application/vnd.github+json' }});
      if (getMain.ok){ const j = await getMain.json(); shaMain = j.sha; }
    } catch(e){ console.warn('Unable to get main sha', e); }
    const bodyMain = { message: 'feat(admin): update complete_email_templates.json (main) via admin-simple', content: contentB64, branch: 'main' };
    if (shaMain) bodyMain.sha = shaMain;
    const putMain = await fetch(baseUrl, { method:'PUT', headers:{ Authorization:`Bearer ${token}`, Accept:'application/vnd.github+json', 'Content-Type':'application/json' }, body: JSON.stringify(bodyMain) });
    if (!putMain.ok){ const txt = await putMain.text(); throw new Error('GitHub API (main) error: '+txt); }

    // No mirror to gh-pages: main is the only source of truth
    if (showToast) notify('JSON mis à jour sur main.');
  }

  // Simple GitHub configuration via prompts
  if (btnGithub) btnGithub.onclick = async () => {
    const curRepo = localStorage.getItem('ea_gh_repo') || '';
    const curTok = localStorage.getItem('ea_gh_token') || '';
    const repo = prompt('Owner/Repo (ex: snarky1980/echo_BT_CTD_V1.0.5). Laissez vide pour auto-détection.', curRepo);
    if (repo !== null) {
      if (repo.trim()) localStorage.setItem('ea_gh_repo', repo.trim()); else localStorage.removeItem('ea_gh_repo');
    }
    const token = prompt('GitHub Token (repo permissions). Laissez vide pour conserver. (Stocké en localStorage)', curTok ? '••••••••' : '');
    if (token !== null) {
      if (token && token !== '••••••••') localStorage.setItem('ea_gh_token', token.trim());
      if (!token) localStorage.removeItem('ea_gh_token');
    }
    notify('Configuration GitHub mise à jour.');
  };
  $('#btn-import').onclick = () => file.click();
  file.onchange = async (e) => { const f=e.target.files?.[0]; if (!f) return; try{ const txt=await f.text(); const json=ensureSchema(JSON.parse(txt)); data=json; selected = data.templates[0]?.id || null; saveDraft(); loadInitialUI(); notify('Import effectué.'); }catch(err){ console.error(err); notify('Import invalide.'); } finally { e.target.value=''; } };
  if (btnImportXlsx) btnImportXlsx.onclick = () => fileXlsx?.click();
  if (fileXlsx) fileXlsx.onchange = async (e) => { const f = e.target.files?.[0]; if (!f) return; const mode = importModeEl?.value || 'merge'; const auto = !!importAutoExportEl?.checked; await handleXlsxImport(f, mode, auto); e.target.value=''; };
  // Template downloads
  const TEMPLATE_HEADERS = ['ID','CATEGORY_EN','CATEGORY_FR','DESCRIPTION_EN','DESCRIPTION_FR','TITLE_EN','TITLE_FR','TEMPLATE_EN','TEMPLATE_FR','VARIABLES_DESCRIPTION_EN','VARIABLES_DESCRIPTION_FR'];
  const SAMPLE_ROW = [
    'welcome_email',
    'Customer Care',
    'Service client',
    'Welcome email for a new customer',
    'Courriel de bienvenue pour un nouveau client',
    'Welcome – New customer onboarding',
    'Bienvenue – Arrivée d’un nouveau client',
    'Hello <<customer_name_EN>>,\nThank you for joining us. Your account number is <<account_number_EN>>.',
    'Bonjour <<customer_name_FR>>,\nMerci de nous avoir rejoints. Votre numéro de compte est <<account_number_FR>>.',
    '<<customer_name_EN>>:Customer name(Emily)\n<<account_number_EN>>:Account number(AC-12345)',
    '<<customer_name_FR>>:Nom du client(Emily)\n<<account_number_FR>>:Numéro de compte(AC-12345)'
  ];
  function downloadCsvTemplate(){
    const escape = (v) => '"'+String(v).replace(/"/g,'""')+'"';
    const lines = [TEMPLATE_HEADERS.join(','), SAMPLE_ROW.map(escape).join(',')];
    const blob = new Blob([lines.join('\n')], { type:'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='template_email_assistant.csv'; document.body.appendChild(a); a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); a.remove();
  }
  async function downloadXlsxTemplate(){
    try {
      const XLSX = await getXLSX();
      const wb = XLSX.utils.book_new();
      const aoa = [TEMPLATE_HEADERS, SAMPLE_ROW];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      XLSX.utils.book_append_sheet(wb, ws, 'Templates');
      const wbout = XLSX.write(wb, { bookType:'xlsx', type:'array' });
      const blob = new Blob([wbout], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='template_email_assistant.xlsx'; document.body.appendChild(a); a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); a.remove();
    } catch(e){ console.error(e); notify('Impossible de générer XLSX'); }
  }
  if (btnCsvTpl) btnCsvTpl.onclick = downloadCsvTemplate;
  if (btnXlsxTpl) btnXlsxTpl.onclick = downloadXlsxTemplate;
  async function exportCurrentToXlsx(){
    try {
      const XLSX = await getXLSX();
      const wb = XLSX.utils.book_new();
      // Templates sheet (simple global variable descriptions only)
      const header = ['ID','CATEGORY_EN','CATEGORY_FR','DESCRIPTION_EN','DESCRIPTION_FR','TITLE_EN','TITLE_FR','TEMPLATE_EN','TEMPLATE_FR','VARIABLES_DESCRIPTION_EN','VARIABLES_DESCRIPTION_FR'];
      const rows = [header];
      const varsDescEn = {}; const varsDescFr = {};
      Object.entries(data.variables||{}).forEach(([k,v])=>{ varsDescEn[k] = v?.description?.en || `Value for ${k}`; varsDescFr[k] = v?.description?.fr || `Valeur pour ${k}`; });
      (data.templates||[]).forEach(t => {
        const id = t.id || ''; const cat = t.category || '';
        const title_en = t.title?.en || ''; const title_fr = t.title?.fr || '';
        const desc_en = t.description?.en || ''; const desc_fr = t.description?.fr || '';
        const cat_en = t.category_en || '';
        const cat_fr = t.category_fr || t.category || '';
        // Transform bodies to suffixed placeholders for Excel model (<<var_EN>> / <<var_FR>>)
        const bodyEnOriginal = t.body?.en || '';
        const bodyFrOriginal = t.body?.fr || '';
        const tpl_en = bodyEnOriginal.replace(/<<([^>]+)>>/g,(m,name)=>{
          const base = stripLangSuffix(name.trim());
          return (t.variables||[]).includes(base) ? `<<${base}_EN>>` : m; });
        const tpl_fr = bodyFrOriginal.replace(/<<([^>]+)>>/g,(m,name)=>{
          const base = stripLangSuffix(name.trim());
          return (t.variables||[]).includes(base) ? `<<${base}_FR>>` : m; });
        // Variable description lines with default value in parentheses and suffixed names
        const vEnLines = (t.variables||[]).map(k=>{
          const v = data.variables?.[k];
          const desc = varsDescEn[k] || `Value for ${k}`;
          const def = v?.example?.en ? `(${v.example.en})` : '';
          return `<<${k}_EN>>:${desc}${def}`;
        });
        const vFrLines = (t.variables||[]).map(k=>{
          const v = data.variables?.[k];
          const desc = varsDescFr[k] || `Valeur pour ${k}`;
          const def = v?.example?.fr ? `(${v.example.fr})` : '';
          return `<<${k}_FR>>:${desc}${def}`;
        });
        rows.push([id,cat_en,cat_fr,desc_en,desc_fr,title_en,title_fr,tpl_en,tpl_fr,vEnLines.join('\n'),vFrLines.join('\n')]);
      });
      const wsTemplates = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, wsTemplates, 'Templates');
      // Variables sheet (catalog)
      const varHeader = ['Variable','Description_EN','Description_FR','Format','Default_EN','Default_FR'];
      const varRows = [varHeader];
      Object.entries(data.variables||{}).forEach(([k,v])=>{
        varRows.push([k, v?.description?.en || '', v?.description?.fr || '', v?.format || 'text', v?.example?.en || '', v?.example?.fr || '']);
      });
      const wsVars = XLSX.utils.aoa_to_sheet(varRows);
      XLSX.utils.book_append_sheet(wb, wsVars, 'Variables');
      // Metadata sheet
      const metaRows = [ ['Key','Value'], ['version', data.metadata?.version||''], ['totalTemplates', String(data.templates?.length||0)], ['categories', (data.metadata?.categories||[]).join(', ')], ['languages',(data.metadata?.languages||[]).join(', ')] ];
      const wsMeta = XLSX.utils.aoa_to_sheet(metaRows);
      XLSX.utils.book_append_sheet(wb, wsMeta, 'Metadata');
      const wbout = XLSX.write(wb, { bookType:'xlsx', type:'array' });
      const blob = new Blob([wbout], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='email_assistant_export.xlsx'; document.body.appendChild(a); a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 1000); a.remove();
      notify('Export Excel généré.');
    } catch(e){ console.error(e); notify('Échec export Excel'); }
  }
  if (btnExportXlsx) btnExportXlsx.onclick = exportCurrentToXlsx;
  // Help popout
  let helpWin = null;
  function openHelpPop(){
    try {
      if (helpWin && !helpWin.closed) { helpWin.focus(); return; }
      helpWin = window.open('./admin-simple-help.html', 'ea_simple_help', 'width=900,height=720,noopener');
    } catch(e){ console.warn('Popout blocked?', e); }
  }
  if (btnHelp) btnHelp.onclick = openHelpPop;
  $('#btn-reset').onclick = () => { if (!confirm('Effacer le brouillon local et recharger le fichier d\'origine ?')) return; localStorage.removeItem(DRAFT_KEY); location.reload(); };
  $('#btn-new').onclick = () => { const id = uniqueId('modele'); const t={ id, category:'', title:{fr:'',en:''}, description:{fr:'',en:''}, subject:{fr:'',en:''}, body:{fr:'',en:''}, variables:[] }; data.templates.push(t); selected=id; saveDraft(); renderList(); renderEditor(); };
  $('#btn-delete').onclick = () => { const i = data.templates.findIndex(x=>x.id===selected); if (i>=0 && confirm('Supprimer ce modele ?')){ data.templates.splice(i,1); selected=data.templates[0]?.id||null; saveDraft(); renderList(); renderEditor(); } };
  // Category colors management
  $('#btn-category-colors').onclick = () => {
    const modal = $('#modal-category-colors');
    const list = $('#category-colors-list');
    const allCats = new Set();
    (data.templates||[]).forEach(t => {
      if (t.category_fr) allCats.add(t.category_fr);
      if (t.category_en) allCats.add(t.category_en);
    });
    const sorted = Array.from(allCats).sort();
    list.innerHTML = sorted.map(cat => {
      const color = data.metadata.categoryColors?.[cat] || '#5a88b5';
      return `<div style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px;border:1px solid var(--border);border-radius:10px;background:#fafafa">
        <label style="font-weight:700;color:#334155">${escapeHtml(cat)}</label>
        <input type="color" value="${escapeHtml(color)}" data-category="${escapeHtml(cat)}" style="width:60px;height:36px;border:1px solid var(--border);border-radius:6px;cursor:pointer" />
      </div>`;
    }).join('');
    modal.style.display = 'flex';
  };
  $('#btn-save-category-colors').onclick = () => {
    const inputs = document.querySelectorAll('#category-colors-list input[type="color"]');
    inputs.forEach(inp => {
      const cat = inp.dataset.category;
      const val = inp.value;
      if (cat) data.metadata.categoryColors[cat] = val;
    });
    saveDraft();
    notify('Couleurs des catégories enregistrées.');
    $('#modal-category-colors').style.display = 'none';
  };
  // variables buttons
  $('#btn-sync-vars').onclick = syncTemplateVariables;
  $('#btn-add-missing').onclick = addMissingVariablesToLibrary;
  // Always visible variables editor; render after load

  // inputs update
  idEl.oninput = (e) => { const t = data.templates.find(x=>x.id===selected); if (!t) return; const v=sanitizeId(e.target.value); e.target.value=v; if (!v) return; if (v!==t.id && data.templates.some(x=>x.id===v)){ e.target.style.borderColor='#fecaca'; return; } e.target.style.borderColor=''; t.id=v; selected=v; saveDraft(); renderList(); hdr.textContent = `Éditeur – ${t.id}`; };
  if (catFrEl) catFrEl.oninput = (e) => { const t=data.templates.find(x=>x.id===selected); if (!t) return; t.category_fr=e.target.value; t.category = t.category_fr || t.category_en || ''; saveDraft(); renderList(); };
  if (catEnEl) catEnEl.oninput = (e) => { const t=data.templates.find(x=>x.id===selected); if (!t) return; t.category_en=e.target.value; t.category = t.category_fr || t.category_en || ''; saveDraft(); renderList(); };
  titleFrEl.oninput = (e) => { const t=data.templates.find(x=>x.id===selected); if (!t) return; t.title=t.title||{}; t.title.fr=e.target.value; saveDraft(); renderList(); };
  titleEnEl.oninput = (e) => { const t=data.templates.find(x=>x.id===selected); if (!t) return; t.title=t.title||{}; t.title.en=e.target.value; saveDraft(); renderList(); };
  descFrEl.oninput = (e) => { const t=data.templates.find(x=>x.id===selected); if (!t) return; t.description=t.description||{}; t.description.fr=e.target.value; saveDraft(); };
  descEnEl.oninput = (e) => { const t=data.templates.find(x=>x.id===selected); if (!t) return; t.description=t.description||{}; t.description.en=e.target.value; saveDraft(); };
  subjFrEl.oninput = (e) => { const t=data.templates.find(x=>x.id===selected); if (!t) return; t.subject=t.subject||{}; t.subject.fr=e.target.value; saveDraft(); renderEditor(); };
  subjEnEl.oninput = (e) => { const t=data.templates.find(x=>x.id===selected); if (!t) return; t.subject=t.subject||{}; t.subject.en=e.target.value; saveDraft(); renderEditor(); };
  bodyFrEl.oninput = (e) => { const t=data.templates.find(x=>x.id===selected); if (!t) return; t.body=t.body||{}; t.body.fr=e.target.value; saveDraft(); renderEditor(); };
  bodyEnEl.oninput = (e) => { const t=data.templates.find(x=>x.id===selected); if (!t) return; t.body=t.body||{}; t.body.en=e.target.value; saveDraft(); renderEditor(); };
  search.oninput = (e) => { term = e.target.value; renderList(); };
  if (varsSearchEl) varsSearchEl.oninput = () => renderEditor();
  if (btnCopyVarsFr) btnCopyVarsFr.onclick = () => copyVarLines('fr');
  if (btnCopyVarsEn) btnCopyVarsEn.onclick = () => copyVarLines('en');
  if (btnValidateVars) btnValidateVars.onclick = validateTemplateVars;
  if (btnPreview) btnPreview.onclick = () => {
    const t = data.templates.find(x=>x.id===selected); if(!t) return;
    const win = window.open('', 'tpl_preview', 'width=900,height=700,noopener');
    if(!win) return;
    // Build maps for FR/EN from union of declared variables and detected placeholders
    const unionKeys = Array.from(new Set([...(t.variables||[]), ...detectPlaceholders(t)])).sort();
    const phMapFR = {}; const phMapEN = {};
    unionKeys.forEach(k=>{ const ex = data.variables?.[k]?.example || {}; phMapFR[k] = ex.fr || ex.en || '…'; phMapEN[k] = ex.en || ex.fr || '…'; });
    function injectExamples(map, str){ return String(str||'').replace(/<<([^>]+)>>/g,(m,name)=>{
      const base = canonicalVar(stripLangSuffix(name));
      return map[base] != null ? map[base] : m; }); }
    const subjFR = injectExamples(phMapFR, t.subject?.fr);
    const subjEN = injectExamples(phMapEN, t.subject?.en);
    const bodyFR = injectExamples(phMapFR, t.body?.fr).replace(/\n/g,'<br/>');
    const bodyEN = injectExamples(phMapEN, t.body?.en).replace(/\n/g,'<br/>');
    win.document.write(`<!doctype html><html><head><title>Prévisualisation – ${t.id}</title><style>body{font-family:Inter,system-ui,sans-serif;margin:0;padding:20px;background:#f8fafc;color:#0f172a}h2{margin-top:30px} .pane{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-top:12px} code{background:#f1f5f9;padding:2px 4px;border-radius:6px;font-size:12px} .vars{font-size:12px;color:#64748b;margin-top:10px} .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px} @media(max-width:1000px){ .grid{grid-template-columns:1fr} }</style></head><body><h1>Prévisualisation modèle: ${t.id}</h1><div class="grid"><div class="pane"><h2>FR</h2><strong>Objet:</strong> ${subjFR || '<em>(vide)</em>'}<hr/><div>${bodyFR || '<em>(vide)</em>'}</div></div><div class="pane"><h2>EN</h2><strong>Subject:</strong> ${subjEN || '<em>(empty)</em>'}<hr/><div>${bodyEN || '<em>(empty)</em>'}</div></div></div><div class="vars"><strong>Variables:</strong> ${(t.variables||[]).join(', ')}</div></body></html>`);
    win.document.close();
  };
  // Removed language switch handler.

  function loadInitialUI(){ renderList(); renderEditor(); }
  loadInitial().catch(console.error);
})();
