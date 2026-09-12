/**
 * ============================================================================
 *                    SVELTE 5 MODULAR RESIZABLE SYSTEM
 * ============================================================================
 *
 * A zero-dependency, multi-axis interactive resizing engine & attachment suite.
 * Built with native web standards:
 * - Pointer Events with `setPointerCapture` (tracks beyond window, over iframes, on touch)
 * - Svelte 5 Runes (`$state`, `$derived`) for reactive state management
 * - Svelte 5.29+ `{@attach}` attachment factories
 * - Full WAI-ARIA `role="separator"` accessibility with keyboard controls
 * - Native `ResizeObserver` for measurement observation
 *
 * ----------------------------------------------------------------------------
 * 📖 ARCHITECTURE OVERVIEW & HOW TO USE
 * ----------------------------------------------------------------------------
 *
 * [Use Case 1: Resize ONLY Width (Sidebar with a Vertical Rail)]
 * ----------------------------------------------------------------------------
 *   ┌───────────────┐│┌──────────────────────────────────────────────────────┐
 *   │  SIDEBAR      │││  MAIN CONTENT                                        │
 *   │  (width: W)   │││                                                      │
 *   │               │││                                                      │
 *   └───────────────┘▲└──────────────────────────────────────────────────────┘
 *                    │
 *             Vertical Rail (col-resize)
 *
 * ```svelte
 * <script>
 *   import { createResizable } from '$lib/actions';
 *
 *   const sidebar = createResizable({
 *     axis: 'x',                     // 'x' = horizontal width only
 *     side: 'right',                 // Rail sits on right edge; dragging right increases width
 *     initial: 280,                  // Default width: 280px
 *     min: 160,                      // Minimum width: 160px
 *     max: 480,                      // Maximum width: 480px
 *     collapseBelow: 110,            // Snaps to 0px if dragged narrower than 110px
 *     storageKey: 'app-sidebar-w'    // Persists across browser reloads
 *   });
 * </script>
 *
 * <aside style={sidebar.style}>
 *   <nav>Sidebar Navigation</nav>
 * </aside>
 *
 * <!-- The rail attachment: handles dragging, ARIA, and keyboard nudge -->
 * <div class="rail" {@attach sidebar.rail}></div>
 * ```
 *
 * ----------------------------------------------------------------------------
 * [Use Case 2: Resize ONLY Height (Bottom Drawer / Terminal Panel)]
 * ----------------------------------------------------------------------------
 *   ┌────────────────────────────────────────────────────────────────────────┐
 *   │  MAIN EDITOR VIEW                                                      │
 *   ├────────────────────────────────────────────────────────────────────────┤
 *   │======================== Horizontal Rail (row-resize) ==================│
 *   ├────────────────────────────────────────────────────────────────────────┤
 *   │  TERMINAL / CONSOLE PANEL (height: H)                                  │
 *   └────────────────────────────────────────────────────────────────────────┘
 *
 * ```svelte
 * <script>
 *   import { createResizable } from '$lib/actions';
 *
 *   const terminal = createResizable({
 *     axis: 'y',                     // 'y' = vertical height only
 *     side: 'top',                   // Rail sits on top edge; dragging up increases height
 *     initial: 160,
 *     min: 80,
 *     max: 450
 *   });
 * </script>
 *
 * <div class="rail-horizontal" {@attach terminal.rail}></div>
 * <div class="terminal-panel" style={terminal.style}>
 *   <pre>Console Output...</pre>
 * </div>
 * ```
 *
 * ----------------------------------------------------------------------------
 * [Use Case 3: Resize BOTH Width & Height (Floating Card / Specimen)]
 * ----------------------------------------------------------------------------
 *   ┌────────────────────────┐
 *   │  FLOATING CARD         │
 *   │                        │
 *   │                      ◢ │ ◄── Corner Handle (nwse-resize)
 *   └────────────────────────┘
 *
 * ```svelte
 * <script>
 *   import { createResizable } from '$lib/actions';
 *
 *   const card = createResizable({
 *     axis: 'both',
 *     side: 'bottom-right',
 *     initialWidth: 240,
 *     initialHeight: 180,
 *     minWidth: 120,
 *     minHeight: 100
 *   });
 * </script>
 *
 * <div class="card" style={card.style}>
 *   <div class="corner-handle" {@attach card.handle}></div>
 * </div>
 * ```
 *
 * ----------------------------------------------------------------------------
 * [Use Case 4: Standalone Target Mode (No Runes Controller Needed)]
 * ----------------------------------------------------------------------------
 * If you already have an element in HTML and just want a rail that resizes it:
 *
 * ```svelte
 * <aside id="my-sidebar">...</aside>
 * <div
 *   class="rail"
 *   {@attach resizeRail({ target: '#my-sidebar', axis: 'x', side: 'right' })}
 * ></div>
 * ```
 *
 * ----------------------------------------------------------------------------
 * [Use Case 5: Measurement Observation (No Interactive Dragging)]
 * ----------------------------------------------------------------------------
 * For purely observing rendered element dimensions via ResizeObserver:
 *
 * ```svelte
 * <div {@attach observeResize((detail) => console.log(detail.width, detail.height))}>
 * </div>
 * ```
 *
 * ----------------------------------------------------------------------------
 * ⌨️ KEYBOARD ACCESSIBILITY (WAI-ARIA `role="separator"`):
 * ----------------------------------------------------------------------------
 * - `ArrowLeft` / `ArrowRight` : Nudge horizontal width by `step` px (Shift = 4x)
 * - `ArrowUp` / `ArrowDown`     : Nudge vertical height by `step` px (Shift = 4x)
 * - `Home`                      : Snap to minimum allowable size
 * - `End`                       : Snap to maximum allowable size
 * - `Enter` or `Space`          : Toggle collapsed and expanded state
 * - `Double Click`              : Reset to initial dimensions
 * ============================================================================
 */

