/*
 * Shared helpers for the diagram components' ASCII art.
 * The art is built as segments so every line lands on the same width —
 * borders line up because they are computed, not hand-counted.
 */

export type ArtSeg = {
	text: string;
	cls?: string;
};

/** Left-pad a string with spaces to exactly `width` characters. */
export function padStart(text: string, width: number): string {
	return text.length >= width ? text : text.padStart(width, ' ');
}

/** Right-pad a string with spaces to exactly `width` characters. */
export function padEnd(text: string, width: number): string {
	return text.length >= width ? text : text.padEnd(width, ' ');
}

/**
 * A `+ - - - - +` frame edge of exactly `width` characters:
 * dashes on odd columns, spaces elsewhere.
 */
export function dashEdge(width: number): string {
	const chars: string[] = Array.from({ length: width }, (_, i) => (i % 2 === 1 ? '-' : ' '));
	chars[0] = '+';
	chars[width - 1] = '+';
	return chars.join('');
}

/**
 * A frame edge split into three segments around a centered `[ LABEL ]`
 * overlay, so the label can take its own class without moving the dashes.
 */
export function splitLabeledEdge(width: number, label: string): [string, string, string] {
	const base = dashEdge(width);
	const overlay = `[ ${label.toUpperCase()} ]`;
	const start = Math.max(1, Math.round((width - overlay.length) / 2));
	return [base.slice(0, start), overlay, base.slice(start + overlay.length)];
}

/** A row of `width` characters inside side borders: `| ... |`. */
export function padRow(width: number): string {
	return '|' + ' '.repeat(Math.max(0, width - 2)) + '|';
}

export type ArtCell = {
	/** Column the text starts at, 0-based. */
	at: number;
	text: string;
	cls?: string;
};

/**
 * Builds one art row from absolutely-positioned cells. Side borders are
 * painted at columns 0 and width-1, then the cells are stamped on top.
 * The finished row is split into segments at class boundaries so styled
 * cells (titles, values, arrows) can take their own classes.
 */
export function overlayRow(width: number, cells: ArtCell[]): ArtSeg[] {
	const chars = Array.from({ length: width }, () => ' ');
	chars[0] = '|';
	chars[width - 1] = '|';

	const sorted = [...cells].sort((a, b) => a.at - b.at);
	for (const cell of sorted) {
		for (let i = 0; i < cell.text.length; i++) {
			const at = cell.at + i;
			if (at > 0 && at < width - 1) {
				chars[at] = cell.text[i];
			}
		}
	}

	const segs: ArtSeg[] = [];
	let cursor = 0;

	for (const cell of sorted) {
		if (!cell.cls) {
			continue;
		}

		const start = Math.max(cell.at, 1);
		const end = Math.min(cell.at + cell.text.length, width - 1);

		if (end <= start) {
			continue;
		}

		if (start > cursor) {
			segs.push({ text: chars.slice(cursor, start).join('') });
		}

		segs.push({ text: chars.slice(start, end).join(''), cls: cell.cls });
		cursor = end;
	}

	if (cursor < width) {
		segs.push({ text: chars.slice(cursor).join('') });
	}

	return segs;
}

/** A labeled frame edge as segments, so the label can take its own class. */
export function labeledEdgeSegs(width: number, label: string): ArtSeg[] {
	const [before, overlay, after] = splitLabeledEdge(width, label);
	return [{ text: before }, { text: overlay, cls: 'title' }, { text: after }];
}
