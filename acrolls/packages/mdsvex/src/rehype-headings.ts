import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';

/**
 * The slice of the unified VFile this plugin touches. Typed structurally so the package takes no
 * `vfile` dependency: mdsvex reads `file.data.fm` to build the module's `metadata` export.
 */
type HeadingsVFile = { data: { fm?: Record<string, unknown> } };

/** One heading collected from the compiled document, for a server-rendered table of contents. */
export type AcrollsHeading = {
	/** The heading's `id`, taken verbatim from rehype-slug so in-page anchors match. */
	id: string;
	/** The heading's rendered text, markdown and anchor markup stripped. */
	text: string;
	/** Heading level (`2` for `h2`, and so on). */
	level: number;
};

export type AcrollsHeadingsOptions = {
	/** Shallowest level to collect. Default `2` (h1 is the page title, not a section). */
	minLevel?: number;
	/** Deepest level to collect. Default `4`. */
	maxLevel?: number;
};

/**
 * Collect the document's headings into `file.data.fm.headings` so mdsvex serializes them onto the
 * module's `metadata` export. That makes the table of contents available at compile time — present
 * in the server-rendered HTML and to crawlers, with no client-side DOM scan and no mount flash.
 *
 * Runs after rehype-slug, so each heading already carries its final `id`; the collected ids match
 * the in-page anchors exactly. `headings` is written only when at least one heading is found, so a
 * document with no sections keeps whatever `metadata` it already had (frequently none).
 */
export function rehypeAcrollsHeadings(options: AcrollsHeadingsOptions = {}) {
	const minLevel = options.minLevel ?? 2;
	const maxLevel = options.maxLevel ?? 4;

	return (tree: Root, file: HeadingsVFile) => {
		const headings: AcrollsHeading[] = [];

		visit(tree, 'element', (node: Element) => {
			const match = /^h([1-6])$/.exec(node.tagName);
			if (!match) return;
			const level = Number(match[1]);
			if (level < minLevel || level > maxLevel) return;

			const id = node.properties?.id;
			if (typeof id !== 'string' || id.length === 0) return;

			const text = toString(node).replace(/\s+/g, ' ').trim();
			if (!text) return;

			headings.push({ id, text, level });
		});

		if (headings.length === 0) return;

		file.data.fm = { ...(file.data.fm ?? {}), headings };
	};
}
