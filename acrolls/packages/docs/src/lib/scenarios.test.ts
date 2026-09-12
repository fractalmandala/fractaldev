// Content-engine scenario suite — promoted from the one-off audit
// (`__audit__/scenarios.audit.test.ts`, D8) to a permanent regression home. These tests
// probe cross-feature behaviors as hosts hit them: corpus shapes, naming conventions,
// merges, authored mode, and the IA ordering rules. Unit coverage lives in
// content.test.ts / collection.test.ts; scenario coverage lives here.
import { describe, expect, it } from 'vitest';
import { content, mergeLoaders } from './collection.js';
import { DocsContentError, defineDocsConfig, numbered } from './content.js';

type Doc = string;

/** Minimal eager ContentLoader shaped like markdownGlob's output. */
const loader = (docs: Record<string, { metadata?: Record<string, unknown>; facts?: Record<string, unknown>; body?: string }>) => ({
	eager: true as const,
	list: () =>
		Object.entries(docs).map(([key, value]) => ({
			key,
			data: value.metadata ?? {},
			meta: value.facts as never,
			load: async () => value.body ?? 'body'
		}))
});

const titleList = (sections: Array<{ title: string }>) => sections.map((section) => section.title);

describe('Scenario: zero-config single folder with subfolders', () => {
	const docs = content({
		loader: loader({
			'index.md': {},
			'changelog.md': {},
			'guides/installation.md': {},
			'guides/advanced/performance.md': {},
			'reference/api.md': {}
		}),
		config: defineDocsConfig({ title: 'Test Docs', baseHref: '/docs' })
	}).sourceSync();

	it('derives sections from folders with humanized titles, API kept uppercase', () => {
		expect(titleList(docs.nav.sections)).toEqual(['Docs', 'Guides', 'Reference']);
		expect(docs.get('reference/api.md')?.title).toBe('API');
	});

	it('nests deeper subfolders as groups inside their section', () => {
		const guides = docs.nav.sections.find((section) => section.title === 'Guides');
		expect(guides?.items.map((item) => item.title)).toEqual(['Advanced', 'Installation']);
		const advanced = guides?.items.find((item) => item.title === 'Advanced');
		expect(advanced?.children?.map((child) => child.title)).toEqual(['Performance']);
	});

	it('routes every page under the baseHref; root index inherits the docs title', () => {
		expect(docs.get('guides/installation.md')?.href).toBe('/docs/guides/installation');
		expect(docs.get('guides/advanced/performance.md')?.href).toBe('/docs/guides/advanced/performance');
		expect(docs.get('index.md')?.title).toBe('Test Docs');
	});

	it('FIXED: filesystem-mode sections link to their own landing page', () => {
		// buildNav() now sets the section href/slug from the folder's landing page and stops
		// duplicating the landing as an item — matching authored/configured mode (buildDefinedNav)
		// and behavior 7: the landing link and the disclosure control are separate interactions.
		const guides = docs.nav.sections.find((section) => section.title === 'Guides');
		expect(docs.get('guides/index.md')).toBeUndefined(); // no index exists here…
		expect(guides?.href).toBeUndefined(); // …so this section stays disclosure-only
		const withIndex = content({
			loader: loader({ 'guides/index.md': {}, 'guides/installation.md': {} }),
			config: defineDocsConfig({ title: 'Test Docs', baseHref: '/docs' })
		}).sourceSync();
		const section = withIndex.nav.sections.find((candidate) => candidate.title === 'Guides');
		expect(withIndex.get('guides/index.md')?.href).toBe('/docs/guides');
		expect(section?.href).toBe('/docs/guides');
		expect(section?.items.map((item) => item.title)).toEqual(['Installation']);
	});
});

