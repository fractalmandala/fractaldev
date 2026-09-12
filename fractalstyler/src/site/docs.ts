/**
 * The docs convention + the browser-safe half of the collection.
 *
 * The filesystem is the source of truth, not frontmatter. A page is
 * `docs/NN-section/NN-page.md`: the `NN-` prefixes give order, the folder gives
 * the section, and stripping the prefixes gives the URL
 * (`docs/01-usage-guide/00-tokens.md` → `/docs/usage-guide/tokens`).
 * A section's label is title-cased from its folder unless the folder carries a
 * `+meta.json` with `{ "label": "..." }`.
 *
 * Frontmatter keeps only what is about the PAGE (`title`, `description`,
 * `tags`, `draft`) — never order, never section. Two channels saying the same
 * thing is how ordering drifts.
 *
 * What lives HERE is only what a browser may hold: the path convention and two
 * LAZY globs (one compiled page, one raw source — fetched per page, never all
 * at once). The nav is built from the same convention in `docs.server.ts`,
 * with `node:fs`. Deliberately: an EAGER glob over `metadata` does not
 * tree-shake — it pulls all twenty compiled pages into the entry chunk.
 */

import type { Component } from 'svelte';

export type DocMeta = {
	title?: string;
	description?: string;
	tags?: string[];
	draft?: boolean;
};

/** One page, addressed and placed. Minted server-side, sent down as nav data. */
export type DocEntry = {
	/** Clean address inside the collection: `usage-guide/tokens`. */
	slug: string;
	/** Resolved URL for the `/docs` mount. */
	href: string;
	/** Section slug (`usage-guide`) and its display label (`Usage Guide`). */
	section: string;
	sectionLabel: string;
	title: string;
	description?: string;
};

/** A sidebar section — the only grouping level this corpus has. */
export type DocGroup = {
	slug: string;
	label: string;
	items: DocEntry[];
};

// ── the convention (shared by both halves) ──────────────────────────────────

/** `01-usage-guide` → `usage-guide`. */
export const stripOrder = (segment: string) => segment.replace(/^\d+-/, '') || segment;

/** `01-usage-guide` → 1. No prefix sorts last. */
export const orderOf = (segment: string) => {
	const m = segment.match(/^(\d+)-/);
	return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
};

/** `usage-guide` → `Usage Guide`. The default label; `+meta.json` overrides. */
export const titleCase = (slug: string) =>
	slug
		.split('-')
		.filter(Boolean)
		.map((w) => w[0].toUpperCase() + w.slice(1))
		.join(' ');

/** `/docs/01-usage-guide/00-tokens.md` → `usage-guide/tokens`. */
function slugOf(file: string): string {
	return file
		.replace(/^.*\/routes\/docs\//, '')
		.replace(/\.md$/, '')
		.split('/')
		.map(stripOrder)
		.join('/');
}

// ── the two lazy views, keyed by slug ───────────────────────────────────────

const bodies = import.meta.glob('/src/routes/docs/**/*.md') as Record<
	string,
	() => Promise<{ default: Component; metadata?: DocMeta }>
>;

const raws = import.meta.glob('/src/routes/docs/**/*.md', {
	query: '?raw',
	import: 'default'
}) as Record<string, () => Promise<string>>;

const bodyBySlug = new Map(Object.entries(bodies).map(([file, load]) => [slugOf(file), load]));
const rawBySlug = new Map(Object.entries(raws).map(([file, load]) => [slugOf(file), load]));

/** Load one page: its compiled component and its own frontmatter. */
export async function loadDoc(slug: string) {
	const load = bodyBySlug.get(slug);
	if (!load) return undefined;
	const mod = await load();
	return { content: mod.default, meta: mod.metadata ?? {} };
}

/** Load one page's untouched markdown source, frontmatter stripped. */
export async function loadDocRaw(slug: string): Promise<string | undefined> {
	const load = rawBySlug.get(slug);
	if (!load) return undefined;
	return (await load()).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

// ── views over a nav tree (the tree itself is server-built) ─────────────────

/** Every page in reading order — prev/next walks this, across section borders. */
const flatten = (nav: DocGroup[]): DocEntry[] => nav.flatMap((g) => g.items);

export function neighbours(nav: DocGroup[], slug: string): { prev?: DocEntry; next?: DocEntry } {
	const order = flatten(nav);
	const i = order.findIndex((e) => e.slug === slug);
	if (i < 0) return {};
	return { prev: order[i - 1], next: order[i + 1] };
}
