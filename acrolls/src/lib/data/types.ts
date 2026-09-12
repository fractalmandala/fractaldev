/**
 * Recursive nav node — leaf (href) and/or group (children).
 * Groups may also have href for an overview page.
 */
export type DocsNavNode = {
	/** Stable id for open-state persistence; auto-derived if omitted */
	id?: string;
	title: string;
	/** Page href; optional for pure group nodes */
	href?: string;
	slug?: string;
	description?: string;
	badge?: string;
	/** Open this group by default */
	defaultOpen?: boolean;
	/** Nested children (unlimited depth) */
	children?: DocsNavNode[];
};

/** Top-level collapsible section in the sidebar. */
export type DocsNavSection = {
	id: string;
	title: string;
	/** Optional landing-page link for this top-level group. */
	href?: string;
	slug?: string;
	description?: string;
	badge?: string;
	defaultOpen?: boolean;
	items: DocsNavNode[];
};

/** Full docs nav tree for one documentation surface (user, developer, …). */
export type DocsNav = {
	/** Sidebar product/docs title */
	title: string;
	/** Index href for this docs area */
	baseHref: string;
	/** Absolute site origin (e.g. https://example.com), no trailing slash — for
	 * canonical, Open Graph, sitemap, and llms.txt absolute URLs. */
	site?: string;
	subtitle?: string;
	/**
	 * Storage namespace for accordion open state.
	 * Defaults to a slug of `title` when omitted.
	 */
	storageKey?: string;
	sections: DocsNavSection[];
};

/** Breadcrumb segment. Last is typically the current page (no href). */
export type DocsCrumb = {
	label: string;
	href?: string;
};

export type DocsPagerLink = {
	title: string;
	href: string;
} | null;

/** On-page table of contents entry. */
export type DocsTocItem = {
	id: string;
	text: string;
	/** Heading level 2–6 */
	level: number;
};

/** @deprecated alias — use DocsNavNode */
export type DocsNavItem = DocsNavNode;
