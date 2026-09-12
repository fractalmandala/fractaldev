import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { docs } from '../../../lib/docs/source';

export const entries: EntryGenerator = () =>
	docs.documents.filter((document) => document.slug).map((document) => ({ slug: document.slug }));

export const load: PageLoad = async ({ params }) => {
	const slug = params.slug ?? '';
	const document = docs.get(slug);
	if (!document) error(404, `Documentation page "${slug || 'index'}" not found`);
	const Article = await document.loader();
	return { slug, Article };
};
