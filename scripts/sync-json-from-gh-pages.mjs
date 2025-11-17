#!/usr/bin/env node
/**
 * sync-json-from-gh-pages.mjs
 * Fetch the latest complete_email_templates.json from the repository (preferring main,
 * then falling back to gh-pages) and write it into the repository root + public/
 * before build. This keeps local copy aligned with remote source-of-truth.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const log = (msg) => process.stdout.write(`[sync-json] ${msg}\n`)

function getRepoSlug() {
  try {
    const remote = execSync('git remote get-url origin', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
    // remote can be https://github.com/owner/repo.git or git@github.com:owner/repo.git
    let m = remote.match(/github.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/)
    if (m) return `${m[1]}/${m[2]}`
  } catch (e) {
    log('Could not determine git remote origin; falling back to package.json repository.url')
  }
  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'))
    const url = pkg?.repository?.url || ''
    const m = url.match(/github.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/)
    if (m) return `${m[1]}/${m[2]}`
  } catch {}
  return null
}

async function main() {
  const slug = getRepoSlug()
  if (!slug) {
    log('Repo slug not found; aborting sync.')
    return
  }
  const candidates = [
    `https://raw.githubusercontent.com/${slug}/main/complete_email_templates.json`,
    `https://raw.githubusercontent.com/${slug}/gh-pages/complete_email_templates.json`
  ]
  let text = null
  let source = null
  for (const url of candidates) {
    log(`Attempt fetch ${url}`)
    try {
      const resp = await fetch(url, { cache: 'no-store' })
      if (!resp.ok) { log(` -> HTTP ${resp.status}`); continue }
      const body = await resp.text()
      try { JSON.parse(body); text = body; source = url; break } catch (e) { log(' -> Invalid JSON, skipping') }
    } catch (e) { log(` -> Network error: ${e.message}`) }
  }
  if (!text) {
    log('No remote JSON fetched; keeping existing local file.')
    return
  }
  try {
    JSON.parse(text) // final validation
  } catch (e) {
    log(`Validation failed unexpectedly: ${e.message}`)
    return
  }
  const rootFile = path.resolve('complete_email_templates.json')
  const publicFile = path.resolve('public', 'complete_email_templates.json')
  try {
    fs.writeFileSync(rootFile, text)
    fs.mkdirSync(path.dirname(publicFile), { recursive: true })
    fs.writeFileSync(publicFile, text)
    log(`Updated local complete_email_templates.json from ${source}.`)
  } catch (e) {
    log(`Write failed: ${e.message}`)
  }
}

main().catch(e => { log(`Unexpected error: ${e.message}`); process.exitCode = 1 })
