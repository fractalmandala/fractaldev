<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MotionDiv } from '@humanspeak/svelte-motion';
	import { tweenContent } from '#lib/motion/presets.ts';

	type Props = {
		delay?: number;
		children?: Snippet;
	};

	let { delay = 0, children }: Props = $props();
	let transition = $derived({ ...tweenContent, delay });
</script>

<MotionDiv class="reveal" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={transition}>
	{@render children?.()}
</MotionDiv>
