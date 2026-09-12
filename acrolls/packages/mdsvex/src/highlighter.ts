import { createHighlighter, type Highlighter } from 'shiki';
import { parseFenceMeta } from './code-meta.js';

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [
        'javascript',
        'typescript',
        'tsx',
        'jsx',
        'json',
        'html',
        'css',
        'sass',
        'scss',
        'bash',
        'shell',
        'markdown',
        'md',
        'svelte',
        'rust',
        'python',
        'go',
        'yaml',
        'toml',
        'diff',
        'text',
        'plaintext'
      ]
    });
  }
  return highlighterPromise;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Svelte treats `{` / `}` in templates as expressions — escape for mdsvex HTML output. */
function escapeForSvelte(html: string): string {
  return html.replaceAll('{', '&#123;').replaceAll('}', '&#125;');
}

function decorateLines(
  codeHtml: string,
  meta: ReturnType<typeof parseFenceMeta>
): string {
  // codeHtml is inner HTML of <code>…</code>
  // Prefer operating on Shiki's existing span.line rows when present.
  // Match Shiki line spans whether class is first or later in the attribute list
  if (/\bclass="[^"]*\bline\b/.test(codeHtml) || /class='[^']*\bline\b/.test(codeHtml)) {
    let n = 0;
    const hasFocus = meta.focus.size > 0;
    return codeHtml.replace(/<span\b([^>]*)>/g, (full, attrs: string) => {
      if (!/\bclass=(["'])[^"']*\bline\b/.test(attrs) && !/\bclass="[^"]*\bline\b/.test(attrs)) {
        return full;
      }
      n += 1;
      let next = attrs;
      if (!/\bdata-line=/.test(next)) next += ` data-line="${n}"`;
      if (meta.highlight.has(n) && !/\bdata-highlighted\b/.test(next)) {
        next += ' data-highlighted=""';
      }
      if (hasFocus) {
        next = next.replace(/\sdata-focused="[^"]*"/g, '');
        next += ` data-focused="${meta.focus.has(n) ? 'true' : 'false'}"`;
      }
      if (meta.add.has(n) && !/\bdata-diff=/.test(next)) next += ' data-diff="add"';
      if (meta.remove.has(n) && !/\bdata-diff=/.test(next)) next += ' data-diff="remove"';
      return `<span${next}>`;
    });
  }

  const lines = codeHtml.split('\n');
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  const hasFocus = meta.focus.size > 0;

  return lines
    .map((line, idx) => {
      const n = idx + 1;
      const attrs: string[] = [`class="line"`, `data-line="${n}"`];
      if (meta.highlight.has(n)) attrs.push('data-highlighted=""');
      if (hasFocus) attrs.push(`data-focused="${meta.focus.has(n) ? 'true' : 'false'}"`);
      if (meta.add.has(n)) attrs.push('data-diff="add"');
      if (meta.remove.has(n)) attrs.push('data-diff="remove"');
      return `<span ${attrs.join(' ')}>${line.length ? line : ' '}</span>`;
    })
    .join('\n');
}

export type HighlightOptions = {
  strict?: boolean;
};

export function createAcrollsHighlighter(options: HighlightOptions = {}) {
  return async function highlight(
    code: string,
    lang: string | undefined,
    meta?: string
  ): Promise<string> {
    const fence = parseFenceMeta(meta);
    const language = (lang || 'text').replace(/^language-/, '') || 'text';

    if (language === 'mermaid') {
      const src = escapeHtml(code.trim());
      return escapeForSvelte(
        `<div class="acrolls-mermaid" data-acrolls-mermaid><pre class="acrolls-mermaid__fallback"><code>${src}</code></pre><div class="acrolls-mermaid__canvas" hidden></div></div>`
      );
    }

    let preHtml: string;
    try {
      const highlighter = await getHighlighter();
      const loaded = highlighter.getLoadedLanguages();
      const useLang = loaded.includes(language as never) ? language : 'text';
      if (useLang === 'text' && language !== 'text' && language !== 'plaintext') {
        if (options.strict) {
          throw new Error(`Unsupported language "${language}" (strict mode)`);
        }
      }
      preHtml = highlighter.codeToHtml(code, {
        lang: useLang,
        themes: {
          light: 'github-light',
          dark: 'github-dark'
        },
        defaultColor: false,
        // Ensure one span per line for decoration hooks
        transformers: [
          {
            name: 'acrolls-lines',
            line(node, line) {
              node.properties = node.properties ?? {};
              const className = node.properties.class;
              if (Array.isArray(className)) {
                if (!className.includes('line')) className.push('line');
              } else if (typeof className === 'string') {
                if (!className.split(/\s+/).includes('line')) {
                  node.properties.class = `${className} line`.trim();
                }
              } else {
                node.properties.class = 'line';
              }
              node.properties['data-line'] = String(line);
            }
          }
        ]
      });
    } catch (err) {
      if (options.strict) throw err;
      preHtml = `<pre class="shiki"><code>${escapeHtml(code)
        .split('\n')
        .map((l, i) => `<span class="line" data-line="${i + 1}">${l || ' '}</span>`)
        .join('\n')}</code></pre>`;
    }

    // Extract style + classes from Shiki pre, then rebuild a single pre
    const preOpen = preHtml.match(/^<pre([^>]*)>/);
    const preAttrs = preOpen?.[1] ?? '';
    const styleMatch = preAttrs.match(/\sstyle="([^"]*)"/);
    const style = styleMatch ? styleMatch[1] : '';
    const classMatch = preAttrs.match(/\sclass="([^"]*)"/);
    const shikiClass = classMatch ? classMatch[1] : 'shiki';

    const codeMatch = preHtml.match(/<code([^>]*)>([\s\S]*)<\/code>/);
    const codeAttrs = codeMatch?.[1] ?? '';
    let codeInner = codeMatch?.[2] ?? escapeHtml(code);
    codeInner = decorateLines(codeInner, fence);

    const preClass = `acrolls-code-frame__pre ${shikiClass}`.trim();
    const preStyle = style ? ` style="${style}"` : '';

    const frameAttrs = [
      'class="acrolls-code-frame"',
      `data-language="${escapeHtml(language)}"`,
      `data-wrap="${fence.wrap ? 'true' : 'false'}"`,
      `data-line-numbers="${fence.lineNumbers ? 'true' : 'false'}"`
    ];
    if (fence.filename) {
      frameAttrs.push(`data-filename="${escapeHtml(fence.filename)}"`);
    }

    const header = fence.filename
      ? `<div class="acrolls-code-frame__header"><span class="acrolls-code-frame__filename">${escapeHtml(
          fence.filename
        )}</span><div class="acrolls-code-frame__actions" data-acrolls-code-actions></div></div>`
      : `<div class="acrolls-code-frame__header acrolls-code-frame__header--actions-only"><div class="acrolls-code-frame__actions" data-acrolls-code-actions></div></div>`;

    const html = `<div ${frameAttrs.join(
      ' '
    )}>${header}<pre class="${preClass}"${preStyle}><code${codeAttrs}>${codeInner}</code></pre></div>`;
    return escapeForSvelte(html);
  };
}
