# AGENTS.md — Acrolls

Context for any coding agent working on **Acrolls** (`/Users/amrit/fractalmandala/acrolls`).

## What this is

**Acrolls** = SvelteKit publishing + docs framework (Fumadocs-class for Svelte).

- **Not** a CMS, not a hosted product, not part of the mandala monorepo.
- Hosts keep routing, auth, deploy; Acrolls owns article compile, publication UI, docs chrome.

## Tech stack

- pnpm workspaces, Node ≥ 20.19  
- Svelte 5 (runes), SvelteKit 2.62+ / 3
- mdsvex + remark-gfm + rehype-slug + Shiki  
- TypeScript, tsup for TS libs, `svelte-package` for Svelte packages  
- Apache-2.0  

## Packages

| Package | Purpose |
|---|---|
| `@acrolls/mdsvex` | Compile: GFM, slugs, tables, Shiki, fence meta, `renderAcrollsArticleHtml` |
| `@acrolls/svelte` | `Publication`, Callout, Figure, Banner, Mermaid enhance |
| `@acrolls/styles` | `foundation.css`, `default.css`, SASS tokens |
| `@acrolls/docs` | Docs shell: nested nav, TOC, breadcrumbs, pager, persist |
| `@acrolls/cli` | validate, studio, integrate, init, docs init |
| `@acrolls/sveltekit` | Internal bundled Kit helper exposed as `acrolls/sveltekit` |
| `acrolls` | Public package, all supported `acrolls/*` entrypoints, and CLI |

## Commands

```bash
cd /Users/amrit/fractalmandala/acrolls
pnpm install
pnpm build
pnpm --filter @acrolls/docs test
pnpm --filter @acrolls/example-kit dev
pnpm dev:ui
./packages/cli/dist/index.js validate examples/starter/article.md
./packages/cli/dist/index.js studio examples/starter/article.md
```

External hosts install only `acrolls` from npm. Internal scoped packages are bundled
implementation units, not consumer dependencies.

## UI playset (temporary, dev-only)

The repo root is a minimal SvelteKit app for visually composing the Acrolls UI
(`pnpm dev:ui`). It renders `docs/playset/` (dummy docs-shaped Markdown) through the real
content engine via `src/lib/demo/source.ts`; the kit config lives in `vite.config.ts`
(no `svelte.config.js`), and `serve`-only aliases re-point `@acrolls/*` to package sources for
HMR. Nothing at the root is built or published — the pack root is `packages/acrolls/` and its
`files` allowlist cannot see the repo root. Do not wire root demo code into packages.

## Conventions

- Prefer **mdsvex** `.md` / `.svx` over inventing a content format  
- Article body always under **`Publication`** for client enhancers  
- Docs chrome via **`DocsShell`** + `DocsNav` config (data-driven nav)  
- No default mdsvex layout that wraps every site `.md` — scope Publication to blog/docs routes  
- Avoid frontmatter key `metadata` (clashes with mdsvex export); use `reading`  
- Escape `{`/`}` in Shiki HTML for Svelte compile  
- Do not add direct `@acrolls/*`, workspace, clone, or `file:` dependencies to external hosts

## Boundaries

- **Do not** couple product design to mandala or dharmalib conventions as hard requirements  
- **Do not** require dharmalib commits for Acrolls progress  
- **Do not** claim npm publish until packages are deliberately released  
- Themes and the Acrolls site remain later product work

## Canonical docs for humans (and agents integrating hosts)

**Start:** `docs/README.md`  

Then: `getting-started.md`, `local-install.md`, `integrate-sveltekit.md`, `docs-shell.md`, `content-authoring.md`, `cli.md`, `troubleshooting.md`, `checklist.md`, `snippets/*`.

Product intent: `docs/VISION.md`, root `PRODUCT.md`, `TECH.md`.

## Patterns to follow

- Nested nav: `DocsNavNode.children` in `@acrolls/docs`  
- Open state: `localStorage` key `acrolls-docs:open:<storageKey>`  
- TOC: `scanHeadings` on shell article root after mount  
- Studio: HTML pipeline via `renderAcrollsArticleHtml`, not full SVX execute  

1. You can only use SASS single-tab indented styling, not SCSS not CSS. No curly braces no semicolons
2. No inline-styling with `style=""` method allowed.
3. No styling in .svelte pages and components with `<style>` tags allowed.
4. For rules on styling, read - [Fractalstyler Rules](/Users/amrit/fractalmandala/fractalstyler2/AGENTS.md)
5. You CANNOT create new classes without explicit user approval.
6. Any classes you absolutely must create, after user approval, must be created as `page-name.sass` or `component-name.sass` and kept in [styles folder](src/lib/styles), and imported into that page or component directly.
7. See section `## YAML Frontmatter`
8. See section `## Construction Architecture`
9. GEMINI - save your `walkthrough` documents in `docs`, name them according to actual subject of walkthrough.
10. If a new doc is created, add it to the registry of docs at [index.md](docs/index.md). See section `## Discovery Guide` below.
11. See `fractalstyler` and `fractalthemer` setup section below, if these packages are not yet installed

## YAML Frontmatter

Markdown documents created and placed inside `docs` folder or inside `src` folder must contain minimum YAML frontmatter. File names must be in lower case kebab-case - `kebab-case.md` as example.

```YAML
---
title:
description:
tags:
  - ...tag1
  - ...tag2
  - ...
---
```

> Exception is index.md files, which do not need tags.
