<script lang="ts">
	import type { Snippet } from 'svelte';
	import { AnimatePresence, MotionDiv } from '@humanspeak/svelte-motion';
	import { fadeUp, springPresence } from '#lib/motion/presets.ts';

	type Props = {
		present?: boolean;
		children?: Snippet;
		class?: string;
	};

	let { present = false, children, class: className = '' }: Props = $props();
	const rootClass = $derived(['presence', className].filter(Boolean).join(' '));
</script>

<AnimatePresence mode="wait">
	{#if present}
		<MotionDiv key="presence-content" class={rootClass} initial={fadeUp.initial} animate={fadeUp.animate} exit={fadeUp.exit} transition={springPresence}>
			{@render children?.()}
		</MotionDiv>
	{/if}
</AnimatePresence>

<style lang="sass">
:global(.presence)
	display: grid
</style>
