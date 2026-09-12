import { easingValue, type Easing } from './easing.js';

/**
 * View transitions, as an engine rather than a one-off.
 *
 * A transition is three independent choices — kind, direction, easing — so
 * `{ kind: 'wipe', direction: 'up' }` and `{ kind: 'slide', direction: 'left' }`
 * come out of the same code path. Import `./transition.css` once to switch off
 * the browser's default cross-fade; everything here drives the snapshots
 * explicitly with the Web Animations API.
 */

/** Which way the incoming page travels. */
export type Direction = 'up' | 'down' | 'left' | 'right';

export type TransitionKind =
	/** New page grows in from one edge; the old page stays still underneath. */
	| 'wipe'
	/** New page slides in while the old page slides out — both move. */
	| 'slide'
	/** Straight dissolve. `direction` is ignored. */
	| 'fade'
	/** New page opens from a point, expanding to cover. Great from a click. */
	| 'circle'
	/** No animation; swap instantly. */
	| 'none';

export interface TransitionSpec {
	/** Default 'wipe'. */
	kind?: TransitionKind;
	/** Default 'up'. Ignored by 'fade' and 'circle'. */
	direction?: Direction;
	/** Milliseconds. Default 420. */
	duration?: number;
	/** Default 'in-out'. */
	easing?: Easing;
	/**
	 * Origin for 'circle', in viewport px. Defaults to the centre.
	 * Pass a click's `clientX`/`clientY` to open from the button pressed.
	 */
	origin?: { x: number; y: number };
	/** Extra class set on <html> for the duration, for bespoke CSS. */
	className?: string;
}

type Resolved = Required<Omit<TransitionSpec, 'origin' | 'className'>> &
	Pick<TransitionSpec, 'origin' | 'className'>;

type ViewTransition = { ready: Promise<void>; finished: Promise<void> };

type ViewTransitionDocument = Document & {
	startViewTransition?: (update: () => Promise<void> | void) => ViewTransition;
};

const DEFAULTS: Resolved = {
	kind: 'wipe',
	direction: 'up',
	duration: 420,
	easing: 'in-out'
};

/**
 * `inset(top right bottom left)`. To reveal the new page travelling `up`, the
 * clip starts as a zero-height band pinned to the bottom edge and grows up.
 */
const WIPE_FROM: Record<Direction, string> = {
	up: 'inset(100% 0 0 0)',
	down: 'inset(0 0 100% 0)',
	right: 'inset(0 100% 0 0)',
	left: 'inset(0 0 0 100%)'
};

/** Offset the incoming page starts at, and the one the outgoing page leaves to. */
const SLIDE: Record<Direction, { enter: string; exit: string }> = {
	up: { enter: 'translateY(100%)', exit: 'translateY(-100%)' },
	down: { enter: 'translateY(-100%)', exit: 'translateY(100%)' },
	left: { enter: 'translateX(100%)', exit: 'translateX(-100%)' },
	right: { enter: 'translateX(-100%)', exit: 'translateX(100%)' }
};

/** Radius that reaches the furthest corner from `origin`. */
function coverRadius(x: number, y: number): number {
	const w = window.innerWidth;
	const h = window.innerHeight;

	return Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
}

export function supportsViewTransitions(): boolean {
	return (
		typeof document !== 'undefined' &&
		typeof (document as ViewTransitionDocument).startViewTransition === 'function'
	);
}

export function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

/** Animate the snapshots for one resolved spec. Called once `ready` settles. */
function animate(spec: Resolved): void {
	const root = document.documentElement;
	const options = {
		duration: spec.duration,
		easing: easingValue(spec.easing)
	} satisfies KeyframeAnimationOptions;

	const newPage = { ...options, pseudoElement: '::view-transition-new(root)' };
	const oldPage = { ...options, pseudoElement: '::view-transition-old(root)' };

	switch (spec.kind) {
		case 'wipe':
			root.animate({ clipPath: [WIPE_FROM[spec.direction], 'inset(0 0 0 0)'] }, newPage);
			break;

		case 'slide': {
			const { enter, exit } = SLIDE[spec.direction];

			root.animate({ transform: [enter, 'translate(0, 0)'] }, newPage);
			root.animate({ transform: ['translate(0, 0)', exit] }, oldPage);
			break;
		}

		case 'fade':
			root.animate({ opacity: [0, 1] }, newPage);
			root.animate({ opacity: [1, 0] }, oldPage);
			break;

		case 'circle': {
			const x = spec.origin?.x ?? window.innerWidth / 2;
			const y = spec.origin?.y ?? window.innerHeight / 2;
			const r = coverRadius(x, y);

			root.animate(
				{ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
				newPage
			);
			break;
		}

		case 'none':
			break;
	}
}

/**
 * Run `update` inside a view transition, animated to `spec`.
 *
 * Falls back to calling `update` directly when view transitions are missing,
 * reduced motion is on, or `kind` is 'none' — so callers never branch.
 *
 * ```ts
 * await transition(() => (theme = 'dark'), { kind: 'circle', origin: { x, y } });
 * ```
 */
export async function transition(
	update: () => Promise<void> | void,
	spec: TransitionSpec = {}
): Promise<void> {
	const resolved: Resolved = { ...DEFAULTS, ...spec };
	const doc = document as ViewTransitionDocument;

	if (resolved.kind === 'none' || prefersReducedMotion() || !supportsViewTransitions()) {
		await update();

		return;
	}

	const root = document.documentElement;

	if (resolved.className) root.classList.add(resolved.className);

	const view = doc.startViewTransition!(update);

	try {
		await view.ready;
		animate(resolved);
	} catch {
		// A transition aborted before it started (a second one interrupting, or
		// the tab hidden — browsers skip transitions on a hidden document).
		// The DOM update still ran; there is just nothing to animate.
	}

	try {
		await view.finished;
	} catch {
		/* same */
	} finally {
		if (resolved.className) root.classList.remove(resolved.className);
	}
}
