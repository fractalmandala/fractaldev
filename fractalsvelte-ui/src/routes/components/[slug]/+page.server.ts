import { error } from '@sveltejs/kit';
import { componentBySlug } from '#lib/docs/catalogue.ts';
import { highlightCode } from '#lib/docs/shiki.server.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const component = componentBySlug(params.slug);
	if (!component) error(404, 'Component not found');
	return {
		component,
		usageHtml: await highlightCode(component.usage, 'svelte')
	};
};
