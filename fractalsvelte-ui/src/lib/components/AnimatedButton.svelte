<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MotionButton } from '@humanspeak/svelte-motion';
	import { springFeedback } from '#lib/motion/presets.ts';

	type Props = {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		animated?: boolean;
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
	};

	let {
		variant = 'primary',
		size = 'md',
		type = 'button',
		disabled = false,
		animated = true,
		children,
		onclick
	}: Props = $props();
</script>

<MotionButton class="button {variant} {size}" data-variant={variant} data-size={size} data-motion={animated || undefined} {type} {disabled} {onclick} whileHover={animated && !disabled ? { y: -1 } : undefined} whileTap={animated && !disabled ? { scale: 0.97 } : undefined} transition={springFeedback}>
	{@render children?.()}
</MotionButton>
