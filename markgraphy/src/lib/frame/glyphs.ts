/*
 * Glyph sets and intensity math, ported from markdown-graphs.
 * Glyphs draw the chart — no SVG, no canvas.
 */

export const GLYPH_SETS = {
	shade: ['·', '░', '▒', '▓', '█'],
	ascii: ['.', '-', '=', '#', '@'],
	hash: ['.', ':', '+', '#', '█'],
	bar: ['▁', '▂', '▃', '▅', '█']
} as const;

export type GlyphSetName = keyof typeof GLYPH_SETS;
export type Glyphs = GlyphSetName | readonly string[];

export const INTENSITY_GLYPHS: readonly string[] = GLYPH_SETS.shade;

export function clamp01(value: number) {
	return Math.min(1, Math.max(0, value));
}

export function resolveGlyphs(glyphs?: Glyphs): readonly string[] {
	if (glyphs == null) {
		return GLYPH_SETS.shade;
	}

	if (typeof glyphs === 'string') {
		return GLYPH_SETS[glyphs] ?? GLYPH_SETS.shade;
	}

	return glyphs.length > 0 ? glyphs : GLYPH_SETS.shade;
}

export function trackMarks(
	glyphs?: Glyphs,
	fallback: { empty: string; rest: string; fill: string } = {
		empty: '-',
		rest: '░',
		fill: '█'
	}
) {
	if (glyphs == null) {
		return fallback;
	}

	const set = resolveGlyphs(glyphs);
	const last = set.length - 1;

	return {
		empty: set[0] ?? fallback.empty,
		rest: set[Math.min(1, last)] ?? fallback.rest,
		fill: set[last] ?? fallback.fill
	};
}

export function intensityLevel(value: number, max: number) {
	if (value <= 0 || max <= 0) {
		return 0;
	}

	return Math.max(1, Math.round(clamp01(value / max) * 4));
}

export function intensityGlyph(
	level: number,
	glyphs: readonly string[] = INTENSITY_GLYPHS
) {
	if (glyphs.length === 0) {
		return '·';
	}

	const clamped = Math.min(4, Math.max(0, Math.round(level)));
	const index = Math.round((clamped / 4) * (glyphs.length - 1));
	return glyphs[index] ?? glyphs[0] ?? '·';
}
