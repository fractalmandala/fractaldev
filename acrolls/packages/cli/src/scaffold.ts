/**
 * `acrolls create` — project scaffold templates.
 *
 * Pure template generation: given resolved {@link ScaffoldOptions}, return every file a minimal,
 * pre-wired Acrolls SvelteKit docs project needs. Kept separate from the filesystem orchestration
 * in `create.ts` so the templates are unit-testable and cannot drift from the verified
 * `examples/kit-consumer` host or the canonical wiring in `docs/getting-started.md`.
 *
 * Design choices (each mirrors the green example):
 *   - Plain-CSS entrypoints (`acrolls/styles/<mode>.css` + `acrolls/docs/styles.css`) — no
 *     preprocessor assumption, matching the framework's CSS-first contract.
 *   - `createAcrollsSvelteKitMdsvexPreprocessor` with an explicit `DocsArticleLayout.svelte`
 *     (the `Publication` wrapper) so `.md` bodies get the client enhancers.
 *   - Single-corpus `content({ loader: markdownGlob({ body, metadata, facts, root }) })` with a
 *     valibot frontmatter schema and authored-mode conventions.
 *   - `index.md` files carry a description only — an explicit index title is ignored and warns,
 *     so the root home inherits the config title and folder indexes derive their folder name.
 *   - adapter-static + root `prerender` so the build emits `build/` and `search-index` works.
 */

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export type ScaffoldOptions = {
	/** npm package name (lowercase, dash-separated). */
	name: string;
	/** Human-facing docs/site title. */
	title: string;
	/** Public docs base href, e.g. `/docs`. */
	baseHref: string;
	/** Base style preset imported by the root layout. */
	mode: 'foundation' | 'default';
	/** Package manager used only for printed instructions and the README. */
	packageManager: PackageManager;
	/** Range for the `acrolls` dependency, kept in sync with the running CLI version. */
	acrollsVersion: string;
};

export type ScaffoldFile = { path: string; contents: string };

const ACROLLS_HOME = 'https://github.com/fractalmandala/Acrolls';

const PM_INSTALL: Record<PackageManager, string> = {
	npm: 'npm install',
	pnpm: 'pnpm install',
	yarn: 'yarn',
	bun: 'bun install'
};
const PM_DEV: Record<PackageManager, string> = {
	npm: 'npm run dev',
	pnpm: 'pnpm dev',
	yarn: 'yarn dev',
	bun: 'bun run dev'
};
const PM_BUILD: Record<PackageManager, string> = {
	npm: 'npm run build',
	pnpm: 'pnpm build',
	yarn: 'yarn build',
	bun: 'bun run build'
};
const PM_EXEC: Record<PackageManager, string> = {
	npm: 'npx acrolls',
	pnpm: 'pnpm exec acrolls',
	yarn: 'yarn acrolls',
	bun: 'bunx acrolls'
};

/** Printed next-step commands for a package manager — one source for the console and README. */
export function packageManagerCommands(pm: PackageManager): {
	install: string;
	dev: string;
	build: string;
	exec: string;
} {
	return { install: PM_INSTALL[pm], dev: PM_DEV[pm], build: PM_BUILD[pm], exec: PM_EXEC[pm] };
}

/** Lowercase a directory name into a valid, unscoped npm package name. */
export function deriveName(dirName: string): string {
	const slug = dirName
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/^[-._]+/, '')
		.replace(/[-._]+$/, '')
		.replace(/-{2,}/g, '-');
	return slug || 'acrolls-docs';
}

/** Humanize a package/dir name into a title: `my-docs` → `My Docs`. */
export function deriveTitle(name: string): string {
	const words = name
		.replace(/\.(md|svx)$/i, '')
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
	return words.length ? words.join(' ') : 'Documentation';
}

/** `/docs` → `docs`; `/docs/v1` → `docs/v1`; guards against an empty segment. */
export function routeSegment(baseHref: string): string {
	const seg = baseHref
		.replace(/^\/+/, '')
		.replace(/\/+$/, '')
		.replace(/\/{2,}/g, '/');
	return seg || 'docs';
}

