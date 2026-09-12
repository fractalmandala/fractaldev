<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MotionDiv } from '@humanspeak/svelte-motion';
	import { springFeedback } from '#lib/motion/presets.ts';

	type Props = {
		strength?: number;
		maxOffset?: number;
		disabled?: boolean;
		children?: Snippet;
	};

	let { strength = 0.16, maxOffset = 12, disabled = false, children }: Props = $props();
	let offset = $state({ x: 0, y: 0 });

	function move(event: PointerEvent) {
		if (disabled || event.pointerType !== 'mouse') return;
		const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
		offset = {
			x: Math.max(-maxOffset, Math.min(maxOffset, (event.clientX - (bounds.left + bounds.width / 2)) * strength)),
			y: Math.max(-maxOffset, Math.min(maxOffset, (event.clientY - (bounds.top + bounds.height / 2)) * strength))
		};
	}

	function reset() {
		offset = { x: 0, y: 0 };
	}
</script>

<MotionDiv class="magnetic" data-disabled={disabled || undefined} animate={offset} transition={springFeedback} onpointermove={move} onpointerleave={reset}>
	{@render children?.()}
</MotionDiv>
