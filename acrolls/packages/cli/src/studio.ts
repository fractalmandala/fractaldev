import { createServer } from 'node:http';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { compile } from 'mdsvex';
import {
  createAcrollsMdsvexOptions,
  renderAcrollsArticleHtml
} from '@acrolls/mdsvex';
import type { Args } from './util.js';
import { escapeHtml, exists, resolvePackageDir } from './util.js';

const STUDIO_CLIENT = `
function enhanceCodeFrames(root) {
  root.querySelectorAll('.acrolls-code-frame').forEach((frame) => {
    const slot = frame.querySelector('[data-acrolls-code-actions]');
    if (!slot || slot.childElementCount > 0) return;
    const wrapBtn = document.createElement('button');
    wrapBtn.type = 'button';
    wrapBtn.className = 'acrolls-code-frame__btn';
    wrapBtn.textContent = frame.dataset.wrap === 'true' ? 'Scroll' : 'Wrap';
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'acrolls-code-frame__btn';
    copyBtn.textContent = 'Copy';
    wrapBtn.onclick = () => {
      const next = frame.dataset.wrap === 'true' ? 'false' : 'true';
      frame.dataset.wrap = next;
      wrapBtn.textContent = next === 'true' ? 'Scroll' : 'Wrap';
    };
    copyBtn.onclick = async () => {
      const text = frame.querySelector('code')?.innerText ?? '';
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copied';
        setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
      } catch {
        copyBtn.textContent = 'Failed';
      }
    };
    slot.append(wrapBtn, copyBtn);
  });
}

async function enhanceMermaid(root) {
  const nodes = root.querySelectorAll('[data-acrolls-mermaid]');
  if (!nodes.length) return;
  try {
    const mermaid = (await import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')).default;
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral' });
    let i = 0;
    for (const node of nodes) {
      const fallback = node.querySelector('.acrolls-mermaid__fallback');
      const canvas = node.querySelector('.acrolls-mermaid__canvas');
      const source = fallback?.textContent?.trim() ?? '';
      if (!source || !canvas) continue;
      try {
        const { svg } = await mermaid.render('studio-mmd-' + Date.now() + '-' + i++, source);
        canvas.innerHTML = svg;
        canvas.hidden = false;
        if (fallback) fallback.hidden = true;
      } catch {}
    }
  } catch {}
}

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    document.querySelector('form')?.requestSubmit();
  }
});

const root = document.querySelector('.acrolls');
if (root) {
  enhanceCodeFrames(root);
  enhanceMermaid(root);
}
`;

