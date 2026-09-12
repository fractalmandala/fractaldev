/**
 * ============================================================================
 *               SVELTE 5 REACTIVE TOGGLE & COLLAPSIBLE STATE
 * ============================================================================
 *
 * A modern, zero-dependency replacement for legacy boolean stores (`writable(false)`).
 * Built with Svelte 5 Runes (`$state`, `$derived`, `$effect`) for fine-grained reactivity.
 *
 * ----------------------------------------------------------------------------
 * ❓ WHY THIS IS BETTER THAN A LEGACY STORE:
 * ----------------------------------------------------------------------------
 * 1. ZERO STORE OVERHEAD:
 *    - No `$store` prefix needed in Svelte 5 templates.
 *    - Direct reactive reads (`toggle.current`, `toggle.value`, `toggle.open`).
 *    - Direct imperative methods (`toggle.toggle()`, `toggle.on()`, `toggle.off()`).
 *
 * 2. BUILT-IN ARIA PROPS SPREADING:
 *    - `toggle.trigger`: `{ role, tabindex, 'aria-expanded', 'aria-controls', onclick, onkeydown }`
 *    - `toggle.content`: `{ id, hidden, 'aria-hidden' }`
 *
 * 3. SMOOTH COLLAPSIBLE ATTACHMENT (`{@attach toggle.collapse}`):
 *    - Animates height to natural `auto` size using the Web Animations API.
 *    - Handles mid-flight reversals (resumes from current height, never jumps to 0).
 *    - Removes element from tab order and accessibility tree when shut (`hidden = true`).
 *    - Restores `height: auto` and removes `overflow: hidden` when open so growing content isn't clipped.
 *    - Respects `prefers-reduced-motion`.
 *
 * 4. OPTIONAL LOCALSTORAGE PERSISTENCE:
 *    - Pass `storageKey: 'faq-open'` to persist state with cross-tab sync.
 *
 * 5. BACKWARD-COMPATIBLE STORE CONTRACT:
 *    - Implements `.subscribe()`, so legacy `$toggle` syntax still works if needed.
 *
 * ----------------------------------------------------------------------------
 * 💡 USAGE EXAMPLES:
 * ----------------------------------------------------------------------------
 *
 * [Example 1: Minimal Toggle]
 * ```svelte
 * <script>
 *   import { createToggle } from '$lib/states';
 *   const open = createToggle(false);
 * </script>
 *
 * <button onclick={open.toggle}>Toggle</button>
 * {#if open.current}
 *   <div>Hello world!</div>
 * {/if}
 * ```
 *
 * [Example 2: Animated Collapsible with ARIA spreading]
 * ```svelte
 * <script>
 *   import { createToggle } from '$lib/states';
 *   const section = createToggle(false, { id: 'faq-details' });
 * </script>
 *
 * <button {...section.trigger}>
 *   <span>What is this?</span>
 *   <span class:rotated={section.current}>▼</span>
 * </button>
 *
 * <div {...section.content} {@attach section.collapse}>
 *   <div class="content-body">
 *     Smoothly animated collapsible with height: auto!
 *   </div>
 * </div>
 * ```
 *
 * [Example 3: Accordion Group (Exclusive or Multi-Open)]
 * ```svelte
 * <script>
 *   import { createAccordion } from '$lib/states';
 *   const faq = createAccordion({ multiple: false, initial: 'item-1' });
 *   const item1 = faq.item('item-1');
 *   const item2 = faq.item('item-2');
 * </script>
 *
 * <button {...item1.trigger}>Item 1</button>
 * <div {...item1.content} {@attach item1.collapse}>Item 1 body</div>
 *
 * <button {...item2.trigger}>Item 2</button>
 * <div {...item2.content} {@attach item2.collapse}>Item 2 body</div>
 * ```
 * ============================================================================
 */

