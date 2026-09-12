/*
 * ASCII and Unicode diagram tokenizer, ported from fractalsvelte.
 * Formats box-drawing lines, titles, arrows, and glyphs into styled spans.
 * The spans are plain class names — AsciiDiagram supplies the colors through
 * the --graph-* variables. Input is HTML-escaped before tokenizing, so the
 * formatted output is safe to inject with {@html}.
 */

// Regex patterns for the diagram elements we recognize.
const TITLE_PATTERN = /\[\s*[A-Z0-9\s_\-\.·:]+\s*\]/g;
const GLYPH_BLOCKS = /[▂▃▄▅▆▇█░▒▓■□▪▫◆◇●○•]/g;

export function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

export interface DiagramToken {
	type: 'box' | 'title' | 'arrow' | 'glyph' | 'accent' | 'text';
	content: string;
}

export interface HighlightRule {
	pattern: RegExp;
	className: string;
}

/**
 * Parses a raw text diagram into safe, syntax-highlighted HTML spans.
 * Callers style the .diag-* classes; AsciiDiagram is the reference skin.
 */
export function formatDiagramHtml(rawText: string, customAccentPattern?: RegExp): string {
	const lines = rawText.split('\n');

	const processedLines = lines.map((line) => {
		if (!line.trim()) {
			return '';
		}

		// Escape first, then match against the escaped forms of < and >.
		let escaped = escapeHtml(line);

		escaped = escaped.replace(TITLE_PATTERN, (match) => {
			return `<span class="diag-title">${match}</span>`;
		});

		const escapedArrowPattern =
			/(?:~&gt;|-&gt;|--&gt;|&lt;-|&lt;--|&lt;-&gt;|&lt;=|=&gt;|◀\s*-\s*▶|◀-▶|◀|▶|▼|▲|▷|◁|▸|◂|→|←|↑|↓|↔|↕|↖|↗|↘|↙)/g;
		escaped = escaped.replace(escapedArrowPattern, (match) => {
			return `<span class="diag-arrow">${match}</span>`;
		});

		if (customAccentPattern) {
			escaped = escaped.replace(customAccentPattern, (match) => {
				return `<span class="diag-accent">${match}</span>`;
			});
		}

		escaped = escaped.replace(GLYPH_BLOCKS, (match) => {
			return `<span class="diag-glyph">${match}</span>`;
		});

		// Rounded corners and junctions get their own class.
		const roundedCorners = /[╭╮╯╰┏┓┗┛╔╗╚╝]/g;
		escaped = escaped.replace(roundedCorners, (match) => {
			return `<span class="diag-corner">${match}</span>`;
		});

		const boxBorderChars = /[┌┐└┘├┤┬┴┼─│━┃═║]/g;
		escaped = escaped.replace(boxBorderChars, (match) => {
			return `<span class="diag-box">${match}</span>`;
		});

		return escaped;
	});

	return processedLines.join('\n');
}

/** Pads or trims every line to a shared width so box borders line up. */
export function alignBoxLines(text: string, targetWidth?: number): string {
	const lines = text.split('\n');
	const maxWidth = targetWidth ?? Math.max(...lines.map((l) => l.length));

	return lines
		.map((line) => {
			if (line.length < maxWidth) {
				return line + ' '.repeat(maxWidth - line.length);
			}
			return line;
		})
		.join('\n');
}
