import './motion.css';

export const EASE_OUT_CUBIC = 'cubic-bezier(0.215, 0.61, 0.355, 1)';

export const DIM_OPACITY = 0.4;

export type RevealOptions = {
	/** Delay in ms. Use `stagger()` — capped at 280ms. */
	delay?: number;
	/** IntersectionObserver threshold (0–1). Default 0.25. */
	amount?: number;
	/** Vertical offset in px. Default 8. */
	y?: number;
	/** Reveal once only. Default true. */
	once?: boolean;
};

function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

/**
 * Svelte action: fade-and-rise when the element enters the viewport.
 * Stagger rows, weeks, or lists — never hundreds of individual cells.
 *
 * <div use:reveal={{ delay: stagger(i, 40) }}>
 */
export function reveal(node: HTMLElement, options: RevealOptions = {}): { destroy(): void } {
	const { delay = 0, amount = 0.25, y = 8, once = true } = options;

	if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
		return { destroy() {} };
	}

	node.classList.add('fg-motion');
	node.style.setProperty('--fg-delay', `${delay}ms`);
	if (y !== 8) {
		node.style.setProperty('--fg-y', `${y}px`);
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.classList.add('is-revealed');
					if (once) observer.disconnect();
				} else if (!once) {
					node.classList.remove('is-revealed');
				}
			}
		},
		{ threshold: amount }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}

/** Stagger delay for index `i`, capped at 280ms. */
export function stagger(index: number, step = 40): number {
	return Math.min(index * step, 280);
}