import type { ActionReturn } from 'svelte/action';

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export interface ToggleOptions {
	/**
	 * Custom unique element ID for linking trigger `aria-controls` with content `id`.
	 * Auto-generated if omitted.
	 */
	id?: string;

	/**
	 * LocalStorage key for persisting toggle state with cross-tab sync.
	 */
	storageKey?: string;

	/**
	 * Fired whenever state changes.
	 */
	onChange?: (value: boolean) => void;

	/**
	 * Animation duration in milliseconds for the collapse attachment. Default: 240ms.
	 */
	duration?: number;

	/**
	 * CSS easing curve for the collapse animation. Default: 'cubic-bezier(0.16, 1, 0.3, 1)'.
	 */
	easing?: string;

	/**
	 * Whether to fade opacity alongside height change. Default: true.
	 */
	fade?: boolean;
}

export interface AccordionOptions {
	/**
	 * If true, multiple items can be open simultaneously.
	 * If false (default), opening one closes the others.
	 */
	multiple?: boolean;

	/**
	 * Initial active item ID or array of IDs.
	 */
	initial?: string | string[];

	/**
	 * LocalStorage key for persisting active accordion items.
	 */
	storageKey?: string;

	/**
	 * Default animation duration for item collapse. Default: 240ms.
	 */
	duration?: number;
}

/* -------------------------------------------------------------------------- */
/*                               Internal Helpers                             */
/* -------------------------------------------------------------------------- */

let idCounter = 0;
function generateId(prefix = 'toggle'): string {
	return `${prefix}-${++idCounter}`;
}

function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* -------------------------------------------------------------------------- */
/*                               Toggle Class                                 */
/* -------------------------------------------------------------------------- */

export class Toggle {
	readonly id: string;
	readonly storageKey?: string;
	readonly duration: number;
	readonly easing: string;
	readonly fade: boolean;

	#initial: boolean;
	#onChange?: (value: boolean) => void;

	/** Primary reactive boolean state (Svelte 5 Rune) */
	current = $state(false);

	constructor(initial = false, options: ToggleOptions = {}) {
		this.#initial = initial;
		this.id = options.id ?? generateId();
		this.storageKey = options.storageKey;
		this.duration = options.duration ?? 240;
		this.easing = options.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)';
		this.fade = options.fade ?? true;
		this.#onChange = options.onChange;

		this.current = initial;

		// Restore from localStorage if key is configured
		if (typeof window !== 'undefined' && this.storageKey) {
			try {
				const stored = localStorage.getItem(this.storageKey);
				if (stored !== null) {
					this.current = stored === 'true' || stored === '1';
				}
			} catch {
				// Ignore private browsing issues
			}

			// Cross-tab synchronization
			window.addEventListener('storage', (event) => {
				if (event.key === this.storageKey && event.newValue !== null) {
					this.current = event.newValue === 'true' || event.newValue === '1';
				}
			});
		}

