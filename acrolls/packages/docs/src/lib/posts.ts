// Acrolls blog posts — membership, dates, and ordering shared by feeds and tags.

import type { DocsContentDocument, DocsContentSource, DocsMetadata } from './content.js';
import { dateOf } from './naming.js';
import { tagsOfPost } from './tags-parse.js';

/** One post ready for index / feed / tag emission. */
export type DocsPost = {
	document: DocsContentDocument<unknown>;
	/** ISO calendar date `YYYY-MM-DD` (or full ISO datetime if the host stored one). */
	date: string;
	author?: string;
	tags: string[];
	/** Absolute or site-joined URL for the post. */
	url: string;
};

export type DocsPostListOptions = {
	limit?: number;
	/**
	 * How to treat documents with no resolvable `date`.
	 * - `skip` (default): classic blog posts only
	 * - `include`: keep undated docs/posts (date falls back to `undatedDate`)
	 */
	undated?: 'skip' | 'include';
	/** ISO date used when `undated: 'include'` and a document has no date. Default: `1970-01-01`. */
	undatedDate?: string;
};

function stripTrailingSlash(value: string): string {
	return value.replace(/\/+$/, '');
}

function absoluteUrl(site: string | undefined, path: string): string {
	if (/^https?:\/\//.test(path)) return path;
	if (!site) return path;
	return `${stripTrailingSlash(site)}${path.startsWith('/') ? '' : '/'}${path}`;
}

function isDraft(metadata: DocsMetadata): boolean {
	return metadata['draft'] === true;
}

function stringField(metadata: DocsMetadata, key: string): string | undefined {
	const value = metadata[key];
	return typeof value === 'string' && value.trim() ? value : undefined;
}

/** Coerce YAML Date objects / ISO datetimes down to a stable feed date string. */
function coerceDate(value: unknown): string | null {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString().slice(0, 10);
	}
	if (typeof value === 'string' && value.trim()) {
		const trimmed = value.trim();
		const day = trimmed.match(/^(\d{4}-\d{2}-\d{2})(?:[Tt ].*)?$/);
		if (day) return day[1];
		return trimmed;
	}
	return null;
}

/**
 * Resolve a post date from frontmatter `date`, else a `YYYY-MM-DD-` filename prefix on the
 * last path segment of the source key. Returns null when neither is present — non-posts.
 */
export function postDateOf(document: DocsContentDocument<unknown>, format = 'YYYY-MM-DD'): string | null {
	const fromMeta = coerceDate(document.metadata['date']);
	if (fromMeta) return fromMeta;
	const base = document.key.split('/').pop() ?? document.key;
	const stem = base.replace(/\.[^.]+$/, '');
	return dateOf(stem, format);
}

/** True when the document looks like a blog post (has a resolvable date, not hidden/draft). */
export function isPost(document: DocsContentDocument<unknown>): boolean {
	if (document.hidden || isDraft(document.metadata)) return false;
	return postDateOf(document) !== null;
}

/**
 * List posts newest-first. Documents without a date are skipped unless `undated: 'include'`.
 * Sort key is the parsed timestamp of `date`; ties break on order then href.
 */
export function listPosts(
	source: DocsContentSource<unknown>,
	options: DocsPostListOptions = {}
): DocsPost[] {
	const site = source.nav.site;
	const undated = options.undated ?? 'skip';
	const undatedDate = options.undatedDate ?? '1970-01-01';
	const posts: DocsPost[] = [];
	for (const document of source.documents) {
		if (document.hidden || isDraft(document.metadata)) continue;
		const date = postDateOf(document);
		if (!date && undated === 'skip') continue;
		const author = stringField(document.metadata, 'author');
		posts.push({
			document,
			date: date ?? undatedDate,
			author,
			tags: tagsOfPost(document),
			url: absoluteUrl(site, document.href)
		});
	}
	posts.sort((a, b) => {
		const tb = Date.parse(b.date) || 0;
		const ta = Date.parse(a.date) || 0;
		if (tb !== ta) return tb - ta;
		const ob = a.document.order ?? 0;
		const oa = b.document.order ?? 0;
		if (oa !== ob) return oa - ob;
		return a.document.href.localeCompare(b.document.href);
	});
	if (options.limit !== undefined && options.limit >= 0) return posts.slice(0, options.limit);
	return posts;
}
