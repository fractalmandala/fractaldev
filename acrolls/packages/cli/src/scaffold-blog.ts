/**
 * `acrolls create --with-blog` — blog genre templates.
 *
 * Generated on top of the docs scaffold. Every route consumes the *product* blog API
 * (`listPosts`, `docsRss` / `docsAtom` / `docsJsonFeed`, `listTags` / `postsForTag` /
 * `resolveTag`, `<PostTags>`) rather than shipping bespoke markup the host must maintain.
 *
 * Generated surfaces:
 *   /<blog>/                 post index (newest first)
 *   /<blog>/<slug>           post page with linked tags
 *   /<blog>/tags             distinct tag index with counts
 *   /<blog>/tags/<slug>      posts for one tag
 *   /<blog>/<slug>.md        Markdown content negotiation
 *   /<blog>/rss.xml          RSS 2.0
 *   /<blog>/atom.xml         Atom 1.0
 *   /<blog>/feed.json        JSON Feed 1.1
 */

import type { ScaffoldFile } from './scaffold.js';

export type BlogScaffoldOptions = {
	/** Public blog base href, e.g. `/blog` (already normalized, no trailing slash). */
	href: string;
	/** Site title used as the feed title. */
	title: string;
	/** Absolute site origin for feed URLs, or undefined for root-relative feeds. */
	site?: string;
	/** Content directory relative to the project root, e.g. `src/content-blog`. */
	contentDir: string;
};

function up(levels: number): string {
	return '../'.repeat(levels);
}

