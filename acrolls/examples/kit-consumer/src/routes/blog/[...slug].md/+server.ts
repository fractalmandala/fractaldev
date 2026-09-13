import { error } from '@sveltejs/kit';
import type { EntryGenerator, RequestHandler } from './$types';
import { negotiateDocsPage } from 'acrolls/docs';
import { blog, raw } from '../../../lib/blog/source';

export const prerender = true;

export const entries: EntryGenerator = () =>
	blog.documents.filter((document) => document.slug).map((document) => ({ slug: document.slug }));

export const GET: RequestHandler = ({ params, request }) => {
	const slug = params.slug ?? '';
	// Force markdown path: the `.md` route always serves source text.
	const result = negotiateDocsPage('text/markdown', blog, slug, raw);
	if (result.kind !== 'markdown') error(404, `Markdown source for "${slug}" not found`);
	return new Response(result.body, {
		headers: {
			'content-type': result.contentType,
			vary: 'accept'
		}
	});
};