describe('Scenario: numbered naming convention', () => {
	const docs = content({
		loader: loader({
			'01-introduction.md': {},
			'02-getting-started.md': {},
			'10-components/01-button.md': {},
			'10-components/02-input.md': {}
		}),
		config: defineDocsConfig({ title: 'Test Docs', baseHref: '/docs', naming: numbered() })
	}).sourceSync();

	it('strips prefixes from slugs and titles', () => {
		expect(docs.get('01-introduction.md')?.slug).toBe('introduction');
		expect(docs.get('01-introduction.md')?.title).toBe('Introduction');
		expect(docs.get('10-components/01-button.md')?.title).toBe('Button');
	});

	it('WRINKLE: an ordered folder sorts ahead of the orderless root section', () => {
		// The root "Docs" section has no order; compareOptionalOrder sends it after any
		// folder whose NN- prefix (or folders[].order) encodes one.
		expect(titleList(docs.nav.sections)).toEqual(['Components', 'Docs']);
	});

	it('remediation: section.order keeps root pages first', () => {
		const fixed = content({
			loader: loader({ '01-introduction.md': {}, '10-components/01-button.md': {} }),
			config: defineDocsConfig({
				title: 'Test Docs',
				baseHref: '/docs',
				naming: numbered(),
				section: { order: 0 }
			})
		}).sourceSync();
		expect(titleList(fixed.nav.sections)).toEqual(['Docs', 'Components']);
		expect(fixed.nav.sections[0].items.map((item) => item.title)).toEqual(['Introduction']);
	});

	it('warns on mixed prefixes in one directory', () => {
		const warned = content({
			loader: loader({ '01-introduction.md': {}, 'unprefixed-note.md': {} }),
			config: defineDocsConfig({ title: 'Test Docs', baseHref: '/docs', naming: numbered() })
		}).sourceSync();
		const codes = warned.diagnostics.map((diagnostic) => diagnostic.code);
		expect(codes).toContain('ACROLLS_NAMING_ORDER');
	});
});

describe('Scenario: README.md as folder landing (package-style corpus)', () => {
	const docs = content({
		loader: loader({ 'package-a/README.md': {}, 'package-a/usage.md': {} }),
		config: defineDocsConfig({ title: 'Test Docs', baseHref: '/docs', indexNames: ['readme'] })
	}).sourceSync();

	it('treats README.md as the folder landing with the folder route and title', () => {
		expect(docs.get('package-a/README.md')?.href).toBe('/docs/package-a');
		expect(docs.get('package-a/README.md')?.title).toBe('Package A');
		expect(docs.get('package-a/usage.md')?.href).toBe('/docs/package-a/usage');
		expect(docs.nav.sections.map((section) => section.title)).toEqual(['Package A']);
	});

	it('FIXED: the README section links its landing page in filesystem mode', () => {
		// Fixed with the index.md gap: the landing becomes the section link (/docs/package-a)
		// and is no longer duplicated as an item.
		const section = docs.nav.sections[0];
		expect(section.href).toBe('/docs/package-a');
		expect(section.slug).toBe('package-a');
		expect(section.items.map((item) => item.title)).toEqual(['Usage']);
	});
});

