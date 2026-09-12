---
title: "Shiki code highlighting in SvelteKit"
description: "The one way to do server-highlighted code blocks with copy buttons. Distilled from acrolls, fractalcodex, fractalsvelte, markgraphy and shadcn-svelte."
---

# Shiki in SvelteKit — the settled recipe

Highlight on the **server**, at load/build time. Ship HTML, not a highlighter.
Dual theme in **one pass** via CSS variables. Copy button in a **Svelte component**,
not baked into the highlighted string.

Six projects were surveyed; four different approaches were found. This is the merged best one,
plus notes on which project each idea came from and what to avoid.

---

## 0. What the survey found

| Project | Approach | Verdict |
|---|---|---|
| `shadcn-svelte-main` | `createHighlighterCore` from `shiki/core` + `createJavaScriptRegexEngine`, explicit `@shikijs/themes/*` and `@shikijs/langs/*` imports, module-level cache, `rehype-pretty-code` for markdown | **Best core setup.** No WASM, tree-shakeable, fully static. |
| `fractalcodex` | `createHighlighter` (full bundle), dual theme `defaultColor: false`, language allowlist + aliases, `Map` cache, HTML-escaped fallback | **Best hardening.** Copy the aliases/allowlist/fallback. Also has a `check-shiki-contract.mjs` guard script. |
| `markgraphy` | Server-only, mdsvex `highlight.highlighter`, custom theme whose colors are **CSS variables** so the accent picker re-themes code | **Best theming trick** + best mdsvex wiring. |
| `acrolls` | mdsvex + rehype pipeline, fence meta parsing (`filename=` `lineNumbers` `wrap` `highlight="1,3-5"` `focus` `add` `remove`), line decoration transformers | **Best fence-meta layer.** Take `code-meta.ts` if you need line highlighting/diffs. |
| `fractalsvelte` | `createHighlighter` called **in a `$effect` in the browser** | **Anti-pattern.** Ships ~1MB of Shiki + grammars to the client and flashes unstyled code. Don't. |
| `fracta-era1` | highlight.js, not Shiki | Out of scope. |

Rules that fell out of it:

1. **Never import `shiki` into a module that runs on the client.** Server load, `+page.server.ts`, or the mdsvex preprocessor. Nothing else.
2. **`shiki/core` + `createJavaScriptRegexEngine`, not the `shiki` barrel** — the barrel drags in the Oniguruma WASM engine and every grammar. The JS engine has no WASM, works on any runtime (edge included), and is fast enough at build time.
3. **One highlighter per process.** A module-level promise singleton. `createHighlighter*` is expensive; calling it per request is the #1 way to make a docs build crawl.
4. **Dual theme in one pass** — `themes: {light, dark}` + `defaultColor: false` emits `--shiki-light` / `--shiki-dark` custom properties on every span. One HTML string, both modes, no re-highlight on toggle.
5. **The copy button copies the raw source string**, never `pre.innerText` scraped back out of the DOM (shadcn does the scrape; it loses tabs and re-indents).

---

## 1. Install

```bash
pnpm add -D shiki @shikijs/themes @shikijs/langs
```

Shiki v4+. Keep it in `devDependencies` when all highlighting happens at build/prerender time.

---

## 2. The highlighter — `src/lib/shiki.server.ts`

The `.server.ts` suffix is load-bearing: SvelteKit throws a build error if a client module ever
imports it. That is exactly the guard you want.

```ts
// src/lib/shiki.server.ts
import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

/** Languages the docs are allowed to use. Add here, and only here. */
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
```

**Why `defaultColor: false`.** With it, Shiki writes `style="--shiki-light:#24292e;--shiki-dark:#e1e4e8"`
on each token instead of `color:`. One HTML payload serves both modes; the theme toggle is pure CSS,
zero JS, zero flash. Without it you are re-highlighting on every mode change, in the browser.

