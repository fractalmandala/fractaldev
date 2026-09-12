---
title: Sectioned Docs Collection
---

A markdown docs site in SvelteKit where **the filesystem is the structure**: folder
names give sections and ordering, filenames give URLs, and the sidebar groups pages
by section automatically. Adding a page is dropping a file. Nothing else to edit.

Supersedes the flat recipe in `dynamic-routed-docs.md`, which has no sections, no
ordering, and a nav you maintain by hand.

The shape you end up with:

```
┌─────────────────────┬──────────────────────────────┐
│ GETTING STARTED     │  # Tokens and Theming        │
│   Introduction      │                              │
│   Install           │  All literal values live …   │
│   Structure         │                              │
│ USAGE GUIDE         │                              │
│ › Tokens            │                              │
│   Dimensions        │                              │
│   Containers        │                              │
│ PHILOSOPHY          │  ← prev        next →        │
│   Panini            │                              │
└─────────────────────┴──────────────────────────────┘
```

---

## The principle

**Structure lives in filenames, not frontmatter.**

```
src/content/docs/01-usage-guide/00-tokens.md   →   /docs/usage-guide/tokens
                 ↑  ↑            ↑  ↑
                 │  │            │  └── page slug
                 │  │            └───── sibling order
                 │  └────────────────── section slug + label
                 └───────────────────── section order
```

Frontmatter carries only what is about the *page* — `title`, `description`, `tags`,
`draft`. It never carries order and never carries section.

This matters. The alternative — `id: 6` and `type: Usage Guide` in every file — is
two channels saying the same thing, and it always drifts. A real corpus I converted
had three files claiming `id: 6`, four claiming `type: docs`, and one with no type at
all. A filename cannot drift: the folder *is* the section, and two files cannot have
the same name.

