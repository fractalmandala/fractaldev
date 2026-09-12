/*
 * Color-role logic, ported from markdown-graphs' series/intensity classes.
 * Roles map to scoped classes inside each graph component:
 *   .c-accent / .c-accent2 / .c-accent3 / .c-muted / .c-faint / .c-frame / .c-fg
 * backed by the --graph-* variables. Default is one accent.
 */

export type GraphPalette = 'mono' | 'duo' | 'multi';

export type ToneRole = 'empty' | 'muted' | 'foreground' | 'accent' | 'accent2' | 'accent3';

export function isMonoPalette(palette?: GraphPalette) {
	return palette == null || palette === 'mono';
}

/** Intensity level (0–4) → color role. Mirrors intensityClass from the reference. */
export function intensityRole(level: number, palette: GraphPalette = 'mono'): ToneRole {
	const index = Math.min(4, Math.max(0, Math.round(level)));

	if (index <= 0) {
		return 'empty';
	}

	if (palette === 'multi') {
		if (index === 1) {
			return 'accent2';
		}

		if (index <= 3) {
			return 'accent3';
		}

		return 'accent';
	}

	if (palette === 'duo') {
		if (index <= 2) {
			return 'accent2';
		}

		return 'accent';
	}

	if (index <= 2) {
		return 'muted';
	}

	if (index === 3) {
		return 'foreground';
	}

	return 'accent';
}

const SERIES_ROLES: ToneRole[] = ['accent', 'accent2', 'accent3'];

/** Series index → color role. Mirrors seriesClass from the reference. */
export function seriesRole(palette: GraphPalette | undefined, index: number): ToneRole {
	if (isMonoPalette(palette)) {
		return index === 0 ? 'accent' : 'foreground';
	}

	const count = palette === 'duo' ? 2 : 3;
	return SERIES_ROLES[index % count];
}

/** Whether a series should recede (mono palette, not highlighted). */
export function isDim(palette: GraphPalette | undefined, highlighted: boolean) {
	return isMonoPalette(palette) && !highlighted;
}

/** Semantic role → color role. Mirrors toneClass from the reference. */
export function toneRole(
	palette: GraphPalette | undefined,
	role: 'primary' | 'secondary' | 'idle' | 'empty'
): ToneRole {
	if (role === 'empty') {
		return 'empty';
	}

	if (role === 'idle') {
		return 'muted';
	}

	if (role === 'primary') {
		return 'accent';
	}

	return isMonoPalette(palette) ? 'muted' : 'accent2';
}
