# fractalpop

Lightweight, **Svelte-first** syntax highlighting with first-class **indented Sass**. Returns HTML without a DOM, so it runs in browsers, Node, edge, and at build/SSR time - server and client emit identical markup (no SvelteKit hydration mismatch). Replicates the [Sugar High](https://github.com/huozhi/sugar-high) package. 

Built with 🩷 for Sveltekit.

Run the demo: `pnpm --filter @fractalpop/demo dev`.
Developer documentation lives in [`docs/`](./docs/README.md) — an overview plus a page per package.

## Packages

| Package | npm | Status |
| --- | --- | --- |
| Core engine + languages | `fractalpop` | **0.1.0 - 32 languages** incl. indented **sass**, scss, the **`.svelte` composite** (script=TS + markup + `<style lang="sass">`), ts/js+jsx, css, html, markdown, diff + 22 general |
| Svelte / SvelteKit | `@fractalpop/svelte` | **0.1.0** - `<Highlight>`, `<Code>`, `<Editor>`, `<FileTree>` + `use:fractalpop` action, SSR-verified |
| mdsvex (`.svx`) | `@fractalpop/mdsvex` | **0.1.0** - highlighter hook, Svelte-char escaping, fence-meta lines (verified against real mdsvex) |
| remark (`.md` + `.mdx`) | `@fractalpop/remark` | **0.1.0** - remark plugin, one plugin for md + mdx, fence-meta lines (verified through the remark pipeline) |

### Levels
- **L1** (sugar-high parity + Svelte + mdsvex demonstrated): **done** - 32 languages; `<Highlight>` SSR-renders; real mdsvex compile runs the highlighter.
- **L2** (L1 + indented SASS demonstrated): **done** - Sass tokenizer passes its suite and renders through both the Svelte component and mdsvex.

## Quick use (core)

```ts
import { highlight } from 'fractalpop'

const html = highlight('const ready = true', { lang: 'ts' })
// <span class="fp__line">…<span class="fp__token--keyword" style="color:var(--fp-keyword)">const</span>…
```

> **Note.** The default `fractalpop` entry only registers **TypeScript** and **plaintext**. If you highlight other languages, use `fractalpop/full` (all 32 languages) or register them yourself (see [Registry utilities](#registry-utilities)).

### Entry points

| Import | What you get |
|---|---|
| `fractalpop` | TypeScript + plaintext only, tiny bundle. |
| `fractalpop/full` | All 32 languages registered up front. |
| `fractalpop/core` | `parse`, `tokenize`, `render`, `generate` — no language registration. |
| `fractalpop/lang` | Language metadata registry. |
| `fractalpop/lang/*` | Individual language configs (tree-shakeable). |
| `fractalpop/gpu` | Async WebGPU path via optional peer `gpu-lexer`. |

### Registry utilities

```ts
import { registerLanguage, setDefaults, importDefaults, canonicalizeLang } from 'fractalpop'

registerLanguage({ id: 'python', extension: 'py', aliases: ['python3'] }, pythonConfig)
setDefaults({ python: pythonConfig, rust: rustConfig })
await importDefaults(['python', 'rust'])
canonicalizeLang('tsx') // 'typescript'
```

Theme by setting the CSS variables the token types map to:

```css
:root {
  --fp-keyword: #c678dd;
  --fp-string: #98c379;
  --fp-comment: #7f848e;
  /* --fp-identifier, --fp-class, --fp-property, --fp-entity, --fp-sign … */
}
.fp__line--highlighted { background: #ffffff10; }
```

## Develop

```sh
pnpm install
pnpm --filter fractalpop test
pnpm --filter fractalpop build
```

## Status

The original M1–M5 plan (SPEC §14) is shipped:

- **M1 Engine + Sass** - done. Zero-DOM engine (`tokenize`/`assemble`/`render`/`generate`), indented Sass + SCSS.
- **M2 Svelte/SvelteKit** - done. `<Highlight>`/`<Code>`/`<Editor>`/`<FileTree>` + action, and the real `.svelte` composite lexer.
- **M3 doc adapters** - done. `@fractalpop/mdsvex` (`.svx`) and `@fractalpop/remark` (`.md` + `.mdx`), both verified through their real pipelines.
- **M4 language breadth** - done. 32 languages, incl. a full JS/JSX/TS/regex/template runtime.
- **M5 themes + docs/playground** - done. `apps/demo` (SvelteKit) replicates the landing, `/theme`, and `/sveltekit` pages; 22 themes (8 hand-tuned + 14 base24). Bundle sizes measured (core lexer ~1.8 KiB gzip, full pack ~10 KiB gzip); no cross-library speed comparison yet.

**Remaining (real features, not stubs):** a cross-library benchmark harness; an agent skill; publish to npm. The optional WebGPU entry via [gpu-lexer](https://gpu-lexer.vercel.app) is implemented behind `fractalpop/gpu` as an async, optional-peer path.

MIT.
