# acrolls/sveltekit

Install `acrolls` and use the public `acrolls/sveltekit` entrypoint:

```js
import { createAcrollsSvelteKitMdsvexPreprocessor } from 'acrolls/sveltekit';

preprocess: [vitePreprocess(), createAcrollsSvelteKitMdsvexPreprocessor()]
```

Also re-exports `createAcrollsMdsvexPreprocessor` from `acrolls/mdsvex`. The preprocessor
normalizes narrow Svelte-shaped literals in Markdown before parsing while leaving `.svx`
components untouched. The lower-level options API is exercised by
`examples/kit-consumer` inside the Acrolls workspace.

## Generated Markdown docs

Point a SvelteKit host at any Markdown directory (`docs/`, `content/`, `posts/`, or a
custom path) with one `content()` declaration over a `markdownGlob` loader. The filesystem
root, public URL prefix, and SvelteKit route directory are independent:

```text
root: ../../content           # filesystem location
baseHref: /docs               # public URL location
src/routes/docs/              # SvelteKit route location
```

The first directory level becomes a navigation section, files directly inside it become
items, and deeper directories become nested groups. `index.md` becomes the route for its
containing directory.

```ts
// src/lib/docs/source.ts
import type { Component } from 'svelte';
import { content, markdownGlob } from 'acrolls/content';
import { defineDocsConfig } from 'acrolls/docs/content';

type DocsArticle = Component;

export const docs = content({
  loader: markdownGlob<DocsArticle>({
    body: import.meta.glob('../../content/**/*.md', { import: 'default' }) as Record<
      string,
      () => Promise<DocsArticle>
    >,
    metadata: import.meta.glob('../../content/**/*.md', {
      eager: true,
      import: 'metadata'
    }),
    facts: import.meta.glob('../../content/**/*.md', {
      eager: true,
      import: '__acrollsDocument'
    }),
    root: '../../content'
  }),
  config: defineDocsConfig({
    title: 'Documentation',
    baseHref: '/docs',
    folders: {
      guides: { title: 'Guides' }
    }
  })
}).sourceSync();
```

All globs use the identical pattern string. `body` is lazy (`{ import: 'default' }`) so document
bodies stay out of the eager module graph; the named `metadata` and `facts` globs supply
frontmatter and the preprocessor's static document facts without importing compiled article
components or Shiki into the eager graph. `.sourceSync()` is legal because `markdownGlob` is an
eager loader. The legacy `modules: import.meta.glob(..., { eager: true })` form remains supported
for compatibility, but it eagerly materializes the full compiled modules and is not recommended.

`content()` also accepts `schema` (any Standard Schema validator, brought by the host) and
`filter` (removes a document from every addressable surface, including direct URL access —
unlike `hidden`, which leaves the page unlisted but routeable and prerendered). `filter` is a
publication boundary, not a confidentiality one: the glob loader materializes every matching
file into the module graph before `filter` runs, so a filtered document's compiled body can
still be present in build output. Keep secret or embargoed content out of the globbed directory,
or behind host-owned authentication. `customSource({ list })`
replaces the glob loader with a CMS or API; it is async-only (`await collection.source()`), and
its `live()` seam is declared but unimplemented. Full reference:
[docs/integrate-sveltekit.md](../../docs/integrate-sveltekit.md#e-pattern-2--generated-docs-tree).

Use `docs.nav` for `DocsShell`, `docs.get(params.slug)` for route validation,
`docs.load(params.slug)` for the lazy document component, and `docs.entries()` for static
route generation. `index.md` maps to its containing folder route. The first automatic
source contract is Markdown-first; `.svx` remains supported through normal mdsvex imports
but is not automatically discovered by this helper yet.

### Migrating from `createAcrollsDocsSource`

`createAcrollsDocsSource({ modules, metadata, facts, contentRoot, config })` is still exported,
still works exactly as before, and emits no warning. It is now internally the same code path as
`content()` and is marked `@deprecated` in TSDoc only to point at the newer API — **it is not
scheduled for removal**, so existing hosts need no changes.

| Old option | New location |
|---|---|
| `modules` (lazy `default` glob) | `markdownGlob({ body })` |
| `metadata` (eager `metadata` glob) | `markdownGlob({ metadata })` |
| `facts` (eager `__acrollsDocument` glob) | `markdownGlob({ facts })` |
| `contentRoot` | `markdownGlob({ root })` |
| `config` | `content({ config })`, unchanged |

The returned source is identical — same `nav`, `documents`, `diagnostics`, `get`, `load`, and
`entries` — so routes, layouts, and shell code stay as they are. Migrating buys developer
ergonomics and build-time type safety; it does not change what readers of the published site
receive.
