import { createDocsContentSource, DocsContentError } from './content.js';
import type {
	DocsContentConfig,
	DocsContentDiagnostic,
	DocsContentDocument,
	DocsContentInput,
	DocsContentSource,
	DocsDocumentFacts,
	DocsMetadata
} from './content.js';

/** One validation issue, in the shape every Standard Schema vendor reports. */
export type StandardSchemaIssue = {
	readonly message: string;
	readonly path?: ReadonlyArray<PropertyKey | { key: PropertyKey }>;
};

/** The synchronous half of a Standard Schema validation result. */
export type StandardSchemaResult<Output> =
	| { readonly value: Output; readonly issues?: undefined }
	| { readonly issues: ReadonlyArray<StandardSchemaIssue> };

/**
 * Standard Schema v1, declared structurally so Acrolls adds no validation library to its
 * dependency tree. Hosts bring Valibot, Zod, Arktype, or any other Standard Schema vendor.
 *
 * `validate` returns `Result | Promise<Result>` exactly as the spec declares it. Narrowing it
 * to the synchronous branch would make every spec-compliant vendor schema structurally
 * unassignable, forcing hosts into a cast. Async results are honored by `source()`; the
 * synchronous `sourceSync()` path throws a {@link DocsContentError} naming the offending file.
 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
	readonly '~standard': {
		readonly version: 1;
		readonly vendor: string;
		readonly validate: (
			value: unknown
		) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>;
	};
}

/** One raw document yielded by a {@link ContentLoader}, before validation and filtering. */
export type LoadedDocument<TDocument> = {
	/** Source filesystem key, e.g. `guide/intro.md`. */
	key: string;
	/** Raw frontmatter for this document. */
	data: DocsMetadata;
	/** Static facts exported by the Acrolls mdsvex preprocessor, when available. */
	meta?: DocsDocumentFacts;
	/** Lazily resolves the document body/module. */
	load: () => Promise<TDocument>;
};

/**
 * The pluggable seam between a document store (Vite glob, CMS, database, API) and the
 * Acrolls nav/route engine. The engine consumes `list()` output, not globs.
 */
export type ContentLoader<TDocument> = {
	list(): LoadedDocument<TDocument>[] | Promise<LoadedDocument<TDocument>[]>;
	/** `true` when `list()` is synchronous, which makes {@link Collection.sourceSync} legal. */
	readonly eager: boolean;
	/**
	 * Optional per-section ordering hints keyed by source prefix. `mergeLoaders` records each
	 * prefixed source's declaration index here so merged sections render in the order the host
	 * listed them; explicit `folders[].order` and naming-convention orders still win.
	 */
	sectionOrder?: Readonly<Record<string, number>>;
	/**
	 * Reserved seam for future live/incremental sources. Declared only — there is no
	 * implementation, and nothing in Acrolls consumes it yet.
	 */
	live?(): AsyncIterable<number | ReadonlyArray<string>>;
};

/** A fully resolved server-side entry. Carries the body loader and preprocessor facts. */
export type Entry<TData, TDocument> = {
	/** Public routeable slug. This is what {@link Collection.ids} returns and `get()` accepts. */
	id: string;
	/** Source filesystem key, e.g. `guide/intro.md`. */
	key: string;
	data: TData;
	meta?: DocsDocumentFacts;
	body: () => Promise<TDocument>;
	href: string;
	hidden: boolean;
};

/** Wire-safe projection of an {@link Entry}. Never carries `body` or `meta`. */
export type EntrySummary<TData> = {
	id: string;
	key: string;
	data: TData;
	href: string;
	hidden: boolean;
};

/**
 * A schema for a collection: one Standard Schema, or an array of them layered left→right (a blessed
 * genre stack plus your own extras). {@link content} validates every layer and merges their outputs.
 */
export type SchemaInput = StandardSchemaV1 | readonly StandardSchemaV1[];

type SchemaOutput<TSchema> = TSchema extends StandardSchemaV1<never, infer TOutput> ? TOutput : never;

type UnionToIntersection<TUnion> = (
	TUnion extends unknown ? (value: TUnion) => void : never
) extends (value: infer TIntersection) => void
	? TIntersection
	: never;

/**
 * Resolves the data type a schema produces, falling back to raw metadata when none is given. An
 * array layers left→right, so the result is the intersection of every layer's output.
 */
export type InferredData<TSchema> = TSchema extends readonly StandardSchemaV1[]
	? UnionToIntersection<SchemaOutput<TSchema[number]>> extends infer TMerged
		? [TMerged] extends [Record<string, unknown>]
			? TMerged
			: DocsMetadata
		: DocsMetadata
	: TSchema extends StandardSchemaV1<never, infer TOutput>
		? TOutput
		: DocsMetadata;

