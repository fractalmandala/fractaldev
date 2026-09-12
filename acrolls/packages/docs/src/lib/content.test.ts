import { describe, expect, it } from 'vitest';
import { createDocsContentSource, defineDocsConfig, DocsContentError } from './content.js';

function source() {
	const config = defineDocsConfig({
		title: 'Documentation',
		baseHref: '/docs',
		folders: {
			guides: { title: 'Guides', order: 1 },
			'guides/advanced': { title: 'Advanced', defaultOpen: true }
		},
		documents: {
			'intro': { title: 'Welcome', order: 0 },
			'guides/hidden': { hidden: true }
		}
	});
	return createDocsContentSource({
		config,
		documents: [
			{ key: 'index.md', metadata: { title: 'Welcome to Acrolls' }, load: async () => 'index' },
			{ key: 'guides/index.md', metadata: { description: 'Start building' }, load: async () => 'guides' },
			{ key: 'guides/installation.md', metadata: { title: 'Installation', order: 2 }, load: async () => 'installation' },
			{ key: 'guides/advanced/performance.md', metadata: { title: 'Performance' }, load: async () => 'performance' },
			{ key: 'guides/hidden.md', metadata: { title: 'Hidden' }, load: async () => 'hidden' }
		]
	});
}

describe('content source', () => {
	it('admits only authored documents with frontmatter titles and keeps invalid files out of every source surface', () => {
		const docs = createDocsContentSource({
			config: {
				title: 'Docs',
				baseHref: '/docs',
				convention: { mode: 'authored' },
				folders: { guides: { title: 'Guides' } }
			},
			documents: [
				{
					key: 'guides/index.md',
					metadata: { title: 'Ignored title', description: 'Overview' },
					facts: { hasFrontmatter: true, leadingH1: 'Guides' },
					load: async () => 'guides'
				},
				{
					key: 'guides/valid.md',
					metadata: { title: 'Valid' },
					facts: { hasFrontmatter: true, links: ['./missing.md'] },
					load: async () => 'valid'
				},
				{
					key: 'guides/missing.md',
					metadata: {},
					facts: { hasFrontmatter: false },
					load: async () => 'missing'
				}
			]
		});

		expect(docs.documents.map((document) => document.key)).toEqual(['guides/index.md', 'guides/valid.md']);
		expect(docs.get('guides/missing')).toBeUndefined();
		expect(docs.entries()).not.toContain('/docs/guides/missing');
		expect(JSON.stringify(docs.nav)).not.toContain('missing');
		expect(docs.get('guides')?.title).toBe('Guides');
		expect(docs.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
			'ACROLLS_INDEX_TITLE_IGNORED',
			'ACROLLS_FRONTMATTER_REQUIRED',
			'ACROLLS_TITLE_REQUIRED',
			'ACROLLS_LINK_TO_REJECTED_DOCUMENT'
		]);
	});

	it('warns when an authored initial H1 differs from the effective title', () => {
		const docs = createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs', convention: { mode: 'authored' } },
			documents: [{
				key: 'guide.md',
				metadata: { title: 'Frontmatter title' },
				facts: { hasFrontmatter: true, leadingH1: 'Body title' },
				load: async () => 'guide'
			}]
		});

		expect(docs.diagnostics).toContainEqual(expect.objectContaining({
			code: 'ACROLLS_LEADING_H1_MISMATCH',
			severity: 'warning'
		}));
	});

	it('does not let hidden waive authored admission requirements', () => {
		const docs = createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs', convention: { mode: 'authored' } },
			documents: [{
				key: 'hidden.md',
				metadata: { hidden: true },
				facts: { hasFrontmatter: false },
				load: async () => 'hidden'
			}]
		});

		expect(docs.documents).toHaveLength(0);
		expect(docs.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
			'ACROLLS_FRONTMATTER_REQUIRED',
			'ACROLLS_TITLE_REQUIRED'
		]);
	});

	it('maps markdown paths to routes and typed DocsNav sections', () => {
		const docs = source();
		expect(docs.nav.sections.map((section) => section.title)).toEqual(['Guides', 'Docs']);
		expect(docs.get('/docs/guides/installation')?.title).toBe('Installation');
		expect(docs.get('guides/advanced/performance')?.href).toBe('/docs/guides/advanced/performance');
		// The guides landing page is the section's link (behavior 7), not a duplicated item.
		expect(docs.nav.sections[0]?.items.map((item) => item.title)).toEqual(['Installation', 'Advanced']);
		expect(docs.nav.sections[0]?.href).toBe('/docs/guides');
		expect(docs.nav.sections[0]?.description).toBe('Start building');
		expect(docs.nav.sections[1]?.items.map((item) => item.title)).toEqual(['Welcome to Acrolls']);
	});

	it('supports root baseHref without protocol-relative nested routes', () => {
		const docs = createDocsContentSource({
			config: { title: 'Mandalarepo', baseHref: '/' },
			documents: [
				{ key: 'index.md', metadata: { title: 'Home' }, load: async () => 'home' },
				{ key: 'guides/installation.md', metadata: { title: 'Install' }, load: async () => 'install' }
			]
		});

		expect(docs.documents.map((document) => document.href)).toEqual(['/', '/guides/installation']);
		expect(docs.entries()).toEqual(['/', '/guides/installation']);
		expect(docs.get('/guides/installation')?.title).toBe('Install');
		expect(docs.nav.sections[1]?.items[0]?.href).toBe('/guides/installation');
	});

	it('resolves root-base group landing overrides with normal paths', () => {
		const docs = createDocsContentSource({
			config: {
				title: 'Mandalarepo',
				baseHref: '/',
				entries: {
					handbook: { kind: 'group', title: 'Handbook', landing: 'guides/overview.md' }
				}
			},
			documents: [
				{ key: 'guides/overview.md', metadata: { title: 'Overview' }, load: async () => 'overview' },
				{ key: 'guides/installation.md', metadata: { title: 'Install' }, load: async () => 'install' }
			]
		});

		expect(docs.get('guides/overview')?.href).toBe('/handbook');
		expect(docs.nav.sections.find((section) => section.title === 'Handbook')?.href).toBe('/handbook');
	});

	it('supports root-base folder landing overrides', () => {
		const docs = createDocsContentSource({
			config: {
				title: 'Mandalarepo',
				baseHref: '/',
				folders: { guides: { index: 'overview' } }
			},
			documents: [
				{ key: 'guides/overview.md', metadata: { title: 'Guides' }, load: async () => 'guides' },
				{ key: 'guides/install.md', metadata: { title: 'Install' }, load: async () => 'install' }
			]
		});

		expect(docs.get('guides/overview')?.href).toBe('/guides');
		expect(docs.nav.sections[0]?.href).toBe('/guides');
	});

	it('keeps hidden pages routable while excluding them from navigation and pager inputs', () => {
		const docs = source();
		expect(docs.get('guides/hidden')?.hidden).toBe(true);
		expect(docs.entries()).toContain('/docs/guides/hidden');
		expect(JSON.stringify(docs.nav)).not.toContain('Hidden');
	});

	it('sorts explicit order before stable route order', () => {
		const docs = source();
		expect(docs.documents.map((document) => document.slug)).toEqual([
			'guides/installation',
			'',
			'guides',
			'guides/advanced/performance',
			'guides/hidden'
		]);
	});

	it('rejects route collisions after normalization', () => {
		expect(() => createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs' },
			documents: [
				{ key: 'API.md', load: async () => 'one' },
				{ key: 'api.md', load: async () => 'two' }
			]
	})).toThrow(DocsContentError);
	});

	it('keeps long sibling page ids distinct', () => {
		const docs = createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs' },
			documents: [
				{
					key: 'text-collection-organization-literary-works-classical-kavya-literature/classical-kavya-literature.md',
					load: async () => 'one'
				},
				{
					key: 'text-collection-organization-literary-works-classical-kavya-literature/classical-kavya-literature-notes.md',
					load: async () => 'two'
				}
			]
		});

		const ids: string[] = [];
		const collect = (nodes: typeof docs.nav.sections[number]['items']) => {
			for (const node of nodes) {
				if (node.id) ids.push(node.id);
				if (node.children) collect(node.children);
			}
		};
		for (const section of docs.nav.sections) collect(section.items);
		expect(new Set(ids).size).toBe(ids.length);
		expect(ids).toHaveLength(2);
		expect(ids.every((id) => id.length > 64)).toBe(true);
	});

	it('keeps separator-distinct routes distinct in generated ids', () => {
		const docs = createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs' },
			documents: [
				{ key: 'a-b/foo.md', load: async () => 'first' },
				{ key: 'a/b-foo.md', load: async () => 'second' }
			]
		});
		const ids = docs.nav.sections.flatMap((section) => section.items.map((item) => item.id));
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('reports invalid metadata with the field name', () => {
		expect(() => createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs' },
			documents: [{ key: 'bad.md', metadata: { hidden: 'yes' }, load: async () => 'bad' }]
		})).toThrow('hidden');
	});

	it('scaffolds the host-defined page tree over physical source paths', () => {
		const docs = createDocsContentSource({
			config: {
				title: 'Documentation',
				baseHref: '/docs',
				entries: {
					handbook: {
						kind: 'group',
						title: 'Handbook',
						description: 'Host handbook overview',
						href: '/docs/handbook',
						landing: 'legacy/overview.md',
						order: 0
					},
					'legacy/overview': {
						title: 'Direct landing title',
						description: 'Direct landing description'
					},
					'guides/installation': {
						parent: 'handbook',
						title: 'Install',
						href: '/docs/handbook/install'
					},
					'loose': { parent: 'handbook', title: 'Loose page', order: -1 }
				}
			},
			documents: [
				{ key: 'legacy/overview.md', metadata: { title: 'Overview' }, load: async () => 'overview' },
				{ key: 'guides/installation.md', metadata: { title: 'Installation' }, load: async () => 'install' },
				{ key: 'loose.md', metadata: { title: 'Loose' }, load: async () => 'loose' }
			]
		});

		expect(docs.get('legacy/overview')?.href).toBe('/docs/handbook');
		expect(docs.get('legacy/overview')).toMatchObject({
			title: 'Direct landing title',
			description: 'Direct landing description'
		});
		expect(docs.get('guides/installation')?.href).toBe('/docs/handbook/install');
		expect(docs.nav.sections[0]?.title).toBe('Handbook');
		expect(docs.nav.sections[0]?.href).toBe('/docs/handbook');
		expect(docs.nav.sections[0]?.items.map((item) => item.title)).toEqual(['Loose page', 'Install']);
	});

	it('applies group landing metadata to the resolved document record', () => {
		const docs = createDocsContentSource({
			config: {
				title: 'Docs',
				baseHref: '/docs',
				entries: {
					handbook: {
						kind: 'group',
						title: 'Handbook',
						description: 'Host handbook overview',
						landing: 'legacy/overview'
					}
				}
			},
			documents: [{
				key: 'legacy/overview.md',
				metadata: { title: 'Frontmatter title', description: 'Frontmatter description' },
				load: async () => 'overview'
			}]
		});

		expect(docs.get('legacy/overview')).toMatchObject({
			title: 'Handbook',
			description: 'Host handbook overview'
		});
	});

	it('applies explicit page metadata and visibility to records and navigation', () => {
		const docs = createDocsContentSource({
			config: {
				title: 'Docs',
				baseHref: '/docs',
				entries: {
					guide: {
						title: 'Host Guide',
						description: 'Host description',
						hidden: true,
						order: -1,
						badge: 'New'
					}
				}
			},
			documents: [{
				key: 'guide.md',
				metadata: { title: 'Frontmatter Guide', description: 'Frontmatter description' },
				load: async () => 'guide'
			}]
		});

		expect(docs.get('guide')).toMatchObject({
			title: 'Host Guide',
			description: 'Host description',
			hidden: true,
			order: -1
		});
		expect(JSON.stringify(docs.nav)).not.toContain('Host Guide');
	});

	it('uses frontmatter brief as the description fallback', () => {
		const docs = createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs' },
			documents: [{ key: 'guide.md', metadata: { brief: 'A short summary' }, load: async () => 'guide' }]
		});

		expect(docs.get('guide')?.description).toBe('A short summary');
	});

	it('exposes configured group and folder badges', () => {
		const defined = createDocsContentSource({
			config: {
				title: 'Docs',
				baseHref: '/docs',
				entries: { guides: { kind: 'group', badge: 'New' } }
			},
			documents: [{ key: 'guides/page.md', load: async () => 'page' }]
		});
		const fallback = createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs', folders: { guides: { badge: 'Beta' } } },
			documents: [{ key: 'guides/page.md', load: async () => 'page' }]
		});
		const nested = createDocsContentSource({
			config: {
				title: 'Docs',
				baseHref: '/docs',
				entries: {
					guides: { kind: 'group' },
					'guides/advanced': { kind: 'group', badge: 'Preview' }
				}
			},
			documents: [{ key: 'guides/advanced/page.md', load: async () => 'page' }]
		});

		expect(defined.nav.sections[0]?.badge).toBe('New');
		expect(fallback.nav.sections[0]?.badge).toBe('Beta');
		expect(nested.nav.sections[0]?.items[0]).toMatchObject({ badge: 'Preview' });
	});

	it('rejects an explicit page definition without a discovered source', () => {
		expect(() => createDocsContentSource({
			config: {
				title: 'Docs',
				baseHref: '/docs',
				entries: { missing: { kind: 'page' } }
			},
			documents: []
		})).toThrow('missing source');
	});

	it('allows a discovered document to become a group with children', () => {
		const docs = createDocsContentSource({
			config: {
				title: 'Docs',
				baseHref: '/docs',
				entries: {
					'reference.md': { kind: 'group', title: 'Reference', order: 0 },
					'reference/one': { parent: 'reference.md', title: 'One' }
				}
			},
			documents: [
				{ key: 'reference.md', load: async () => 'reference' },
				{ key: 'reference/one.md', load: async () => 'one' }
			]
		});

		expect(docs.nav.sections[0]).toMatchObject({
			title: 'Reference',
			href: '/docs/reference'
		});
		expect(docs.nav.sections[0]?.items.map((item) => item.title)).toEqual(['One']);
	});

	it('supports a configured folder landing filename as fallback scaffolding', () => {
		const docs = createDocsContentSource({
			config: {
				title: 'Docs',
				baseHref: '/docs',
				folders: { guides: { index: 'overview' } }
			},
			documents: [
				{ key: 'guides/overview.md', load: async () => 'overview' },
				{ key: 'guides/install.md', load: async () => 'install' }
			]
		});

		expect(docs.get('guides/overview')?.href).toBe('/docs/guides');
		expect(docs.nav.sections[0]?.href).toBe('/docs/guides');
	});

	it('rejects an explicit definition with an unknown parent', () => {
		expect(() => createDocsContentSource({
			config: {
				title: 'Docs',
				baseHref: '/docs',
				entries: { 'guide.md': { parent: 'missing-group' } }
			},
			documents: [{ key: 'guide.md', load: async () => 'guide' }]
		})).toThrow('missing-group');
	});
});
