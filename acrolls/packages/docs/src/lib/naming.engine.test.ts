import { describe, expect, it } from 'vitest';
import { createDocsContentSource, numbered, dated } from './content.js';
import type { DocsContentInput } from './content.js';

type Doc = string;

function doc(key: string, metadata: Record<string, unknown> = {}): DocsContentInput<Doc> {
	return { key, metadata, load: async () => key };
}

/** Flatten the nav into `title @ href` leaves in nav order, for order assertions. */
function leaves(source: ReturnType<typeof createDocsContentSource<Doc>>): string[] {
	const out: string[] = [];
	const walk = (nodes: readonly { title: string; href?: string; children?: readonly unknown[] }[]) => {
		for (const node of nodes) {
			out.push(`${node.title} @ ${node.href ?? '—'}`);
			if (node.children) walk(node.children as typeof nodes);
		}
	};
	for (const section of source.nav.sections) walk(section.items as never);
	return out;
}

describe('configurable index names (ISSUE-05)', () => {
	it('recognizes INDEX.md case-insensitively by default', () => {
		const source = createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs' },
			documents: [doc('guides/INDEX.md', { title: 'Guides' })]
		});
		// Landing collapses to the folder route, not /docs/guides/index.
		expect(source.get('/docs/guides')?.slug).toBe('guides');
	});

	it('treats README.md as a folder landing when configured', () => {
		const source = createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs', indexNames: ['index', 'readme'] },
			documents: [
				doc('guides/README.md', { title: 'Guides' }),
				doc('guides/install.md', { title: 'Install' })
			]
		});
		expect(source.get('/docs/guides')?.title).toBe('Guides');
		expect(source.get('/docs/guides')?.slug).toBe('guides');
	});

	it('leaves README as an ordinary page without the config', () => {
		const source = createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs' },
			documents: [doc('guides/README.md', { title: 'Readme' })]
		});
		expect(source.get('guides/readme')?.slug).toBe('guides/readme');
	});
});

describe('numbered() convention (ISSUE-06)', () => {
	const build = () =>
		createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs', naming: numbered() },
			documents: [
				doc('02-guides/01-install.md'),
				doc('02-guides/00-intro.md'),
				doc('01-start/00-overview.md')
			]
		});

	it('strips the NN- prefix from slugs and hrefs', () => {
		const source = build();
		expect(source.get('start/overview')?.href).toBe('/docs/start/overview');
		expect(source.get('guides/install')?.slug).toBe('guides/install');
	});

	it('derives clean titles from the stripped filename — no "00 Overview"', () => {
		const source = build();
		expect(source.get('start/overview')?.title).toBe('Overview');
		expect(source.get('guides/install')?.title).toBe('Install');
	});

	it('orders sections and pages by their numeric prefix, not alphabetically', () => {
		const source = build();
		// Section order: 01-start before 02-guides.
		expect(source.nav.sections.map((s) => s.title)).toEqual(['Start', 'Guides']);
		// Page order inside guides: 00-intro before 01-install.
		expect(leaves(build())).toContain('Intro @ /docs/guides/intro');
		const guides = source.nav.sections.find((s) => s.title === 'Guides');
		expect(guides?.items.map((i) => i.title)).toEqual(['Intro', 'Install']);
	});

	it('lets frontmatter order still win over the prefix', () => {
		const source = createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs', naming: numbered() },
			documents: [
				doc('01-a.md', { order: 5 }),
				doc('02-b.md') // prefix order 2
			]
		});
		// a has frontmatter order 5, b has prefix order 2 → b first.
		expect(source.nav.sections[0].items.map((i) => i.title)).toEqual(['B', 'A']);
	});

	it('emits an ordering diagnostic for mixed prefixes', () => {
		const source = createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs', naming: numbered() },
			documents: [doc('guides/01-install.md'), doc('guides/setup.md')]
		});
		const naming = source.diagnostics.find((d) => d.code === 'ACROLLS_NAMING_ORDER');
		expect(naming?.message).toContain('mixed prefixed and unprefixed');
	});

	it('does not treat the index landing as an unprefixed sibling', () => {
		const source = createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs', naming: numbered() },
			documents: [doc('01-guides/index.md'), doc('01-guides/00-install.md')]
		});
		expect(source.diagnostics.some((d) => d.code === 'ACROLLS_NAMING_ORDER')).toBe(false);
	});
});

describe('dated() convention (blog)', () => {
	it('strips the date prefix and orders chronologically', () => {
		const source = createDocsContentSource({
			config: { title: 'Blog', baseHref: '/blog', naming: dated() },
			documents: [
				doc('2026-08-13-release.md', { title: 'Release' }),
				doc('2026-01-02-hello.md', { title: 'Hello' })
			]
		});
		expect(source.get('/blog/release')?.href).toBe('/blog/release');
		// Oldest first in document order.
		expect(source.nav.sections[0].items.map((i) => i.title)).toEqual(['Hello', 'Release']);
	});
});

describe('the default (no naming) preserves legacy behavior', () => {
	it('keeps NN- prefixes in slugs and titles', () => {
		const source = createDocsContentSource({
			config: { title: 'Docs', baseHref: '/docs' },
			documents: [doc('01-start.md', { title: '01 Start' })]
		});
		expect(source.get('01-start')?.slug).toBe('01-start');
	});
});
