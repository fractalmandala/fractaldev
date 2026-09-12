// Decode orchestration: code (+ optional theme css) -> structured result.
// Pure TypeScript, zero dependencies.

import { extractBlocks, uniqueTokens, isDynamic } from '$lib/untw/extract';
import { resolveToken, type Resolved } from '$lib/untw/resolve';
import { parseTheme, emptyTheme, type ThemeInfo } from './theme';
import type { ClassBlock } from '$lib/untw/extract';

export interface Marker {
	anchor: string;
	usedBy: string[];
}

export interface DecodeResult {
	blocks: ClassBlock[];
	tokens: Resolved[];
	summary: Record<string, string[]>;
	unknowns: Resolved[];
	unresolvable: string[];
	markers: Marker[];
	/** pasted-theme mode? */
	themed: boolean;
	theme: ThemeInfo;
	blockCount: number;
	tokenCount: number;
	unknownCount: number;
}

export function decode(code: string, themeCss = ''): DecodeResult {
	const theme = themeCss.trim() ? parseTheme(themeCss) : emptyTheme();
	const blocks = extractBlocks(code);
	const all = uniqueTokens(blocks);
	const tokens = all.map((t) => resolveToken(t, theme));
	const summary: Record<string, string[]> = {};
	for (const t of tokens) {
		if (t.unknown || t.marker) continue;
		(summary[t.category] ??= []).push(t.token);
	}
	const unknowns = tokens.filter((t) => t.unknown && !isDynamic(t.token));
	const unresolvable = tokens.filter((t) => isDynamic(t.token)).map((t) => t.token);
	const markers: Marker[] = tokens
		.filter((t) => t.marker)
		.map((m) => {
			const name = m.core === 'group' ? '' : m.core.slice('group/'.length);
			// Unnamed `group` anchors are read by `group-*` variants without a
			// /name suffix; named `group/foo` anchors by `group-*/foo` variants.
			const readsAnchor = (v: string): boolean => {
				if (v === 'group') return true;
				if (!v.startsWith('group-')) return false;
				if (!name) return !v.includes('/');
				return v.endsWith(`/${name}`);
			};
			const usedBy = tokens
				.filter((t) => !t.marker && t.variants.some(readsAnchor))
				.map((t) => t.token);
			return { anchor: m.token, usedBy };
		});
	return {
		blocks,
		tokens,
		summary,
		unknowns,
		unresolvable,
		markers,
		themed: themeCss.trim().length > 0,
		theme,
		blockCount: blocks.length,
		tokenCount: tokens.length,
		unknownCount: unknowns.length
	};
}

/** Copy-ready plain-text summary. */
export function summaryText(r: DecodeResult): string {
	const order = [
		'Layout',
		'Spacing',
		'Sizing',
		'Border',
		'Typography',
		'Surface',
		'Effect',
		'State',
		'Other'
	];
	const lines = order
		.filter((c) => r.summary[c]?.length)
		.map((c) => `${c}: ${r.summary[c].join(' ')}`);
	if (r.unknowns.length) lines.push(`Unknown: ${r.unknowns.map((t) => t.token).join(' ')}`);
	return lines.join('\n');
}

/** Per-token `token -> declarations` lines for copy. */
export function tokenLines(r: DecodeResult): string {
	return r.tokens
		.filter((t) => !t.unknown && !t.marker)
		.map(
			(t) => `${t.token} -> ${t.css}${t.conditions.length ? `  [${t.conditions.join('; ')}]` : ''}`
		)
		.join('\n');
}
