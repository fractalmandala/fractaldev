import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { tagsOfPost } from 'acrolls/docs';
import { blog } from '../../../lib/blog/source';

export const entries: EntryGenerator = () =>
	blog.documents.filter((document) => document.slug).map((document) => ({ slug: document.slug }));

export const load: PageLoad = async ({ params }) => {
	const slug = params.slug ?? '';
	const document = blog.get(slug);
	if (!document) error(404, `Blog post "${slug}" not found`);
	const Article = await document.loader();
	return {
		slug,
		Article,
		title: document.title,
		description: document.description,
		date: document.metadata.date as string | undefined,
		author: document.metadata.author as string | undefined,
		tags: tagsOfPost(document)
	};
};
