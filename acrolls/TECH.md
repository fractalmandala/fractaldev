# Acrolls — TECH

## Stack

- **Node** ≥ 20.19
- **pnpm** workspaces
- **Svelte 5** (runes) for `@acrolls/svelte` and Studio UI
- **SvelteKit 2.62+ / 3** for the example and Studio shell
- **mdsvex** for Markdown / `.svx` compilation
- **Shiki** for compile-time highlighting
- **TypeScript** throughout packages
- **CSS** primary styles; optional **indented SASS** token source for hosts

## Monorepo layout

```text
acrolls/
  packages/
    mdsvex/       @acrolls/mdsvex
    svelte/       @acrolls/svelte
    styles/       @acrolls/styles
    sveltekit/    @acrolls/sveltekit
    cli/          @acrolls/cli
  examples/
    kit-consumer/ @acrolls/example-kit
    starter/      starter article assets
  PRODUCT.md
  TECH.md
  SKILL.md
```

## Compile pipeline

```text
.md / .svx
  → mdsvex (remark-gfm + frontmatter)
  → rehype: slugs, table wrap, code frames (Shiki)
  → Svelte component graph
  → <article class="acrolls"> via Publication layout
```

The internal bundled `@acrolls/mdsvex` unit exposes its public API through `acrolls/mdsvex`,
including `createAcrollsMdsvexOptions()`, consumed by:

- host `vite.config.ts` via `acrolls/mdsvex` or `acrolls/sveltekit`
- CLI `validate` / `studio` (same options object)

## Runtime model

- Most markup is SSR-friendly static HTML from mdsvex + components.
- Client islands only where needed:
  - copy button / wrap toggle on code frames
  - image zoom dialog
  - Mermaid (lazy, post-v0 optional in v0 stub)
- No compiler deps in browser bundles (Shiki stays compile-time).

## Style architecture

- `.acrolls` publication boundary
- CSS variables `--acrolls-*` with host fallbacks (`--font-body`, `--foreground`, …)
- `foundation.css` — mechanics only
- `default.css` — foundation + editorial scale
- `src/tokens.sass` — optional indented SASS map for hosts that compile SASS

## CLI

| Command | Behavior |
|---|---|
| `acrolls init` | Create content dir (no article body) |
| `acrolls onboard` | Read-only checkpointed host guide; `--check` and `--json` resume/UI surfaces |
| `acrolls integrate` | Detect SvelteKit + mdsvex; dry-run plan; apply with confirm |
| `acrolls validate <file|directory>` | Aggregate shared normalization/compile diagnostics; exit codes 0/1/2 |
| `acrolls studio <file>` | Local Vite/SvelteKit mini app, source file as truth |

## SvelteKit integration (host)

```ts
// vite.config.ts
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-auto';
import { createAcrollsMdsvexPreprocessor } from 'acrolls/mdsvex';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx', '.md'],
      preprocess: [vitePreprocess(), createAcrollsMdsvexPreprocessor()],
      adapter: adapter()
    })
  ]
});
```

Layout imports:

```js
import 'acrolls/styles/default.css';
```

Article routes import `.svx` / `.md` modules or load content via filesystem in `+page.ts`.

## Content-source pipeline

```text
import.meta.glob(.md, lazy default) + import.meta.glob(.md, eager module)
  → acrolls/content markdownGlob()          (ContentLoader — the pluggable seam)
  → acrolls/content content({ loader, schema?, filter?, config })
      load → validate (Standard Schema) → filter
  → @acrolls/docs/content createDocsContentSource()   (unchanged route/nav engine)
  → route records + DocsNav + breadcrumbs/pager order + entries()
```

Two globs over the identical pattern, not three: the eager module carries both `metadata` and
the preprocessor's `__acrollsDocument` facts. It cannot collapse to one — Vite needs the
separate lazy glob to keep document bodies out of the eager module graph.

`content()` is a façade plus a loader seam. It does not modify the engine: all nav, group,
route, breadcrumb, pager, admission, and diagnostic logic stays in
`packages/docs/src/lib/content.ts` and runs verbatim on the `DocsContentInput[]` the façade
hands it. Schema failures produce `ACROLLS_SCHEMA_INVALID` diagnostics that follow the existing
authored/migration admission policy rather than introducing a new failure model. `filter`
removes documents before the engine runs, so a filtered document has no route at all; `hidden`
is an engine-level presentation flag and keeps its route (PRODUCT.md behavior 15). `filter` is a
routing boundary, not a confidentiality boundary: `import.meta.glob` materializes every matching
file into the module graph at build time and `filter` runs afterwards, so Rollup cannot
tree-shake a filtered document's compiled body out of the build output. A `customSource` whose
`list()` never returns the document does not materialize it at all.

