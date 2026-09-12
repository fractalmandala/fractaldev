# What you can build from these parts

A catalog of SvelteKit scaffolds, utilities and tools that are feasible from the
pieces already in this repo — not their current condition, but where each could
go with correction and modification. Grounded in what the code actually exposes
as of 2026-08-13.

**Maturity legend**

| | Meaning |
|---|---|
| ✅ | Works today, or a thin wrapper away |
| 🔧 | Feasible with correction — the parts exist, wiring or fixes needed |
| 🧭 | Greenfield — the primitives support it, but it is a real design+build |

---

## The building blocks you're drawing from

Everything below is assembled from these seven primitives:

| Primitive | Exposes |
|---|---|
| **fractal-svelte** | project scaffold CLI · template-directory mechanism · `{{token}}` substitution · `fa` armory embed |
| **fractals-styler** | token SASS system · `init` CLI · Vite JIT plugin · `generateCss` / `scanFiles` / registry as importable functions |
| **acrolls** | `@acrolls/mdsvex` (mdsvex + Shiki + source-safety) · `@acrolls/docs` (`createDocsContentSource`, `DocsShell`, nav/TOC/pager) · `@acrolls/svelte` (Publication, Banner, Callout, Figure, Video, ZoomableImage, Mermaid) · `acrolls` CLI (onboard/validate/integrate/studio) |
| **ripple-iui** | versioned zod `UISpec` schema · 189-entry widget manifest across 13 categories · 24 widget families · `Ripple.svelte` renderer · intent layer (layout-engine, pattern-detector, 8 layouts, FlowRunner, DashboardManager) |
| **fa armory** | 22 skills · 54 recipes · `routing.json` · token verifier · doctor · verify/receipt |
| **content corpora** | compdocs (69) · fractalsvelte/src/docs (142) — real markdown to test against |
| **ingest-docs.mjs** | generic markdown-tree normalizer (frontmatter, H1, INDEX, relative links) |

---

## 1. Project scaffolds

New-project generators. Each is a `templates/<name>/` directory plus, where
noted, a flag or a small CLI change.

