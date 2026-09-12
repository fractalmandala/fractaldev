# Context Map — Content-source and navigation layer

## Files to Modify

| File | Purpose | Changes Needed |
|---|---|---|
| `packages/docs/src/lib/types.ts` | Public docs-shell and navigation types | Add the document/source contracts only if they belong in the reusable docs package; preserve the existing section/node distinction. |
| `packages/docs/src/lib/nav.ts` | Navigation tree traversal, active state, breadcrumbs, pager | Add deterministic conversion from discovered documents to `DocsNav`; retain existing traversal behavior. |
| `packages/docs/src/lib/index.ts` | Public package exports | Export the new source/nav builders and types. |
| `packages/docs/src/lib/nav.test.ts` | Existing navigation behavior tests | Extend with file-path-to-tree cases, index pages, ordering, hidden pages, and duplicate routes. |
| `packages/docs/src/lib/content.ts` | New pure content manifest/source utilities | Normalize document records and build a valid `DocsNav` from them. |
| `packages/docs/src/lib/content.test.ts` | New pure utility tests | Cover normalization and generated navigation. |
| `packages/docs/README.md` | Consumer API documentation | Document automatic navigation input and the distinction between sections and nested children. |
| `packages/sveltekit/src/index.ts` | SvelteKit-specific helpers | Add a helper that consumes `import.meta.glob` module maps, derives route records, exposes page lookup/entries, and delegates nav generation. |
| `packages/sveltekit/package.json` | Package dependency/export metadata | Add the docs package dependency if the helper returns `DocsNav` directly. |
| `packages/sveltekit/README.md` | SvelteKit integration documentation | Replace hand-built route/nav guidance with the generated source pattern. |
| `docs/snippets/page-load.ts` | Existing route integration snippet | Show the generated source loader and route entries. |
| `docs/snippets/nav.ts` | Existing manual nav snippet | Retain as an escape hatch, but label it manual/custom navigation. |
| `examples/kit-consumer/src/routes/docs/[...slug]/+page.ts` | Consumer route example | Use the generated source and expose entries for prerendering. |
| `examples/kit-consumer/src/lib/docs/source.ts` | New consumer source definition | Demonstrate one `import.meta.glob` source producing both routes and nav. |
| `examples/kit-consumer/src/routes/docs/+layout.svelte` | Consumer docs shell example | Pass generated `source.nav` into `DocsShell`. |
| `PRODUCT.md` / `TECH.md` | Product and architecture source of truth | Update after implementation so shipped behavior matches the new feature. |

## Dependencies

| File | Relationship |
|---|---|
| `packages/mdsvex/src/frontmatter.ts` | Existing minimal frontmatter parser; the source layer should consume compiled module metadata first and avoid duplicating parsing unless raw scanning is explicitly added. |
| `packages/mdsvex/src/index.ts` | Existing mdsvex options and metadata export contract. |
| `packages/docs/src/lib/types.ts` | `DocsShell` currently requires `DocsNav.sections` to contain sections with required `id` and `items`; nested nodes use `children`. |
| `packages/docs/src/lib/DocsSidebar.svelte` | Assumes `section.items` and recursively `node.children`; generated output must satisfy this runtime contract. |
| `packages/docs/src/lib/DocsNavTree.svelte` | Renders recursive groups; no `items` alias should be introduced without an explicit normalization boundary. |
| `packages/sveltekit/src/index.ts` | Existing SvelteKit-only package and natural home for `import.meta.glob` consumer helpers. |
| `examples/kit-consumer/vite.config.ts` | Existing mdsvex host configuration. |
| `sites/mandalarepo/src/routes/docs/[...slug]/+page.ts` | Current consumer catch-all route; will become the real-world integration target after the example API stabilizes. |
| `sites/mandalarepo/docs/` | Large existing corpus; current build has invalid legacy Markdown and must not be used as the only correctness fixture. |

## Test Files

| Test | Coverage |
|---|---|
| `packages/docs/src/lib/nav.test.ts` | Existing nested nav semantics and new generated-tree compatibility. |
| `packages/docs/src/lib/content.test.ts` | Path normalization, title fallback, metadata, ordering, hidden pages, index pages, collisions. |
| `packages/sveltekit` | Add a pure source-helper test only if the helper can remain independent of SvelteKit runtime globals. |
| `examples/kit-consumer` production build | End-to-end smoke test that a generated source can render a document and shell. |
| `sites/mandalarepo` `pnpm check` | Consumer type-check after switching from custom `DocsNav` to generated `DocsNav`. |

## Reference Patterns

| File | Pattern |
|---|---|
| `packages/docs/src/lib/nav.ts` | Depth-first leaves, active path discovery, breadcrumbs, pager, stable IDs. |
| `packages/docs/src/lib/nav.test.ts` | Small typed fixture with nested children and behavior-focused assertions. |
| `docs/snippets/page-load.ts` | Existing lazy `import.meta.glob` route loader. |
| `packages/sveltekit/src/index.ts` | Lightweight package helper with no browser/runtime dependency. |
| Fumadocs page-tree conventions | File path + frontmatter + folder metadata become a page tree. |
| Blume content-source model | A Markdown root should be sufficient for navigation discovery with configuration as an override. |

## Risk Assessment

- [x] Breaking changes to public API — avoid changing the meaning of `DocsNav.sections`; add builders/types compatibly.
- [x] Build-time content failures — the mandalarepo corpus contains legacy Markdown that currently fails mdsvex/Svelte compilation; source discovery must surface or filter this explicitly.
- [x] Route collisions — Markdown source keys can map to the same URL; detect deterministically.
- [x] Static hosting behavior — generated route entries must be available for prerendering.
- [x] Scope risk — search, SEO, i18n, CMS sources, and OpenAPI rendering are deferred from this slice.
- ] Database migrations needed.
