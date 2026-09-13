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


// Versioning
export {
	listDocsVersions,
	defaultDocsVersion,
	resolveDocsVersion,
	versionedHref,
	alternateVersionHrefs
} from './versions.js';
export type { DocsVersion, DocsVersionsConfig, ResolvedDocsVersion } from './versions.js';

// i18n
export {
	defaultDocsLocale,
	resolveDocsLocale,
	localizedHref,
	alternateLocaleHrefs
} from './i18n.js';
export type { DocsLocale, DocsLocalesConfig, ResolvedDocsLocale } from './i18n.js';

export { default as DocsVersionSwitcher } from './DocsVersionSwitcher.svelte';
export { default as DocsLocaleSwitcher } from './DocsLocaleSwitcher.svelte';

// Content negotiation
export { preferDocsRepresentation, negotiateDocsPage } from './negotiate.js';
export type { DocsNegotiateKind, DocsNegotiateResult } from './negotiate.js';


// Blog tags
export {
	tagsOfPost,
	tagSlug,
	tagHref,
	listTags,
	postsForTag,
	resolveTag
} from './tags.js';
export type { DocsTag, DocsTagsOptions } from './tags.js';
export { default as PostTags } from './PostTags.svelte';

// Blog feeds (RSS / Atom / JSON Feed)
export { listPosts, isPost, postDateOf, docsRss, docsAtom, docsJsonFeed } from './feeds.js';
export type { DocsPostListOptions } from './posts.js';
export type { DocsPost, DocsFeedOptions } from './feeds.js';

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