- [ ] 🔧 **`mandala-docs` template** — the docs site built this session, packaged
  so `fractal-svelte site -t mandala-docs` reproduces it. Blocked only on the
  acrolls `file:` dependency path. *(This is open task #6.)*
- [ ] ✅ **`minimal` template** — the `default` template stripped to shell +
  tokens + one route. For people who want the styling system and nothing else.
- [ ] 🔧 **`blog` template** — `@acrolls/svelte`'s `Publication` + `Banner` +
  `Figure` over a `posts/**/*.md` tree. acrolls already ships the article
  chrome; this is a route layout and a source config away.
- [ ] 🔧 **`landing` template** — marketing-page starter using the 9 `marketing`
  and 4 `media` manifest widgets, or hand-built sections on the styler
  compositions. Needs a design pass, not new infrastructure.
- [ ] 🧭 **`dashboard` template** — ripple's `DashboardManager` +
  `createDashboardManager` render a `DashboardSpec` of widgets. A template that
  boots an empty dashboard and a spec file is a real but bounded build.
- [ ] 🧭 **`spec-app` template** — the `newripple` pattern generalized: a
  SvelteKit app whose routes render Ripple `UISpec` JSON through `Ripple.svelte`.
  You already have one instance; a template is the reusable form.
- [ ] 🔧 **`component-lib` template** — a `svelte-package` library starter with
  the styler tokens, `fa` armory, and a `/showcase` route. ripple-iui's own
  `showcase/` routes are the reference.

---

## 2. CLIs and dev utilities

Command-line tools. Most extend a CLI that already exists rather than starting one.

- [ ] ✅ **`fractal-svelte doctor` everywhere** — the armory doctor already runs
  in any scaffolded project. Surface it as a standalone health check.
- [ ] 🔧 **`ingest-docs` as a published bin** — the generic markdown normalizer,
  packaged so `npx ingest-docs <dir>` works in any project, not just this repo.
- [ ] 🔧 **`fa tokens --fix`** — the token verifier already reads the scale;
  extend it to scan component SASS and flag undefined custom properties. This is
  the guard against the silent-token bug, made active instead of advisory.
- [ ] 🧭 **`styler lint`** — using `scanFiles` + the registry, report utility
  classes in markup that resolve to nothing (the `grid-cols-3-lg` trap) before
  they ship. The scanner is already exported; the lint pass is new.
- [ ] 🧭 **`spec validate`** — a CLI wrapper over ripple's zod `UISpec` schema:
  validate a spec file, print which fields failed, exit non-zero for CI. The
  schema is versioned and forgiving already; this is a thin bin.
- [ ] 🔧 **`acrolls onboard` for non-SvelteKit-config hosts** — acrolls' own docs
  flag that the CLI only detects `svelte.config.js`, not inline `vite.config`.
  Teaching it the inline case is a documented, bounded fix.

---

## 3. Styling tools

Everything downstream of `fractals-styler`.

- [ ] ✅ **Live token preview** — `fractals-styler` already ships a `preview`
  Vite target and an `AppShell` / `StylerPreview`. Point it at a project's own
  `_tokens.sass` to render that project's scale.
- [ ] 🧭 **Theme factory** — a UI that edits token values and emits a
  `[data-theme]` block. The two-layer token structure (primitive → semantic) is
  the exact shape this needs; the editor is the build.
- [ ] 🔧 **Contrast auditor** — walk the semantic colour tokens against their
  backgrounds and flag WCAG failures. This would have caught the
  `--text-secondary` 3.27:1 dark-mode miss automatically. A small script over
  the parsed token file.
- [ ] 🧭 **Tailwind → styler codemod** — map utility classes to styler
  primitives + JIT classes. The `twreplace.css` in acrolls is a starting
  reference for the mapping table.

---

## 4. Documentation tools

Downstream of acrolls + the ingest pipeline.

- [ ] ✅ **Docs-from-any-markdown site** — the `mandala-docs` shape, repeatable
  for any tree. This is proven; 145 pages this session.
- [ ] 🔧 **Client-side search** — the `DocsShell` already has a filter input.
  Wire a build-time index (the `docs.documents` array is right there) into a
  real search over titles + descriptions.
- [ ] 🔧 **Auto-generated API docs** — point ingest at a package's `.md` output,
  or generate `.md` from TypeScript and feed it the same pipeline.
- [ ] 🧭 **`studio` live editor** — acrolls ships a `studio` CLI command that
  renders a single markdown file with the HTML pipeline. A route wrapper turns
  it into a browser-based authoring preview.
- [ ] 🔧 **Corpus validator in CI** — `acrolls validate ./docs --mode migration`
  already produces a JSON report. Wrap it as a CI gate that fails on rejected
  documents.

---

## 5. Spec-driven and generative tools

The ripple-iui line — the biggest payoff and the biggest build.

- [ ] ✅ **JSON → live UI** — `Ripple.svelte` renders a `UISpec` today. 189
  widgets across display/layout/input/data/composite/overlay/etc. are already
  registered.
- [ ] 🧭 **JSON → files (the missing emitter)** — the same manifest that feeds
  the runtime renderer, teaching a scaffolder to emit `.svelte` + `.sass` on
  disk. This is the "spec anything, scaffold anytime" idea from earlier; it needs
  one new manifest field (`source`) and a file emitter.
- [ ] 🧭 **Intent → layout** — the intent layer already has a `pattern-detector`
  and 8 layouts (Form, Summary, CardGrid, List, Select, Detail, InfoHero,
  Search). A tool that takes a description and picks a layout is a wrapper over
  primitives that exist.
- [ ] 🧭 **Flow / wizard builder** — `FlowRunner` + `buildOnboardingWizard` +
  `extractFlowOptions` already run multi-step flows from a spec. A visual builder
  that emits those specs is the tool.
- [ ] 🧭 **Dashboard composer** — `DashboardManager` renders a `DashboardSpec`;
  the composer is the drag-and-drop surface that writes one.
- [ ] 🔧 **Spec catalog / gallery** — `newripple` already renders 52 demos from
  specs. Generalize its `/catalog` and `/bundles` routes into a browsable
  registry of every manifest widget with a live example (the manifest carries an
  `example` for each).

---

## 6. Agent and automation tooling

The `fa` armory line — turning the repeated work into commands.

- [ ] ✅ **Task router** — `fa route "<task>"` already maps a request to skills +
  policies. Works in any scaffolded project.
- [ ] 🔧 **Recipe expansion** — 54 recipes exist behind `fa component <name>`.
  Extend the set, or generate recipes from the manifest so the two stop drifting.
- [ ] 🧭 **Verify-and-receipt gate** — `fa verify --all` writes a receipt today.
  Turn it into a real CI gate that blocks a merge on `fix-first` / `rethink`.
- [ ] 🧭 **Manifest ↔ docs ↔ scaffold, one source** — the convergence idea: one
  manifest drives the runtime renderer, the generated docs, and the file
  emitter, so docs stop being hand-maintained beside the code. This is the
  architectural end-state that several items above are steps toward.

---

## 7. Composite products

Things made by combining the lines above — where the real leverage is.

- [ ] 🧭 **Component library site** — styler tokens + ripple widgets +
  acrolls docs + `fa` recipes: a published library where every component has a
  live example, generated docs, and an agent recipe, all from one manifest.
- [ ] 🧭 **"Spec to shipped" pipeline** — write a `UISpec` → preview it live
  (Ripple) → emit files (the missing emitter) → document it (acrolls) → verify it
  (`fa verify`). Each stage exists in isolation; the pipeline is the product.
- [ ] 🔧 **Starter marketplace** — the template-directory mechanism plus a small
  index. Each finished project you build becomes a `-t <name>` others can
  scaffold. The mechanism is proven; the index and a few real templates are the
  work.

---

## Reality check

Two things gate most of the 🧭 items, and they're worth naming up front:

1. **The `file:` dependency problem.** `mandala-docs` and `newripple` both wire
   their local packages via `file:../acrolls/...` and `file:../ripple-iui-main`.
   Those paths only resolve from inside `/Users/amrit/fractalmandala/`. Nearly
   every "template" or "published tool" item is blocked on the same decision:
   publish these packages (npm or a registry) or commit to a documented monorepo
   assumption. Solve it once, unblock most of this list.

2. **Silent-failure discipline.** The recurring lesson this session — a build and
   a type-check both passing on a broken page — applies to everything you build
   from these parts. Any tool here that emits code (the file emitter, the
   codemod, the theme factory) needs a browser-level verification step baked in,
   not bolted on, or it will ship green and broken. Build the check into the
   tool, not the checklist.

Start where the payoff is highest and the build is smallest: the items marked 🔧
are corrections, not inventions. The 🧭 items are where the "spec anything"
ambition actually lives — bigger, but every one of them stands on primitives
that already run.