/** The declarative collection returned by {@link content}. */
export type Collection<TDocument, TSchema extends SchemaInput | undefined = undefined> = {
	/** Resolves the underlying content source, awaiting async loaders. */
	source(): Promise<DocsContentSource<TDocument>>;
	/** Synchronous variant. Throws unless the loader declares `eager: true`. */
	sourceSync(): DocsContentSource<TDocument>;
	/** Looks up one entry by slug, key, key-without-extension, or href. */
	get(id: string): Promise<Entry<InferredData<TSchema>, TDocument> | null>;
	/** Wire-safe summaries for every non-hidden document, in engine order. */
	list<TResult = EntrySummary<InferredData<TSchema>>>(options?: {
		map?: (entry: EntrySummary<InferredData<TSchema>>) => TResult;
	}): Promise<TResult[]>;
	/** Every document slug, including hidden ones, since hidden pages stay routeable. */
	ids(): Promise<string[]>;
};

/** Options accepted by {@link content}. */
export type ContentOptions<TDocument, TSchema extends SchemaInput | undefined> = {
	loader: ContentLoader<TDocument>;
	config: DocsContentConfig;
	/** Optional Standard Schema validating each document's frontmatter. */
	schema?: TSchema;
	/**
	 * Removes a document from every surface, including direct URL access. Receives the source
	 * `key` rather than a slug: the engine is the sole route authority, so no trustworthy `id`
	 * exists before it runs.
	 */
	filter?: (entry: {
		key: string;
		data: InferredData<TSchema>;
		meta?: DocsDocumentFacts;
	}) => boolean;
};

type Pipeline<TDocument> = {
	documents: DocsContentInput<TDocument>[];
	diagnostics: DocsContentDiagnostic[];
};

/**
 * Declares a content collection over any {@link ContentLoader}.
 *
 * The pipeline is load → validate → filter → engine: the resulting `DocsContentInput[]` is
 * handed to `createDocsContentSource` untouched, so all nav, group, route, breadcrumb, pager,
 * admission, and diagnostic behavior is the engine's, verbatim.
 */
export function content<TDocument, TSchema extends SchemaInput | undefined = undefined>(
	options: ContentOptions<TDocument, TSchema>
): Collection<TDocument, TSchema> {
	const build = (pipeline: Pipeline<TDocument>): DocsContentSource<TDocument> => {
		const engine = createDocsContentSource({
			config: options.config,
			documents: pipeline.documents,
			sectionOrder: options.loader.sectionOrder
		});
		return {
			...engine,
			diagnostics: [...pipeline.diagnostics, ...engine.diagnostics]
		};
	};

	const sourceSync = (): DocsContentSource<TDocument> => {
		if (options.loader.eager !== true) {
			throw new Error(
				'sourceSync() requires a loader with eager: true. This loader resolves asynchronously — use await source() instead.'
			);
		}
		return build(runPipelineSync(options.loader.list() as LoadedDocument<TDocument>[], options));
	};

	const source = async (): Promise<DocsContentSource<TDocument>> =>
		build(await runPipelineAsync(await options.loader.list(), options));

	return {
		source,
		sourceSync,
		async get(id) {
			const resolved = await source();
			const document = resolved.get(id);
			return document ? toEntry<InferredData<TSchema>, TDocument>(document) : null;
		},
		async list<TResult = EntrySummary<InferredData<TSchema>>>(listOptions?: {
			map?: (entry: EntrySummary<InferredData<TSchema>>) => TResult;
		}): Promise<TResult[]> {
			const resolved = await source();
			const summaries = resolved.documents
				.filter((document) => !document.hidden)
				.map((document) => toSummary<InferredData<TSchema>, TDocument>(document));
			const map = listOptions?.map;
			return map ? summaries.map(map) : (summaries as unknown as TResult[]);
		},
		async ids() {
			const resolved = await source();
			return resolved.documents.map((document) => document.slug);
		}
	};
}

/**
 * Synchronous pipeline. A schema whose `validate` returns a Promise cannot be honored here, so
 * it throws rather than admitting a silently unvalidated document.
 */
function runPipelineSync<TDocument, TSchema extends SchemaInput | undefined>(
	loaded: readonly LoadedDocument<TDocument>[],
	options: ContentOptions<TDocument, TSchema>
): Pipeline<TDocument> {
	const pipeline: Pipeline<TDocument> = { documents: [], diagnostics: [] };

	const layers = schemaLayers(options.schema);

	for (const document of loaded) {
		let result: StandardSchemaResult<unknown> | undefined;
		if (layers.length > 0) {
			const merged: Record<string, unknown> = {};
			const issues: StandardSchemaIssue[] = [];
			for (const layer of layers) {
				const returned = layer['~standard'].validate(document.data ?? {});
				if (isPromise(returned)) {
					throw new DocsContentError(
						`Schema validation for "${document.key}" returned a Promise. Asynchronous schema validation is not supported on the synchronous path — use "await source()" instead of "sourceSync()", or supply a synchronous validator.`
					);
				}
				if (returned.issues) issues.push(...returned.issues);
				else Object.assign(merged, returned.value);
			}
			result = issues.length > 0 ? { issues } : { value: merged };
		}
		admit(document, result, options, pipeline);
	}

	return pipeline;
}

