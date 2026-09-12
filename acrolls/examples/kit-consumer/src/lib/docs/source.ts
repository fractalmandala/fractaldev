import type { Component } from 'svelte';
import * as v from 'valibot';
import { content, markdownGlob, markdownRaw, mergeLoaders, mergeRaw } from 'acrolls/content';
import { defineDocsConfig } from 'acrolls/docs/content';

type DocsArticle = Component;

/** Raw Markdown source, keyed like `docs.documents[].key` — powers the AI static
 * tier (llms.txt, per-page .md, copy-as-markdown). */
export const raw = mergeRaw([
	{
		raw: markdownRaw({
			raw: import.meta.glob('../../content/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
				string,
				string
			>,
			root: '../../content'
		})
	},
	{
		prefix: 'handbook',
		raw: markdownRaw({
			raw: import.meta.glob('../../content-handbook/**/*.md', {
				query: '?raw',
				import: 'default',
				eager: true
			}) as Record<string, string>,
			root: '../../content-handbook'
		})
	}
]);

/**
 * `title` stays `optional` even though this host runs in `authored` mode: the engine's own
 * `ACROLLS_TITLE_REQUIRED` admission rule already enforces titles and derives index titles from
 * folders, so a required-title schema would double-reject index pages.
 */
const frontmatter = v.object({
	title: v.optional(v.string()),
	description: v.optional(v.string()),
	order: v.optional(v.number()),
	hidden: v.optional(v.boolean()),
	draft: v.optional(v.boolean())
});

export const docs = content({
	// Multi-source: the main corpus plus a second set kept in its own folder.
	// Each prefixed set becomes a first-level section of the same docs hierarchy.
	loader: mergeLoaders<DocsArticle>([
		{
			loader: markdownGlob<DocsArticle>({
				body: import.meta.glob('../../content/**/*.md', { import: 'default' }) as Record<
					string,
					() => Promise<DocsArticle>
				>,
				metadata: import.meta.glob('../../content/**/*.md', { eager: true, import: 'metadata' }),
				facts: import.meta.glob('../../content/**/*.md', {
					eager: true,
					import: '__acrollsDocument'
				}),
				root: '../../content'
			})
		},
		{
			prefix: 'handbook',
			loader: markdownGlob<DocsArticle>({
				body: import.meta.glob('../../content-handbook/**/*.md', { import: 'default' }) as Record<
					string,
					() => Promise<DocsArticle>
				>,
				metadata: import.meta.glob('../../content-handbook/**/*.md', {
					eager: true,
					import: 'metadata'
				}),
				facts: import.meta.glob('../../content-handbook/**/*.md', {
					eager: true,
					import: '__acrollsDocument'
				}),
				root: '../../content-handbook'
			})
		}
	]),
	schema: frontmatter,
	filter: (entry) => !entry.data.draft,
	config: defineDocsConfig({
		title: 'Example docs',
		baseHref: '/docs',
		site: 'https://example.com',
		convention: {
			mode: 'authored',
			frontmatter: {
				ordinaryPageTitle: 'required',
				indexTitle: 'folder',
				description: 'optional',
				leadingH1: 'suppress-and-warn'
			}
		},
		subtitle: 'Generated from Markdown',
		section: {
			title: 'Reference',
			defaultOpen: true
		},
		folders: {
			guides: {
				title: 'Guides',
				order: 1
			},
			handbook: {
				title: 'Handbook',
				order: 2
			}
		},
		entries: {
			guides: {
				kind: 'group',
				title: 'Guides',
				landing: 'guides/index.md',
				order: 1
			},
			'guides/installation': {
				parent: 'guides',
				title: 'Install',
				href: '/docs/guides/install',
				order: 0
			},
			'guides/advanced/performance': {
				parent: 'guides',
				title: 'Performance',
				order: 2
			}
		}
	})
}).sourceSync();
