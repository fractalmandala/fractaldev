import { createHighlighterCore, type HighlighterCore, type ThemeRegistrationRaw } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

const LANGS = {
  svelte: () => import('@shikijs/langs/svelte'),
  typescript: () => import('@shikijs/langs/typescript'),
  javascript: () => import('@shikijs/langs/javascript'),
  html: () => import('@shikijs/langs/html'),
  css: () => import('@shikijs/langs/css'),
  sass: () => import('@shikijs/langs/sass'),
  json: () => import('@shikijs/langs/json'),
  bash: () => import('@shikijs/langs/bash'),
  markdown: () => import('@shikijs/langs/markdown'),
  yaml: () => import('@shikijs/langs/yaml'),
  diff: () => import('@shikijs/langs/diff')
} as const;

type Lang = keyof typeof LANGS;

/** What people actually type in a fence, mapped to what Shiki calls it. */
const ALIASES: Record<string, Lang> = {
  sh: 'bash',
  shell: 'bash',
  shellscript: 'bash',
  zsh: 'bash',
  console: 'bash',
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  scss: 'sass',
  md: 'markdown',
  yml: 'yaml'
};

let singleton: Promise<HighlighterCore> | undefined;

function highlighter() {
  singleton ??= createHighlighterCore({
    themes: [
      import('@shikijs/themes/github-light-default'),
      import('@shikijs/themes/github-dark-default')
    ],
    langs: Object.values(LANGS).map((load) => load()),
    engine: createJavaScriptRegexEngine()
  });
  return singleton;
}

const cache = new Map<string, string>();

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Unknown language, or Shiki blew up: still render readable, safe code. */
function fallback(code: string, lang: string) {
  return `<pre class="shiki" data-language="${escapeHtml(lang)}" tabindex="0"><code>${escapeHtml(code)}</code></pre>`;
}

export function normalizeLang(input: string | null | undefined): string {
  const name = (input ?? 'text').trim().toLowerCase().split(/\s+/)[0] || 'text';
  return ALIASES[name] ?? name;
}
/**
 * Highlighted HTML for one code string. Server-only, cached per (lang, code).
 * Emits paired light/dark tokens — see shiki.sass for how they are consumed.
 */
export async function highlight(code: string, lang = 'text'): Promise<string> {
  const language = normalizeLang(lang);
  const key = `${language}::${code}`;
  const hit = cache.get(key);
  if (hit) return hit;

  if (!(language in LANGS)) {
    const plain = fallback(code, language);
    cache.set(key, plain);
    return plain;
  }

  try {
    const shiki = await highlighter();
    const html = shiki.codeToHtml(code, {
      lang: language,
      themes: { light: 'github-light-default', dark: 'github-dark-default' },
      defaultColor: false, // emits --shiki-light / --shiki-dark instead of a baked-in color
      transformers: [
        {
          pre(node) {
            node.properties['data-language'] = language;
            node.properties.tabindex = '0'; // keyboard-scrollable overflow
          },
          line(node, line) {
            node.properties['data-line'] = String(line);
          }
        }
      ]
    });
    cache.set(key, html);
    return html;
  } catch {
    return fallback(code, language);
  }
}

/**
 * Unused while the dual-theme pairing above is active — kept as the switch-over
 * point if code should follow the accent picker instead of the mode. To use it:
 * pass `theme: 'house'` (singular) instead of `themes` + defaultColor, register
 * it in `themes: [theme]`, and drop the --shiki-dark rules from _14_shiki.sass.
 */
export const theme: ThemeRegistrationRaw = {
  name: 'house',
  type: 'dark',
  colors: { 'editor.background': 'transparent', 'editor.foreground': 'var(--text-secondary)' },
  settings: [
    {
      scope: ['comment'],
      settings: { foreground: 'color-mix(in oklab, var(--text-secondary) 65%, transparent)' }
    },
    {
      scope: ['string', 'constant.numeric', 'constant.language'],
      settings: { foreground: 'var(--accent)' }
    },
    {
      scope: ['keyword', 'storage', 'entity.name.tag', 'entity.name.function'],
      settings: { foreground: 'var(--text-primary)' }
    }
  ]
};

