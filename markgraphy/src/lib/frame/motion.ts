import './motion.css';

/* ── easing ──────────────────────────────────────────────────────── */

/**
 * The house easing vocabulary. Shared by the CSS-driven actions and the
 * frame-driven ones, so `easing: 'out-expo'` means the same curve whether it
 * is handed to a transition or the curve is solved per frame by `countUp`.
 */
export const EASINGS = {
	linear: 'linear',
	'out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
	'out-cubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
	'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
	'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
	'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
	'in-cubic': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
	/** Quantised, for readouts that should tick rather than glide. */
	stepped: 'steps(8, end)'
} as const;

export type EasingName = keyof typeof EASINGS;

/** A name from `EASINGS`, or any raw CSS timing function. */
export type Easing = EasingName | (string & {});

export const EASE_OUT_CUBIC = EASINGS['out-cubic'];

export const DIM_OPACITY = 0.4;

/** Resolve an easing to a CSS timing function. */
export function easingValue(easing: Easing = 'out-cubic'): string {
	return EASINGS[easing as EasingName] ?? easing;
}

/**
 * Solve a cubic-bezier for y at x, Newton-Raphson first with a bisection
 * fallback for the flat-sloped curves Newton cannot land.
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
		if (x <= 0) {
			return 0;
		}

		if (x >= 1) {
			return 1;
		}

		let t = x;

		for (let i = 0; i < 8; i++) {
			const error = sampleX(t) - x;

			if (Math.abs(error) < 1e-5) {
				return sampleY(t);
			}

			const slope = slopeX(t);

			if (Math.abs(slope) < 1e-6) {
				break;
			}

			t -= error / slope;
		}

		let low = 0;
		let high = 1;
		t = x;

		for (let i = 0; i < 24 && high - low > 1e-7; i++) {
			const error = sampleX(t) - x;

			if (Math.abs(error) < 1e-5) {
				break;
			}

			if (error > 0) {
				high = t;
			} else {
				low = t;
			}

			t = (low + high) / 2;
		}

		return sampleY(t);
	};
}

const BEZIER =
	/^cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/;
const STEPS = /^steps\(\s*(\d+)\s*(?:,\s*(start|end|jump-\w+)\s*)?\)$/;

const solved = new Map<string, (t: number) => number>();

/**
 * The same easing as a plain function of progress, for the actions that
 * interpolate per frame instead of handing the curve to CSS.
 */
export function easingFn(easing: Easing = 'out-cubic'): (t: number) => number {
	const value = easingValue(easing);
	const cached = solved.get(value);

	if (cached) {
		return cached;
	}

	let fn: (t: number) => number = (t) => t;
	const bezier = BEZIER.exec(value);
	const steps = STEPS.exec(value);

	if (bezier) {
		fn = cubicBezier(Number(bezier[1]), Number(bezier[2]), Number(bezier[3]), Number(bezier[4]));
	} else if (steps) {
		const count = Number(steps[1]);
		const fromStart = steps[2] === 'start';

		fn = (t) => Math.min(1, Math.max(0, (fromStart ? Math.ceil(t * count) : Math.floor(t * count)) / count));
	}

	solved.set(value, fn);

	return fn;
}

/* ── shared plumbing ─────────────────────────────────────────────── */

export function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

/** Stagger delay for index `i`, capped so a long list never crawls. */
export function stagger(index: number, step = 40, cap = 280): number {
	return Math.min(index * step, cap);
}

export interface Action {
	destroy(): void;
}

const NOOP: Action = { destroy() {} };

interface WatchOptions {
	amount?: number;
	once?: boolean;
	margin?: string;
}

/**
 * Every action below starts when the element scrolls into view. This is the
 * one place that decides what "in view" means.
 */
function watch(
	node: HTMLElement,
	{ amount = 0.25, once = true, margin }: WatchOptions,
	enter: () => void,
	leave?: () => void
): Action {
	if (typeof IntersectionObserver === 'undefined') {
		enter();

		return NOOP;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					enter();

					if (once) {
						observer.disconnect();
					}
				} else if (!once) {
					leave?.();
				}
			}
		},
		{ threshold: amount, rootMargin: margin }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}

