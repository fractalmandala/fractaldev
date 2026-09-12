<script lang="ts">
	import type { Snippet } from 'svelte';
	import { motion, useScroll, useTransform, useSpring } from '@humanspeak/svelte-motion';
	import { areMotionAnimationsDisabled } from '../motionPreference.svelte';

	interface Props {
		visible?: boolean;
		/** Starting blur radius in px. Default: 10 */
		radius?: number;
		/** Starting scale (mimics optical defocus bloom). Default: 1.06 */
		initialScale?: number;
		/** Fade opacity during blur. Default: true */
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
		radius = 10,
		initialScale = 1.06,
		opacity = true,
		offset = ['start 0.85', 'start 0.2'],
		stiffness = 120,
		damping = 25,
		scrub = 3,
		children,
		...rest
	}: Props = $props();

	let containerEl = $state<HTMLElement>();

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
	const filterValue = useTransform(smoothProgress, (p) =>
		p >= 0.999 ? 'none' : `blur(${(radius * (1 - p)).toFixed(1)}px)`
	);
	const scaleValue = useTransform(smoothProgress, (p) =>
		p >= 0.999 ? 1 : 1 + (initialScale - 1) * (1 - p)
	);
	const opacityValue = useTransform(smoothProgress, (p) => (opacity ? p : 1));
</script>

{#if visible}
	<div bind:this={containerEl} {...rest}>
		{#if areMotionAnimationsDisabled()}
			{@render children()}
		{:else if scrub}
			<!-- Continuous scroll-linked scrub with spring physics -->
			<motion.div style={{ filter: filterValue, scale: scaleValue, opacity: opacityValue }}>
				{@render children()}
			</motion.div>
		{:else}
			<!-- In-view trigger with spring entrance -->
			<motion.div
				initial={{
					filter: `blur(${radius}px)`,
					scale: initialScale,
					opacity: opacity ? 0 : 1
				}}
				whileInView={{
					filter: 'blur(0px)',
					scale: 1,
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
