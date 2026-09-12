// Acrolls Open Graph image card — framework-neutral, dependency-free.
//
// `acrollsOgCard()` returns a Satori element tree (plain nested objects — the same
// shape Satori accepts). Acrolls owns the card DESIGN; the host installs `satori`
// + `@resvg/resvg-js` and renders it in a prerendered endpoint:
//
//   const svg = await satori(acrollsOgCard({ title, description }), { width: 1200, height: 630, fonts });
//   const png = new Resvg(svg).render().asPng();

import type { DocsContentDocument, DocsContentSource } from './content.js';

/** Minimal Satori-compatible node (a subset of its JSX-element object form). */
export type SatoriNode = {
	type: string;
	props: {
		style?: Record<string, string | number>;
		children?: SatoriNode | string | Array<SatoriNode | string>;
		[key: string]: unknown;
	};
};

export type AcrollsOgCardOptions = {
	title: string;
	description?: string;
	/** Small label above the title, e.g. the site/section name. */
	eyebrow?: string;
	accent?: string;
	background?: string;
	foreground?: string;
	muted?: string;
	fontFamily?: string;
};

function el(
	type: string,
	style: Record<string, string | number>,
	children?: SatoriNode | string | Array<SatoriNode | string>
): SatoriNode {
	return { type, props: { style, ...(children === undefined ? {} : { children }) } };
}

/** Build the 1200×630 OG card element tree. */
export function acrollsOgCard(options: AcrollsOgCardOptions): SatoriNode {
	const accent = options.accent ?? '#04825B';
	const background = options.background ?? '#0B1220';
	const foreground = options.foreground ?? '#E6EDF5';
	const muted = options.muted ?? '#8493AB';
	const fontFamily = options.fontFamily ?? 'Inter';

	const children: Array<SatoriNode | string> = [];

	if (options.eyebrow) {
		children.push(
			el(
				'div',
				{
					fontSize: 26,
					fontWeight: 600,
					letterSpacing: 2,
					textTransform: 'uppercase',
					color: accent
				},
				options.eyebrow
			)
		);
	}

	// Title + description block (grows to fill the middle).
	const middle: Array<SatoriNode | string> = [
		el(
			'div',
			{
				fontSize: 68,
				fontWeight: 700,
				lineHeight: 1.1,
				letterSpacing: -1,
				color: foreground,
				// clamp long titles
				display: 'flex',
				overflow: 'hidden'
			},
			options.title
		)
	];
	if (options.description) {
		middle.push(
			el(
				'div',
				{ fontSize: 32, lineHeight: 1.4, color: muted, marginTop: 24, display: 'flex' },
				options.description
			)
		);
	}
	children.push(el('div', { display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }, middle));

	// Brand row: accent chip + wordmark.
	children.push(
		el('div', { display: 'flex', alignItems: 'center', gap: 16 }, [
			el('div', { width: 28, height: 28, borderRadius: 8, backgroundColor: accent }),
			el('div', { fontSize: 28, fontWeight: 700, color: foreground }, 'acrolls')
		])
	);

	return el(
		'div',
		{
			width: '1200px',
			height: '630px',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			padding: '72px',
			backgroundColor: background,
			fontFamily
		},
		children
	);
}

export type DocsOgPathOptions = {
	/** URL base for OG images (default `/og`). */
	base?: string;
	/** Slug used for the docs index (default `index`). */
	indexSlug?: string;
	/** File extension (default `.png`). */
	ext?: string;
};

/** Flat, filesystem-safe OG slug for a page — nested slugs are flattened (`/` →
 * `--`) so a single `og/[slug]` route has no file-vs-directory prerender conflicts. */
export function docsOgSlug(
	docOrSlug: DocsContentDocument<unknown> | string,
	options: DocsOgPathOptions = {}
): string {
	const raw = typeof docOrSlug === 'string' ? docOrSlug : docOrSlug.slug;
	return (raw || options.indexSlug || 'index').replace(/\//g, '--');
}

/** Root-relative OG image URL for a page (pass a document or its slug). */
export function docsOgImagePath(
	docOrSlug: DocsContentDocument<unknown> | string,
	options: DocsOgPathOptions = {}
): string {
	const base = (options.base ?? '/og').replace(/\/+$/, '');
	const ext = options.ext ?? '.png';
	return `${base}/${docsOgSlug(docOrSlug, options)}${ext}`;
}

/** Prerender entries for an OG endpoint (route `og/[slug]`): one flat image per
 * document (e.g. `guides--installation.png`, `index.png`). Resolve the document in
 * the endpoint with `docsOgSlug` matching. */
export function docsOgEntries(
	source: DocsContentSource<unknown>,
	options: DocsOgPathOptions = {}
): Array<{ slug: string }> {
	const ext = options.ext ?? '.png';
	return source.documents.map((doc) => ({ slug: `${docsOgSlug(doc, options)}${ext}` }));
}
