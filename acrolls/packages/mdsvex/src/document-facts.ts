export type AcrollsDocumentFacts = {
	hasFrontmatter: boolean;
	leadingH1?: string;
	links: string[];
};

type LeadingHeading = {
	start: number;
	end: number;
	text: string;
};

/**
 * Extract compile-time facts from a Markdown document without executing it as Svelte.
 * The result is exported by the Acrolls preprocessor for eager Vite document discovery.
 */
export function inspectAcrollsDocument(source: string): AcrollsDocumentFacts {
	const frontmatter = frontmatterEnd(source);
	const leadingH1 = findLeadingH1(source, frontmatter.end)?.text;
	return {
		hasFrontmatter: frontmatter.present,
		leadingH1,
		links: extractMarkdownLinks(source.slice(frontmatter.end))
	};
}

/** Remove precisely the initial Markdown H1, leaving every later heading untouched. */
export function suppressInitialMarkdownH1(source: string): string {
	const frontmatter = frontmatterEnd(source);
	const heading = findLeadingH1(source, frontmatter.end);
	if (!heading) return source;
	return `${source.slice(0, heading.start)}${source.slice(heading.end)}`;
}

function frontmatterEnd(source: string): { present: boolean; end: number } {
	const match = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.exec(source);
	return match ? { present: true, end: match[0].length } : { present: false, end: 0 };
}

function findLeadingH1(source: string, start: number): LeadingHeading | undefined {
	const body = source.slice(start);
	const padding = /^(?:[ \t]*\r?\n)*/.exec(body)?.[0].length ?? 0;
	const offset = start + padding;
	const candidate = source.slice(offset);

	const atx = /^(?: {0,3})#(?!#)[ \t]+(.+?)[ \t]*#*[ \t]*(?:\r?\n|$)/.exec(candidate);
	if (atx) {
		return {
			start: offset,
			end: offset + atx[0].length,
			text: normalizeHeadingText(atx[1] ?? '')
		};
	}

	const setext = /^([^\r\n]+)\r?\n[ \t]*={1,}[ \t]*(?:\r?\n|$)/.exec(candidate);
	if (!setext) return undefined;
	return {
		start: offset,
		end: offset + setext[0].length,
		text: normalizeHeadingText(setext[1] ?? '')
	};
}

function normalizeHeadingText(value: string): string {
	return value.replaceAll(/[`*_~]/g, '').replaceAll(/\s+/g, ' ').trim();
}

function extractMarkdownLinks(source: string): string[] {
	const withoutCode = source.replaceAll(/(^|\n)```[\s\S]*?```/g, '$1');
	const links: string[] = [];
	const pattern = /(?<!!)\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))[^)]*\)/g;
	for (const match of withoutCode.matchAll(pattern)) {
		const href = (match[1] ?? match[2] ?? '').trim();
		if (href) links.push(href);
	}
	return [...new Set(links)];
}