/** Build the blog file set. Paths are POSIX-relative to the project root. */
export function blogScaffoldFiles(opts: BlogScaffoldOptions): ScaffoldFile[] {
	const files: ScaffoldFile[] = [];
	const add = (path: string, contents: string) => files.push({ path, contents });

	const seg = opts.href.replace(/^\/+|\/+$/g, '') || 'blog';
	const segDepth = seg.split('/').filter(Boolean).length;
	// From `src/routes/<seg>/…` back to `src/lib/blog`.
	const libFromRoute = `${up(segDepth + 1)}lib/blog`;
	// From `src/routes/<seg>/[...slug]/…` (one deeper).
	const libFromSlug = `${up(segDepth + 2)}lib/blog`;
	// From `src/routes/<seg>/rss.xml/…` (one deeper than the segment root, like [...slug]).
	const libFromFeed = `${up(segDepth + 2)}lib/blog`;
	// From `src/routes/<seg>/tags/[tag]/…` (two deeper).
	const libFromTag = `${up(segDepth + 3)}lib/blog`;
	// The content root is written at its project-relative path (e.g. `src/content-blog`),
	// while the glob inside `src/lib/blog/source.ts` is relative to that file: `src/lib/blog`
	// sits one level below `src/`, so `src/content-blog` becomes `../../content-blog`.
	const contentRoot = opts.contentDir.replace(/^\.\//, '').replace(/\/+$/, '');
	const globRoot = contentRoot.replace(/^src\//, '');
	const contentGlob = `${up(2)}${globRoot}`;

	const siteLine = opts.site ? `\n\t\tsite: '${opts.site}',` : '';

	// --- content source ---------------------------------------------------
	add(
		`src/lib/blog/source.ts`,
		`import type { Component } from 'svelte';
import { content, markdownGlob, markdownRaw } from 'acrolls/content';
import { acrollsFields, dated, defineDocsConfig } from 'acrolls/docs';

type BlogArticle = Component;

/**
 * Blog content source. Posts are ordinary Markdown with frontmatter:
 *
 *   ---
 *   title: Hello
 *   description: One-line summary used in feeds and the index.
 *   date: 2025-01-31      # optional — a YYYY-MM-DD- filename prefix also works
 *   author: You           # optional
 *   tags: [notes, ship]   # optional — powers the tag index and /tags/<slug>
 *   ---
 *
 * \`acrollsFields.post\` requires \`date\`. If your corpus has no dates, use
 * \`acrollsFields.page\` and read posts with \`listPosts(source, { undated: 'include' })\`.
 */
export const raw = markdownRaw({
	raw: import.meta.glob('${contentGlob}/**/*.md', {
		query: '?raw',
		import: 'default',
		eager: true
	}) as Record<string, string>,
	root: '${contentGlob}'
});

export const blog = content({
	loader: markdownGlob<BlogArticle>({
		body: import.meta.glob('${contentGlob}/**/*.md', { import: 'default' }) as Record<
			string,
			() => Promise<BlogArticle>
		>,
		metadata: import.meta.glob('${contentGlob}/**/*.md', { eager: true, import: 'metadata' }),
		facts: import.meta.glob('${contentGlob}/**/*.md', {
			eager: true,
			import: '__acrollsDocument'
		}),
		root: '${contentGlob}'
	}),
	schema: acrollsFields.post,
	filter: (entry) => !entry.data.draft,
	config: defineDocsConfig({
		title: '${opts.title}',${siteLine}
		baseHref: '${opts.href}',
		subtitle: 'Posts, feeds, and tags',
		// A \`YYYY-MM-DD-\` filename prefix both orders posts and is stripped from the slug;
		// frontmatter \`date\` stays the authoritative value when present.
		naming: dated(),
		convention: {
			mode: 'authored',
			frontmatter: {
				ordinaryPageTitle: 'required',
				description: 'optional',
				leadingH1: 'suppress-and-warn'
			}
		}
	})
}).sourceSync();

/** Shared options for every tag helper and the PostTags component. */
export const blogTagOptions = {
	baseHref: '${opts.href}',
	tagsPath: 'tags'
};
`
	);

	// --- layout -----------------------------------------------------------
	add(
		`src/routes/${seg}/+layout.svelte`,
		`<script lang="ts">
	import { page } from '$app/state';
	import { DocsShell, DocsSeo } from 'acrolls/docs';
	import type { DocsTocItem } from 'acrolls/docs';
	import { blog } from '${libFromRoute}/source';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const base = blog.nav.baseHref;
	const isIndex = $derived(page.url.pathname === base || page.url.pathname === \`\${base}/\`);
	const currentDoc = $derived(blog.get(page.url.pathname));
	const headings = $derived(currentDoc?.metadata?.headings as DocsTocItem[] | undefined);
</script>

<DocsSeo nav={blog.nav} pathname={page.url.pathname} document={currentDoc} />

<DocsShell
	nav={blog.nav}
	pathname={page.url.pathname}
	showToc={!isIndex}
	showPager={!isIndex}
	{headings}
	siteName="${opts.title}"
>
	{@render children()}
</DocsShell>
`
	);

	// --- post index -------------------------------------------------------
	add(
		`src/routes/${seg}/+page.ts`,
		`import type { PageLoad } from './$types';
import { listPosts } from 'acrolls/docs';
import { blog } from '${libFromRoute}/source';

export const load: PageLoad = async () => {
	return {
		posts: listPosts(blog).map((post) => ({
			title: post.document.title,
			description: post.document.description,
			href: post.document.href,
			date: post.date,
			tags: post.tags
		}))
	};
};
`
	);

	add(
		`src/routes/${seg}/+page.svelte`,
		`<script lang="ts">
	import { DocsPageHeader, PostTags } from 'acrolls/docs';
	import { blogTagOptions } from '${libFromRoute}/source';
	let { data } = $props();
</script>

<DocsPageHeader title="${opts.title}" description="Latest posts, newest first." />

<p class="blog-feeds">
	<a href="${opts.href}/tags">Browse tags</a> ·
	<a href="${opts.href}/rss.xml">RSS</a> ·
	<a href="${opts.href}/atom.xml">Atom</a> ·
	<a href="${opts.href}/feed.json">JSON Feed</a>
</p>

<ul class="blog-index">
	{#each data.posts as post}
		<li class="blog-index__item">
			<a class="blog-index__link" href={post.href}>
				<time class="blog-index__date" datetime={post.date}>{post.date}</time>
				<span class="blog-index__title">{post.title}</span>
				{#if post.description}<span class="blog-index__desc">{post.description}</span>{/if}
			</a>
			<PostTags tags={post.tags} baseHref={blogTagOptions.baseHref} tagsPath={blogTagOptions.tagsPath} />
		</li>
	{/each}
</ul>
`
	);

	// --- post page --------------------------------------------------------
	add(
		`src/routes/${seg}/[...slug]/+page.ts`,
		`import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { tagsOfPost } from 'acrolls/docs';
import { blog } from '${libFromSlug}/source';

export const entries: EntryGenerator = () =>
	blog.documents.filter((document) => document.slug).map((document) => ({ slug: document.slug }));

export const load: PageLoad = async ({ params }) => {
	const slug = params.slug ?? '';
	const document = blog.get(slug);
	if (!document) error(404, \`Post "\${slug}" not found\`);
	// Resolve the article in \`load\` so it prerenders with real content.
	const Article = await document.loader();
	return {
		Article,
		title: document.title,
		description: document.description,
		date: document.metadata.date as string | undefined,
		author: document.metadata.author as string | undefined,
		tags: tagsOfPost(document)
	};
};
`
	);

	add(
		`src/routes/${seg}/[...slug]/+page.svelte`,
		`<script lang="ts">
	import { DocsPageHeader, PostTags } from 'acrolls/docs';
	import { blogTagOptions } from '${libFromSlug}/source';
	let { data } = $props();
</script>

<DocsPageHeader title={data.title} description={data.description} />
{#if data.date || data.author}
	<p class="blog-meta">
		{#if data.date}<time datetime={data.date}>{data.date}</time>{/if}
		{#if data.author}<span> · {data.author}</span>{/if}
	</p>
{/if}
<PostTags tags={data.tags} baseHref={blogTagOptions.baseHref} tagsPath={blogTagOptions.tagsPath} />
{#if data.Article}<data.Article />{/if}
`
	);

	// --- tags -------------------------------------------------------------
	add(
		`src/routes/${seg}/tags/+page.ts`,
		`import type { PageLoad } from './$types';
import { listTags } from 'acrolls/docs';
import { blog, blogTagOptions } from '${libFromSlug}/source';

export const load: PageLoad = async () => ({ tags: listTags(blog, blogTagOptions) });
`
	);

	add(
		`src/routes/${seg}/tags/+page.svelte`,
		`<script lang="ts">
	import { DocsPageHeader } from 'acrolls/docs';
	let { data } = $props();
</script>

<DocsPageHeader title="Tags" description="Every tag in this blog, with post counts." />

<ul class="blog-tag-index" aria-label="Tags">
	{#each data.tags as tag}
		<li>
			<a class="acrolls-post-tag-link" href={tag.href}>
				{tag.label}<span class="blog-tag-index__count">{tag.count}</span>
			</a>
		</li>
	{/each}
</ul>

<p class="blog-feeds"><a href="${opts.href}">← All posts</a></p>
`
	);

	add(
		`src/routes/${seg}/tags/[tag]/+page.ts`,
		`import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { listTags, postsForTag, resolveTag } from 'acrolls/docs';
import { blog, blogTagOptions } from '${libFromTag}/source';

export const entries: EntryGenerator = () =>
	listTags(blog, blogTagOptions).map((tag) => ({ tag: tag.slug }));

export const load: PageLoad = async ({ params }) => {
	const tag = resolveTag(blog, params.tag, blogTagOptions);
	if (!tag) error(404, \`Tag "\${params.tag}" not found\`);
	return {
		tag,
		posts: postsForTag(blog, params.tag, blogTagOptions).map((post) => ({
			title: post.document.title,
			description: post.document.description,
			href: post.document.href,
			date: post.date,
			tags: post.tags
		}))
	};
};
`
	);

	add(
		`src/routes/${seg}/tags/[tag]/+page.svelte`,
		`<script lang="ts">
	import { DocsPageHeader } from 'acrolls/docs';
	let { data } = $props();
</script>

<DocsPageHeader
	title={\`Tag: \${data.tag.label}\`}
	description={\`\${data.tag.count} post\${data.tag.count === 1 ? '' : 's'} tagged "\${data.tag.label}".\`}
/>

<ul class="blog-index">
	{#each data.posts as post}
		<li class="blog-index__item">
			<a class="blog-index__link" href={post.href}>
				<time class="blog-index__date" datetime={post.date}>{post.date}</time>
				<span class="blog-index__title">{post.title}</span>
				{#if post.description}<span class="blog-index__desc">{post.description}</span>{/if}
			</a>
		</li>
	{/each}
</ul>

<p class="blog-feeds"><a href="${opts.href}/tags">All tags</a> · <a href="${opts.href}">All posts</a></p>
`
	);

	// --- feeds ------------------------------------------------------------
	const feeds: Array<{ file: string; fn: string; type: string }> = [
		{ file: 'rss.xml', fn: 'docsRss', type: 'application/rss+xml; charset=utf-8' },
		{ file: 'atom.xml', fn: 'docsAtom', type: 'application/atom+xml; charset=utf-8' },
		{ file: 'feed.json', fn: 'docsJsonFeed', type: 'application/feed+json; charset=utf-8' }
	];
	for (const feed of feeds) {
		// Absolute self URL when a site origin exists, else root-relative.
		const feedUrl = `${opts.site ?? ''}${opts.href}/${feed.file}`;
		add(
			`src/routes/${seg}/${feed.file}/+server.ts`,
			`import { ${feed.fn} } from 'acrolls/docs';
import { blog, raw } from '${libFromFeed}/source';

export const prerender = true;

export function GET() {
	return new Response(
		${feed.fn}(blog, { feedUrl: '${feedUrl}', raw }),
		{ headers: { 'content-type': '${feed.type}' } }
	);
}
`
		);
	}

	// --- markdown negotiation --------------------------------------------
	add(
		`src/routes/${seg}/[...slug].md/+server.ts`,
		`import { error } from '@sveltejs/kit';
import type { EntryGenerator, RequestHandler } from './$types';
import { docsPageMarkdown } from 'acrolls/docs';
import { blog, raw } from '${libFromSlug}/source';

export const prerender = true;

export const entries: EntryGenerator = () =>
	blog.documents.filter((document) => document.slug).map((document) => ({ slug: document.slug }));

/** Raw Markdown for a post — the content-negotiation surface agents and \`llms.txt\` readers use. */
export const GET: RequestHandler = ({ params }) => {
	const slug = params.slug ?? '';
	const markdown = docsPageMarkdown(blog, slug, raw);
	if (markdown === undefined) error(404, \`Markdown source for "\${slug}" not found\`);
	return new Response(markdown, {
		headers: { 'content-type': 'text/markdown; charset=utf-8', vary: 'accept' }
	});
};
`
	);

	// --- starter posts ----------------------------------------------------
	add(
		`${contentRoot}/2025-01-01-welcome.md`,
		`---
title: Welcome to the blog
description: The first post — how posts, feeds, and tags fit together.
date: 2025-01-01
author: ${opts.title}
tags:
  - getting-started
---

Posts are ordinary Markdown. Frontmatter carries \`date\`, optional \`author\`, and free-form
\`tags\`. A \`YYYY-MM-DD-\` filename prefix also supplies the date, so either convention works.

Feeds and the tag index are generated from this same source — nothing else to configure.
`
	);

	add(
		`${contentRoot}/2025-02-14-feeds-and-tags.md`,
		`---
title: Feeds and tags come for free
description: RSS, Atom, JSON Feed, and per-tag routes from one content source.
date: 2025-02-14
author: ${opts.title}
tags:
  - feeds
  - tags
---

\`${opts.href}/rss.xml\`, \`${opts.href}/atom.xml\`, and \`${opts.href}/feed.json\` are generated from
\`listPosts\`. The tag index at \`${opts.href}/tags\` and every tag page under
\`${opts.href}/tags/<slug>\` come from \`listTags\` / \`postsForTag\`, so a tag added to frontmatter
appears everywhere with no route changes.
`
	);

	return files;
}
