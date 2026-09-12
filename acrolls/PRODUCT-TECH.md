# Acrolls — Generated docs source and recursive navigation

This is the implementation spec for the feature described in the
[`Generated docs source and recursive navigation`](./PRODUCT.md#feature-generated-docs-source-and-recursive-navigation)
section of `PRODUCT.md`. The repository had no configured Git remote when this spec was
written, so code references use repository-relative links and the inspected commit SHA
`d2d193c4454e0c9bcf3d9992c881db94548320db`.

## Context

Acrolls already has a pure content builder and a SvelteKit adapter. The builder normalizes
Markdown source keys, creates lazy document records, derives `DocsNav`, and exposes lookup
and static entries through [`packages/docs/src/lib/content.ts:101-146`](./packages/docs/src/lib/content.ts#L101-L146)
at commit `d2d193c4454e0c9bcf3d9992c881db94548320db`.

The current implementation is close to the desired tree but has three contract gaps:

- [`packages/docs/src/lib/types.ts:20-41`](./packages/docs/src/lib/types.ts#L20-L41) gives
  `DocsNavNode` an optional `href`, but top-level `DocsNavSection` has no landing-page
  fields.
- [`packages/docs/src/lib/content.ts:161-199`](./packages/docs/src/lib/content.ts#L161-L199)
  treats the filesystem convention `index.md` as product intent. There is no explicit
  host-owned definition for what is linked, at which level, or whether an entry is a page
  or group.
- [`packages/docs/src/lib/content.ts:217-269`](./packages/docs/src/lib/content.ts#L217-L269)
  emits each top-level folder as a section, while
  [`packages/docs/src/lib/content.ts:272-323`](./packages/docs/src/lib/content.ts#L272-L323)
  only models landing links for nested folder nodes. This makes the same folder behave
  differently depending on its depth.

The SvelteKit adapter already keeps page bodies lazy and metadata separate from the body
glob in [`packages/sveltekit/src/index.ts:23-59`](./packages/sveltekit/src/index.ts#L23-L59).
The example consumes the source through a host-owned catch-all route in
[`examples/kit-consumer/src/routes/docs/[...slug]/+page.ts:1-11`](./examples/kit-consumer/src/routes/docs/[...slug]/+page.ts#L1-L11),
so the source contract can improve without replacing SvelteKit routing.

The docs shell already supports a group node with both `href` and `children` in
[`packages/docs/src/lib/DocsNavTree.svelte:37-86`](./packages/docs/src/lib/DocsNavTree.svelte#L37-L86).
Top-level sections are rendered separately by
[`packages/docs/src/lib/DocsAccordion.svelte:32-45`](./packages/docs/src/lib/DocsAccordion.svelte#L32-L45),
which is the UI boundary that must be extended for a top-level folder landing link.

### Frontmatter display contract

Markdown YAML frontmatter is the default source of a document's display metadata. The
SvelteKit content adapter keeps eager frontmatter metadata separate from the lazy article
module, and the generated document record exposes `title` and `description` to navigation and
the host route. Acrolls' standard `PublicationLayout` and `Banner` render those values as the
article title and description; a host that composes its own route must render one of those
primitives (or provide an equivalent accessible header).

The precedence is:

1. explicit host configuration override;
2. YAML frontmatter (`title`, then `description` or `brief` for the subtitle);
3. normalized filename/folder fallback for labels when no title exists.

This keeps author intent in the Markdown file while preserving the host's responsibility for
where and how the document header is composed.

### Navigation identity contract

Navigation IDs are persistence and rendering identities, not display slugs. Auto-generated
IDs must retain enough of the normalized route to distinguish sibling pages with long shared
prefixes. The bounded `slugify()` helper remains appropriate for storage namespaces and
display-oriented values, but it must not be the sole input to a keyed navigation node ID.
`stableId()` provides the full-length normalized identity used by generated pages, groups, and
fallback navigation IDs. Explicit host IDs remain supported and are responsible for being
unique within their navigation surface.

`DocsSidebar` applies a final defensive `claimId()` pass before rendering. It preserves the
first occurrence of an ID and suffixes later collisions deterministically (`-2`, `-3`, …).
This is an isolation boundary for stale package artifacts and imperfect host data; it does not
replace source validation or the generated-source identity tests.

When a package is consumed through its `dist`/`exports` entrypoint, source changes are not
available to the host until the package build runs. Verification must therefore include the
package build, the host build, and an inspection of the host-resolved artifact—not only source
tests and type checks.

Fractal Mandala is an acceptance fixture, not a second product implementation. Its current
generated source is at
`/Users/amrit/mandala/sites/fractalmandala/src/lib/docs/source.ts` in Mandala commit
`600c429aae73747b0af867ba42ec88d9d848f283`; it should consume the canonical Acrolls source
API after the contract is settled.

## Proposed changes

### 1. Make the host definition authoritative

Separate content discovery from information-architecture definition. Discovery reports the
Markdown records that exist. A host-owned definition layer decides which records are linked,
what level they appear at, whether they are pages or groups, which record is a group's
landing link, and which route each linked page receives.

The public configuration should expose this as a typed tree/entry definition rather than
requiring hosts to maintain separate route and navigation objects. The exact field names
should follow the existing `defineDocsConfig` style, but the contract must support at least:

- source-key or document identity;
- `page` versus `group` role;
- parent/group placement and sibling order;
- optional explicit `href`/route;
- optional group landing record;
- label, description, hidden, badge, and default-open overrides.

When no explicit definition is supplied, the current filesystem-derived behavior remains the
fallback: files are pages, folders are groups, and `index.md` may claim its containing
folder route. This fallback is scaffolding convenience, not the product's authority.

Keep `DocsNav.sections` for compatibility with the existing `DocsShell`, but extend the
top-level section record with the same landing-page data that a group node can already
carry:

```ts
type DocsNavSection = {
	id: string;
	title: string;
	href?: string;
	slug?: string;
	description?: string;
	defaultOpen?: boolean;
	items: DocsNavNode[];
};
```

The section remains a collapsible group. When `href` exists, its title is also the link to
the definition's group landing page. This is a compatible widening: existing hand-written
sections without `href` render unchanged, while generated top-level groups no longer lose
their explicitly defined landing link.

Update the navigation helpers in `packages/docs/src/lib/nav.ts` so section landing pages
participate consistently in active-path detection, breadcrumbs, and pager order. Treat a
section landing as the first page in that section for depth-first traversal; do not add a
second breadcrumb label when the active page is the section landing itself.

### 2. Resolve explicit definitions before filesystem defaults

The definition layer has precedence over convenience configuration and filesystem
conventions:

1. explicit host page/group/link/parent definition;
2. typed convenience overrides such as a folder `index` selection;
3. default filesystem inference (`index.md`, folder nesting, and filename routes).

An explicit definition may select `guides/overview.md` as the `/docs/guides` landing page,
place it under another group, or expose it as an ordinary sibling. The file name and
containing folder do not override that definition.

Validate definitions before route-map insertion. A reference to a missing source record,
unknown parent, cycle, duplicate sibling identity, duplicate normalized route, or
contradictory page/group role is a `DocsContentError` that identifies the definition and
source key. A convenience `index` selection that does not exist is also an error; an
implicit default `index.md` simply falls back when absent.

Store the resolved definition and landing record on each internal tree node. This avoids
recomputing host intent while building navigation and makes root, top-level, nested, and
virtual groups use the same algorithm.

### 3. Build one recursive tree at every depth

Refactor `buildNav` and `buildFolderItems` in `packages/docs/src/lib/content.ts` around the
same internal resolved-tree representation:

- root entries become page or group nodes according to the host definition;
- each defined top-level group becomes a section with its optional landing `href`;
- each nested group becomes a group node with its optional landing `href` and recursive
  `children`;
- defined virtual groups are valid even when no physical folder matches them;
- entries are sorted using explicit definition order first and stable source identity second;
- when no definition exists, the filesystem-derived folder tree supplies the fallback order;
- hidden folders and pages are excluded from generated navigation while remaining in source
  lookup and static entries;
- empty folders are omitted from navigation unless they have a visible landing page.

The base mount is not synthesized as a redirect. If no root landing exists, `DocsNav` still
has its configured `baseHref`, but the host-owned route decides what content to render there.
The catch-all `entries()` output contains only actual document routes; the example's explicit
`/docs/+page` route remains responsible for the mount page.

### 4. Keep the docs shell compatible and accessible

Update the following components without changing the manual `DocsNav` escape hatch:

- `DocsAccordion.svelte`: render a section title as a link when `section.href` exists,
  while keeping the disclosure control independently operable and keyboard accessible.
- `DocsSidebar.svelte`: preserve filtering and section identity when section landing data
  is present.
- `nav.ts`: include section landing pages in `flattenDocsNav`, active trails, open-state
  calculation, breadcrumbs, and pager order.
- `DocsNavTree.svelte`: retain the existing group-link behavior as the reference pattern.

Do not move route ownership into the shell. The shell receives serializable navigation and
the current pathname; the host still owns SvelteKit route files and page loading.

The shell is also a layout boundary when the composed option is used. Its public structure
is:

- the left navigation sidebar at `.acrolls-docs-shell__sidebar`;
- the article body at `.acrolls-docs-shell__body`, using one fluid column without a TOC;
- the optional right TOC sidebar at `.acrolls-docs-shell__toc`, added as the second body
  column when `showToc` is enabled.

Hosts that already provide a three-column app shell should use the exported `DocsSidebar`
primitive in the host-owned left rail and keep the center/right regions host-owned. This
avoids nesting two independent sidebar/center/sidebar contracts. `DocsShell` remains the
composed option for hosts that want Acrolls to own the complete docs page layout. When a
complete shell must remain inside a constrained host wrapper, its explicit `fullBleed` prop
provides a viewport breakout; the host should remove ancestor clipping where possible.

### 5. Update the source adapter, example, and docs

The Vite adapter in `packages/sveltekit/src/index.ts` should remain a thin key-normalizing
layer. Update its exported types and documentation only as needed for the widened config.
Keep the lazy default-component glob and the eager module glob separate: Vite needs the
separate lazy glob to keep document bodies out of the eager module graph. Both use the identical
pattern string, and `markdownGlob` reads frontmatter and static document facts off the one eager
module.

Update `examples/kit-consumer` to exercise all of the following from one generated source:

- an explicit root mount definition;
- an explicitly defined group landing page with children;
- a group without a landing link;
- mixed page/group siblings at multiple levels;
- a definition that places a file at a different level from its physical folder;
- fallback behavior for a conventional `index.md` tree when no explicit definition exists.

Update `packages/docs/README.md`, `docs/content-authoring.md`, `docs/docs-shell.md`, and the
reusable route snippets to document the canonical source contract and the no-arbitrary-
redirect mount behavior.

After the Acrolls API is stable, rewire Fractal Mandala's source and docs route to use the
same canonical contract. Keep any fixture-specific layout or styling local to the fixture.

### 6. Preserve boundaries

- Markdown remains the first automatic source; automatic `.svx` discovery stays deferred.
- No Pagefind, CMS, database, search provider, or remote content dependency is introduced.
- `hidden` remains a navigation/discoverability flag, never an authentication mechanism.
- The host owns the page-tree definition; Acrolls owns the derived scaffolding and consistency
  between routes, navigation, breadcrumbs, pager, and static entries.
- The source output contains no loaders or components inside the serializable navigation.
- Existing manual `DocsNav` values continue to type-check and render.

## Testing and validation

Tests should map directly to the numbered behavior invariants in `PRODUCT.md`.

### Pure source tests

Extend `packages/docs/src/lib/content.test.ts` with focused in-memory records covering:

- explicit root mount and no-mount-definition behavior (PRODUCT 1–3, 16);
- explicit page/group roles, parent levels, and landing links (PRODUCT 4–9);
- filesystem fallback for `index.md`, folder nesting, and folder-without-index behavior
  (PRODUCT 4, 6, 8, 10);
- definitions that move a file to a different level or route than its physical path
  (PRODUCT 5, 8, 10);
- missing/ambiguous definitions, cycles, and duplicate normalized routes (PRODUCT 15);
- title fallback, folder overrides, order stability, and child ordering (PRODUCT 11–13);
- hidden pages and hidden folders remaining routable but absent from navigation inputs
  (PRODUCT 14);
- route collisions and invalid metadata errors (PRODUCT 15);
- deterministic serializable nav, lazy loaders, lookup, and entries (PRODUCT 16–19).

Extend `packages/docs/src/lib/nav.test.ts` for section landing pages: flattening, active
trails, open IDs, breadcrumbs without duplicate labels, and pager order. Preserve all
existing manual-nav tests.

Add adapter coverage if the package test setup is introduced; at minimum verify that
`contentRoot` normalization, out-of-root glob keys, lazy loaders, and metadata key matching
remain unchanged in `packages/sveltekit/src/index.ts`.

### Consumer and fixture verification

Run from `/Users/amrit/acrolls`:

```bash
pnpm --filter @acrolls/docs test
pnpm --filter @acrolls/docs check
pnpm --filter @acrolls/sveltekit check
pnpm build
pnpm build:example
```

Then verify the rendered example routes and navigation in the browser, including `/docs`,
folder landing pages, folder groups without landing pages, nested pages, and a missing 404.

Run from `/Users/amrit/mandala/sites/fractalmandala` after refreshing its local Acrolls
package link:

```bash
pnpm check
pnpm build
```

Recheck the browser-rendered article body after the `PageProps` fix recorded in the saved
checkpoint. Existing unrelated accessibility and malformed-list warnings may remain, but
new navigation, route, or article-loading errors are failures.

## Risks and mitigations

- **Public type widening breaks consumers.** Keep new section fields optional, preserve
  existing manual-nav behavior, and run the docs package check before fixture rewiring.
- **Definitions conflict with discovery.** Resolve host definitions before filesystem
  fallback, validate references and cycles, and fail with source-specific `DocsContentError`
  messages instead of silently reinterpreting user intent.
- **Custom landing files create route ambiguity.** Resolve landing candidates before route
  map insertion and fail with source-specific `DocsContentError` messages.
- **Section landing pages break pager or breadcrumbs.** Add explicit nav-helper tests before
  changing the shell components, then compare generated output with existing snapshots or
  focused expectations.
- **Fixture code drifts from the package API.** Update the example first, then use it as the
  canonical integration pattern for Fractal Mandala.
- **Nested host and docs shells contract the reading area.** Use `DocsSidebar` for a host
  that already owns a page-level three-column layout; use `fullBleed` only when the complete
  shell must remain inside a constrained wrapper, and verify the fixture at desktop and
  mobile widths.
- **Dirty worktrees contain unrelated changes.** Work only in the Acrolls and fixture files
  named by this spec; inspect `git diff --stat` and `git status --short` before any commit.

## Execution order

1. Finalize the public definition types, precedence rules, and landing-resolution behavior in
   the pure `@acrolls/docs` package.
2. Add pure source and navigation tests for every PRODUCT invariant in scope.
3. Update shell helpers/components and rerun package checks.
4. Update the example source, routes, content fixtures, and docs.
5. Refresh Fractal Mandala's local package link and canonical source wiring.
6. Run all package, example, fixture, build, and browser verification, then review the
   complete diff against both spec files.
