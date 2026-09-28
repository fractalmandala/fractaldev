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

	const rootClass = $derived(`switch ${className}`.trim());
</script>

<label class={rootClass} data-disabled={disabled || undefined} {...rest}>
	<input type="checkbox" role="switch" bind:checked {disabled} />
	<span class="switch-track" aria-hidden="true">
		<span class="switch-thumb"></span>
	</span>
	{#if children}
		{@render children()}
	{:else if label}
		<span>{label}</span>
	{/if}
</label>

<style lang="sass">

.switch
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

	&-track
		display: inline-flex
		align-items: center
		width: 40px
		height: 22px
		padding: 2px
		background: var(--bg-raised)
		border: 1px solid var(--border)
		border-radius: var(--radius-full)
		cursor: pointer
		transition: background var(--motionin1), border-color var(--motionin1)

	&-thumb
		width: 16px
		height: 16px
		background: var(--text-inverse)
		border-radius: var(--radius-full)
		box-shadow: var(--shadow-sm)
		transition: translate var(--motionin1)

	input:checked + .switch-track
		background: var(--theme-color)
		border-color: var(--theme-color)
		.switch-thumb
			translate: 18px 0

	input:focus-visible + .switch-track
		outline: 2px solid var(--ring)
		outline-offset: 2px

	input:disabled + .switch-track
		opacity: 0.5

	&[data-disabled]
		opacity: 0.7
		cursor: not-allowed
</style>
