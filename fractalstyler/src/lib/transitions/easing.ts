/**
 * One easing vocabulary, shared by every animation in the kit so a curve name
 * means the same thing whether CSS runs it or JS solves it per frame.
 */
export const EASINGS = {
	linear: 'linear',
	'out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
	'out-cubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
	'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
	'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
	'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
	'in-cubic': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
	/** Quantised — for readouts that should tick rather than glide. */
	stepped: 'steps(8, end)'
} as const;

export type EasingName = keyof typeof EASINGS;

/** A name from `EASINGS`, or any raw CSS timing function. */
export type Easing = EasingName | (string & {});

/** Resolve an easing to a CSS timing function. */
export function easingValue(easing: Easing = 'out-cubic'): string {
	return EASINGS[easing as EasingName] ?? easing;
}

/**
 * Solve a cubic-bezier for y at x: Newton-Raphson, with a bisection fallback
 * for the flat-sloped curves Newton cannot land.
 */
function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
	const cx = 3 * x1;
	const bx = 3 * (x2 - x1) - cx;
	const ax = 1 - cx - bx;
	const cy = 3 * y1;
	const by = 3 * (y2 - y1) - cy;
	const ay = 1 - cy - by;

	const sampleX = (t: number): number => ((ax * t + bx) * t + cx) * t;
	const sampleY = (t: number): number => ((ay * t + by) * t + cy) * t;
	const slopeX = (t: number): number => (3 * ax * t + 2 * bx) * t + cx;

	return (x: number): number => {
		if (x <= 0) return 0;
		if (x >= 1) return 1;

		let t = x;

		for (let i = 0; i < 8; i++) {
			const error = sampleX(t) - x;
			if (Math.abs(error) < 1e-5) return sampleY(t);

			const slope = slopeX(t);
			if (Math.abs(slope) < 1e-6) break;

			t -= error / slope;
		}

		let low = 0;
		let high = 1;
		t = x;

		for (let i = 0; i < 24 && high - low > 1e-7; i++) {
			const error = sampleX(t) - x;
			if (Math.abs(error) < 1e-5) break;

			if (error > 0) high = t;
			else low = t;

			t = (low + high) / 2;
		}

		return sampleY(t);
	};
}

const BEZIER =
	/^cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/;
const STEPS = /^steps\(\s*(\d+)\s*(?:,\s*(start|end|jump-\w+)\s*)?\)$/;

const solved = new Map<string, (t: number) => number>();

/** The same easing as a plain function of progress, for per-frame interpolation. */
export function easingFn(easing: Easing = 'out-cubic'): (t: number) => number {
	const value = easingValue(easing);
	const cached = solved.get(value);

	if (cached) return cached;

	let fn: (t: number) => number = (t) => t;
	const bezier = BEZIER.exec(value);
	const steps = STEPS.exec(value);

	if (bezier) {
		fn = cubicBezier(Number(bezier[1]), Number(bezier[2]), Number(bezier[3]), Number(bezier[4]));
	} else if (steps) {
		const count = Number(steps[1]);
		const fromStart = steps[2] === 'start';

		fn = (t) =>
			Math.min(1, Math.max(0, (fromStart ? Math.ceil(t * count) : Math.floor(t * count)) / count));
	}

	solved.set(value, fn);

	return fn;
}
