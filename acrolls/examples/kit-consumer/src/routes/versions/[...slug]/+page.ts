import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { versionedDocs } from '../../../lib/versions/source';

export const entries: EntryGenerator = () =>
	versionedDocs.documents
		.filter((document) => document.slug)
		.map((document) => ({ slug: document.slug }));

export const load: PageLoad = async ({ params }) => {
	const slug = params.slug ?? '';
	const document = versionedDocs.get(slug);
	if (!document) error(404, `Versioned page "${slug}" not found`);
	const Article = await document.loader();
	return { slug, Article, title: document.title, description: document.description };
};
