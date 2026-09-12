export type {
	DocsNav,
	DocsNavNode,
	DocsNavItem,
	DocsNavSection,
	DocsCrumb,
	DocsPagerLink,
	DocsTocItem
} from './types.js';

export {
	createDocsContentSource,
	defineDocsConfig,
	DocsContentError,
	numbered,
	dated,
	dateOf,
	passthroughNaming
} from './content.js';
export type {
	DocsNamingConvention,
	DocsSegment,
	NumberedOptions,
	DatedOptions,
	VerifiedDocsNamingConvention
} from './content.js';
export type {
	DocsContentConfig,
	DocsContentDiagnostic,
	DocsContentEntryConfig,
	DocsContentDocument,
	DocsContentInput,
	DocsContentLoader,
	DocsContentSource,
	DocsConvention,
	DocsDocumentFacts,
	DocsDocumentConfig,
	DocsFolderConfig,
	DocsMetadata
} from './content.js';

export { content } from './collection.js';
export { mergeLoaders, mergeRaw } from './merge.js';
export type { MergeSource, MergeRawSource } from './merge.js';
export { acrollsFields } from './fields.js';
export type { AcrollsPageFields, AcrollsPostFields, AcrollsChangeFields } from './fields.js';
export type {
	Collection,
	ContentLoader,
	ContentOptions,
	Entry,
	EntrySummary,
	InferredData,
	LoadedDocument,
	SchemaInput,
	StandardSchemaIssue,
	StandardSchemaResult,
	StandardSchemaV1
} from './collection.js';

export {
	flattenDocsNav,
	findActiveDocsItem,
	findActiveSection,
	findActiveTrail,
	docsPager,
	buildDocsCrumbs,
	sectionShouldOpen,
	nodeShouldOpen,
	nodeContainsPath,
	withNavIds,
	navStorageKey,
	openIdsForPath,
	normalizePath,
	slugify,
	stableId
} from './nav.js';

export { scanHeadings } from './toc.js';
export { readOpenState, writeOpenState, clearOpenState } from './storage.js';

// SEO (P16)
export { buildDocsSeo, docsSitemap, docsRobots } from './seo.js';
export type {
	DocsSiteSeo,
	DocsPageSeo,
	ResolvedDocsSeo,
	BuildDocsSeoInput,
	DocsSitemapOptions,
	DocsRobotsOptions
} from './seo.js';

// AI static tier (P18)
export { docsLlmsTxt, docsLlmsFullTxt, docsPageMarkdown, isAiExcluded } from './ai.js';
export type { DocsRawSources, DocsAiOptions } from './ai.js';

// OG images (P17)
export { acrollsOgCard, docsOgImagePath, docsOgEntries, docsOgSlug } from './og.js';
export type { SatoriNode, AcrollsOgCardOptions, DocsOgPathOptions } from './og.js';

export { default as DocsSeo } from './DocsSeo.svelte';
export { default as CopyPageMarkdown } from './CopyPageMarkdown.svelte';
export { default as DocsSearch } from './DocsSearch.svelte';

export { default as DocsShell } from './DocsShell.svelte';
export { default as DocsSidebar } from './DocsSidebar.svelte';
export { default as DocsAccordion } from './DocsAccordion.svelte';
export { default as DocsNavTree } from './DocsNavTree.svelte';
export { default as DocsBreadcrumbs } from './DocsBreadcrumbs.svelte';
export { default as DocsPager } from './DocsPager.svelte';
export { default as DocsToc } from './DocsToc.svelte';
export { default as DocsPageHeader } from './DocsPageHeader.svelte';
export { default as DocsHeader } from './DocsHeader.svelte';
export { default as ThemeToggle } from './ThemeToggle.svelte';
export { default as PageActions } from './PageActions.svelte';
export { default as PageFeedback } from './PageFeedback.svelte';
