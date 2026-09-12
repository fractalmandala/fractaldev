// twdecode/fractal-map.ts — bridge pebble: Tailwind core -> approx fractalstyler class.
// V1 HEURISTIC, not exact: Tailwind spacing is fixed (N*4px), fractal space is fluid
// clamps. Values below are nearest-neighbour suggestions for eyeballing, not a migration.

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
	'bg-white': 'surface',
	truncate: 'truncate'
};

/** Tailwind spacing step N -> px (spacing scale is N * 4px). */
export function spacingPx(core: string): number | null {
	const m = core.match(/^(?:[mp][trblxy]?|gap|space-x|space-y)-(\d+(?:\.\d+)?)$/);
	if (!m) return null;
	return parseFloat(m[1]) * 4;
}

/** Nearest fractal space preset for a px value (fluid scale, so approximate). */
export function fractalSpace(px: number): string {
	if (px <= 1) return '2xs';
	if (px <= 4) return 'xs';
	if (px <= 8) return 'sm';
	if (px <= 12) return 'md';
	if (px <= 20) return 'bs';
	if (px <= 28) return 'lg';
	if (px <= 40) return 'xl';
	if (px <= 56) return '2xl';
	return '3xl';
}

/** Suggest a fractal class for a Tailwind core token, or null when there is none. */
export function suggestFractal(core: string): string | null {
	if (EXACT[core]) return EXACT[core];
	const px = spacingPx(core);
	if (px !== null) {
		const step = fractalSpace(px);
		if (core.startsWith('p-')) return `pad-${step}`;
		if (core.startsWith('px-')) return `pad-x-${step}`;
		if (core.startsWith('py-')) return `pad-y-${step}`;
		if (core.startsWith('pt-')) return `pad-top-${step}`;
		if (core.startsWith('pr-')) return `pad-right-${step}`;
		if (core.startsWith('pb-')) return `pad-bottom-${step}`;
		if (core.startsWith('pl-')) return `pad-left-${step}`;
		if (core.startsWith('m-')) return `marg-${step}`;
		if (core.startsWith('gap-')) return `gap-${step}`;
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
	if (/^text-(xs|sm|md|lg|xl|2xl|3xl|4xl)$/.test(core)) return core; // same names exist
	if (/^font-(mono)$/.test(core)) return 'mono';
	if (core === 'font-medium') return 'weight-500';
	if (core === 'font-semibold') return 'weight-600';
	if (core === 'font-bold') return 'weight-700';
	return null;
}
