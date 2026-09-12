# Spec: Content-source and navigation layer

> Authority correction: this historical task spec is superseded by the feature section in
> [`PRODUCT.md`](../PRODUCT.md) and [`PRODUCT-TECH.md`](../PRODUCT-TECH.md). The host owns
> the definition of links, levels, and page/group roles; Acrolls owns scaffolding the
> derived routes, navigation, breadcrumbs, pager, and static entries. Filesystem inference
> is a fallback only.

## Objective

Acrolls should let a SvelteKit host provide a Markdown/mdsvex content root plus an optional
page-tree definition and receive a single typed source object that supports document lookup,
route generation, frontmatter metadata, and a correctly shaped `DocsNav`. The host owns
what is linked, at which level, and whether an entry is a page or group; Acrolls should not
require that definition to be duplicated across route, navigation, breadcrumb, and pager
objects.

This is the first vertical slice toward a drop-in SvelteKit docs solution. It does not
attempt to replace SvelteKit routing or become a hosted CMS.

## Styling scope

The initial drop-in milestone is content and navigation plumbing, not a visual redesign.
It should provide stable semantic structure, states, and integration points while leaving
the host’s typography and visual identity intact.

A later styling phase will add basic docs-shell formatting, typography, spacing, and
responsive polish using custom CSS and pure indented SASS. The intended methodology is
CUBE CSS—Composition, Utility, Block, and Exception—with the cascade and inheritance
treated as useful primitives rather than something to work around. The future work should
align with the patterns in `/Users/amrit/mandala/packages/fractals-styler`, including
token-driven styling and `data-*`/ARIA state attributes where appropriate.

Tailwind is explicitly out of scope for Acrolls’ styling direction. `fractals-styler` may
be used by a host or serve as a reference implementation, but it must not become a
required dependency of the content-source layer.

## Positioning and Differentiation

Acrolls is intended to be the SvelteKit-native equivalent of the developer experience
people seek from Fumadocs and Blume: point a project at Markdown, get a coherent docs
tree, routeable pages, frontmatter-aware metadata, navigation, and polished reading UI.
The equivalence is about the content-to-docs workflow and the integration quality, not a
pixel-for-pixel or API-level clone.

### What Acrolls is different from

1. **SVOCS** is the closest Svelte-first reference: a docs-site generator built around a
   content folder, filesystem routing, `_meta.json`, Pagefind search, Svelte components in
   Markdown, static export, and batteries-included docs-site features. Acrolls should
   learn from that zero-config flow while remaining a package that can be mounted inside
   an existing SvelteKit application, preserving the host’s routes, adapter, layout,
   theme, and deployment choices. SVOCS’s stated motivation and feature set are described
   in its author’s overview: https://dev.to/juddisjudd/why-i-built-svocs-svelte-first-docs-in-2026-13mk

2. **Docsmith** is a comparison point for a docs authoring/build experience, but its
   exact implementation and current feature boundary need to be verified from the
   supplied source before Acrolls makes claims about parity. Acrolls should differentiate
   by remaining Markdown/mdsvex-first, SvelteKit-integrated, source-owned, and composable
   rather than coupling the host to a separate site generator or proprietary authoring
   runtime.

