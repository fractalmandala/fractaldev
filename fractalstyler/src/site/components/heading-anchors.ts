import type { Action } from 'svelte/action';
import { tocItems, type TocItem } from './toc.svelte.js';

/** Slugify heading text into a stable fragment id. */
function slug(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Hover-reveal permalink anchors for rendered markdown headings. Assigns
 * stable ids to h2s and h3s (deduped), appends one `.rlink` anchor each —
 * styled by `_11_richtext.sass` — publishes the heading list to the `tocItems`
 * store for the docs right rail, and removes anchors on destroy. Pass the
 * rendered content so doc-to-doc navigation re-scans the swapped markup:
 *
 * ```svelte
 * <article use:headingAnchors={data.content}>…</article>
 * ```
 */
export const headingAnchors: Action<HTMLElement, unknown> = (node) => {
	let links: HTMLAnchorElement[] = [];

	function scan(): void {
		for (const a of links) a.remove();
		links = [];
		const used = new Set<string>();
		const items: TocItem[] = [];
		for (const h of node.querySelectorAll('h2, h3')) {
			const heading = h as HTMLHeadingElement;
			const base = heading.id || slug(heading.textContent ?? '');
			if (!base) continue;
			let id = base;
			let n = 2;
			while (used.has(id)) id = `${base}-${n++}`;
			used.add(id);
			heading.id = id;
			items.push({
				id,
				text: (heading.textContent ?? '').trim(),
				level: heading.tagName === 'H3' ? 3 : 2
			});
			const a = document.createElement('a');
			a.href = `#${id}`;
			a.className = 'rlink';
			a.tabIndex = -1;
			a.setAttribute('aria-hidden', 'true');
			a.textContent = '#';
			heading.append(a);
			links.push(a);
		}
		tocItems.length = 0;
		tocItems.push(...items);
	}

	queueMicrotask(scan);

	return {
		update(): void {
			queueMicrotask(scan);
		},
		destroy(): void {
			for (const a of links) a.remove();
			links = [];
			tocItems.length = 0;
		}
	};
};