import { untrack } from 'svelte';
import type { ActionReturn } from 'svelte/action';
export type * from './types';
import type {
	ResizableDetail,
	ResizableOptions,
	ResizeAxis,
	ResizeObserverCallback,
	ResizeObserverDetail,
	ResizeObserverOptions,
	ResizeRailOptions,
	ResizeSide
} from './types';

/* -------------------------------------------------------------------------- */
/*                               Internal Helpers                             */
/* -------------------------------------------------------------------------- */

/**
 * Clamps a number between min and max bounds.
 */
function clamp(val: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, val));
}

/**
 * Resolves an HTMLElement from a DOM node reference or CSS selector string.
 */
function resolveTargetElement(target?: HTMLElement | string | null): HTMLElement | null {
	if (!target) return null;
	if (typeof target === 'string') {
		return document.querySelector<HTMLElement>(target);
	}
	return target;
}

/* -------------------------------------------------------------------------- */
/*                    Svelte 5 Runes Resizable Controller                     */
/* -------------------------------------------------------------------------- */

/**
 * The core reactive controller managing dimensions, dragging states,
 * ARIA separator attributes, and localStorage persistence.
 */
export class Resizable {
	/** Active axis: 'x' (width), 'y' (height), or 'both' */
	readonly axis: ResizeAxis;

	/** Placement of the handle: determines whether pointer deltas are added or subtracted */
	readonly side: ResizeSide;

	/** Constraints */
	readonly minWidth: number;
	readonly maxWidth: number;
	readonly minHeight: number;
	readonly maxHeight: number;

	/** Distance in px nudged per keyboard arrow press (default: 16px) */
	readonly step: number;

	/** Threshold below which the panel snaps to 0px (collapsed) */
	readonly collapseBelow?: number;

	/** Optional key to persist size across browser sessions in localStorage */
	readonly storageKey?: string;

	/** CSS Custom Property name emitted by `.cssVar` (e.g. '--sidebar-width') */
	readonly varName: string;

	/** Initial fallback dimensions */
	readonly initialWidth: number;
	readonly initialHeight: number;

	/** Reactive primary width state (Svelte 5 Rune) */
	width = $state(280);

	/** Reactive primary height state (Svelte 5 Rune) */
	height = $state(200);

	/** True while pointer drag is actively in progress */
	isDragging = $state(false);

	/** True when panel was collapsed or dragged below `collapseBelow` */
	isCollapsed = $state(false);

	#onResize?: (detail: ResizableDetail) => void;
	#onResizeStart?: (detail: ResizableDetail) => void;
	#onResizeEnd?: (detail: ResizableDetail) => void;
	#onCollapse?: (collapsed: boolean) => void;