**Theme colors can be your own CSS variables** (markgraphy's trick) — define a raw theme and put
`var(--accent)` in the `settings` foregrounds, so an accent picker re-tints code along with
everything else:

```ts
import type { ThemeRegistrationRaw } from 'shiki/core';

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
```

Use *either* the CSS-variable theme (single theme, `theme: 'house'`) *or* the dual-theme pairing
above. Mixing them fights: the variable theme already follows the mode, so it does not need
light/dark output.

---

## 3. Styling — `src/lib/styles/shiki.sass`

Consumes the paired variables. Assumes `[data-mode]` on `:root` with a `prefers-color-scheme`
fallback (the fractalsvelte pattern, cleaned up).

```sass
.shiki
	margin: 0
	padding: var(--space-sm)
	overflow-x: auto
	tab-size: 2
	font-family: var(--font-mono, monospace)
	font-size: var(--text-xs)
	line-height: 1.55
	background: transparent !important   // Shiki inlines a bg; the frame owns it
	color: var(--shiki-light, var(--text-primary))
	code
		display: block
		width: fit-content
		min-width: 100%
		padding: 0
		border: 0
		background: transparent
		font: inherit
  	span
    	color: var(--shiki-light, inherit)

:root[data-mode='dark']
	.shiki, .shiki span
		color: var(--shiki-dark, inherit)

@media (prefers-color-scheme: dark)
	:root:not([data-mode='light'])
		.shiki, .shiki span
			color: var(--shiki-dark, inherit)

// Optional: line-level affordances, if you emit fence meta (section 7)
.shiki [data-line][data-highlighted]
	background: color-mix(in oklab, var(--accent) 12%, transparent)
	box-shadow: inset 2px 0 0 var(--accent)

.shiki[data-wrap='true'] code
	white-space: pre-wrap
	word-break: break-word
```

> Shiki's own output puts `.shiki` on the `<pre>`. Style that class globally, once — do **not**
> re-declare it in every component's `<style>` behind `:global()`, which is how fractalsvelte and
> markgraphy each ended up with three divergent copies of the same rules.

Plain CSS equivalent, if the project is not on Sass:

```css
.shiki {
  margin: 0; padding: .85rem; overflow-x: auto; tab-size: 2;
  background: transparent !important;
  font-family: var(--font-mono, monospace); font-size: .8rem; line-height: 1.55;
  color: var(--shiki-light, var(--text-primary));
}
.shiki code {
  display: block; width: fit-content; min-width: 100%;
  background: transparent; padding: 0; border: 0; font: inherit;
}
.shiki span { color: var(--shiki-light, inherit); }
:root[data-mode='dark'] .shiki,
:root[data-mode='dark'] .shiki span { color: var(--shiki-dark, inherit); }
@media (prefers-color-scheme: dark) {
  :root:not([data-mode='light']) .shiki,
  :root:not([data-mode='light']) .shiki span { color: var(--shiki-dark, inherit); }
}
```

---

## 4. The frame + copy button — `src/lib/ui/CodeBlock.svelte`

Takes the **raw** code (for the clipboard) and the **highlighted** HTML (for display).
Renders a plain `<pre>` when `html` is missing, so it degrades cleanly.

```svelte
<!-- src/lib/ui/CodeBlock.svelte -->
<script lang="ts">
  interface Props {
    /** Raw source. This is what the copy button writes. */
    code: string;
    /** Shiki HTML from the server. Falls back to a plain pre when absent. */
    html?: string;
    /** Header label: a filename, or the language. */
    title?: string;
    copyable?: boolean;
  }

  let { code, html, title, copyable = true }: Props = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => () => clearTimeout(timer));

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return; // clipboard denied — leave the label alone
    }
    copied = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied = false), 1600);
  }
</script>

<figure class="code-frame">
  {#if title || copyable}
    <figcaption class="code-frame__head">
      <span class="code-frame__title">{title ?? ''}</span>
      {#if copyable}
        <button
          type="button"
          class="code-frame__copy"
          class:is-copied={copied}
          onclick={copy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy code'}
        >
          <span aria-hidden="true">{copied ? 'copied' : 'copy'}</span>
        </button>
      {/if}
    </figcaption>
  {/if}

  <div class="code-frame__body">
    {#if html}
      {@html html}
    {:else}
      <pre class="shiki"><code>{code}</code></pre>
    {/if}
  </div>
</figure>
```

Styles (global sass, alongside section 3 — keeps the component style-block-free):

```sass
.code-frame
	display: flex
	flex-direction: column
	min-width: 0
	margin: 0
	border: 1px solid var(--border)
	background: var(--bg-terminal, var(--bg-secondary))

.code-frame__head
	display: flex
	align-items: center
	justify-content: space-between
	gap: var(--space-sm)
	padding: .5rem .75rem
	border-bottom: 1px solid var(--border)
	color: var(--text-secondary)
	font-size: .62rem
	letter-spacing: .14em
	text-transform: uppercase

.code-frame__copy
	display: inline-flex
	align-items: center
	flex-shrink: 0
	padding: .25rem .5rem
	border: 0
	background: transparent
	color: var(--text-secondary)
	font: inherit
	letter-spacing: .05em
	text-transform: uppercase
	white-space: nowrap
	cursor: pointer
	&:hover
		color: var(--text-primary)
	&:focus-visible
		outline: 1px solid var(--accent)
		outline-offset: 2px
	&.is-copied
		color: var(--accent)

.code-frame__body
	min-width: 0
	overflow-x: auto
```

**Corner-floating variant.** If the button should sit *over* the code rather than in a header row,
drop the `<figcaption>`, add `position: relative` to `.code-frame`, and:

```sass
.code-frame
  position: relative

.code-frame__copy
  position: absolute
  top: .5rem
  right: .5rem
  z-index: 1
  opacity: 0
  transition: opacity .15s ease
  .code-frame:hover &, &:focus-visible, &.is-copied
    opacity: 1
```

Keep `:focus-visible` in that selector list — an `opacity: 0` button is unreachable by keyboard
otherwise.

---

## 5. Using it in a route

> **Only if the code lives in a data object** — a component's `usage` string, a DB row, a JSON
> catalogue. If the code sits in fenced blocks inside `.svx` / `.md` files, **skip to section 6a**;
> a `+page.server.ts` is the wrong layer and there is nothing for it to highlight. `getDoc` below is
> a stand-in for whatever returns *one* record with a code field on it — not a list-all-docs helper.

```ts
// src/routes/docs/[slug]/+page.server.ts
import { error } from '@sveltejs/kit';
import { highlight } from '$lib/shiki.server';
import { getDoc } from '$lib/docs';
import type { PageServerLoad } from './$types';

export const prerender = true; // highlight once at build, never per request

export const load: PageServerLoad = async ({ params }) => {
  const doc = getDoc(params.slug);
  if (!doc) error(404, 'Not found');

  return {
    doc,
    usage: { code: doc.usage, html: await highlight(doc.usage, 'svelte') }
  };
};
```

```svelte
<!-- src/routes/docs/[slug]/+page.svelte -->
<script lang="ts">
  import CodeBlock from '$lib/ui/CodeBlock.svelte';
  let { data } = $props();
</script>

<CodeBlock code={data.usage.code} html={data.usage.html} title="usage" />
```

That is the whole client cost: zero KB of Shiki, one small component, one clipboard call.

---

## 6. Markdown / mdsvex

Two wirings, depending on whether the code lives in `.md` / `.svx` files.

### 6a. mdsvex preprocessor (markgraphy's approach — recommended)

Highlight at **preprocess** time. A Svelte component cannot be instantiated from the highlighter, so
emit the frame as HTML and wire copy with **one delegated listener** in the docs layout.

```ts
// src/lib/mdsvex-highlight.ts   (imported by vite.config.ts — build-time only)
import { escapeSvelte } from 'mdsvex';
import { highlight, normalizeLang } from './shiki.server';

function attr(s: string) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function mdsvexHighlighter(code: string, lang: string | null = '') {
  const language = normalizeLang(lang);
  const shiki = await highlight(code, language);
  const frame =
    `<figure class="code-frame" data-code="${attr(code)}">` +
    `<figcaption class="code-frame__head">` +
    `<span class="code-frame__title">${attr(language)}</span>` +
    `<button type="button" class="code-frame__copy" aria-label="Copy code">` +
    `<span aria-hidden="true">copy</span></button>` +
    `</figcaption>` +
    `<div class="code-frame__body">${shiki}</div></figure>`;

  // escapeSvelte neutralises { } and backticks in the highlighted HTML;
  // {@html} re-emits it verbatim.
  return `{@html \`${escapeSvelte(frame)}\`}`;
}
```

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import { mdsvexHighlighter } from './src/lib/mdsvex-highlight.ts';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx', '.md'],
      preprocess: [
        mdsvex({
          extensions: ['.svx', '.md'],
          highlight: { highlighter: mdsvexHighlighter }
        })
      ]
    })
  ]
});
```

```svelte
<!-- src/routes/docs/+layout.svelte — one listener for every code block on every docs page -->
<script lang="ts">
  let { children } = $props();

  function onClick(e: MouseEvent) {
    const button = (e.target as HTMLElement | null)?.closest<HTMLButtonElement>('.code-frame__copy');
    const frame = button?.closest<HTMLElement>('.code-frame');
    if (!button || !frame) return;

    const label = button.querySelector('span');
    navigator.clipboard
      .writeText(frame.dataset.code ?? '')
      .then(() => {
        button.classList.add('is-copied');
        if (label) label.textContent = 'copied';
        setTimeout(() => {
          button.classList.remove('is-copied');
          if (label) label.textContent = 'copy';
        }, 1600);
      })
      .catch(() => {});
  }
</script>

<main onclick={onClick}>{@render children()}</main>
```

Delegation is what makes this cheap: no component per block, survives route changes, no inline JS
(so no CSP `unsafe-inline`).

### 6b. Runtime markdown (CMS, DB, user content)

Use `unified` and hand fences to the same `highlight()`, replacing the `<pre>` with a raw node.
A full working `rehypeCode` plugin lives at `acrolls/packages/mdsvex/src/rehype-code.ts`.

**Never `{@html}` untrusted markdown.** Sanitize (`rehype-sanitize`) *before* highlighting, and allow
`style`, `class` and `data-*` on `pre` / `code` / `span` so Shiki's output survives the filter.

---

## 7. Fence metadata (optional)

For ` ```svelte filename="App.svelte" lineNumbers highlight="2,5-7" `, lift
`acrolls/packages/mdsvex/src/code-meta.ts` verbatim — it parses `filename`, `lineNumbers`, `wrap`,
`highlight`, `focus`, `add` and `remove` into `Set<number>`s with proper range validation. Apply them
in Shiki's `line(node, n)` transformer rather than acrolls' regex post-processing:

```ts
line(node, n) {
  node.properties['data-line'] = String(n);
  if (meta.highlight.has(n)) node.properties['data-highlighted'] = '';
  if (meta.add.has(n)) node.properties['data-diff'] = 'add';
  if (meta.remove.has(n)) node.properties['data-diff'] = 'remove';
}
```

The alternative — `rehype-pretty-code` (shadcn-svelte) — gives all of this for free but brings its own
opinions about markup (`<figure data-rehype-pretty-code-figure>`). Take it if you are already on a
rehype pipeline; hand-roll if you want to own the DOM.

---

## 8. Checklist

- [ ] `shiki.server.ts` — the `.server` suffix is the guard against client leakage
- [ ] `createHighlighterCore` + `createJavaScriptRegexEngine`, explicit theme/lang imports
- [ ] Module-level singleton promise; `Map` cache keyed on language + code
- [ ] `defaultColor: false` with a `{ light, dark }` pair
- [ ] `.shiki` styled **once**, globally; `background: transparent !important`
- [ ] Overflow container, `tabindex="0"` on the `<pre>` for keyboard scrolling
- [ ] Copy button copies the raw string prop, not scraped DOM text
- [ ] `:focus-visible` reachable on a hover-revealed copy button
- [ ] `prerender = true` on docs routes so highlighting is build-time
- [ ] Language allowlist + alias map + escaped fallback for unknown fences
- [ ] Client bundle clean: `grep -rn "from 'shiki" src/` returns nothing outside `*.server.ts`

Worth stealing from fractalcodex: `scripts/check-shiki-contract.mjs`, a CI script that greps for
`defaultColor: false`, the `--shiki-dark` CSS variable, and every fence language used across the docs,
failing the build when one drifts.

## Sources

- `shadcn-svelte-main/docs/src/lib/highlight-code.ts`, `docs/mdsx.config.js`
- `fractalcodex/src/lib/docs/shiki.server.ts`, `scripts/check-shiki-contract.mjs`
- `markgraphy/src/site/lib/highlight.ts`, `src/routes/(site)/docs/+layout.svelte`, `vite.config.ts`
- `acrolls/packages/mdsvex/src/{highlighter,code-meta,rehype-code}.ts`
- `fractalsvelte/src/lib/highlighter.ts`, `src/lib/styles/code-snippet.sass` — dual-theme CSS, and the client-side warning
