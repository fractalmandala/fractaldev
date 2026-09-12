// Acrolls SEO — framework-neutral. Builds head metadata, JSON-LD, sitemap, and
// robots from the generated content tree. No Svelte here; `DocsSeo.svelte` renders
// the output of `buildDocsSeo` into <svelte:head>.

import type { DocsNav } from './types.js';
import type { DocsContentDocument, DocsContentSource, DocsMetadata } from './content.js';
import { buildDocsCrumbs } from './nav.js';

/** Site-level SEO defaults the host supplies once. */
export type DocsSiteSeo = {
	/** Absolute or root-relative default OG/Twitter image. */
	image?: string;
	/** Twitter/X handle, e.g. `@acrolls`. */
	twitter?: string;
	/** BCP-47 locale, e.g. `en_US`. */
	locale?: string;
	/** Fallback description when a page has none. */
	description?: string;
};

/** Per-page SEO overrides read from frontmatter `seo:` (all optional). */
export type DocsPageSeo = {
	title?: string;
	description?: string;
	image?: string;
	canonical?: string;
	noindex?: boolean;
};

export type ResolvedDocsSeo = {
	title: string;
	description?: string;
	canonical?: string;
	robots?: string;
	og: Record<string, string>;
	twitter: Record<string, string>;
	/** JSON-LD objects to serialize into <script type="application/ld+json"> tags. */
	jsonLd: Array<Record<string, unknown>>;
};

export type BuildDocsSeoInput = {
	nav: DocsNav;
	pathname: string;
	document?: DocsContentDocument<unknown>;
	site?: DocsSiteSeo;
	/** Auto-generated OG image path for this page (e.g. from `docsOgImagePath`).
	 * Used when the page/site declares no explicit image. */
	ogImage?: string;
};

function readPageSeo(metadata?: DocsMetadata): DocsPageSeo {
	const raw = metadata?.['seo'];
	return raw && typeof raw === 'object' ? (raw as DocsPageSeo) : {};
}

function stripTrailingSlash(value: string): string {
	return value.replace(/\/+$/, '');
}

function absoluteUrl(nav: DocsNav, pathOrUrl?: string): string | undefined {
	if (!pathOrUrl) return undefined;
	if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
	if (!nav.site) return pathOrUrl; // root-relative fallback when no site origin set
	return `${stripTrailingSlash(nav.site)}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

function isIndexPath(nav: DocsNav, pathname: string): boolean {
	return pathname === nav.baseHref || pathname === `${nav.baseHref}/`;
}

/** Resolve the full head-metadata set for one page. */
export function buildDocsSeo(input: BuildDocsSeoInput): ResolvedDocsSeo {
	const { nav, pathname, document, site } = input;
	const page = readPageSeo(document?.metadata);
	const isIndex = isIndexPath(nav, pathname);

	const title = page.title ?? document?.title ?? nav.title;
	const description = page.description ?? document?.description ?? site?.description;
	const canonical = page.canonical ?? absoluteUrl(nav, pathname);
	const robots = page.noindex ? 'noindex, nofollow' : undefined;
	// Precedence: per-page frontmatter image > auto-generated OG > site default.
	const image = absoluteUrl(nav, page.image ?? input.ogImage ?? site?.image);
	const type = isIndex ? 'website' : 'article';

	const og: Record<string, string> = {
		'og:title': title,
		'og:type': type,
		'og:site_name': nav.title
	};
	if (description) og['og:description'] = description;
	if (canonical) og['og:url'] = canonical;
	if (image) og['og:image'] = image;
	if (site?.locale) og['og:locale'] = site.locale;

	const twitter: Record<string, string> = {
		'twitter:card': image ? 'summary_large_image' : 'summary',
		'twitter:title': title
	};
	if (description) twitter['twitter:description'] = description;
	if (image) twitter['twitter:image'] = image;
	if (site?.twitter) twitter['twitter:site'] = site.twitter;

	const jsonLd: Array<Record<string, unknown>> = [];

	if (isIndex) {
		jsonLd.push({
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: nav.title,
			...(nav.site ? { url: stripTrailingSlash(nav.site) } : {}),
			...(nav.subtitle ? { description: nav.subtitle } : {})
		});
	} else if (document) {
		const meta = document.metadata as Record<string, unknown>;
		const datePublished = typeof meta['date'] === 'string' ? (meta['date'] as string) : undefined;
		const dateModified =
			typeof meta['lastModified'] === 'string' ? (meta['lastModified'] as string) : datePublished;
		jsonLd.push({
			'@context': 'https://schema.org',
			'@type': 'TechArticle',
			headline: title,
			...(description ? { description } : {}),
			...(canonical ? { url: canonical, mainEntityOfPage: canonical } : {}),
			...(image ? { image } : {}),
			...(datePublished ? { datePublished } : {}),
			...(dateModified ? { dateModified } : {}),
			isPartOf: { '@type': 'WebSite', name: nav.title }
		});
	}

	// BreadcrumbList — straight from the generated crumb chain.
	const crumbs = buildDocsCrumbs(nav, pathname);
	if (crumbs.length > 1) {
		jsonLd.push({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: crumbs.map((crumb, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: crumb.label,
				...(crumb.href ? { item: absoluteUrl(nav, crumb.href) } : {})
			}))
		});
	}

	return { title, description, canonical, robots, og, twitter, jsonLd };
}

export type DocsSitemapOptions = {
	/** Extra absolute or root-relative URLs to include. */
	extraUrls?: string[];
};

/** Generate `sitemap.xml` from the content tree (skips hidden and noindex pages). */
export function docsSitemap(source: DocsContentSource<unknown>, options: DocsSitemapOptions = {}): string {
	const nav = source.nav;
	const urls: string[] = [];
	for (const document of source.documents) {
		if (document.hidden) continue;
		if (readPageSeo(document.metadata).noindex) continue;
		const loc = absoluteUrl(nav, document.href);
		if (loc) urls.push(loc);
	}
	for (const extra of options.extraUrls ?? []) {
		const loc = absoluteUrl(nav, extra);
		if (loc) urls.push(loc);
	}
	const body = urls
		.map((loc) => `  <url><loc>${escapeXml(loc)}</loc></url>`)
		.join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export type DocsRobotsOptions = {
	/** Absolute sitemap URL; defaults to `<site>/sitemap.xml` when the nav has a site origin. */
	sitemap?: string;
	/** Disallow paths. */
	disallow?: string[];
};

/** Generate `robots.txt`. */
export function docsRobots(source: DocsContentSource<unknown>, options: DocsRobotsOptions = {}): string {
	const lines = ['User-agent: *'];
	for (const path of options.disallow ?? []) lines.push(`Disallow: ${path}`);
	if (!options.disallow?.length) lines.push('Allow: /');
	const sitemap =
		options.sitemap ?? (source.nav.site ? `${stripTrailingSlash(source.nav.site)}/sitemap.xml` : undefined);
	if (sitemap) lines.push(`Sitemap: ${sitemap}`);
	return `${lines.join('\n')}\n`;
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
