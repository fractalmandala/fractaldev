import type { Action } from 'svelte/action';
import { prefersReducedMotion } from './view-transition.js';

export interface InviewOptions {
	/** Intersection threshold(s) for firing. Defaults to 0.2. */
	threshold?: number | number[];
	/** Passed straight to the observer. */
	rootMargin?: string;
	/** Per-element grow-in delay, written as `--rv-delay`. */
	delay?: number;
	/** Keep observing after the first entry. Defaults to true (fire once). */
	once?: boolean;
}

/**
 * Scroll trigger for `./reveal.css`: arms the container on mount (children
 * hide only from that point — no-JS renders fully visible) and adds `.active`
 * at first intersection, which plays the stagger and any `.rv-grow` items.
 *
 * ```svelte
 * import { inview } from '$lib/transitions/reveal.js';
 * import '$lib/transitions/reveal.css';
 *
 * <section class="rv-reveal" use:inview>
 * 	<h2>…</h2>
 * 	<p>…</p>
 * </section>
 *
 * <section class="rv-reveal" use:inview={{ threshold: 0.4, delay: 150 }}>
 * ```
 */
export const inview: Action<HTMLElement, InviewOptions | undefined> = (node, options = {}) => {
	let { threshold = 0.2, rootMargin, delay = 0, once = true } = options;

	if (delay > 0) node.style.setProperty('--rv-delay', `${delay}ms`);

	// No observer, or motion is off: show the complete frame immediately.
	if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
		node.classList.add('rv-arm', 'active');
		return {};
	}

	node.classList.add('rv-arm');

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.classList.add('active');
					if (once) observer.unobserve(node);
				} else if (!once) {
					node.classList.remove('active');
				}
			}
		},
		{ threshold, rootMargin }
	);

	observer.observe(node);

	return {
		update(next: InviewOptions = {}) {
			threshold = next.threshold ?? 0.2;
			rootMargin = next.rootMargin;
			once = next.once ?? true;
			const nextDelay = next.delay ?? 0;
			if (nextDelay !== delay) {
				delay = nextDelay;
				if (delay > 0) node.style.setProperty('--rv-delay', `${delay}ms`);
				else node.style.removeProperty('--rv-delay');
			}
		},
		destroy() {
			observer.disconnect();
		}
	};
};

export interface SequenceStep {
	/** Milliseconds from the start of the sequence. */
	at: number;
	run: () => void;
}

/**
 * Timed choreography with a single cleanup — the slide-1 collapse pattern
 * (`collapsed` at 1100ms, caption at 1660ms) without hand-rolled timeouts.
 * Return the cancel function from an `$effect`, and navigating away
 * mid-sequence can never fire a stale step.
 *
 * ```svelte
 * $effect(() => {
 * 	if (index !== 0) return;
 * 	collapsed = false;
 * 	return sequence([
 * 		{ at: 1100, run: () => (collapsed = true) },
 * 		{ at: 1660, run: () => (caption = 'b-ps-gl') }
 * 	]);
 * });
 * ```
 */
export function sequence(steps: SequenceStep[]): () => void {
	const timers = steps.map(({ at, run }) => setTimeout(run, Math.max(0, at)));
	return () => {
		for (const timer of timers) clearTimeout(timer);
	};
}