	constructor(options: ResizableOptions = {}) {
		this.axis = options.axis ?? 'x';
		this.side = options.side ?? (this.axis === 'y' ? 'bottom' : 'right');

		const minPrimary = options.min ?? (this.axis === 'y' ? 100 : 180);
		const maxPrimary = options.max ?? (this.axis === 'y' ? 600 : 800);
		const initPrimary = options.initial ?? (this.axis === 'y' ? 240 : 280);

		this.minWidth = options.minWidth ?? (this.axis === 'y' ? 0 : minPrimary);
		this.maxWidth = options.maxWidth ?? (this.axis === 'y' ? 9999 : maxPrimary);
		this.minHeight = options.minHeight ?? (this.axis === 'x' ? 0 : minPrimary);
		this.maxHeight = options.maxHeight ?? (this.axis === 'x' ? 9999 : maxPrimary);

		this.initialWidth = options.initialWidth ?? (this.axis === 'y' ? 0 : initPrimary);
		this.initialHeight = options.initialHeight ?? (this.axis === 'x' ? 0 : initPrimary);

		this.step = options.step ?? 16;
		this.collapseBelow = options.collapseBelow;
		this.storageKey = options.storageKey;
		this.varName = options.varName ?? (this.axis === 'y' ? '--panel-height' : '--sidebar-width');

		this.#onResize = options.onResize;
		this.#onResizeStart = options.onResizeStart;
		this.#onResizeEnd = options.onResizeEnd;
		this.#onCollapse = options.onCollapse;

		this.width = clamp(this.initialWidth, this.minWidth, this.maxWidth);
		this.height = clamp(this.initialHeight, this.minHeight, this.maxHeight);

		// Restore persisted dimensions from localStorage (runs client-side only)
		if (typeof window !== 'undefined' && this.storageKey) {
			try {
				const stored = localStorage.getItem(this.storageKey);
				if (stored !== null) {
					const parsed = JSON.parse(stored);
					if (typeof parsed === 'number') {
						if (parsed === 0) {
							this.isCollapsed = true;
						} else if (this.axis === 'y') {
							this.height = clamp(parsed, this.minHeight, this.maxHeight);
						} else {
							this.width = clamp(parsed, this.minWidth, this.maxWidth);
						}
					} else if (typeof parsed === 'object' && parsed !== null) {
						if (typeof parsed.width === 'number') {
							this.width = clamp(parsed.width, this.minWidth, this.maxWidth);
						}
						if (typeof parsed.height === 'number') {
							this.height = clamp(parsed.height, this.minHeight, this.maxHeight);
						}
						if (parsed.collapsed) {
							this.isCollapsed = true;
						}
					}
				}
			} catch {
				// Silently fallback if localStorage is disabled in private browsing
			}
		}

		// Ensure attachment methods are bound so they can be destructured or passed directly
		this.rail = this.rail.bind(this);
		this.handle = this.handle.bind(this);
	}

