<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		checked?: boolean;
		label?: string;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	};

	let {
		checked = $bindable(false),
		label,
		disabled = false,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const rootClass = $derived(`check ${className}`.trim());
</script>

<label class={rootClass} data-disabled={disabled || undefined} {...rest}>
	<input type="checkbox" bind:checked {disabled} />
	<span class="check-box" aria-hidden="true">✓</span>
	<span>{#if children}{@render children()}{:else}{label}{/if}</span>
</label>

<style lang="sass">

.check
	display: inline-flex
	align-items: center
	gap: calc(var(--space-2xs) * var(--gap-scale, 1))
	cursor: pointer
	user-select: none
	font-family: inherit
	font-size: var(--text-sm)
	color: var(--text-primary)

	input
		position: absolute
		width: 1px
		height: 1px
		opacity: 0

	&-box
		display: inline-flex
		align-items: center
		justify-content: center
		flex-shrink: 0
		width: 18px
		height: 18px
		border: 1px solid var(--border)
		border-radius: var(--radius-sm, 3px)
		background: var(--bg-input)
		color: transparent
		font-size: 12px
		font-weight: 700
		line-height: 1
		transition: background var(--motionin1), border-color var(--motionin1), color var(--motionin1)

	&:hover input:not(:disabled) + .check-box
		border-color: var(--theme-color)

	input:checked + .check-box
		background: var(--theme-color)
		border-color: var(--theme-color)
		color: var(--text-inverse)

	input:focus-visible + .check-box
		outline: 2px solid var(--ring)
		outline-offset: 2px

	input:disabled + .check-box
		opacity: 0.5

	&[data-disabled]
		opacity: 0.7
		cursor: not-allowed
</style>
