<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useScroll, useSpring, useInView, animate } from '@humanspeak/svelte-motion';
	import type { RevealDirection } from '$lib/motion/transitions/reveal.js';
	import { areMotionAnimationsDisabled } from '../motionPreference.svelte';

	/** Structural match of motion's `EasingDefinition` (named eases + cubic bezier). */
	type EaseDef =
		| [number, number, number, number]
		| 'linear'
		| 'easeIn'
		| 'easeOut'
		| 'easeInOut'
		| 'circIn'
		| 'circOut'
		| 'circInOut'
		| 'backIn'
		| 'backOut'
		| 'backInOut'
		| 'anticipate';

	interface Props {
		visible?: boolean;
		direction?: RevealDirection;
		/** Whether to link progress continuously to scroll (scrub) or trigger on view */
		scrub?: boolean | number;
		/** Scroll offset: e.g. ['start 0.9', 'start 0.4'] (scrub mode only) */
		offset?: [string, string];
		/** Spring stiffness for scrub smoothing. Default: 120 */
		stiffness?: number;
		/** Spring damping for scrub smoothing. Default: 25 */
		damping?: number;
		/**
		 * Entrance duration (s) for in-view mode. When set, targets reveal with a
		 * tween of `duration` + `ease`; when omitted, they reveal with a spring
		 * (`stiffness`/`damping`). Scrub mode is unaffected (it's scroll-linked).
		 */
		duration?: number;
		/** Easing for the in-view tween. Default: 'easeOut'. Ignored when `duration` is unset. */
		ease?: EaseDef;
		/** Stagger delay (s) between repeated targets / lines. Default: 0.15 */
		stagger?: number;
		propClass: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		visible = true,
		direction = 'down',
		scrub = false,
		offset = ['start 0.9', 'start 0.6'],
		stiffness = 120,
		damping = 25,
		duration = 400,
		ease = 'circOut',
		stagger = 0.5,
		propClass = '',
		children,
		...rest
	}: Props = $props();

	let containerEl = $state<HTMLElement>();

	function getClipPath(dir: RevealDirection, t: number, slant = 20): string {
		const u = 1 - t;
		switch (dir) {
			case 'left':
				return `inset(0% ${u * 100}% 0% 0%)`;
			case 'right':
				return `inset(0% 0% 0% ${u * 100}%)`;
			case 'up':
				return `inset(0% 0% ${u * 100}% 0%)`;
			case 'down':
				return `inset(${u * 100}% 0% 0% 0%)`;
			case 'diagonal': {
				const p = t * (100 + slant);
				const topX = Math.max(0, p);
				const botX = Math.max(0, p - slant);
				return `polygon(0% 0%, ${topX}% 0%, ${botX}% 100%, 0% 100%)`;
			}
		}
	}

	function getTargets(node: HTMLElement): HTMLElement[] {
		const kids = Array.from(node.children).filter(
			(child): child is HTMLElement => child instanceof Element
		);
		if (kids.length > 1) return kids;
		const single = kids[0] ?? (node.firstElementChild as HTMLElement | null) ?? node;
		const lines = single.querySelectorAll<HTMLElement>('.reveal-line, .reveal-item');
		return lines.length > 0 ? Array.from(lines) : [single];
	}

	function clearTargets(targets: HTMLElement[]) {
		targets.forEach((target) => {
			target.style.clipPath = '';
			target.style.willChange = '';
		});
	}

	// n targets staggered by `stagger` over the shared 0..1 progress.
	// Mirrors Reveal.svelte's formula: target i starts once progress > i*stagger
	// and finishes fully at normalized progress 1.
	function staggered(p: number, i: number, count: number): number {
		if (count <= 1) return p;
		const span = 1 - (count - 1) * (stagger || 0.15);
		return Math.max(0, Math.min(1, (p - i * (stagger || 0.15)) / (span || 1)));
	}

	// svelte-ignore state_referenced_locally
	// 1. Shared scroll-linked tracking on the real DOM container
	const { scrollYProgress } = useScroll({
		target: () => containerEl,
		offset
	});

	// svelte-ignore state_referenced_locally
	// 2. Physics-based spring smoothing (only consumed in scrub mode)
	const smoothProgress = useSpring(scrollYProgress, {
		stiffness,
		damping
	});

	// 3. In-view trigger state (only consumed in non-scrub mode)
	const inView = useInView(() => containerEl, { margin: '-10%' });

	// Scrub mode: stream smoothed scroll progress into each target's clip-path,
	// staggered per target index — exactly like Reveal.svelte.
	$effect(() => {
		if (!containerEl || !scrub) return;

		const targets = getTargets(containerEl);
		if (!targets.length) return;

		if (areMotionAnimationsDisabled()) return () => clearTargets(targets);

		const count = targets.length;
		const unsub = smoothProgress.subscribe((p: number) => {
			targets.forEach((target, i) => {
				const itemP = staggered(p, i, count);
				target.style.clipPath = getClipPath(direction, itemP);
				target.style.willChange = itemP >= 0.999 ? '' : 'clip-path';
			});
		});

		return () => {
			unsub();
			clearTargets(targets);
		};
	});

	// In-view mode: spring each target's clip-path open with a per-item stagger
	// delay when the container scrolls into view (re-triggers on re-entry).
	$effect(() => {
		if (!containerEl || scrub) return;

		const targets = getTargets(containerEl);
		if (!targets.length) return;

		if (areMotionAnimationsDisabled()) return () => clearTargets(targets);

		if (!inView.current) {
			// Hidden state while out of view (so re-entry re-animates)
			targets.forEach((target) => {
				target.style.clipPath = getClipPath(direction, 0);
				target.style.willChange = 'clip-path';
			});
			return;
		}

		const count = targets.length;
		const animations = targets.map((target, i) => {
			const anim = animate(
				target,
				{ clipPath: getClipPath(direction, 1) },
				duration != null
					? {
							delay: i * (stagger || 0.15),
							type: 'tween',
							duration,
							ease
						}
					: {
							delay: i * (stagger || 0.15),
							type: 'spring',
							stiffness,
							damping
						}
			);
			anim.then(() => {
				target.style.willChange = '';
				target.style.clipPath = '';
			});
			return anim;
		});

		return () => animations.forEach((a) => a.stop());
	});
</script>

{#if visible}
	<div class={propClass} bind:this={containerEl} {...rest}>
		{@render children()}
	</div>
{/if}