function up(levels: number): string {
	return '../'.repeat(levels);
}

/**
 * Build the full file list for the scaffold. Paths are POSIX-relative to the project root; the
 * caller resolves and writes them.
 */
export function scaffoldFiles(opts: ScaffoldOptions): ScaffoldFile[] {
	const seg = routeSegment(opts.baseHref);
	const segDepth = seg.split('/').filter(Boolean).length;
	// From `src/routes/<seg>/…` back to `src/lib/docs`.
	const libFromRoute = `${up(segDepth + 1)}lib/docs`;
	// From `src/routes/<seg>/[…slug]/…` — one level deeper.
	const libFromSlug = `${up(segDepth + 2)}lib/docs`;
	// `source.ts` lives at a fixed depth, so the content glob root never changes.
	const contentRoot = '../../content';

	const install = PM_INSTALL[opts.packageManager];
	const dev = PM_DEV[opts.packageManager];
	const build = PM_BUILD[opts.packageManager];
	const exec = PM_EXEC[opts.packageManager];

	const files: ScaffoldFile[] = [];
	const add = (path: string, contents: string) => files.push({ path, contents });

	// --- Project manifest -------------------------------------------------
	add(
		'package.json',
		JSON.stringify(
			{
				name: opts.name,
				version: '0.0.1',
				private: true,
				type: 'module',
				scripts: {
					dev: 'vite dev',
					build: 'vite build && acrolls search-index',
					preview: 'vite preview',
					check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json'
				},
				dependencies: {
					acrolls: `^${opts.acrollsVersion}`
				},
				devDependencies: {
					'@sveltejs/adapter-static': '^3.0.10',
					'@sveltejs/kit': '^2.62.0',
					'@sveltejs/vite-plugin-svelte': '^6.1.3',
					mdsvex: '^0.12.6',
					pagefind: '^1.5.2',
					svelte: '^5.38.1',
					'svelte-check': '^4.3.1',
					typescript: '^5.9.2',
					valibot: '^1.1.0',
					vite: '^7.1.3'
				}
			},
			null,
			2
		) + '\n'
	);

	add(
		'tsconfig.json',
		JSON.stringify(
			{
				extends: './.svelte-kit/tsconfig.json',
				compilerOptions: {
					strict: true,
					moduleResolution: 'bundler',
					module: 'esnext',
					target: 'esnext',
					verbatimModuleSyntax: true,
					isolatedModules: true,
					skipLibCheck: true
				}
			},
			null,
			2
		) + '\n'
	);

	add(
		'.gitignore',
		`node_modules
/build
/.svelte-kit
/package
.env
.env.*
!.env.example
.DS_Store
*.log
vite.config.ts.timestamp-*
vite.config.js.timestamp-*
`
	);

	add(
		'vite.config.ts',
		`import adapter from '@sveltejs/adapter-static';
import { fileURLToPath } from 'node:url';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { createAcrollsSvelteKitMdsvexPreprocessor } from 'acrolls/sveltekit';
import { defineConfig } from 'vite';

// Wraps every Markdown/SVX body in the Publication enhancer (callouts, figures,
// Mermaid, copy buttons). Point this at your own layout to customize the article
// container. Acrolls does not choose your deploy target — swap the adapter freely.
const docsArticleLayout = fileURLToPath(
\tnew URL('./src/lib/docs/DocsArticleLayout.svelte', import.meta.url)
);

export default defineConfig({
\tplugins: [
\t\tsveltekit({
\t\t\textensions: ['.svelte', '.svx', '.md'],
\t\t\tpreprocess: [
\t\t\t\tvitePreprocess(),
\t\t\t\tcreateAcrollsSvelteKitMdsvexPreprocessor({
\t\t\t\t\tlayout: { _: docsArticleLayout },
\t\t\t\t\tdocs: { mode: 'authored' }
\t\t\t\t})
\t\t\t],
\t\t\tadapter: adapter()
\t\t})
\t]
});
`
	);

	// --- App shell --------------------------------------------------------
	add(
		'src/app.html',
		`<!doctype html>
<html lang="en">
\t<head>
\t\t<meta charset="utf-8" />
\t\t<link rel="icon" href="%sveltekit.assets%/favicon.svg" />
\t\t<meta name="viewport" content="width=device-width, initial-scale=1" />
\t\t%sveltekit.head%
\t</head>
\t<body data-sveltekit-preload-data="hover">
\t\t<div style="display: contents">%sveltekit.body%</div>
\t</body>
</html>
`
	);

	add(
		'src/app.d.ts',
		`// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
\tnamespace App {}
}

export {};
`
	);

	add(
		'src/content.d.ts',
		`declare module '*.md' {
\timport type { Component } from 'svelte';
\tconst component: Component;
\texport default component;
\texport const metadata: Record<string, unknown>;
}

declare module '*.svx' {
\timport type { Component } from 'svelte';
\tconst component: Component;
\texport default component;
\texport const metadata: Record<string, unknown>;
}
`
	);

	add(
		'static/favicon.svg',
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" role="img" aria-label="Acrolls">
\t<rect width="32" height="32" rx="7" fill="#1f2430" />
\t<text x="16" y="23" font-family="system-ui, sans-serif" font-size="19" font-weight="700" text-anchor="middle" fill="#ffffff">A</text>
</svg>
`
	);

	// --- Root route -------------------------------------------------------
	add(
		'src/routes/+layout.svelte',
		`<script lang="ts">
\timport 'acrolls/styles/${opts.mode}.css';
\timport type { Snippet } from 'svelte';

\tlet { children }: { children: Snippet } = $props();
</script>

{@render children()}
`
	);

	add('src/routes/+layout.ts', `export const prerender = true;\n`);

	add(
		'src/routes/+page.svelte',
		`<main>
\t<h1>${opts.title}</h1>
\t<p>Your Acrolls documentation site is ready.</p>
\t<p><a href="${opts.baseHref}">Open the docs &rarr;</a></p>
</main>
`
	);

	// --- Docs route -------------------------------------------------------
	add(
		`src/routes/${seg}/+layout.svelte`,
		`<script lang="ts">
\timport 'acrolls/docs/styles.css';
\timport { page } from '$app/state';
\timport { DocsShell } from 'acrolls/docs';
\timport type { DocsTocItem } from 'acrolls/docs';
\timport { docs } from '${libFromRoute}/source';
\timport type { Snippet } from 'svelte';

\tlet { children }: { children: Snippet } = $props();

\t// Derive the index check from the configured base href — never hardcode the route.
\tconst base = docs.nav.baseHref;
\tconst isIndex = $derived(page.url.pathname === base || page.url.pathname === base + '/');
\tconst currentDoc = $derived(docs.get(page.url.pathname));
\t// Compile-time headings render the TOC server-side (present for crawlers and no-JS readers).
\tconst headings = $derived(currentDoc?.metadata?.headings as DocsTocItem[] | undefined);
</script>

<DocsShell
\tnav={docs.nav}
\tpathname={page.url.pathname}
\tshowToc={!isIndex}
\tshowPager={!isIndex}
\t{headings}
\tsiteName="${opts.title}"
>
\t{@render children()}
</DocsShell>
`
	);

	add(
		`src/routes/${seg}/+page.ts`,
		`import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { docs } from '${libFromRoute}/source';

export const load: PageLoad = async () => {
\tconst document = docs.get('');
\tif (!document) error(404, 'Documentation index not found');
\tconst Article = await document.loader();
\treturn { slug: '', Article };
};
`
	);

	add(
		`src/routes/${seg}/+page.svelte`,
		`<script lang="ts">
\timport DocumentPage from '${libFromRoute}/DocumentPage.svelte';
\tlet { data } = $props();
</script>

<DocumentPage slug={data.slug} Article={data.Article} />
`
	);

	add(
		`src/routes/${seg}/[...slug]/+page.ts`,
		`import type { EntryGenerator, PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { docs } from '${libFromSlug}/source';

export const entries: EntryGenerator = () =>
\tdocs.documents.filter((document) => document.slug).map((document) => ({ slug: document.slug }));

export const load: PageLoad = async ({ params }) => {
\tconst slug = params.slug ?? '';
\tconst document = docs.get(slug);
\tif (!document) error(404, 'Documentation page not found: ' + (slug || 'index'));
\tconst Article = await document.loader();
\treturn { slug, Article };
};
`
	);

	add(
		`src/routes/${seg}/[...slug]/+page.svelte`,
		`<script lang="ts">
\timport DocumentPage from '${libFromSlug}/DocumentPage.svelte';
\tlet { data } = $props();
</script>

<DocumentPage slug={data.slug} Article={data.Article} />
`
	);

	// --- Docs library -----------------------------------------------------
	add(
		'src/lib/docs/source.ts',
		`import type { Component } from 'svelte';
import * as v from 'valibot';
import { content, markdownGlob } from 'acrolls/content';
import { defineDocsConfig } from 'acrolls/docs/content';

type DocsArticle = Component;

// Frontmatter is validated with valibot. \`title\` stays optional here because the engine's
// authored-mode admission rule already requires titles on ordinary pages and derives index
// titles from their folder, so a required-title schema would double-reject index pages.
const frontmatter = v.object({
\ttitle: v.optional(v.string()),
\tdescription: v.optional(v.string()),
\torder: v.optional(v.number()),
\thidden: v.optional(v.boolean()),
\tdraft: v.optional(v.boolean())
});

export const docs = content({
\tloader: markdownGlob<DocsArticle>({
\t\t// Two globs on the identical pattern: a lazy body glob keeps compiled articles and
\t\t// their Shiki runtime out of the eager module graph; metadata/facts stay eager.
\t\tbody: import.meta.glob('${contentRoot}/**/*.md', { import: 'default' }) as Record<
\t\t\tstring,
\t\t\t() => Promise<DocsArticle>
\t\t>,
\t\tmetadata: import.meta.glob('${contentRoot}/**/*.md', { eager: true, import: 'metadata' }),
\t\tfacts: import.meta.glob('${contentRoot}/**/*.md', {
\t\t\teager: true,
\t\t\timport: '__acrollsDocument'
\t\t}),
\t\troot: '${contentRoot}'
\t}),
\tschema: frontmatter,
\tfilter: (entry) => !entry.data.draft,
\tconfig: defineDocsConfig({
\t\ttitle: '${opts.title}',
\t\tbaseHref: '${opts.baseHref}',
\t\tconvention: {
\t\t\tmode: 'authored',
\t\t\tfrontmatter: {
\t\t\t\tordinaryPageTitle: 'required',
\t\t\t\tindexTitle: 'folder',
\t\t\t\tdescription: 'optional',
\t\t\t\tleadingH1: 'suppress-and-warn'
\t\t\t}
\t\t}
\t})
}).sourceSync();
`
	);

	add(
		'src/lib/docs/DocumentPage.svelte',
		`<script lang="ts">
\timport type { Component } from 'svelte';
\timport { DocsPageHeader } from 'acrolls/docs';
\timport { docs } from './source';

\t// The Article is resolved in the route \`load\` so it prerenders with content — SSR, SEO,
\t// and Pagefind all need the prose in the static HTML, not behind an {#await}.
\tlet { slug, Article }: { slug: string; Article?: Component } = $props();
\tconst document = $derived(docs.get(slug));
</script>

{#if document}
\t<DocsPageHeader title={document.title} description={document.description} />
\t{#if Article}<Article />{/if}
{:else}
\t<p>Documentation page not found.</p>
{/if}
`
	);

	add(
		'src/lib/docs/DocsArticleLayout.svelte',
		`<script lang="ts">
\timport { Publication } from 'acrolls/svelte';
</script>

<Publication>
\t<slot />
</Publication>
`
	);

	// --- Starter content (warning-free: index files carry no title, no leading H1) ---
	add(
		'src/content/index.md',
		`---
description: Welcome to your new Acrolls documentation site.
---

This is your documentation home. It maps to \`${opts.baseHref}\` and is the first page readers land on.
Its title comes from the docs source config, so this file carries a description only.

## Next steps

- Edit \`src/content/index.md\` to change this page.
- Add \`.md\` files under \`src/content/\` — routes, navigation, breadcrumbs, and the pager are generated automatically.
- Open the **Guides** section to see a nested folder become a nav group.

Run \`${dev}\` to preview locally and \`${build}\` to produce the static site and its search index.
`
	);

	add(
		'src/content/getting-started.md',
		`---
title: Getting started
description: Author content and build your documentation site.
order: 1
---

## Author

Write Markdown under \`src/content/\`. Each file becomes a route and its frontmatter supplies the title.

| Frontmatter | Purpose |
| --- | --- |
| \`title\` | Page title (required for ordinary pages) |
| \`description\` | Short summary for SEO and cards |
| \`order\` | Sort position within a folder |
| \`draft\` | Set \`true\` to exclude a page from the build |

A page's leading \`#\` heading is suppressed automatically — put the title in frontmatter and let
the shell render it, rather than duplicating it as an H1.

## Build

Produce the static site and the Pagefind search bundle:

\`\`\`bash
${build}
\`\`\`

The build runs \`vite build\` then \`acrolls search-index\`. Search is generated at build time, so
there is no runtime search service to host.
`
	);

	add(
		'src/content/guides/index.md',
		`---
description: Task-oriented guides for your documentation site.
---

Pages in this folder are grouped under **Guides** in the sidebar. The group label is derived from
the folder name; override it (or set an order, badge, or landing page) in \`src/lib/docs/source.ts\`
when you need a presentation the filesystem does not express.
`
	);

	add(
		'src/content/guides/components.md',
		`---
title: Content components
description: Rich blocks available in .svx content.
order: 1
---

Acrolls ships content primitives — \`Callout\`, \`Figure\`, \`Tabs\`, \`CodeGroup\`, \`Steps\`, and
\`Cards\` — imported from \`acrolls/svelte\`. They are Svelte components, so use them inside a
\`.svx\` file (executable Markdown) rather than a plain \`.md\` file:

\`\`\`svelte
<script>
  import { Steps, Step } from 'acrolls/svelte';
</script>

<Steps>
  <Step title="Install">Add the acrolls package.</Step>
  <Step title="Author">Write Markdown or .svx.</Step>
</Steps>
\`\`\`

Every document body is already wrapped in \`Publication\`, which enhances fenced code, tables,
callouts, and Mermaid diagrams authored in plain Markdown.
`
	);

	// --- Scaffold README --------------------------------------------------
	add(
		'README.md',
		`# ${opts.title}

A minimal [SvelteKit](https://svelte.dev) documentation site scaffolded with
[Acrolls](${ACROLLS_HOME}).

## Develop

\`\`\`bash
${install}
${dev}
\`\`\`

## Build

\`\`\`bash
${build}
\`\`\`

The build runs \`vite build\` then \`acrolls search-index\` to generate the Pagefind search bundle
into the static output.

## Layout

- \`src/content/\` — Markdown corpus; routes, nav, breadcrumbs, and the pager are generated.
- \`src/lib/docs/source.ts\` — the docs content source (frontmatter schema + conventions).
- \`src/routes/${seg}/+layout.svelte\` — the \`DocsShell\` wiring.
- \`vite.config.ts\` — the Acrolls mdsvex preprocessor and adapter.

## CLI

\`\`\`bash
${exec} validate src/content   # check the corpus
${exec} onboard               # guided host checkpoints
${exec} api-ref <spec>        # generate API reference pages
\`\`\`

See the [Acrolls CLI reference](${ACROLLS_HOME}/blob/main/docs/cli.md) for every command.
`
	);

	return files;
}
