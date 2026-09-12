/**
 * Reactive media queries.
 *
 * Instances are cached per query string, so calling `mediaQuery('...')` in
 * fifty components attaches one listener, not fifty — and there is nothing to
 * clean up. SSR reports the `fallback` until the browser corrects it on mount.
 */

class MediaQuery {
	#list: MediaQueryList | undefined;
	#onChange: ((event: MediaQueryListEvent) => void) | undefined;

	current = $state(false);

	constructor(query: string, fallback = false) {
		this.current = fallback;

		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

		this.#list = window.matchMedia(query);
		this.current = this.#list.matches;
		this.#onChange = (event) => (this.current = event.matches);
		this.#list.addEventListener('change', this.#onChange);
	}

	/** Only needed for a one-off, uncached query. */
	destroy(): void {
		if (this.#list && this.#onChange) this.#list.removeEventListener('change', this.#onChange);
	}
}

const cache = new Map<string, MediaQuery>();

/**
 * A shared, reactive `matchMedia`.
 *
 * ```svelte
 * <script>
 *   import { mediaQuery } from '$lib/utils';
 *   const wide = mediaQuery('(min-width: 1025px)');
 * </script>
 * {#if wide.current}…{/if}
 * ```
 */
export function mediaQuery(query: string, fallback = false): { readonly current: boolean } {
	let instance = cache.get(query);

	if (!instance) {
		instance = new MediaQuery(query, fallback);
		cache.set(query, instance);
	}

	return instance;
}

/** An uncached query you own and must `destroy()`. Rarely what you want. */
export function createMediaQuery(query: string, fallback = false): MediaQuery {
	return new MediaQuery(query, fallback);
}

/**
 * Reactive `prefers-reduced-motion`, replacing the hand-rolled
 * `window.matchMedia('(prefers-reduced-motion: reduce)').matches` check.
 *
 * Unlike that one-shot read, this one updates if the user changes the setting
 * while the page is open.
 */
export function reducedMotion(): { readonly current: boolean } {
	return mediaQuery('(prefers-reduced-motion: reduce)');
}

/** One-shot, non-reactive check — for module scope and event handlers. */
export function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

/** Reactive `prefers-color-scheme: dark`, for following the system theme. */
export function prefersDark(): { readonly current: boolean } {
	return mediaQuery('(prefers-color-scheme: dark)');
}
