import { describe, expect, it } from 'vitest';
import { createAcrollsMdsvexPreprocessor } from './index.js';

/** Pull the object literal from the generated `export const metadata = {...};`. */
function metadataOf(code: string): Record<string, unknown> {
	const match = /export const metadata = (\{[\s\S]*?\});/.exec(code);
	if (!match) return {};
	return JSON.parse(match[1]);
}

describe('compile-time headings', () => {
	it('collects h2–h4 into metadata.headings with rehype-slug ids', async () => {
		const processor = createAcrollsMdsvexPreprocessor();
		const result = await processor.markup({
			content: '# Title\n\n## First Section\n\n### Nested\n\n#### Deep\n\n## Second Section\n',
			filename: 'doc.md'
		});

		expect(metadataOf(result!.code).headings).toEqual([
			{ id: 'first-section', text: 'First Section', level: 2 },
			{ id: 'nested', text: 'Nested', level: 3 },
			{ id: 'deep', text: 'Deep', level: 4 },
			{ id: 'second-section', text: 'Second Section', level: 2 }
		]);
	});

	it('excludes the h1 page title and anything below h4', async () => {
		const processor = createAcrollsMdsvexPreprocessor();
		const result = await processor.markup({
			content: '# Page\n\n## Kept\n\n##### Too Deep\n',
			filename: 'levels.md'
		});

		expect(metadataOf(result!.code).headings).toEqual([{ id: 'kept', text: 'Kept', level: 2 }]);
	});

	it('matches rehype-slug ids for headings with inline markup', async () => {
		const processor = createAcrollsMdsvexPreprocessor();
		const result = await processor.markup({
			content: '## The `render()` call & you\n',
			filename: 'inline.md'
		});

		const headings = metadataOf(result!.code).headings as Array<{ id: string; text: string }>;
		expect(headings[0].id).toBe('the-render-call--you');
		expect(headings[0].text).toBe('The render() call & you');
		// The collected id is the one actually rendered onto the heading element.
		expect(result!.code).toContain('id="the-render-call--you"');
	});

	it('disambiguates duplicate heading text the same way rehype-slug does', async () => {
		const processor = createAcrollsMdsvexPreprocessor();
		const result = await processor.markup({
			content: '## Setup\n\n## Setup\n',
			filename: 'dupes.md'
		});

		const headings = metadataOf(result!.code).headings as Array<{ id: string }>;
		expect(headings.map((h) => h.id)).toEqual(['setup', 'setup-1']);
	});

	it('preserves authored frontmatter alongside the headings', async () => {
		const processor = createAcrollsMdsvexPreprocessor();
		const result = await processor.markup({
			content: '---\ntitle: Guide\n---\n\n## Install\n',
			filename: 'front.md'
		});

		const metadata = metadataOf(result!.code);
		expect(metadata.title).toBe('Guide');
		expect(metadata.headings).toEqual([{ id: 'install', text: 'Install', level: 2 }]);
	});

	it('leaves metadata empty when a document has no collectable headings', async () => {
		const processor = createAcrollsMdsvexPreprocessor();
		const result = await processor.markup({ content: '# Only a title\n', filename: 'bare.md' });

		expect(result!.code).toContain('export const metadata = {};');
	});

	it('omits headings entirely when toc is disabled', async () => {
		const processor = createAcrollsMdsvexPreprocessor({ toc: false });
		const result = await processor.markup({
			content: '## Section\n',
			filename: 'no-toc.md'
		});

		expect(result!.code).toContain('export const metadata = {};');
		expect(result!.code).not.toContain('headings');
	});

	it('honours a custom level range', async () => {
		const processor = createAcrollsMdsvexPreprocessor({ toc: { minLevel: 2, maxLevel: 2 } });
		const result = await processor.markup({
			content: '## Top\n\n### Skipped\n',
			filename: 'range.md'
		});

		expect(metadataOf(result!.code).headings).toEqual([{ id: 'top', text: 'Top', level: 2 }]);
	});
});
