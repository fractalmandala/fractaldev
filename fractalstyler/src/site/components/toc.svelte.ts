/**
 * The table of contents for the current doc page. Published by the
 * `headingAnchors` action (which already scans every h2/h3 to assign ids)
 * and read by the docs right rail. One writer, one reader, no DOM scraping
 * in between.
 */
export interface TocItem {
	id: string;
	text: string;
	level: 2 | 3;
}

export const tocItems = $state<TocItem[]>([]);
