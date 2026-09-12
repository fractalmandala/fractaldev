import { describe, expect, it } from 'vitest';
import { content } from './collection.js';
import type { ContentLoader, LoadedDocument, StandardSchemaV1 } from './collection.js';
import { defineDocsConfig } from './content.js';
import { acrollsFields } from './fields.js';

type Doc = string;

function loaderOf(documents: readonly LoadedDocument<Doc>[]): ContentLoader<Doc> {
	return { eager: true, list: () => [...documents] };
}

const config = defineDocsConfig({ title: 'Docs', baseHref: '/docs' });
// Authored mode drops a schema-invalid document instead of keeping its raw frontmatter, so the
// engine's own coercion never re-encounters a bad value — the schema diagnostic stands alone.
const authoredConfig = defineDocsConfig({
	title: 'Docs',
	baseHref: '/docs',
	convention: { mode: 'authored' }
});

describe('acrollsFields.page', () => {
	it('applies defaults for the optional blessed fields', async () => {
		const loader = loaderOf([
			{ key: 'guide.md', data: { title: 'Guide' }, load: async () => 'guide' }
		]);
		const source = await content({ loader, config, schema: acrollsFields.page }).source();
		const data = source.documents[0].metadata as Record<string, unknown>;

		expect(data.title).toBe('Guide');
		expect(data.hidden).toBe(false);
		expect(data.draft).toBe(false);
		expect(data.related).toEqual([]);
		expect(data.description).toBeUndefined();
	});

	it('validates and passes unrecognized frontmatter through untouched', async () => {
		const loader = loaderOf([
			{
				key: 'guide.md',
				data: {
					title: 'Guide',
					brief: 'A short guide',
					related: 'setup',
					seo: { noindex: true },
					search: { exclude: true }
				},
				load: async () => 'guide'
			}
		]);
		const source = await content({ loader, config, schema: acrollsFields.page }).source();
		const data = source.documents[0].metadata as Record<string, unknown>;

		expect(source.diagnostics).toEqual([]);
		expect(data.title).toBe('Guide');
		// `brief` fills `description`.
		expect(data.description).toBe('A short guide');
		// scalar → array.
		expect(data.related).toEqual(['setup']);
		expect(data.hidden).toBe(false);
		expect(data.draft).toBe(false);
		// add-on frontmatter survives.
		expect(data.seo).toEqual({ noindex: true });
		expect(data.search).toEqual({ exclude: true });
	});

	it('reports a diagnostic when the required title is missing', async () => {
		const loader = loaderOf([
			{ key: 'guide.md', data: { description: 'no title here' }, load: async () => 'guide' }
		]);
		const source = await content({ loader, config, schema: acrollsFields.page }).source();

		expect(source.diagnostics.some((d) => d.code === 'ACROLLS_SCHEMA_INVALID')).toBe(true);
		expect(source.diagnostics[0].message).toContain('non-empty `title`');
	});

	it('rejects a wrongly typed blessed field', async () => {
		const loader = loaderOf([
			{ key: 'guide.md', data: { title: 'Guide', order: 'first' }, load: async () => 'guide' }
		]);
		const source = await content({
			loader,
			config: authoredConfig,
			schema: acrollsFields.page
		}).source();

		expect(source.diagnostics.some((d) => d.code === 'ACROLLS_SCHEMA_INVALID')).toBe(true);
		expect(source.diagnostics[0].message).toContain('`order` must be a number');
	});

	it('validates the sidebar object and keeps it on the page', async () => {
		const loader = loaderOf([
			{
				key: 'guide.md',
				data: { title: 'Guide', sidebar: { order: 2, label: 'Setup' } },
				load: async () => 'guide'
			}
		]);
		const source = await content({ loader, config, schema: acrollsFields.page }).source();
		const data = source.documents[0].metadata as Record<string, unknown>;

		expect(source.diagnostics).toEqual([]);
		expect(data.sidebar).toEqual({ order: 2, label: 'Setup' });
	});

	it('rejects a wrongly typed sidebar field', async () => {
		const loader = loaderOf([
			{ key: 'guide.md', data: { title: 'Guide', sidebar: { order: 'first' } }, load: async () => 'guide' }
		]);
		const source = await content({
			loader,
			config: authoredConfig,
			schema: acrollsFields.page
		}).source();

		expect(source.diagnostics.some((d) => d.code === 'ACROLLS_SCHEMA_INVALID')).toBe(true);
		expect(source.diagnostics[0].message).toContain('`sidebar.order` must be a number');
	});
});

describe('acrollsFields.post — a layered genre stack', () => {
	it('merges page and post fields left→right', async () => {
		const loader = loaderOf([
			{
				key: 'hello.md',
				data: { title: 'Hello', date: '2026-01-02', tags: ['news', 'release'], author: 'Ada' },
				load: async () => 'hello'
			}
		]);
		const source = await content({ loader, config, schema: acrollsFields.post }).source();
		const data = source.documents[0].metadata as Record<string, unknown>;

		expect(source.diagnostics).toEqual([]);
		expect(data.title).toBe('Hello');
		expect(data.date).toBe('2026-01-02');
		expect(data.tags).toEqual(['news', 'release']);
		expect(data.author).toBe('Ada');
	});

	it('aggregates issues across every layer rather than stopping at the first', async () => {
		const loader = loaderOf([
			{ key: 'hello.md', data: { tags: ['x'] }, load: async () => 'hello' }
		]);
		const source = await content({ loader, config, schema: acrollsFields.post }).source();

		// page fails (no title) and postOnly fails (no date) — both surfaced.
		const message = source.diagnostics[0].message;
		expect(message).toContain('non-empty `title`');
		expect(message).toContain('needs a `date`');
	});
});

describe('layering the blessed base with a custom schema', () => {
	it('lets a user schema add fields on top of acrollsFields.page', async () => {
		const custom: StandardSchemaV1<unknown, { audience: string }> = {
			'~standard': {
				version: 1,
				vendor: 'test',
				validate(value) {
					const record = (value ?? {}) as Record<string, unknown>;
					if (typeof record.audience !== 'string') {
						return { issues: [{ message: 'audience is required' }] };
					}
					return { value: { audience: record.audience } };
				}
			}
		};

		const loader = loaderOf([
			{
				key: 'guide.md',
				data: { title: 'Guide', audience: 'developers' },
				load: async () => 'guide'
			}
		]);
		const source = await content({ loader, config, schema: [acrollsFields.page, custom] }).source();
		const data = source.documents[0].metadata as Record<string, unknown>;

		expect(source.diagnostics).toEqual([]);
		expect(data.title).toBe('Guide');
		expect(data.audience).toBe('developers');
	});
});
