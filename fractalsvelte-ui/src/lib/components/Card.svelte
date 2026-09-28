<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PadSize } from '#lib/data/componentTypes.ts';

	type Props = {
		padding?: PadSize;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	};

	let {
		padding = 'md',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const rootClass = $derived(`card ${className}`.trim());
</script>

<section class={rootClass} data-padding={padding} {...rest}>
	{@render children?.()}
</section>

<style lang="sass">

.card
	display: flex
	flex-direction: column
	background: var(--bg-surface)
	border: 1px solid var(--border)
	border-radius: var(--radius-md)
	color: var(--text-primary)
	transition: border-color var(--motionout1), box-shadow var(--motionout1)

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

	footer
		margin-top: auto
		div
			transition: transform var(--motionout2)

	&:hover
		border-color: var(--border-strong)
		footer
			div
				transform: translateX(8px)
</style>
