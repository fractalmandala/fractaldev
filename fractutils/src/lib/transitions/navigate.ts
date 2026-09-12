import { onNavigate } from '$app/navigation';
import type { Direction, TransitionSpec } from './view-transition.js';
import { prefersReducedMotion, supportsViewTransitions } from './view-transition.js';
import { easingValue } from './easing.js';

/**
 * SvelteKit page transitions, on the same engine as `transition()`.
 *
 * `onNavigate` needs the transition object synchronously to hand SvelteKit a
 * promise, so this wires it directly rather than going through `transition()`.
 */

export interface NavigationInfo {
	from: URL | null;
	to: URL | null;
}

/** A fixed spec, or one chosen per navigation — e.g. direction by route depth. */
export type NavSpec = TransitionSpec | ((nav: NavigationInfo) => TransitionSpec | undefined);

type ViewTransitionDocument = Document & {
	startViewTransition?: (update: () => Promise<void> | void) => {
		ready: Promise<void>;
		finished: Promise<void>;
	};
};

const WIPE_FROM: Record<Direction, string> = {
	up: 'inset(100% 0 0 0)',
	down: 'inset(0 0 100% 0)',
	right: 'inset(0 100% 0 0)',
	left: 'inset(0 0 0 100%)'
};

const SLIDE: Record<Direction, { enter: string; exit: string }> = {
	up: { enter: 'translateY(100%)', exit: 'translateY(-100%)' },
	down: { enter: 'translateY(-100%)', exit: 'translateY(100%)' },
	left: { enter: 'translateX(100%)', exit: 'translateX(-100%)' },
	right: { enter: 'translateX(-100%)', exit: 'translateX(100%)' }
};

/**
 * Wipe/slide/fade every navigation. Call once, during layout initialisation.
 *
 * ```ts
 * // Always bottom-to-top:
 * navTransition({ kind: 'wipe', direction: 'up' });
 *
 * // Or pick a direction from where you are going:
 * navTransition(({ from, to }) =>
 *   depth(to) > depth(from) ? { direction: 'left' } : { direction: 'right' });
 * ```
 */
export function navTransition(spec: NavSpec = {}): void {
	onNavigate((navigation) => {
		if (!supportsViewTransitions() || prefersReducedMotion()) return;

		const from = navigation.from?.url ?? null;
		const to = navigation.to?.url ?? null;

		// Hash links and replaceState land on the same page: nothing to animate.
		if (from && to && from.pathname === to.pathname) return;

		const resolved = typeof spec === 'function' ? spec({ from, to }) : spec;

		if (!resolved || resolved.kind === 'none') return;

		const kind = resolved.kind ?? 'wipe';
		const direction = resolved.direction ?? 'up';
		const duration = resolved.duration ?? 420;
		const easing = easingValue(resolved.easing ?? 'in-out');
		const doc = document as ViewTransitionDocument;

		return new Promise((resolve) => {
			const view = doc.startViewTransition!(async () => {
				resolve();
				await navigation.complete;
			});

			view.ready
				.then(() => {
					const root = document.documentElement;
					const options = { duration, easing };
					const newPage = { ...options, pseudoElement: '::view-transition-new(root)' };
					const oldPage = { ...options, pseudoElement: '::view-transition-old(root)' };

					if (kind === 'wipe') {
						root.animate({ clipPath: [WIPE_FROM[direction], 'inset(0 0 0 0)'] }, newPage);
					} else if (kind === 'slide') {
						const { enter, exit } = SLIDE[direction];

						root.animate({ transform: [enter, 'translate(0, 0)'] }, newPage);
						root.animate({ transform: ['translate(0, 0)', exit] }, oldPage);
					} else if (kind === 'fade') {
						root.animate({ opacity: [0, 1] }, newPage);
						root.animate({ opacity: [1, 0] }, oldPage);
					}
				})
				// Aborted (a second nav mid-transition, or a hidden tab) — the
				// navigation still completes, it just is not animated.
				.catch(() => {});
		});
	});
}
