// Multi-version docs helpers — framework-neutral path resolution over a single
// content() tree whose first path segment is the version id (via mergeLoaders prefixes).

import { normalizePath } from './nav-path.js';

export type DocsVersion = {
	/** Path segment and merge prefix, e.g. `v1`. */
	id: string;
	/** Display label, e.g. `1.0`. */
	label: string;
	/** Optional badge shown next to the label. */
	badge?: string;
};

export type DocsVersionsConfig = {
	versions: readonly DocsVersion[];
	/** Defaults to the first version. */
	defaultVersion?: string;
	/** Docs area base, e.g. `/docs`. */
	baseHref: string;
};

export type ResolvedDocsVersion = {
	version: DocsVersion;
	/** True when this is the configured default version. */
	isDefault: boolean;
	/**
	 * Pathname with the version segment removed (still under baseHref).
	 * Example: `/docs/v2/guides/install` → `/docs/guides/install`.
	 */
	unversionedPath: string;
	/** Slug relative to the version root (`guides/install`), empty string on the version index. */
	slugWithinVersion: string;
};

function stripSlash(value: string): string {
	return value.replace(/\/+$/, '') || '/';
}

function ensureLeading(value: string): string {
	if (!value) return '/';
	return value.startsWith('/') ? value : `/${value}`;
}

export function listDocsVersions(config: DocsVersionsConfig): readonly DocsVersion[] {
	return config.versions;
}

export function defaultDocsVersion(config: DocsVersionsConfig): DocsVersion {
	const id = config.defaultVersion ?? config.versions[0]?.id;
	const found = config.versions.find((v) => v.id === id);
	if (!found) {
		throw new Error(
			`defaultVersion "${id}" is not in versions [${config.versions.map((v) => v.id).join(', ')}]`
		);
	}
	return found;
}

/**
 * Resolve which version a pathname belongs to.
 * Unknown first segments fall back to the default version and treat the whole
 * remainder as unversioned content under that default (legacy unprefixed trees).
 */
export function resolveDocsVersion(pathname: string, config: DocsVersionsConfig): ResolvedDocsVersion {
	const base = stripSlash(ensureLeading(config.baseHref));
	const path = normalizePath(pathname);
	const def = defaultDocsVersion(config);
	const rest = path === base || path === `${base}/` ? '' : path.startsWith(`${base}/`) ? path.slice(base.length + 1) : path.replace(/^\//, '');
	const segments = rest ? rest.split('/').filter(Boolean) : [];
	const first = segments[0];
	const matched = first ? config.versions.find((v) => v.id === first) : undefined;

	if (matched) {
		const within = segments.slice(1).join('/');
		const unversionedPath = within ? `${base}/${within}` : base;
		return {
			version: matched,
			isDefault: matched.id === def.id,
			unversionedPath,
			slugWithinVersion: within
		};
	}

	// No version prefix — treat as default version content.
	return {
		version: def,
		isDefault: true,
		unversionedPath: path.startsWith(base) ? path : base,
		slugWithinVersion: rest
	};
}

/** Build a version-scoped href for a slug within a version (or '' for the version index). */
export function versionedHref(versionId: string, slugWithinVersion: string, config: DocsVersionsConfig): string {
	const base = stripSlash(ensureLeading(config.baseHref));
	const within = slugWithinVersion.replace(/^\/+/, '').replace(/\/+$/, '');
	return within ? `${base}/${versionId}/${within}` : `${base}/${versionId}`;
}

/**
 * For the current pathname, produce an href for every version that preserves the
 * unversioned slug (so switchers can deep-link). Missing pages still get a href —
 * the host 404s if that version lacks the page.
 */
export function alternateVersionHrefs(
	pathname: string,
	config: DocsVersionsConfig
): Array<{ version: DocsVersion; href: string; current: boolean }> {
	const resolved = resolveDocsVersion(pathname, config);
	return config.versions.map((version) => ({
		version,
		href: versionedHref(version.id, resolved.slugWithinVersion, config),
		current: version.id === resolved.version.id
	}));
}
