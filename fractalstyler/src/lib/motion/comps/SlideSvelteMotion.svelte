<script lang="ts">
	import type { Snippet } from 'svelte';
	import { motion, useScroll, useTransform, useSpring } from '@humanspeak/svelte-motion';
	import type { SlideDirection } from '$lib/motion/types.js';
	import { directionToOffset } from '$lib/motion/transitions/slide.js';
	import { areMotionAnimationsDisabled } from '../motionPreference.svelte';

	interface Props {
		visible?: boolean;
		/** Direction the element slides from. Default: 'down' */
		direction?: SlideDirection;
		/** Distance in pixels to slide. Default: 160 */
		distance?: number;
		/** Whether to fade opacity during the slide. Default: true */
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
		direction = 'down',
		distance = 160,
		opacity = true,
		offset = ['start 0.85', 'start 0.2'],
		stiffness = 120,
		damping = 25,
		scrub = 3,
		children,
		...rest
	}: Props = $props();

	let containerEl = $state<HTMLElement>();

	const initialOffsets = $derived(directionToOffset(direction, distance));

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
	const xValue = useTransform(smoothProgress, (p) => (1 - p) * initialOffsets.x);
	const yValue = useTransform(smoothProgress, (p) => (1 - p) * initialOffsets.y);
	const opacityValue = useTransform(smoothProgress, (p) => (opacity ? p : 1));
</script>

{#if visible}
	<div bind:this={containerEl} {...rest}>
		{#if areMotionAnimationsDisabled()}
			{@render children()}
		{:else if scrub}
			<!-- Continuous scroll-linked scrub with spring physics -->
			<motion.div style={{ x: xValue, y: yValue, opacity: opacityValue }}>
				{@render children()}
			</motion.div>
		{:else}
			<!-- In-view trigger with spring entrance -->
			<motion.div
				initial={{
					x: initialOffsets.x,
					y: initialOffsets.y,
					opacity: opacity ? 0 : 1
				}}
				whileInView={{
					x: 0,
					y: 0,
					opacity: 1
				}}
				viewport={{ once: false, margin: '-10%' }}
				transition={{ type: 'spring', stiffness, damping }}
			>
				{@render children()}
			</motion.div>
		{/if}
	</div>
{/if}
