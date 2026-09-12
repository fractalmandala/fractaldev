import type { DocsNav, DocsNavNode, DocsNavSection } from './types.js';
import { normalizePath, slugify, stableId } from './nav-path.js';
import { passthroughNaming, type DocsNamingConvention } from './naming.js';

export { numbered, dated, dateOf, passthroughNaming } from './naming.js';
export type {
	DocsNamingConvention,
	DocsSegment,
	NumberedOptions,
	DatedOptions,
	VerifiedDocsNamingConvention
} from './naming.js';

export type DocsMetadata = Readonly<Record<string, unknown>>;

/** Static facts exported by the Acrolls mdsvex preprocessor for a Markdown module. */
export type DocsDocumentFacts = Readonly<{
	hasFrontmatter: boolean;
	leadingH1?: string;
	links?: readonly string[];
}>;

export type DocsContentDiagnostic = Readonly<{
	code: string;
	severity: 'warning' | 'error';
	file: string;
	message: string;
	remediation?: string;
}>;

export type DocsConvention = Readonly<{
	mode?: 'migration' | 'authored';
	frontmatter?: Readonly<{
		ordinaryPageTitle?: 'required';
		indexTitle?: 'folder';
		description?: 'optional';
		leadingH1?: 'suppress-and-warn' | 'preserve';
	}>;
}>;

export type DocsContentLoader<TDocument> = () => Promise<TDocument>;

export type DocsFolderConfig = {
	title?: string;
	description?: string;
	badge?: string;
	/** Optional landing filename stem used when no host entry overrides it. */
	index?: string;
	order?: number;
	hidden?: boolean;
	defaultOpen?: boolean;
	id?: string;
};

export type DocsContentEntryConfig = {
	kind?: 'page' | 'group';
	parent?: string;
	href?: string;
	landing?: string;
	title?: string;
	description?: string;
	order?: number;
	hidden?: boolean;
	defaultOpen?: boolean;
	badge?: string;
};

export type DocsDocumentConfig = {
	title?: string;
	description?: string;
	order?: number;
	hidden?: boolean;
	id?: string;
	badge?: string;
};

export type DocsContentConfig = {
	title: string;
	baseHref: string;
	/** Absolute site origin (e.g. https://example.com), no trailing slash — used to
	 * build absolute URLs for canonical tags, Open Graph, sitemap, and llms.txt. */
	site?: string;
	/** Optional root landing filename stem used when no host entry overrides it. */
	index?: string;
	/**
	 * Filename stems (case-insensitive) that mark a directory's landing page. Default `['index']`.
	 * Add `'readme'` or `'+doc'` to treat a `README.md` / `+doc.md` as the folder's landing.
	 */
	indexNames?: readonly string[];
	/**
	 * Filename ordering convention. `numbered()` reads an `NN-` prefix, `dated()` a `YYYY-MM-DD`
	 * prefix; both strip it from the slug and title. Default: segments pass through unchanged.
	 */
	naming?: DocsNamingConvention;
	subtitle?: string;
	storageKey?: string;
	section?: {
		id?: string;
		title?: string;
		defaultOpen?: boolean;
		order?: number;
	};
	folders?: Record<string, DocsFolderConfig>;
	documents?: Record<string, DocsDocumentConfig>;
	/** Host-owned information architecture overrides and virtual groups. */
	entries?: Record<string, DocsContentEntryConfig>;
	/** Opt-in authored-document admission rules. Existing sources remain migration-compatible. */
	convention?: DocsConvention;
};

export type DocsContentInput<TDocument> = {
	key: string;
	metadata?: DocsMetadata;
	facts?: DocsDocumentFacts;
	load: DocsContentLoader<TDocument>;
};

export type DocsContentDocument<TDocument> = {
	key: string;
	slug: string;
	href: string;
	title: string;
	description?: string;
	metadata: DocsMetadata;
	facts?: DocsDocumentFacts;
	hidden: boolean;
	order?: number;
	loader: DocsContentLoader<TDocument>;
};

export type DocsContentSource<TDocument> = {
	nav: DocsNav;
	documents: readonly DocsContentDocument<TDocument>[];
	diagnostics: readonly DocsContentDiagnostic[];
	get(value: string): DocsContentDocument<TDocument> | undefined;
	load(value: string): Promise<TDocument> | undefined;
	entries(): string[];
};

export class DocsContentError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DocsContentError';
	}
}

/** Type-safe authoring helper for host-owned docs configuration. */
export function defineDocsConfig<const T extends DocsContentConfig>(config: T): T {
	return config;
}

type SourceRecord<TDocument> = DocsContentDocument<TDocument> & {
	isIndex: boolean;
	folderPath: string;
	routeSegments: string[];
	/** Convention-derived order per route segment, parallel to `routeSegments`. */
	segmentOrders: Array<number | undefined>;
};

type ResolvedGroup<TDocument> = {
	key: string;
	name: string;
	path: string;
	parent: string;
	config?: DocsContentEntryConfig;
	folderConfig?: DocsFolderConfig;
	landing?: SourceRecord<TDocument>;
	children: Array<ResolvedGroup<TDocument> | SourceRecord<TDocument>>;
};

type FolderRecord<TDocument> = {
	name: string;
	path: string;
	/** Convention-derived order for this directory segment, when its name encoded one. */
	order?: number;
	children: Map<string, FolderRecord<TDocument>>;
	documents: SourceRecord<TDocument>[];
};

type NavCandidate = {
	node: DocsNavNode;
	order?: number;
	path: string;
	title: string;
};

type DefinedNavCandidate = NavCandidate & { node: DocsNavNode };

const ACRONYMS = new Set(['api', 'cli', 'css', 'faq', 'html', 'http', 'id', 'md', 'sdk', 'ui', 'url', 'yaml']);

/** The naming convention in force, defaulting to the legacy passthrough. */
function namingOf(config: DocsContentConfig): DocsNamingConvention {
	return config.naming ?? passthroughNaming;
}

