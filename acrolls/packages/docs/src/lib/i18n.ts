// Locale-aware docs helpers — same shape as versions: first path segment is the locale.

import { normalizePath } from './nav-path.js';

export type DocsLocale = {
	/** Path segment, e.g. `en`, `fr`. */
	id: string;
	/** Display label, e.g. `English`. */
	label: string;
	/** BCP-47 tag for `<html lang>` / SEO, defaults to `id`. */
	lang?: string;
};

export type DocsLocalesConfig = {
	locales: readonly DocsLocale[];
	defaultLocale?: string;
	baseHref: string;
};

export type ResolvedDocsLocale = {
	locale: DocsLocale;
	isDefault: boolean;
	unlocalizedPath: string;
	slugWithinLocale: string;
};

function stripSlash(value: string): string {
	return value.replace(/\/+$/, '') || '/';
}

function ensureLeading(value: string): string {
	if (!value) return '/';
	return value.startsWith('/') ? value : `/${value}`;
}

/**
 * Type-safe, validated locale config. Throws at module load when `defaultLocale` is not one of
 * `locales`, so a typo fails the build instead of silently picking the first.
 */
export function defineLocales<const T extends DocsLocalesConfig>(config: T): T {
	defaultDocsLocale(config);
	return config;
}

export function defaultDocsLocale(config: DocsLocalesConfig): DocsLocale {
	const id = config.defaultLocale ?? config.locales[0]?.id;
	const found = config.locales.find((l) => l.id === id);
	if (!found) {
		throw new Error(
			`defaultLocale "${id}" is not in locales [${config.locales.map((l) => l.id).join(', ')}]`
		);
	}
	return found;
}

export function resolveDocsLocale(pathname: string, config: DocsLocalesConfig): ResolvedDocsLocale {
	const base = stripSlash(ensureLeading(config.baseHref));
	const path = normalizePath(pathname);
	const def = defaultDocsLocale(config);
	const rest =
		path === base || path === `${base}/`
			? ''
			: path.startsWith(`${base}/`)
				? path.slice(base.length + 1)
				: path.replace(/^\//, '');
	const segments = rest ? rest.split('/').filter(Boolean) : [];
	const first = segments[0];
	const matched = first ? config.locales.find((l) => l.id === first) : undefined;

	if (matched) {
		const within = segments.slice(1).join('/');
		return {
			locale: matched,
			isDefault: matched.id === def.id,
			unlocalizedPath: within ? `${base}/${within}` : base,
			slugWithinLocale: within
		};
	}

	return {
		locale: def,
		isDefault: true,
		unlocalizedPath: path.startsWith(base) ? path : base,
		slugWithinLocale: rest
	};
}

export function localizedHref(localeId: string, slugWithinLocale: string, config: DocsLocalesConfig): string {
	const base = stripSlash(ensureLeading(config.baseHref));
	const within = slugWithinLocale.replace(/^\/+/, '').replace(/\/+$/, '');
	return within ? `${base}/${localeId}/${within}` : `${base}/${localeId}`;
}

export function alternateLocaleHrefs(
	pathname: string,
	config: DocsLocalesConfig
): Array<{ locale: DocsLocale; href: string; current: boolean }> {
	const resolved = resolveDocsLocale(pathname, config);
	return config.locales.map((locale) => ({
		locale,
		href: localizedHref(locale.id, resolved.slugWithinLocale, config),
		current: locale.id === resolved.locale.id
	}));
}
