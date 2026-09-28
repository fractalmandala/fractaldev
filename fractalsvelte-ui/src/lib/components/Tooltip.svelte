<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { TooltipPosition } from '#lib/data/componentTypes.ts';

	type Props = {
		content: string;
		position?: TooltipPosition;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	};

	let {
		content,
		position = 'top',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const rootClass = $derived(`tooltip ${className}`.trim());
</script>

<span class={rootClass} data-position={position} {...rest}>
	{@render children?.()}
	<span class="tooltip-bubble" role="tooltip">{content}</span>
</span>

<style lang="sass">

.tooltip
	position: relative
	display: inline-flex

	&-bubble
		position: absolute
		bottom: calc(100% + 8px)
		left: 50%
		translate: -50% 0
		z-index: var(--z-raised, 50)
		white-space: nowrap
		padding: calc(var(--space-3xs) * var(--pad-scale, 1)) calc(var(--space-2xs) * var(--pad-scale, 1))
		font-family: inherit
		font-size: var(--text-xs)
		color: var(--text-inverse)
		background: var(--bg-sidebar, #1e2029)
		border-radius: var(--radius-sm)
		box-shadow: var(--shadow-md)
		opacity: 0
		visibility: hidden
		pointer-events: none
		transition: opacity var(--motionin1), visibility var(--motionin1), translate var(--motionin1)

		&::after
			content: ''
			position: absolute
			top: 100%
			left: 50%
			translate: -50% 0
			border: 5px solid transparent
			border-top-color: var(--bg-sidebar, #1e2029)

	&:hover,
	&:focus-within
		.tooltip-bubble
			opacity: 1
			visibility: visible
			translate: -50% -2px

	&[data-position='bottom']
		.tooltip-bubble
			bottom: auto
			top: calc(100% + 8px)
			translate: -50% 0

			&::after
				top: auto
				bottom: 100%
				border-top-color: transparent
				border-bottom-color: var(--bg-sidebar, #1e2029)

		&:hover,
		&:focus-within
			.tooltip-bubble
				translate: -50% 2px
</style>
