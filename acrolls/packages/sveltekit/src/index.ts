import {
	createAcrollsMdsvexOptions,
	createAcrollsMdsvexPreprocessor,
	type AcrollsMdsvexOptions
} from '@acrolls/mdsvex';

// Canonical content-collection surface (`content`, `markdownGlob`, `markdownRaw`,
// `customSource`, `createAcrollsDocsSource`, and all collection/docs-content types) lives in
// `./content.ts`. Re-export it wholesale so there is exactly ONE definition of `markdownGlob`
// in the package — the metadata/facts-aware one — instead of a divergent stale copy that only
// understood the legacy `modules` glob. Do not re-declare any of those names here.
export * from './content.js';

export type { AcrollsMdsvexOptions };
export { createAcrollsMdsvexOptions, createAcrollsMdsvexPreprocessor } from '@acrolls/mdsvex';
export { defineDocsConfig } from '@acrolls/docs/content';

function resolvePublicationLayout(): string {
	const pathname = decodeURIComponent(
		new URL(import.meta.resolve('@acrolls/svelte/PublicationLayout.svelte')).pathname
	);
	return /^\/[A-Za-z]:\//.test(pathname) ? pathname.slice(1) : pathname;
}

/**
 * mdsvex options with Acrolls layout default for SvelteKit hosts.
 */
export function createAcrollsSvelteKitMdsvexOptions(
  options: AcrollsMdsvexOptions = {}
) {
  const layout =
    options.layout ??
    ({
      _: resolvePublicationLayout()
    } as Record<string, string>);

  return createAcrollsMdsvexOptions({
    ...options,
    layout,
    extensions: options.extensions ?? ['.svx', '.md']
  });
}

/**
 * SvelteKit preprocessor with the shared layout default and Markdown source
 * safety normalization enabled before mdsvex parses the document.
 */
export function createAcrollsSvelteKitMdsvexPreprocessor(
	options: AcrollsMdsvexOptions = {}
) {
	return createAcrollsMdsvexPreprocessor({
		...options,
		layout: options.layout ?? { _: resolvePublicationLayout() },
		extensions: options.extensions ?? ['.svx', '.md']
	});
}

// Alias used in PRODUCT/TECH docs
export const createAcrollsKitOptions = createAcrollsSvelteKitMdsvexOptions;
