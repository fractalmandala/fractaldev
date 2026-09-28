<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ButtonVariant, ButtonSize, ButtonShape, ButtonType } from '#lib/data/componentTypes.ts';

	type Props = {
		variant?: ButtonVariant;
		size?: ButtonSize;
		shape?: ButtonShape;
		type?: ButtonType;
		disabled?: boolean;
		loading?: boolean;
		href?: string;
		class?: string;
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
		[key: string]: unknown;
	};

	let {
		variant = 'primary',
		size = 'bs',
		shape = 'modern',
		type = 'button',
		disabled = false,
		loading = false,
		href,
		class: className = '',
		children,
		onclick,
		...rest
	}: Props = $props();

	const inert = $derived(disabled || loading);
	const rootClass = $derived(`button ${className}`.trim());
</script>

{#if href}
	<a
		class={rootClass}
		data-variant={variant}
		data-size={size}
		data-shape={shape}
		data-loading={loading}
		aria-busy={loading || undefined}
		aria-disabled={inert || undefined}
		{href}
		{onclick}
		{...rest}
	>
		{#if loading}
			<span class="button-spinner" aria-hidden="true"></span>
		{/if}
		{@render children?.()}
	</a>
{:else}
	<button
		class={rootClass}
		data-variant={variant}
		data-size={size}
		data-shape={shape}
		data-loading={loading}
		aria-busy={loading || undefined}
		{type}
		disabled={inert}
		{onclick}
		{...rest}
	>
		{#if loading}
			<span class="button-spinner" aria-hidden="true"></span>
		{/if}
		{@render children?.()}
	</button>
{/if}

<style lang="sass">

.button
	display: inline-flex
	align-items: center
	justify-content: center
	gap: var(--space-xs)
	padding-inline: var(--space-sm)
	border: 1px solid transparent
	font-family: inherit
	font-size: var(--text-md)
	font-weight: 500
	line-height: 1
	text-decoration: none
	cursor: pointer
	user-select: none
	border-radius: var(--radius-sm)
	transition: background var(--motionout1), border-color var(--motionout1), color var(--motionout1), opacity var(--motionout1)
	transform-origin: center center
	white-space: nowrap

	&:active
		transform: scale(1.02)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 1px

	&:disabled,
	&[aria-disabled='true']
		opacity: 0.5
		cursor: not-allowed
		pointer-events: none

	&[data-loading='true']
		cursor: progress

	// --- Shapes ---
	&[data-shape='square']
		border-radius: 0

	&[data-shape='modern']
		border-radius: var(--radius-sm)

	&[data-shape='curved']
		border-radius: var(--radius-md)

	&[data-shape='round'],
	&[data-shape='pill']
		border-radius: var(--radius-full)

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

	&[data-size='icon-sm'],
	&[data-size='icon'],
	&[data-size='icon-lg']
		padding: 0
		aspect-ratio: 1

	&[data-size='icon-sm']
		width: var(--control-h-sm, 26px)
		height: var(--control-h-sm, 26px)

	&[data-size='icon']
		width: var(--control-h-md, 32px)
		height: var(--control-h-md, 32px)

	&[data-size='icon-lg']
		width: var(--control-h-lg, 38px)
		height: var(--control-h-lg, 38px)

	// --- Variants ---
	&[data-variant='primary']
		background: var(--theme-color)
		color: var(--text-inverse)
		border-color: transparent
		&:hover:not(:disabled):not([aria-disabled='true'])
			background: var(--theme-color-alt)

	&[data-variant='secondary']
		background: var(--bg-raised)
		color: var(--text-primary)
		border-color: var(--border)
		&:hover:not(:disabled):not([aria-disabled='true'])
			background: var(--state-hover)

	&[data-variant='destructive'],
	&[data-variant='danger']
		background: var(--danger)
		color: var(--text-inverse)
		border-color: transparent
		&:hover:not(:disabled):not([aria-disabled='true'])
			background: var(--danger-hover)

	&[data-variant='outline']
		background: transparent
		color: var(--text-primary)
		border-color: var(--border)
		&:hover:not(:disabled):not([aria-disabled='true'])
			border-color: var(--theme-color)
			background: transparent
			color: var(--theme-color)

	&[data-variant='ghost']
		background: transparent
		color: var(--text-primary)
		border-color: transparent
		&:hover:not(:disabled):not([aria-disabled='true'])
			background: var(--bg-raised)

	&[data-variant='link']
		background: transparent
		border-color: transparent
		color: var(--theme-color)
		padding-inline: var(--space-3xs)
		&:hover:not(:disabled):not([aria-disabled='true'])
			text-decoration: underline

	&[data-variant='soft']
		background: color-mix(in srgb, var(--theme-color) 12%, transparent)
		color: var(--theme-color-alt)
		border-color: transparent
		&:hover:not(:disabled):not([aria-disabled='true'])
			background: color-mix(in srgb, var(--theme-color) 20%, transparent)

.button-spinner
	width: 1em
	height: 1em
	flex-shrink: 0
	border: 2px solid currentColor
	border-right-color: transparent
	border-radius: var(--radius-full)
	animation: button-spin 0.7s linear infinite

@keyframes button-spin
	to
		transform: rotate(360deg)
</style>

