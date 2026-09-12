/**
 * The docs nav, built from the folder itself — server-only.
 *
 * The `.server` suffix is the whole trick. Client and server are separate
 * Rollup passes, so an EAGER glob in here costs the browser nothing — the same
 * glob in a browser-reachable module drags all twenty compiled pages into the
 * entry chunk (measured: 800 KB vs 156 KB).
 *
 * `?raw` is the other half, and it is about DEV SPEED. Globbing the compiled
 * module for its `metadata` export makes Vite run every page through mdsvex
 * and Shiki before the nav can be returned — measured at 15s on the first docs
 * request, and again on every invalidation. `?raw` hands back the file as
 * text, so the nav costs a regex per file and the markdown pipeline only ever
 * runs for the page actually being read.
 */
import { orderOf, stripOrder, titleCase, type DocGroup, type DocMeta } from './docs';

const ROOT = '/src/routes/docs/';

const sources = import.meta.glob('/src/routes/docs/**/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

/**
 * A deliberately small frontmatter reader: the page-level keys, flow-style
 * lists included. Anything richer wants a YAML parser — but nothing here
 * should need it, since structure lives in the filenames.
 */
function frontmatter(source: string): DocMeta {
	const block = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!block) return {};
	const out: DocMeta = {};
	for (const line of block[1].split(/\r?\n/)) {
		const m = line.match(/^(\w+)\s*:\s*(.*)$/);
		if (!m) continue;
		const [, key, raw] = m;
		const value = raw.trim().replace(/^["']|["']$/g, '');
		if (key === 'title' || key === 'description') out[key] = value;
		else if (key === 'draft') out.draft = value === 'true';
	}
	return out;
}

const metas = Object.fromEntries(
	Object.entries(sources).map(([file, text]) => [file, frontmatter(text)])
) as Record<string, DocMeta | undefined>;

/** `+meta.json` is the ONE naming escape hatch: `{ "label": "..." }`. Never order. */
const labels = import.meta.glob('/src/routes/docs/**/+meta.json', {
	eager: true,
	import: 'default'
}) as Record<string, { label?: string } | undefined>;

/** The sidebar tree: sections in folder order, pages in file order. */
export function docsNav(): DocGroup[] {
	const groups = new Map<string, DocGroup & { order: number }>();

	const pages = Object.entries(metas)
		// '/docs/01-usage-guide/00-tokens.md' → ['01-usage-guide', '00-tokens']
		.map(([file, meta]) => ({ raw: file.slice(ROOT.length, -3).split('/'), meta: meta ?? {} }))
		.filter(({ raw, meta }) => raw.length === 2 && !meta.draft)
		.sort(
			(a, b) =>
				orderOf(a.raw[0]) - orderOf(b.raw[0]) ||
				orderOf(a.raw[1]) - orderOf(b.raw[1]) ||
				a.raw[1].localeCompare(b.raw[1])
		);

	for (const { raw, meta } of pages) {
		const [sectionRaw, pageRaw] = raw;
		const section = stripOrder(sectionRaw);
		const label = labels[`${ROOT}${sectionRaw}/+meta.json`]?.label ?? titleCase(section);
		const slug = `${section}/${stripOrder(pageRaw)}`;

		const group =
			groups.get(section) ??
			groups.set(section, { slug: section, label, order: orderOf(sectionRaw), items: [] }).get(section)!;

		group.items.push({
			slug,
			href: `/docs/${slug}`,
			section,
			sectionLabel: label,
			title: meta.title ?? titleCase(stripOrder(pageRaw)),
			description: meta.description
		});
	}

	return [...groups.values()].sort((a, b) => a.order - b.order);
}
