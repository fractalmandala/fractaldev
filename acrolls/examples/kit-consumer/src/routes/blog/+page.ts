import type { PageLoad } from './$types';
import { listPosts } from 'acrolls/docs';
import { blog } from '../../lib/blog/source';

export const load: PageLoad = async () => {
	return {
		posts: listPosts(blog, { undated: 'include' }).map((post) => ({
			title: post.document.title,
			description: post.document.description,
			href: post.document.href,
			date: postDateLabel(post),
			author: post.author,
			tags: post.tags.length
				? post.tags
				: tagsFromMeta(post.document.metadata)
		}))
	};
};

function postDateLabel(post: { date: string; document: { metadata: Record<string, unknown> } }): string | undefined {
	// Hide the synthetic undated sentinel in the UI.
	if (post.date === '1970-01-01') {
		const category = post.document.metadata['category'];
		return typeof category === 'string' ? category : undefined;
	}
	return post.date;
}

function tagsFromMeta(metadata: Record<string, unknown>): string[] {
	const tags = metadata['tags'];
	if (Array.isArray(tags) && tags.every((t) => typeof t === 'string')) return tags as string[];
	return [];
}
