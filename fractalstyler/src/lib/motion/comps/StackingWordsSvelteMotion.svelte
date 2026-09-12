<script lang="ts">
	import type { Snippet } from 'svelte';
	import { motion, useScroll, useSpring } from '@humanspeak/svelte-motion';
	import { areMotionAnimationsDisabled } from '../motionPreference.svelte';
	import StackingWordItem from './StackingWordItem.svelte';

	interface Props {
		visible?: boolean;
		/** Direct string to split into words. If omitted, text is extracted from children. */
		text?: string;
		/** Direction words fly in from. Default: 'right' */
		direction?: 'left' | 'right';
		/** Starting offscreen distance in pixels. Default: 180 */
		distance?: number;
		/** ScrollTrigger / Framer start position. Default: 'top 95%' */
		start?: string;
		/** ScrollTrigger / Framer end position. Default: 'top 50%' */
		end?: string;
		/** Direct tuple offset override for Framer Motion, e.g. ['start 0.95', 'start 0.5'] */
		offset?: [string, string];
		/** Stagger intensity between words (0 to 1). Default: 0.18 */
		stagger?: number;
		/** Spring stiffness for scrub smoothing. Default: 120 */
		stiffness?: number;
		/** Spring damping for scrub smoothing. Default: 25 */
		damping?: number;
		/** Whether to link progress continuously to scroll (scrub) or trigger on view */
		scrub?: boolean | number;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		visible = true,
		text = '',
		direction = 'right',
		distance = 180,
		start = 'top 95%',
		end = 'top 50%',
		offset,
		stagger = 0.18,
		stiffness = 120,
		damping = 25,
		scrub = 3,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	let containerEl = $state<HTMLElement>();
	let extractedText = $state('');

	function convertAnchorToOffset(str: string): string {
		const parts = str.trim().split(/\s+/);
		if (parts.length === 2 && (parts[0] === 'start' || parts[0] === 'end' || parts[0] === 'center')) {
			return str;
		}
		const target = parts[0] === 'bottom' ? 'end' : parts[0] === 'center' ? 'center' : 'start';
		let container = '0.9';
		if (parts.length > 1) {
			const p2 = parts[1];
			if (p2 === 'top') container = 'start';
			else if (p2 === 'bottom') container = 'end';
			else if (p2 === 'center') container = 'center';
			else {
				const m = p2.match(/(\d+)%/);
				if (m) container = (Number(m[1]) / 100).toString();
				else container = p2;
			}
		}
		return `${target} ${container}`;
	}

	const resolvedOffset = $derived(
		offset ?? [convertAnchorToOffset(start), convertAnchorToOffset(end)]
	);

	$effect(() => {
		if (!text && containerEl && !extractedText) {
			const raw = containerEl.innerText?.trim();
			if (raw) extractedText = raw;
		}
	});

	const activeText = $derived(text || extractedText);
	const words = $derived(activeText ? activeText.split(/\s+/).filter(Boolean) : []);

	// svelte-ignore state_referenced_locally
	// 1. Scroll-linked tracking on real DOM container
	const { scrollYProgress } = useScroll({
		target: () => containerEl,
		offset: resolvedOffset
	});

	// svelte-ignore state_referenced_locally
	// 2. Physics-based spring smoothing
	const smoothProgress = useSpring(scrollYProgress, {
		stiffness,
		damping
	});
</script>

{#if visible}
	<div
		bind:this={containerEl}
		{...rest}
		class="stacking-words {className}"
	>
		{#if areMotionAnimationsDisabled()}
			{#if text}
				{text}
			{:else}
				{@render children?.()}
			{/if}
		{:else if words.length > 0}
			{#if scrub}
				<!-- Continuous scroll-linked scrub with spring physics -->
				{#each words as word, i (i)}
					<StackingWordItem
						{word}
						progress={smoothProgress}
						index={i}
						total={words.length}
						{stagger}
						{direction}
						{distance}
					/>
				{/each}
			{:else}
				<!-- In-view trigger with spring entrance and stagger -->
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: false, margin: '-10%' }}
					variants={{
						hidden: {},
						visible: {
							transition: {
								staggerChildren: Math.max(0.02, stagger * 0.4)
							}
						}
					}}
				>
					{#each words as word, i (i)}
						<motion.span
							class="stacking-words-word"
							variants={{
								hidden: {
									x: direction === 'left' ? -distance : distance,
									opacity: 0
								},
								visible: {
									x: 0,
									opacity: 1,
									transition: { type: 'spring', stiffness, damping }
								}
							}}
						>
							{word}&nbsp;
						</motion.span>
					{/each}
				</motion.div>
			{/if}
		{:else}
			<!-- Fallback / extraction slot -->
			{@render children?.()}
		{/if}
	</div>
{/if}

<style lang="sass">

.stacking-words
	visibility: hidden
	overflow: hidden

.stacking-words :global(.stacking-words-line), .stacking-words :global(.stacking-words-line-mask)
	display: block

.stacking-words :global(.stacking-words-word)
	display: inline-block
	will-change: transform

</style>