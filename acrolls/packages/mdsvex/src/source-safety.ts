export type AcrollsSafetyFindingKind =
	| 'svelte-literal'
	| 'generic-type-literal'
	| 'object-literal';

export type AcrollsSafetyFinding = {
	kind: AcrollsSafetyFindingKind;
	line: number;
	column: number;
	text: string;
	message: string;
};

export type AcrollsSourceSafetyResult = {
	source: string;
	findings: AcrollsSafetyFinding[];
	changed: boolean;
};

type SafetyPattern = {
	kind: AcrollsSafetyFindingKind;
	pattern: RegExp;
	message: string;
};

const MERMAID_DECLARATION = /^(?:(?:graph|flowchart)\s+(?:TB|TD|BT|RL|LR)\b|(?:sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|gitGraph|quadrantChart|timeline|mindmap|architecture|block-beta|packet-beta|xychart-beta|zenuml)(?:\s|$))/i;

/**
 * Literal constructs that Svelte may interpret when they appear in Markdown
 * prose. Keep this list deliberately narrow: `.svx` remains the escape hatch
 * for intentional Svelte markup and component syntax.
 */
const SAFETY_PATTERNS: SafetyPattern[] = [
	{
		kind: 'svelte-literal',
		pattern: /<\/?svelte:(?:head|window|body|component|element|self)\b[^>]*>/g,
		message: 'Svelte special tags in Markdown prose are wrapped as literal code.'
	},
	{
		kind: 'svelte-literal',
		pattern: /<[A-Z][A-Za-z0-9_-]*>/g,
		message: 'Component-shaped angle brackets in Markdown prose are wrapped as literal code.'
	},
	{
		kind: 'generic-type-literal',
		pattern: /\b(?:Result|Option|Vec|State|Array|Record|Promise|Set|Map)<[A-Za-z][^>\n]*>/g,
		message: 'Generic type syntax in Markdown prose is wrapped as literal code.'
	}
];

const OBJECT_LITERAL_MESSAGE =
	'Object-literal syntax in Markdown prose is wrapped as literal code.';

/** Opening shape of an object literal: `{ ident :`. Anchored, tested at a candidate brace. */
const OBJECT_LITERAL_HEAD = /^\{\s*[A-Za-z_$][A-Za-z0-9_$-]*\s*:/;

/**
 * Upper bound on a wrapped object literal. Prose that opens a brace and closes
 * it much later is far more likely to be two unrelated sentences than one
 * literal, and wrapping that much text as code would be worse than leaving it.
 */
const OBJECT_LITERAL_MAX_LENGTH = 240;

/**
 * Locate object literals by matching braces rather than by regex.
 *
 * A pattern that forbids braces in the value (the previous approach) cannot see
 * `{ a: { b: 1 } }`: it skips the outer literal and matches only the inner one,
 * so the wrap lands inside the braces Svelte actually parses. The document is
 * then reported as normalized while still compiling to invalid Svelte, which
 * fails the whole build under the default `onInvalidDocument: 'fail'` policy.
 *
 * Scanning for the matching close brace wraps the outermost literal instead, and
 * skipping past it keeps nested literals from being reported twice. An unbalanced
 * brace is left alone — there is no literal to delimit, so guessing an end would
 * wrap arbitrary prose.
 */
function findObjectLiterals(segment: string): Array<{ text: string; offset: number }> {
	const found: Array<{ text: string; offset: number }> = [];

	for (let index = 0; index < segment.length; index += 1) {
		if (segment[index] !== '{') continue;
		if (!OBJECT_LITERAL_HEAD.test(segment.slice(index))) continue;

		let depth = 0;
		let end = -1;
		for (let scan = index; scan < segment.length; scan += 1) {
			const char = segment[scan];
			if (char === '{') depth += 1;
			else if (char === '}') {
				depth -= 1;
				if (depth === 0) {
					end = scan;
					break;
				}
			}
		}
		if (end === -1) continue;

		const text = segment.slice(index, end + 1);
		if (text.length > OBJECT_LITERAL_MAX_LENGTH) continue;

		found.push({ text, offset: index });
		index = end;
	}

	return found;
}

function isMarkdownFilename(filename?: string): boolean {
	if (!filename) return true;
	return /(?:^|\.)md$/i.test(filename);
}

function transformSegment(
	segment: string,
	line: number,
	columnOffset: number,
	findings: AcrollsSafetyFinding[]
): string {
	const matches = [
		...SAFETY_PATTERNS.flatMap((entry) =>
			Array.from(segment.matchAll(entry.pattern), (match) => ({
				kind: entry.kind,
				message: entry.message,
				text: match[0],
				offset: match.index ?? 0
			}))
		),
		...findObjectLiterals(segment).map((match) => ({
			kind: 'object-literal' as const,
			message: OBJECT_LITERAL_MESSAGE,
			text: match.text,
			offset: match.offset
		}))
		// Longest first at a shared offset, so an enclosing literal wins over anything
		// starting with it; the cursor check below then drops the enclosed matches.
	].sort((a, b) => a.offset - b.offset || b.text.length - a.text.length);

	let cursor = 0;
	let result = '';
	for (const match of matches) {
		if (match.offset < cursor) continue;
		result += segment.slice(cursor, match.offset);
		result += `\`${match.text}\``;
		findings.push({
			kind: match.kind,
			line,
			column: columnOffset + match.offset + 1,
			text: match.text,
			message: match.message
		});
		cursor = match.offset + match.text.length;
	}
	return result + segment.slice(cursor);
}

function transformLine(
	lineText: string,
	line: number,
	findings: AcrollsSafetyFinding[]
): string {
	const parts = lineText.split(/(`+[^`]*`+)/g);
	let offset = 0;
	return parts
		.map((part, index) => {
			const next = index % 2 === 0 ? transformSegment(part, line, offset, findings) : part;
			offset += part.length;
			return next;
		})
		.join('');
}

/**
 * Normalize only Markdown prose that would otherwise be interpreted as
 * Svelte syntax. Fenced code and existing inline code are preserved. `.svx`
 * sources are intentionally left untouched because they may contain real
 * components.
 */
export function normalizeAcrollsMarkdown(
	source: string,
	options: { filename?: string } = {}
): AcrollsSourceSafetyResult {
	if (!isMarkdownFilename(options.filename)) {
		return { source, findings: [], changed: false };
	}

	const findings: AcrollsSafetyFinding[] = [];
	let fenced = false;
	let mermaidBlock = false;
	const lines = source.split(/(\r?\n)/);
	const normalized = lines
		.map((part, index) => {
			if (/\r?\n/.test(part)) return part;
			const fence = /^\s*(`{3,}|~{3,})/.test(part);
			if (fence) {
				fenced = !fenced;
				return part;
			}
			if (fenced) return part;
			if (mermaidBlock) {
				if (part.trim() === '') mermaidBlock = false;
				return part;
			}
			if (MERMAID_DECLARATION.test(part.trim())) {
				mermaidBlock = true;
				return part;
			}
			return transformLine(part, Math.floor(index / 2) + 1, findings);
		})
		.join('');

	return {
		source: normalized,
		findings,
		changed: normalized !== source
	};
}