/** The lowercase set of filename stems treated as a directory landing. Default `['index']`. */
function indexNamesOf(config: DocsContentConfig): Set<string> {
	return new Set((config.indexNames ?? ['index']).map((name) => name.toLowerCase()));
}

/** Whether a raw filename stem (last path segment, no extension) marks a directory landing. */
function isIndexStem(rawStem: string, indexNames: Set<string>): boolean {
	return indexNames.has(rawStem.toLowerCase());
}

/**
 * Run the naming convention's `verify` over each directory's raw siblings, surfacing ordering
 * problems (mixed prefixes, duplicate numbers, impossible dates) as build diagnostics. Index-stem
 * leaves are excluded — a folder's landing is not an ordered page. No-ops without a `verify`.
 */
function namingDiagnostics<TDocument>(
	inputs: readonly DocsContentInput<TDocument>[],
	config: DocsContentConfig
): DocsContentDiagnostic[] {
	const naming = namingOf(config);
	if (!naming.verify) return [];
	const indexNames = indexNamesOf(config);

	const byDir = new Map<string, Set<string>>();
	for (const input of inputs) {
		const rawSegments = normalizeSourceKey(input.key).replace(/\.md$/, '').split('/').filter(Boolean);
		for (let index = 0; index < rawSegments.length; index += 1) {
			const child = rawSegments[index];
			const isLeaf = index === rawSegments.length - 1;
			if (isLeaf && isIndexStem(child, indexNames)) continue;
			const parent = rawSegments.slice(0, index).join('/');
			let siblings = byDir.get(parent);
			if (!siblings) {
				siblings = new Set();
				byDir.set(parent, siblings);
			}
			siblings.add(child);
		}
	}

	const diagnostics: DocsContentDiagnostic[] = [];
	for (const [rawDir, siblings] of byDir) {
		const cleanDir = rawDir
			.split('/')
			.filter(Boolean)
			.map((segment) => naming.segment(segment).slug)
			.join('/');
		for (const message of naming.verify(cleanDir, [...siblings])) {
			diagnostics.push({
				code: 'ACROLLS_NAMING_ORDER',
				severity: 'warning',
				file: rawDir || '(root)',
				message,
				remediation: 'Align the filename ordering prefixes, or opt the directory out of the convention.'
			});
		}
	}
	return diagnostics;
}

export function createDocsContentSource<TDocument>(options: {
	config: DocsContentConfig;
	documents: readonly DocsContentInput<TDocument>[];
	/** Per-section order hints declared by the loader (see `mergeLoaders`), keyed by prefix. */
	sectionOrder?: Readonly<Record<string, number>>;
}): DocsContentSource<TDocument> {
	const baseHref = absolutePath(options.config.baseHref);
	const config = normalizeConfig(options.config);
	const sectionOrder = normalizeSectionOrder(options.sectionOrder);
	const admission = admitDocuments(options.documents, config);
	const routeOverrides = resolveRouteOverrides(admission.documents, baseHref, config);
	const landingEntryConfigs = resolveLandingEntryConfigs(config);
	const records = admission.documents.map((input) =>
		toSourceRecord(
			input,
			baseHref,
			config,
			routeOverrides.get(normalizeSourceKey(input.key)),
			landingEntryConfigs.get(normalizeSourceKey(input.key).replace(/\.md$/, ''))
		)
	);
	const routeMap = new Map<string, SourceRecord<TDocument>>();

	for (const record of records) {
		const previous = routeMap.get(record.slug);
		if (previous) {
			throw new DocsContentError(
				`Duplicate docs route "${record.href}" from "${previous.key}" and "${record.key}".`
			);
		}
		routeMap.set(record.slug, record);
	}

	const root = createFolder('', '');
	for (const record of records) insertRecord(root, record);

	assertFolderKeysMatch(config, records);

	const hasDefinition = Object.keys(config.entries ?? {}).length > 0 ||
		Boolean(config.index) ||
	Object.values(config.folders ?? {}).some((folder) => Boolean(folder.index));
	const nav = hasDefinition
		? buildDefinedNav(records, config, baseHref, sectionOrder)
		: buildNav(root, records, config, baseHref, sectionOrder);
	if (config.site) nav.site = config.site.replace(/\/+$/, '');
	const documents = [...records].sort(compareDocuments);
	const diagnostics = [
		...admission.diagnostics,
		...leadingH1Diagnostics(records, config),
		...rejectedDocumentLinkDiagnostics(admission, baseHref),
		...namingDiagnostics(admission.documents, config)
	];
	const aliases = new Map<string, SourceRecord<TDocument>>();
	for (const document of documents) {
		aliases.set(document.key, document);
		aliases.set(document.key.slice(0, -3), document);
		aliases.set(document.slug, document);
		aliases.set(normalizePath(document.href), document);
	}
	const get = (value: string): DocsContentDocument<TDocument> | undefined => {
		const normalized = normalizeLookup(value, baseHref);
		return aliases.get(normalized) ?? aliases.get(value);
	};

	return {
		nav,
		documents,
		diagnostics,
		get,
		load(value) {
			return get(value)?.loader();
		},
		entries() {
			return documents.map((document) => document.href);
		}
	};
}

type AdmissionResult<TDocument> = {
	documents: DocsContentInput<TDocument>[];
	rejected: DocsContentInput<TDocument>[];
	diagnostics: DocsContentDiagnostic[];
};

