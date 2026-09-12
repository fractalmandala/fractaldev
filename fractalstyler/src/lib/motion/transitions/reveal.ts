import { cubicInOut } from 'svelte/easing';
import type { TransitionConfig, EasingFunction } from 'svelte/transition';
import { areMotionAnimationsDisabled } from '$lib/motion/motionPreference.svelte';

/**
 * 'left'     — wipe starts at the left edge, travels right
 * 'right'    — wipe starts at the right edge, travels left
 * 'up'       — wipe starts at the top edge, travels down
 * 'down'     — wipe starts at the bottom edge, travels up
 * 'diagonal' — a parallelogram sweeps bottom-left → top-right.
 *              The slant angle is controlled by the `slant` param.
 */
export type RevealDirection = 'left' | 'right' | 'up' | 'down' | 'diagonal';

export interface RevealParams {
	direction?: RevealDirection;
	duration?: number;
	delay?: number;
	easing?: EasingFunction;
	/**
	 * Only for direction='diagonal'.
	 * Controls how steep the diagonal edge is, as a % of element width.
	 * Higher = shallower angle. Default: 20
	 */
	slant?: number;
}

/**
 * Returns the clip-path CSS value for a given direction and progress t (0→1).
 * clip-path: inset(top right bottom left)
 */
function clipPath(direction: RevealDirection, t: number, slant: number): string {
	const u = 1 - t; // 1 = fully hidden, 0 = fully revealed

	switch (direction) {
		case 'left':
			// Hidden by a right-side inset; inset shrinks left-to-right
			return `inset(0 ${u * 100}% 0 0)`;

		case 'right':
			// Hidden by a left-side inset; inset shrinks right-to-left
			return `inset(0 0 0 ${u * 100}%)`;

		case 'up':
			// Hidden by a bottom inset; inset shrinks top-to-bottom
			return `inset(0 0 ${u * 100}% 0)`;

		case 'down':
			// Hidden by a top inset; inset shrinks bottom-to-top
			return `inset(${u * 100}% 0 0 0)`;

		case 'diagonal': {
			// A parallelogram sweeps from left to right with a diagonal leading edge.
			// We overshoot to 120% so the right side is always fully covered at t=1.
			//
			//   p=0:  polygon(0 0, 0 0, -slant% 100%, 0 100%)  → nothing visible
			//   p=1:  polygon(0 0, 120% 0, (120-slant)% 100%, 0 100%) → fully visible
			//
			const p = t * (100 + slant); // sweep progress, overshoots past 100%
			const topX = Math.max(0, p);
			const botX = Math.max(0, p - slant);
			return `polygon(0% 0%, ${topX}% 0%, ${botX}% 100%, 0% 100%)`;
		}
	}
}

function applyReveal(
	target: HTMLElement,
	t: number,
	direction: RevealDirection,
	slant: number
): void {
	target.style.clipPath = clipPath(direction, t, slant);
}

function cleanupReveal(target: HTMLElement): void {
	target.style.clipPath = '';
}

/**
 * A clip-path reveal transition. The content stays in place; a mask peels
 * back from one edge to expose it.
 *
 * Mechanically different from `slide` — the element never moves,
 * making it ideal for images, large text blocks, and hero sections where
 * motion would be distracting but a flat cut would be too abrupt.
 *
 * The `diagonal` direction produces a parallelogram sweep (bottom-left →
 * top-right) — a common editorial/film-inspired wipe.
 *
 * SSR-safe. Respects `prefers-reduced-motion`.
 *
 * @example
 * ```svelte
 * {#if visible}
 *   <img in:reveal={{ direction: 'diagonal', duration: 700 }} src="…" alt="…" />
 * {/if}
 * ```
 */
export function reveal(
	node: Element,
	{
		direction = 'left',
		duration = 600,
		delay = 0,
		easing = cubicInOut,
		slant = 20
	}: RevealParams = {}
): TransitionConfig {
	if (areMotionAnimationsDisabled()) {
		return { duration: 0, delay: 0 };
	}

	const isContents =
		(node as HTMLElement).style?.display === 'contents';

	if (isContents) {
		const target = node.firstElementChild as HTMLElement | null;
		if (!target) return { duration: 0, delay };

		return {
			duration,
			delay,
			easing,
			tick: (t) => {
				applyReveal(target, t, direction, slant);
				if (t >= 1) cleanupReveal(target);
			}
		};
	}

	return {
		duration,
		delay,
		easing,
		css: (t) => `clip-path: ${clipPath(direction, t, slant)}`
	};
}
