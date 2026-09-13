import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { flattenDocsNav } from 'acrolls/docs';
import { docs } from '../../lib/docs/source';

export const load: PageLoad = async () => {
	const landing = docs.get('') ?? docs.get(docs.nav.baseHref);
	if (landing) {
		const Article = await landing.loader();
		return { slug: landing.slug, Article };
	}
	// Sample corpus has no root index — first leaf in sidebar/nav order.
	const first = flattenDocsNav(docs.nav).find((item) => item.href && item.href !== docs.nav.baseHref);
	if (first?.href) redirect(308, first.href);
	error(404, 'No documentation pages found');
};