function admitDocuments<TDocument>(
	inputs: readonly DocsContentInput<TDocument>[],
	config: DocsContentConfig
): AdmissionResult<TDocument> {
	if (!isAuthoredConvention(config)) {
		return { documents: [...inputs], rejected: [], diagnostics: [] };
	}

	const documents: DocsContentInput<TDocument>[] = [];
	const rejected: DocsContentInput<TDocument>[] = [];
	const diagnostics: DocsContentDiagnostic[] = [];
	const indexNames = indexNamesOf(config);

	for (const input of inputs) {
		const key = normalizeSourceKey(input.key);
		const isIndex = isIndexStem(key.replace(/\.md$/, '').split('/').at(-1) ?? '', indexNames);
		const metadata = input.metadata ?? {};
		const errors: DocsContentDiagnostic[] = [];

		if (!isIndex && input.facts?.hasFrontmatter !== true) {
			errors.push(contentDiagnostic(
				'ACROLLS_FRONTMATTER_REQUIRED',
				'error',
				key,
				'Ordinary authored docs pages require a YAML frontmatter block.',
				'Add YAML frontmatter with a non-empty string title.'
			));
		}

		if (!isIndex) {
			const title = metadata.title;
			if (title === undefined || title === null || (typeof title === 'string' && !title.trim())) {
				errors.push(contentDiagnostic(
					'ACROLLS_TITLE_REQUIRED',
					'error',
					key,
					'Ordinary authored docs pages require a non-empty frontmatter title.',
					'Add title: Your page title to the YAML frontmatter.'
				));
			} else if (typeof title !== 'string') {
				errors.push(contentDiagnostic(
					'ACROLLS_TITLE_INVALID',
					'error',
					key,
					'Frontmatter title must be a string.',
					'Replace title with a non-empty YAML string.'
				));
			}
		} else if (metadata.title !== undefined) {
			diagnostics.push(contentDiagnostic(
				'ACROLLS_INDEX_TITLE_IGNORED',
				'warning',
				key,
				'Index page title is derived from its host folder/group and the frontmatter title is ignored.',
				'Remove title from this index page or configure its folder/group title.'
			));
		}

		diagnostics.push(...errors);
		if (errors.length > 0) rejected.push(input);
		else documents.push(input);
	}

	return { documents, rejected, diagnostics };
}


function leadingH1Diagnostics<TDocument>(
	records: readonly SourceRecord<TDocument>[],
	config: DocsContentConfig
): DocsContentDiagnostic[] {
	if (!isAuthoredConvention(config)) return [];
	return records.flatMap((record) => {
		if (!record.facts?.leadingH1) return [];
		if (normalizeHeading(record.facts.leadingH1) === normalizeHeading(record.title)) return [];
		return [contentDiagnostic(
			'ACROLLS_LEADING_H1_MISMATCH',
			'warning',
			record.key,
			`Initial Markdown H1 "${record.facts.leadingH1}" was removed because it differs from the effective title "${record.title}".`,
			'Use the frontmatter title as the page title, or remove the initial H1.'
		)];
	});
}

function rejectedDocumentLinkDiagnostics<TDocument>(
	admission: AdmissionResult<TDocument>,
	baseHref: string
): DocsContentDiagnostic[] {
	if (admission.rejected.length === 0) return [];
	const rejected = new Set(admission.rejected.map((input) => sourceStem(input.key)));
	const diagnostics: DocsContentDiagnostic[] = [];
	for (const input of admission.documents) {
		for (const link of input.facts?.links ?? []) {
			const target = resolveMarkdownDocLink(input.key, link, baseHref);
			if (!target || !rejected.has(target)) continue;
			diagnostics.push(contentDiagnostic(
				'ACROLLS_LINK_TO_REJECTED_DOCUMENT',
				'error',
				normalizeSourceKey(input.key),
				`Markdown link "${link}" targets rejected document "${target}.md".`,
				'Fix the target document frontmatter or remove the link.'
			));
		}
	}
	return diagnostics;
}

function isAuthoredConvention(config: DocsContentConfig): boolean {
	return config.convention?.mode === 'authored';
}

function contentDiagnostic(
	code: string,
	severity: DocsContentDiagnostic['severity'],
	file: string,
	message: string,
	remediation?: string
): DocsContentDiagnostic {
	return { code, severity, file, message, remediation };
}

function normalizeHeading(value: string): string {
	return value.replaceAll(/\s+/g, ' ').trim().toLocaleLowerCase();
}

function sourceStem(key: string): string {
	return normalizeSourceKey(key).replace(/\.md$/, '');
}

function resolveMarkdownDocLink(sourceKey: string, link: string, baseHref: string): string | undefined {
	const destination = link.split('#', 1)[0] ?? '';
	if (!destination || destination.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(destination)) return undefined;
	if (destination.startsWith('/')) {
		const slug = normalizeLookup(destination, baseHref);
		return slug || 'index';
	}
	const sourceFolder = sourceStem(sourceKey).split('/').slice(0, -1);
	const segments = [...sourceFolder, ...destination.split('/')];
	const resolved: string[] = [];
	for (const segment of segments) {
		if (!segment || segment === '.') continue;
		if (segment === '..') {
			resolved.pop();
			continue;
		}
		resolved.push(segment);
	}
	return resolved.join('/').replace(/\.md$/, '');
}

function normalizeConfig(config: DocsContentConfig): DocsContentConfig {
	return {
		...config,
		folders: aliasConfigKeys(config.folders ?? {}),
		documents: aliasConfigKeys(config.documents ?? {}),
		entries: Object.fromEntries(
			Object.entries(config.entries ?? {}).map(([key, value]) => [normalizeEntryKey(key), value])
		)
	};
}

/**
 * Register a config map under both its raw path keys and their slug-space equivalents, so
 * `folders: { myFolder: … }` matches the folder the tree built as `my-folder`. Keys that match no
 * discovered folder are rejected separately (see `assertFolderKeysMatch`), so aliasing can only
 * add matches, never hide a misspelling.
 */
function aliasConfigKeys<TValue>(map: Record<string, TValue>): Record<string, TValue> {
	const aliased: Record<string, TValue> = {};
	for (const [key, value] of Object.entries(map)) {
		const raw = normalizeConfigPath(key);
		aliased[raw] = value;
		const slug = slugKey(raw);
		if (slug && slug !== raw) aliased[slug] = value;
	}
	return aliased;
}

