import { describe, expect, it } from 'vitest';
import { content } from './collection.js';
import type { ContentLoader, LoadedDocument } from './collection.js';
import { defineDocsConfig } from './content.js';
import { acrollsFields } from './fields.js';
import { negotiateDocsPage, preferDocsRepresentation } from './negotiate.js';

type Doc = string;
function loaderOf(documents: readonly LoadedDocument<Doc>[]): ContentLoader<Doc> {
	return { eager: true, list: () => [...documents] };
}

describe('preferDocsRepresentation', () => {
	it('defaults to html', () => {
		expect(preferDocsRepresentation(null)).toBe('html');
		expect(preferDocsRepresentation('')).toBe('html');
	});
	it('prefers markdown when ranked higher', () => {
		expect(preferDocsRepresentation('text/markdown, text/html;q=0.9')).toBe('markdown');
		expect(preferDocsRepresentation('text/html, text/markdown;q=0.8')).toBe('html');
		expect(preferDocsRepresentation('text/plain')).toBe('markdown');
	});
});

describe('negotiateDocsPage', () => {
	it('returns markdown body for Accept: text/markdown', async () => {
		const loader = loaderOf([
			{ key: 'guide.md', data: { title: 'Guide' }, load: async () => 'g' }
		]);
		const source = await content({
			loader,
			config: defineDocsConfig({ title: 'Docs', baseHref: '/docs' }),
			schema: acrollsFields.page
		}).source();
		const raw = { 'guide.md': '# Guide\n\nHello.' };
		const result = negotiateDocsPage('text/markdown', source, 'guide', raw);
		expect(result.kind).toBe('markdown');
		if (result.kind === 'markdown') {
			expect(result.body).toContain('Hello');
			expect(result.contentType).toContain('text/markdown');
		}
	});
});