	#persist(): void {
		if (typeof window === 'undefined' || !this.storageKey) return;
		try {
			const data =
				this.axis === 'both'
					? { width: this.width, height: this.height, collapsed: this.isCollapsed }
					: this.isCollapsed
						? 0
						: this.axis === 'y'
							? this.height
							: this.width;
			localStorage.setItem(this.storageKey, JSON.stringify(data));
		} catch {
			// Ignore quota errors
		}
	}

	/** Primary minimum bound based on active axis */
	get min(): number {
		return this.axis === 'y' ? this.minHeight : this.minWidth;
	}

	/** Primary maximum bound based on active axis */
	get max(): number {
		return this.axis === 'y' ? this.maxHeight : this.maxWidth;
	}

	/** Alias for `isDragging` */
	get dragging(): boolean {
		return this.isDragging;
	}
	set dragging(val: boolean) {
		this.isDragging = val;
	}

	/** Alias for `isCollapsed` */
	get collapsed(): boolean {
		return this.isCollapsed;
	}
	set collapsed(val: boolean) {
		this.isCollapsed = val;
	}

	/** Configuration inspection helper */
	get config() {
		return {
			axis: this.axis,
			side: this.side,
			step: this.step,
			min: this.min,
			max: this.max
		};
	}

	/** Effective rendered width: returns 0 when collapsed, otherwise current width */
	get currentWidth(): number {
		return this.isCollapsed ? 0 : this.width;
	}

	/** Effective rendered height: returns 0 when collapsed, otherwise current height */
	get currentHeight(): number {
		return this.isCollapsed ? 0 : this.height;
	}

	/**
	 * Primary effective dimension in px:
	 * - returns `currentHeight` if `axis === 'y'`
	 * - returns `currentWidth` if `axis === 'x'`
	 */
	get current(): number {
		return this.axis === 'y' ? this.currentHeight : this.currentWidth;
	}

	/**
	 * Ready-to-use inline style string.
	 * @example `<aside style={sidebar.style}>`
	 */
	get style(): string {
		if (this.axis === 'x') {
			return `width: ${this.currentWidth}px;`;
		}
		if (this.axis === 'y') {
			return `height: ${this.currentHeight}px;`;
		}
		return `width: ${this.currentWidth}px; height: ${this.currentHeight}px;`;
	}

	/**
	 * CSS Custom Property declaration string for grid or CSS layouts.
	 * @example `<div style={sidebar.cssVar}>` -> `--sidebar-width: 280px;`
	 */
	get cssVar(): string {
		return `${this.varName}: ${this.current}px;`;
	}

	/**
	 * WAI-ARIA separator attributes object. Spread onto your rail element:
	 * `<div class="rail" {...sidebar.separator} {@attach sidebar.rail}></div>`
	 */
	get separator() {
		return {
			role: 'separator' as const,
			tabindex: 0,
			'aria-orientation': this.axis === 'y' ? ('horizontal' as const) : ('vertical' as const),
			'aria-valuenow': Math.round(this.current),
			'aria-valuemin': this.min,
			'aria-valuemax': this.max,
			'aria-label': `Resize ${this.axis === 'y' ? 'height' : 'width'}`
		};
	}

	/**
	 * Sets the target size directly, respecting bounds and collapse thresholds.
	 */
	set(wOrPrimary: number, h?: number): void {
		if (this.axis === 'y') {
			const targetH = wOrPrimary;
			if (this.collapseBelow !== undefined && targetH < this.collapseBelow) {
				this.collapse();
				return;
			}
			this.isCollapsed = false;
			this.height = clamp(targetH, this.minHeight, this.maxHeight);
		} else if (this.axis === 'x') {
			const targetW = wOrPrimary;
			if (this.collapseBelow !== undefined && targetW < this.collapseBelow) {
				this.collapse();
				return;
			}
			this.isCollapsed = false;
			this.width = clamp(targetW, this.minWidth, this.maxWidth);
		} else {
			// axis === 'both'
			this.isCollapsed = false;
			this.width = clamp(wOrPrimary, this.minWidth, this.maxWidth);
			if (typeof h === 'number') {
				this.height = clamp(h, this.minHeight, this.maxHeight);
			}
		}

		this.#persist();
		this.#emitResize();
	}

	/**
	 * Nudges dimensions by relative pixel amounts (used by keyboard arrow keys).
	 */
	nudge(deltaX: number, deltaY?: number): void {
		if (this.axis === 'y') {
			const base = this.isCollapsed ? this.minHeight : this.height;
			this.set(base + deltaX);
		} else if (this.axis === 'x') {
			const base = this.isCollapsed ? this.minWidth : this.width;
			this.set(base + deltaX);
		} else {
			const baseW = this.isCollapsed ? this.minWidth : this.width;
			const baseH = this.isCollapsed ? this.minHeight : this.height;
			this.set(baseW + deltaX, baseH + (deltaY ?? deltaX));
		}
	}

	/**
	 * Resets panel dimensions to configured initial values.
	 */
	reset(): void {
		this.isCollapsed = false;
		this.width = clamp(this.initialWidth, this.minWidth, this.maxWidth);
		this.height = clamp(this.initialHeight, this.minHeight, this.maxHeight);
		this.#persist();
		this.#emitResize();
	}

	/**
	 * Snaps panel to 0px (collapsed state).
	 */
	collapse(): void {
		this.isCollapsed = true;
		this.#persist();
		this.#onCollapse?.(true);
		this.#emitResize();
	}

	/**
	 * Restores panel from collapsed state back to last active or initial size.
	 */
	expand(): void {
		this.isCollapsed = false;
		if (this.width === 0) this.width = this.initialWidth || this.minWidth;
		if (this.height === 0) this.height = this.initialHeight || this.minHeight;
		this.#persist();
		this.#onCollapse?.(false);
		this.#emitResize();
	}

	/**
	 * Toggles between collapsed and restored dimensions.
	 */
	toggle(): void {
		if (this.isCollapsed) {
			this.expand();
		} else {
			this.collapse();
		}
	}

	#emitResize(event?: PointerEvent | KeyboardEvent, deltaX = 0, deltaY = 0): void {
		const detail: ResizableDetail = {
			width: this.currentWidth,
			height: this.currentHeight,
			deltaX,
			deltaY,
			isDragging: this.isDragging,
			collapsed: this.isCollapsed,
			axis: this.axis,
			side: this.side,
			event
		};
		this.#onResize?.(detail);
	}

	/**
	 * Svelte 5 Attachment Factory for attaching this controller directly to a rail element:
	 * `<div class="rail" {@attach sidebar.rail}></div>`
	 */
	/**
	 * Dual Action & Attachment method for connecting this controller to a rail element:
	 * - Svelte Action: `<div use:sidebar.rail></div>`
	 * - Svelte 5 Attach: `<div {@attach sidebar.rail}></div>`
	 */
	rail(element: HTMLElement): ActionReturn & (() => void) {
		return attachToNode(element, this);
	}

	/**
	 * Alias for `.rail`
	 */
	handle(element: HTMLElement): ActionReturn & (() => void) {
		return this.rail(element);
	}
}

