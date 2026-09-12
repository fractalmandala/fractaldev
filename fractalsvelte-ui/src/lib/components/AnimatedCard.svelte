<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MotionDiv } from '@humanspeak/svelte-motion';
	import { springFeedback } from '#lib/motion/presets.ts';

	type Props = {
		padding?: 'none' | 'sm' | 'md' | 'lg';
		interactive?: boolean;
		children?: Snippet;
	};

	let { padding = 'md', interactive = false, children }: Props = $props();
</script>

<MotionDiv class="card animated-card" data-padding={padding} data-interactive={interactive || undefined} layout={interactive} whileHover={interactive ? { y: -3 } : undefined} whileTap={interactive ? { scale: 0.99 } : undefined} transition={springFeedback}>
	{@render children?.()}
</MotionDiv>