Borrowed from [ogygia](https://github.com/PuruVJ/ogygia)'s content layer, which does
this with a Vite loader macro. This is the same convention, hand-rolled, no dependency.

### Where the content folder goes

Put it at **`src/content/docs/`**. Inside `src/` it is tracked by git by default, and
a repo-root `docs/` folder is a classic `.gitignore` casualty — the site builds
locally and dies on the deploy host with `ENOENT`. If you must use repo-root `docs/`,
check `git check-ignore docs/anything.md` first.

Every path below assumes `src/content/docs/`. Swap the string in the four globs
if you choose otherwise.

---

## Step 0 — mdsvex

If markdown already compiles in your project, skip this.

```bash
pnpm add -D mdsvex
```

`svelte.config.js` (or the `sveltekit({...})` options block in `vite.config.ts` if you
keep config there):

```js
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
	extensions: ['.svelte', '.md'],
	preprocess: [mdsvex({ extensions: ['.md'] }), vitePreprocess()]
};
```

Two things this buys you: `import('…/foo.md')` yields `{ default: Component, metadata }`,
where `metadata` is the parsed frontmatter; and markdown outside `src/routes/` is
still compiled, because the preprocessor matches on extension, not location.

---

## Step 1 — the convention + browser-safe half

`src/lib/docs/docs.ts`

```ts
/**
 * The docs convention, and the half of the collection a browser may hold.
 *
 * A page is `src/content/docs/NN-section/NN-page.md`. The `NN-` prefixes give
 * order, the folder gives the section, stripping the prefixes gives the URL.
 *
 * Only LAZY globs live here — one compiled page and one raw source, fetched
 * per page, never all at once. The nav is built from the same convention in
 * `docs.server.ts`. See "The trap" below for why.
 */
import type { Component } from 'svelte';

export type DocMeta = {
	title?: string;
	description?: string;
	tags?: string[];
	draft?: boolean;
};

/** One page, addressed and placed. Minted server-side, sent down as nav data. */
export type DocEntry = {
	/** Clean address inside the collection: `usage-guide/tokens`. */
	slug: string;
	/** Resolved URL for the `/docs` mount. */
	href: string;
	/** Section slug (`usage-guide`) and its display label (`Usage Guide`). */
	section: string;
	sectionLabel: string;
	title: string;
	description?: string;
};

/** A sidebar section — the only grouping level this corpus has. */
export type DocGroup = {
	slug: string;
	label: string;
	items: DocEntry[];
};

// ── the convention (shared by both halves) ──────────────────────────────────

/** `01-usage-guide` → `usage-guide`. */
export const stripOrder = (segment: string) => segment.replace(/^\d+-/, '') || segment;

/** `01-usage-guide` → 1. No prefix sorts last. */
export const orderOf = (segment: string) => {
	const m = segment.match(/^(\d+)-/);
	return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
};

/** `usage-guide` → `Usage Guide`. The default label; `+meta.json` overrides. */
export const titleCase = (slug: string) =>
	slug
		.split('-')
		.filter(Boolean)
		.map((w) => w[0].toUpperCase() + w.slice(1))
		.join(' ');

/** `/src/content/docs/01-usage-guide/00-tokens.md` → `usage-guide/tokens`. */
export function slugOf(file: string): string {
	return file
		.replace(/^.*\/content\/docs\//, '')
		.replace(/\.md$/, '')
		.split('/')
		.map(stripOrder)
		.join('/');
}

// ── the two lazy views, keyed by slug ───────────────────────────────────────

const bodies = import.meta.glob('/src/content/docs/**/*.md') as Record<
	string,
	() => Promise<{ default: Component; metadata?: DocMeta }>
>;

const raws = import.meta.glob('/src/content/docs/**/*.md', {
	query: '?raw',
	import: 'default'
}) as Record<string, () => Promise<string>>;

const bodyBySlug = new Map(Object.entries(bodies).map(([file, load]) => [slugOf(file), load]));
const rawBySlug = new Map(Object.entries(raws).map(([file, load]) => [slugOf(file), load]));

/** Load one page: its compiled component and its own frontmatter. */
export async function loadDoc(slug: string) {
	const load = bodyBySlug.get(slug);
	if (!load) return undefined;
	const mod = await load();
	return { content: mod.default, meta: mod.metadata ?? {} };
}

/** Load one page's untouched markdown source, frontmatter stripped. */
export async function loadDocRaw(slug: string): Promise<string | undefined> {
	const load = rawBySlug.get(slug);
	if (!load) return undefined;
	return (await load()).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

// ── views over a nav tree (the tree itself is server-built) ─────────────────

/** Every page in reading order — prev/next walks this, across section borders. */
export const flatten = (nav: DocGroup[]): DocEntry[] => nav.flatMap((g) => g.items);

export function neighbours(nav: DocGroup[], slug: string): { prev?: DocEntry; next?: DocEntry } {
	const order = flatten(nav);
	const i = order.findIndex((e) => e.slug === slug);
	if (i < 0) return {};
	return { prev: order[i - 1], next: order[i + 1] };
}
```

The glob pattern **must be a literal string** — Vite reads it statically at build
time. A variable, a template literal, or a constant fails silently with an empty map.

---

## Step 2 — the nav, built from the folder (server-only)

`src/lib/docs/docs.server.ts`

```ts
/**
 * The docs nav, built from the folder itself — server-only.
 *
 * The `.server` suffix is the whole trick. Client and server are separate
 * Rollup passes, so an EAGER glob in here costs the browser nothing — and an
 * eager glob means mdsvex has already parsed every frontmatter block for us.
 * No fs walk, no frontmatter regex, no `process.cwd()`.
 *
 * The same glob in a browser-reachable module drags every compiled page into
 * the entry chunk. That is the only reason this file is separate from
 * `docs.ts`. See "The trap" below for the numbers.
 */
import { orderOf, stripOrder, titleCase, type DocGroup, type DocMeta } from './docs';

const ROOT = '/src/content/docs/';

const metas = import.meta.glob('/src/content/docs/**/*.md', {
	eager: true,
	import: 'metadata'
}) as Record<string, DocMeta | undefined>;

/** `+meta.json` is the ONE naming escape hatch: `{ "label": "..." }`. Never order. */
const labels = import.meta.glob('/src/content/docs/**/+meta.json', {
	eager: true,
	import: 'default'
}) as Record<string, { label?: string } | undefined>;

/** The sidebar tree: sections in folder order, pages in file order. */
export function docsNav(): DocGroup[] {
	const groups = new Map<string, DocGroup & { order: number }>();

	const pages = Object.entries(metas)
		// '…/01-usage-guide/00-tokens.md' → ['01-usage-guide', '00-tokens']
		.map(([file, meta]) => ({ raw: file.slice(ROOT.length, -3).split('/'), meta: meta ?? {} }))
		.filter(({ raw, meta }) => raw.length === 2 && !meta.draft)
		.sort(
			(a, b) =>
				orderOf(a.raw[0]) - orderOf(b.raw[0]) ||
				orderOf(a.raw[1]) - orderOf(b.raw[1]) ||
				a.raw[1].localeCompare(b.raw[1])
		);

	for (const { raw, meta } of pages) {
		const [sectionRaw, pageRaw] = raw;
		const section = stripOrder(sectionRaw);
		const label = labels[`${ROOT}${sectionRaw}/+meta.json`]?.label ?? titleCase(section);
		const slug = `${section}/${stripOrder(pageRaw)}`;

		const group =
			groups.get(section) ??
			groups
				.set(section, { slug: section, label, order: orderOf(sectionRaw), items: [] })
				.get(section)!;

		group.items.push({
			slug,
			href: `/docs/${slug}`,
			section,
			sectionLabel: label,
			title: meta.title ?? titleCase(stripOrder(pageRaw)),
			description: meta.description
		});
	}

	return [...groups.values()].sort((a, b) => a.order - b.order);
}
```

Two globs, one loop, no filesystem API. `import.meta.glob` resolves at build time
against the Vite root, so there is no `process.cwd()` to get wrong on a deploy host,
and HMR re-runs it when you add a file.

The `.server.ts` suffix is load-bearing: Kit fails the build if this module ever
ends up in a client import chain, which is the guard that keeps the eager glob —
and the corpus — server-side.

## Step 3 — the routes

```
src/routes/docs/
  +layout.server.ts      ← loads the nav once for every docs page
  +layout.svelte         ← renders the sidebar
  +page.svelte           ← /docs landing page (your own content)
  [...slug]/
    +page.ts             ← loads one page's body
    +page.svelte         ← renders it, with prev/next
```

`[...slug]` (rest) rather than `[slug]`, so `usage-guide/tokens` arrives as one
param. The sibling `+page.svelte` still wins for `/docs` exactly — an exact route
always beats a rest route.

### `src/routes/docs/+layout.server.ts`

```ts
import { docsNav } from '$lib/docs/docs.server';
import type { LayoutServerLoad } from './$types';

// The nav is the only thing the corpus sends to the browser: titles, hrefs and
// section labels. Same for every docs page, so the layout loads it once and
// `[...slug]` reads it back through `await parent()`.
export const load: LayoutServerLoad = () => ({ nav: docsNav() });
```

### `src/routes/docs/+layout.svelte`

```svelte
<script lang="ts">
	import DocsNav from '$lib/docs/DocsNav.svelte';

	let { children, data } = $props();
</script>

<div class="docs-shell">
	<aside class="docs-sidebar">
		<DocsNav nav={data.nav} />
	</aside>

	<main class="docs-main">
		{@render children()}
	</main>
</div>

<style>
	.docs-shell {
		display: grid;
		grid-template-columns: 16rem minmax(0, 1fr);
		gap: 2rem;
	}
	@media (max-width: 60rem) {
		.docs-shell {
			grid-template-columns: 1fr;
		}
	}
	.docs-sidebar {
		position: sticky;
		top: 0;
		align-self: start;
		max-height: 100dvh;
		overflow-y: auto;
		padding: 2rem 1rem;
	}
</style>
```

### `src/routes/docs/[...slug]/+page.ts`

```ts
import { error } from '@sveltejs/kit';
import { loadDoc, neighbours } from '$lib/docs/docs';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const doc = await loadDoc(params.slug);
	if (!doc) error(404, `Documentation page "${params.slug}" not found`);

	// Title and description come from the page module we just loaded — free,
	// since the body had to be fetched anyway. Only prev/next need the tree.
	const { nav } = await parent();
	return { ...doc, ...neighbours(nav, params.slug) };
};
```

A **universal** load (`+page.ts`, not `+page.server.ts`): the compiled body is a
Svelte component, which cannot cross the server/client serialization boundary. The
lazy glob resolves it in whichever environment is rendering.

### `src/routes/docs/[...slug]/+page.svelte`

```svelte
<script lang="ts">
	let { data } = $props();

	const Content = $derived(data.content);
	const meta = $derived(data.meta);
</script>

<article class="doc">
	<header>
		<h1>{meta.title}</h1>
		{#if meta.description}<p class="doc-summary">{meta.description}</p>{/if}
		{#if meta.tags}
			<ul class="doc-tags">
				{#each meta.tags as tag (tag)}<li>{tag}</li>{/each}
			</ul>
		{/if}
	</header>

	<Content />

	<nav class="doc-pager" aria-label="Documentation pages">
		{#if data.prev}
			<a href={data.prev.href}>
				<small>{data.prev.sectionLabel}</small>
				<span>← {data.prev.title}</span>
			</a>
		{:else}
			<div></div>
		{/if}
		{#if data.next}
			<a href={data.next.href} class="next">
				<small>{data.next.sectionLabel}</small>
				<span>{data.next.title} →</span>
			</a>
		{/if}
	</nav>
</article>

<style>
	.doc-pager {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid currentColor;
	}
	.doc-pager a {
		display: grid;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		border: 1px solid currentColor;
		border-radius: 0.5rem;
		text-decoration: none;
	}
	.doc-pager .next {
		text-align: right;
	}
</style>
```

`const Content = $derived(data.content)` — capitalised, so the template treats it as
a component. `<data.content />` also works but won't update reactively across
client-side navigations between docs pages.

---

## Step 4 — the sidebar

`src/lib/docs/DocsNav.svelte`

```svelte
<script lang="ts">
	/* A pure function of the nav data: one block per section, one link per page,
	   aria-current on the active row so styling and assistive tech agree. */
	import { page } from '$app/state';
	import type { DocGroup } from './docs';

	let { nav = [] }: { nav?: DocGroup[] } = $props();
</script>

<nav class="docs-nav" aria-label="Documentation">
	{#each nav as group (group.slug)}
		<div class="docs-nav-section">
			<span class="docs-nav-label">{group.label}</span>
			<ul>
				{#each group.items as item (item.slug)}
					<li>
						<a
							href={item.href}
							class:is-active={page.url.pathname === item.href}
							aria-current={page.url.pathname === item.href ? 'page' : undefined}
						>
							{item.title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>

<style>
	.docs-nav {
		display: grid;
		gap: 1.5rem;
	}
	.docs-nav-label {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		opacity: 0.6;
	}
	.docs-nav ul {
		margin: 0.5rem 0 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.125rem;
	}
	.docs-nav a {
		display: block;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		text-decoration: none;
	}
	.docs-nav a:hover {
		background: color-mix(in oklab, currentColor 8%, transparent);
	}
	.docs-nav a.is-active {
		background: color-mix(in oklab, currentColor 12%, transparent);
		font-weight: 600;
	}
</style>
```

No structural knowledge lives here. The component never parses a filename — it
renders a tree someone else arranged. That separation is the whole reason this
stays maintainable.

---

## Step 5 — content

```
src/content/docs/
  00-getting-started/
    00-introduction.md
    01-install.md
  01-usage-guide/
    00-tokens.md
    01-dimensions.md
  02-tools-and-agents/
    +meta.json          ← { "label": "Tools and Agents" }
    00-mcp-server.md
```

A page:

```markdown
---
title: Tokens and Theming
description: Fluid scales, the strict colour contract, tokens that modulate across layers.
---

All literal values live in `_00_tokens.sass`. …
```

`+meta.json` is the one naming escape hatch, for when title-casing the folder is
wrong — `tools-and-agents` → "Tools And Agents" (capital A) or `api` → "API
Reference". It carries `label` and nothing else. **Order never goes in here**; that
would be a second channel, which is the thing this design exists to avoid.

---

## The trap: never eager-glob markdown in a *browser-reachable* module

Step 2 eager-globs `metadata`, and that is fine *because it sits in a `.server.ts`*.
Put the identical line in `docs.ts` — or in any module a component imports — and it
looks equally surgical ("only the `metadata` export") but **does not tree-shake**.
Measured on a real 20-page corpus, building both ways:

| | largest client chunk | docs layout chunk |
|---|---|---|
| eager glob in a browser-reachable module | **800 KB**, imported by `entry/app.js` | — |
| same glob, in `.server.ts` (this recipe) | **156 KB** | 4 KB |

Every compiled doc page shipped in the entry chunk, on every route of the site,
including the homepage. That is why the nav lives in a `.server.ts`
instead. The split costs one extra file and buys a 5× smaller entry chunk. Verify
your own build:

```bash
ls -S .svelte-kit/output/client/_app/immutable/chunks/*.js | head -3 | xargs du -h
grep -rl "a distinctive phrase from one doc" .svelte-kit/output/client/_app/immutable/chunks/
```

If a chunk containing doc prose is imported by `entry/app.*.js`, the corpus is leaking.

---

## Optional: prerender the whole corpus

Add alongside `+page.ts` (a route may have both; `entries` may be exported from
either file):

`src/routes/docs/[...slug]/+page.server.ts`

```ts
import { docsNav } from '$lib/docs/docs.server';
import { flatten } from '$lib/docs/docs';
import type { EntryGenerator } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => flatten(docsNav()).map((e) => ({ slug: e.slug }));
```

Verified working — every page lands in `.svelte-kit/output/prerendered/pages/docs/`.

**Bonus, and a warning:** the prerenderer follows in-prose links, so it doubles as a
free broken-link checker — the same job ogygia's `checks: [links()]` does. On the
corpus I converted it failed the build immediately on 19 stale `[…](./06-containers.md)`
links left over from an older flat naming. That is the feature working. Fix the links
(in-prose links should point at *routes* — `/docs/usage-guide/containers` — not at
files), or set `prerender.handleHttpError` in your Kit config while you clean up.

---

## Optional: copy-as-markdown

The `raws` glob in `docs.ts` already carries the untouched source. Anywhere in the
docs subtree:

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import { loadDocRaw } from '$lib/docs/docs';

	let copied = $state(false);

	async function copyMarkdown() {
		const raw = await loadDocRaw(page.params.slug ?? '');
		if (!raw) return;
		await navigator.clipboard.writeText(raw);
		copied = true;
		setTimeout(() => (copied = false), 1800);
	}
</script>

<button onclick={copyMarkdown}>{copied ? 'copied' : 'copy as markdown'}</button>
```

Lazy, so it costs nothing until clicked.

---

## Variant: flat URLs

To serve `/docs/tokens` instead of `/docs/usage-guide/tokens` while keeping the
folders for grouping — ogygia calls this a group `slug` policy — change two things:

```ts
// docs.server.ts, inside the map
slug: pageSlug,
href: `/docs/${pageSlug}`,

// docs.ts
export const slugOf = (file: string) =>
	stripOrder(file.split('/').pop()!.replace(/\.md$/, ''));
```

Page slugs must then be unique across the whole corpus — with sections in the URL
they only have to be unique within a folder. Kit will not warn you; two files named
`00-overview.md` in different sections simply shadow each other.

---

## Checklist / gotchas

- [ ] **Content inside `src/`.** `git check-ignore src/content/docs/x.md` returns
      nothing. A repo-root `docs/` folder is often gitignored, builds fine locally,
      and dies on the deploy host with `ENOENT`.
- [ ] **Glob patterns are literal strings.** No variables, no template literals.
      A dynamic pattern yields an empty map with no error.
- [ ] **Eager-glob markdown only inside `.server.ts`.** See the table above.
- [ ] **`[...slug]`, not `[slug]`.** A nested section path is one param.
- [ ] **Body loads in `+page.ts`, not `+page.server.ts`.** A component cannot be
      serialized across the boundary.
- [ ] **If this lives in a publishable package** (`svelte-package` ships `src/lib`
      to `dist`), keep the collection *out* of `src/lib` — put it in `src/site/`
      or similar, or you publish a glob over your own docs folder to npm.
- [ ] **One prefix style per folder.** `01-` everywhere, not `1-` and `01-` mixed;
      `orderOf` parses fine either way but sorting reads wrong to humans. ogygia
      turns this into a build error; this recipe just trusts you.
- [ ] **`title` in every file's frontmatter.** Missing ones fall back to the
      title-cased filename, which is usually not what you want.

## Adding a page, afterwards

Drop `src/content/docs/01-usage-guide/06-whatever.md` with a `title:`. Done — it
appears in the sidebar, in reading order, with working prev/next. Renaming a section
is a `mv`. Reordering is renumbering. Hiding a page is `draft: true`.

---

## Reference implementation

`fractalstyler`, converted from a flat `id:`/`type:` frontmatter scheme:
`src/site/docs.ts`, `src/site/docs.server.ts`,
`src/site/components/docs-nav.svelte`, `src/routes/docs/`. It keeps its corpus at
repo-root `docs/` and uses a `$site` alias instead of `$lib` (the package ships
`src/lib` to npm), so the glob strings differ from the paths above.
