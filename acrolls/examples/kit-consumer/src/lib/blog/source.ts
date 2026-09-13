import type { Component } from 'svelte';
import { content, markdownGlob, markdownRaw } from 'acrolls/content';
import { acrollsFields, defineDocsConfig } from 'acrolls/docs';

type BlogArticle = Component;

/**
 * User-supplied blog corpus (unchanged files).
 * Path: src/content/sample-blog-content
 *
 * These posts carry title/tags/category but no `date`. Acrolls includes them via
 * listPosts({ undated: 'include' }) — no content edits required.
 */
const ROOT = '../../content/sample-blog-content';

export const raw = markdownRaw({
	raw: import.meta.glob('../../content/sample-blog-content/**/*.md', {
		query: '?raw',
		import: 'default',
		eager: true
	}) as Record<string, string>,
	root: ROOT
});

export const blog = content({
	loader: markdownGlob<BlogArticle>({
		body: import.meta.glob('../../content/sample-blog-content/**/*.md', {
			import: 'default'
		}) as Record<string, () => Promise<BlogArticle>>,
		metadata: import.meta.glob('../../content/sample-blog-content/**/*.md', {
			eager: true,
			import: 'metadata'
		}),
		facts: import.meta.glob('../../content/sample-blog-content/**/*.md', {
			eager: true,
			import: '__acrollsDocument'
		}),
		root: ROOT
	}),
	// page (not post): sample corpus has no required `date` field.
	schema: acrollsFields.page,
	filter: (entry) => entry.data.draft !== true,
	config: defineDocsConfig({
		title: 'Sample blog',
		baseHref: '/blog',
		site: 'https://example.com',
		subtitle: 'User-supplied Markdown corpus',
		section: {
			title: 'Posts',
			defaultOpen: true
		},
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

export { blogTagOptions } from './tags.js';
