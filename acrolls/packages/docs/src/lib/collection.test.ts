import { describe, expect, it } from 'vitest';
import { content } from './collection.js';
import type { ContentLoader, EntrySummary, LoadedDocument, StandardSchemaV1 } from './collection.js';
import { createDocsContentSource, defineDocsConfig, DocsContentError } from './content.js';
import type { DocsContentConfig, DocsContentInput } from './content.js';

type Doc = string;

function eagerLoader(documents: readonly LoadedDocument<Doc>[]): ContentLoader<Doc> {
	return { eager: true, list: () => [...documents] };
}

function asyncLoader(documents: readonly LoadedDocument<Doc>[]): ContentLoader<Doc> {
	return { eager: false, list: async () => [...documents] };
}

function toEngineInputs(documents: readonly LoadedDocument<Doc>[]): DocsContentInput<Doc>[] {
	return documents.map((document) => ({
		key: document.key,
		metadata: document.data,
		facts: document.meta,
		load: document.load
	}));
}

const baseConfig = defineDocsConfig({
	title: 'Documentation',
	baseHref: '/docs',
	folders: {
		guides: { title: 'Guides', order: 1 }
	}
});

const fixtures: LoadedDocument<Doc>[] = [
	{ key: 'index.md', data: { title: 'Welcome' }, meta: { hasFrontmatter: true }, load: async () => 'index' },
	{
		key: 'guides/installation.md',
		data: { title: 'Installation', order: 2 },
		meta: { hasFrontmatter: true },
		load: async () => 'installation'
	},
	{
		key: 'guides/advanced.md',
		data: { title: 'Advanced', order: 3 },
		meta: { hasFrontmatter: true },
		load: async () => 'advanced'
	}
];

/**
 * Inline Standard Schema stub. Deliberately hand-written: Acrolls adds no validation library
 * to any package manifest, including devDependencies.
 */
type Frontmatter = { title: string; order: number; draft?: boolean; hidden?: boolean };

const frontmatterSchema: StandardSchemaV1<unknown, Frontmatter> = {
	'~standard': {
		version: 1,
		vendor: 'acrolls-test',
		validate(value) {
			const record = (value ?? {}) as Record<string, unknown>;
			if (typeof record.title !== 'string' || !record.title.trim()) {
				return { issues: [{ message: 'expected string', path: ['title'] }] };
			}
			// Defaulting `order` proves validated output reaches the engine: it changes nav order.
			return {
				value: {
					...record,
					title: record.title,
					order: typeof record.order === 'number' ? record.order : 0
				} as Frontmatter
			};
		}
	}
};

