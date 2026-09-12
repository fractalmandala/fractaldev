/**
 * ============================================================================
 *                    SVELTE 5 CLICK OUTSIDE ATTACHMENT
 * ============================================================================
 *
 * A zero-dependency attachment factory for dismissing popovers, dropdowns,
 * modals, and context menus when the user clicks outside or hits `Escape`.
 *
 * ----------------------------------------------------------------------------
 * 📖 WHY THIS IMPLEMENTATION IS SUPERIOR:
 * ----------------------------------------------------------------------------
 * 1. Uses `pointerdown` in the capture phase:
 *    - Fires immediately before blur/focus transitions occur.
 *    - Works seamlessly across desktop mouse, mobile touch, and pen styluses.
 * 2. `exclude` option:
 *    - Allows ignoring toggle buttons or child triggers (e.g. `exclude: ['#menu-btn']`).
 * 3. Built-in `Escape` key handling:
 *    - Meets accessibility guidelines without adding redundant `keydown` handlers.
 * 4. Dual API:
 *    - Modern Svelte 5 `{@attach clickOutside(cb, opts)}`
 *    - Legacy Svelte 3/4 `use:clickOutsideAction`
 *
 * ----------------------------------------------------------------------------
 * 💡 USAGE EXAMPLE:
 * ----------------------------------------------------------------------------
 * ```svelte
 * <script>
 *   import { clickOutside } from '$lib/actions';
 *   let isOpen = $state(false);
 * </script>
 *
 * <button id="menu-btn" onclick={() => (isOpen = !isOpen)}>Toggle</button>
 *
 * {#if isOpen}
 *   <div
 *     class="dropdown"
 *     {@attach clickOutside(() => (isOpen = false), {
 *       escape: true,
 *       exclude: ['#menu-btn']
 *     })}
 *   >
 *     Dropdown Content
 *   </div>
 * {/if}
 * ```
 * ============================================================================
 */

import type { ActionReturn } from 'svelte/action';
import type {
	ClickOutsideAttributes,
	ClickOutsideCallback,
	ClickOutsideDetail,
	ClickOutsideOptions
} from './types';

/**
 * Modern Svelte 5 Attachment Factory for click-outside detection.
 */
export function clickOutside(
	callback?: ClickOutsideCallback,
	options?: ClickOutsideOptions
): (element: HTMLElement) => void | (() => void) {
	return (element: HTMLElement) => {
		// Server-Side Rendering guard
		if (typeof window === 'undefined') return;
		if (options?.enabled === false) return;

		const events = options?.events ?? ['pointerdown'];
		const capture = options?.capture ?? true;
		const listenEscape = options?.escape ?? true;

		/**
		 * Checks whether the clicked element is part of an excluded container
		 * (such as the toggle button that originally opened this dropdown).
		 */
		function isExcluded(target: EventTarget | null): boolean {
			if (!target || !(target instanceof Node) || !options?.exclude) {
				return false;
			}
			for (const item of options.exclude) {
				if (!item) continue;
				if (typeof item === 'string') {
					const el = document.querySelector(item);
					if (el && (el === target || el.contains(target))) {
						return true;
					}
				} else if (item instanceof Node) {
					if (item === target || item.contains(target)) {
						return true;
					}
				}
			}
			return false;
		}

		/**
		 * Handles click/pointerdown events globally in the capture phase.
		 */
		function handleInteraction(event: Event) {
			const target = event.target;
			if (!target || !(target instanceof Node)) return;

			// If the clicked node is outside this element and not in the exclude list
			if (!element.contains(target) && !isExcluded(target)) {
				const detail: ClickOutsideDetail = {
					event: event as MouseEvent | PointerEvent | TouchEvent,
					target
				};
				callback?.(detail);
				element.dispatchEvent(new CustomEvent<ClickOutsideDetail>('clickoutside', { detail }));
			}
		}

		/**
		 * Handles keyboard events (e.g. Escape key to close).
		 */
		function handleKeydown(event: KeyboardEvent) {
			if (event.key !== 'Escape') return;

			const detail: ClickOutsideDetail = {
				event,
				target: event.target
			};
			callback?.(detail);
			element.dispatchEvent(new CustomEvent<ClickOutsideDetail>('escape', { detail }));
		}

		// Register capture listeners on document
		for (const ev of events) {
			document.addEventListener(ev, handleInteraction, capture);
		}

		if (listenEscape) {
			document.addEventListener('keydown', handleKeydown, true);
		}

		// Cleanup runs automatically when element unmounts or attachment re-runs
		return () => {
			for (const ev of events) {
				document.removeEventListener(ev, handleInteraction, capture);
			}
			if (listenEscape) {
				document.removeEventListener('keydown', handleKeydown, true);
			}
		};
	};
}

/**
 * Backwards-compatible legacy Svelte 3/4 Action for click-outside detection.
 * `<div use:clickOutsideAction={onClose}>`
 */
export function clickOutsideAction(
	node: HTMLElement,
	params?: ClickOutsideCallback | ClickOutsideOptions
): ActionReturn<ClickOutsideCallback | ClickOutsideOptions | undefined, ClickOutsideAttributes> {
	let cleanup: (() => void) | void;

	function setup(p?: ClickOutsideCallback | ClickOutsideOptions) {
		cleanup?.();
		if (typeof p === 'function') {
			cleanup = clickOutside(p)(node);
		} else {
			cleanup = clickOutside(undefined, p)(node);
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
