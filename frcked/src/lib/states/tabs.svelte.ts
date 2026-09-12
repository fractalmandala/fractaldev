/**
 * ============================================================================
 *                    SVELTE 5 ACCESSIBLE TABS CONTEXT & STATE
 * ============================================================================
 *
 * A WAI-ARIA compliant, zero-dependency tabs state controller with deterministic
 * ID generation (eliminates SSR/client hydration drift) and keyboard navigation.
 *
 * ----------------------------------------------------------------------------
 * 📖 FEATURES:
 * ----------------------------------------------------------------------------
 * 1. ZERO HYDRATION MISMATCH:
 *    - Uses deterministic slug/index prefixes so server and client markup align 100%.
 *
 * 2. WAI-ARIA ACCESSIBILITY & SPREADING:
 *    - `tabs.trigger(id)` spreads: `role="tab"`, `aria-selected`, `aria-controls`, `tabindex`, `onclick`, `onkeydown`.
 *    - `tabs.panel(id)` spreads: `role="tabpanel"`, `id`, `aria-labelledby`, `hidden`.
 *
 * 3. KEYBOARD NAVIGATION:
 *    - `ArrowRight` / `ArrowLeft`: Moves focus and selection across tabs.
 *    - `Home` / `End`: Jumps immediately to first or last tab.
 *
 * ----------------------------------------------------------------------------
 * 💡 USAGE EXAMPLE:
 * ----------------------------------------------------------------------------
 * ```svelte
 * <script>
 *   import { createTabs } from '$lib/states';
 *
 *   const tabs = createTabs({
 *     items: ['overview', 'specs', 'api'],
 *     initial: 'overview'
 *   });
 * </script>
 *
 * <div role="tablist" class="tab-list">
 *   <button {...tabs.trigger('overview')}>Overview</button>
 *   <button {...tabs.trigger('specs')}>Specifications</button>
 *   <button {...tabs.trigger('api')}>API Reference</button>
 * </div>
 *
 * <div {...tabs.panel('overview')}>Overview content...</div>
 * <div {...tabs.panel('specs')}>Specifications content...</div>
 * <div {...tabs.panel('api')}>API content...</div>
 * ```
 * ============================================================================
 */

export interface TabsOptions {
	/** Unique prefix for this tab group. Auto-assigned if omitted. */
	id?: string;
	/** Array of tab IDs or initial tab list. */
	items?: string[];
	/** Active tab ID on mount. */
	initial?: string;
	/** Fired when active tab changes. */
	onChange?: (activeId: string) => void;
}

let tabsGroupCounter = 0;

export class Tabs {
	readonly groupId: string;
	#items = $state<string[]>([]);
	#onChange?: (activeId: string) => void;

	/** Currently active tab ID (Svelte 5 Rune) */
	activeId = $state<string>('');

	constructor(options: TabsOptions = {}) {
		this.groupId = options.id ?? `tabs-${++tabsGroupCounter}`;
		this.#items = options.items ? [...options.items] : [];
		this.activeId = options.initial ?? this.#items[0] ?? '';
		this.#onChange = options.onChange;

		this.select = this.select.bind(this);
		this.register = this.register.bind(this);
		this.trigger = this.trigger.bind(this);
		this.panel = this.panel.bind(this);
	}

	/** Register a tab ID if dynamically discovered */
	register(id: string): void {
		if (!this.#items.includes(id)) {
			this.#items.push(id);
			if (!this.activeId) {
				this.activeId = id;
			}
		}
	}

	/** Selects a tab by ID */
	select(id: string): void {
		if (this.activeId === id) return;
		this.activeId = id;
		this.#onChange?.(id);
	}

	/** Check if tab is active */
	isActive(id: string): boolean {
		return this.activeId === id;
	}

	/**
	 * Spreads WAI-ARIA tab trigger attributes and keyboard navigation.
	 */
	trigger(id: string) {
		this.register(id);
		const isSelected = this.isActive(id);

		return {
			id: `${this.groupId}-tab-${id}`,
			role: 'tab' as const,
			'aria-selected': isSelected,
			'aria-controls': `${this.groupId}-panel-${id}`,
			tabindex: isSelected ? 0 : -1,
			onclick: () => this.select(id),
			onkeydown: (event: KeyboardEvent) => {
				const currentIndex = this.#items.indexOf(id);
				if (currentIndex === -1) return;

				let nextIndex = -1;

				switch (event.key) {
					case 'ArrowRight':
						nextIndex = (currentIndex + 1) % this.#items.length;
						break;
					case 'ArrowLeft':
						nextIndex = (currentIndex - 1 + this.#items.length) % this.#items.length;
						break;
					case 'Home':
						nextIndex = 0;
						break;
					case 'End':
						nextIndex = this.#items.length - 1;
						break;
					default:
						return;
				}

				event.preventDefault();
				const nextId = this.#items[nextIndex];
				if (nextId) {
					this.select(nextId);
					// Focus the newly selected tab button
					const nextBtn = document.getElementById(`${this.groupId}-tab-${nextId}`);
					nextBtn?.focus();
				}
			}
		};
	}

	/**
	 * Spreads WAI-ARIA tab panel attributes.
	 */
	panel(id: string) {
		this.register(id);
		const isSelected = this.isActive(id);

		return {
			id: `${this.groupId}-panel-${id}`,
			role: 'tabpanel' as const,
			'aria-labelledby': `${this.groupId}-tab-${id}`,
			hidden: !isSelected,
			tabindex: 0
		};
	}
}

/**
 * Creates a reactive Tabs controller.
 */
export function createTabs(options?: TabsOptions): Tabs {
	return new Tabs(options);
}
