import type { Component } from 'svelte';
import { content, markdownGlob, mergeLoaders } from 'acrolls/content';
import { defineDocsConfig } from 'acrolls/docs';
import { defineVersions } from 'acrolls/docs';

type Article = Component;

export const versionsConfig = defineVersions({
	baseHref: '/versions',
	defaultVersion: 'v1',
	versions: [
		{ id: 'v1', label: '1.x' },
		{ id: 'v2', label: '2.x', badge: 'next' }
	]
});

export const versionedDocs = content({
	loader: mergeLoaders<Article>([
		{
			prefix: 'v1',
			loader: markdownGlob<Article>({
				body: import.meta.glob('../../content-versions/v1/**/*.md', { import: 'default' }) as Record<
					string,
					() => Promise<Article>
				>,
				metadata: import.meta.glob('../../content-versions/v1/**/*.md', {
					eager: true,
					import: 'metadata'
				}),
				facts: import.meta.glob('../../content-versions/v1/**/*.md', {
					eager: true,
					import: '__acrollsDocument'
				}),
				root: '../../content-versions/v1'
			})
		},
		{
			prefix: 'v2',
			loader: markdownGlob<Article>({
				body: import.meta.glob('../../content-versions/v2/**/*.md', { import: 'default' }) as Record<
					string,
					() => Promise<Article>
				>,
				metadata: import.meta.glob('../../content-versions/v2/**/*.md', {
					eager: true,
					import: 'metadata'
				}),
				facts: import.meta.glob('../../content-versions/v2/**/*.md', {
					eager: true,
					import: '__acrollsDocument'
				}),
				root: '../../content-versions/v2'
			})
		}
	]),
	config: defineDocsConfig({
		title: 'Versioned docs',
		baseHref: '/versions',
		site: 'https://example.com',
		subtitle: 'Same content model, version prefixes',
		convention: {
			mode: 'authored',
			frontmatter: {
				ordinaryPageTitle: 'required',
				indexTitle: 'folder',
				description: 'optional',
				leadingH1: 'suppress-and-warn'
			}
		},
		folders: {
			v1: { title: '1.x', order: 0 },
			v2: { title: '2.x', order: 1 }
		}
	})
}).sourceSync();
