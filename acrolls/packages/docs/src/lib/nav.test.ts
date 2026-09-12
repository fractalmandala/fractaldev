import { describe, expect, it } from 'vitest';
import {
	buildDocsCrumbs,
	docsPager,
	findActiveDocsItem,
	flattenDocsNav,
	nodeContainsPath,
	withNavIds
} from './nav.js';
import type { DocsNav } from './types.js';

const sample: DocsNav = {
	title: 'Developer',
	baseHref: '/docs/developer',
	storageKey: 'dev',
	sections: [
		{
			id: 'core',
			title: 'Core',
			defaultOpen: true,
			items: [
				{ title: 'Architecture', href: '/docs/developer/architecture' },
				{
					title: 'Data',
					children: [
						{ title: 'Pipeline', href: '/docs/developer/corpus-pipeline' },
						{ title: 'Artifacts', href: '/docs/developer/artifact-contracts' }
					]
				}
			]
		},
		{
			id: 'ui',
			title: 'UI',
			items: [{ title: 'Reader', href: '/docs/developer/reader-and-lens' }]
		}
	]
};

describe('nested nav', () => {
	it('flattens leaves depth-first', () => {
		const leaves = flattenDocsNav(withNavIds(sample));
		expect(leaves.map((l) => l.title)).toEqual([
			'Architecture',
			'Pipeline',
			'Artifacts',
			'Reader'
		]);
	});

	it('finds nested active item', () => {
		const active = findActiveDocsItem(sample, '/docs/developer/artifact-contracts');
		expect(active?.title).toBe('Artifacts');
	});

	it('nodeContainsPath walks children', () => {
		const data = sample.sections[0]!.items[1]!;
		expect(nodeContainsPath(data, '/docs/developer/corpus-pipeline')).toBe(true);
		expect(nodeContainsPath(data, '/docs/developer/architecture')).toBe(false);
	});

	it('pager crosses nested boundaries', () => {
		const { previous, next } = docsPager(sample, '/docs/developer/corpus-pipeline');
		expect(previous?.title).toBe('Architecture');
		expect(next?.title).toBe('Artifacts');
	});

	it('crumbs include section and nested groups', () => {
		const crumbs = buildDocsCrumbs(sample, '/docs/developer/artifact-contracts', {
			homeLabel: 'App'
		});
		expect(crumbs.map((c) => c.label)).toEqual([
			'App',
			'Developer',
			'Core',
			'Data',
			'Artifacts'
		]);
	});

	it('treats a top-level section landing as a page', () => {
		const nav: DocsNav = {
			title: 'Docs',
			baseHref: '/docs',
			sections: [{
				id: 'guides',
				title: 'Guides',
				href: '/docs/guides',
				items: [{ title: 'Install', href: '/docs/guides/install' }]
			}]
		};

		expect(flattenDocsNav(nav).map((item) => item.title)).toEqual(['Guides', 'Install']);
		expect(findActiveDocsItem(nav, '/docs/guides')?.title).toBe('Guides');
		expect(buildDocsCrumbs(nav, '/docs/guides').map((crumb) => crumb.label)).toEqual([
			'Home',
			'Docs',
			'Guides'
		]);
		expect(docsPager(nav, '/docs/guides/install').previous?.title).toBe('Guides');
	});

	it('does not repeat a root section title for its index page', () => {
		const nav: DocsNav = {
			title: 'Fractalsvelte',
			baseHref: '/docs',
			sections: [{
				id: 'docs',
				title: 'Docs',
				items: [{ title: 'Docs', href: '/docs' }]
			}]
		};

		const crumbs = buildDocsCrumbs(nav, '/docs');
		expect(crumbs.map((crumb) => crumb.label)).toEqual(['Home', 'Fractalsvelte', 'Docs']);
		expect(crumbs.at(-1)?.href).toBeUndefined();
	});

	it('isolates duplicate host ids before keyed rendering', () => {
		const nav: DocsNav = {
			title: 'Docs',
			baseHref: '/docs',
			sections: [
				{
					id: 'same',
					title: 'One',
					items: [{ id: 'same-page', title: 'First', href: '/docs/first' }]
				},
				{
					id: 'same',
					title: 'Two',
					items: [{ id: 'same-page', title: 'Second', href: '/docs/second' }]
				}
			]
		};

		const normalized = withNavIds(nav);
		const ids = normalized.sections.flatMap((section) => [
			section.id,
			...section.items.map((item) => item.id)
		]);
		expect(new Set(ids).size).toBe(ids.length);
		expect(ids).toEqual(['same', 'same-page', 'same-2', 'same-page-2']);
	});
});
