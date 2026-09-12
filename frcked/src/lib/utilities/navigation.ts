import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { browser } from '$app/environment';
import { startViewTransition, createNamedTransition } from './viewTransitions';
import { animations } from './animations.svelte';

/**
 * Safely resolve a path with type casting
 */
export function safeResolve(path: string): string {
	return (resolve as unknown as (p: string) => string)(path);
}

/**
 * Update animation preference from settings
 */
export function updateAnimationPreference(enabled: boolean): void {
	animations.set(enabled);
}

/**
 * Navigate with optional view transition
 */
export async function navigateWithTransition(
	url: string | URL,
	options: {
		replaceState?: boolean;
		noScroll?: boolean;
		keepFocus?: boolean;
		invalidateAll?: boolean;
		state?: Record<string, unknown>;
		transitionName?: string;
	} = {}
): Promise<void> {
	const { transitionName, ...gotoOptions } = options;

	try {
		if (!animations.enabled) {
			await goto(safeResolve(typeof url === 'string' ? url : url.pathname), gotoOptions);
			return;
		}

		if (transitionName) {
			await createNamedTransition(transitionName, async () => {
				await goto(safeResolve(typeof url === 'string' ? url : url.pathname), gotoOptions);
			});
		} else {
			await startViewTransition(async () => {
				await goto(safeResolve(typeof url === 'string' ? url : url.pathname), gotoOptions);
			});
		}
	} catch (error) {
		console.error('Navigation failed:', error);
		await goto(safeResolve(typeof url === 'string' ? url : url.pathname), gotoOptions);
	}
}

/**
 * Enhanced link click handler
 */
export function createTransitionLink(
	href: string,
	options: Parameters<typeof navigateWithTransition>[1] = {}
) {
	return async (event: MouseEvent) => {
		// Only handle left clicks without modifier keys
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}

		// Let browser handle external links
		if (
			href.startsWith('http') ||
			href.startsWith('//') ||
			href.startsWith('mailto:') ||
			href.startsWith('tel:')
		) {
			return;
		}

		// Let browser handle hash links
		if (href.startsWith('#')) {
			return;
		}

		// Check if this is the current page
		if (browser && window.location.pathname === href) {
			event.preventDefault();
			return;
		}

		event.preventDefault();
		await navigateWithTransition(href, options);
	};
}

/**
 * Svelte action for transition links
 */
export function transitionLink(
	node: HTMLAnchorElement,
	options: Parameters<typeof navigateWithTransition>[1] = {}
) {
	const href = node.getAttribute('href');

	if (!href) {
		console.warn('transitionLink action applied to anchor without href');
		return { destroy() {} };
	}

	const handleClick = createTransitionLink(href, options);
	node.addEventListener('click', handleClick);

	return {
		destroy() {
			node.removeEventListener('click', handleClick);
		},
		update(newOptions: typeof options) {
			Object.assign(options, newOptions);
		}
	};
}

/**
 * Preload route data
 */
export async function preloadRoute(href: string): Promise<void> {
	if (!browser) return;

	try {
		const { preloadData } = await import('$app/navigation');
		await preloadData(href);
	} catch (error) {
		console.warn('Failed to preload route:', href, error);
	}
}

/**
 * Navigate back with transition
 */
export async function goBackWithTransition(fallbackUrl?: string): Promise<void> {
	if (!browser) return;

	try {
		if (window.history.length > 1) {
			if (animations.enabled) {
				await startViewTransition(() => {
					window.history.back();
				});
			} else {
				window.history.back();
			}
		} else if (fallbackUrl) {
			await navigateWithTransition(fallbackUrl, { replaceState: true });
		}
	} catch (error) {
		console.error('Back navigation failed:', error);
		window.history.back();
	}
}

/**
 * Navigate forward with transition
 */
export async function goForwardWithTransition(): Promise<void> {
	if (!browser) return;

	try {
		if (animations.enabled) {
			await startViewTransition(() => {
				window.history.forward();
			});
		} else {
			window.history.forward();
		}
	} catch (error) {
		console.error('Forward navigation failed:', error);
		window.history.forward();
	}
}

/**
 * Temporarily disable user scrolling to prevent interference with smooth scroll animations
 */
export function disableUserScroll(duration: number): void {
	if (!browser) return;

	const preventDefault = (e: Event) => e.preventDefault();

	const keydownHandler = (e: KeyboardEvent) => {
		// Disable arrow keys, page up/down, space, home, end
		if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ', 'Home', 'End'].includes(e.key)) {
			e.preventDefault();
		}
	};

	// Disable scroll events
	document.addEventListener('wheel', preventDefault, { passive: false });
	document.addEventListener('touchmove', preventDefault, { passive: false });
	document.addEventListener('keydown', keydownHandler, { passive: false });

	// Re-enable scrolling after duration
	setTimeout(() => {
		document.removeEventListener('wheel', preventDefault);
		document.removeEventListener('touchmove', preventDefault);
		document.removeEventListener('keydown', keydownHandler);
	}, duration);
}

/**
 * Smooth scroll to element with user scroll prevention
 */
export function scrollToElementSmooth(
	element: HTMLElement,
	options: {
		block?: ScrollLogicalPosition;
		inline?: ScrollLogicalPosition;
		behavior?: ScrollBehavior;
		delay?: number;
		disableScrollDuration?: number;
	} = {}
): void {
	if (!browser || !element) return;

	const {
		block = 'start',
		inline = 'nearest',
		behavior = 'smooth',
		delay = 50,
		disableScrollDuration = 500
	} = options;

	// Disable user scrolling during animation
	disableUserScroll(delay + disableScrollDuration);

	// Scroll to element after delay
	setTimeout(() => {
		element.scrollIntoView({
			behavior,
			block,
			inline
		});
	}, delay);
}
