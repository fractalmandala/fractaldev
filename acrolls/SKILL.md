# Acrolls skill

Use when integrating or authoring publication content with **Acrolls** on SvelteKit.

## Install

Install the public package from the SvelteKit host root:

```bash
pnpm add acrolls@latest
```

Do not add direct `@acrolls/*`, clone, workspace, or `file:` dependencies. See
`docs/local-install.md`.

## Wire SvelteKit

1. Pass `createAcrollsMdsvexPreprocessor()` from `acrolls/mdsvex`, plus extensions `.svx` and `.md`, to `sveltekit()` in `vite.config.ts`. Use `onInvalidDocument: 'error-page'` only for an explicitly chosen migration corpus.
2. Import `acrolls/styles/default.css` (or `foundation.css`) in root layout.
3. Wrap article content with `Publication` or use the provided mdsvex layout.
4. Write content as `.md` / `.svx` with optional YAML frontmatter.

## Primitives in content

```md
---
title: Peer state
description: How peers negotiate
---

<Callout variant="insight" title="Note">
  Something important.
</Callout>

```ts filename="src/peer.ts" lineNumbers highlight="2-3"
export type State = 'choked' | 'interested';
```
```

Use `Figure`, `Banner`, `Video` as imported Svelte components in `.svx` or via mdsvex components map.

## CLI

Run the CLI supplied by the installed package:

```bash
pnpm exec acrolls validate ./content/article.md
pnpm exec acrolls studio ./content/article.md
```

## Invariants

- Source file is authoritative.
- Host owns chrome, routing, theme toggle.
- Prefer foundation mode when host already styles prose.
- Never invent a second document store in Studio.
