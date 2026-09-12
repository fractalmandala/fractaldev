// Multi-source docs — merge several content sources into one hierarchy.
//
// `content()` takes a single ContentLoader, but the nav/route engine builds its
// tree purely from each document's `key` path segments. So merging N sources and
// prefixing each set's keys yields one docs hierarchy where every set becomes a
// first-level section:
//
//   set1/intro.md   →  Set 1 ▸ Intro
//   set2/api.md     →  Set 2 ▸ API
//
// Framework-neutral: this composes ContentLoaders, so it works with Vite globs
// (`markdownGlob`), `customSource`, or any mix of them.

import { DocsContentError } from './content.js';
import type { ContentLoader, LoadedDocument } from './collection.js';

/** One source in a merged collection. */
export type MergeSource<TDocument> = {
	/** Key prefix for this set — becomes its first-level section (e.g. `set1`).
	 * Omit to merge a source at the root. */
	prefix?: string;
	loader: ContentLoader<TDocument>;
};

function normalizePrefix(prefix?: string): string {
	return (prefix ?? '').replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+$/, '');
}

function prefixKey(prefix: string, key: string): string {
	return prefix ? `${prefix}/${key}` : key;
}

function mergeLists<TDocument>(
	sources: readonly MergeSource<TDocument>[],
	lists: readonly LoadedDocument<TDocument>[][]
): LoadedDocument<TDocument>[] {
	const owners = new Map<string, string>();
	const merged: LoadedDocument<TDocument>[] = [];

	lists.forEach((list, index) => {
		const prefix = normalizePrefix(sources[index]?.prefix);
		const label = prefix || '<root>';
		for (const document of list) {
			const key = prefixKey(prefix, document.key);
			const previous = owners.get(key);
			if (previous !== undefined) {
				throw new DocsContentError(
					`Merged docs key "${key}" is produced by more than one source ("${previous}" and "${label}"). ` +
						'Give each source a distinct prefix, or remove the duplicate file.'
				);
			}
			owners.set(key, label);
			merged.push({ ...document, key });
		}
	});

	return merged;
}

/**
 * Merge several content sources into one collection, prefixing each set's keys.
 *
 * ```ts
 * export const docs = content({
 *   loader: mergeLoaders([
 *     { prefix: 'set1', loader: markdownGlob({ body: b1, modules: m1, root: '../../content/set1' }) },
 *     { prefix: 'set2', loader: markdownGlob({ body: b2, modules: m2, root: '../../content/set2' }) }
 *   ]),
 *   config: defineDocsConfig({ title: 'Docs', baseHref: '/docs' })
 * }).sourceSync();
 * ```
 *
 * The merged loader is `eager` only when every source is eager, so `sourceSync()`
 * stays legal for all-glob merges and `await source()` is required if any source
 * resolves asynchronously.
 */
export function mergeLoaders<TDocument>(
	sources: readonly MergeSource<TDocument>[]
): ContentLoader<TDocument> {
	const eager = sources.every((source) => source.loader.eager);
	// Declaration order becomes the sections' fallback order: each prefixed source records its
	// position so merged sets render in the order the host listed them. Explicit
	// `folders[].order` and naming-convention orders still win over the hint.
	const sectionOrder: Record<string, number> = {};
	sources.forEach((source, index) => {
		const prefix = normalizePrefix(source.prefix);
		if (prefix) sectionOrder[prefix] = index;
	});

	return {
		eager,
		sectionOrder,
		list() {
			const lists = sources.map((source) => source.loader.list());
			if (eager) return mergeLists(sources, lists as LoadedDocument<TDocument>[][]);
			return Promise.all(lists).then((resolved) => mergeLists(sources, resolved));
		}
	};
}

/** One raw-Markdown set, keyed like its loader's documents (see `markdownRaw`). */
export type MergeRawSource = {
	prefix?: string;
	raw: Record<string, string>;
};

/**
 * Merge raw-Markdown maps with the same prefixes used for {@link mergeLoaders},
 * so the AI static tier (llms.txt, per-page markdown, copy-as-markdown) stays
 * aligned with the merged document keys.
 */
export function mergeRaw(sources: readonly MergeRawSource[]): Record<string, string> {
	const merged: Record<string, string> = {};
	for (const source of sources) {
		const prefix = normalizePrefix(source.prefix);
		for (const [key, value] of Object.entries(source.raw)) {
			merged[prefixKey(prefix, key)] = value;
		}
	}
	return merged;
}
