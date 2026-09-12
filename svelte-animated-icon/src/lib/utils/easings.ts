// Easing presets + cubic-bezier helpers. The animation engine is WAAPI (CSS easings),
// so every preset is the cubic-bezier(x1,y1,x2,y2) form (values from easings.net) — which
// WAAPI accepts directly, including y outside [0,1] for the Back overshoots. Bounce/elastic
// are intentionally absent: they can't be expressed as a single cubic-bezier.

export type Bezier = [number, number, number, number];

export interface EasingPreset {
	id: string;
	label: string;
	group: string;
	bezier: Bezier;
}

export const EASING_PRESETS: EasingPreset[] = [
	{ id: 'linear', label: 'linear', group: 'CSS standard', bezier: [0, 0, 1, 1] },
	{ id: 'ease', label: 'ease', group: 'CSS standard', bezier: [0.25, 0.1, 0.25, 1] },
	{ id: 'ease-in', label: 'ease-in', group: 'CSS standard', bezier: [0.42, 0, 1, 1] },
	{ id: 'ease-out', label: 'ease-out', group: 'CSS standard', bezier: [0, 0, 0.58, 1] },
	{ id: 'ease-in-out', label: 'ease-in-out', group: 'CSS standard', bezier: [0.42, 0, 0.58, 1] },

	{ id: 'easeInSine', label: 'easeInSine', group: 'Sine', bezier: [0.12, 0, 0.39, 0] },
	{ id: 'easeOutSine', label: 'easeOutSine', group: 'Sine', bezier: [0.61, 1, 0.88, 1] },
	{ id: 'easeInOutSine', label: 'easeInOutSine', group: 'Sine', bezier: [0.37, 0, 0.63, 1] },

	{ id: 'easeInQuad', label: 'easeInQuad', group: 'Quad', bezier: [0.11, 0, 0.5, 0] },
	{ id: 'easeOutQuad', label: 'easeOutQuad', group: 'Quad', bezier: [0.5, 1, 0.89, 1] },
	{ id: 'easeInOutQuad', label: 'easeInOutQuad', group: 'Quad', bezier: [0.45, 0, 0.55, 1] },

	{ id: 'easeInCubic', label: 'easeInCubic', group: 'Cubic', bezier: [0.32, 0, 0.67, 0] },
	{ id: 'easeOutCubic', label: 'easeOutCubic', group: 'Cubic', bezier: [0.33, 1, 0.68, 1] },
	{ id: 'easeInOutCubic', label: 'easeInOutCubic', group: 'Cubic', bezier: [0.65, 0, 0.35, 1] },

	{ id: 'easeInQuart', label: 'easeInQuart', group: 'Quart', bezier: [0.5, 0, 0.75, 0] },
	{ id: 'easeOutQuart', label: 'easeOutQuart', group: 'Quart', bezier: [0.25, 1, 0.5, 1] },
	{ id: 'easeInOutQuart', label: 'easeInOutQuart', group: 'Quart', bezier: [0.76, 0, 0.24, 1] },

	{ id: 'easeInQuint', label: 'easeInQuint', group: 'Quint', bezier: [0.64, 0, 0.78, 0] },
	{ id: 'easeOutQuint', label: 'easeOutQuint', group: 'Quint', bezier: [0.22, 1, 0.36, 1] },
	{ id: 'easeInOutQuint', label: 'easeInOutQuint', group: 'Quint', bezier: [0.83, 0, 0.17, 1] },

	{ id: 'easeInExpo', label: 'easeInExpo', group: 'Expo', bezier: [0.7, 0, 0.84, 0] },
	{ id: 'easeOutExpo', label: 'easeOutExpo', group: 'Expo', bezier: [0.16, 1, 0.3, 1] },
	{ id: 'easeInOutExpo', label: 'easeInOutExpo', group: 'Expo', bezier: [0.87, 0, 0.13, 1] },

	{ id: 'easeInCirc', label: 'easeInCirc', group: 'Circ', bezier: [0.55, 0, 1, 0.45] },
	{ id: 'easeOutCirc', label: 'easeOutCirc', group: 'Circ', bezier: [0, 0.55, 0.45, 1] },
	{ id: 'easeInOutCirc', label: 'easeInOutCirc', group: 'Circ', bezier: [0.85, 0, 0.15, 1] },

	{ id: 'easeInBack', label: 'easeInBack', group: 'Back', bezier: [0.36, 0, 0.66, -0.56] },
	{ id: 'easeOutBack', label: 'easeOutBack', group: 'Back', bezier: [0.34, 1.56, 0.64, 1] },
	{ id: 'easeInOutBack', label: 'easeInOutBack', group: 'Back', bezier: [0.68, -0.6, 0.32, 1.6] }
];

/** Preset groups in display order, each with its presets. */
export const EASING_GROUPS: { group: string; presets: EasingPreset[] }[] = EASING_PRESETS.reduce(
	(acc, p) => {
		let g = acc.find((x) => x.group === p.group);
		if (!g) {
			g = { group: p.group, presets: [] };
			acc.push(g);
		}
		g.presets.push(p);
		return acc;
	},
	[] as { group: string; presets: EasingPreset[] }[]
);

const r2 = (n: number): number => Math.round(n * 100) / 100;

export function bezierCss(b: Bezier): string {
	return `cubic-bezier(${r2(b[0])}, ${r2(b[1])}, ${r2(b[2])}, ${r2(b[3])})`;
}

/** Find the preset whose bezier matches (within tolerance), or null for a custom curve. */
export function matchPreset(b: Bezier): EasingPreset | null {
	return EASING_PRESETS.find((p) => p.bezier.every((v, i) => Math.abs(v - b[i]) < 0.005)) ?? null;
}

export const DEFAULT_BEZIER: Bezier = [0.25, 0.1, 0.25, 1]; // = ease
