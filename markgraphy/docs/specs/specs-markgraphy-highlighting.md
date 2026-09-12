---
title: Markgraphy build-time shiki highlighting
description: Why shiki is a build-time site dependency only — the npm package stays zero-dependency, snippets are pre-rendered at build time.
type: markgraphy
---

# Specs: build-time shiki syntax highlighting (site)

Status: implemented — pending user evaluation (2026-08-30)

## The question this task started from

> Should the package itself have shiki highlighting? The site part definitely should, coz in frontend we are showing code snippets - they must have shiki highlighting.

**Answer: the npm package does NOT get shiki. The site does.**

- The published package's own `package.json` description is "Zero dependencies". Shiki is a large
  build-time dependency (TextMate grammars + onig wasm); adding it to the library would break that
  promise and ship megabytes to every consumer for a feature they may not want.
- The graphs render into plain `<pre>` frames. A consumer who wants highlighted *content inside a
  graph* can nest their own shiki output — the library never needs to know about highlighters.
- Shiki on the site is a **build/dev-time concern only**: it lives in `src/site`, is imported by
  server loads and the mdsvex config, and never reaches the client bundle (evidence below).

## What was implemented

### 1. Core module — `src/site/lib/highlight.ts`

Follows the canonical shiki + mdsvex recipe (shiki.style Svelte guide; confirmed against
published step-by-step guides for SvelteKit + mdsvex):

- `createHighlighter` singleton created once at module level (guides note per-call highlighter
  creation slows builds 3x; singleton is the recommended pattern).
- Limited langs: `svelte, typescript, bash, css, json, markdown` (recommendation: only load what
  the site needs).
- Custom theme `markgraphy` built on the site's CSS variables so code re-themes with the
  accent picker at runtime: transparent background, base `var(--text-secondary)`, strings/constants
  `var(--graph-accent, oklch(0.78 0.17 155))`, keywords/tags/functions/headings `var(--text-primary)`,
  comments `color-mix(in oklab, var(--text-secondary) 65%, transparent)`.
- `highlight(code, lang)` → shiki HTML (falls back to `text` on unknown lang).
- `mdsvexHighlighter(code, lang)` for mdsvex: returns `` `{@html `${escapeSvelte(html)}`}` `` —
  the exact contract mdsvex expects for a custom highlighter (verified against mdsvex dist:
  the default Prism wrapper does not apply to custom highlighters; their return string is
  injected raw).

### 2. mdsvex fences (.svx markdown) — `vite.config.ts`

`mdsvex({ extensions: ['.svx'], highlight: { highlighter: mdsvexHighlighter } })`. Highlighting
happens when the markdown compiles; the shiki HTML becomes a compile-time constant in the page.

### 3. Server loads (build/prerender-time highlighting for the site's own snippets)

The site's snippets are TS template strings, not markdown, so they are highlighted in
`+page.server.ts` loads — same build-time philosophy, no client runtime:

| Route | File | Highlighted |
| --- | --- | --- |
| `/docs/[slug]` (46 pages + frame) | `src/routes/(site)/docs/[slug]/+page.server.ts` | every preview snippet + `graph-frame` frame code (`previews.ts`, 1166-line module) |
| `/docs/installation` | `src/routes/(site)/docs/installation/+page.server.ts` | layout / page / .svx / accent snippets (`src/site/docs/install-code.ts`) |
| `/docs/skill` | `src/routes/(site)/docs/skill/+page.server.ts` | per-agent install commands (bash), example prompts, full SKILL.md (markdown) (`src/site/docs/skill.ts`) |
| `/docs/examples` | `src/routes/(site)/docs/examples/+page.server.ts` | recipe usage blocks |

`/docs/[slug]` merges the old universal `+page.ts` into the server load (SvelteKit generated
`PageData` from the universal load only, so server data was invisible to the component while both
existed). `entries()` + `prerender = true` preserved.

### 4. Components (new html prop, plain-text fallback kept)

- `src/site/components/docs/code-block.svelte` (new): `code` + optional `html` — renders
  `{@html html}` when present, plain escaped `<pre><code>` otherwise; CopyCode overlay kept.
- `src/site/components/docs/preview.svelte`: forwards `html` to CodeBlock.
- `src/site/components/docs/recipe-card.svelte`: optional `usageHtml` prop (scenarios cards hide
  the usage block by design).
- Skill page: snippet signature grew an optional `html` param; `.block-pre :global(pre)` reset
  added (container keeps `overflow-x: auto`; `.wrap` still controls wrapping).

## Why no shiki reaches the browser

- Highlighted HTML is produced during prerender/SSR and ships as markup or serialized load data.
- Client chunks for the `[slug]` pages contain **zero** `shiki` occurrences (checked
  `nodes/9`, `nodes/13`, `nodes/15` in the built client output).
- The only shiki strings inside client JS are compile-time constants of compiled `.svx` pages
  (the markdown fences themselves) — no shiki code, just their static HTML.

## Verification (evidence)

- `pnpm check` — 0 errors, 0 warnings.
- `pnpm build` — succeeds; highlighter code compiled into the server chunk (`chunks/highlight.js`).
- Prerendered output: 47/47 `[slug]` pages contain `class="shiki markgraphy"` blocks with
  `background-color:transparent;color:var(--text-secondary)`; accent-colored token spans present;
  `graph-frame` carries its frame block.
- Dev server: `/docs/installation` 4 blocks, `/docs/skill` 9 (4 for the selected agent + 4
  example prompts + SKILL.md; other agents swap client-side), `/docs/examples` 6 (scenario cards
  hide usage by design), `/docs/graph-flow` and `/docs/graph-frame` 1 each.
- Screenshots: `qa-screenshots/shiki-graph-flow.png`, `shiki-installation.png`, `shiki-skill.png`,
  `shiki-examples.png`.
- Dependency: `shiki@^4.4.3` declared in `devDependencies` (build-time only).

## How to evaluate

1. Dev server is running at http://localhost:5174 (it was down; started during verification —
   stop it if you restart your own).
2. Look at http://localhost:5174/docs/graph-flow — the "copy code" block should show syntax
   colors; press an accent dot in the header and watch code strings re-color live.
3. http://localhost:5174/docs/installation and /docs/skill — bash/markdown/svelte blocks colored.
4. `curl -s http://localhost:5174/docs/graph-flow | grep -c 'class="shiki'` → 1; view-source shows
   inline token colors (nothing highlights in the browser).