/** Apply the duration/delay/easing trio that every action shares. */
function applyTiming(
	node: HTMLElement,
	duration: number,
	delay: number,
	easing: Easing | undefined
): void {
	node.style.setProperty('--mg-duration', `${duration}ms`);
	node.style.setProperty('--mg-delay', `${delay}ms`);

	if (easing !== undefined) {
		node.style.setProperty('--mg-ease', easingValue(easing));
	}
}

/* ── actions ─────────────────────────────────────────────────────── */

export interface InViewOptions extends WatchOptions {
	onenter?: (node: HTMLElement) => void;
	onleave?: (node: HTMLElement) => void;
}

/**
 * The bare observer, for motion the built-in actions do not cover.
 *
 * <div use:inView={{ onenter: () => (lit = true) }}>
 */
export function inView(node: HTMLElement, options: InViewOptions = {}): Action {
	return watch(
		node,
		options,
		() => options.onenter?.(node),
		() => options.onleave?.(node)
	);
}

/** Where a revealed element starts before it settles. */
export type RevealFrom = 'below' | 'above' | 'left' | 'right' | 'none';

/**
 * How an element arrives.
 * - `fly`   travels in and fades. The default, and the house norm.
 * - `fade`  dissolves in place; `from` and `distance` are ignored.
 * - `slide` travels in at full opacity from behind its own edge, clipped so it
 *           appears to emerge from under the layout rather than float in.
 * - `scale` grows into place and fades; `from` still offsets it if you want both.
 */
export type RevealType = 'fly' | 'fade' | 'slide' | 'scale';

/** px as a number, or any CSS length — `'100%'`, `'2rem'`, `'6ch'`. */
export type Distance = number | string;

export interface RevealOptions {
	/** How it arrives. Default 'fly'. */
	type?: RevealType;
	/** Delay in ms. Use `stagger()`. */
	delay?: number;
	/** IntersectionObserver threshold (0–1). Default 0.25. */
	amount?: number;
	/** Travel distance. Default 8px, or 100% for 'slide'. */
	distance?: Distance;
	/** Offset in px. Superseded by `distance`, kept for older call sites. */
	y?: number;
	/** Which side it travels from. Default 'below'. */
	from?: RevealFrom;
	/** Starting scale. Default 1, or 0.94 for 'scale'. */
	scale?: number;
	/** Duration in ms. Default 220. */
	duration?: number;
	/** Curve. Default 'out-cubic'. */
	easing?: Easing;
	/** Reveal once only. Default true. */
	once?: boolean;
}

/** Clip the element to nothing against the edge it travels from. */
const SLIDE_CLIP: Record<RevealFrom, string> = {
	below: 'inset(100% 0 0 0)',
	above: 'inset(0 0 100% 0)',
	left: 'inset(0 100% 0 0)',
	right: 'inset(0 0 0 100%)',
	none: 'inset(0 0 0 0)'
};

/** Negate a length, whatever unit it carries. */
function negate(distance: Distance): string {
	if (typeof distance === 'number') {
		return `${-distance}px`;
	}

	return distance.startsWith('-') ? distance.slice(1) : `-${distance}`;
}

function length(distance: Distance): string {
	return typeof distance === 'number' ? `${distance}px` : distance;
}

/**
 * Svelte action: reveal an element when it enters the viewport.
 * Stagger rows, weeks, or lists — never hundreds of individual cells.
 *
 * <div use:reveal={{ delay: stagger(i, 40), from: 'left', easing: 'out-expo' }}>
 * <h2 use:reveal={{ type: 'slide' }}>
 * <img use:reveal={{ type: 'scale', scale: 0.9 }}>
 */
