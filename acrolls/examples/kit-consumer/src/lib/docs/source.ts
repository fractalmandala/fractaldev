import type { Component } from 'svelte';
import { content, markdownGlob, markdownRaw } from 'acrolls/content';
import { defineDocsConfig, numbered } from 'acrolls/docs/content';
import { acrollsFields } from 'acrolls/docs';

type DocsArticle = Component;

/**
 * User-supplied docs corpus (unchanged files).
 * Path: src/content/sample-docs-content
 */
const ROOT = '../../content/sample-docs-content';

export const raw = markdownRaw({
	raw: import.meta.glob('../../content/sample-docs-content/**/*.md', {
		query: '?raw',
		import: 'default',
		eager: true
	}) as Record<string, string>,
	root: ROOT
});

export const docs = content({
	loader: markdownGlob<DocsArticle>({
		body: import.meta.glob('../../content/sample-docs-content/**/*.md', {
			import: 'default'
		}) as Record<string, () => Promise<DocsArticle>>,
		metadata: import.meta.glob('../../content/sample-docs-content/**/*.md', {
			eager: true,
			import: 'metadata'
		}),
		facts: import.meta.glob('../../content/sample-docs-content/**/*.md', {
			eager: true,
			import: '__acrollsDocument'
		}),
		root: ROOT
	}),
	// Page schema only — sample frontmatter has title/description; extra keys pass through.
	schema: acrollsFields.page,
	filter: (entry) => entry.data.draft !== true,
	config: defineDocsConfig({
		title: 'Sample docs',
		baseHref: '/docs',
		site: 'https://example.com',
		subtitle: 'User-supplied Markdown corpus',
		naming: numbered(),
		convention: {
			mode: 'authored',
			frontmatter: {
				ordinaryPageTitle: 'required',
				indexTitle: 'folder',
				description: 'optional',
				leadingH1: 'suppress-and-warn'
			}
		}
	})
}).sourceSync();