/**
 * Creates a reactive Svelte 5 Resizable controller instance.
 *
 * @example
 * ```ts
 * const sidebar = createResizable({ axis: 'x', side: 'right', min: 180, max: 480 });
 * ```
 */
export function createResizable(options?: ResizableOptions): Resizable {
	return new Resizable(options);
}

/* -------------------------------------------------------------------------- */
/*                         Core Pointer Drag Engine                           */
/* -------------------------------------------------------------------------- */

/**
 * Attaches pointer drag listeners and keyboard accessibility to a DOM node.
 * Uses window-level event tracking during active drag so that fast movements,
 * gestures crossing iframe boundaries, and viewport exits never lose pointer tracking.
 */
function attachToNode(
	railElement: HTMLElement,
	optionsOrStore?: Resizable | ResizeRailOptions
): ActionReturn & (() => void) {
	if (typeof window === 'undefined') {
		const noop = () => {};
		noop.destroy = noop;
		noop.update = () => {};
		return noop as ActionReturn & (() => void);
	}

	return untrack(() => {
		let store: Resizable;
		let targetEl: HTMLElement | null = null;
		let applyStyles = true;

		if (optionsOrStore instanceof Resizable) {
			store = optionsOrStore;
		} else {
			const opts = optionsOrStore ?? {};
			store = new Resizable(opts);
			targetEl = resolveTargetElement(opts.target);
			applyStyles = opts.applyStyles ?? true;
		}

		const { axis, side, step, minWidth, maxWidth, minHeight, maxHeight } = store;

		// Direction multipliers for all 8 sides:
		// When side is left/top, pointer motion in positive direction (right/down) shrinks element
		const signX =
			side === 'left' || side === 'top-left' || side === 'bottom-left' ? -1 : 1;
		const signY =
			side === 'top' || side === 'top-left' || side === 'top-right' ? -1 : 1;

		if (applyStyles) {
			if (!railElement.style.touchAction) railElement.style.touchAction = 'none';
			if (!railElement.style.cursor) {
				if (axis === 'x') {
					railElement.style.cursor = 'col-resize';
				} else if (axis === 'y') {
					railElement.style.cursor = 'row-resize';
				} else {
					railElement.style.cursor =
						side === 'top-left' || side === 'bottom-right' ? 'nwse-resize' : 'nesw-resize';
				}
			}
		}

		// Apply WAI-ARIA separator attributes
		railElement.setAttribute('role', 'separator');
		railElement.setAttribute('tabindex', '0');
		railElement.setAttribute(
			'aria-orientation',
			axis === 'y' ? 'horizontal' : 'vertical'
		);
		railElement.setAttribute('aria-valuenow', String(Math.round(store.current)));
		railElement.setAttribute('aria-valuemin', String(store.min));
		railElement.setAttribute('aria-valuemax', String(store.max));
		railElement.setAttribute(
			'aria-label',
			`Resize ${axis === 'y' ? 'height' : axis === 'x' ? 'width' : 'panel'}`
		);

		let startX = 0;
		let startY = 0;
		let startWidth = 0;
		let startHeight = 0;
		let activePointerId = -1;

		function updateTarget(w: number, h: number) {
			if (targetEl) {
				if (axis === 'x' || axis === 'both') {
					targetEl.style.width = `${w}px`;
				}
				if (axis === 'y' || axis === 'both') {
					targetEl.style.height = `${h}px`;
				}
			}
		}

		function onPointerMove(event: PointerEvent) {
			if (!store.isDragging || event.pointerId !== activePointerId) return;

			const deltaX = (event.clientX - startX) * signX;
			const deltaY = (event.clientY - startY) * signY;

			if (axis === 'x') {
				const newWidth = startWidth + deltaX;
				store.set(newWidth);
				updateTarget(store.currentWidth, store.currentHeight);
			} else if (axis === 'y') {
				const newHeight = startHeight + deltaY;
				store.set(newHeight);
				updateTarget(store.currentWidth, store.currentHeight);
			} else {
				const newWidth = startWidth + deltaX;
				const newHeight = startHeight + deltaY;
				store.set(newWidth, newHeight);
				updateTarget(store.currentWidth, store.currentHeight);
			}

			railElement.setAttribute('aria-valuenow', String(Math.round(store.current)));

			const detail: ResizableDetail = {
				width: store.currentWidth,
				height: store.currentHeight,
				deltaX,
				deltaY,
				isDragging: true,
				collapsed: store.isCollapsed,
				axis,
				side,
				target: targetEl,
				event
			};

			railElement.dispatchEvent(new CustomEvent('resizing', { detail }));
			targetEl?.dispatchEvent(new CustomEvent('resizing', { detail }));
		}

		function onPointerUp(event: PointerEvent) {
			if (event.pointerId !== activePointerId) return;

			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointercancel', onPointerUp);
			document.documentElement.style.userSelect = '';

			store.isDragging = false;
			railElement.classList.remove('resizing', 'dragging');
			activePointerId = -1;

			if (railElement.hasPointerCapture(event.pointerId)) {
				try {
					railElement.releasePointerCapture(event.pointerId);
				} catch {
					// Ignore
				}
			}

			const detail: ResizableDetail = {
				width: store.currentWidth,
				height: store.currentHeight,
				deltaX: 0,
				deltaY: 0,
				isDragging: false,
				collapsed: store.isCollapsed,
				axis,
				side,
				target: targetEl,
				event
			};

			railElement.dispatchEvent(new CustomEvent('resized', { detail }));
			targetEl?.dispatchEvent(new CustomEvent('resized', { detail }));
		}

		function onPointerDown(event: PointerEvent) {
			if (event.button !== 0) return;

			activePointerId = event.pointerId;
			startX = event.clientX;
			startY = event.clientY;

			if (targetEl) {
				const rect = targetEl.getBoundingClientRect();
				startWidth = rect.width;
				startHeight = rect.height;
			} else {
				startWidth = store.currentWidth || store.minWidth || store.min;
				startHeight = store.currentHeight || store.minHeight || store.min;
			}

			store.isDragging = true;
			railElement.classList.add('resizing', 'dragging');

			try {
				railElement.setPointerCapture(activePointerId);
			} catch {
				// Window listeners ensure tracking persists even if capture fails
			}

			document.documentElement.style.userSelect = 'none';
			window.addEventListener('pointermove', onPointerMove, { passive: false });
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);

			event.preventDefault();

			const detail: ResizableDetail = {
				width: store.currentWidth,
				height: store.currentHeight,
				deltaX: 0,
				deltaY: 0,
				isDragging: true,
				collapsed: store.isCollapsed,
				axis,
				side,
				target: targetEl,
				event
			};

			railElement.dispatchEvent(new CustomEvent('resizestart', { detail }));
			targetEl?.dispatchEvent(new CustomEvent('resizestart', { detail }));
		}

		function onKeyDown(event: KeyboardEvent) {
			const nudgeAmount = event.shiftKey ? step * 4 : step;

			switch (event.key) {
				case 'ArrowLeft':
					if (axis === 'x' || axis === 'both') {
						store.nudge(-nudgeAmount * signX, 0);
						updateTarget(store.currentWidth, store.currentHeight);
						event.preventDefault();
					}
					break;
				case 'ArrowRight':
					if (axis === 'x' || axis === 'both') {
						store.nudge(nudgeAmount * signX, 0);
						updateTarget(store.currentWidth, store.currentHeight);
						event.preventDefault();
					}
					break;
				case 'ArrowUp':
					if (axis === 'y' || axis === 'both') {
						store.nudge(0, -nudgeAmount * signY);
						updateTarget(store.currentWidth, store.currentHeight);
						event.preventDefault();
					}
					break;
				case 'ArrowDown':
					if (axis === 'y' || axis === 'both') {
						store.nudge(0, nudgeAmount * signY);
						updateTarget(store.currentWidth, store.currentHeight);
						event.preventDefault();
					}
					break;
				case 'Home':
					if (axis === 'y') store.set(minHeight);
					else store.set(minWidth);
					updateTarget(store.currentWidth, store.currentHeight);
					event.preventDefault();
					break;
				case 'End':
					if (axis === 'y') store.set(maxHeight);
					else store.set(maxWidth);
					updateTarget(store.currentWidth, store.currentHeight);
					event.preventDefault();
					break;
				case 'Enter':
				case ' ':
					store.toggle();
					updateTarget(store.currentWidth, store.currentHeight);
					event.preventDefault();
					break;
				default:
					return;
			}

			railElement.setAttribute('aria-valuenow', String(Math.round(store.current)));
		}

		function onDoubleClick() {
			store.reset();
			updateTarget(store.currentWidth, store.currentHeight);
		}

		railElement.addEventListener('pointerdown', onPointerDown);
		railElement.addEventListener('keydown', onKeyDown);
		railElement.addEventListener('dblclick', onDoubleClick);

		const cleanup = () => {
			railElement.removeEventListener('pointerdown', onPointerDown);
			railElement.removeEventListener('keydown', onKeyDown);
			railElement.removeEventListener('dblclick', onDoubleClick);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointercancel', onPointerUp);
			document.documentElement.style.userSelect = '';
		};

		const actionObj = cleanup as unknown as ActionReturn & (() => void) & {
			update: (newOpts?: any) => void;
		};
		actionObj.destroy = cleanup;
		actionObj.update = () => {};
		return actionObj;
	});
}

