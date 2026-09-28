import { error } from '@sveltejs/kit';
import docs from '$lib/data/docs.json' with { type: 'json' };
import { META } from '$lib/docs/meta/index.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = async ({ params }) => {
	const component = docs.components.find((c) => c.slug === params.component);
	if (!component) error(404, 'Component not found');

	return { component, meta: META[component.slug] ?? null };
};
