import type { DocsTocItem } from './types.js';
import { slugify } from './nav-path.js';

export type TocScanOptions = {
	/** Root element to scan (article body) */
	root: ParentNode;
	minLevel?: number;
	maxLevel?: number;
	/** Assign missing ids on headings */
	ensureIds?: boolean;
};

/**
 * Collect h2–h6 (default) from a DOM subtree for on-page TOC.
 */
export function scanHeadings(options: TocScanOptions): DocsTocItem[] {
	const { root, minLevel = 2, maxLevel = 3, ensureIds = true } = options;
	const selector = Array.from({ length: maxLevel - minLevel + 1 }, (_, i) => `h${minLevel + i}`).join(
		','
	);
	const nodes = root.querySelectorAll<HTMLElement>(selector);
	const used = new Set<string>();
	const items: DocsTocItem[] = [];

	nodes.forEach((el) => {
		const tag = el.tagName.toLowerCase();
		const level = Number(tag.replace('h', ''));
		if (!Number.isFinite(level)) return;
		let id = el.id;
		const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
		if (!text) return;
		if (!id && ensureIds) {
			let base = slugify(text) || 'section';
			id = base;
			let n = 2;
			while (used.has(id) || (typeof document !== 'undefined' && document.getElementById(id) && document.getElementById(id) !== el)) {
				id = `${base}-${n++}`;
			}
			el.id = id;
		}
		if (!id) return;
		used.add(id);
		items.push({ id, text, level });
	});

	return items;
}
