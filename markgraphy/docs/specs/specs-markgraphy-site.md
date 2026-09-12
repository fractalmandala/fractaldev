---
title: Markgraphy docs-site conventions
description: Binding conventions for src/site and src/routes — scope rules, class tokens, motion, accessibility, and how pages compose.
type: markgraphy
---

# Markgraphy docs-site conventions

Binding rules for everything under `src/site/` and `src/routes/`. The library
itself (`src/lib/`) is FROZEN — never edit it, only import from it.

## Stack & aliases

- SvelteKit 2 + Svelte 5 runes, TypeScript strict. Dev server: port 5174.
- `$lib` → `src/lib` (the npm package: `Graph*.svelte`, frame, motion).
- `$site` → `src/site` (docs-site code: components, lib, docs data).
- Routes live in `src/routes/`. mdsvex preprocesses `.svx` files.
- No Tailwind. No shadcn. No new dependencies (the only site deps are
  `@fontsource/geist-mono` and `mdsvex`). No syntax highlighters.

## Svelte 5 rules

- Props: `let { ... }: Props = $props();` with defaults in destructuring.
- Values derived from props → `$derived` / `$derived.by`. Never plain `const`
  captures of props (triggers `state_referenced_locally`).
- Slots are snippets: `let { children }: { children: Snippet } = $props()`
  rendered with `{@render children()}`.
- One default component per file; shared types via `<script module lang="ts">`.
- Events are DOM attributes: `onclick`, not `on:click`.

## Scoped CSS contract

- All styling is scoped `<style>` inside each `.svelte` file or in
  `src/site/app.css` (global chrome/animation only).
- Class names are STATIC tokens. Conditional styling ONLY via
  `class:name={boolean}` directives. Interpolated class strings get scoped
  selectors pruned — do not ship them.
- Inline styles: only `style:background={accent.swatch}`-style data-driven
  values (swatches). Nothing else.
- Zero margins on `p`, `h1-h6`, `ul`, `dl` you render — set `margin: 0`
  explicitly (no Tailwind preflight).

## Design tokens (from src/site/app.css)

| Token | Use |
| --- | --- |
| `--bg` | page background (oklch 0.11) |
| `--text-primary` | primary text (oklch 0.86) |
| `--text-secondary` | secondary text (oklch 0.62) |
| `--text-muted` | subtle fill (selected swatch, hover chips) |
| `--border` | dashed rules, hairlines, inset borders |
| `--site-max` | 72rem content max-width |
| `--graph-accent` / `-2` / `-3` | accent trio — driven by the accent picker |
| `--border` | graph frame dashes |

Site renders DARK-FIRST (`data-graph-theme="dark"` on `<html>` in app.html).
Never introduce light-theme logic.

Font: Geist Mono everywhere (imported in +layout.svelte). Body base size is
the browser default 1rem; headings use 1.5rem–3rem, tracking -0.025em.

## Existing site components — REUSE, don't recreate

`$site/components/`: `SiteRule.svelte` (`orientation`, `placement`),
`SiteCorners.svelte` (`corners`, `mark`, `tone`; exports `type Corner`),
`SiteContainer.svelte` (`borderTop`, `corners`, `children` — dashed-rail
section wrapper), `AccentPicker.svelte` (`compact`), `Header.svelte`,
`Footer.svelte`, `Hero.svelte`, `Principles.svelte`.
`$site/lib/`: `site.ts` (SITE_NAME, SITE_DESCRIPTION, SITE_URL, GITHUB_URL,
NPM_URL), `accents.ts` (accents, setAccent, ACCENT_EVENT, DEFAULT_ACCENT_ID).

## Motion

Entrances use the library's own action:
`import { reveal, stagger } from '$lib/frame/motion';`
`use:reveal={{ delay: stagger(i, 40), amount: 0.4 }}`. Transform+opacity only,
reduced-motion is handled inside the action. No CSS keyframe entrances.

## Content rules

- Graph usage in docs imports from the package path exactly as users will:
  `import { GraphStat } from 'markgraphy'`. In live preview components,
  import from `$lib` instead (same components, no self-dependency).
- Component names in prose: lowercase with space ("graph stat"), titles in
  frames are UPPERCASE 1–2 words.
- All 29 graphs + frame are implemented — catalog/docs may reference every
  one. Component prop APIs live in `src/lib/graphs/Graph<Name>.svelte`
  (`<script module>` interfaces) and are re-exported from `$lib` (index.ts).
- Reference implementation for every page: `ref/app/…` and
  `ref/components/…`. Port structure and copy; swap React/Next/shadcn
  specifics for the Svelte equivalents above. Rewrite shadcn-copy mentions
  (e.g. "copy the source into your shadcn project") to npm-install language:
  "install from npm, import into any SvelteKit app".

## Parallel-agent hygiene

- Only create/modify files in YOUR assigned list. Other agents own the rest.
- `pnpm check` may show diagnostics from another agent's in-progress files —
  ignore those; fix and report only YOUR files.
- Do not import modules owned by other agents (list in your brief). Build
  self-contained files.
