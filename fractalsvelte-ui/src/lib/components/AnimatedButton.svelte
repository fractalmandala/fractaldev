<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ButtonVariant, Size, ButtonType } from '#lib/data/componentTypes.ts';
	import { MotionButton } from '@humanspeak/svelte-motion';
	import { springFeedback } from '#lib/motion/presets.ts';

	type Props = {
		variant?: ButtonVariant;
		size?: Size;
		type?: ButtonType;
		disabled?: boolean;
		animated?: boolean;
		class?: string;
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
		[key: string]: unknown;
	};

	let {
		variant = 'primary',
		size = 'md',
		type = 'button',
		disabled = false,
		animated = true,
		class: className = '',
		children,
		onclick,
		...rest
	}: Props = $props();

	const rootClass = $derived(`button ${className}`.trim());
</script>

<MotionButton
	class={rootClass}
	data-variant={variant}
	data-size={size}
	data-motion={animated || undefined}
	{type}
	{disabled}
	{onclick}
	whileHover={animated && !disabled ? { y: -1 } : undefined}
	whileTap={animated && !disabled ? { scale: 0.97 } : undefined}
	transition={springFeedback}
	{...rest}
>
	{@render children?.()}
</MotionButton>

<style lang="sass">

:global(.button)
	display: inline-flex
	align-items: center
	justify-content: center
	gap: var(--space-xs)
	padding-inline: var(--space-sm)
	border: 1px solid transparent
	font-family: inherit
	font-size: var(--text-sm)
	font-weight: 500
	line-height: 1
	text-decoration: none
	cursor: pointer
	user-select: none
	border-radius: var(--radius-sm)
	white-space: nowrap
	transition: background var(--motionin1), border-color var(--motionin1), color var(--motionin1)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 1px

	&:disabled
		opacity: 0.5
		cursor: not-allowed
		pointer-events: none

	// --- Sizes ---
	&[data-size='sm']
		height: var(--control-h-sm, 20px)
		padding-inline: var(--space-xs)
		font-size: var(--text-sm)

	&[data-size='md']
		height: var(--control-h-md, 24px)
		padding-inline: var(--space-sm)
		font-size: var(--text-md)

	&[data-size='bs']
		height: var(--control-h-bs, 32px)
		padding-inline: var(--space-md)
		font-size: var(--text-bs)

	&[data-size='lg']
		height: var(--control-h-lg, 40px)
		padding-inline: var(--space-lg)
		font-size: var(--text-lg)

	// --- Variants ---
	&[data-variant='primary']
		background: var(--theme-color)
		color: var(--text-inverse)
		border-color: transparent
		&:hover:not(:disabled)
			background: var(--theme-color-alt)

	&[data-variant='secondary']
		background: var(--bg-raised)
		color: var(--text-primary)
		border-color: var(--border)
		&:hover:not(:disabled)
			background: var(--state-hover)

	&[data-variant='destructive'],
	&[data-variant='danger']
		background: var(--danger)
		color: var(--text-inverse)
		border-color: transparent
		&:hover:not(:disabled)
			background: var(--danger-hover)

	&[data-variant='outline']
		background: var(--bg-surface)
		color: var(--text-primary)
		border-color: var(--border)
		&:hover:not(:disabled)
			background: var(--state-hover)
			border-color: var(--theme-color)

	&[data-variant='ghost']
		background: transparent
		color: var(--text-primary)
		border-color: transparent
		&:hover:not(:disabled)
			background: var(--bg-raised)

	&[data-variant='link']
		background: transparent
		border-color: transparent
		color: var(--theme-color)
		padding-inline: var(--space-3xs)
		&:hover:not(:disabled)
			text-decoration: underline

	&[data-variant='soft']
		background: color-mix(in srgb, var(--theme-color) 12%, transparent)
		color: var(--theme-color-alt)
		border-color: transparent
		&:hover:not(:disabled)
			background: color-mix(in srgb, var(--theme-color) 20%, transparent)
</style>