/* -------------------------------------------------------------------------- */
/*               Standalone Resize Rail / Handle Action & Attachment          */
/* -------------------------------------------------------------------------- */

/**
 * Universal Svelte 5 Resize Rail / Handle.
 * Can be used as a Svelte action or an attachment factory:
 * - `<div use:resizeRail={sidebar}></div>`
 * - `<div use:sidebar.rail></div>`
 * - `<div {@attach sidebar.rail}></div>`
 * - `<div {@attach resizeRail(sidebar)}></div>`
 */
export function resizeRail(
	arg1?: HTMLElement | Resizable | ResizeRailOptions,
	arg2?: Resizable | ResizeRailOptions
): any {
	if (typeof window !== 'undefined' && arg1 instanceof HTMLElement) {
		return attachToNode(arg1, arg2);
	}
	return (railElement: HTMLElement) => attachToNode(railElement, arg1 as any);
}

/** Alias for `resizeRail` */
export const resizeHandle = resizeRail;

/**
 * Universal Resizable helper:
 * - When called with options: creates and returns a reactive `Resizable` instance.
 * - When used as an action: `<div use:resizable={opts}>` makes element resizable.
 */
export function resizable(
	arg1?: HTMLElement | ResizableOptions,
	arg2?: ResizableOptions
): any {
	if (typeof window !== 'undefined' && arg1 instanceof HTMLElement) {
		const opts: ResizeRailOptions = {
			...arg2,
			target: arg1
		};
		return attachToNode(arg1, opts);
	}
	if (arg1 instanceof Resizable) {
		return arg1;
	}
	return new Resizable(arg1 as ResizableOptions | undefined);
}

