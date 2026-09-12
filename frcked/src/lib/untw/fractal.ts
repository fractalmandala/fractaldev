// Nearest-neighbour fractalstyler suggestions for Tailwind cores.
// V1 heuristic: Tailwind spacing is fixed (N * 4px), fractal space is fluid, so
// these are eyeballing aids, not a migration. Returns null when there is none.

const EXACT: Record<string, string> = {
	flex: 'row',
	'inline-flex': 'row',
	'flex-col': 'box',
	'flex-row': 'row',
	'items-center': 'ycenter',
	'justify-center': 'xcenter',
	'justify-between': 'xbetween',
	block: 'box',
	grid: 'grid',
	relative: 'relative',
	absolute: 'absolute',
	fixed: 'fixed',
	sticky: 'sticky',
	border: 'border',
	'shadow-sm': 'shadow-sm',
	'shadow-md': 'shadow-md',
	'shadow-lg': 'shadow-lg',
	'rounded-full': 'radius-full',
	truncate: 'truncate'
};

/** Tailwind spacing step N -> px (scale is N * 4px). */
export function spacingPx(core: string): number | null {
	const m = core.match(
		/^(?:-?[mp][trblxyse]?|gap(?:-x|-y)?|space-[xy]|inset(?:-x|-y)?|top|right|bottom|left|start|end|basis|w|h|min-w|max-w|min-h|max-h|size)-(\d+(?:\.\d+)?)$/
	);
	if (!m) return null;
	const neg = core.startsWith('-') ? -1 : 1;
	return parseFloat(m[1]) * 4 * neg;
}

/** Nearest fractal space preset for a px magnitude (fluid scale: approximate). */
export function fractalSpace(px: number): string {
	const a = Math.abs(px);
	if (a <= 1) return '2xs';
	if (a <= 4) return 'xs';
	if (a <= 8) return 'sm';
	if (a <= 12) return 'md';
	if (a <= 20) return 'bs';
	if (a <= 28) return 'lg';
	if (a <= 40) return 'xl';
	if (a <= 56) return '2xl';
	return '3xl';
}

/** Suggest a fractal class for a Tailwind core token, or null. */
export function suggestFractal(core: string): string | null {
	if (EXACT[core]) return EXACT[core];
	const px = spacingPx(core);
	if (px !== null) {
		const step = fractalSpace(px);
		if (/^p-/.test(core)) return `pad-${step}`;
		if (/^px-/.test(core)) return `pad-x-${step}`;
		if (/^py-/.test(core)) return `pad-y-${step}`;
		if (/^pt-/.test(core)) return `pad-top-${step}`;
		if (/^pr-/.test(core)) return `pad-right-${step}`;
		if (/^pb-/.test(core)) return `pad-bottom-${step}`;
		if (/^pl-/.test(core)) return `pad-left-${step}`;
		if (/^m-/.test(core)) return `marg-${step}`;
		if (/^gap/.test(core)) return `gap-${step}`;
	}
	const r = core.match(/^rounded-(xs|sm|md|lg|xl|2xl|3xl)$/);
	if (r) {
		const map: Record<string, string> = {
			xs: 'radius-2',
			sm: 'radius-4',
			md: 'radius-8',
			lg: 'radius-12',
			xl: 'radius-16',
			'2xl': 'radius-24',
			'3xl': 'radius-24'
		};
		return map[r[1]] ?? null;
	}
	if (/^text-(xs|sm|md|lg|xl|2xl|3xl|4xl)$/.test(core)) return core;
	if (core === 'font-mono') return 'mono';
	if (core === 'font-medium') return 'weight-500';
	if (core === 'font-semibold') return 'weight-600';
	if (core === 'font-bold') return 'weight-700';
	return null;
}
