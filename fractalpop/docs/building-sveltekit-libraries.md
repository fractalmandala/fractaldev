---
title: Building SvelteKit packages and libraries
description: Field guide to shipping a Svelte/SvelteKit library, drawn from building fractalpop.
type: docs
---

# Building SvelteKit packages and libraries

This is a field guide to shipping a Svelte/SvelteKit library, drawn from
building fractalpop — a zero-dependency engine (`fractalpop`), a Svelte 5
component package (`@fractalpop/svelte`), and two content adapters
(`@fractalpop/mdsvex`, `@fractalpop/remark`), plus a SvelteKit demo that
consumes all of them.

It is opinionated and concrete: every guideline here is something the build
actually depended on, and every "gotcha" is one that actually cost time. Use it
as a checklist and a source of copy-paste config.

## Contents

- [Architecture: split the engine from the framework](#architecture-split-the-engine-from-the-framework)
- [Monorepo setup](#monorepo-setup)
- [Choosing a build tool per package](#choosing-a-build-tool-per-package)
- [Authoring Svelte 5 components for a library](#authoring-svelte-5-components-for-a-library)
- [Designing the public API](#designing-the-public-api)
- [Theming without a JS runtime](#theming-without-a-js-runtime)
- [Integrating with mdsvex](#integrating-with-mdsvex)
- [Writing a remark plugin](#writing-a-remark-plugin)
- [Testing](#testing)
- [The demo app: dogfood everything](#the-demo-app-dogfood-everything)
- [Packaging and publishing](#packaging-and-publishing)
- [The consumer smoke test — the mandatory "done" gate](#the-consumer-smoke-test--the-mandatory-done-gate)
- [Gotchas worth remembering](#gotchas-worth-remembering)
- [Process guidelines](#process-guidelines)

## Architecture: split the engine from the framework

The single most useful decision was keeping the **logic** (a framework-agnostic
engine that returns a string) separate from the **framework bindings** (Svelte
components) and the **integrations** (mdsvex, remark).

- The engine has **zero runtime dependencies** and touches no DOM. It is
  testable in plain Node, reusable in React or Astro, and trivial to reason
  about.
- The Svelte package is a **thin wrapper** — it renders the engine's output and
  adds ergonomics (components, actions, theming props).
- The adapters are **thinner still** — they call the engine and adapt its output
  to a host contract (mdsvex's `highlighter` hook, a remark transformer).

Guideline: **push everything that does not need Svelte out of the Svelte
package.** A binding you can delete and re-derive from the core is a good
binding. It keeps the framework package small and makes the core independently
useful.

A second decision that paid off everywhere: the engine returns **deterministic
output with no DOM and no randomness**. That means server-rendered and
client-rendered markup are identical, so there is no hydration mismatch and the
work can run at build time. Design for determinism early.

## Monorepo setup

Use a pnpm workspace. It gives you `workspace:^` linking (local packages resolve
to each other during development) and `pnpm -r` (run a script across every
package).

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

Lay packages out by role, not by feature:

```
packages/
  core/      → the engine (zero deps)
  svelte/    → components + actions
  mdsvex/    → .svx adapter
  remark/    → .md / .mdx adapter
apps/
  demo/      → a SvelteKit app that consumes the packages (private)
```

Cross-package dependencies use the workspace protocol; pnpm rewrites it to a
real range at publish time:

```json
"dependencies": { "fractalpop": "workspace:^" }
```

Keep the demo app **private** (`"private": true`) so it is never published, and
put your one shared `tsconfig.base.json` at the root for packages to extend.

## Choosing a build tool per package

There is no single build tool for a Svelte monorepo. Match the tool to the
package.

- **Plain TypeScript packages** (the engine, the adapters): use
  [`bunchee`](https://github.com/huozhi/bunchee). It reads your `exports` map,
  emits ESM plus `.d.ts`, treats dependencies as external, and needs almost no
  config. Point `main`/`types`/`exports` at `dist/`.
- **The Svelte component package**: use
  [`@sveltejs/package`](https://kit.svelte.dev/docs/packaging) (`svelte-package`).
  It compiles `.svelte.d.ts` types and copies components so consumers' own Vite
  compiles them.

Two `svelte-package` requirements that are easy to miss:

1. It packages `src/lib` by default. If your source is in `src/`, pass the
   input/output explicitly:

   ```jsonc
   "scripts": { "build": "svelte-package -i src -o dist" }
   ```

2. It runs `svelte2tsx`, which **requires a `tsconfig.json` in the package**.
   Without one it fails with "Failed to locate tsconfig or jsconfig". Add a
   minimal one that extends your base.

Declare the `svelte` export condition so bundlers pick the component source:

```json
{
  "svelte": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "peerDependencies": { "svelte": "^5.0.0" }
}
```

## Authoring Svelte 5 components for a library

Svelte 5 runes are the right foundation for a component library, but a few
patterns matter when the components are consumed by others.

- **Props via `$props()`**, with a typed `Props` interface. Make the
  two-way-bound props `$bindable()` (for example an editor's `value`), and expose
  callbacks as plain props (`onchange`, `onactivefilechange`) rather than
  `createEventDispatcher`.
- **Snippet props for customization.** A `Snippet<[T]>` prop lets consumers
  inject markup. fractalpop's `FileTree` takes an `icon` snippet so an app can
  supply file-type-aware icons without the library shipping an icon set.
- **Actions for progressive enhancement.** Ship a `use:`-style action for
  client-only behavior (highlighting pasted text, for instance) alongside the
  declarative component.
- **Be SSR-safe.** Never assume `document`/`window` at module scope or during
  render; guard them, and do DOM work in `onMount` or event handlers. If your
  component injects HTML with `{@html}`, make sure the source is encoded by your
  own code — do not trust arbitrary input.

Two Svelte 5 gotchas this build hit:

- **`bind:this` cannot target a `Map` entry.** To keep references to a list of
  rendered nodes (for focus management in a tree), `bind:this={refs.get(id)}`
  silently does nothing. Use an action to register/unregister instead:

  ```svelte
  <script>
    const refs = new Map()
    function register(node, id) {
      refs.set(id, node)
      return { destroy: () => refs.delete(id) }
    }
  </script>

  <div use:register={item.id} ...>…</div>
  ```

- **Scoped styles do not reach `{@html}` content or dynamically classed nodes.**
  Svelte scopes component CSS to elements it statically sees. Markup you inject
  with `{@html}`, or classes on nodes the compiler cannot attribute, need
  `:global(...)` or a global stylesheet. A related bug: a `<pre>`'s default
  `white-space: pre` will render the newline **between** block-level line spans
  in addition to the block break, doubling the line spacing — set the container
  to `white-space: normal` and let each line span be `pre`.

## Designing the public API

- **Return a string from the core; wrap it everywhere else.** A string is the
  most portable output. Components inject it, adapters transform it, and it works
  at build time. Offer a lower-level entry (`/core`) that also returns a tree
  (hast-like AST) for pipelines that need nodes.
- **Use subpath exports for tree-shaking.** Ship each optional unit (here, each
  language) as its own module under `pkg/lang/*` so bundlers drop what an app
  does not import. Declare them in the `exports` map with a wildcard.
- **Give hooks a fast path.** fractalpop's `render` skips per-token object
  allocation entirely unless a customization hook is passed. Design your hot path
  so the common, un-customized call is the cheapest one.

## Theming without a JS runtime

Prefer **CSS custom properties** over a JS theme object passed through props and
recomputed on every render.

- Map each styleable thing to one namespaced variable (`--fp-keyword`,
  `--fp-line-highlight-color`, …). Namespacing prevents collisions with the
  consumer's own variables.
- A theme is then just a block of CSS the consumer drops in — no JS, no
  re-render. For dark mode, redefine the variables under a selector or media
  query.
- If you also want a typed theme object, provide a helper that turns it into an
  inline `style` string of those variables, and use `light-dark()` for a
  `{ light, dark }` pair so it follows the surrounding `color-scheme`.

This keeps the runtime tiny and lets the same theme style output produced by a
component, an mdsvex fence, and a remark node identically.

## Integrating with mdsvex

mdsvex highlights fenced code through a `highlight.highlighter(code, lang, meta)`
hook that returns an HTML string.

```js
// svelte.config.js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import { fractalpopHighlighter } from '@fractalpop/mdsvex'

const mdsvexConfig = {
  extensions: ['.svx', '.md'],
  highlight: { highlighter: fractalpopHighlighter },
}

export default {
  extensions: ['.svelte', '.svx', '.md'],
  preprocess: [mdsvex(mdsvexConfig), vitePreprocess()],
}
```

Three things that matter:

1. **Run mdsvex before `vitePreprocess`.** If `vitePreprocess` runs first, it
   scans the raw Markdown and treats a `<style lang="sass">` shown **inside a
   code fence** as a real style block — which fails unless a Sass compiler is
   installed. Running mdsvex first converts the Markdown and escapes the fence,
   so the false match never happens.
2. **Configure both `.svx` and `.md`** in mdsvex's `extensions` (and the
   top-level `extensions`) if you want Markdown files highlighted too.
3. **Escape Svelte-significant characters** (`{`, `}`, `` ` ``) in the
   highlighter's output, or the highlighted code will be reparsed as Svelte
   markup.

## Writing a remark plugin

A remark plugin is the framework-agnostic path — the same engine serves Astro,
Next MDX, Docusaurus, and a SvelteKit `load` function.

- Walk the mdast tree (for example with `unist-util-map`) and match `code`
  nodes. **MDX fences are the same `code` nodes as Markdown**, so one plugin
  covers both.
- Emit hast nodes via `data.hName`, `data.hProperties`, and `data.hChildren` so
  the mdast → hast transform keeps your markup.
- Parse fence meta (for example `{1,3-5}`) for line highlighting.
- **Document the `sanitize` gotcha.** `remark-html` and rehype sanitizers strip
  class names and inline styles by default, which erases all highlighting.
  Consumers must pass `{ sanitize: false }` or configure the sanitizer to allow
  your classes and styles.

## Testing

Use Vitest per package. The valuable tests fall into three kinds:

- **Unit tests** for the pure core: token arrays, line assembly, edge cases.
- **Fixture/snapshot tests** for anything grammar-like: input → expected output,
  with heavy coverage on the hard languages.
- **Real-pipeline tests** that run the actual host. Do not mock mdsvex or remark
  — run them:

  ```ts
  // remark, end to end
  const out = await remark().use(remarkFractalpop).use(html, { sanitize: false }).process(md)
  ```

  ```ts
  // mdsvex, end to end
  const { code } = await compile(svxSource, { highlight: { highlighter } })
  ```

**Test Svelte components on the server without a browser.** You can compile a
component to server output and render it headlessly, which is fast and needs no
jsdom:

```ts
import { compile } from 'svelte/compiler'
import { render } from 'svelte/server'
import { writeFileSync } from 'node:fs'

const { js } = compile(src, { generate: 'server', runes: true, filename: 'C.svelte' })
writeFileSync(tmp, js.code)
const Component = (await import(tmp)).default
const { body } = render(Component, { props: { code: 'const x = 1', lang: 'ts' } })
// assert on `body`
```

This also proves SSR output is what you expect, which is exactly the property a
zero-DOM library should guarantee.

> **Gotcha.** `pnpm test` can run a pre-install verification step that fails on
> unapproved native build scripts (esbuild, swc). If it blocks you, run Vitest
> directly inside the package: `node ../../node_modules/vitest/vitest.mjs run`.

## The demo app: dogfood everything

Ship a SvelteKit app under `apps/` that uses the packages exactly as a consumer
would. It is your best integration test and your documentation.

- **Build the packages before running the demo.** The app imports the built
  `dist/`, and — for a library like this — the config itself imports an adapter.
  Run `pnpm -r build` first, or the dev server fails to resolve.
- **Use the components; do not reimplement them.** It is tempting to call the
  core `highlight()` directly in the demo for convenience. Resist it. If your
  site advertises `<Editor>`, `<Code>`, and `<FileTree>`, the site should be
  built out of them. Reimplementing highlighting in the demo hides bugs the real
  components have and makes the demo a lie. When we switched the demo to render
  every code block through the shipped `<Code>`/`<Highlight>` components, it
  immediately surfaced real styling and theming behavior.
- **Capture a visual record headlessly.** To screenshot the finished UI
  reliably, drive the system browser with `puppeteer-core` (no Chromium
  download) and `fullPage: true`, rather than fighting an interactive preview
  pane:

  ```js
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  })
  ```

## Packaging and publishing

Get each publishable package's manifest right:

```json
{
  "name": "@scope/pkg",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,
  "license": "MIT",
  "types": "./dist/index.d.ts",
  "main": "./dist/index.js",
  "exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } },
  "files": ["dist"],
  "publishConfig": { "access": "public" },
  "repository": { "type": "git", "url": "git+https://github.com/you/repo.git", "directory": "packages/pkg" }
}
```

- `"files": ["dist"]` keeps source out of the tarball. npm always adds
  `LICENSE`/`README` regardless — put a `LICENSE` in **each** package so every
  tarball carries it.
- `"sideEffects": false` lets bundlers tree-shake your subpath exports. **Exception:** if an entry point does its work by running top-level side effects (for example `fractalpop/full`, which registers all languages at import time), list it explicitly — `"sideEffects": ["./dist/full.js"]` — or a bare `import 'pkg/full'` will be tree-shaken away and the registration never runs.
- `"publishConfig": { "access": "public" }` is required for scoped public
  packages.
- **Never point `exports` (`types`/`default`/`svelte`) at raw `.ts` / `.tsx` /
  `.svelte`.** Node cannot execute them and bundlers do not transpile
  `node_modules` by default, so a published consumer gets a broken import even
  though it "works" in your own repo (Vite compiles workspace source, hiding the
  defect). Compile every `.ts`/`.tsx`/`.svelte` package to `dist/` and point the
  entries there. The **one** exception is a core authored as `.js` + hand-written
  `.d.ts` — Node runs `.js` directly, so that package legitimately ships source
  and its `build` can be a no-op. Do not generalize that no-build pattern to the
  adapters; a `build` script that is an `echo` is a red flag that you did.

Publish the whole workspace in one command. pnpm walks packages in dependency
order, rewrites `workspace:^` to real ranges, and skips `private` packages and
versions already on the registry:

```sh
pnpm -r publish --access public
```

Before the first scoped publish, create the npm **organization** that matches
your scope, and check the names are free (`npm view <name>`; a 404 means
available). If your working tree is dirty, add `--no-git-checks` — or commit
first and keep the safety check.

## The consumer smoke test — the mandatory "done" gate

Before you call any package done, prove it works **outside the workspace**. This
is the single most important gate in this guide, and the one most often skipped —
because the monorepo lies to you. pnpm links workspace packages and Vite compiles
their raw source, so `import { Code } from '@scope/pkg'` resolves a `.ts` /
`.svelte` file fine in your example app and even in `vite build`. None of that
exercises what a real consumer does: `npm install` a tarball into a plain project
and import it with Node or a non-Vite bundler. **A package can be green
everywhere in-repo and completely broken on npm.** "The example app builds" is
not "the package works."

Make this the last step, every time:

```sh
# 1. build real tarballs — runs each package's real build, not an echo no-op
pnpm -r build
pnpm -r pack                        # → one @scope-pkg-0.1.0.tgz per package

# 2. install them into an empty dir OUTSIDE the workspace (no pnpm links, no Vite)
mkdir /tmp/consumer && cd /tmp/consumer && npm init -y
npm install /abs/path/to/*.tgz svelte react   # include the peer deps

# 3. import each entry the way a consumer will
node -e "require('@scope/remark')"                               # plain Node: is it runnable JS?
node --input-type=module -e "import('@scope/core').then(m => console.log(Object.keys(m)))"
# for components, compile once through a Vite-free path (svelte/compiler, or a plain bundler)
```

If step 3 throws `Unknown file extension ".ts"`, `Cannot use import statement`,
or `ERR_MODULE_NOT_FOUND` for `dist/…`, your package is exporting **source, not
build output**, or `files` omits `dist` — it is **not done**, no matter how green
the in-repo example is. This one gate catches the most common library defect
(shipping `.ts`/`.svelte` as the entry) and the second most common (a `dist`
that was never built or never included).

Wire it into CI so "done" is enforced, not remembered. The point is to move your
definition of done from *"it builds next to my source"* to *"a stranger can
install and use it."*

## Gotchas worth remembering

A concentrated list of things that cost real time.

- **Generating source files with `node -e '…'` strips single-quoted import
  paths.** The outer shell single-quotes eat the inner ones, producing
  `import x from ../mod` (no quotes) and a syntax error. Write generators to a
  temp file, or double-escape, or use a heredoc. This bit twice.
- **`svelte-package` needs a `tsconfig.json`** in the package, and packages from
  `src/` (not `src/lib`) need `-i src -o dist`.
- **`bunchee` auto-creates a `tsconfig.json`** the first time if one is missing —
  usually fine, but know it happens.
- **mdsvex preprocess order** (mdsvex before `vitePreprocess`) — see above.
- **Sanitizers strip highlighting** in remark/rehype pipelines.
- **Markdown links containing parentheses** — for example a path with a
  `(group)` route folder — break Markdown link parsing. Wrap the URL in angle
  brackets: `[text](<path/(group)/file>)`.
- **pnpm may write an `allowBuilds` placeholder** into `pnpm-workspace.yaml` for
  native deps; fill it with real booleans (`esbuild: true`) or builds stay
  blocked.
- **An interactive browser preview pane pauses rendering when hidden**, so
  scroll-and-screenshot silently returns blank frames. Capture headlessly for a
  reliable record.

## Process guidelines

These are not about SvelteKit specifically, but they shaped the result.

- **No throwing stubs.** A placeholder that exports a function which throws
  `NotImplemented` is worse than nothing — it ships broken code under your name.
  Either implement the surface for real (with tests) or do not add it. When in
  doubt, delete the export.
- **Don't make scope decisions the user didn't ask for.** "Focus on X, not Y"
  does not mean "mark Y private and hide it." Ask before excluding a package from
  publish, changing visibility, or dropping a feature.
- **Keep status docs honest.** A roadmap that still lists shipped work as "to
  do" erodes trust. Update the README and spec as milestones land, and state
  what genuinely remains.
- **Verify claims, don't assert them.** Prove parity and behavior with tests and
  a real rendered UI, not prose.
- **"Works in the workspace" is not "delivered."** A monorepo with Vite hides
  packaging defects — raw-source exports, an unbuilt `dist`, a missing peer — by
  transpiling everything in one graph. Define done at the consumer boundary (the
  tarball a stranger installs), not the example that builds beside your source.
  See [the consumer smoke test](#the-consumer-smoke-test--the-mandatory-done-gate).
- **Exit criteria must test the promise, not a proxy.** If a gate is satisfiable
  without exercising the thing you actually promise — installable packages, exact
  parity, a real user flow — it is the wrong gate. Strengthen it or add the
  missing check instead of optimizing to a green light that never touches the
  deliverable. "Tests pass and the demo builds" proved nothing about publishability
  in a real library that had never been packed.
- **No "for now" behind a "done."** A `build: "echo …"`, a `throw`, a `// TODO`,
  an empty function — any placeholder you consciously deferred — means the gate is
  not done. If you can see the gap, the claim is premature. (A real project shipped
  `echo 'source export for now'` build scripts and still reported its gate
  complete; the "for now" was the proof it wasn't.)
- **Honor the spec as a contract, and pin its invariants.** When you deviate from
  the spec — add a language it excluded, change scope — update the spec and the
  tests in the *same* change; never leave code drifted ahead of the docs. Encode
  the spec's hard invariants as tests (the exact language count, the alias table,
  the public export list) so drift is caught mechanically. A test that only checks
  the code is internally self-consistent proves nothing about the spec it claims
  to satisfy.

## Next steps

- Engine and token model: [`fractalpop`](./core.md)
- Component API: [`@fractalpop/svelte`](./svelte.md)
- Adapters: [`@fractalpop/mdsvex`](./mdsvex.md), [`@fractalpop/remark`](./remark.md)
