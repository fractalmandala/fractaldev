// Content negotiation helpers for docs/blog pages.
// Host endpoints can return Markdown when the client asks for it.

import type { DocsContentSource } from './content.js';
import { docsPageMarkdown, type DocsRawSources } from './ai.js';

export type DocsNegotiateKind = 'markdown' | 'html' | 'json' | 'any';

export type DocsNegotiateResult =
	| { kind: 'markdown'; body: string; contentType: 'text/markdown; charset=utf-8' }
	| { kind: 'html'; body?: undefined; contentType: 'text/html; charset=utf-8' }
	| { kind: 'missing'; body?: undefined; contentType?: undefined };

/**
 * Parse an `Accept` header into the preferred docs representation.
 * Prefers `text/markdown` / `text/x-markdown` / `text/plain` over HTML when explicitly ranked higher.
 */
export function preferDocsRepresentation(acceptHeader: string | null | undefined): DocsNegotiateKind {
	if (!acceptHeader || !acceptHeader.trim()) return 'html';
	const parts = acceptHeader.split(',').map((part) => {
		const [type, ...params] = part.trim().split(';');
		let q = 1;
		for (const param of params) {
			const [k, v] = param.trim().split('=');
			if (k === 'q' && v) q = Number(v) || 0;
		}
		return { type: type.trim().toLowerCase(), q };
	});
	parts.sort((a, b) => b.q - a.q);

	for (const { type, q } of parts) {
		if (q <= 0) continue;
		if (type === 'text/markdown' || type === 'text/x-markdown') return 'markdown';
		if (type === 'application/json') return 'json';
		if (type === 'text/html' || type === 'application/xhtml+xml') return 'html';
		if (type === 'text/plain') return 'markdown';
		if (type === '*/*' || type === 'text/*') return 'any';
	}
	return 'html';
}

/**
 * Resolve a page as Markdown when requested. Returns `missing` when the slug is unknown
 * or raw source is absent; returns `html` when the client prefers HTML (caller renders the page).
 */
export function negotiateDocsPage(
	acceptHeader: string | null | undefined,
	source: DocsContentSource<unknown>,
	slug: string,
	raw: DocsRawSources
): DocsNegotiateResult {
	const prefer = preferDocsRepresentation(acceptHeader);
	if (prefer === 'html') {
		return { kind: 'html', contentType: 'text/html; charset=utf-8' };
	}
	const body = docsPageMarkdown(source, slug, raw);
	if (body === undefined) {
		if (prefer === 'markdown' || prefer === 'json') return { kind: 'missing' };
		return { kind: 'html', contentType: 'text/html; charset=utf-8' };
	}
	if (prefer === 'markdown' || prefer === 'any' || prefer === 'json') {
		return { kind: 'markdown', body, contentType: 'text/markdown; charset=utf-8' };
	}
	return { kind: 'html', contentType: 'text/html; charset=utf-8' };
}
