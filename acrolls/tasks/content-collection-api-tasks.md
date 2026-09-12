# Tasks — Content collection API (`content()`)

Reworks the Acrolls docs content front door from three hand-keyed Vite globs into one
declarative collection: `content({ loader, schema, filter, config })`. Design borrowed from
Ogygia's content collections; **no Ogygia runtime, dependency, or island model is adopted.**

## Fixed contract decisions (do not re-litigate)

These were open and are now closed. Every task below assumes them.

1. **Entry identity.** `Entry.id` is the public routeable slug (`DocsContentDocument.slug`).
   `Entry.key` is the source filesystem key (`guide/intro.md`). Both are exposed; `id` is what
   `ids()` returns and what `get()` accepts.
2. **`filter` receives `{ key, data, meta }` — NOT `id`.** The engine
   (`createDocsContentSource`) is the sole route authority and host `entries[].href` overrides
   can change a slug, so no trustworthy `id` exists before the engine runs. Filtering happens
   on inputs, before the engine. (This corrects an earlier draft that passed a guessed `id`.)
3. **Both sync and async resolution.** `sourceSync()` for eager glob loaders (keeps the
   existing synchronous host wiring working), `source()` async for custom/remote loaders.
4. **Schema is Standard Schema (`~standard`), not a Valibot dependency.** Acrolls adds no
   validation library to its dependency tree; hosts bring Valibot/Zod/Arktype.
5. **The engine is not modified.** `packages/docs/src/lib/content.ts` — all nav, group, route,
   breadcrumb, pager, admission, and diagnostic logic — is reused verbatim. This work is a
   façade plus a loader seam.
6. **`filter` ≠ `hidden`.** `filter` removes a document from *every* surface including direct
   URL access. `hidden` keeps its existing meaning (unlisted but routeable, PRODUCT.md
   behavior 15). Both must continue to work independently.

## Implementation order

T1 → T2 → T3 → (T4, T5, T6 may run in parallel) → T7.

---

# T1 — Core collection module in `@acrolls/docs`

**Objective.** Add a Vite-agnostic `content()` façade over the existing content-source engine,
adding Standard Schema frontmatter validation, a uniform `filter`, and the unified
`{ id, key, data, meta, body }` entry shape.

**Repository context.** Monorepo at repo root, pnpm workspaces, Node ≥ 20.19, TypeScript,
Svelte 5. Package `packages/docs` (`@acrolls/docs`, private, version 0.3.0) is built with
`svelte-package -i src/lib -o dist`; every file under `src/lib` is published. Tests are Vitest
(`pnpm --filter @acrolls/docs test`).

The engine you are wrapping is `packages/docs/src/lib/content.ts`, exporting
`createDocsContentSource({ config, documents })` where `documents: readonly DocsContentInput[]`
and `DocsContentInput = { key, metadata?, facts?, load }`. It returns `DocsContentSource` =
`{ nav, documents, diagnostics, get(v), load(v), entries() }`. `DocsContentDocument` carries
`{ key, slug, href, title, description, metadata, facts, hidden, order, loader }`.

**Files.**
- CREATE `packages/docs/src/lib/collection.ts`
- CREATE `packages/docs/src/lib/collection.test.ts`
- EDIT `packages/docs/package.json` — add an export subpath
- EDIT `packages/docs/src/lib/index.ts` — re-export the new public names

**Do NOT edit** `packages/docs/src/lib/content.ts`, `nav.ts`, `nav-path.ts`, or `types.ts`.

## Contract to implement in `collection.ts`

Import engine pieces from `./content.js` (note the `.js` extension — the package uses ESM
NodeNext-style specifiers throughout).

```ts
// Standard Schema v1 — structural, no dependency.
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (value: unknown) =>
      | { readonly value: Output; readonly issues?: undefined }
      | { readonly issues: ReadonlyArray<{ readonly message: string;
            readonly path?: ReadonlyArray<PropertyKey | { key: PropertyKey }> }> };
  };
}
```

Types to export:

- `LoadedDocument<TDocument> = { key: string; data: DocsMetadata; meta?: DocsDocumentFacts;
  load: () => Promise<TDocument> }` — one raw document a loader yields.
- `ContentLoader<TDocument> = { list(): LoadedDocument<TDocument>[] |
  Promise<LoadedDocument<TDocument>[]>; readonly eager: boolean;
  live?(): AsyncIterable<number | ReadonlyArray<string>> }`.
  `eager: true` means `list()` is synchronous and `sourceSync()` is legal. `live?` is a
  reserved seam — **declare the type, implement nothing.**
