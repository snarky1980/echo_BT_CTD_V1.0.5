import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function die(msg, code = 1) {
  console.error(`[templates:replace] ${msg}`);
  process.exit(code);
}

async function main() {
  const srcArg = process.argv[2];
  if (!srcArg) {
    die('Usage: node scripts/replace-templates.mjs path/to/new.json');
  }

  const srcPath = path.resolve(process.cwd(), srcArg);
  if (!fs.existsSync(srcPath)) die(`Source file not found: ${srcPath}`);

  let text;
  try {
    text = fs.readFileSync(srcPath, 'utf-8');
  } catch (e) {
    die(`Failed reading source file: ${e?.message || e}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    die(`Invalid JSON: ${e?.message || e}`);
  }

  if (!data || typeof data !== 'object' || !data.templates) {
    die('Invalid payload. Expected an object with a "templates" property.');
  }

  const rootDir = path.resolve(__dirname, '..');
  const destRepo = path.resolve(rootDir, 'complete_email_templates.json');
  const destPublic = path.resolve(rootDir, 'public', 'complete_email_templates.json');

  const out = JSON.stringify(data, null, 2);
  try {
    fs.writeFileSync(destRepo, out, 'utf-8');
  } catch (e) {
    die(`Failed writing ${destRepo}: ${e?.message || e}`);
  }
  try {
    fs.mkdirSync(path.dirname(destPublic), { recursive: true });
    fs.writeFileSync(destPublic, out, 'utf-8');
  } catch (e) {
    die(`Failed writing ${destPublic}: ${e?.message || e}`);
  }

  const count = Array.isArray(data.templates) ? data.templates.length : 'unknown';
  console.log(`[templates:replace] Updated ${destRepo} and ${destPublic} (templates: ${count}).`);
}

main().catch(err => die(err?.message || String(err)));