/** Slug-space form of a config path: each segment resolves through the same pipeline as routes. */
function slugKey(path: string): string {
	const segments = path.split('/').filter(Boolean);
	return segments.length === 0 ? '' : segments.map((segment) => routeSegment(segment)).join('/');
}

/** Loader-declared section hints, keyed by their slug-space prefix so they match folder paths. */
function normalizeSectionOrder(hints?: Readonly<Record<string, number>>): Map<string, number> {
	const normalized = new Map<string, number>();
	for (const [prefix, order] of Object.entries(hints ?? {})) {
		const key = slugKey(normalizeConfigPath(prefix));
		if (key) normalized.set(key, order);
	}
	return normalized;
}

/** Every folder path the discovered records materialize, including all ancestor prefixes. */
function folderPathsOf<TDocument>(records: readonly SourceRecord<TDocument>[]): Set<string> {
	const paths = new Set<string>();
	for (const record of records) {
		const segments = record.folderPath.split('/').filter(Boolean);
		for (let index = 1; index <= segments.length; index += 1) {
			paths.add(segments.slice(0, index).join('/'));
		}
	}
	return paths;
}

/**
 * A folders config key that matches no discovered folder can never apply — reject it loudly
 * instead of silently no-oping. Keys may be written in raw path casing ('myFolder'); both that
 * form and its slug-space form ('my-folder') count as a match.
 */
function assertFolderKeysMatch<TDocument>(
	config: DocsContentConfig,
	records: readonly SourceRecord<TDocument>[]
): void {
	const folderPaths = folderPathsOf(records);
	for (const key of Object.keys(config.folders ?? {})) {
		const raw = normalizeConfigPath(key);
		if (!raw) continue;
		if (!folderPaths.has(raw) && !folderPaths.has(slugKey(raw))) {
			throw new DocsContentError(
				`Docs folder config "${key}" matches no discovered folder. Folder keys resolve through the same slug pipeline as routes ('myFolder' → 'my-folder'), so check spelling and casing.`
			);
		}
	}
}

function resolveRouteOverrides<TDocument>(
	inputs: readonly DocsContentInput<TDocument>[],
	baseHref: string,
	config: DocsContentConfig
): Map<string, string> {
	const sourceKeys = new Set(inputs.map((input) => normalizeSourceKey(input.key).replace(/\.md$/, '')));
	const overrides = new Map<string, string>();

	for (const [key, entry] of Object.entries(config.entries ?? {})) {
		const sourceKey = sourceKeys.has(key) ? key : undefined;
		if (entry.kind === 'page' && !sourceKey) {
			throw new DocsContentError(`Docs page entry "${key}" references a missing source.`);
		}
		if (entry.kind === 'page' && entry.landing) {
			throw new DocsContentError(`Docs page entry "${key}" cannot define a group landing source.`);
		}
		const isGroup = entry.kind === 'group' || !sourceKey;

		if (entry.href && sourceKey) {
			setRouteOverride(overrides, sourceKey, entry.href, baseHref, key);
		}

		if (!isGroup || !entry.landing) continue;
		const landingKey = normalizeEntryKey(entry.landing);
		if (!sourceKeys.has(landingKey)) {
			throw new DocsContentError(`Docs entry "${key}" references missing landing source "${entry.landing}".`);
		}

		const groupHref = entry.href ?? joinBaseHref(baseHref, key);
		setRouteOverride(overrides, landingKey, groupHref, baseHref, key);
	}

	const folderLandingConfigs = [
		...(config.index ? [['', config.index] as const] : []),
		...Object.entries(config.folders ?? {}).flatMap(([folder, folderConfig]) =>
			folderConfig.index ? [[folder, folderConfig.index] as const] : []
		)
	];
	for (const [folder, index] of folderLandingConfigs) {
		const landingKey = normalizeEntryKey(folder ? `${folder}/${index}` : index);
		if (!sourceKeys.has(landingKey)) {
			throw new DocsContentError(`Configured landing source "${landingKey}.md" was not discovered.`);
		}
		if (!overrides.has(`${landingKey}.md`)) {
			setRouteOverride(overrides, landingKey, folder ? joinBaseHref(baseHref, folder) : baseHref, baseHref, folder || '<root>');
		}
	}

	return overrides;
}

function setRouteOverride(
	overrides: Map<string, string>,
	sourceKey: string,
	href: string,
	baseHref: string,
	entryKey: string
): void {
	const normalizedHref = absolutePath(href);
	routeSlug(normalizedHref, baseHref);
	const previous = overrides.get(`${sourceKey}.md`);
	if (previous && normalizePath(previous) !== normalizePath(normalizedHref)) {
		throw new DocsContentError(`Docs entry "${entryKey}" assigns source "${sourceKey}.md" multiple routes.`);
	}
	overrides.set(`${sourceKey}.md`, normalizedHref);
}