- `Entry<TData, TDocument> = { id; key; data: TData; meta?: DocsDocumentFacts;
  body: () => Promise<TDocument>; href: string; hidden: boolean }` — server-side full entry.
- `EntrySummary<TData> = { id; key; data: TData; href; hidden }` — wire-safe; **must never
  carry `body` or `meta`.**
- `Collection<TDocument, TSchema>` = `{ source(): Promise<DocsContentSource<TDocument>>;
  sourceSync(): DocsContentSource<TDocument>; get(id): Promise<Entry|null>;
  list<R>(opts?: { map?: (e: EntrySummary) => R }): Promise<R[]>; ids(): Promise<string[]> }`.

Function to export:

```ts
export function content<TDocument, TSchema extends StandardSchemaV1 | undefined = undefined>(
  options: {
    loader: ContentLoader<TDocument>;
    config: DocsContentConfig;
    schema?: TSchema;
    filter?: (e: { key: string; data: InferredData; meta?: DocsDocumentFacts }) => boolean;
  }
): Collection<TDocument, TSchema>;
```

where `InferredData = TSchema extends StandardSchemaV1<any, infer O> ? O : DocsMetadata`.
Type inference must work: with a schema present, `e.data.title` is typed and a nonexistent
field is a compile error; with no schema, `data` is `DocsMetadata`.

## Required behavior

1. **Pipeline order is: load → validate → filter → engine.** Both validation and filtering
   operate on `LoadedDocument[]` and produce `DocsContentInput[]`, which is handed to
   `createDocsContentSource({ config, documents })` untouched.
