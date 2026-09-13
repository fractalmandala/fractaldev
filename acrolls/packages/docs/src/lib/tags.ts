// Acrolls blog tags — distinct tag list, per-tag post sets, and href helpers.
// Framework-neutral; hosts own `/blog/tags` and `/blog/tags/[tag]` routes.

import type { DocsContentSource } from './content.js';
import { listPosts, type DocsPost } from './posts.js';
import { tagsOfPost } from './tags-parse.js';
import { slugify } from './nav-path.js';

export { tagsOfPost } from './tags-parse.js';
export type DocsTag = {
	/** Author-facing label (first-seen spelling). */
	label: string;
	/** URL identity (`slugify(label)`). */
	slug: string;
	/** Number of matching posts. */
	count: number;
	/** Path to the tag page under the blog base. */
	href: string;
};

export type DocsTagsOptions = {
	/** Blog area base href, e.g. `/blog`. */
	baseHref: string;
	/** Segment under baseHref for tag routes. Default `tags`. */
	tagsPath?: string;
	/** Forwarded to {@link listPosts}. */
	undated?: 'skip' | 'include';
	undatedDate?: string;
};

function stripSlash(value: string): string {
	return value.replace(/\/+$/, '') || '/';
}

function ensureLeading(value: string): string {
	if (!value) return '/';
	return value.startsWith('/') ? value : `/${value}`;
}

/** Stable URL slug for a tag label. */
export function tagSlug(label: string): string {
	return slugify(label.trim()) || 'tag';
}

function tagsBase(options: DocsTagsOptions): string {
	const base = stripSlash(ensureLeading(options.baseHref));
	const segment = (options.tagsPath ?? 'tags').replace(/^\/+|\/+$/g, '') || 'tags';
	return `${base}/${segment}`;
}

/** Href for a tag label or slug under the blog tags path. */
export function tagHref(labelOrSlug: string, options: DocsTagsOptions): string {
	const slug = tagSlug(labelOrSlug);
	return `${tagsBase(options)}/${slug}`;
}

function postOptions(options: DocsTagsOptions) {
	return { undated: options.undated, undatedDate: options.undatedDate };
}

/**
 * Distinct tags across the blog source, sorted by label.
 * Labels prefer the first-seen spelling among posts in `listPosts` order.
 */
export function listTags(source: DocsContentSource<unknown>, options: DocsTagsOptions): DocsTag[] {
	const posts = listPosts(source, postOptions(options));
	const bySlug = new Map<string, { label: string; count: number }>();

	for (const post of posts) {
		const seenInPost = new Set<string>();
		for (const raw of tagsOfPost(post.document)) {
			const slug = tagSlug(raw);
			if (seenInPost.has(slug)) continue;
			seenInPost.add(slug);
			const existing = bySlug.get(slug);
			if (existing) {
				existing.count += 1;
			} else {
				bySlug.set(slug, { label: raw, count: 1 });
			}
		}
	}

	return [...bySlug.entries()]
		.map(([slug, { label, count }]) => ({
			label,
			slug,
			count,
			href: `${tagsBase(options)}/${slug}`
		}))
		.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
}

/** Resolve a route param (slug or label) to a tag, or undefined when unknown. */
export function resolveTag(
	source: DocsContentSource<unknown>,
	tagParam: string,
	options: DocsTagsOptions
): DocsTag | undefined {
	const want = tagSlug(tagParam);
	return listTags(source, options).find((t) => t.slug === want);
}

/** Posts that carry a tag matching `tagSlugOrLabel` (by slug identity). */
export function postsForTag(
	source: DocsContentSource<unknown>,
	tagSlugOrLabel: string,
	options: DocsTagsOptions
): DocsPost[] {
	const want = tagSlug(tagSlugOrLabel);
	return listPosts(source, postOptions(options)).filter((post) =>
		tagsOfPost(post.document).some((t) => tagSlug(t) === want)
	);
}