export function reveal(node: HTMLElement, options: RevealOptions = {}): Action {
	const {
		type = 'fly',
		delay = 0,
		amount = 0.25,
		from = 'below',
		duration = 220,
		easing,
		once = true
	} = options;

	if (prefersReducedMotion()) {
		return NOOP;
	}

	// Each type only changes what the defaults are; the mechanics are shared.
	const moves = type !== 'fade' && from !== 'none';
	const distance = options.distance ?? options.y ?? (type === 'slide' ? '100%' : 8);
	const scale = options.scale ?? (type === 'scale' ? 0.94 : 1);

	const travel = moves && type !== 'scale' ? distance : options.distance ?? options.y ?? 0;
	const back = negate(travel);
	const forward = length(travel);

	const x = from === 'left' ? back : from === 'right' ? forward : '0px';
	const y = from === 'below' ? forward : from === 'above' ? back : '0px';

	node.classList.add('mg-motion');
	node.style.setProperty('--mg-x', moves ? x : '0px');
	node.style.setProperty('--mg-y', moves ? y : '0px');
	node.style.setProperty('--mg-scale', `${scale}`);

	if (type === 'slide') {
		// Opaque and clipped: it emerges from under the layout instead of
		// floating in, so no fade is wanted.
		node.classList.add('mg-slide');
		node.style.setProperty('--mg-clip', SLIDE_CLIP[from]);
	}

	applyTiming(node, duration, delay, easing);

	const watcher = watch(
		node,
		{ amount, once },
		() => node.classList.add('is-revealed'),
		() => node.classList.remove('is-revealed')
	);

	return {
		destroy() {
			watcher.destroy();
			node.classList.remove('mg-motion', 'mg-slide', 'is-revealed');
			node.style.removeProperty('--mg-x');
			node.style.removeProperty('--mg-y');
			node.style.removeProperty('--mg-scale');
			node.style.removeProperty('--mg-clip');
			node.style.removeProperty('--mg-duration');
			node.style.removeProperty('--mg-delay');
			node.style.removeProperty('--mg-ease');
		}
	};
}

export interface DrawInOptions {
	/** Axis to grow along. Default 'x'. */
	axis?: 'x' | 'y';
	/** transform-origin. Defaults to the leading edge of `axis`. */
	origin?: string;
	delay?: number;
	amount?: number;
	duration?: number;
	easing?: Easing;
	once?: boolean;
}

/**
 * Svelte action: grow a rule, bar or track in from one edge.
 * Unlike `reveal` this scales, so give it its own wrapper if the content
 * inside should not stretch with it.
 *
 * <span class="bar" use:drawIn={{ duration: 400 }}>
 */
export function drawIn(node: HTMLElement, options: DrawInOptions = {}): Action {
	const {
		axis = 'x',
		delay = 0,
		amount = 0.25,
		duration = 320,
		easing,
		once = true,
		origin = axis === 'x' ? 'left center' : 'center bottom'
	} = options;

	if (prefersReducedMotion()) {
		return NOOP;
	}

	node.classList.add('mg-draw');
	node.style.setProperty('--mg-sx', axis === 'x' ? '0' : '1');
	node.style.setProperty('--mg-sy', axis === 'y' ? '0' : '1');
	node.style.setProperty('--mg-origin', origin);
	applyTiming(node, duration, delay, easing);

	const watcher = watch(
		node,
		{ amount, once },
		() => node.classList.add('is-revealed'),
		() => node.classList.remove('is-revealed')
	);

	return {
		destroy() {
			watcher.destroy();
			node.classList.remove('mg-draw', 'is-revealed');
			node.style.removeProperty('--mg-sx');
			node.style.removeProperty('--mg-sy');
			node.style.removeProperty('--mg-origin');
			node.style.removeProperty('--mg-duration');
			node.style.removeProperty('--mg-delay');
			node.style.removeProperty('--mg-ease');
		}
	};
}

export interface SweepOptions {
	delay?: number;
	amount?: number;
	/** Duration of one pass in ms. Default 900. */
	duration?: number;
	easing?: Easing;
	/** Passes, or 'infinite' for a scanning loop. Default 1. */
	repeat?: number | 'infinite';
	once?: boolean;
}

/**
 * Svelte action: send a band of light across the element, once on entry or
 * on a loop. Clips to the element's box, so it needs a rectangular host.
 *
 * <div class="cell" use:sweep={{ repeat: 'infinite', duration: 1800 }}>
 */
export function sweep(node: HTMLElement, options: SweepOptions = {}): Action {
	const { delay = 0, amount = 0.25, duration = 900, easing, repeat = 1, once = true } = options;

	if (prefersReducedMotion()) {
		return NOOP;
	}

	node.classList.add('mg-sweep');
	node.style.setProperty('--mg-repeat', `${repeat}`);
	applyTiming(node, duration, delay, easing);

	const watcher = watch(
		node,
		{ amount, once },
		() => node.classList.add('is-sweeping'),
		() => node.classList.remove('is-sweeping')
	);

	return {
		destroy() {
			watcher.destroy();
			node.classList.remove('mg-sweep', 'is-sweeping');
			node.style.removeProperty('--mg-repeat');
			node.style.removeProperty('--mg-duration');
			node.style.removeProperty('--mg-delay');
			node.style.removeProperty('--mg-ease');
		}
	};
}

