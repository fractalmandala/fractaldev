import {
	type DocsContentConfig,
	type DocsContentSource,
	type DocsDocumentFacts,
	type DocsMetadata
} from '@acrolls/docs/content';
import { content, type ContentLoader, type LoadedDocument } from '@acrolls/docs/collection';

export { content } from '@acrolls/docs/collection';
export type {
	Collection,
	ContentLoader,
	Entry,
	EntrySummary,
	LoadedDocument,
	StandardSchemaV1
} from '@acrolls/docs/collection';
export type {
	DocsContentConfig,
	DocsContentEntryConfig,
	DocsContentDocument,
	DocsContentInput,
	DocsContentLoader,
	DocsContentSource,
	DocsDocumentConfig,
	DocsDocumentFacts,
	DocsFolderConfig,
	DocsMetadata
} from '@acrolls/docs/content';

export type AcrollsDocsGlob<TDocument> = Record<string, () => Promise<TDocument>>;
export type AcrollsDocsFactsGlob = Record<string, DocsDocumentFacts>;

export type AcrollsDocsSourceOptions<TDocument> = {
	/** The lazy default-component glob returned by import.meta.glob(). */
	modules: AcrollsDocsGlob<TDocument>;
	/** The eager metadata glob, keyed exactly like modules. */
	metadata?: Record<string, DocsMetadata>;
	/** Eager compile-time facts glob for the Acrolls-owned `__acrollsDocument` export. */
	facts?: AcrollsDocsFactsGlob;
	/** The directory prefix removed from each Vite glob key. */
	contentRoot: string;
	config: DocsContentConfig;
};

/** One eager Markdown module as Vite materializes it. */
export type AcrollsMarkdownModule = {
	metadata?: DocsMetadata;
	__acrollsDocument?: DocsDocumentFacts;
};

export type MarkdownGlobOptions<TDocument> = {
	/** `import.meta.glob('<root>/**\/*.md', { import: 'default' })` — lazy body modules. */
	body: Record<string, () => Promise<TDocument>>;
	/**
	 * Legacy eager full-module glob. Prefer the named `metadata` and `facts` globs below so
	 * compiled article components and their Shiki runtime stay out of the eager graph.
	 */
	modules?: Record<string, AcrollsMarkdownModule>;
	/** `import.meta.glob('<root>/**\/*.md', { eager: true, import: 'metadata' })`. */
	metadata?: Record<string, DocsMetadata>;
	/** `import.meta.glob('<root>/**\/*.md', { eager: true, import: '__acrollsDocument' })`. */
	facts?: AcrollsDocsFactsGlob;
	/** Directory prefix stripped from glob keys, e.g. `'../../content'`. */
	root: string;
};

/**
 * Build an eager {@link ContentLoader} from Vite's Markdown globs, for
 * `content({ loader: markdownGlob({ ... }) })`.
 *
 * The body glob stays lazy. Metadata and compile-time facts may be supplied as named eager
 * globs, which lets Rollup tree-shake the compiled article component and Shiki out of the
 * initial graph. `modules` remains supported for hosts using the original full eager glob.
 */
export function markdownGlob<TDocument>(
	options: MarkdownGlobOptions<TDocument>
): ContentLoader<TDocument> {
	const root = normalizeGlobPath(options.root);

	return {
		eager: true,
		list(): LoadedDocument<TDocument>[] {
			return Object.entries(options.body).map(([key, load]) => {
				const module = options.modules?.[key];
				return {
					key: removeGlobRoot(key, root),
					data: options.metadata?.[key] ?? module?.metadata ?? {},
					meta: options.facts?.[key] ?? module?.__acrollsDocument,
					load
				};
			});
		}
	};
}

/**
 * Normalize a raw-Markdown glob into a `document.key`-keyed map for the AI static
 * tier (llms.txt, per-page `.md`, copy-as-markdown). Applies the SAME root
 * stripping as {@link markdownGlob}, so keys line up with `docs.documents[].key`.
 */
export function markdownRaw(options: { raw: Record<string, string>; root: string }): Record<string, string> {
	const root = normalizeGlobPath(options.root);
	const out: Record<string, string> = {};
	for (const [key, value] of Object.entries(options.raw)) {
		out[removeGlobRoot(key, root)] = value;
	}
	return out;
}

/**
 * Wrap an arbitrary document store (CMS, database, HTTP API) as a {@link ContentLoader}.
 * The nav/route engine consumes `list()` output, not globs, so a remote source needs no
 * changes to navigation, routing, breadcrumbs, or pager.
 */
export function customSource<TDocument>(
	source: Pick<ContentLoader<TDocument>, 'list' | 'live'>
): ContentLoader<TDocument> {
	return {
		eager: false,
		list: source.list,
		live: source.live
	};
}

/**
 * Adapt the old three-glob source shape without changing its public signature.
 *
 * @deprecated Prefer `content({ loader: markdownGlob({ body, metadata, facts, root }), config })`.
 */
export function createAcrollsDocsSource<TDocument>(
	options: AcrollsDocsSourceOptions<TDocument>
): DocsContentSource<TDocument> {
	const root = normalizeGlobPath(options.contentRoot);
	const loader: ContentLoader<TDocument> = {
		eager: true,
		list: (): LoadedDocument<TDocument>[] =>
			Object.entries(options.modules).map(([key, load]) => ({
				key: removeGlobRoot(key, root),
				data: options.metadata?.[key] ?? {},
				meta: options.facts?.[key],
				load
			}))
	};

	return content({ loader, config: options.config }).sourceSync();
}

function normalizeGlobPath(value: string): string {
	return value.replaceAll('\\', '/').replace(/^\.\//, '').replace(/\/+$/, '');
}

function removeGlobRoot(key: string, root: string): string {
	const normalizedKey = key.replaceAll('\\', '/');
	const prefix = `${root}/`;
	if (!normalizedKey.startsWith(prefix)) {
		throw new Error(`Docs glob key "${key}" is outside configured contentRoot "${root}".`);
	}
	return normalizedKey.slice(prefix.length);
}
