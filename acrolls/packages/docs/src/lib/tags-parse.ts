// Shared tag frontmatter parsing (leaf module — no feeds/posts imports).

import type { DocsContentDocument, DocsMetadata } from './content.js';

function isDocument(
	value: DocsContentDocument<unknown> | DocsMetadata
): value is DocsContentDocument<unknown> {
	return (
		typeof value === 'object' &&
		value !== null &&
		'metadata' in value &&
		'key' in value &&
		typeof (value as DocsContentDocument<unknown>).key === 'string'
	);
}

function readTags(metadata: DocsMetadata): string[] {
	const value = metadata['tags'];
	if (Array.isArray(value) && value.every((t) => typeof t === 'string')) {
		return (value as string[]).map((t) => t.trim()).filter(Boolean);
	}
	if (typeof value === 'string' && value.trim()) return [value.trim()];
	return [];
}

/** Normalize frontmatter `tags` for feeds, tags index, and PostTags. */
export function tagsOfPost(
	documentOrMeta: DocsContentDocument<unknown> | DocsMetadata | null | undefined
): string[] {
	if (!documentOrMeta) return [];
	if (isDocument(documentOrMeta)) return readTags(documentOrMeta.metadata);
	return readTags(documentOrMeta);
}
