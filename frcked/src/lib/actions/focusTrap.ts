/**
 * ============================================================================
 *                    SVELTE 5 FOCUS TRAP ATTACHMENT
 * ============================================================================
 *
 * A zero-dependency WAI-ARIA compliant focus trap attachment for modal dialogs,
 * slide-over drawers, command palettes, and sheets.
 *
 * ----------------------------------------------------------------------------
 * 📖 FEATURES:
 * ----------------------------------------------------------------------------
 * 1. KEYBOARD TAB CYCLING:
 *    - Traps focus within the container. `Tab` on the last element wraps to the
 *      first; `Shift+Tab` on the first wraps to the last.
 *
 * 2. INITIAL FOCUS:
 *    - Automatically focuses the first interactive element or an element
 *      marked with `[data-autofocus]`.
 *
 * 3. FOCUS RESTORATION:
 *    - Saves the previously focused element (`document.activeElement`) when the
 *      modal opens and restores focus to it when unmounted.
 *
 * 4. ESCAPE KEY HANDLING:
 *    - Optional `onEscape` callback for keyboard dismissal.
 *
 * ----------------------------------------------------------------------------
 * 💡 USAGE EXAMPLE:
 * ----------------------------------------------------------------------------
 * ```svelte
 * <script>
 *   import { focusTrap } from '$lib/actions';
 *   let isOpen = $state(true);
 * </script>
 *
 * {#if isOpen}
 *   <div class="modal" role="dialog" aria-modal="true" {@attach focusTrap({
 *     onEscape: () => (isOpen = false)
 *   })}>
 *     <h3>Modal Title</h3>
 *     <input placeholder="Name" />
 *     <button onclick={() => (isOpen = false)}>Close</button>
 *   </div>
 * {/if}
 * ```
 * ============================================================================
 */

export interface FocusTrapOptions {
	/** Whether the trap is active. Default: true. */
	enabled?: boolean;
	/** Whether to automatically focus the first element on mount. Default: true. */
	autofocus?: boolean;
	/** Whether to restore focus to previously active element on unmount. Default: true. */
	restoreFocus?: boolean;
	/** Callback fired when Escape key is pressed. */
	onEscape?: () => void;
}

const FOCUSABLE_SELECTOR = [
	'a[href]',
	'area[href]',
	'input:not([disabled]):not([type="hidden"])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'button:not([disabled])',
	'iframe',
	'object',
	'embed',
	'[contenteditable]',
	'[tabindex]:not([tabindex="-1"])'
].join(',');

/**
 * Modern Svelte 5 Attachment Factory for trapping focus inside a container.
 */
export function focusTrap(
	options: FocusTrapOptions = {}
): (container: HTMLElement) => void | (() => void) {
	return (container: HTMLElement) => {
		if (typeof window === 'undefined') return;
		if (options.enabled === false) return;

		const restoreFocus = options.restoreFocus ?? true;
		const autofocus = options.autofocus ?? true;
		const previousActiveElement = document.activeElement as HTMLElement | null;

		function getFocusableElements(): HTMLElement[] {
			const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
			return elements.filter((el) => el.offsetParent !== null && !el.hasAttribute('disabled'));
		}

		// Set initial focus
		if (autofocus) {
			const autoEl = container.querySelector<HTMLElement>('[data-autofocus]');
			if (autoEl) {
				autoEl.focus();
			} else {
				const focusable = getFocusableElements();
				if (focusable.length > 0) {
					focusable[0]?.focus();
				} else {
					container.setAttribute('tabindex', '-1');
					container.focus();
				}
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape' && options.onEscape) {
				event.preventDefault();
				options.onEscape();
				return;
			}

			if (event.key !== 'Tab') return;

			const focusable = getFocusableElements();
			if (focusable.length === 0) {
				event.preventDefault();
				return;
			}

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (event.shiftKey) {
				// Shift + Tab: if on first element, wrap to last
				if (document.activeElement === first || document.activeElement === container) {
					event.preventDefault();
					last?.focus();
				}
			} else {
				// Tab: if on last element, wrap to first
				if (document.activeElement === last) {
					event.preventDefault();
					first?.focus();
				}
			}
		}

		container.addEventListener('keydown', handleKeyDown);

		return () => {
			container.removeEventListener('keydown', handleKeyDown);

			// Restore focus back to original trigger
			if (restoreFocus && previousActiveElement && typeof previousActiveElement.focus === 'function') {
				previousActiveElement.focus();
			}
		};
	};
}
