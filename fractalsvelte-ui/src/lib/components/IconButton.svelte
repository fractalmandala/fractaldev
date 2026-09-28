<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Size, IconButtonVariant, ButtonType } from '#lib/data/componentTypes.ts';

	interface Props {
		/** Required — describes the action for screen readers. */
		label: string;
		size?: Size;
		variant?: IconButtonVariant;
		disabled?: boolean;
		type?: ButtonType;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		label,
		size = 'md',
		variant = 'ghost',
		disabled = false,
		type = 'button',
		class: className = '',
		onclick,
		children,
		...rest
	}: Props = $props();

	const rootClass = $derived(`k-icon-button ${className}`.trim());
</script>

<button
	{type}
	class={rootClass}
	data-size={size}
	data-variant={variant}
	aria-label={label}
	title={label}
	{disabled}
	{onclick}
	{...rest}
>
	{@render children?.()}
</button>

<style lang="sass">

.k-icon-button
	display: inline-flex
	align-items: center
	justify-content: center
	width: 36px
	height: 36px
	padding: 0
	border-radius: var(--radius-sm)
	border: 1px solid transparent
	background: transparent
	color: var(--text-secondary)
	cursor: pointer
	transition: background-color var(--motionin1), color var(--motionin1), border-color var(--motionin1)

	&:hover:not(:disabled)
		background: var(--state-hover)
		color: var(--text-primary)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px

	&:disabled
		opacity: 0.5
		cursor: not-allowed

	&[data-size='sm']
		width: 28px
		height: 28px

	&[data-size='md'],
	&[data-size='bs']
		width: 36px
		height: 36px

	&[data-size='lg']
		width: 44px
		height: 44px

	&[data-variant='outline']
		border-color: var(--border)
		background: var(--bg)

	&[data-variant='solid'],
	&[data-variant='primary']
		background: var(--theme-color)
		color: var(--text-inverse)

		&:hover:not(:disabled)
			background: var(--theme-color-alt)
			color: var(--text-inverse)

	&[data-variant='secondary']
		background: var(--bg-surface-alt, var(--bg-surface))
		color: var(--text-primary)
		border-color: var(--border)

	&[data-variant='soft']
		background: color-mix(in srgb, var(--theme-color) 12%, transparent)
		color: var(--theme-color-alt)

	&[data-variant='destructive']
		color: var(--danger)

		&:hover:not(:disabled)
			background: color-mix(in srgb, var(--danger) 10%, transparent)
</style>
