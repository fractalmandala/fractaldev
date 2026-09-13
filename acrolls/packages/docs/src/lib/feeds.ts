// Acrolls blog feeds — framework-neutral RSS 2.0, Atom 1.0, and JSON Feed 1.1
// from a docs/content source of posts. No Svelte here; host routes return the strings.

import type { DocsContentSource } from './content.js';
import type { DocsRawSources } from './ai.js';
import { listPosts, type DocsPost } from './posts.js';

export type { DocsPost } from './posts.js';
export { listPosts, isPost, postDateOf } from './posts.js';
export type { DocsPostListOptions } from './posts.js';

export type DocsFeedOptions = {
	/** Feed title; defaults to `source.nav.title`. */
	title?: string;
	/** Feed subtitle / description; defaults to `source.nav.subtitle`. */
	description?: string;
	/** Absolute self URL of this feed (Atom + JSON Feed). */
	feedUrl?: string;
	/** Language / locale BCP-47 (RSS `language`, Atom `xml:lang`). */
	language?: string;
	/** Author name applied when a post has none. */
	author?: string;
	/**
	 * Include full Markdown body as content when raw sources are provided.
	 * Defaults to description-only (summary) when raw is omitted.
	 */
	raw?: DocsRawSources;
	/** Max items (newest first). Default: all posts. */
	limit?: number;
	/**
	 * How to treat documents with no resolvable `date`.
	 * - `skip` (default): classic blog posts only
	 * - `include`: keep undated docs/posts in indexes and feeds (date falls back to `undatedDate`)
	 */
	undated?: 'skip' | 'include';
	/** ISO date used when `undated: 'include'` and a document has no date. Default: `1970-01-01`. */
	undatedDate?: string;
};

function escapeXml(value: string): string {
	return value
		.toString()
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function rfc822(date: string): string {
	if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return new Date(`${date}T00:00:00.000Z`).toUTCString();
	}
	const ms = Date.parse(date);
	const d = Number.isFinite(ms) ? new Date(ms) : new Date();
	return d.toUTCString();
}

function atomDate(date: string): string {
	if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return `${date}T00:00:00.000Z`;
	const ms = Date.parse(date);
	return Number.isFinite(ms) ? new Date(ms).toISOString() : new Date().toISOString();
}

function bodyOf(post: DocsPost, raw?: DocsRawSources): string | undefined {
	if (!raw) return undefined;
	const body = raw[post.document.key];
	return typeof body === 'string' ? body.trim() : undefined;
}

function pickPosts(source: DocsContentSource<unknown>, options: DocsFeedOptions): DocsPost[] {
	return listPosts(source, {
		limit: options.limit,
		undated: options.undated,
		undatedDate: options.undatedDate
	});
}

function stripTrailingSlash(value: string): string {
	return value.replace(/\/+$/, '');
}

/** RSS 2.0 document string. */
export function docsRss(source: DocsContentSource<unknown>, options: DocsFeedOptions = {}): string {
	const nav = source.nav;
	const title = options.title ?? nav.title;
	const description = options.description ?? nav.subtitle ?? title;
	const site = nav.site ? stripTrailingSlash(nav.site) : undefined;
	const channelLink = site ?? nav.baseHref;
	const posts = pickPosts(source, options);
	const items = posts
		.map((post) => {
			const desc = post.document.description ?? '';
			const content = bodyOf(post, options.raw);
			const author = post.author ?? options.author;
			const parts = [
				`    <title>${escapeXml(post.document.title)}</title>`,
				`    <link>${escapeXml(post.url)}</link>`,
				`    <guid isPermaLink="true">${escapeXml(post.url)}</guid>`,
				`    <pubDate>${escapeXml(rfc822(post.date))}</pubDate>`
			];
			if (desc) parts.push(`    <description>${escapeXml(desc)}</description>`);
			if (content) parts.push(`    <content:encoded><![CDATA[${content}]]></content:encoded>`);
			if (author) parts.push(`    <dc:creator>${escapeXml(author)}</dc:creator>`);
			for (const tag of post.tags) parts.push(`    <category>${escapeXml(tag)}</category>`);
			return `  <item>\n${parts.join('\n')}\n  </item>`;
		})
		.join('\n');

	const channel: string[] = [
		`  <title>${escapeXml(title)}</title>`,
		`  <link>${escapeXml(channelLink)}</link>`,
		`  <description>${escapeXml(description)}</description>`
	];
	if (options.language) channel.push(`  <language>${escapeXml(options.language)}</language>`);
	if (options.feedUrl) channel.push(`  <atom:link href="${escapeXml(options.feedUrl)}" rel="self" type="application/rss+xml"/>`);

	return (
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">\n` +
		`<channel>\n${channel.join('\n')}\n${items}\n</channel>\n</rss>\n`
	);
}

