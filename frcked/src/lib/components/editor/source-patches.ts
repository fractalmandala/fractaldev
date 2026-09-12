import type { ManualEditStyles, BreakpointScope } from './types';

export interface SourcePatch {
	id: string;
	kind: 'set-outer-html' | 'set-style' | 'delete';
	html?: string;
	styles?: Partial<ManualEditStyles>;
	scope?: BreakpointScope;
}

function camelToKebab(str: string): string {
	return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

const lengthProps = [
	'font-size', 'border-radius', 'border-width', 'width', 'height',
	'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
	'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
	'gap', 'letter-spacing'
];

function serializeStyles(styles: Partial<ManualEditStyles>): string {
	const entries = Object.entries(styles)
		.filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
		.map(([k, rawVal]) => {
			const cssKey = camelToKebab(k);
			let val = String(rawVal).trim();
			if (lengthProps.includes(cssKey) && /^-?\d+(\.\d+)?$/.test(val)) {
				val = `${val}px`;
			}
			return `${cssKey}: ${val}`;
		});
	if (styles.borderRadius) {
		entries.push('overflow: hidden');
	}
	return entries.join('; ');
}

export function applySourcePatch(sourceHtml: string, patch: SourcePatch): string {
	if (!patch.id) return sourceHtml;

	// Look for data-od-id="<id>"
	const attrPattern = `data-od-id="${patch.id}"`;
	const idIndex = sourceHtml.indexOf(attrPattern);
	if (idIndex === -1) return sourceHtml;

	// Backtrack to opening '<' of this element
	const tagStart = sourceHtml.lastIndexOf('<', idIndex);
	if (tagStart === -1) return sourceHtml;

	// Check tag name
	const tagMatch = sourceHtml.slice(tagStart).match(/^<([a-zA-Z0-9-]+)/);
	if (!tagMatch) return sourceHtml;
	const tagName = tagMatch[1];

	// Find the end of the opening tag
	const openTagEnd = sourceHtml.indexOf('>', idIndex);
	if (openTagEnd === -1) return sourceHtml;

	// Self-closing tag check
	const isSelfClosing = sourceHtml[openTagEnd - 1] === '/';

	let fullEnd = openTagEnd + 1;

	if (!isSelfClosing) {
		// Find matching closing tag </tagName> taking nesting into account
		const openTagStr = `<${tagName}`;
		const closeTagStr = `</${tagName}>`;
		let depth = 1;
		let cursor = openTagEnd + 1;

		while (depth > 0 && cursor < sourceHtml.length) {
			const nextOpen = sourceHtml.indexOf(openTagStr, cursor);
			const nextClose = sourceHtml.indexOf(closeTagStr, cursor);

			if (nextClose === -1) {
				// Fallback to first closing tag if unbalanced
				cursor = sourceHtml.length;
				break;
			}

			if (nextOpen !== -1 && nextOpen < nextClose) {
				depth++;
				cursor = nextOpen + openTagStr.length;
			} else {
				depth--;
				if (depth === 0) {
					fullEnd = nextClose + closeTagStr.length;
					break;
				}
				cursor = nextClose + closeTagStr.length;
			}
		}
	}

	if (patch.kind === 'set-outer-html' && patch.html !== undefined) {
		return sourceHtml.slice(0, tagStart) + patch.html + sourceHtml.slice(fullEnd);
	}

	if (patch.kind === 'delete') {
		return sourceHtml.slice(0, tagStart) + sourceHtml.slice(fullEnd);
	}

	if (patch.kind === 'set-style' && patch.styles) {
		if (patch.scope && patch.scope !== 'base') {
			const bp = patch.scope === 'mobile' ? '480px' : '768px';
			const selector = `[data-od-id="${patch.id}"]`;
			const nextSerialized = serializeStyles(patch.styles);
			const mediaRule = `  @media (max-width: ${bp}) {\n    ${selector} {\n      ${nextSerialized.split('; ').join(';\n      ')};\n    }\n  }`;

			const styleRegex = /<style\s+id="od-responsive-overrides"[^>]*>([\s\S]*?)<\/style>/i;
			const match = sourceHtml.match(styleRegex);

			if (match) {
				const inner = match[1];
				const updatedStyleBlock = `<style id="od-responsive-overrides">${inner.trimEnd()}\n${mediaRule}\n  </style>`;
				return sourceHtml.replace(match[0], updatedStyleBlock);
			} else {
				const newBlock = `\n  <style id="od-responsive-overrides">\n${mediaRule}\n  </style>\n`;
				if (sourceHtml.includes('</head>')) {
					return sourceHtml.replace('</head>', `${newBlock}</head>`);
				}
				if (sourceHtml.includes('<body')) {
					return sourceHtml.replace(/<body[^>]*>/, (m) => `${newBlock}${m}`);
				}
				return newBlock + sourceHtml;
			}
		}

		const openTagContent = sourceHtml.slice(tagStart, openTagEnd);
		const styleRegex = /style="([^"]*)"/;
		const styleMatch = openTagContent.match(styleRegex);

		let newOpenTag: string;
		const nextSerialized = serializeStyles(patch.styles);

		if (styleMatch) {
			newOpenTag = openTagContent.replace(styleRegex, `style="${nextSerialized}"`);
		} else {
			newOpenTag = `${openTagContent} style="${nextSerialized}"`;
		}

		return sourceHtml.slice(0, tagStart) + newOpenTag + sourceHtml.slice(openTagEnd);
	}

	return sourceHtml;
}