describe('Scenario: two sources from different locations become sections', () => {
	const docs = content({
		loader: mergeLoaders<Doc>([
			{ prefix: 'packageA', loader: loader({ 'overview.md': {}, 'guides/setup.md': {} }) },
			{ prefix: 'package-b', loader: loader({ 'readme-thing.md': {}, 'guides/setup.md': {} }) }
		]),
		config: defineDocsConfig({ title: 'Test Docs', baseHref: '/docs' })
	}).sourceSync();

	it('FIXED: merged sections render in mergeLoaders declaration order', () => {
		// Fixed: mergeLoaders records each prefix's declaration index as a sectionOrder hint, so
		// the second-listed source no longer path-sorts ahead of the first. Explicit
		// folders[].order and naming-convention orders still win over the declaration hint.
		expect(titleList(docs.nav.sections)).toEqual(['Package A', 'Package B']);
	});

	it('keeps same-named files in different sources distinct', () => {
		expect(docs.get('packageA/guides/setup.md')?.href).toBe('/docs/package-a/guides/setup');
		expect(docs.get('package-b/guides/setup.md')?.href).toBe('/docs/package-b/guides/setup');
	});

	it('FIXED: camelCase prefixes slug and humanize cleanly', () => {
		// Fixed: slugify splits camelCase word boundaries ('packageA' → 'package-a', never
		// 'packagea') and humanize() splits them for titles ('Package A') — for source files and
		// folders too, not just merge prefixes.
		expect(docs.get('packageA/guides/setup.md')?.slug).toBe('package-a/guides/setup');
		expect(docs.nav.sections.find((section) => section.title === 'Package A')).toBeDefined();
	});

	it('explicit folders[].order wins over declaration order; raw casing keys match', () => {
		const fixed = content({
			loader: mergeLoaders<Doc>([
				{ prefix: 'packageA', loader: loader({ 'guides/setup.md': {} }) },
				{ prefix: 'package-b', loader: loader({ 'guides/setup.md': {} }) }
			]),
			config: defineDocsConfig({
				title: 'Test Docs',
				baseHref: '/docs',
				folders: {
					'packageA': { title: 'Package A', order: 1 },
					'package-b': { title: 'Package B', order: 0 }
				}
			})
		}).sourceSync();
		// Declaration order would put Package A first; the explicit orders reverse it.
		expect(titleList(fixed.nav.sections)).toEqual(['Package B', 'Package A']);
	});

	it('FIXED: folders keys match raw path casing; unmatched keys throw', () => {
		// Fixed: config keys register under both their raw and slug-space forms, so
		// 'packageA/guides' matches the folder the tree built as 'package-a/guides'. A key that
		// matches no discovered folder now throws instead of silently no-oping.
		const titled = content({
			loader: mergeLoaders<Doc>([{ prefix: 'packageA', loader: loader({ 'guides/setup.md': {} }) }]),
			config: defineDocsConfig({
				title: 'Test Docs',
				baseHref: '/docs',
				folders: { 'packageA/guides': { title: 'Setup guide' } }
			})
		}).sourceSync();
		expect(titled.nav.sections[0].title).toBe('Package A');
		expect(titled.nav.sections[0].items[0].title).toBe('Setup guide');

		expect(() =>
			content({
				loader: loader({ 'guides/setup.md': {} }),
				config: defineDocsConfig({
					title: 'Test Docs',
					baseHref: '/docs',
					folders: { 'no-such-folder': { title: 'Ghost' } }
				})
			}).sourceSync()
		).toThrow(/matches no discovered folder/);
	});
});

describe('Scenario: subfolder X should not be a section', () => {
	it('folders.hidden removes the subtree from nav but keeps pages routeable', () => {
		const docs = content({
			loader: loader({ 'a/one.md': {}, 'b/two.md': {}, 'x/private.md': {} }),
			config: defineDocsConfig({
				title: 'Test Docs',
				baseHref: '/docs',
				folders: { x: { hidden: true } }
			})
		}).sourceSync();
		// No root pages exist, so no root "Docs" section is emitted.
		expect(titleList(docs.nav.sections)).toEqual(['A', 'B']);
		expect(docs.get('x/private.md')?.hidden).toBe(true);
		expect(docs.get('x/private.md')?.href).toBe('/docs/x/private');
	});

	it('ACCEPTED: per-page parent overrides are the way to re-home pages', () => {
		// Accepted (2026-08-31): no folder-level flatten. Per-page parent overrides compose with
		// virtual groups for deeper reshaping, and wholesale restructuring belongs to the explicit
		// entries definition. Documented behavior, not a gap.
		const docs = content({
			loader: loader({ 'a/one.md': {}, 'x/private.md': {} }),
			config: defineDocsConfig({
				title: 'Test Docs',
				baseHref: '/docs',
				entries: { 'x/private': { parent: '' } }
			})
		}).sourceSync();
		const root = docs.nav.sections[0];
		expect(root.items.map((item) => item.title)).toEqual(['Private']);
		expect(titleList(docs.nav.sections)).toEqual(['Docs', 'A']);
	});
});