describe('content collection', () => {
	it('is transparent: no schema and no filter yields the same nav as calling the engine directly', () => {
		const viaCollection = content({ loader: eagerLoader(fixtures), config: baseConfig }).sourceSync();
		const viaEngine = createDocsContentSource({ config: baseConfig, documents: toEngineInputs(fixtures) });

		expect(viaCollection.nav).toEqual(viaEngine.nav);
		expect(viaCollection.documents.map((document) => document.slug)).toEqual(
			viaEngine.documents.map((document) => document.slug)
		);
		expect(viaCollection.entries()).toEqual(viaEngine.entries());
		expect(viaCollection.diagnostics).toEqual(viaEngine.diagnostics);
	});

	it('preserves every engine method through the diagnostics merge', async () => {
		const docs = content({ loader: eagerLoader(fixtures), config: baseConfig }).sourceSync();

		expect(docs.get('guides/installation')?.title).toBe('Installation');
		expect(await docs.load('guides/installation')).toBe('installation');
		expect(docs.entries()).toContain('/docs/guides/installation');
	});

	it('replaces metadata with validated schema output', () => {
		const docs = content({
			loader: eagerLoader([
				{ key: 'guides/a.md', data: { title: 'A', order: 5 }, load: async () => 'a' },
				// No explicit order: the schema defaults it to 0, which must win the sort.
				{ key: 'guides/b.md', data: { title: 'B' }, load: async () => 'b' }
			]),
			config: baseConfig,
			schema: frontmatterSchema
		}).sourceSync();

		expect(docs.get('guides/b')?.metadata).toEqual({ title: 'B', order: 0 });
		expect(docs.documents.map((document) => document.slug)).toEqual(['guides/b', 'guides/a']);
	});

	it('infers data types from the schema', async () => {
		const collection = content({
			loader: eagerLoader([{ key: 'guides/a.md', data: { title: 'A' }, load: async () => 'a' }]),
			config: baseConfig,
			schema: frontmatterSchema,
			filter: (entry) => {
				// Compile-time proof the schema output type flows into `filter`.
				const title: string = entry.data.title;
				return title !== '__never__';
			}
		});

		const entry = await collection.get('guides/a');
		const title: string | undefined = entry?.data.title;
		expect(title).toBe('A');
	});

	it('drops schema failures in authored mode and reports one diagnostic', () => {
		const config: DocsContentConfig = {
			title: 'Documentation',
			baseHref: '/docs',
			convention: { mode: 'authored' },
			folders: { guides: { title: 'Guides' } }
		};
		const docs = content({
			loader: eagerLoader([
				{ key: 'guides/ok.md', data: { title: 'Ok' }, meta: { hasFrontmatter: true }, load: async () => 'ok' },
				{ key: 'guides/bad.md', data: { order: 1 }, meta: { hasFrontmatter: true }, load: async () => 'bad' }
			]),
			config,
			schema: frontmatterSchema
		}).sourceSync();

		expect(docs.documents.map((document) => document.key)).toEqual(['guides/ok.md']);
		expect(docs.get('guides/bad')).toBeUndefined();
		expect(JSON.stringify(docs.nav)).not.toContain('bad');

		const invalid = docs.diagnostics.filter((diagnostic) => diagnostic.code === 'ACROLLS_SCHEMA_INVALID');
		expect(invalid).toHaveLength(1);
		expect(invalid[0]).toEqual({
			code: 'ACROLLS_SCHEMA_INVALID',
			severity: 'error',
			file: 'guides/bad.md',
			message: 'Frontmatter failed schema: title: expected string',
			remediation: 'Fix the frontmatter fields to match the collection schema.'
		});
	});

	it('keeps schema failures in migration mode with their raw frontmatter', () => {
		const docs = content({
			loader: eagerLoader([
				{ key: 'guides/bad.md', data: { order: 1 }, meta: { hasFrontmatter: true }, load: async () => 'bad' }
			]),
			config: baseConfig,
			schema: frontmatterSchema
		}).sourceSync();

		expect(docs.documents.map((document) => document.key)).toEqual(['guides/bad.md']);
		expect(docs.get('guides/bad')?.metadata).toEqual({ order: 1 });
		expect(docs.diagnostics.map((diagnostic) => diagnostic.code)).toContain('ACROLLS_SCHEMA_INVALID');
	});

	it('removes filtered documents from every surface', async () => {
		const collection = content({
			loader: eagerLoader([
				{ key: 'guides/published.md', data: { title: 'Published' }, load: async () => 'published' },
				{ key: 'guides/draft.md', data: { title: 'Draft', draft: true }, load: async () => 'draft' }
			]),
			config: baseConfig,
			filter: (entry) => entry.data.draft !== true
		});
		const docs = collection.sourceSync();

		expect(docs.documents.map((document) => document.key)).toEqual(['guides/published.md']);
		expect(docs.get('guides/draft')).toBeUndefined();
		expect(docs.load('guides/draft')).toBeUndefined();
		expect(docs.entries()).not.toContain('/docs/guides/draft');
		expect(JSON.stringify(docs.nav)).not.toContain('draft');
		expect(await collection.ids()).toEqual(['guides/published']);
		expect(await collection.list()).toHaveLength(1);
	});

	it('passes key, data, and meta — but no id — to filter', () => {
		const seen: Array<{ key: string; keys: string[] }> = [];
		content({
			loader: eagerLoader([
				{ key: 'guides/a.md', data: { title: 'A' }, meta: { hasFrontmatter: true }, load: async () => 'a' }
			]),
			config: baseConfig,
			filter: (entry) => {
				seen.push({ key: entry.key, keys: Object.keys(entry) });
				return true;
			}
		}).sourceSync();

		expect(seen).toEqual([{ key: 'guides/a.md', keys: ['key', 'data', 'meta'] }]);
	});

	it('keeps filter and hidden independent', async () => {
		const collection = content({
			loader: eagerLoader([
				{ key: 'guides/visible.md', data: { title: 'Visible' }, load: async () => 'visible' },
				{ key: 'guides/unlisted.md', data: { title: 'Unlisted', hidden: true }, load: async () => 'unlisted' },
				{ key: 'guides/draft.md', data: { title: 'Draft', draft: true }, load: async () => 'draft' }
			]),
			config: baseConfig,
			filter: (entry) => entry.data.draft !== true
		});
		const docs = collection.sourceSync();

		// hidden: unlisted but still routeable and still prerendered.
		expect(JSON.stringify(docs.nav)).not.toContain('unlisted');
		expect(docs.get('guides/unlisted')?.title).toBe('Unlisted');
		expect(await collection.ids()).toContain('guides/unlisted');
		expect((await collection.list()).map((entry) => entry.id)).toEqual(['guides/visible']);

		// filter: gone from every surface, including direct lookup.
		expect(docs.get('guides/draft')).toBeUndefined();
		expect(await collection.ids()).not.toContain('guides/draft');
	});

	it('validates through an async Standard Schema on source() and throws on sourceSync()', async () => {
		// A spec-compliant vendor may return a Promise. The type now permits it, so the runtime
		// has to take a position on both paths rather than silently skipping validation.
		const asyncSchema: StandardSchemaV1<unknown, Frontmatter> = {
			'~standard': {
				version: 1,
				vendor: 'acrolls-test-async',
				validate: async (value) => frontmatterSchema['~standard'].validate(value)
			}
		};

		const documents = [
			{ key: 'guides/a.md', data: { title: 'A', order: 5 }, load: async () => 'a' },
			{ key: 'guides/b.md', data: { title: 'B' }, load: async () => 'b' },
			{ key: 'guides/bad.md', data: { order: 1 }, load: async () => 'bad' }
		];
		const collection = content({
			loader: eagerLoader(documents),
			config: baseConfig,
			schema: asyncSchema
		});

		// source(): the promise is awaited, so validated output really reaches the engine.
		const docs = await collection.source();
		expect(docs.get('guides/b')?.metadata).toEqual({ title: 'B', order: 0 });
		// b defaulted to order 0 by the schema, bad kept its raw order 1, a is 5.
		expect(docs.documents.map((document) => document.slug)).toEqual(['guides/b', 'guides/bad', 'guides/a']);
		expect(docs.diagnostics.filter((diagnostic) => diagnostic.code === 'ACROLLS_SCHEMA_INVALID')).toEqual([
			{
				code: 'ACROLLS_SCHEMA_INVALID',
				severity: 'error',
				file: 'guides/bad.md',
				message: 'Frontmatter failed schema: title: expected string',
				remediation: 'Fix the frontmatter fields to match the collection schema.'
			}
		]);

		// sourceSync(): refuses rather than admitting an unvalidated document.
		expect(() => collection.sourceSync()).toThrow(DocsContentError);
		expect(() => collection.sourceSync()).toThrow(/guides\/a\.md/);
		expect(() => collection.sourceSync()).toThrow(/await source\(\)/);
	});

	it('drops async schema failures in authored mode via source()', async () => {
		const asyncSchema: StandardSchemaV1<unknown, Frontmatter> = {
			'~standard': {
				version: 1,
				vendor: 'acrolls-test-async',
				validate: (value) => Promise.resolve(frontmatterSchema['~standard'].validate(value))
			}
		};
		const collection = content({
			loader: eagerLoader([
				{ key: 'guides/ok.md', data: { title: 'Ok' }, meta: { hasFrontmatter: true }, load: async () => 'ok' },
				{ key: 'guides/bad.md', data: { order: 1 }, meta: { hasFrontmatter: true }, load: async () => 'bad' }
			]),
			config: {
				title: 'Documentation',
				baseHref: '/docs',
				convention: { mode: 'authored' },
				folders: { guides: { title: 'Guides' } }
			},
			schema: asyncSchema
		});

		const docs = await collection.source();
		expect(docs.documents.map((document) => document.key)).toEqual(['guides/ok.md']);
		expect(await collection.ids()).toEqual(['guides/ok']);
	});

	it('keeps a synchronous schema fully synchronous on sourceSync()', () => {
		let calls = 0;
		const syncSchema: StandardSchemaV1<unknown, Frontmatter> = {
			'~standard': {
				version: 1,
				vendor: 'acrolls-test-sync',
				validate: (value) => {
					calls += 1;
					return frontmatterSchema['~standard'].validate(value);
				}
			}
		};

		const docs = content({
			loader: eagerLoader([{ key: 'guides/a.md', data: { title: 'A' }, load: async () => 'a' }]),
			config: baseConfig,
			schema: syncSchema
		}).sourceSync();

		expect(calls).toBe(1);
		expect(docs.get('guides/a')?.metadata).toEqual({ title: 'A', order: 0 });
	});

	it('throws a directive error from sourceSync() on a non-eager loader', async () => {
		const collection = content({ loader: asyncLoader(fixtures), config: baseConfig });

		expect(() => collection.sourceSync()).toThrow(/eager: true/);
		expect(() => collection.sourceSync()).toThrow(/source\(\)/);
		await expect(collection.source()).resolves.toMatchObject({
			documents: expect.any(Array)
		});
	});

	it('resolves async loaders through source(), get(), list(), and ids()', async () => {
		const collection = content({ loader: asyncLoader(fixtures), config: baseConfig });

		expect((await collection.source()).documents).toHaveLength(3);
		expect(await collection.ids()).toEqual(expect.arrayContaining(['guides/installation']));
		expect((await collection.get('guides/installation'))?.key).toBe('guides/installation.md');
	});

	it('returns null, not undefined, from get() for an unknown id', async () => {
		const collection = content({ loader: eagerLoader(fixtures), config: baseConfig });
		expect(await collection.get('nope')).toBeNull();
	});

	it('exposes the body loader and facts on get() entries', async () => {
		const collection = content({ loader: eagerLoader(fixtures), config: baseConfig });
		const entry = await collection.get('guides/installation');

		expect(entry?.id).toBe('guides/installation');
		expect(entry?.key).toBe('guides/installation.md');
		expect(entry?.href).toBe('/docs/guides/installation');
		expect(entry?.hidden).toBe(false);
		expect(entry?.meta).toEqual({ hasFrontmatter: true });
		expect(await entry?.body()).toBe('installation');
	});

	it('never puts body or meta in list() summaries', async () => {
		const collection = content({ loader: eagerLoader(fixtures), config: baseConfig });

		const summaries = await collection.list();
		for (const summary of summaries) {
			expect(Object.keys(summary).sort()).toEqual(['data', 'hidden', 'href', 'id', 'key']);
		}

		const mapped = await collection.list({
			map: (entry: EntrySummary<Record<string, unknown>>) => ({ ...entry, extra: true })
		});
		expect(mapped.every((entry) => !('body' in entry) && !('meta' in entry))).toBe(true);
		expect(mapped[0]?.extra).toBe(true);
	});

	it('returns list() summaries in engine order', async () => {
		const collection = content({ loader: eagerLoader(fixtures), config: baseConfig });
		const docs = collection.sourceSync();

		expect((await collection.list()).map((entry) => entry.id)).toEqual(
			docs.documents.filter((document) => !document.hidden).map((document) => document.slug)
		);
	});
});