export async function cmdStudio(args: Args) {
  const file = args._[1];
  if (!file) {
    console.error('Usage: acrolls studio <file.md|file.svx> [--port 4317] [--no-open] [--mode foundation|default]');
    return 2;
  }
  const abs = resolve(process.cwd(), file);
  if (!(await exists(abs))) {
    console.error(`File not found: ${file}`);
    return 1;
  }
  const mode = String(args.flags.mode ?? 'default');
  if (!['foundation', 'default'].includes(mode)) {
    console.error('Invalid --mode. Use foundation or default.');
    return 2;
  }
  let port = Number(args.flags.port ?? 4317);
  if (!Number.isFinite(port) || port <= 0) port = 4317;

  const stylesPkg = await resolvePackageDir('@acrolls/styles');

  async function loadCss(): Promise<string> {
    try {
      const dir =
        stylesPkg ?? resolve(dirname(new URL(import.meta.url).pathname), '../../styles');
      const foundation = await readFile(join(dir, 'foundation.css'), 'utf8');
      if (mode === 'foundation') return foundation;
      // Inline foundation so browser does not need @import resolution
      const def = await readFile(join(dir, 'default.css'), 'utf8');
      return foundation + '\n' + def.replace(/@import\s+['"]\.\/foundation\.css['"]\s*;?/, '');
    } catch {
      return '/* styles unavailable */';
    }
  }

  async function renderPage(): Promise<string> {
    const source = await readFile(abs, 'utf8');
    let articleHtml = '';
    let mdsvexOk = false;
    let mdsvexError = '';
    let htmlError = '';

    try {
      const result = await compile(source, {
        filename: abs,
        ...createAcrollsMdsvexOptions({ extensions: ['.svx', '.md'] })
      } as never);
      mdsvexOk = Boolean(result?.code);
    } catch (err) {
      mdsvexError = err instanceof Error ? err.message : String(err);
    }

    try {
      const rendered = await renderAcrollsArticleHtml(source);
      articleHtml = rendered.html;
    } catch (err) {
      htmlError = err instanceof Error ? err.message : String(err);
      articleHtml = `<article class="acrolls"><p class="error">Preview failed: ${escapeHtml(
        htmlError
      )}</p></article>`;
    }

    const css = await loadCss();
    const rel = relative(process.cwd(), abs);
    const statusBits = [
      mdsvexOk ? 'mdsvex compile OK' : `mdsvex: ${mdsvexError || 'failed'}`,
      htmlError ? `html: ${htmlError}` : 'publication HTML OK'
    ];

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Acrolls Studio — ${escapeHtml(rel)}</title>
<style>
${css}
:root {
  color-scheme: light dark;
  --font-body: "Iowan Old Style", Palatino, Georgia, serif;
  --font-heading: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --foreground: #171714;
  --muted-foreground: #5c5c56;
  --border: #deded8;
  --accent: #6d28d9;
  --card: #fffcf5;
  --muted: #f0efe8;
  --background: transparent;
  --radius: 0.75rem;
  font-family: system-ui, sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --foreground: #f4f3ee;
    --muted-foreground: #a8a89e;
    --border: #2e2e2a;
    --accent: #a78bfa;
    --card: #1a1a17;
    --muted: #22221e;
  }
  body { background: #121211; color: #f4f3ee; }
}
body { margin: 0; display: grid; grid-template-columns: minmax(280px, 1fr) minmax(320px, 1.15fr); min-height: 100vh; background: #f7f6f2; color: #171714; }
.studio-header { grid-column: 1 / -1; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); display:flex; justify-content:space-between; gap:1rem; align-items:center; background: color-mix(in oklab, var(--card) 80%, transparent); }
main { display: contents; }
.pane { padding: 1rem; overflow: auto; max-height: calc(100vh - 3.25rem); }
.pane + .pane { border-left: 1px solid var(--border); }
textarea { width: 100%; min-height: calc(100vh - 9rem); font-family: var(--font-mono); font-size: 13px; line-height: 1.5; padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: inherit; resize: vertical; }
.error { color: #b91c1c; white-space: pre-wrap; }
.hint { color: var(--muted-foreground); font-size: 0.9em; }
button, .btn { cursor: pointer; appearance: none; border: 1px solid var(--border); background: var(--card); color: inherit; border-radius: 8px; padding: 0.4rem 0.75rem; font: inherit; }
button:hover { border-color: var(--accent); }
.actions { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-top: 0.75rem; }
.status { font-size: 0.85em; color: var(--muted-foreground); }
@media (max-width: 900px) {
  body { grid-template-columns: 1fr; }
  .pane + .pane { border-left: 0; border-top: 1px solid var(--border); }
  textarea { min-height: 40vh; }
}
</style>
</head>
<body>
<header class="studio-header">
  <div>
    <strong>Acrolls Studio</strong>
    <span class="hint"> — ${escapeHtml(rel)} · source is truth · mode=${escapeHtml(mode)}</span>
  </div>
  <div class="status">${escapeHtml(statusBits.join(' · '))}</div>
</header>
<main>
  <section class="pane">
    <h2>Source</h2>
    <form method="POST" action="/save">
      <textarea name="source" id="source" spellcheck="false">${escapeHtml(source)}</textarea>
      <div class="actions">
        <button type="submit">Save (⌘/Ctrl+S)</button>
        <span class="hint">atomic write to disk · refresh reloads clean</span>
      </div>
    </form>
    ${
      mdsvexError
        ? `<p class="error" style="margin-top:1rem">mdsvex: ${escapeHtml(mdsvexError)}</p>`
        : ''
    }
  </section>
  <section class="pane">
    <h2>Publication preview</h2>
    <p class="hint">Rendered with the shared HTML pipeline (banner, tables, Shiki, mermaid). SVX &lt;script&gt; blocks are stripped for preview safety.</p>
    ${articleHtml}
  </section>
</main>
<script type="module">
${STUDIO_CLIENT}
</script>
</body>
</html>`;
  }

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', `http://127.0.0.1`);
      if (req.method === 'POST' && url.pathname === '/save') {
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const body = Buffer.concat(chunks).toString('utf8');
        const params = new URLSearchParams(body);
        const source = params.get('source');
        if (source == null) {
          res.writeHead(400);
          res.end('missing source');
          return;
        }
        const tmp = abs + '.acrolls-tmp';
        await writeFile(tmp, source, 'utf8');
        await rename(tmp, abs);
        res.writeHead(302, { Location: '/' });
        res.end();
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/preview') {
        const source = await readFile(abs, 'utf8');
        const rendered = await renderAcrollsArticleHtml(source);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ html: rendered.html, frontmatter: rendered.frontmatter }));
        return;
      }
      const html = await renderPage();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(err instanceof Error ? err.message : String(err));
    }
  });

  async function listen(start: number): Promise<number> {
    let p = start;
    for (let attempt = 0; attempt < 12; attempt++) {
      try {
        await new Promise<void>((resolveListen, reject) => {
          const onError = (err: NodeJS.ErrnoException) => {
            server.off('listening', onListening);
            reject(err);
          };
          const onListening = () => {
            server.off('error', onError);
            resolveListen();
          };
          server.once('error', onError);
          server.once('listening', onListening);
          server.listen(p, '127.0.0.1');
        });
        return p;
      } catch (err) {
        const e = err as NodeJS.ErrnoException;
        if (e.code !== 'EADDRINUSE') throw err;
        p += 1;
      }
    }
    throw new Error(`No free port near ${start}`);
  }

  port = await listen(port);

  const url = `http://127.0.0.1:${port}`;
  console.log(`Acrolls Studio bound to ${url}`);
  console.log(`Editing ${abs}`);
  console.log('Stop with Ctrl+C');

  if (!args.flags['no-open']) {
    const opener =
      process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    spawn(opener, [url], { stdio: 'ignore', detached: true }).unref();
  }

  await new Promise(() => {
    /* run until killed */
  });
  return 0;
}
