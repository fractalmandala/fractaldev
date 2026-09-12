/**
 * ============================================================================
 *                  SVELTE 5 INTERSECTION OBSERVER ATTACHMENT
 * ============================================================================
 *
 * A zero-dependency Svelte 5 attachment factory for tracking element visibility
 * relative to the viewport or a custom scrolling container.
 *
 * ----------------------------------------------------------------------------
 * 📖 COMMON USE CASES:
 * ----------------------------------------------------------------------------
 * 1. Scrollspy: Highlight the active navigation link as headings enter view.
 * 2. Reveal on Scroll: Trigger entry transitions only when visible.
 * 3. Lazy Media Loading: Defer iframe, canvas, or image decoding.
 * 4. Infinite Scroll: Trigger data fetching when a sentinel bottom element enters.
 *
 * ----------------------------------------------------------------------------
 * 💡 USAGE EXAMPLES:
 * ----------------------------------------------------------------------------
 *
 * [Example 1: Reveal Once on Scroll]
 * ```svelte
 * <script>
 *   import { intersect } from '$lib/actions';
 *   let revealed = $state(false);
 * </script>
 *
 * <div
 *   class="card"
 *   class:revealed
 *   {@attach intersect(() => (revealed = true), { threshold: 0.2, once: true })}
 * >
 *   I appear smoothly once 20% of me is in the viewport!
 * </div>
 * ```
 *
 * [Example 2: Infinite Scroll Sentinel]
 * ```svelte
 * <div
 *   class="sentinel"
 *   {@attach intersect((detail) => {
 *     if (detail.isIntersecting) loadNextPage();
 *   }, { rootMargin: '200px' })}
 * ></div>
 * ```
 * ============================================================================
 */

import type { ActionReturn } from 'svelte/action';
import type {
	IntersectAttributes,
	IntersectCallback,
	IntersectDetail,
	IntersectOptions
} from './types';

/**
 * Modern Svelte 5 Attachment Factory for IntersectionObserver.
 *
 * @param callback Called whenever the intersection ratio crosses a threshold.
 * @param options Options including `threshold`, `rootMargin`, `root`, and `once`.
 */
export function intersect(
	callback?: IntersectCallback,
	options?: IntersectOptions
): (element: HTMLElement) => void | (() => void) {
	return (element: HTMLElement) => {
		// Guard for Server-Side Rendering (SSR)
		if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
			return;
		}
		if (options?.enabled === false) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const detail: IntersectDetail = {
						observer,
						entry,
						isIntersecting: entry.isIntersecting,
						intersectionRatio: entry.intersectionRatio
					};

					// Trigger callback
					callback?.(detail);

					// Also dispatch standard DOM CustomEvent for template listeners
					element.dispatchEvent(new CustomEvent<IntersectDetail>('intersect', { detail }));

					// Auto-disconnect if configured for one-shot observation (e.g. reveal animations)
					if (entry.isIntersecting && options?.once) {
						observer.unobserve(element);
						observer.disconnect();
					}
				}
			},
			{
				root: options?.root,
				rootMargin: options?.rootMargin ?? '0px',
				threshold: options?.threshold ?? 0
			}
		);

		observer.observe(element);

		// Teardown observer on unmount or before attachment re-runs
		return () => {
			observer.unobserve(element);
			observer.disconnect();
		};
	};
}

/**
 * Backwards-compatible legacy Svelte 3/4 Action for IntersectionObserver.
 * `<div use:intersectAction={{ threshold: 0.5 }}>`
 */
export function intersectAction(
	node: HTMLElement,
	params?: IntersectCallback | IntersectOptions
): ActionReturn<IntersectCallback | IntersectOptions | undefined, IntersectAttributes> {
	let cleanup: (() => void) | void;

	function setup(p?: IntersectCallback | IntersectOptions) {
		cleanup?.();
		if (typeof p === 'function') {
			cleanup = intersect(p)(node);
		} else {
			cleanup = intersect(undefined, p)(node);
		}
	}

	setup(params);

	return {
		update(newParams) {
			setup(newParams);
		},
		destroy() {
			cleanup?.();
		}
	};
}
