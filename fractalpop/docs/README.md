---
title: fractalpop developer docs
description: Developer documentation for the fractalpop monorepo — engine, components, adapters, and publishing.
type: docs
---

# fractalpop developer docs

fractalpop is a lightweight, Svelte-first syntax highlighter. It turns source
code into an HTML string without touching the DOM, so it runs in browsers,
Node, edge runtimes, and at build or SSR time - the server and the client
produce identical markup, which means no SvelteKit hydration mismatch.

These docs are for developers working **on** fractalpop (the monorepo) and
developers **using** the packages. Each package has its own page:

| Package | Path | What it does |
| --- | --- | --- |
| [`fractalpop`](./core.md) | `packages/core` | The engine and 32 language presets. `highlight()` returns HTML. |
| [`@fractalpop/svelte`](./svelte.md) | `packages/svelte` | `Highlight`, `Code`, `Editor`, `FileTree` components + the `fractalpop` action. |
| [`@fractalpop/mdsvex`](./mdsvex.md) | `packages/mdsvex` | Highlighter hook for mdsvex (`.svx`). |
| [`@fractalpop/remark`](./remark.md) | `packages/remark` | remark plugin for `.md` and `.mdx`. |

## Guides

- [Building SvelteKit packages and libraries](./building-sveltekit-libraries.md)
  — architecture, monorepo setup, build tools, Svelte 5 component patterns,
  testing, publishing, and the gotchas this project hit.

## How highlighting works

The engine runs three pure stages. Every stage is a plain function with no
shared state, which is what keeps the output deterministic.

```
source ──tokenize──▶ [ [type, value], … ] ──assemble──▶ { value, lines[] } ──render──▶ HTML string
                                                                             └▶ generate──▶ hast-like AST
```

- **tokenize** scans the source once and emits `[numericType, value]` pairs.
  A language is a config object; complex languages supply a full `tokenize`
  override (this is how CSS, Sass, and the Svelte composite work).
- **assemble** splits the flat token stream into lines, so line highlighting is
  a per-line class.
- **render** joins the lines into an HTML string. **generate** builds a
  hast-like tree instead, which is what the remark adapter consumes.

Tokens carry a type from a small, fixed list. That list is the theming
contract: each type maps to one CSS variable, `--fp-<type>`, and one class,
`fp__token--<type>`. See [the core docs](./core.md#theming) for the full set.

## Repository layout

The repo is a pnpm workspace.

```
fractalpop/
├─ packages/
│  ├─ core/      → fractalpop          (engine + languages, zero deps)
│  ├─ svelte/    → @fractalpop/svelte  (components + action)
│  ├─ mdsvex/    → @fractalpop/mdsvex  (.svx highlighter hook)
│  └─ remark/    → @fractalpop/remark  (.md / .mdx plugin)
├─ apps/
│  └─ demo/      → SvelteKit playground + docs site (private)
├─ docs/         → these pages
├─ SPEC.md       → the design spec
└─ pnpm-workspace.yaml
```

Everything is authored in TypeScript. `fractalpop` and the adapters build with
[`bunchee`](https://github.com/huozhi/bunchee); `@fractalpop/svelte` builds with
`svelte-package`.

## Getting started

You need [pnpm](https://pnpm.io) (the repo pins `pnpm@11.20.0`) and Node 18+.

1. Install dependencies from the repo root:

   ```sh
   pnpm install
   ```

2. Build every package (produces each `dist/`):

   ```sh
   pnpm -r build
   ```

3. Run the test suites:

   ```sh
   pnpm -r test
   ```

The demo app imports the built packages (including `@fractalpop/mdsvex` in its
`svelte.config.js` and `@fractalpop/remark` in a route), so build everything
before starting it:

```sh
pnpm -r build
pnpm --filter @fractalpop/demo dev
```

The demo serves on <http://localhost:5178> and doubles as live package usage:

- `/` — the playground (all 32 languages, 22 themes)
- `/theme` — theming and the indented-Sass showcase
- `/sveltekit` — the `Highlight`, `Code`, `Editor`, and `FileTree` components
- `/mdsvex` and `/md` — `@fractalpop/mdsvex` highlighting `.svx` and `.md`
- `/remark` — `@fractalpop/remark` rendering Markdown through a real pipeline

> **Note on running tests directly.** `pnpm test` runs a pre-install check that
> can trip on unapproved native build scripts. If that happens, run Vitest
> directly inside a package: `node ../../node_modules/vitest/vitest.mjs run`.

## Working on a single package

Use pnpm filters to scope commands to one package.

```sh
pnpm --filter fractalpop test        # test the core engine
pnpm --filter @fractalpop/svelte build
pnpm --filter @fractalpop/remark test
```

## Adding a language

Languages live in `packages/core/src/lang/`. A language is either a keyword
config or a custom tokenizer. See
[Adding a language](./core.md#adding-a-language) for the full procedure.

## Publishing

The three public packages (`fractalpop`, `@fractalpop/svelte`,
`@fractalpop/mdsvex`, `@fractalpop/remark`) publish together from the root.
pnpm rewrites the `workspace:^` dependencies to real version ranges.

1. Build and test everything:

   ```sh
   pnpm -r build && pnpm -r test
   ```

2. Authenticate and publish:

   ```sh
   npm login
   pnpm -r publish --access public
   ```

`pnpm -r publish` walks the packages in dependency order (core first) and skips
any package whose version is already on the registry, so it is safe to re-run.

> **Note.** The `@fractalpop/*` scope requires an npm organization named
> `fractalpop`. Create it once at <https://www.npmjs.com/org/create> before the
> first scoped publish.

## Conventions

- **CSS variables** are namespaced `--fp-*` so a consumer's own variables never
  collide.
- **Token classes** are `fp__token--<type>`; each line is `fp__line`, and a
  highlighted line adds `fp__line--highlighted`.
- **No runtime dependencies** in `fractalpop`. The adapters depend only on
  `fractalpop` plus their host (`unist-util-map` for remark).

## Next steps

- Use the engine directly: [`fractalpop`](./core.md)
- Highlight in a Svelte app: [`@fractalpop/svelte`](./svelte.md)
- Highlight Markdown or MDX: [`@fractalpop/remark`](./remark.md)
- Highlight `.svx`: [`@fractalpop/mdsvex`](./mdsvex.md)