function toSourceRecord<TDocument>(
	input: DocsContentInput<TDocument>,
	baseHref: string,
	config: DocsContentConfig,
	routeOverride?: string,
	landingEntryConfig?: DocsContentEntryConfig
): SourceRecord<TDocument> {
	const key = normalizeSourceKey(input.key);
	if (!key.endsWith('.md')) {
		throw new DocsContentError(`Unsupported docs source "${input.key}". The first source supports .md files.`);
	}

	const withoutExtension = key.slice(0, -3);
	const rawSegments = withoutExtension.split('/').filter(Boolean);
	const naming = namingOf(config);
	const isIndex = isIndexStem(rawSegments.at(-1) ?? '', indexNamesOf(config));
	// Apply the naming convention to each structural segment: strip the ordering prefix for the slug
	// and capture the order it encoded (parallel to routeSegments, used for leaf and folder sorting).
	const contentSegments = isIndex ? rawSegments.slice(0, -1) : rawSegments;
	const applied = contentSegments.map((raw) => naming.segment(raw));
	const routeSegments = applied.map((segment) => routeSegment(segment.slug));
	const segmentOrders = applied.map((segment) => segment.order);
	const slug = routeOverride ? routeSlug(routeOverride, baseHref) : routeSegments.join('/');
	const folderSegments = isIndex ? routeSegments : routeSegments.slice(0, -1);
	const folderPath = folderSegments.join('/');
	const metadata = input.metadata ?? {};
	const documentConfig = config.documents?.[withoutExtension] ?? config.documents?.[slug];
	const entryConfig = config.entries?.[withoutExtension];
	const inheritedHidden = folderHidden(config, folderPath);
	const hidden = entryConfig?.hidden ?? documentConfig?.hidden ?? booleanMetadata(metadata, 'hidden') ?? inheritedHidden;
	const title = isAuthoredConvention(config) && isIndex
		? indexTitle(routeSegments, folderPath, config, landingEntryConfig)
		: entryConfig?.title ?? landingEntryConfig?.title ?? documentConfig?.title ?? stringMetadata(metadata, 'title') ?? fallbackTitle(routeSegments, config.title);
	const description = entryConfig?.description ?? landingEntryConfig?.description ?? documentConfig?.description ?? stringMetadata(metadata, 'description') ?? stringMetadata(metadata, 'brief');
	// A leaf's own segment order (last route segment) is the fallback when no config/frontmatter order.
	// Frontmatter tier: canonical `sidebar.order` first, flat `order` as the working alias (P20 IA lock).
	const sidebar = sidebarOf(metadata);
	const order =
		entryConfig?.order ??
		documentConfig?.order ??
		(sidebar ? numberMetadata(sidebar, 'order') : undefined) ??
		numberMetadata(metadata, 'order') ??
		segmentOrders.at(-1);

	return {
		key,
		slug,
		href: routeOverride ?? joinBaseHref(baseHref, slug),
		title,
		description,
		metadata,
		facts: input.facts,
		hidden,
		order,
		loader: input.load,
		isIndex,
		folderPath,
		routeSegments,
		segmentOrders
	};
}

function indexTitle(
	routeSegments: readonly string[],
	folderPath: string,
	config: DocsContentConfig,
	landingEntryConfig?: DocsContentEntryConfig
): string {
	if (!folderPath) return config.title;
	return landingEntryConfig?.title ?? config.folders?.[folderPath]?.title ?? fallbackTitle(routeSegments, config.title);
}

function resolveLandingEntryConfigs(config: DocsContentConfig): Map<string, DocsContentEntryConfig> {
	const landingConfigs = new Map<string, DocsContentEntryConfig>();
	for (const entry of Object.values(config.entries ?? {})) {
		if (entry.kind !== 'group' || !entry.landing) continue;
		landingConfigs.set(normalizeEntryKey(entry.landing), entry);
	}
	return landingConfigs;
}

function insertRecord<TDocument>(root: FolderRecord<TDocument>, record: SourceRecord<TDocument>): void {
	let folder = root;
	// segmentOrders runs parallel to routeSegments, so folder segment `i` carries order `[i]`.
	const folderCount = record.isIndex ? record.routeSegments.length : record.routeSegments.length - 1;
	for (let index = 0; index < folderCount; index += 1) {
		const segment = record.routeSegments[index];
		const path = folder.path ? `${folder.path}/${segment}` : segment;
		let child = folder.children.get(segment);
		if (!child) {
			child = createFolder(segment, path);
			folder.children.set(segment, child);
		}
		// A directory's `NN-` prefix sets its order; every sibling agrees, so first write wins.
		if (child.order === undefined) child.order = record.segmentOrders[index];
		folder = child;
	}
	folder.documents.push(record);
}

function buildDefinedNav<TDocument>(
	records: readonly SourceRecord<TDocument>[],
	config: DocsContentConfig,
	baseHref: string,
	sectionOrder: ReadonlyMap<string, number>
): DocsNav {
	const recordByKey = new Map(records.map((record) => [record.key.slice(0, -3), record]));
	const groups = new Map<string, ResolvedGroup<TDocument>>();
	const root = ensureDefinedGroup(groups, '', config);

	for (const record of records) {
		let path = record.folderPath;
		while (path) {
			ensureDefinedGroup(groups, path, config);
			path = path.slice(0, path.lastIndexOf('/'));
		}
	}

	for (const [key, entry] of Object.entries(config.entries ?? {})) {
		if (entry.kind === 'group' || (!recordByKey.has(key) && entry.kind !== 'page')) {
			ensureDefinedGroup(groups, key, config);
		}
	}

	for (const group of groups.values()) {
		group.parent = normalizeEntryKey(group.config?.parent ?? defaultGroupParent(group.key));
		if (group.key && !groups.has(group.parent)) {
			throw new DocsContentError(`Docs group "${group.key}" references unknown parent "${group.parent}".`);
		}
	}
	validateGroupParents(groups);

	const landingGroups = new Map<SourceRecord<TDocument>, ResolvedGroup<TDocument>>();
	for (const group of groups.values()) {
		if (group.key === '' && !group.config?.landing) continue;
		const configuredLanding = group.folderConfig?.index
			? normalizeEntryKey(group.key ? `${group.key}/${group.folderConfig.index}` : group.folderConfig.index)
			: undefined;
		const landingKey = group.config?.landing ??
			(group.config?.kind === 'group' && recordByKey.has(group.key) ? group.key : configuredLanding);
		const landing = landingKey
			? recordByKey.get(normalizeEntryKey(landingKey))
			: records.find((record) => record.isIndex && record.folderPath === group.key);
		if (!landing) {
			if (landingKey) {
				throw new DocsContentError(`Docs group "${group.key}" references missing landing source "${landingKey}".`);
			}
			continue;
		}
		const previous = landingGroups.get(landing);
		if (previous && previous !== group) {
			throw new DocsContentError(`Source "${landing.key}" is the landing page for both "${previous.key}" and "${group.key}".`);
		}
		landingGroups.set(landing, group);
		group.landing = landing;
	}

	for (const group of groups.values()) {
		if (group === root) continue;
		groups.get(group.parent)!.children.push(group);
	}

	for (const record of records) {
		const sourceKey = record.key.slice(0, -3);
		const entry = config.entries?.[sourceKey];
		if (entry?.kind === 'group' || landingGroups.has(record)) continue;
		const parent = normalizeEntryKey(entry?.parent ?? record.folderPath);
		const group = groups.get(parent);
		if (!group) {
			throw new DocsContentError(`Source "${record.key}" references unknown parent "${parent}".`);
		}
		group.children.push(record);
	}

	const sections: Array<DocsNavSection & { order?: number; path: string }> = [];
	const rootPages = definedChildrenNodes(
		root.children.filter((child): child is SourceRecord<TDocument> => isSourceRecord(child) && !child.hidden),
		config,
		sectionOrder
	);
	if (rootPages.length > 0) {
		sections.push({
			id: config.section?.id ?? 'docs',
			title: config.section?.title ?? 'Docs',
			defaultOpen: config.section?.defaultOpen,
			items: rootPages,
			order: config.section?.order,
			path: ''
		});
	}

	for (const group of root.children.filter(isResolvedGroup)) {
		const node = definedGroupNode(group, config, sectionOrder);
		if (!node && !visibleLanding(group)) continue;
		sections.push({
			id: `section-${stableId(group.key || group.name)}`,
			title: groupTitle(group),
			href: visibleLanding(group)?.href,
			slug: visibleLanding(group)?.slug,
			description: groupDescription(group),
			badge: groupBadge(group),
			defaultOpen: group.config?.defaultOpen ?? group.folderConfig?.defaultOpen ?? true,
			items: node?.children ?? [],
			order: groupOrder(group, sectionOrder),
			path: group.key
		});
	}

	if (sections.length === 0) {
		sections.push({
			id: config.section?.id ?? 'docs',
			title: config.section?.title ?? 'Docs',
			defaultOpen: config.section?.defaultOpen,
			items: [],
			order: config.section?.order,
			path: ''
		});
	}

	sections.sort((a, b) => compareOptionalOrder(a.order, b.order) || a.path.localeCompare(b.path) || a.title.localeCompare(b.title));
	return {
		title: config.title,
		baseHref,
		subtitle: config.subtitle,
		storageKey: config.storageKey,
		sections: sections.map(({ order: _order, path: _path, ...section }) => section)
	};
}

