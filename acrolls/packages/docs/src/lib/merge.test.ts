import { describe, expect, it } from 'vitest';
import { mergeLoaders, mergeRaw } from './merge.js';
import { content } from './collection.js';
import { defineDocsConfig } from './content.js';
import type { ContentLoader, LoadedDocument } from './collection.js';

type Doc = { id: string };

function eagerLoader(keys: string[]): ContentLoader<Doc> {
	return {
		eager: true,
		list: (): LoadedDocument<Doc>[] =>
			keys.map((key) => ({ key, data: { title: key }, load: async () => ({ id: key }) }))
	};
}

function asyncLoader(keys: string[]): ContentLoader<Doc> {
	return {
		eager: false,
		list: async (): Promise<LoadedDocument<Doc>[]> =>
			keys.map((key) => ({ key, data: { title: key }, load: async () => ({ id: key }) }))
	};
}

describe('mergeLoaders', () => {
	it('prefixes each source so every set becomes a first-level segment', () => {
		const loader = mergeLoaders<Doc>([
			{ prefix: 'set1', loader: eagerLoader(['intro.md', 'nested/deep.md']) },
			{ prefix: 'set2', loader: eagerLoader(['api.md']) }
		]);
		const keys = (loader.list() as LoadedDocument<Doc>[]).map((d) => d.key);
		expect(keys).toEqual(['set1/intro.md', 'set1/nested/deep.md', 'set2/api.md']);
	});

	it('preserves data, facts, and the lazy loader', async () => {
		const loader = mergeLoaders<Doc>([{ prefix: 'set1', loader: eagerLoader(['intro.md']) }]);
		const [doc] = loader.list() as LoadedDocument<Doc>[];
		expect(doc.data).toEqual({ title: 'intro.md' });
		await expect(doc.load()).resolves.toEqual({ id: 'intro.md' });
	});

	it('normalizes prefixes and supports an unprefixed root source', () => {
		const loader = mergeLoaders<Doc>([
			{ loader: eagerLoader(['index.md']) },
			{ prefix: '/set2/', loader: eagerLoader(['api.md']) }
		]);
		const keys = (loader.list() as LoadedDocument<Doc>[]).map((d) => d.key);
		expect(keys).toEqual(['index.md', 'set2/api.md']);
	});

	it('is eager only when every source is eager', () => {
		expect(mergeLoaders<Doc>([{ loader: eagerLoader(['a.md']) }]).eager).toBe(true);
		expect(
			mergeLoaders<Doc>([{ loader: eagerLoader(['a.md']) }, { loader: asyncLoader(['b.md']) }]).eager
		).toBe(false);
	});

	it('resolves asynchronously when a source is async', async () => {
		const loader = mergeLoaders<Doc>([
			{ prefix: 'set1', loader: eagerLoader(['a.md']) },
			{ prefix: 'set2', loader: asyncLoader(['b.md']) }
		]);
		await expect(Promise.resolve(loader.list())).resolves.toEqual([
			expect.objectContaining({ key: 'set1/a.md' }),
			expect.objectContaining({ key: 'set2/b.md' })
		]);
	});

	it('throws a named error when two sources produce the same key', () => {
		const loader = mergeLoaders<Doc>([
			{ prefix: 'set1', loader: eagerLoader(['intro.md']) },
			{ prefix: 'set1', loader: eagerLoader(['intro.md']) }
		]);
		expect(() => loader.list()).toThrow(/set1\/intro\.md/);
	});

	it('does not collide when identical filenames live under distinct prefixes', () => {
		const loader = mergeLoaders<Doc>([
			{ prefix: 'set1', loader: eagerLoader(['index.md']) },
			{ prefix: 'set2', loader: eagerLoader(['index.md']) }
		]);
		expect(() => loader.list()).not.toThrow();
	});

	it('builds one nav hierarchy with each set as a first-level section', () => {
		const source = content({
			loader: mergeLoaders<Doc>([
				{ prefix: 'set1', loader: eagerLoader(['index.md', 'intro.md']) },
				{ prefix: 'set2', loader: eagerLoader(['index.md', 'api.md']) }
			]),
			config: defineDocsConfig({ title: 'Docs', baseHref: '/docs' })
		}).sourceSync();

		const hrefs = source.documents.map((d) => d.href).sort();
		expect(hrefs).toContain('/docs/set1');
		expect(hrefs).toContain('/docs/set1/intro');
		expect(hrefs).toContain('/docs/set2');
		expect(hrefs).toContain('/docs/set2/api');
		// each set appears once at the first level of the tree
		const topLevel = source.nav.sections.flatMap((s) => s.items.map((i) => i.title));
		expect(topLevel.length).toBeGreaterThanOrEqual(2);
	});
});

describe('mergeRaw', () => {
	it('applies the same prefixes so raw keys match merged document keys', () => {
		const raw = mergeRaw([
			{ prefix: 'set1', raw: { 'intro.md': '# Intro' } },
			{ prefix: 'set2', raw: { 'api.md': '# API' } }
		]);
		expect(raw).toEqual({ 'set1/intro.md': '# Intro', 'set2/api.md': '# API' });
	});
});
