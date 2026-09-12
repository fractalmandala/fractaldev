import { cubicOut } from 'svelte/easing';
import type { TransitionConfig, EasingFunction } from 'svelte/transition';
import type { SlideDirection, SlideParams } from '$lib/motion/types';
import { areMotionAnimationsDisabled } from '$lib/motion/motionPreference.svelte';

// Re-export so consumers don't need to reach into svelte/transition
export type { EasingFunction };

/**
 * Maps a direction + distance to the starting x/y offset.
 * At t=0 the element is at this offset; at t=1 it is in its natural position.
 */
export function directionToOffset(
	direction: SlideDirection,
	distance: number
): { x: number; y: number } {
	switch (direction) {
		case 'left':  return { x: -distance, y: 0 };
		case 'right': return { x:  distance, y: 0 };
		case 'up':    return { x: 0, y: -distance };
		case 'down':  return { x: 0, y:  distance };
	}
}

/**
 * A Svelte transition that slides an element in from (and out toward) a direction.
 *
 * **Direct use** — apply to your own element with `in:slide` / `out:slide`.
 * The element itself is animated via a CSS keyframe (GPU-composited).
 *
 * **Via the `<Slide>` component** — the component's wrapper uses `display: contents`
 * so it is invisible to layout. In that case the transition detects the contents
 * wrapper and animates its first child element instead, via `tick`.
 *
 * SSR-safe: transitions never run on the server; elements render in their
 * final position. `prefers-reduced-motion` is respected.
 *
 * @example
 * ```svelte
 * {#if visible}
 *   <div in:slide={{ direction: 'left', distance: 80 }}
 *        out:slide={{ direction: 'left' }}>
 *     content
 *   </div>
 * {/if}
 * ```
 */
export function slide(
	node: Element,
	{
		direction = 'left',
		distance = 100,
		duration = 300,
		delay = 0,
		easing = cubicOut,
		opacity = true
	}: SlideParams = {}
): TransitionConfig {
	if (areMotionAnimationsDisabled()) {
		return { duration: 0, delay: 0 };
	}

	const { x, y } = directionToOffset(direction, distance);

	// When the transition is on a display:contents wrapper (the <Slide> component case)
	// the node has no box of its own — transforms applied to it are invisible.
	// Detect this and animate the first child element directly instead.
	const isContents =
		(node as HTMLElement).style?.display === 'contents';

	if (isContents) {
		const target = node.firstElementChild as HTMLElement | null;
		if (!target) return { duration: 0, delay };

		return {
			duration,
			delay,
			easing,
			// tick receives an already-eased `t` from Svelte's runner.
			tick: (t) => {
				const u = 1 - t;
				target.style.transform = `translate(${x * u}px, ${y * u}px)`;
				if (opacity) target.style.opacity = String(t);

				// Clean up inline styles once the intro is fully done so they
				// don't interfere with any transform/opacity the user has set.
				if (t >= 1) {
					target.style.transform = '';
					if (opacity) target.style.opacity = '';
				}
			}
		};
	}

	// Default: pure CSS keyframe on the element itself. Preferred when using
	// in:slide / out:slide directly — runs off the main thread.
	return {
		duration,
		delay,
		easing,
		css: (t) => {
			const u = 1 - t;
			const parts: string[] = [`transform: translate(${x * u}px, ${y * u}px)`];
			if (opacity) parts.push(`opacity: ${t}`);
			return parts.join('; ');
		}
	};
}