function ensureDefinedGroup<TDocument>(
	groups: Map<string, ResolvedGroup<TDocument>>,
	key: string,
	config: DocsContentConfig
): ResolvedGroup<TDocument> {
	const existing = groups.get(key);
	if (existing) return existing;
	const entry = config.entries?.[key];
	const folderConfig = config.folders?.[key];
	const group: ResolvedGroup<TDocument> = {
		key,
		name: humanize(key.split('/').at(-1) ?? config.title),
		path: key,
		parent: '',
		config: entry,
		folderConfig,
		children: []
	};
	groups.set(key, group);
	return group;
}

function validateGroupParents<TDocument>(groups: Map<string, ResolvedGroup<TDocument>>): void {
	for (const group of groups.values()) {
		const seen = new Set<string>();
		let current: ResolvedGroup<TDocument> | undefined = group;
		while (current && current.key) {
			if (seen.has(current.key)) throw new DocsContentError(`Docs group cycle detected at "${current.key}".`);
			seen.add(current.key);
			current = groups.get(current.parent);
		}
	}
}

function definedGroupNode<TDocument>(
	group: ResolvedGroup<TDocument>,
	config: DocsContentConfig,
	sectionOrder: ReadonlyMap<string, number>
): DocsNavNode | null {
	if (group.config?.hidden === true || group.folderConfig?.hidden === true) return null;
	const children = definedChildrenNodes(group.children, config, sectionOrder);
	const landing = visibleLanding(group);
	if (!landing && children.length === 0) return null;
	return {
		id: group.folderConfig?.id ?? `group-${stableId(group.key || group.name)}`,
		title: groupTitle(group),
		href: landing?.href,
		slug: landing?.slug,
			description: groupDescription(group),
			badge: groupBadge(group),
			defaultOpen: group.config?.defaultOpen ?? group.folderConfig?.defaultOpen,
		children: children.length > 0 ? children : undefined
	};
}

function definedPageNode<TDocument>(record: SourceRecord<TDocument>, config: DocsContentConfig): DocsNavNode {
	const sourceKey = record.key.slice(0, -3);
	const entry = config.entries?.[sourceKey];
	const documentConfig = config.documents?.[sourceKey] ?? config.documents?.[record.slug];
	return {
		id: documentConfig?.id ?? `page-${stableId(record.slug || 'index')}`,
		title: entry?.title ?? documentConfig?.title ?? navLabelOf(record.metadata) ?? record.title,
		href: record.href,
		slug: record.slug,
		description: entry?.description ?? documentConfig?.description ?? record.description,
		badge: entry?.badge ?? documentConfig?.badge
	};
}

function definedChildrenNodes<TDocument>(
	children: Array<ResolvedGroup<TDocument> | SourceRecord<TDocument>>,
	config: DocsContentConfig,
	sectionOrder: ReadonlyMap<string, number>
): DocsNavNode[] {
	const candidates: DefinedNavCandidate[] = [];
	for (const child of children) {
		const node = isResolvedGroup(child)
			? definedGroupNode(child, config, sectionOrder)
			: child.hidden
				? null
				: definedPageNode(child, config);
		if (!node) continue;
		candidates.push({
			node,
			order: isResolvedGroup(child) ? groupOrder(child, sectionOrder) : definedRecordOrder(child, config),
			path: isResolvedGroup(child) ? child.key : child.slug,
			title: node.title
		});
	}
	candidates.sort(compareNavCandidates);
	return candidates.map((candidate) => candidate.node);
}