/** Asynchronous pipeline. Awaits schema results, so async validators validate for real. */
async function runPipelineAsync<TDocument, TSchema extends SchemaInput | undefined>(
	loaded: readonly LoadedDocument<TDocument>[],
	options: ContentOptions<TDocument, TSchema>
): Promise<Pipeline<TDocument>> {
	const pipeline: Pipeline<TDocument> = { documents: [], diagnostics: [] };

	const layers = schemaLayers(options.schema);

	for (const document of loaded) {
		// Sequential by design: document order is the engine's input order, and validation is
		// pure, so there is nothing to gain from interleaving.
		let result: StandardSchemaResult<unknown> | undefined;
		if (layers.length > 0) {
			const merged: Record<string, unknown> = {};
			const issues: StandardSchemaIssue[] = [];
			for (const layer of layers) {
				// Each layer validates the raw frontmatter; outputs merge left→right, so a later
				// layer's field wins. One layer's issues do not skip the rest — every problem is
				// reported at once.
				const returned = await layer['~standard'].validate(document.data ?? {});
				if (returned.issues) issues.push(...returned.issues);
				else Object.assign(merged, returned.value);
			}
			result = issues.length > 0 ? { issues } : { value: merged };
		}
		admit(document, result, options, pipeline);
	}

	return pipeline;
}

/** Normalize a schema option (single, array, or absent) to the ordered list of layers to run. */
function schemaLayers(schema: SchemaInput | undefined): readonly StandardSchemaV1[] {
	if (!schema) return [];
	return Array.isArray(schema) ? schema : [schema as StandardSchemaV1];
}

/**
 * Shared validate → filter → engine-input step. Everything after the schema call is identical
 * on both paths; only the awaiting differs.
 */
function admit<TDocument, TSchema extends SchemaInput | undefined>(
	document: LoadedDocument<TDocument>,
	result: StandardSchemaResult<unknown> | undefined,
	options: ContentOptions<TDocument, TSchema>,
	pipeline: Pipeline<TDocument>
): void {
	let data: DocsMetadata = document.data ?? {};

	if (result) {
		if (result.issues) {
			pipeline.diagnostics.push({
				code: 'ACROLLS_SCHEMA_INVALID',
				severity: 'error',
				file: document.key,
				message: `Frontmatter failed schema: ${result.issues.map(formatIssue).join('; ')}`,
				remediation: 'Fix the frontmatter fields to match the collection schema.'
			});
			// Authored mode fails fast like the engine's own admission rules; migration mode
			// reports the diagnostic and keeps the raw, unvalidated frontmatter.
			if (options.config.convention?.mode === 'authored') return;
		} else {
			data = result.value as DocsMetadata;
		}
	}

	if (
		options.filter &&
		!options.filter({
			key: document.key,
			data: data as InferredData<TSchema>,
			meta: document.meta
		})
	) {
		return;
	}

	pipeline.documents.push({
		key: document.key,
		metadata: data,
		facts: document.meta,
		load: document.load
	});
}

function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
	return typeof (value as { then?: unknown } | null)?.then === 'function';
}

function formatIssue(issue: StandardSchemaIssue): string {
	const path = (issue.path ?? [])
		.map((segment) => String(typeof segment === 'object' && segment !== null ? segment.key : segment))
		.join('.');
	return path ? `${path}: ${issue.message}` : issue.message;
}

function toEntry<TData, TDocument>(document: DocsContentDocument<TDocument>): Entry<TData, TDocument> {
	return {
		id: document.slug,
		key: document.key,
		data: document.metadata as TData,
		meta: document.facts,
		body: document.loader,
		href: document.href,
		hidden: document.hidden
	};
}

function toSummary<TData, TDocument>(document: DocsContentDocument<TDocument>): EntrySummary<TData> {
	return {
		id: document.slug,
		key: document.key,
		data: document.metadata as TData,
		href: document.href,
		hidden: document.hidden
	};
}

// Multi-source merge helpers (P22) — re-exported here so consumers reach them
// through the same `acrolls/content` surface as `content()` and `markdownGlob`.
export { mergeLoaders, mergeRaw } from './merge.js';
export type { MergeSource, MergeRawSource } from './merge.js';
