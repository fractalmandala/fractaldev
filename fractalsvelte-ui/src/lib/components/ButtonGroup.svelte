<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Orientation, ButtonGroupVariant } from '#lib/data/componentTypes.ts';

	interface Props {
		/** 'segmented' joins children into a pill with gaps; default attaches them tightly. */
		variant?: ButtonGroupVariant;
		orientation?: Orientation;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		variant = 'default',
		orientation = 'horizontal',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const rootClass = $derived(`k-button-group ${className}`.trim());
</script>

<div
	class={rootClass}
	data-variant={variant}
	data-orientation={orientation}
	role="group"
	{...rest}
>
	{@render children?.()}
</div>

<style lang="sass">

.k-button-group
	display: inline-flex
	align-items: stretch
	border: 1px solid var(--border)
	border-radius: var(--radius-sm)
	background: var(--bg-raised)
	overflow: hidden

	:global(.button),
	:global(.k-button)
		border: none
		border-radius: 0
		background: transparent

		&:hover
			background: var(--state-hover)

		&[data-variant='primary']
			background: var(--theme-color)
			color: var(--text-inverse)

	&[data-variant='segmented']
		gap: 2px
		padding: 2px
		background: var(--bg-raised)

		:global(.button),
		:global(.k-button)
			border-radius: var(--radius-xs, 2px)

	&[data-orientation='vertical']
		flex-direction: column
		align-items: stretch
</style>