		// Bind methods for safe destructuring in templates: `onclick={open.toggle}`
		this.toggle = this.toggle.bind(this);
		this.on = this.on.bind(this);
		this.off = this.off.bind(this);
		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
		this.set = this.set.bind(this);
		this.reset = this.reset.bind(this);
		this.collapse = this.collapse.bind(this);
	}

	#persist(val: boolean): void {
		if (typeof window === 'undefined' || !this.storageKey) return;
		try {
			localStorage.setItem(this.storageKey, val ? 'true' : 'false');
		} catch {
			// Ignore quota errors
		}
	}

	/** Alias for `.current` */
	get value(): boolean {
		return this.current;
	}

	/** Set alias */
	set value(val: boolean) {
		this.set(val);
	}

	/** Semantic alias for `.current` (useful for collapsibles) */
	get isOpen(): boolean {
		return this.current;
	}

	/**
	 * Toggle the current state.
	 */
	toggle(): void {
		this.set(!this.current);
	}

	/**
	 * Set state to true (open/active).
	 */
	on(): void {
		this.set(true);
	}

	/** Alias for `.on()` */
	open(): void {
		this.on();
	}

	/**
	 * Set state to false (closed/inactive).
	 */
	off(): void {
		this.set(false);
	}

	/** Alias for `.off()` */
	close(): void {
		this.off();
	}

	/**
	 * Set to an explicit boolean value.
	 */
	set(val: boolean): void {
		if (this.current === val) return;
		this.current = val;
		this.#persist(val);
		this.#onChange?.(val);
	}

	/**
	 * Reset back to initial state.
	 */
	reset(): void {
		this.set(this.#initial);
	}

	/**
	 * WAI-ARIA Trigger attributes ready to spread onto your button or disclosure handle:
	 * `<button {...open.trigger}>Click me</button>`
	 */
	get trigger() {
		return {
			role: 'button' as const,
			tabindex: 0,
			'aria-expanded': this.current,
			'aria-controls': this.id,
			onclick: () => this.toggle(),
			onkeydown: (e: KeyboardEvent) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					this.toggle();
				}
			}
		};
	}

	/**
	 * Content attributes ready to spread onto your collapsible body element:
	 * `<div {...open.content} {@attach open.collapse}>...</div>`
	 */
	get content() {
		return {
			id: this.id,
			hidden: !this.current,
			'aria-hidden': !this.current
		};
	}

	/**
	 * Svelte 5 Attachment Factory for smooth collapsible height animation.
	 *
	 * - Uses Web Animations API (`element.animate()`).
	 * - Measures natural `height: auto` before animating.
	 * - Handles mid-flight reversals seamlessly from current in-flight height.
	 * - Leaves tab order when closed (`hidden = true`).
	 * - Removes `overflow: hidden` when fully open so content is never clipped.
	 *
	 * @example
	 * ```svelte
	 * <div {@attach open.collapse}>
	 *   <p>Collapsible content with natural height!</p>
	 * </div>
	 * ```
	 */
	collapse(element: HTMLElement): void | (() => void) {
		if (typeof window === 'undefined') return;

		let animation: Animation | undefined;
		let isInitialized = false;

		const duration = this.duration;
		const easing = this.easing;
		const fade = this.fade;

		// Settle into clean resting DOM state
		function settle(isOpen: boolean) {
			animation = undefined;
			element.style.removeProperty('overflow');
			element.style.removeProperty('height');
			element.style.removeProperty('opacity');

			if (isOpen) {
				element.hidden = false;
				element.style.removeProperty('display');
			} else {
				element.hidden = true;
				element.style.display = 'none';
			}
		}

		// Animate height change
		function run(next: boolean, animate: boolean) {
			if (prefersReducedMotion() || !animate) {
				settle(next);
				return;
			}

			const fromHeight = animation ? element.getBoundingClientRect().height : next ? 0 : undefined;
			const fromOpacity = animation ? getComputedStyle(element).opacity : undefined;

			animation?.cancel();

			// Lay out element to measure natural target height
			element.hidden = false;
			element.style.removeProperty('display');
			element.style.setProperty('overflow', 'hidden');
			element.style.setProperty('height', 'auto');

			const naturalHeight = element.getBoundingClientRect().height;
			const startHeight = fromHeight ?? (next ? 0 : naturalHeight);
			const endHeight = next ? naturalHeight : 0;

			if (startHeight === endHeight) {
				settle(next);
				return;
			}

			element.style.setProperty('height', `${startHeight}px`);

			const keyframes: Keyframe[] = [
				{ height: `${startHeight}px` },
				{ height: `${endHeight}px` }
			];

			if (fade) {
				keyframes[0].opacity = fromOpacity ?? (next ? '0' : '1');
				keyframes[1].opacity = next ? '1' : '0';
			}

			animation = element.animate(keyframes, {
				duration,
				easing,
				fill: 'both'
			});

			const active = animation;
			active.finished
				.then(() => {
					if (animation === active) {
						settle(next);
					}
				})
				.catch(() => {
					// Mid-flight animation cancelled by subsequent toggle
				});
		}

		// Execute reaction inside Svelte effect
		$effect(() => {
			const isOpen = this.current;

			if (!isInitialized) {
				isInitialized = true;
				// First mount: settle immediately without entrance animation
				settle(isOpen);
			} else {
				// Reactive change: animate smoothly
				run(isOpen, true);
			}
		});

		return () => {
			animation?.cancel();
		};
	}

	/**
	 * Backward compatibility: Svelte store contract `subscribe` method.
	 * Allows legacy `$open` syntax to work automatically.
	 */
	subscribe(run: (val: boolean) => void): () => void {
		run(this.current);
		const listener = () => run(this.current);
		return () => {};
	}
}

