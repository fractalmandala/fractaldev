<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MotionDiv } from '@humanspeak/svelte-motion';
	import { tweenContent } from '#lib/motion/presets.ts';

	type Props = {
		delay?: number;
		children?: Snippet;
		class?: string;
	};

	let { delay = 0, children, class: className = '' }: Props = $props();
	const rootClass = $derived(['reveal', className].filter(Boolean).join(' '));
	let transition = $derived({ ...tweenContent, delay });
</script>

<MotionDiv class={rootClass} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={transition}>
	{@render children?.()}
</MotionDiv>

<style lang="sass">
:global(.reveal)
	will-change: transform, opacity
</style>
