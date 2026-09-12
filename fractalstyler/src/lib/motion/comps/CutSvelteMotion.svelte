<script lang="ts">
	import type { Snippet } from 'svelte';
	import { motion, useScroll, useTransform, useSpring } from '@humanspeak/svelte-motion';
	import type { RevealDirection } from '$lib/motion/transitions/reveal.js';
	import { areMotionAnimationsDisabled } from '../motionPreference.svelte';

	interface Props {
		visible?: boolean;
		/** Direction the cut reveal sweeps from. Default: 'up' */
		direction?: RevealDirection;
		/** For direction="diagonal" only. Controls slant % of element width. Default: 0 */
		slant?: number;
		/** Fade opacity during the reveal. Default: false */
		opacity?: boolean;
		/** Scroll offset: e.g. ['start 0.85', 'start 0.2'] */
		offset?: [string, string];
		/** Spring stiffness for scrub smoothing. Default: 120 */
		stiffness?: number;
		/** Spring damping for scrub smoothing. Default: 25 */
		damping?: number;
		/** Whether to link progress continuously to scroll (scrub) or trigger on view */
		scrub?: boolean | number;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		visible = true,
		direction = 'up',
		slant = 0,
		opacity = false,
		offset = ['start 0.85', 'start 0.2'],
		stiffness = 120,
		damping = 25,
		scrub = 3,
		children,
		...rest
	}: Props = $props();

	let containerEl = $state<HTMLElement>();

	function getClipRange(dir: RevealDirection, s: number): [string, string] {
		switch (dir) {
			case 'left':
				return ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'];
			case 'right':
				return ['inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)'];
			case 'up':
				return ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'];
			case 'down':
				return ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'];
			case 'diagonal':
				return [
					'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
					`polygon(0% 0%, ${100 + s}% 0%, 100% 100%, 0% 100%)`
				];
		}
	}

	function getClipPath(dir: RevealDirection, s: number, t: number): string {
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
				const p = t * (100 + s);
				const topX = Math.max(0, p);
				const botX = Math.max(0, p - s);
				return `polygon(0% 0%, ${topX}% 0%, ${botX}% 100%, 0% 100%)`;
			}
		}
	}

	const clipRange = $derived(getClipRange(direction, slant));

	// svelte-ignore state_referenced_locally
	// 1. Scroll-linked tracking on real DOM container
	const { scrollYProgress } = useScroll({
		target: () => containerEl,
		offset
	});

	// svelte-ignore state_referenced_locally
	// 2. Physics-based spring smoothing
	const smoothProgress = useSpring(scrollYProgress, {
		stiffness,
		damping
	});

	// 3. Dynamic transforms via closures
	const clipPathValue = useTransform(smoothProgress, (p) => getClipPath(direction, slant, p));
	const opacityValue = useTransform(smoothProgress, (p) => (opacity ? p : 1));
</script>

{#if visible}
	<div bind:this={containerEl} {...rest}>
		{#if areMotionAnimationsDisabled()}
			{@render children()}
		{:else if scrub}
			<!-- Continuous scroll-linked scrub with spring physics -->
			<motion.div style={{ clipPath: clipPathValue, opacity: opacityValue }}>
				{@render children()}
			</motion.div>
		{:else}
			<!-- In-view trigger with spring entrance -->
			<motion.div
				initial={{ clipPath: clipRange[0], opacity: opacity ? 0 : 1 }}
				whileInView={{ clipPath: clipRange[1], opacity: 1 }}
				viewport={{ once: false, margin: '-10%' }}
				transition={{ type: 'spring', stiffness, damping }}
			>
				{@render children()}
			</motion.div>
		{/if}
	</div>
{/if}