3. **Scribe** is the closest product and architecture reference for Acrolls. Its local
   source describes a deliberately split publishing SDK: compile-time Markdown/MDX
   semantics, a runtime publication boundary, scoped publication styles, and a CLI for
   reviewed repository integration. It explicitly keeps routing, page metadata policy,
   navigation, analytics, deployment, and content storage in the host application. The
   important lesson is the boundary, not a React API to copy:

   - Scribe targets React applications using Next.js or Vite and MDX.
   - Acrolls targets Svelte 5 applications using SvelteKit and mdsvex.
   - Scribe improves the article publication surface and provides deliberate integration
     tooling; it does not infer a docs route tree or generate a navigation model.
   - Acrolls keeps the same host-preserving boundary while adding the missing
     content-source layer: scan Markdown files, normalize frontmatter, derive routes,
     and generate the exact `DocsNav` shape consumed by `@acrolls/docs`.

   This means the intended product is best described as **Scribe’s publishing SDK shape
   for SvelteKit, extended with a Fumadocs/Blume-style content and navigation source**.
   Acrolls should preserve Scribe’s useful constraints: source files remain authoritative,
   integration is explicit and inspectable, compile-time work stays out of reader bundles,
   and the host retains ownership of the surrounding application and its information
   architecture, while Acrolls owns the derived docs scaffolding.

   The local reference points are [`README.md`](../ref/scribe-main/README.md),
   [`docs/ARCHITECTURE.md`](../ref/scribe-main/docs/ARCHITECTURE.md),
   [`packages/mdx/README.md`](../ref/scribe-main/packages/mdx/README.md), and the
   reviewed integration implementation in
   [`packages/cli/src/integrate.ts`](../ref/scribe-main/packages/cli/src/integrate.ts).
   The Scribe site remains a useful product reference, but this spec relies on the local
   source for implementation claims.

### SvelteKit equivalent promise

Acrolls is the SvelteKit equivalent of Fumadocs/Blume when these invariants hold:

- a host page-tree definition is the source of truth;
- Markdown discovery and folder structure provide route/navigation defaults only when the
  host has not defined them;
- frontmatter supplies title, description, visibility, and ordering metadata;
- one generated source powers document loading, `DocsNav`, breadcrumbs, pager, and
  prerender entries;
- SvelteKit integration is explicit, inspectable, and reversible, following Scribe’s
  reviewed-integration principle rather than silently rewriting the host application;
- the host can override labels, ordering, sections, and external links without forking
  the source scanner;
- the result remains ordinary SvelteKit code, so adapters, layouts, auth boundaries, and
  deployment targets remain host-controlled;
- content and navigation output are deterministic, serializable, and testable at build
  time.

Acrolls is not equivalent yet if a host still has to hand-write one navigation entry per
document, manually maintain route/path mapping, or choose between the generated shell and
its existing SvelteKit application architecture. Those are explicit acceptance gaps for
this feature.

### Deliberate non-goals

- Acrolls will not require a new standalone app or replace an existing SvelteKit site.
- Acrolls will not make Pagefind, a search provider, a CMS, or an AI service a required
  dependency of the content-source layer.
- Acrolls will not own the host’s global navigation, authentication, analytics, adapter, or
  deployment configuration.
- Acrolls will not claim that Scribe already provides automatic docs routing or navigation;
  that is the specific capability this feature adds for SvelteKit.
- Acrolls will not copy Fumadocs, Blume, SVOCS, Docsmith, or Scribe branding, templates, or
  proprietary implementation details.

## Assumptions

1. The host still owns the SvelteKit route files, but the catch-all route should be a
   small reusable adapter rather than bespoke content logic.
2. The first content source is local `.md` files discovered through SvelteKit/Vite
   `import.meta.glob`; remote/CMS sources and automatic `.svx` discovery remain later
   extensions.
3. Compiled mdsvex module metadata is the primary document metadata source. The source
   layer does not reimplement YAML parsing for compiled modules.
4. A document without `title` falls back to a humanized filename; a document without a
   description remains valid.
5. `hidden: true` removes a document from generated navigation but does not make its
   route impossible to load when the source contains it.
6. `index.md` is a fallback convention for the containing folder route. An explicit host
   definition can assign any discovered document, route, level, or page/group role instead.
   `.svx` support is deliberately deferred until the Markdown source contract is stable.
7. Navigation ordering is frontmatter `order` first, then stable path/title order.
8. The first release targets one docs surface and one base path per source.

## Configuration strategy

Folder labels should be progressively configurable without making configuration a
requirement for the default case:

1. **Default:** derive a readable label from the folder name (`api-reference` becomes
   `API Reference`).
2. **Typed configuration:** make a TypeScript `defineDocsConfig` API the expressive,
   first-class option. It should support folder labels, descriptions, ordering, hidden
   state, document overrides, section assignment, and external navigation entries.
