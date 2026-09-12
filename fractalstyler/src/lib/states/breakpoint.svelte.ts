import { mediaQuery } from '$lib/states/media.svelte.js';

/**
 * Responsive booleans.
 *
 * The default split is 1025px: `isCompact()` is true *below* 1025 (phones and
 * tablets), false at 1025 and up. Because the underlying query is cached, a
 * layout, a header and a sidebar all asking for `isCompact()` share one
 * listener.
 */

/** The one number worth naming. Everything else derives from it. */
export const COMPACT_MAX = 1024;

/**
 * True below 1025px. On the server it reports `fallback` — default false, so
 * markup renders desktop-first and corrects on mount. Pass `true` if your
 * layout is mobile-first and you would rather correct the other way.
 *
 * ```svelte
 * <script>
 *   const compact = isCompact();
 * </script>
 * {#if compact.current}<MobileNav />{:else}<DeskNav />{/if}
 * ```
 */
export function isCompact(fallback = false): { readonly current: boolean } {
	return mediaQuery(`(max-width: ${COMPACT_MAX}px)`, fallback);
}

/** The complement of `isCompact` — true at 1025px and up. */
export function isWide(fallback = true): { readonly current: boolean } {
	return mediaQuery(`(min-width: ${COMPACT_MAX + 1}px)`, fallback);
}

/** Any breakpoint you like, same caching. `below(768)` → true under 768px. */
export function below(px: number, fallback = false): { readonly current: boolean } {
	return mediaQuery(`(max-width: ${px - 1}px)`, fallback);
}

/** `above(768)` → true at 768px and up. */
export function above(px: number, fallback = false): { readonly current: boolean } {
	return mediaQuery(`(min-width: ${px}px)`, fallback);
}

/** Coarse pointer — a better "is this touch?" than a width guess. */
export function isTouch(fallback = false): { readonly current: boolean } {
	return mediaQuery('(pointer: coarse)', fallback);
}
