import type { EasingFunction } from 'svelte/transition';

/**
 * The axis direction the element slides from when entering,
 * and returns to when exiting.
 *
 * 'left'  → enters from the left  (starts at -distance, moves to 0)
 * 'right' → enters from the right (starts at +distance, moves to 0)
 * 'up'    → enters from above     (starts at -distance, moves to 0)
 * 'down'  → enters from below     (starts at +distance, moves to 0)
 */
export type SlideDirection = 'left' | 'right' | 'up' | 'down';

export interface SlideParams {
	/** Direction the element slides from on enter / returns to on exit. Default: 'left' */
	direction?: SlideDirection;
	/** Distance in pixels to travel. Default: 100 */
	distance?: number;
	/** Transition duration in ms. Default: 300 */
	duration?: number;
	/** Delay before the transition starts, in ms. Default: 0 */
	delay?: number;
	/** Svelte easing function. Default: cubicOut */
	easing?: EasingFunction;
	/**
	 * Whether to also fade opacity during the slide.
	 * Helps the motion read clearly and avoids jarring cuts. Default: true
	 */
	opacity?: boolean;
}