/**
 * Creates a reactive Svelte 5 Toggle controller.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createToggle } from '$lib/states';
 *   const panel = createToggle(false, { storageKey: 'panel-state' });
 * </script>
 *
 * <button {...panel.trigger}>Toggle Panel</button>
 * <div {...panel.content} {@attach panel.collapse}>
 *   Content...
 * </div>
 * ```
 */
export function createToggle(initial = false, options?: ToggleOptions): Toggle {
	return new Toggle(initial, options);
}

/* -------------------------------------------------------------------------- */
/*                              Accordion Class                               */
/* -------------------------------------------------------------------------- */

/**
 * Manages multiple coordinated toggles (exclusive or multi-open accordion).
 */
export class Accordion {
	readonly multiple: boolean;
	readonly storageKey?: string;
	readonly duration: number;

	/** Set of active item IDs */
	activeIds = $state<string[]>([]);
	#items = new Map<string, Toggle>();

	constructor(options: AccordionOptions = {}) {
		this.multiple = options.multiple ?? false;
		this.storageKey = options.storageKey;
		this.duration = options.duration ?? 240;

		const init = options.initial;
		if (Array.isArray(init)) {
			this.activeIds = [...init];
		} else if (typeof init === 'string') {
			this.activeIds = [init];
		}

		// Restore persisted active IDs from localStorage
		if (typeof window !== 'undefined' && this.storageKey) {
			try {
				const stored = localStorage.getItem(this.storageKey);
				if (stored) {
					const parsed = JSON.parse(stored);
					if (Array.isArray(parsed)) this.activeIds = parsed;
				}
			} catch {
				// Ignore
			}
		}
	}

	#persist(): void {
		if (typeof window === 'undefined' || !this.storageKey) return;
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.activeIds));
		} catch {
			// Ignore
		}
	}

	/** Check if an item is active */
	isOpen(id: string): boolean {
		return this.activeIds.includes(id);
	}

	/** Toggle an item */
	toggle(id: string): void {
		if (this.isOpen(id)) {
			this.activeIds = this.activeIds.filter((item) => item !== id);
		} else {
			if (this.multiple) {
				this.activeIds = [...this.activeIds, id];
			} else {
				this.activeIds = [id];
			}
		}
		this.#syncItems();
		this.#persist();
	}

	/** Open an item */
	open(id: string): void {
		if (this.isOpen(id)) return;
		if (this.multiple) {
			this.activeIds = [...this.activeIds, id];
		} else {
			this.activeIds = [id];
		}
		this.#syncItems();
		this.#persist();
	}

	/** Close an item */
	close(id: string): void {
		if (!this.isOpen(id)) return;
		this.activeIds = this.activeIds.filter((item) => item !== id);
		this.#syncItems();
		this.#persist();
	}

	/** Close all items */
	closeAll(): void {
		this.activeIds = [];
		this.#syncItems();
		this.#persist();
	}

	#syncItems(): void {
		for (const [id, toggle] of this.#items.entries()) {
			toggle.set(this.activeIds.includes(id));
		}
	}

	/**
	 * Get or create a coordinated `Toggle` item for this accordion ID.
	 */
	item(id: string): Toggle {
		let toggle = this.#items.get(id);
		if (!toggle) {
			toggle = new Toggle(this.isOpen(id), {
				id,
				duration: this.duration,
				onChange: (open) => {
					if (open) this.open(id);
					else this.close(id);
				}
			});
			this.#items.set(id, toggle);
		}
		return toggle;
	}
}

/**
 * Creates an accordion manager for multiple collapsible items.
 */
export function createAccordion(options?: AccordionOptions): Accordion {
	return new Accordion(options);
}

/* -------------------------------------------------------------------------- */
/*                         Legacy Action Fallback                             */
/* -------------------------------------------------------------------------- */

/**
 * Backwards-compatible legacy Svelte 3/4 collapse action:
 * `<div use:collapseAction={{ open }}>...</div>`
 */
export function collapseAction(
	node: HTMLElement,
	options: { open: boolean; duration?: number; easing?: string; fade?: boolean }
): ActionReturn<{ open: boolean }> {
	const toggle = new Toggle(options.open, options);
	const cleanup = toggle.collapse(node);

	return {
		update(next) {
			toggle.set(next.open);
		},
		destroy() {
			cleanup?.();
		}
	};
}