2. **Schema validation.** When `schema` is set, run `schema['~standard'].validate(doc.data)`
   per document.
   - Success → the validated `result.value` becomes the document's `metadata` passed to the
     engine (so coercions/defaults from the schema reach nav titles).
   - Failure → push a diagnostic `{ code: 'ACROLLS_SCHEMA_INVALID', severity: 'error',
     file: doc.key, message: 'Frontmatter failed schema: ' + issues joined by '; ',
     remediation: 'Fix the frontmatter fields to match the collection schema.' }`.
     Include each issue's `path` in the message when present, rendered dotted
     (e.g. `title: expected string`), because a bare message is not actionable in a 600-file corpus.
   - On failure, **mode decides admission**: if `options.config.convention?.mode === 'authored'`,
     drop the document (rejected — consistent with the engine's authored fail-fast contract);
     otherwise keep it with its raw unvalidated `data` and still surface the diagnostic
     (migration mode reports, does not reject).
3. **Filter.** When `filter` is set, drop any document for which it returns false. Filtered
   documents must not appear in `nav`, `documents`, `get()`, `load()`, `entries()`, `ids()`, or
   `list()` — verified by test.
4. **Diagnostics merge.** The returned source must be the engine's source with collection
   diagnostics prepended: `{ ...engine, diagnostics: [...collectionDiagnostics, ...engine.diagnostics] }`.
   Preserve every engine method (`get`/`load`/`entries` are own properties on the returned
   literal, so object spread is safe — confirm this by reading the engine's return statement).
5. **`sourceSync()`** throws a clear `Error` when `loader.eager !== true`, with message naming
   `source()` as the async alternative. When eager, it must be fully synchronous (no promise).
6. **`get(id)`** resolves the source and delegates to the engine's `get()`, which already
   accepts slug, key, key-without-extension, and href aliases. Map the resulting
   `DocsContentDocument` to `Entry` (`id: doc.slug`, `body: doc.loader`). Return `null`, not
   `undefined`, when absent.
7. **`list()`** returns summaries for non-hidden documents in engine order, applying `map` when
   supplied. Never include `body`/`meta`.
8. **`ids()`** returns `documents.map(d => d.slug)` — all documents including hidden ones, since
   hidden pages remain routeable and must be prerendered.
9. **Determinism.** No `Date.now()`, no random, no iteration-order dependence beyond what the
   engine already guarantees.

## Tests to write in `collection.test.ts`

Follow the existing style of `packages/docs/src/lib/content.test.ts` (Vitest,
`describe`/`it`/`expect`, hand-built inline document fixtures, no filesystem). Build a fake
eager loader from an inline array — do not use `import.meta.glob` in tests.

Cover:
- `content()` with no schema and no filter produces a source **identical in nav shape** to
  calling `createDocsContentSource` directly with the same inputs (regression guard proving the
  façade is transparent).
- Schema success replaces metadata with validated output (e.g. a schema that defaults
  `order: 0` affects sort order).
- Schema failure in `authored` mode: document dropped from `documents`/`nav`/`get`, and one
  `ACROLLS_SCHEMA_INVALID` diagnostic with the right `file` is present.
- Schema failure in migration mode (no `convention.mode`): document retained, diagnostic still
  present.
- `filter` removes a document from all of `nav`, `documents`, `get()`, `entries()`, `ids()`,
  `list()`.
- `filter` and `hidden` are independent: a `hidden: true` document is absent from `nav` and
  `list()` but still resolvable via `get()` and present in `ids()`.
- `sourceSync()` throws on a loader with `eager: false`.
- `list({ map })` output contains no `body` and no `meta` keys.
- A stub `StandardSchemaV1` implemented inline (do not add Valibot to devDependencies).

## Packaging edits

In `packages/docs/package.json` `exports`, add alongside `./content`:

```json
"./collection": { "types": "./dist/collection.d.ts", "import": "./dist/collection.js" }
```

In `packages/docs/src/lib/index.ts`, re-export `content` and every public type above from
`./collection.js`. **Do not** re-export collection symbols from `content.ts` — `collection.ts`
imports `content.ts`, and the reverse edge would create an import cycle.

## Acceptance

- `pnpm --filter @acrolls/docs test` passes, including all new cases.
- `pnpm --filter @acrolls/docs check` passes (svelte-check, no type errors).
- `pnpm --filter @acrolls/docs build` emits `dist/collection.js` and `dist/collection.d.ts`.
- `git diff --stat packages/docs/src/lib/content.ts` is empty.

---

# T2 — Vite loaders and shim re-expression in `@acrolls/sveltekit`

**Objective.** Add the glob loader and the custom-source seam, and re-express the existing
`createAcrollsDocsSource` over `content()` so old and new hosts share exactly one code path.

**Prerequisite.** T1 merged.

**Repository context.** `packages/sveltekit` (`@acrolls/sveltekit`, private, 0.2.0) is built
with `tsup src/index.ts --format esm --dts --clean`; checked with `tsc --noEmit`. It depends on
`@acrolls/docs` and `@acrolls/mdsvex` (workspace). It has **no test setup today** — do not add
one; correctness is proved by T1 tests plus the T4 example build.

Read `packages/sveltekit/src/index.ts` first. It currently holds `createAcrollsDocsSource` plus
the private helpers `normalizeGlobPath` and `removeGlobRoot`, and unrelated mdsvex preprocessor
factories (leave those alone).

**Files.** EDIT `packages/sveltekit/src/index.ts` only.

## Contract

```ts
export function markdownGlob<TDocument>(opts: {
  /** import.meta.glob('<root>/**\/*.md', { import: 'default' }) — lazy component modules */
  body: Record<string, () => Promise<TDocument>>;
  /** import.meta.glob('<root>/**\/*.md', { eager: true }) — full eager modules */
  modules: Record<string, { metadata?: DocsMetadata; __acrollsDocument?: DocsDocumentFacts }>;
  /** Directory prefix stripped from glob keys, e.g. '../../content' */
  root: string;
}): ContentLoader<TDocument>;

export function customSource<TDocument>(
  source: Pick<ContentLoader<TDocument>, 'list' | 'live'>
): ContentLoader<TDocument>;
```

`markdownGlob` returns `{ eager: true, list() { … } }`, iterating `opts.body` entries, stripping
`root` from each glob key via the existing `removeGlobRoot`/`normalizeGlobPath` helpers, and
reading **both** `metadata` and `__acrollsDocument` off the single eager module in `opts.modules`
keyed by the same glob key. Missing metadata defaults to `{}`; missing facts stays `undefined`.

This is the deliberate reduction from **three globs to two**. It cannot become one: Vite needs a
separate lazy glob to keep document bodies out of the eager graph. Add a short code comment
stating exactly that, so a future reader does not "simplify" it into an eager-only version and
silently make every document body eager.

`customSource` returns `{ eager: false, list: source.list, live: source.live }` — the seam for
CMS/API/database sources. Add a doc comment: the nav/route engine consumes `list()` output, not
globs, so a remote source needs no changes to navigation, routing, breadcrumbs, or pager.

## Shim re-expression

Rewrite `createAcrollsDocsSource` to build an eager `ContentLoader` from its existing
`{ modules, metadata, facts, contentRoot }` inputs and return
`content({ loader, config }).sourceSync()`. Its exported signature, parameter names, return
type, and thrown-error messages **must not change** — including the existing
`Docs glob key "…" is outside configured contentRoot "…"` error text, which is asserted by CLI
onboarding detection and documented in READMEs.

Mark it `@deprecated` in TSDoc pointing to `content({ loader: markdownGlob(...) })`. Do not
remove it and do not emit a runtime deprecation warning — hosts on 0.1.x must keep working
silently.

Re-export from `@acrolls/docs` (add to the existing export block) so hosts import everything
from one place: `content`, and the types `ContentLoader`, `LoadedDocument`, `Entry`,
`EntrySummary`, `Collection`, `StandardSchemaV1`.

## Acceptance

- `pnpm --filter @acrolls/sveltekit check` passes.
- `pnpm --filter @acrolls/sveltekit build` succeeds and `dist/index.d.ts` declares
  `markdownGlob`, `customSource`, `content`, and the unchanged `createAcrollsDocsSource`.
- The public signature diff for `createAcrollsDocsSource` is empty (compare `dist/index.d.ts`
  before and after).

---

# T3 — Public export surface `acrolls/content`

**Objective.** Expose the new API on the public npm package so hosts write
`import { content, markdownGlob } from 'acrolls/content'`.

**Prerequisite.** T2 merged.

**Repository context.** `packages/acrolls` is the published package (`acrolls`, public). It
contains **hand-written one-line re-export shims** in `exports/` — e.g.
`exports/docs-content.js` is literally `export * from '@acrolls/docs/content';` with a matching
`.d.ts`. Scoped `@acrolls/*` packages are bundled (`bundledDependencies`) and are not part of
the consumer contract; applications install only `acrolls`.

**Files.**
- CREATE `packages/acrolls/exports/content.js` and `packages/acrolls/exports/content.d.ts`
- EDIT `packages/acrolls/package.json`

## Contract

Both shim files contain the same two lines (`.d.ts` mirrors `.js`, matching the existing
convention in `exports/docs-content.d.ts`):

```js
export * from '@acrolls/docs/collection';
export { markdownGlob, customSource } from '@acrolls/sveltekit';
```

Aggregating both is intentional: `content()` is Vite-agnostic and lives in `@acrolls/docs`,
while `markdownGlob` is Vite-specific and lives in `@acrolls/sveltekit`, but the host should not
have to know that split.

In `packages/acrolls/package.json`:
- Add to `exports`, placed next to `./docs/content`:
  ```json
  "./content": { "types": "./exports/content.d.ts", "import": "./exports/content.js" }
  ```
- Add `node --check exports/content.js` to the existing chained `check` script.
- Leave `files`, `bundledDependencies`, and `dependencies` unchanged (`exports/` is already
  published wholesale and both scoped packages are already bundled).

## Acceptance

- `pnpm --filter acrolls check` passes.
- From a built workspace, `node -e "import('acrolls/content').then(m => console.log(Object.keys(m)))"`
  lists `content`, `markdownGlob`, and `customSource`.

---

# T4 — Migrate the example host

**Objective.** Convert `examples/kit-consumer` to the new API, proving the ergonomics claim and
exercising schema + filter end to end.

**Prerequisite.** T3 merged.

**Repository context.** `examples/kit-consumer/src/lib/docs/source.ts` currently declares three
`import.meta.glob` calls over `'../../content/**/*.md'` (lazy `default`, eager `metadata`, eager
`__acrollsDocument`) and passes them to `createAcrollsDocsSource` with `contentRoot:
'../../content'` and a `defineDocsConfig({...})` in `authored` mode with `folders` and `entries`
overrides. The example has an `/acceptance` route that is the canonical smoke surface
(PRODUCT.md behaviors 64–65) and must keep passing.

**Files.**
- EDIT `examples/kit-consumer/src/lib/docs/source.ts`
- EDIT `examples/kit-consumer/package.json` (add `valibot` to `devDependencies`)
- Possibly ADD one draft fixture under `examples/kit-consumer/src/content/`

## Contract

Rewrite `source.ts` to:

```ts
export const docs = content({
  loader: markdownGlob({
    body: import.meta.glob('../../content/**/*.md', { import: 'default' }),
    modules: import.meta.glob('../../content/**/*.md', { eager: true }),
    root: '../../content'
  }),
  schema: v.object({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    hidden: v.optional(v.boolean()),
    draft: v.optional(v.boolean())
  }),
  filter: (e) => !e.data.draft,
  config: defineDocsConfig({ /* keep the existing config object verbatim */ })
}).sourceSync();
```

Keep `export const docs` as a `DocsContentSource` (via `sourceSync()`) so **no consuming route,
layout, or component in the example needs to change**. Verify this by grepping the example for
`docs.` usages before and after.

`title` must stay `optional` in the schema even though the host is in `authored` mode: the
engine's own `ACROLLS_TITLE_REQUIRED` admission rule already enforces titles and derives index
titles from folders, and a required-title schema would double-reject index pages. Add a comment
saying so.

Add one new content file with `draft: true` in its frontmatter to prove the filter, and assert
in the acceptance flow (or a brief note in the example README) that its route 404s rather than
rendering — the point of `filter` over `hidden` is that drafts are not reachable by direct URL.

Add `valibot` to the example's `devDependencies` only. **Do not** add it to any `packages/*`
manifest.

## Acceptance

- `pnpm --filter @acrolls/example-kit build` succeeds.
- `pnpm --filter @acrolls/example-kit check` passes.
- The `/acceptance` route still renders code frame, table, callout, and figure together.
- The docs sidebar, breadcrumbs, and pager are unchanged versus before the migration (compare a
  serialized `docs.nav` snapshot before and after; it must be byte-identical apart from the new
  draft file's absence).
- The draft page's URL returns the host's normal 404.

---

# T5 — CLI onboarding and detection

**Objective.** Teach `acrolls onboard` to emit the new two-glob snippet, and keep `--check`
detection working for both old and new hosts.

**Prerequisite.** T3 merged. Coordinate with T4 (the snippet should match what the example does).

**Repository context.** `packages/cli/src/onboarding.ts`:
- Around **line 93–98**, filesystem detection asserts the host source file contains
  `createDocsContentSource` or `createAcrollsDocsSource`, plus `import.meta.glob`, plus the
  content prefix or `contentRoot`.
- Around **lines 463–470**, the generated-source checkpoint emits the three-glob snippet built
  with a `${contentGlob}` template.

PRODUCT.md behaviors 46, 49, and 63 apply: `--json` is a versioned plan; checkpoint ordering and
JSON field meaning are stable user-facing contracts; the generated-source checkpoint must show
matching globs, matching prefixes, and typed metadata.

**Files.** EDIT `packages/cli/src/onboarding.ts`, plus the CLI's existing test fixtures/snapshots
under `packages/cli` that assert onboarding output.

## Contract

1. **Snippet.** Replace the three-glob snippet with the `content({ loader: markdownGlob(...) })`
   form, importing from `acrolls/content`. Keep both globs using the identical `${contentGlob}`
   template so the "matching globs, matching prefixes" requirement still holds visibly. Keep the
   emitted code typed (the existing `as Record<...>` casts or equivalent).
2. **Detection.** Extend the line-93 predicate to also accept `content(` together with
   `markdownGlob(`, so a migrated host is recognized as complete. Keep the existing
   `createDocsContentSource`/`createAcrollsDocsSource` acceptance — `--check` must not regress a
   host that has not migrated. Keep the `contentRoot`-or-prefix clause, and add `root:` as an
   accepted marker since `markdownGlob` names the option `root`.
3. **Caution text.** The generated-source checkpoint's caution should state that the two globs
   must use the same pattern, and that the eager glob must not be collapsed into the lazy one.
4. **Versioning.** If checkpoint text or JSON fields change shape, bump the onboarding plan
   version per behavior 63 rather than silently altering the contract.

Do not change checkpoint ordering, ids, exit-code semantics, or any other checkpoint.

## Acceptance

- `pnpm --filter @acrolls/cli test` passes with updated snapshots.
- `acrolls onboard --non-interactive --json` emits a plan whose generated-source snippet compiles
  when pasted into the example host.
- `acrolls onboard --check` marks the generated-source step complete against **both** the
  pre-T4 three-glob `source.ts` and the post-T4 `content()` `source.ts`.

---

# T6 — Documentation

**Objective.** Make the new API the documented default while keeping the old one documented as
supported-but-deprecated.

**Prerequisite.** T3 merged. Content should match T4's final example code.

**Files.**
- EDIT `docs/content-authoring.md` (line ~44 shows the old three-glob call)
- EDIT `packages/sveltekit/README.md` (lines ~35–46 show the old import and call)
- EDIT `TECH.md` (line ~109 references `createAcrollsDocsSource()` in the pipeline diagram)
- EDIT `PRODUCT.md` — add behaviors
- EDIT `docs/frontmatter-contract-spec.md` (line ~12 names `createAcrollsDocsSource`)
- CHECK `llms.txt` and `docs/README.md` for stale references and update if present

## Contract

1. Lead every integration example with `content({ loader: markdownGlob(...) })` imported from
   `acrolls/content`. Show `schema` and `filter` in at least one full example.
2. Keep a short "Migrating from `createAcrollsDocsSource`" section showing old → new side by
   side, and state plainly that the old function still works and is not scheduled for removal.
3. Document the `filter` vs `hidden` distinction explicitly, since this is the most likely
   source of user confusion: `filter` = removed from every addressable surface including direct
   URL; `hidden` = unlisted but still routeable and still prerendered. State plainly that
   `filter` is a publication boundary, not a confidentiality boundary — the glob loader
   materializes every matching file into the module graph before `filter` runs, so a filtered
   document's compiled body can still be present in build output — and point secret or embargoed
   content out of the globbed directory or behind host-owned authentication.
4. Document that schema failures are diagnostics that follow the existing authored/migration
   mode policy — they are not a new failure model.
5. Document the custom-source seam (`customSource({ list })`) as the path to CMS/API-backed
   docs, and state its current limits honestly: it requires the async `source()` (not
   `sourceSync()`), and `live()` is a reserved type-level seam with **no implementation yet** —
   do not present live/SSE content as available.
6. Add to PRODUCT.md, continuing the existing numbered behavior list, behaviors covering: the
   single-collection declaration, optional typed frontmatter schema with diagnostics under the
   existing modes, the uniform filter and its distinction from `hidden`, and the pluggable
   loader seam. Remove "remote content" from the Deferred list **only if** T2's `customSource`
   actually ships; otherwise reword it to note the seam exists while remote sources remain
   unimplemented.

Do not overstate: this work changes developer ergonomics and adds build-time type safety. It
does not change what a published site's readers receive. Do not describe it as a performance or
rendering improvement anywhere.

## Acceptance

- No file in `docs/`, `packages/*/README.md`, `TECH.md`, or `llms.txt` presents the three-glob
  form as the recommended path.
- Every code sample in the touched docs compiles against the built packages (paste-test at least
  the primary integration sample).
- `grep -rn "createAcrollsDocsSource" --include="*.md" .` returns only migration/deprecation
  mentions.

---

# T7 — Full verification pass

**Objective.** Prove the whole change is coherent, non-breaking for existing hosts, and matches
the documented success criteria.

**Prerequisite.** T1–T6 merged.

**Files.** None expected. If this task needs source edits, they are bug fixes and must be
attributed back to the originating task in the commit message.

## Steps

1. Clean build from the repo root: `pnpm install && pnpm build`. Must succeed
   (PRODUCT.md success criterion 1).
2. `pnpm -r test` and `pnpm -r check` across the workspace.
3. Example: `pnpm --filter @acrolls/example-kit build`, then confirm `/acceptance` renders code +
   callout + table + figure together (success criterion 2).
4. `./packages/cli/dist/index.js validate examples/starter/article.md` exits 0
   (success criterion 3).
5. `acrolls studio` opens a local preview for one file (success criterion 4).
6. **Backward-compatibility proof.** Restore the pre-T4 three-glob `source.ts` in a scratch copy
   of the example, build it against the new packages, and confirm it still works with no source
   changes and no new warnings. This is the single most important check in this task — the
   deprecated path must not have silently broken.
7. **Nav-parity proof.** Serialize `docs.nav` from the old-style and new-style example sources
   over the same content set and diff them. Any difference other than the intentionally filtered
   draft page is a bug.
8. Confirm `filter`-removed documents are absent from every addressable surface: they must not
   appear in prerendered routes or the nav JSON, and a direct URL visit must 404. Do **not**
   assert they are absent from the built chunks — `import.meta.glob` materializes every matching
   file into the module graph at build time and `filter` runs afterwards, so Rollup cannot
   tree-shake a filtered document's compiled body out of the server or client output. That is
   inherent to glob-based loading, not a bug in the filter. Verify instead that nothing routes
   to the document, and that the docs state plainly that `filter` is a publication boundary
   rather than a confidentiality boundary.

## Acceptance

Report results honestly, including any step that was skipped or could not be run in the
environment. If step 6 or 7 fails, do not paper over it — the façade's whole justification is
that it is behavior-preserving.