function definedRecordOrder<TDocument>(record: SourceRecord<TDocument>, config: DocsContentConfig): number | undefined {
	const entry = config.entries?.[record.key.slice(0, -3)];
	const documentConfig = config.documents?.[record.key.slice(0, -3)] ?? config.documents?.[record.slug];
	return entry?.order ?? documentConfig?.order ?? record.order;
}

function visibleLanding<TDocument>(group: ResolvedGroup<TDocument>): SourceRecord<TDocument> | undefined {
	return group.landing && !group.landing.hidden && group.config?.hidden !== true && group.folderConfig?.hidden !== true
		? group.landing
		: undefined;
}

function groupTitle<TDocument>(group: ResolvedGroup<TDocument>): string {
	const landing = visibleLanding(group);
	return (
		group.config?.title ??
		group.folderConfig?.title ??
		(landing ? navLabelOf(landing.metadata) : undefined) ??
		landing?.title ??
		group.name
	);
}

function groupDescription<TDocument>(group: ResolvedGroup<TDocument>): string | undefined {
	return group.config?.description ?? group.folderConfig?.description ?? visibleLanding(group)?.description;
}

function groupBadge<TDocument>(group: ResolvedGroup<TDocument>): string | undefined {
	return group.config?.badge ?? group.folderConfig?.badge;
}

function groupOrder<TDocument>(
	group: ResolvedGroup<TDocument>,
	sectionOrder: ReadonlyMap<string, number>
): number | undefined {
	return (
		group.config?.order ??
		group.folderConfig?.order ??
		visibleLanding(group)?.order ??
		sectionOrder.get(group.key)
	);
}

function isSourceRecord<TDocument>(value: ResolvedGroup<TDocument> | SourceRecord<TDocument>): value is SourceRecord<TDocument> {
	return 'loader' in value;
}

function isResolvedGroup<TDocument>(value: ResolvedGroup<TDocument> | SourceRecord<TDocument>): value is ResolvedGroup<TDocument> {
	return !isSourceRecord(value);
}

function defaultGroupParent(key: string): string {
	const index = key.lastIndexOf('/');
	return index < 0 ? '' : key.slice(0, index);
}

function normalizeEntryKey(value: string): string {
	return normalizeSourceKey(value).replace(/\.md$/, '');
}

function routeSlug(href: string, baseHref: string): string {
	const path = normalizePath(href);
	if (path === baseHref) return '';
	const prefix = baseHref === '/' ? '/' : `${baseHref}/`;
	if (!path.startsWith(prefix)) {
		throw new DocsContentError(`Docs route "${href}" must be inside baseHref "${baseHref}".`);
	}
	return path.slice(prefix.length);
}

function buildNav<TDocument>(
	root: FolderRecord<TDocument>,
	records: readonly SourceRecord<TDocument>[],
	config: DocsContentConfig,
	baseHref: string,
	sectionOrder: ReadonlyMap<string, number>
): DocsNav {
	const sections: Array<DocsNavSection & { order?: number; path: string }> = [];
	const visibleRootDocuments = root.documents.filter((document) => !document.hidden);
	if (visibleRootDocuments.length > 0) {
		sections.push({
			id: config.section?.id ?? 'docs',
			title: config.section?.title ?? 'Docs',
			defaultOpen: config.section?.defaultOpen,
			items: buildFolderItems(root, config, false),
			order: config.section?.order,
			path: ''
		});
	}

	for (const folder of root.children.values()) {
		if (folderHidden(config, folder.path)) continue;
		// The folder's landing page becomes the section's link (behavior 7) instead of a duplicated
		// item, matching how buildDefinedNav treats group landings. Without a landing every item
		// stays — including groups whose own slug is undefined.
		const index = folder.documents.find((document) => document.isIndex && !document.hidden);
		const candidates = buildFolderItems(folder, config);
		const items = index ? candidates.filter((node) => node.slug !== index.slug) : candidates;
		if (items.length === 0 && !index) continue;
		const folderConfig = config.folders?.[folder.path];
		sections.push({
			id: folderConfig?.id ?? sectionId(folder.path, sections),
			// The landing's sidebar.label names the section; its order positions it when no
			// folders[].order encodes one (the landing record order falls back to the folder prefix).
			title: folderConfig?.title ?? (index ? navLabelOf(index.metadata) : undefined) ?? humanize(folder.name),
			href: index?.href,
			slug: index?.slug,
			description: folderConfig?.description ?? index?.description,
			badge: folderConfig?.badge,
			defaultOpen: folderConfig?.defaultOpen ?? true,
			items,
			order: folderConfig?.order ?? index?.order ?? folder.order ?? sectionOrder.get(folder.path),
			path: folder.path
		});
	}

	if (sections.length === 0 && records.length === 0) {
		sections.push({
			id: config.section?.id ?? 'docs',
			title: config.section?.title ?? 'Docs',
			defaultOpen: config.section?.defaultOpen,
			items: [],
			order: config.section?.order,
			path: ''
		});
	}

	sections.sort((a, b) => compareOptionalOrder(a.order, b.order) || a.path.localeCompare(b.path) || a.title.localeCompare(b.title));
	return {
		title: config.title,
		baseHref,
		subtitle: config.subtitle,
		storageKey: config.storageKey,
		sections: sections.map(({ path: _path, order: _order, ...section }) => section)
	};
}