`createAcrollsDocsSource()` in `@acrolls/sveltekit` remains exported with an unchanged
signature and is now re-expressed over `content()`, so old and new hosts share exactly one code
path. It is `@deprecated` in TSDoc, emits no runtime warning, and is not scheduled for removal.
`customSource({ list })` is the non-Vite loader implementation for CMS/API/database sources; it
is `eager: false`, so it requires the async `source()`. The loader type also declares a
`live()` seam, which is reserved and has no implementation.

The pure content entry is separate from the Svelte component barrel so it can be imported
from build/configuration code without evaluating `.svelte` files. The host's page-tree
definition is authoritative for links, levels, and page/group roles; Markdown discovery and
filesystem conventions provide defaults only when the host has not defined them. The initial
source is Markdown-first; automatic `.svx` discovery is deferred.

## Build

- Packages use `tsup` or native `tsc` for TS libraries
- `@acrolls/svelte` ships source + preprocessed components (Svelte package convention)
- Example uses `@sveltejs/adapter-static` or `adapter-auto`

## Testing (v0)

- Unit: fence meta parser, slug, table wrap helpers (vitest)
- Example production build as smoke
- Studio manual / later Playwright

## Security

- Studio binds `127.0.0.1` only
- Validate does not execute host app code paths beyond mdsvex compile
- `.svx` is executable Svelte — open only trusted local files in Studio

## Feature: Corpus preflight and invalid-document policy

### Context