describe('Scenario: merge subfolders A and B into one section', () => {
	it('virtual group nests A and B under one section', () => {
		const docs = content({
			loader: loader({ 'a/one.md': {}, 'a/two.md': {}, 'b/three.md': {} }),
			config: defineDocsConfig({
				title: 'Test Docs',
				baseHref: '/docs',
				entries: {
					merged: { kind: 'group', title: 'Merged' },
					a: { kind: 'group', parent: 'merged', title: 'A' },
					b: { kind: 'group', parent: 'merged', title: 'B' }
				}
			})
		}).sourceSync();
		// All pages live in a/ and b/, so no root "Docs" section is emitted.
		expect(titleList(docs.nav.sections)).toEqual(['Merged']);
		const merged = docs.nav.sections[0];
		expect(merged.items.map((item) => item.title)).toEqual(['A', 'B']);
		expect(merged.items[0].children?.map((child) => child.title)).toEqual(['One', 'Two']);
	});

	it('per-page parents flatten A and B into one section; ties order alphabetically', () => {
		const docs = content({
			loader: loader({ 'a/one.md': {}, 'a/two.md': {}, 'b/three.md': {} }),
			config: defineDocsConfig({
				title: 'Test Docs',
				baseHref: '/docs',
				entries: {
					merged: { kind: 'group', title: 'Merged' },
					'a/one': { parent: 'merged', order: 1 },
					'a/two': { parent: 'merged', order: 3 },
					'b/three': { parent: 'merged', order: 2 }
				}
			})
		}).sourceSync();
		const merged = docs.nav.sections.find((section) => section.title === 'Merged');
		expect(merged?.items.map((item) => item.title)).toEqual(['One', 'Three', 'Two']);
	});
});

describe('Scenario: group landing pages and route overrides', () => {
	it('an entry href re-routes the folder index', () => {
		const docs = content({
			loader: loader({
				'guides/index.md': { metadata: { title: 'ignored' } },
				'guides/installation.md': {}
			}),
			config: defineDocsConfig({
				title: 'Test Docs',
				baseHref: '/docs',
				entries: {
					guides: { kind: 'group', title: 'Guides', landing: 'guides/index.md', href: '/docs/guide-home' }
				}
			})
		}).sourceSync();
		expect(docs.get('guides/index.md')?.href).toBe('/docs/guide-home');
		const guides = docs.nav.sections.find((section) => section.title === 'Guides');
		expect(guides?.href).toBe('/docs/guide-home');
	});

	it('two groups cannot share one landing page', () => {
		expect(() =>
			content({
				loader: loader({ 'a/index.md': {}, 'b/x.md': {} }),
				config: defineDocsConfig({
					title: 'Test Docs',
					baseHref: '/docs',
					entries: {
						a: { kind: 'group', landing: 'a/index.md' },
						b: { kind: 'group', landing: 'a/index.md' }
					}
				})
			}).sourceSync()
		).toThrow(DocsContentError);
	});

	it('two pages cannot claim one route', () => {
		expect(() =>
			content({
				loader: loader({ 'p1.md': {}, 'p2.md': {} }),
				config: defineDocsConfig({
					title: 'Test Docs',
					baseHref: '/docs',
					entries: { p1: { href: '/docs/dup' }, p2: { href: '/docs/dup' } }
				})
			}).sourceSync()
		).toThrow(/Duplicate docs route/);
	});
});