/* -------------------------------------------------------------------------- */
/*                   ResizeObserver Attachment (Measurement)                  */
/* -------------------------------------------------------------------------- */

function setupObserver(
	element: HTMLElement,
	callback?: ResizeObserverCallback,
	options?: ResizeObserverOptions
): ActionReturn & (() => void) {
	if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
		const noop = () => {};
		noop.destroy = noop;
		noop.update = () => {};
		return noop as ActionReturn & (() => void);
	}
	if (options?.enabled === false) {
		const noop = () => {};
		noop.destroy = noop;
		noop.update = () => {};
		return noop as ActionReturn & (() => void);
	}

	const ro = new ResizeObserver((entries) => {
		for (const entry of entries) {
			const borderBox = entry.borderBoxSize?.[0];
			const contentBox = entry.contentRect;

			const detail: ResizeObserverDetail = {
				observer: ro,
				entry,
				width: contentBox.width,
				height: contentBox.height,
				borderBoxWidth: borderBox?.inlineSize,
				borderBoxHeight: borderBox?.blockSize
			};

			callback?.(detail);
			element.dispatchEvent(new CustomEvent<ResizeObserverDetail>('resized', { detail }));
		}
	});

	ro.observe(element, { box: options?.box ?? 'border-box' });

	const cleanup = () => {
		ro.disconnect();
	};

	const actionObj = cleanup as unknown as ActionReturn & (() => void) & {
		update: (cb?: any) => void;
	};
	actionObj.destroy = cleanup;
	actionObj.update = () => {};
	return actionObj;
}

