import type { Component } from 'svelte';
import { content, markdownGlob } from 'acrolls/content';
import { defineDocsConfig, numbered } from 'acrolls/docs/content';

type DemoArticle = Component;

/**
 * Dummy demo corpus for the temporary UI playset: `docs/playset/` (numbered docs-shaped
 * Markdown, composed for visual testing only — never published). The nav tree, page records,
 * and routes built from it are the real content-engine output, so compositions here are
 * exercised against actual Acrolls behavior.
 */
export const docs = content({
	loader: markdownGlob<DemoArticle>({
		body: import.meta.glob('../../../docs/playset/**/*.md', {
			import: 'default'
		}) as Record<string, () => Promise<DemoArticle>>,
		metadata: import.meta.glob('../../../docs/playset/**/*.md', { eager: true, import: 'metadata' }),
		facts: import.meta.glob('../../../docs/playset/**/*.md', { eager: true, import: '__acrollsDocument' }),
		root: '../../../docs/playset'
	}),
	config: defineDocsConfig({
		title: 'UI playset',
		// The playset serves docs at the root: nav hrefs become /introduction/... etc.
		baseHref: '/',
		// `01-` prefixes order siblings and are stripped from slugs and titles
		// (01-introduction/01-getting-started → /introduction/getting-started).
		naming: numbered()
	})
}).sourceSync();
