/**
 * Reactive state backed by localStorage.
 *
 * Every hand-rolled version of this forgets one of: the try/catch (private
 * mode throws on write), the JSON parse guard (a stale or hand-edited value
 * takes the app down), or cross-tab sync. This has all three.
 */

export interface PersistedOptions<T> {
	/** Keep multiple tabs in step via the `storage` event. Default true. */
	syncTabs?: boolean;
	/** Reject stored values that no longer fit the shape you expect. */
	validate?: (value: unknown) => value is T;
}

class Persisted<T> {
	#key: string;
	#initial: T;

	current = $state<T>() as T;

	constructor(key: string, initial: T, options: PersistedOptions<T> = {}) {
		const { syncTabs = true, validate } = options;

		this.#key = key;
		this.#initial = initial;
		this.current = initial;

		if (typeof window === 'undefined') return;

		const stored = this.#read(validate);

		if (stored !== undefined) this.current = stored;

		if (!syncTabs) return;

		window.addEventListener('storage', (event) => {
			if (event.key !== this.#key) return;

			const next = this.#read(validate);

			this.current = next === undefined ? this.#initial : next;
		});
	}

	#read(validate?: (value: unknown) => value is T): T | undefined {
		try {
			const raw = localStorage.getItem(this.#key);

			if (raw === null) return undefined;

			const parsed = JSON.parse(raw) as unknown;

			if (validate && !validate(parsed)) return undefined;

			return parsed as T;
		} catch {
			// Unreadable storage or corrupt JSON — fall back rather than throw.
			return undefined;
		}
	}

	/** Assign and write through. */
	set(value: T): void {
		this.current = value;

		try {
			localStorage.setItem(this.#key, JSON.stringify(value));
		} catch {
			/* private mode or quota — the value still lives in memory */
		}
	}

	/** Drop the stored value and return to the initial one. */
	reset(): void {
		this.current = this.#initial;

		try {
			localStorage.removeItem(this.#key);
		} catch {
			/* nothing to do */
		}
	}
}

/**
 * ```ts
 * const accent = persisted('accent', '#ff3e00');
 * accent.set('#1098ad');
 * accent.current; // reactive
 * ```
 */
export function persisted<T>(
	key: string,
	initial: T,
	options?: PersistedOptions<T>
): Persisted<T> {
	return new Persisted(key, initial, options);
}
