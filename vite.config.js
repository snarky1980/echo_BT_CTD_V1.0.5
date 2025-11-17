import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
// Read package.json without JSON import attributes to keep Node 20 CI happy
const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

// ESM-safe __dirname for Node 20+
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  // For gh-pages deployment with custom domain, use root path
  const base = '/';
  const writeTemplatesPlugin = {
    name: 'write-templates-plugin',
    apply: 'serve', // dev only
    configureServer(server) {
      server.middlewares.use('/__replace_templates', async (req, res, next) => {
        // Allow detection via OPTIONS
        if (req.method === 'OPTIONS') {
          res.statusCode = 204; // No Content
          return res.end();
        }
        if (req.method !== 'POST') return next();
        try {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const json = JSON.parse(body || '{}');
              if (!json || typeof json !== 'object' || !json.templates) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, error: 'Invalid payload. Expected { metadata, variables, templates }.' }));
                return;
              }
              const root = process.cwd();
              const outPath = path.resolve(root, 'complete_email_templates.json');
              const publicDir = path.resolve(root, 'public');
              const outPublic = path.resolve(publicDir, 'complete_email_templates.json');
              // write to repo root (for consistency) and public/ (so dev server serves it at /complete_email_templates.json)
              fs.writeFileSync(outPath, JSON.stringify(json, null, 2), 'utf-8');
              try { fs.mkdirSync(publicDir, { recursive: true }); } catch {}
              fs.writeFileSync(outPublic, JSON.stringify(json, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, path: outPath, public: outPublic }));
            } catch (e) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: String(e && e.message || e) }));
            }
          });
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: String(err && err.message || err) }));
        }
      });
    }
  };
  const copyAdminStaticPlugin = {
    name: 'copy-admin-static',
    apply: 'build',
    writeBundle(options) {
      const outDir = options.dir || 'dist';
      const root = process.cwd();
      const stamp = (process.env.GITHUB_SHA && String(process.env.GITHUB_SHA).slice(0, 7)) || String(Date.now());
      // Write a .nojekyll file to disable Jekyll processing on GitHub Pages
      try {
        fs.writeFileSync(path.resolve(outDir, '.nojekyll'), '');
      } catch (e) {
        console.warn('[copy-admin-static] failed to write .nojekyll:', e?.message || e);
      }
      const files = [
        { src: path.resolve(root, 'admin.html'), dst: path.resolve(outDir, 'admin.html') }, // will be replaced by admin-simple content below
        { src: path.resolve(root, 'admin-simple.html'), dst: path.resolve(outDir, 'admin-simple.html') },
        { src: path.resolve(root, 'admin-simple-help.html'), dst: path.resolve(outDir, 'admin-simple-help.html') },
        { src: path.resolve(root, 'help.html'), dst: path.resolve(outDir, 'help.html') },
        { src: path.resolve(root, '404.html'), dst: path.resolve(outDir, '404.html') },
      ];
      const assets = [
        { src: path.resolve(root, 'assets', 'admin-simple.js'), dst: path.resolve(outDir, 'assets', 'admin-simple.js') },
        { src: path.resolve(root, 'assets', 'ai-helper.js'), dst: path.resolve(outDir, 'assets', 'ai-helper.js') },
        { src: path.resolve(root, 'assets', 'ai-optional.js'), dst: path.resolve(outDir, 'assets', 'ai-optional.js') },
        { src: path.resolve(root, 'assets', 'var-popup-integrated.js'), dst: path.resolve(outDir, 'assets', 'var-popup-integrated.js') },
      ];
      // ensure assets dir
      fs.mkdirSync(path.resolve(outDir, 'assets'), { recursive: true });
      const toCopy = [...files, ...assets];
      for (const f of toCopy) {
        try {
          if (!fs.existsSync(f.src)) continue;
          const isHtml = f.src.endsWith('.html');
          if (isHtml && path.basename(f.src) === 'admin-simple.html') {
            try {
              let html = fs.readFileSync(f.src, 'utf-8');
              html = html.replace(
                /(<script\s+src=["']\.\/assets\/admin-simple\.js)(["'])/,
                `$1?v=${stamp}$2`
              );
              fs.writeFileSync(f.dst, html, 'utf-8');
            } catch {
              // fallback to copy
              fs.copyFileSync(f.src, f.dst);
            }
          } else if (isHtml && path.basename(f.dst) === 'admin.html') {
            // Ensure /admin serves the same content as admin-simple without redirect
            try {
              const srcSimple = path.resolve(root, 'admin-simple.html');
              let html = fs.readFileSync(srcSimple, 'utf-8');
              html = html.replace(
                /(<script\s+src=["']\.\/assets\/admin-simple\.js)(["'])/,
                `$1?v=${stamp}$2`
              );
              fs.writeFileSync(f.dst, html, 'utf-8');
            } catch {
              // fallback to copy original admin.html if something goes wrong
              fs.copyFileSync(f.src, f.dst);
            }
          } else {
            fs.copyFileSync(f.src, f.dst);
          }
        } catch (e) {
          // non-fatal
          console.warn('[copy-admin-static] failed to copy', f.src, '->', f.dst, e?.message || e);
        }
      }
    }
  };
  return {
    base,
    plugins: [react(), tailwindcss(), ...(mode !== 'production' ? [writeTemplatesPlugin] : []), copyAdminStaticPlugin],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version || ''),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __COMMIT_SHA__: JSON.stringify(process.env.VITE_COMMIT_SHA || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), './src'),
      },
    },
    build: {
      sourcemap: true,
      minify: false,
      rollupOptions: {
        input: (() => {
          const root = process.cwd();
          return {
            main: path.resolve(root, 'index.html'),
          };
        })(),
        output: {
          // Use stable hashed filenames; avoid Date.now to prevent index/asset mismatches on CDN
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`
        }
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      // Allow any forwarded dev host (Codespaces, tunnels, etc.)
      // Removing allowedHosts avoids 502/403 when hostnames vary.
    },
    preview: {
      port: 5175,
    },
  };
});