describe('Scenario: authored mode admission', () => {
	const docs = content({
		loader: loader({
			'index.md': { metadata: { title: 'Should be ignored' }, facts: { hasFrontmatter: true } },
			'good.md': { metadata: { title: 'Good page' }, facts: { hasFrontmatter: true } },
			'bad.md': {}
		}),
		config: defineDocsConfig({
			title: 'Test Docs',
			baseHref: '/docs',
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

	it('rejects pages without frontmatter and titles, reporting both rules', () => {
		const codes = docs.diagnostics.map((diagnostic) => diagnostic.code);
		expect(codes).toContain('ACROLLS_FRONTMATTER_REQUIRED');
		expect(codes).toContain('ACROLLS_TITLE_REQUIRED');
		expect(docs.get('bad.md')).toBeUndefined();
		expect(docs.get('good.md')?.title).toBe('Good page');
	});

	it('derives index titles from the folder and warns on frontmatter titles', () => {
		const codes = docs.diagnostics.map((diagnostic) => diagnostic.code);
		expect(codes).toContain('ACROLLS_INDEX_TITLE_IGNORED');
		expect(docs.get('index.md')?.title).toBe('Test Docs');
	});
});

describe('Scenario: draft filter vs hidden frontmatter', () => {
	const collection = content({
		loader: loader({
			'live.md': { metadata: { title: 'Live' } },
			'draft.md': { metadata: { title: 'Draft', draft: true } },
			'unlisted.md': { metadata: { title: 'Unlisted', hidden: true } }
		}),
		config: defineDocsConfig({ title: 'Test Docs', baseHref: '/docs' }),
		filter: (entry) => !entry.data.draft
	});
	const docs = collection.sourceSync();

	it('filter removes a document from every surface', async () => {
		await expect(collection.ids()).resolves.not.toContain('draft');
		expect(docs.get('draft.md')).toBeUndefined();
	});

	it('hidden stays routeable but leaves nav and list', async () => {
		expect(docs.get('unlisted.md')?.hidden).toBe(true);
		const titles = docs.nav.sections.flatMap((section) => section.items.map((item) => item.title));
		expect(titles).not.toContain('Unlisted');
		const summaries = await collection.list();
		expect(summaries.map((summary) => summary.id)).toEqual(['live']);
	});
});

describe('Scenario: duplicate keys across merged sources', () => {
	it('colliding keys throw with a naming remediation', () => {
		expect(() =>
			content({
				loader: mergeLoaders<Doc>([
					{ loader: loader({ 'intro.md': {} }) },
					{ loader: loader({ 'intro.md': {} }) }
				]),
				config: defineDocsConfig({ title: 'Test Docs', baseHref: '/docs' })
			}).sourceSync()
		).toThrow(/more than one source/);
	});
});

describe('Scenario: async source (CMS shape)', () => {
	it('source() resolves async loaders and builds the same nav', async () => {
		const asyncLoader = {
			eager: false as const,
			list: async () => [{ key: 'remote/page.md', data: { title: 'Remote page' }, load: async () => 'body' }]
		};
		const collection = content({
			loader: asyncLoader,
			config: defineDocsConfig({ title: 'Test Docs', baseHref: '/docs' })
		});
		const docs = await collection.source();
		expect(docs.get('remote/page.md')?.title).toBe('Remote page');
		expect(docs.nav.sections[0].items[0].title).toBe('Remote page');
		expect(() => collection.sourceSync()).toThrow(/eager: true/);
	});
});

describe('Scenario: docs mounted at site root', () => {
	const docs = content({
		loader: loader({ 'index.md': { metadata: { title: 'Home' } }, 'guide.md': {} }),
		config: defineDocsConfig({ title: 'Test Docs', baseHref: '/' })
	}).sourceSync();

	it('produces root-relative hrefs', () => {
		expect(docs.get('index.md')?.href).toBe('/');
		expect(docs.get('guide.md')?.href).toBe('/guide');
	});
});

describe('Scenario: IA precedence lock — host config > frontmatter sidebar > inferred', () => {
	// The locked P20 invariant: a host's config orders/labels win over page frontmatter, which
	// wins over what naming conventions and filenames infer. `sidebar.{order,label}` is the
	// canonical frontmatter spelling; flat `order` stays a working alias (canonical wins if both).

	it('frontmatter sidebar.order beats the naming convention', () => {
		// numbered() puts Installation (01-) ahead of Setup (02-); sidebar.order reverses them.
		const docs = content({
			loader: loader({
				'guides/01-installation.md': { metadata: { sidebar: { order: 2 } } },
				'guides/02-setup.md': { metadata: { sidebar: { order: 1 } } }
			}),
			config: defineDocsConfig({ title: 'Test Docs', baseHref: '/docs', naming: numbered() })
		}).sourceSync();
		const guides = docs.nav.sections.find((section) => section.title === 'Guides');
		expect(guides?.items.map((item) => item.title)).toEqual(['Setup', 'Installation']);
	});

	it('host config order beats frontmatter sidebar.order', () => {
		// sidebar.order alone orders Setup before Install; documents[].order on Install wins.
		const docs = content({
			loader: loader({
				'guides/install.md': { metadata: { sidebar: { order: 2 } } },
				'guides/setup.md': { metadata: { sidebar: { order: 1 } } }
			}),
			config: defineDocsConfig({
				title: 'Test Docs',
				baseHref: '/docs',
				documents: { 'guides/install': { order: 0 } }
			})
		}).sourceSync();
		const guides = docs.nav.sections.find((section) => section.title === 'Guides');
		expect(guides?.items.map((item) => item.title)).toEqual(['Install', 'Setup']);
	});

	it('flat order remains a working alias; canonical sidebar.order wins when both exist', () => {
		// Install carries flat order 1 and sidebar.order 2; Setup carries sidebar.order 1.
		// Canonical resolution: Setup (1) before Install (2). If the flat alias won, they would
		// tie at 1 and path order would put Install first.
		const docs = content({
			loader: loader({
				'guides/install.md': { metadata: { order: 1, sidebar: { order: 2 } } },
				'guides/setup.md': { metadata: { sidebar: { order: 1 } } }
			}),
			config: defineDocsConfig({ title: 'Test Docs', baseHref: '/docs' })
		}).sourceSync();
		const guides = docs.nav.sections.find((section) => section.title === 'Guides');
		expect(guides?.items.map((item) => item.title)).toEqual(['Setup', 'Install']);
	});

	it('sidebar.label renames the nav entry without touching the page title', () => {
		const docs = content({
			loader: loader({
				'guides/installation.md': {
					metadata: { title: 'The Complete Installation and Setup Guide', sidebar: { label: 'Setup' } }
				}
			}),
			config: defineDocsConfig({ title: 'Test Docs', baseHref: '/docs' })
		}).sourceSync();
		const guides = docs.nav.sections.find((section) => section.title === 'Guides');
		expect(guides?.items[0].title).toBe('Setup');
		expect(docs.get('guides/installation.md')?.title).toBe('The Complete Installation and Setup Guide');
	});

	it('host config title beats sidebar.label; a landing label names its section', () => {
		const docs = content({
			loader: loader({
				'guides/index.md': { metadata: { sidebar: { label: 'The Guides' } } },
				'guides/installation.md': {
					metadata: { title: 'Long Installation Title', sidebar: { label: 'Ignored' } }
				}
			}),
			config: defineDocsConfig({
				title: 'Test Docs',
				baseHref: '/docs',
				documents: { 'guides/installation': { title: 'Config Title' } }
			})
		}).sourceSync();
		const guides = docs.nav.sections.find((section) => section.slug === 'guides');
		expect(guides?.title).toBe('The Guides'); // landing sidebar.label names the section
		expect(guides?.items[0].title).toBe('Config Title'); // host config title wins over sidebar.label
	});

	it('a non-object sidebar is a loud error, not a silent skip', () => {
		expect(() =>
			content({
				loader: loader({ 'guides/install.md': { metadata: { sidebar: 'top' } } }),
				config: defineDocsConfig({ title: 'Test Docs', baseHref: '/docs' })
			}).sourceSync()
		).toThrow(/"sidebar" must be an object/);
	});
});
