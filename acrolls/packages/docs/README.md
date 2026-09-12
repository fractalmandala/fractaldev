# acrolls/docs

**Fumadocs-class documentation shell for SvelteKit.**

Config-driven navigation, nested accordions, on-page TOC, breadcrumbs, prev/next pager, and persisted open state — without owning your content pipeline. Pair with `acrolls/mdsvex` + `acrolls/svelte` `Publication` for article bodies.

## Install

Install the public package:

```bash
pnpm add acrolls@latest
```

```js
import 'acrolls/docs/styles.css';
import 'acrolls/styles/foundation.css'; // or default.css
import { DocsShell, type DocsNav } from 'acrolls/docs';
```

## Generated content source

For a Markdown-first external host, declare one collection with `content()` from
`acrolls/content`. The generated source owns the document records, routes, metadata,
`DocsNav`, breadcrumbs, pager order, and static route entries together:

```ts
import { content, markdownGlob } from 'acrolls/content';
import { defineDocsConfig } from 'acrolls/docs/content';

const docs = content({
  loader: markdownGlob({
    body: import.meta.glob('./content/**/*.md', { import: 'default' }),
    modules: import.meta.glob('./content/**/*.md', { eager: true }),
    root: './content'
  }),
  config: defineDocsConfig({
    title: 'Documentation',
    baseHref: '/docs'
  })
}).sourceSync();
```

`content()` also accepts an optional `schema` (any Standard Schema validator the host supplies)
and an optional `filter`, which removes a document from every addressable surface including
direct URL access. Outside Vite, `customSource({ list })` supplies documents from a CMS or API; it is
async-only, so use `await collection.source()` rather than `sourceSync()`.

`createDocsContentSource` remains exported from `acrolls/docs/content` as the lower-level
engine, taking `{ config, documents }` directly:

```ts
import { createDocsContentSource, defineDocsConfig } from 'acrolls/docs/content';

const docs = createDocsContentSource({
  config: defineDocsConfig({
    title: 'Documentation',
    baseHref: '/docs'
  }),
  documents: [
    {
      key: 'index.md',
      metadata: { title: 'Welcome' },
      load: () => import('./content/index.md').then((module) => module.default)
    }
  ]
});
```

Folder names are humanized by default, so `guides/advanced` becomes nested `Guides` →
`Advanced` navigation without any folder configuration. You can omit `folders` entirely.
Typed configuration is only for presentation overrides such as folder labels, ordering,
visibility, badges, and landing filenames. `hidden: true` means unlisted from docs navigation;
it does not make a page private — the route still exists, is still prerendered, and still
renders for anyone with the link. To make a document unreachable, use the collection's `filter`
option, which removes it before routes are built. `filter` is a publication boundary, not a
confidentiality one — with the glob loader the document's compiled body can still be present in
build output, so keep secret or embargoed content out of the globbed directory entirely.

For example, this overrides one folder while all other folders remain automatic:

```ts
folders: {
  guides: { title: 'Guides & tutorials', order: 1 }
}
```

When the host owns a different information architecture from the filesystem, use `entries`
to define links, levels, page/group roles, landing pages, and route overrides. Acrolls uses
that definition to scaffold navigation, routes, breadcrumbs, pager order, and static
entries. Filesystem nesting and `index.md` are fallback conventions only.

```ts
entries: {
  guides: {
    kind: 'group',
    landing: 'guides/index.md'
  },
  'guides/installation': {
    parent: 'guides',
    href: '/docs/guides/install'
  }
}
```

The pure entry is intentionally separate from the Svelte component barrel so it can be
used from SvelteKit configuration and build-time source code without evaluating `.svelte`
components.

The current automatic source contract discovers `.md` files. Normal mdsvex routes may use
`.svx`; automatic `.svx` discovery is deliberately deferred. The `acrolls/sveltekit`
entrypoint accepts source globs directly and is used by `examples/kit-consumer`.

## Nested nav

```ts
export const developerNav: DocsNav = {
  title: 'Developer',
  baseHref: '/docs/developer',
  storageKey: 'dharmalib-developer', // localStorage namespace
  sections: [
    {
      id: 'core',
      title: 'Core systems',
      defaultOpen: true,
      items: [
        { title: 'Architecture', href: '/docs/developer/architecture' },
        {
          id: 'data',
          title: 'Data layer',
          defaultOpen: true,
          children: [
            { title: 'Corpus pipeline', href: '/docs/developer/corpus-pipeline' },
            { title: 'Artifact contracts', href: '/docs/developer/artifact-contracts' }
          ]
        }
      ]
    }
  ]
};
```

## Shell

```svelte
<script>
  import { page } from '$app/state';
  import { DocsShell } from 'acrolls/docs';
  import { developerNav } from '$lib/docs/developer-nav';
  import 'acrolls/docs/styles.css';
  let { children } = $props();
</script>

<DocsShell
  nav={developerNav}
  pathname={page.url.pathname}
  homeHref="/"
  homeLabel="App"
  showToc={true}
  persistOpen={true}
>
  {@render children()}
</DocsShell>
```

If the host already owns the page-level layout, compose only the generated navigation in its
existing sidebar:

```svelte
<script>
  import { page } from '$app/state';
  import { DocsSidebar } from 'acrolls/docs';
  import { developerNav } from '$lib/docs/developer-nav';
</script>

<main class="appbody">
  <aside class="sidebarleft">
    <DocsSidebar nav={developerNav} pathname={page.url.pathname} filterable />
  </aside>
  <article class="bodymain">{@render children()}</article>
  <aside class="sidebarright"><!-- host-owned TOC or tools --></aside>
</main>
```

Use `DocsShell` when Acrolls should own the complete docs page scaffold. If that complete
shell must remain inside a constrained host wrapper, pass `fullBleed`; otherwise prefer
mounting it outside the host's competing layout.

### Features

| Feature | API |
|---|---|
| Nested sidebar groups | `DocsNavNode.children` (unlimited depth) |
| Accordion open state | `persistOpen` → `localStorage` key `acrolls-docs:open:<storageKey>` |
| On-page TOC | `showToc` scans `h2–h3` in the article (configurable levels) |
| Breadcrumbs | Auto from nav trail |
| Prev / next | Flattened leaf order |
| Mobile | Drawer sidebar + menu button |
| Filter | Sidebar search expands matching groups |
| Host-owned layout | `DocsSidebar` composes generated navigation into an existing rail |

## Roadmap (product)

Themes, full marketing/docs site, npm publish — see root `PRODUCT.md`.
