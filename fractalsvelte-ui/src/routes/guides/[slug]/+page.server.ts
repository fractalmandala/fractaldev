import { error } from '@sveltejs/kit';
import { guideBySlug } from '#lib/docs/guides.ts';
import { renderMarkdown } from '#lib/docs/markdown.server.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const guide = guideBySlug(params.slug);
	if (!guide) error(404, 'Guide not found');
	return {
		guide: {
			...guide,
			html: await renderMarkdown(guide.markdown)
		}
	};
};