function buildFolderItems<TDocument>(
	folder: FolderRecord<TDocument>,
	config: DocsContentConfig,
	includeChildren = true
): DocsNavNode[] {
	const candidates: NavCandidate[] = [];
	for (const document of folder.documents) {
		if (document.hidden) continue;
		const documentConfig = config.documents?.[document.key.slice(0, -3)] ?? config.documents?.[document.slug];
		// Nav label tier: host config title > sidebar.label > the page's title (P20 IA lock).
		const title = documentConfig?.title ?? navLabelOf(document.metadata) ?? document.title;
		candidates.push({
			node: {
				id: documentConfig?.id ?? `page-${stableId(document.slug || 'index')}`,
				title,
				href: document.href,
				slug: document.slug,
				description: document.description,
				badge: documentConfig?.badge
			},
			order: document.order,
			path: document.slug,
			title
		});
	}

	if (!includeChildren) return candidates.sort(compareNavCandidates).map((candidate) => candidate.node);

	for (const child of folder.children.values()) {
		if (folderHidden(config, child.path)) continue;
		const index = child.documents.find((document) => document.isIndex && !document.hidden);
		const children = buildFolderItems(child, config).filter((node) => node.slug !== index?.slug);
		if (!index && children.length === 0) continue;
		const folderConfig = config.folders?.[child.path];
		const node: DocsNavNode = {
			id: folderConfig?.id ?? `group-${stableId(child.path)}`,
			title: folderConfig?.title ?? humanize(child.name),
			href: index?.href,
			slug: index?.slug,
			description: folderConfig?.description ?? index?.description,
			badge: folderConfig?.badge,
			defaultOpen: folderConfig?.defaultOpen,
			children: children.length > 0 ? children : undefined
		};
		candidates.push({
			node,
			order: folderConfig?.order ?? child.order ?? index?.order,
			path: child.path,
			title: node.title
		});
	}

	candidates.sort(compareNavCandidates);
	return candidates.map((candidate) => candidate.node);
}

function compareDocuments<TDocument>(a: DocsContentDocument<TDocument>, b: DocsContentDocument<TDocument>): number {
	return compareOptionalOrder(a.order, b.order) || a.href.localeCompare(b.href);
}

function compareNavCandidates(a: NavCandidate, b: NavCandidate): number {
	return compareOptionalOrder(a.order, b.order) || a.path.localeCompare(b.path) || a.title.localeCompare(b.title);
}

function compareOptionalOrder(a: number | undefined, b: number | undefined): number {
	if (a !== undefined && b !== undefined) return a - b;
	if (a !== undefined) return -1;
	if (b !== undefined) return 1;
	return 0;
}

function createFolder<TDocument>(name: string, path: string): FolderRecord<TDocument> {
	return { name, path, children: new Map(), documents: [] };
}

function folderHidden(config: DocsContentConfig, path: string): boolean {
	if (!path) return false;
	return path.split('/').some((_, index, segments) => config.folders?.[segments.slice(0, index + 1).join('/')]?.hidden === true);
}

function sectionId(path: string, sections: readonly { id: string }[]): string {
	const base = `section-${stableId(path)}`;
	if (!sections.some((section) => section.id === base)) return base;
	let suffix = 2;
	while (sections.some((section) => section.id === `${base}-${suffix}`)) suffix += 1;
	return `${base}-${suffix}`;
}

function fallbackTitle(routeSegments: readonly string[], docsTitle: string): string {
	return humanize(routeSegments.at(-1) ?? docsTitle);
}

function humanize(value: string): string {
	const words = value
		// camelCase word boundaries become title words: 'packageA' → 'Package A', never 'Packagea'.
		.replaceAll(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replaceAll(/[-_]+/g, ' ')
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	return words
		.map((word) => {
			const lower = word.toLowerCase();
			return ACRONYMS.has(lower) ? lower.toUpperCase() : `${lower.slice(0, 1).toUpperCase()}${lower.slice(1)}`;
		})
		.join(' ');
}

function routeSegment(value: string): string {
	const result = slugify(value);
	if (!result) throw new DocsContentError(`Could not derive a route segment from "${value}".`);
	return result;
}

function normalizeSourceKey(value: string): string {
	return value.replaceAll('\\', '/').replace(/^\.\//, '').replace(/^\/+/, '').replace(/\/+/g, '/');
}

function normalizeConfigPath(value: string): string {
	return normalizeSourceKey(value).replace(/\.md$/, '');
}

function absolutePath(value: string): string {
	const normalized = normalizePath(value.trim() || '/');
	return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function joinBaseHref(baseHref: string, slug: string): string {
	if (!slug) return baseHref;
	return baseHref === '/' ? `/${slug}` : `${baseHref}/${slug}`;
}

function normalizeLookup(value: string, baseHref: string): string {
	const path = normalizePath(value);
	if (path === baseHref) return '';
	const prefix = baseHref === '/' ? '/' : `${baseHref}/`;
	if (path.startsWith(prefix)) return path.slice(prefix.length);
	return path.replace(/^\/+/, '');
}

/** The page's `sidebar` frontmatter object (P20 IA hints), shape-checked. */
function sidebarOf(metadata: DocsMetadata): Record<string, unknown> | undefined {
	const sidebar = metadata['sidebar'];
	if (sidebar === undefined || sidebar === null) return undefined;
	if (typeof sidebar !== 'object' || Array.isArray(sidebar)) {
		throw new DocsContentError('Docs metadata field "sidebar" must be an object.');
	}
	return sidebar as Record<string, unknown>;
}

/** The nav-only display label: `sidebar.label` overrides the page title in nav trees only. */
function navLabelOf(metadata: DocsMetadata): string | undefined {
	const sidebar = sidebarOf(metadata);
	return sidebar ? stringMetadata(sidebar, 'label') : undefined;
}

function stringMetadata(metadata: DocsMetadata, key: string): string | undefined {
	const value = metadata[key];
	if (value === undefined || value === null) return undefined;
	if (typeof value !== 'string') throw new DocsContentError(`Docs metadata field "${key}" must be a string.`);
	return value.trim() || undefined;
}

function booleanMetadata(metadata: DocsMetadata, key: string): boolean | undefined {
	const value = metadata[key];
	if (value === undefined || value === null) return undefined;
	if (typeof value !== 'boolean') throw new DocsContentError(`Docs metadata field "${key}" must be a boolean.`);
	return value;
}

function numberMetadata(metadata: DocsMetadata, key: string): number | undefined {
	const value = metadata[key];
	if (value === undefined || value === null) return undefined;
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new DocsContentError(`Docs metadata field "${key}" must be a finite number.`);
	}
	return value;
}