3. **Basic JSON:** add an optional `meta.json` sidecar as a data-only convenience for
   users who want simple folder metadata without importing a TypeScript config. It should
   be folder-level only: label, description, order, default-open state, and folder
   visibility. Document metadata remains in document frontmatter. The sidecar should be a
   later, additive adapter rather than a second navigation model.
4. **No YAML:** Acrolls will not introduce `folder.yaml` or another YAML-only convention.

When both forms exist, the intended precedence is defaults < `meta.json` < typed
configuration, so an application can start with simple data and graduate to code without
changing the generated source contract. The first implementation should ship the default
behavior and typed configuration; JSON sidecars can follow once the config shape is proven.

## Metadata ownership and precedence

Nothing is hidden by filename, folder depth, or an Acrolls heuristic. A document is hidden
only when the content author or host explicitly sets `hidden: true`:

1. **Document frontmatter** is the normal per-page declaration:

   ```md
   ---
   title: Migration notes
   hidden: true
   ---
   ```

2. **Folder `meta.json`** can explicitly hide a folder and its descendants. This is a
   folder-level navigation decision, not a replacement for document frontmatter.
3. **Typed configuration** can override either source for host-wide policy, migrations,
   generated sections, or conditional configuration.

The effective precedence is defaults < document/folder metadata < typed configuration.
The default is `hidden: false`. A page is never hidden merely because it lacks a title,
has an unusual filename, is nested deeply, or is not linked by another page.

## Commands

```bash
cd /Users/amrit/acrolls
pnpm --filter @acrolls/docs test
pnpm --filter @acrolls/docs check
pnpm --filter @acrolls/sveltekit check
pnpm build
pnpm build:example

cd /Users/amrit/mandala/sites/mandalarepo
pnpm check
```

## Hidden page semantics

`hidden: true` means **unlisted from the generated docs experience**, not private or
unpublished. It is an author’s information-architecture decision: “do not place this in
the normal docs tree.” It is useful for pages that should remain valid and linkable but
should not occupy a normal position in the docs experience, such as:

- migration notes or compatibility pages;
- supplemental reference pages reached from another article;
- landing pages that are linked manually rather than listed in the sidebar; and
- legacy routes that must continue to work while being removed from the primary tree.

A hidden page therefore:

- remains in the generated source lookup;
- remains directly routable and is included in static route entries;
- is omitted from generated sidebar navigation, breadcrumbs, and previous/next pager
  ordering; and
- remains available to host-controlled search/indexing policy, rather than silently being
  treated as access-controlled content.

The UI and documentation should describe this as **Hide from docs navigation** or
**Unlisted**, rather than implying that the page is private. Hidden state must never be
presented as a security boundary. A private or draft document requires host
authentication, a separate content filter, or a deployment policy. Folder visibility from
`meta.json` follows the same navigation-only meaning for the folder and its descendants.

A future visibility model may introduce explicit states such as `public`, `unlisted`, and
`draft`/`private`, but the first source layer should not pretend to enforce those latter
states. The initial `hidden` field is intentionally limited to the unlisted behavior.

## Project Structure

```text
packages/docs/src/lib/content.ts              pure document/source and nav builder
packages/docs/src/lib/content.test.ts         source/nav behavior tests
packages/sveltekit/src/index.ts               SvelteKit glob/source adapter
examples/kit-consumer/src/lib/docs/source.ts  consumer source definition
examples/kit-consumer/src/routes/docs/        generated-source route example
docs/snippets/page-load.ts                    reusable route snippet
```

## Behavior

1. A host can pass a map of discovered Markdown modules and a docs base path to
   the Acrolls source helper.

2. Each source document exposes a stable route path, source key, title, optional
   description, optional frontmatter metadata, and a lazy document loader.

3. Source keys are normalized by removing the configured content-root prefix and the
   `.md` extension. `index` files map to their containing folder path.

4. The generated route path always begins with the configured base path and is normalized
   without duplicate slashes or a trailing slash, except for the base index route.

5. The source rejects or reports duplicate normalized routes instead of silently choosing
   one document.

6. The generated `DocsNav` always satisfies the existing Acrolls shape:
   top-level sections have required `id`, `title`, and `items`; nested groups use
   `children`; leaf pages have `href`.