The current host path uses a lazy component glob plus an eager metadata glob in
[`packages/sveltekit/src/index.ts:23-63 @ d2d193c4454e0c9bcf3d9992c881db94548320db`](./packages/sveltekit/src/index.ts#L23-L63).
The mdsvex preprocessor in
[`packages/mdsvex/src/index.ts:60-116 @ d2d193c4454e0c9bcf3d9992c881db94548320db`](./packages/mdsvex/src/index.ts#L60-L116)
normalizes a narrow set of Markdown hazards and guarantees a named `metadata` export.
The content source then builds routes and navigation from records in
[`packages/docs/src/lib/content.ts:134-180 @ d2d193c4454e0c9bcf3d9992c881db94548320db`](./packages/docs/src/lib/content.ts#L134-L180).

This protects frontmatter-free metadata lookup and gives host integrations a compile boundary
for invalid Markdown. Directory validation in [`packages/cli/src/validate.ts`](./packages/cli/src/validate.ts)
aggregates the same source-safety, mdsvex/Svelte, and HTML-parity diagnostics before deciding
the deployment exit code, so a large imported corpus produces one actionable report.

### Implemented contract

#### 1. Shared document diagnostic contract

`@acrolls/mdsvex` exposes shared types for:

```ts
type AcrollsDocumentMode = 'authored' | 'migration';
type AcrollsInvalidDocumentPolicy = 'fail' | 'error-page';
type AcrollsDocumentStatus = 'ready' | 'normalized' | 'rejected';

type AcrollsDocumentDiagnostic = {
  code: string;
  severity: 'warning' | 'error';
  phase: 'normalize' | 'metadata' | 'compile' | 'render';
  file?: string;
  line?: number;
  column?: number;
  message: string;
  remediation?: string;
};
```

The diagnostic is serializable and is the common shape for CLI output, preprocessor callbacks,
and future generated manifests. Existing source-safety findings map into this shape without
changing their public location fields.

#### 2. Preprocessor policy boundary

`createAcrollsMdsvexPreprocessor` accepts an explicit invalid-document policy and optional
diagnostic callback. The CLI owns the `authored`/`migration` corpus label; the host compiler
boundary selects the concrete `fail` or `error-page` behavior. The default remains `fail`.

- `fail`: rethrow the original mdsvex/Svelte error after attaching the source diagnostic.
- `error-page`: for `.md` documents only, return a safe generated Svelte module with a
  metadata export and escaped diagnostic content. This keeps the route importable while
  making the failure visible to the host.
`.svx` remains trusted executable content and keeps fail-fast behavior unless a future explicit
trusted-content policy is added. Acrolls must not turn arbitrary Svelte into an error page by
default.

#### 3. Corpus CLI validation

`acrolls validate` accepts a file or directory. Directory mode recursively discovers `.md`
files, runs `normalizeAcrollsMarkdown`, mdsvex/Svelte compilation, and the HTML parity pipeline,
then collects all results before deciding the exit code. It prints a human summary and can write
an optional JSON report.

The CLI should preserve the existing single-file command and `--strict` compatibility while
adding explicit `--mode authored|migration` and `--on-invalid fail|error-page` flags.
`--on-invalid` controls the validation decision/report only; host runtime exclusion remains a
manifest concern.

#### 4. Runtime error-page boundary

The first implementation boundary is the mdsvex/Svelte preprocessor. In migration
`error-page` mode it preflights the transformed Markdown with the Svelte compiler and returns
a generated safe module on failure. This keeps every discovered route importable without
pretending the source was valid. A future allowlisted import-manifest API may add true
exclusion once Vite graph behavior is proven.

Keep `createDocsContentSource` responsible for route, metadata, and navigation invariants.
Do not move filesystem traversal or compiler execution into the docs shell.

#### 5. Documentation and examples

The two modes, policy semantics, diagnostic codes, and deployment gate are documented in
`docs/content-authoring.md`, `docs/integrate-sveltekit.md`, `docs/cli.md`, and
`docs/troubleshooting.md`. The CLI fixture corpus contains frontmatter-free Markdown, safe
normalization findings, an invalid body, and a valid document next to it.

### End-to-end flow

```text
source files
  → discover + normalize
  → metadata fallback
  → mdsvex compile preflight
      ├─ ready / normalized → allowlisted document manifest
      └─ rejected → fail | generated error page | reported exclusion
  → content() façade: schema validation → filter
  → createDocsContentSource
  → routes + navigation + lazy document loading
```

### Testing and validation

Map tests to PRODUCT invariants 26–36:

- `packages/mdsvex/src/index.test.ts`: fail-fast default, escaped error-page output,
  metadata export on fallback pages, and diagnostic callback payloads.
- `packages/mdsvex/src/source-safety.test.ts`: status/report mapping for normalized findings.
- `packages/cli/src/validate.test.ts`: recursive discovery, all-file aggregation, stable
  summary, exit codes, and preservation of the validation policy contract.
- `packages/mdsvex/src/index.test.ts`: valid, frontmatter-free, malformed `.md`, and malformed
  executable `.svx` fixtures prove fallback modules compile safely while trusted SVX remains
  fail-fast. The example SvelteKit host build verifies the normal integration wiring.
- Run `pnpm --filter @acrolls/mdsvex test`, `pnpm --filter @acrolls/cli check`,
  `pnpm --filter @acrolls/sveltekit check`, `pnpm build`, and `pnpm build:example`.
- A future host-level integration fixture should build the same corpus in default fail-fast and
  migration error-page modes; the current preprocessor test already proves the generated module
  compiles and that executable `.svx` remains fail-fast.

### Parallelization

Parallel implementation is not proposed. The shared diagnostic type, preprocessor policy, CLI
reporting, and SvelteKit manifest boundary are tightly coupled and must be designed and tested
as one contract. Tests can fan out after the API is stable, but separate worktrees would add
merge risk while the current checkout already contains coordinated Acrolls changes.

### Risks and mitigations

- **Error-page policy hides broken content.** Default remains fail-fast; migration summaries
  and visible diagnostic pages make exclusions explicit.
- **A glob still imports rejected files.** Exclude requires a generated allowlist; swallowing a
  compiler error in the preprocessor would be insufficient for true exclusion, which is why
  exclusion is deferred and error-page mode returns a valid replacement module.
- **Svelte errors leak unescaped source.** Diagnostic pages escape every interpolated value.
- **`.svx` semantics are changed accidentally.** Migration safety applies to `.md`; executable
  `.svx` remains trusted and fail-fast.
- **CLI and host drift.** Both consume the shared normalization and mdsvex options, with a
  fixture that runs both paths.

## Feature: Guided host onboarding

### Runtime contract

`packages/cli/src/onboarding.ts` is the single source for the onboarding plan. It detects the
current SvelteKit host, resolves the chosen content directory relative to
`src/lib/docs/source.ts`, and produces ordered checkpoints with file paths, commands, code
snippets, cautions, verification text, and a best-effort filesystem completion flag.

`acrolls onboard` renders that plan as a terminal walkthrough. It is interactive when attached
to a TTY, pauses after each incomplete checkpoint, and can be resumed with `--check`. In agent or
CI sessions, `--non-interactive` prints the full guide without waiting for stdin. `--json` emits
the versioned plan as the future modal contract.

The command deliberately does not write host files. The existing `integrate` command remains the
explicit mutation path with backups and `--yes`; onboarding tells the operator when a manual merge
is safer than automated patching.

### Checkpoint sequence

```text
detect SvelteKit host
  → install acrolls from npm
  → merge mdsvex preprocessor
  → import one Acrolls style preset
  → create/choose Markdown root
  → generate content source + matching lazy/eager globs
  → add DocsShell + Publication renderer
  → add root and catch-all routes
  → validate corpus with explicit policy
  → run local route/browser checks
  → build, deploy, and verify public /docs + nested route + 404
```

The manifest includes cautions for the known failure surfaces: package/version mismatch,
glob-prefix mismatch, nested DocsShell composition, frontmatter-free migration content,
Markdown error-page versus executable SVX fail-fast behavior, and host-owned deployment adapters.

### Testing

- `packages/cli/src/onboarding.test.ts` verifies host-aware paths, ordered checkpoints, cautions,
  deployment checks, and snippets for a SvelteKit example host.
- `--json` is intentionally data-only so a future modal can render the same contract without
  importing terminal formatting.
