<script lang="ts">
	import type { Snippet } from 'svelte';
	import { AnimatePresence, MotionDiv } from '@humanspeak/svelte-motion';
	import { fadeUp, springPresence } from '#lib/motion/presets.ts';

	type Props = {
		present?: boolean;
		children?: Snippet;
	};

	let { present = false, children }: Props = $props();
</script>

<AnimatePresence mode="wait">
	{#if present}
		<MotionDiv key="presence-content" class="presence" initial={fadeUp.initial} animate={fadeUp.animate} exit={fadeUp.exit} transition={springPresence}>
			{@render children?.()}
		</MotionDiv>
	{/if}
</AnimatePresence>
