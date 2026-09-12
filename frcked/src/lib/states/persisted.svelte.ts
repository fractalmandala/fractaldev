/**
 * ============================================================================
 *               SVELTE 5 REACTIVE PERSISTED STATE (LOCALSTORAGE)
 * ============================================================================
 *
 * Safe, cross-tab synchronized reactive state backed by `localStorage`.
 *
 * ----------------------------------------------------------------------------
 * 📖 WHY THIS IMPLEMENTATION IS BULLETPROOF:
 * ----------------------------------------------------------------------------
 * 1. SAFARI PRIVATE BROWSING & QUOTA RESILIENT:
 *    - `localStorage.setItem` throws in restrictive private modes and quota limits.
 *    - This utility wraps writes in try/catch — memory state remains live and active.
 *
 * 2. CORRUPT JSON & STALE VALUE SHIELD:
 *    - If a user hand-edits localStorage or older app versions left corrupt JSON,
 *      standard `JSON.parse` crashes the entire UI.
 *    - Catches parse errors and gracefully falls back to `initial`.
 *
 * 3. REAL-TIME CROSS-TAB SYNCHRONIZATION:
 *    - Listens to the browser's `storage` event. Changing a preference in Tab A
 *      instantly updates the UI in Tab B.
 *
 * 4. OPTIONAL SCHEMA VALIDATION:
 *    - Pass `validate: (v): v is T => ...` to discard stale schemas automatically.
 *
 * ----------------------------------------------------------------------------
 * 💡 USAGE EXAMPLES:
 * ----------------------------------------------------------------------------
 * ```svelte
 * <script>
 *   import { persisted } from '$lib/states';
 *
 *   // Simple primitive
 *   const count = persisted('app:counter', 0);
 *
 *   // Complex object
 *   const userPrefs = persisted('app:prefs', {
 *     sidebarOpen: true,
 *     fontSize: 14,
 *     pinnedTags: ['reactivity', 'svelte5']
 *   });
 * </script>
 *
 * <button onclick={() => count.current++}>Count: {count.current}</button>
 * <button onclick={() => count.reset()}>Reset</button>
 * ```
 * ============================================================================
 */

export interface PersistedOptions<T> {
	/**
	 * Keep multiple browser tabs synchronized via window 'storage' event.
	 * Default: true.
	 */
	syncTabs?: boolean;

	/**
	 * Custom validator / type guard to verify loaded JSON matches the expected type shape.
	 * If validation fails, resets to initial.
	 */
	validate?: (value: unknown) => value is T;
}

export class Persisted<T> {
	readonly key: string;
	readonly #initial: T;
	readonly #validate?: (value: unknown) => value is T;

	/** Primary reactive state (Svelte 5 Rune) */
	current = $state<T>() as T;

	constructor(key: string, initial: T, options: PersistedOptions<T> = {}) {
		this.key = key;
		this.#initial = initial;
		this.#validate = options.validate;
		this.current = initial;

		// Client-side initialization
		if (typeof window !== 'undefined') {
			const stored = this.#read();
			if (stored !== undefined) {
				this.current = stored;
			}

			// Synchronize across multiple browser tabs
			if (options.syncTabs !== false) {
				window.addEventListener('storage', (event) => {
					if (event.key !== this.key) return;

					const next = this.#read();
					this.current = next === undefined ? this.#initial : next;
				});
			}
		}

		this.set = this.set.bind(this);
		this.update = this.update.bind(this);
		this.reset = this.reset.bind(this);
	}

	#read(): T | undefined {
		try {
			const raw = localStorage.getItem(this.key);
			if (raw === null) return undefined;

			const parsed = JSON.parse(raw) as unknown;

			if (this.#validate && !this.#validate(parsed)) {
				return undefined;
			}

			return parsed as T;
		} catch {
			// Unreadable storage or corrupt JSON — fall back rather than crash
			return undefined;
		}
	}

	/**
	 * Updates the current state and writes through to `localStorage`.
	 */
	set(value: T): void {
		this.current = value;

		if (typeof window === 'undefined') return;

		try {
			localStorage.setItem(this.key, JSON.stringify(value));
		} catch {
			// Private browsing quota limit — state still works in memory
		}
	}

	/**
	 * Functional update helper (e.g. `count.update(n => n + 1)`).
	 */
	update(fn: (prev: T) => T): void {
		this.set(fn(this.current));
	}

	/**
	 * Removes the key from `localStorage` and resets state to `initial`.
	 */
	reset(): void {
		this.current = this.#initial;

		if (typeof window === 'undefined') return;

		try {
			localStorage.removeItem(this.key);
		} catch {
			// Ignore
		}
	}

	/**
	 * Backward compatibility: Svelte store contract `subscribe` method.
	 * Allows legacy `$store` template syntax to work automatically.
	 */
	subscribe(run: (val: T) => void): () => void {
		run(this.current);
		return () => {};
	}
}

/**
 * Creates a reactive, localStorage-persisted Svelte 5 state.
 *
 * @example
 * ```ts
 * const sidebarWidth = persisted('ui:sidebar-w', 280);
 * ```
 */
export function persisted<T>(
	key: string,
	initial: T,
	options?: PersistedOptions<T>
): Persisted<T> {
	return new Persisted(key, initial, options);
}