export interface CountUpOptions {
	/** Target value. */
	to: number;
	/** Starting value. Default 0. */
	from?: number;
	/** Duration in ms. Default 700. */
	duration?: number;
	delay?: number;
	amount?: number;
	easing?: Easing;
	/** Decimal places. Default 0. */
	decimals?: number;
	/** Full control of the printed string; wins over `decimals`. */
	format?: (value: number) => string;
	once?: boolean;
}

/**
 * Svelte action: count a number up when it scrolls into view, and re-run
 * whenever `to` changes. Pair with `font-variant-numeric: tabular-nums` so
 * the digits do not jitter.
 *
 * <span use:countUp={{ to: total, decimals: 1 }}>
 */
export function countUp(
	node: HTMLElement,
	options: CountUpOptions
): Action & { update(next: CountUpOptions): void } {
	let current = options;
	let frame = 0;
	let timer = 0;

	const print = (value: number): void => {
		node.textContent = current.format
			? current.format(value)
			: value.toFixed(current.decimals ?? 0);
	};

	const stop = (): void => {
		if (frame) {
			cancelAnimationFrame(frame);
			frame = 0;
		}

		if (timer) {
			clearTimeout(timer);
			timer = 0;
		}
	};

	const run = (): void => {
		stop();

		const { to, from = 0, duration = 700, delay = 0, easing } = current;

		if (prefersReducedMotion()) {
			print(to);

			return;
		}

		const ease = easingFn(easing);

		timer = window.setTimeout(() => {
			const started = performance.now();

			const tick = (now: number): void => {
				const t = Math.min(1, (now - started) / duration);

				print(from + (to - from) * ease(t));

				if (t < 1) {
					frame = requestAnimationFrame(tick);
				}
			};

			frame = requestAnimationFrame(tick);
		}, delay);
	};

	print(prefersReducedMotion() ? current.to : (current.from ?? 0));

	const watcher = watch(node, { amount: current.amount ?? 0.5, once: current.once ?? true }, run);

	return {
		update(next: CountUpOptions) {
			const changed = next.to !== current.to;

			current = next;

			if (changed) {
				run();
			}
		},
		destroy() {
			stop();
			watcher.destroy();
		}
	};
}

export interface TypewriterOptions {
	/** Characters per second. Default 45. */
	speed?: number;
	delay?: number;
	amount?: number;
	/** Show a blinking block caret while typing. Default true. */
	caret?: boolean;
	/** Text to type. Defaults to the element's own text. */
	text?: string;
	once?: boolean;
}

/**
 * Svelte action: type the element's text out one character at a time.
 * The text is read from the DOM, so it stays in the markup for SSR, search
 * and screen readers, and is only re-revealed on screen.
 *
 * <p use:typewriter={{ speed: 60 }}>heat rises from the pit mouth</p>
 */
export function typewriter(node: HTMLElement, options: TypewriterOptions = {}): Action {
	const { speed = 45, delay = 0, amount = 0.5, caret = true, once = true } = options;
	const text = options.text ?? node.textContent ?? '';

	if (prefersReducedMotion()) {
		return NOOP;
	}

	let frame = 0;
	let timer = 0;

	const stop = (): void => {
		if (frame) {
			cancelAnimationFrame(frame);
			frame = 0;
		}

		if (timer) {
			clearTimeout(timer);
			timer = 0;
		}
	};

	node.classList.add('mg-type');
	node.textContent = '';

	const watcher = watch(node, { amount, once }, () => {
		stop();

		if (caret) {
			node.dataset.caret = '';
		}

		timer = window.setTimeout(() => {
			const started = performance.now();

			const tick = (now: number): void => {
				const shown = Math.min(text.length, Math.floor(((now - started) / 1000) * speed));

				node.textContent = text.slice(0, shown);

				if (shown < text.length) {
					frame = requestAnimationFrame(tick);
				} else {
					delete node.dataset.caret;
				}
			};

			frame = requestAnimationFrame(tick);
		}, delay);
	});

	return {
		destroy() {
			stop();
			watcher.destroy();
			node.classList.remove('mg-type');
			// Put the text back so the DOM matches the markup again.
			node.textContent = text;
		}
	};
}
