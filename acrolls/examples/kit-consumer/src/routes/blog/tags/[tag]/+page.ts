import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { listTags, postsForTag, resolveTag } from 'acrolls/docs';
import { blog, blogTagOptions } from '../../../../lib/blog/source';

export const entries: EntryGenerator = () =>
	listTags(blog, blogTagOptions).map((tag) => ({ tag: tag.slug }));

export const load: PageLoad = async ({ params }) => {
	const tag = resolveTag(blog, params.tag, blogTagOptions);
	if (!tag) error(404, `Tag "${params.tag}" not found`);
	const posts = postsForTag(blog, params.tag, blogTagOptions).map((post) => ({
		title: post.document.title,
		description: post.document.description,
		href: post.document.href,
		tags: post.tags
	}));
	return { tag, posts };
};