7. Folder names become group labels by default. Frontmatter `title` overrides the final
   document label. Typed configuration can override folder labels and other navigation
   metadata without changing this source contract.

8. Documents with `hidden: true` remain addressable through the source lookup but do not
   appear in generated sidebar items, breadcrumbs, or pager order. They remain part of
   static route entries because hidden controls discoverability, not routability.

9. Documents with `order` sort before unordered siblings. Equal-order documents use a
   stable normalized path sort so output does not change between machines.

10. The source exposes an entries list suitable for SvelteKit prerendering. Each entry
    contains the route parameters needed by the host catch-all route.

11. Loading a missing route returns a distinguishable not-found result that the host can
    pass to SvelteKit `error(404, ...)`.

12. Loading a document does not eagerly execute every document component in the browser;
    the source preserves lazy loaders for page bodies. Metadata discovery may be eager at
    build time when the host chooses an eager glob.

13. Manual `DocsNav` remains supported as an escape hatch for external links, custom
    ordering, multiple docs surfaces, and navigation items that do not correspond to a
    Markdown file.

14. The generated navigation is deterministic and serializable. It contains no component
    functions, loaders, or filesystem objects.

15. Invalid source metadata produces a clear source/build error identifying the source key
    and field. It must not become an opaque `DocsShell` type error.

16. The feature does not silently promise compilation of malformed legacy Markdown. A
    host can restrict the glob or source set, and Acrolls reports mdsvex compilation errors
    through the normal SvelteKit build.

## Code Style

```ts
import type { DocsNav } from 'acrolls/docs';

export const docsNav = buildDocsNav(documents, {
	baseHref: '/docs',
	title: 'Documentation'
}) satisfies DocsNav;
```

Use Svelte 5 runes in components, TypeScript for package APIs, tabs in TypeScript/Svelte
source, and preserve the existing indented-SASS/CSS boundary. Keep pure path and tree
logic outside Svelte components.

## Testing Strategy

- Unit-test source normalization and tree generation with small in-memory module records.
- Test index routes, hidden pages, metadata fallback, ordering, duplicate routes, nested
  groups, and stable output.
- Preserve all existing `@acrolls/docs` navigation tests.
- Build the kit consumer as the integration smoke test.
- Run `mandalarepo` type-check after replacing its hand-written nav type with generated
  source output.

## Boundaries

- Always: preserve the existing `DocsNav` runtime contract; keep source output serializable;
  keep document bodies lazy; provide deterministic route/nav output; test malformed and
  duplicate inputs.
- Ask first: changing the public `DocsNav` shape; adding a database/CMS dependency; adding
  search/indexing or SEO generation; rewriting the existing mandalarepo corpus.
- Never: execute deferred `.svx` content during metadata discovery; hide route collisions;
  use `as DocsNav` to bypass incompatible runtime shapes; couple Acrolls to mandala-only
  folder conventions.

## Success Criteria

1. A consumer can replace a hand-written `DocsNav` with a generated source and `DocsShell`
   receives a correctly typed nav.
2. Nested folders render as nested sidebar groups without custom recursive types.
3. The catch-all route can load a document by generated slug and expose prerender entries.
4. The example consumer builds and exercises generated navigation.
5. Existing manual navigation remains supported.
6. The feature has unit coverage for all source/tree invariants above.

## Decisions from review

- Folder labels default to humanized folder names and can be overridden by typed
  configuration. Optional `meta.json` support is a later convenience layer; YAML is out.
- `hidden` is a valuable author-controlled unlisted state. Hidden pages remain directly
  loadable but are omitted from generated navigation, breadcrumbs, and pager order; it is
  not a privacy or authentication feature.
- Automatic `.svx` discovery is deferred. The first source contract is Markdown-first;
  mdsvex remains the compiler/runtime integration used by the host.

## Remaining Open Questions

- The remaining design question is whether host-controlled search adapters should receive
  hidden pages by default or require an explicit opt-in. The content source itself should
  expose enough metadata for either policy without making search a required dependency.