/**
 * Universal Svelte 5 Resize Observer.
 * Works both as a Svelte action (`use:observeResize={callback}`)
 * and as an attachment factory (`{@attach observeResize(callback)}`).
 */
export function observeResize(
	arg1?: HTMLElement | ResizeObserverCallback,
	arg2?: ResizeObserverOptions | ResizeObserverCallback
): any {
	if (typeof window !== 'undefined' && arg1 instanceof HTMLElement) {
		const cb = typeof arg2 === 'function' ? arg2 : undefined;
		const opts = typeof arg2 === 'object' ? arg2 : undefined;
		return setupObserver(arg1, cb, opts);
	}
	const cb = typeof arg1 === 'function' ? arg1 : undefined;
	const opts = typeof arg2 === 'object' ? arg2 : undefined;
	return (element: HTMLElement) => setupObserver(element, cb, opts);
}

/* -------------------------------------------------------------------------- */
/*               Polymorphic Entrypoint & Backwards Compatibility             */
/* -------------------------------------------------------------------------- */

/**
 * Universal resize attachment factory:
 * - If passed a callback: functions as an observer (`observeResize`).
 * - If passed a controller or options: functions as an interactive resizer (`resizeRail`).
 */
export function resize(
	callbackOrOptions?: ResizeObserverCallback | Resizable | ResizeRailOptions,
	maybeOptions?: ResizeObserverOptions
): (element: HTMLElement) => any {
	if (typeof callbackOrOptions === 'function') {
		return observeResize(callbackOrOptions, maybeOptions);
	}
	return resizeRail(callbackOrOptions);
}

/**
 * Interactive Svelte Action for `use:resizeAction`.
 * - When given a callback: acts as a ResizeObserver.
 * - When given a Resizable instance or options: interactively resizes the target/element.
 */
export function resizeAction(
	node: HTMLElement,
	params?: ResizeObserverCallback | ResizeObserverOptions | ResizableOptions | Resizable
): ActionReturn {
	let cleanup: (() => void) | void;

	function setup(p?: ResizeObserverCallback | ResizeObserverOptions | ResizableOptions | Resizable) {
		cleanup?.();
		if (typeof p === 'function') {
			cleanup = setupObserver(node, p);
		} else if (p instanceof Resizable) {
			cleanup = attachToNode(node, p);
		} else if (p && ('axis' in p || 'side' in p || 'min' in p || 'max' in p || 'initial' in p)) {
			cleanup = attachToNode(node, p as ResizeRailOptions);
		} else {
			cleanup = setupObserver(node, undefined, p as ResizeObserverOptions);
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
