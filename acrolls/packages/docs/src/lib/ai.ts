// Acrolls AI surface (static tier) — framework-neutral. Generates llms.txt /
// llms-full.txt and per-page Markdown from the content tree, plus an `ai.exclude`
// helper. Server-tier features (Ask chat, MCP) are intentionally out of scope here.

import type { DocsContentSource, DocsContentDocument, DocsMetadata } from './content.js';

/** `raw` markdown keyed exactly like the body/modules globs (i.e. document.key).
 * Provide via `import.meta.glob('<root>/**\/*.md', { query: '?raw', import: 'default', eager: true })`. */
export type DocsRawSources = Record<string, string>;

export type DocsAiOptions = {
	/** Heading for the link list. */
	title?: string;
};

/** True when a document opts out of AI surfaces via frontmatter `ai: { exclude: true }`. */
export function isAiExcluded(metadata?: DocsMetadata): boolean {
	const ai = metadata?.['ai'];
	return Boolean(ai && typeof ai === 'object' && (ai as { exclude?: unknown }).exclude === true);
}

function stripTrailingSlash(value: string): string {
	return value.replace(/\/+$/, '');
}

function absoluteUrl(site: string | undefined, path: string): string {
	if (/^https?:\/\//.test(path)) return path;
	if (!site) return path;
	return `${stripTrailingSlash(site)}${path.startsWith('/') ? '' : '/'}${path}`;
}

function includedDocuments(source: DocsContentSource<unknown>): DocsContentDocument<unknown>[] {
	return source.documents.filter((doc) => !doc.hidden && !isAiExcluded(doc.metadata));
}

/** Generate `llms.txt` — the compact index: title, summary, and a link list. */
export function docsLlmsTxt(source: DocsContentSource<unknown>, options: DocsAiOptions = {}): string {
	const { nav } = source;
	const lines: string[] = [`# ${nav.title}`];
	if (nav.subtitle) lines.push('', `> ${nav.subtitle}`);
	lines.push('', `## ${options.title ?? 'Documentation'}`, '');
	for (const doc of includedDocuments(source)) {
		const url = absoluteUrl(nav.site, doc.href);
		lines.push(`- [${doc.title}](${url})${doc.description ? `: ${doc.description}` : ''}`);
	}
	return `${lines.join('\n')}\n`;
}

/** Generate `llms-full.txt` — every included page's raw Markdown, concatenated. */
export function docsLlmsFullTxt(
	source: DocsContentSource<unknown>,
	raw: DocsRawSources,
	options: DocsAiOptions = {}
): string {
	const { nav } = source;
	const parts: string[] = [`# ${nav.title}`];
	if (nav.subtitle) parts.push(`\n> ${nav.subtitle}`);
	for (const doc of includedDocuments(source)) {
		const body = raw[doc.key];
		if (body === undefined) continue;
		const url = absoluteUrl(nav.site, doc.href);
		parts.push(`\n\n---\n\n# ${doc.title}\nSource: ${url}\n\n${body.trim()}`);
	}
	return `${parts.join('\n')}\n`;
}

/** Raw Markdown for a single page, for a per-page `.md` endpoint or copy button.
 * Returns undefined when the slug is unknown or its source is absent. */
export function docsPageMarkdown(
	source: DocsContentSource<unknown>,
	slug: string,
	raw: DocsRawSources
): string | undefined {
	const doc = source.get(slug);
	if (!doc) return undefined;
	return raw[doc.key];
}
