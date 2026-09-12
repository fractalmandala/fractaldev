/**
 * ============================================================================
 *               ZERO-DEPENDENCY POPOVER & FLOATING POSITIONER
 * ============================================================================
 *
 * Computes exact viewport coordinates for tooltips, dropdown menus, and popovers
 * without requiring `@floating-ui/dom` or heavy external dependencies.
 *
 * ----------------------------------------------------------------------------
 * 📖 FEATURES:
 * ----------------------------------------------------------------------------
 * - Computes `fixed` position coordinates using `getBoundingClientRect()`.
 * - Automatic Viewport Flipping: if placing on 'bottom' would overflow below the
 *   viewport, it flips smoothly to 'top'.
 * - Re-computes on window scroll, window resize, or reactive trigger change.
 * - Reactive `style` string ready to spread directly onto your floating element.
 *
 * ----------------------------------------------------------------------------
 * 💡 USAGE EXAMPLE:
 * ----------------------------------------------------------------------------
 * ```svelte
 * <script>
 *   import { usePopoverPosition } from '$lib/utils';
 *
 *   let triggerEl = $state<HTMLElement | null>(null);
 *   let contentEl = $state<HTMLElement | null>(null);
 *   let isOpen = $state(false);
 *
 *   const popover = usePopoverPosition(
 *     () => triggerEl,
 *     () => contentEl,
 *     () => isOpen,
 *     { placement: 'bottom-start', offset: 6 }
 *   );
 * </script>
 *
 * <button bind:this={triggerEl} onclick={() => isOpen = !isOpen}>
 *   Open Menu
 * </button>
 *
 * {#if isOpen}
 *   <div bind:this={contentEl} style={popover.style} class="popover-panel">
 *     Menu items...
 *   </div>
 * {/if}
 * ```
 * ============================================================================
 */

export type PopoverPlacement =
	| 'top'
	| 'top-start'
	| 'top-end'
	| 'bottom'
	| 'bottom-start'
	| 'bottom-end'
	| 'left'
	| 'left-start'
	| 'left-end'
	| 'right'
	| 'right-start'
	| 'right-end';

export interface PopoverOptions {
	/** Desired placement relative to trigger. Default: 'bottom'. */
	placement?: PopoverPlacement;
	/** Distance in px between trigger and content. Default: 8. */
	offset?: number;
	/** Minimum distance in px from viewport edges. Default: 8. */
	padding?: number;
}

export class PopoverPositioner {
	#triggerRef: () => HTMLElement | null | undefined;
	#contentRef: () => HTMLElement | null | undefined;
	#activeRef: () => boolean;
	#options: PopoverOptions;

	x = $state(0);
	y = $state(0);
	actualPlacement = $state<PopoverPlacement>('bottom');

	constructor(
		triggerRef: () => HTMLElement | null | undefined,
		contentRef: () => HTMLElement | null | undefined,
		activeRef: () => boolean,
		options: PopoverOptions = {}
	) {
		this.#triggerRef = triggerRef;
		this.#contentRef = contentRef;
		this.#activeRef = activeRef;
		this.#options = options;

		this.update = this.update.bind(this);

		if (typeof window !== 'undefined') {
			$effect(() => {
				const isActive = this.#activeRef();
				if (!isActive) return;

				// Run initial update
				this.update();

				// Listen to scroll and resize events across the page
				window.addEventListener('scroll', this.update, { capture: true, passive: true });
				window.addEventListener('resize', this.update, { passive: true });

				return () => {
					window.removeEventListener('scroll', this.update, { capture: true });
					window.removeEventListener('resize', this.update);
				};
			});
		}
	}

	update(): void {
		const trigger = this.#triggerRef();
		const content = this.#contentRef();
		if (!trigger || !content || typeof window === 'undefined') return;

		const targetPlacement = this.#options.placement ?? 'bottom';
		const offset = this.#options.offset ?? 8;
		const padding = this.#options.padding ?? 8;

		const triggerRect = trigger.getBoundingClientRect();
		const contentWidth = content.offsetWidth;
		const contentHeight = content.offsetHeight;
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		let placement = targetPlacement;

		// Viewport flip detection for top/bottom
		if (placement.startsWith('bottom')) {
			if (triggerRect.bottom + offset + contentHeight > viewportHeight - padding) {
				if (triggerRect.top - offset - contentHeight >= padding) {
					placement = placement.replace('bottom', 'top') as PopoverPlacement;
				}
			}
		} else if (placement.startsWith('top')) {
			if (triggerRect.top - offset - contentHeight < padding) {
				if (triggerRect.bottom + offset + contentHeight <= viewportHeight - padding) {
					placement = placement.replace('top', 'bottom') as PopoverPlacement;
				}
			}
		}

		let top = 0;
		let left = 0;

		// Primary axis coordinates
		if (placement.startsWith('top')) {
			top = triggerRect.top - contentHeight - offset;
		} else if (placement.startsWith('bottom')) {
			top = triggerRect.bottom + offset;
		} else if (placement.startsWith('left')) {
			left = triggerRect.left - contentWidth - offset;
		} else if (placement.startsWith('right')) {
			left = triggerRect.right + offset;
		}

		// Secondary axis alignment
		if (placement.startsWith('top') || placement.startsWith('bottom')) {
			if (placement.endsWith('-start')) {
				left = triggerRect.left;
			} else if (placement.endsWith('-end')) {
				left = triggerRect.right - contentWidth;
			} else {
				left = triggerRect.left + (triggerRect.width - contentWidth) / 2;
			}
		} else {
			if (placement.endsWith('-start')) {
				top = triggerRect.top;
			} else if (placement.endsWith('-end')) {
				top = triggerRect.bottom - contentHeight;
			} else {
				top = triggerRect.top + (triggerRect.height - contentHeight) / 2;
			}
		}

		// Boundary clamping so content never bleeds offscreen
		left = Math.max(padding, Math.min(left, viewportWidth - contentWidth - padding));
		top = Math.max(padding, Math.min(top, viewportHeight - contentHeight - padding));

		this.x = Math.round(left);
		this.y = Math.round(top);
		this.actualPlacement = placement;
	}

	/**
	 * Inline style string ready to apply to the floating element.
	 */
	get style(): string {
		return `position: fixed; left: ${this.x}px; top: ${this.y}px; z-index: 9999;`;
	}
}

/**
 * Creates a reactive popover viewport positioning calculator.
 */
export function usePopoverPosition(
	triggerRef: () => HTMLElement | null | undefined,
	contentRef: () => HTMLElement | null | undefined,
	activeRef: () => boolean,
	options?: PopoverOptions
): PopoverPositioner {
	return new PopoverPositioner(triggerRef, contentRef, activeRef, options);
}