/** Atom 1.0 document string. */
export function docsAtom(source: DocsContentSource<unknown>, options: DocsFeedOptions = {}): string {
	const nav = source.nav;
	const title = options.title ?? nav.title;
	const subtitle = options.description ?? nav.subtitle;
	const site = nav.site ? stripTrailingSlash(nav.site) : undefined;
	const posts = pickPosts(source, options);
	const updated = posts[0] ? atomDate(posts[0].date) : new Date().toISOString();
	const feedId = options.feedUrl ?? (site ? `${site}${nav.baseHref}` : nav.baseHref);

	const entries = posts
		.map((post) => {
			const author = post.author ?? options.author;
			const summary = post.document.description;
			const content = bodyOf(post, options.raw);
			const lines = [
				`  <entry>`,
				`    <title>${escapeXml(post.document.title)}</title>`,
				`    <link rel="alternate" href="${escapeXml(post.url)}"/>`,
				`    <id>${escapeXml(post.url)}</id>`,
				`    <updated>${escapeXml(atomDate(post.date))}</updated>`,
				`    <published>${escapeXml(atomDate(post.date))}</published>`
			];
			if (author) {
				lines.push(`    <author><name>${escapeXml(author)}</name></author>`);
			}
			if (summary) lines.push(`    <summary>${escapeXml(summary)}</summary>`);
			if (content) {
				lines.push(`    <content type="text">${escapeXml(content)}</content>`);
			}
			for (const tag of post.tags) {
				lines.push(`    <category term="${escapeXml(tag)}"/>`);
			}
			lines.push(`  </entry>`);
			return lines.join('\n');
		})
		.join('\n');

	const head = [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<feed xmlns="http://www.w3.org/2005/Atom"${options.language ? ` xml:lang="${escapeXml(options.language)}"` : ''}>`,
		`  <title>${escapeXml(title)}</title>`,
		subtitle ? `  <subtitle>${escapeXml(subtitle)}</subtitle>` : null,
		`  <link rel="alternate" href="${escapeXml(site ?? nav.baseHref)}"/>`,
		options.feedUrl ? `  <link rel="self" href="${escapeXml(options.feedUrl)}"/>` : null,
		`  <id>${escapeXml(feedId)}</id>`,
		`  <updated>${escapeXml(updated)}</updated>`
	]
		.filter(Boolean)
		.join('\n');

	return `${head}\n${entries}\n</feed>\n`;
}

/** JSON Feed 1.1 document string. */
export function docsJsonFeed(source: DocsContentSource<unknown>, options: DocsFeedOptions = {}): string {
	const nav = source.nav;
	const title = options.title ?? nav.title;
	const description = options.description ?? nav.subtitle;
	const site = nav.site ? stripTrailingSlash(nav.site) : undefined;
	const posts = pickPosts(source, options);

	const items = posts.map((post) => {
		const content = bodyOf(post, options.raw);
		const item: Record<string, unknown> = {
			id: post.url,
			url: post.url,
			title: post.document.title,
			date_published: atomDate(post.date)
		};
		if (post.document.description) item.summary = post.document.description;
		if (content) item.content_text = content;
		if (post.author ?? options.author) {
			item.authors = [{ name: post.author ?? options.author }];
		}
		if (post.tags.length) item.tags = post.tags;
		return item;
	});

	const feed: Record<string, unknown> = {
		version: 'https://jsonfeed.org/version/1.1',
		title,
		home_page_url: site ?? nav.baseHref,
		items
	};
	if (description) feed.description = description;
	if (options.feedUrl) feed.feed_url = options.feedUrl;
	if (options.language) feed.language = options.language;
	if (options.author) feed.authors = [{ name: options.author }];

	return `${JSON.stringify(feed, null, 2)}\n`;
}
