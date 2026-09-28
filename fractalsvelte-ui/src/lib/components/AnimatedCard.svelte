<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PadSize } from '#lib/data/componentTypes.ts';
	import { MotionDiv } from '@humanspeak/svelte-motion';
	import { springFeedback } from '#lib/motion/presets.ts';

	type Props = {
		padding?: PadSize;
		interactive?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	};

	let {
		padding = 'md',
		interactive = false,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const rootClass = $derived(`animated-card ${className}`.trim());
</script>

<MotionDiv
	class={rootClass}
	data-padding={padding}
	data-interactive={interactive || undefined}
	layout={interactive}
	whileHover={interactive ? { y: -3 } : undefined}
	whileTap={interactive ? { scale: 0.99 } : undefined}
	transition={springFeedback}
	{...rest}
>
	{@render children?.()}
</MotionDiv>

<style lang="sass">

:global(.animated-card)
	display: flex
	flex-direction: column
	background: var(--bg-surface)
	border: 1px solid var(--border)
	border-radius: var(--radius-md)
	color: var(--text-primary)
	transition: transform var(--motionin1), box-shadow var(--motionin1), border-color var(--motionin1)

	&[data-padding='none']
		padding: 0

	&[data-padding='sm']
		padding: calc(var(--space-xs) * var(--pad-scale, 1))

	&[data-padding='md']
		padding: calc(var(--space-md) * var(--pad-scale, 1))

	&[data-padding='bs']
		padding: calc(var(--space-md) * var(--pad-scale, 1))

	&[data-padding='lg']
		padding: calc(var(--space-lg) * var(--pad-scale, 1))

	&[data-interactive='true']:hover
		border-color: var(--border-strong)
		box-shadow: var(--shadow-md, 0 8px 24px rgba(0, 0, 0, 0.12))
</style>
