<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luCheck, luMinus } from 'fractalicons/lucide';
	import type { CheckState } from '#lib/data/componentTypes.ts';

	interface Props {
		state?: CheckState;
		disabled?: boolean;
		class?: string;
		[key: string]: unknown;
	}

	let { state = 'unchecked', disabled = false, class: className = '', ...rest }: Props = $props();

	const rootClass = $derived(`k-check ${className}`.trim());
</script>

<span class={rootClass} data-state={disabled ? 'disabled' : state} aria-hidden="true" {...rest}>
	{#if state === 'checked'}
		<Icon icon={luCheck} size={13} />
	{:else if state === 'indeterminate'}
		<Icon icon={luMinus} size={13} />
	{/if}
</span>

<style lang="sass">

.k-check
	display: inline-flex
	align-items: center
	justify-content: center
	width: 18px
	height: 18px
	flex-shrink: 0
	border: 1.5px solid var(--border-strong)
	border-radius: var(--radius-sm, 4px)
	background: var(--bg-input)
	color: var(--text-inverse)
	transition: background var(--motionin1), border-color var(--motionin1)

	&[data-state='checked'],
	&[data-state='indeterminate']
		background: var(--theme-color)
		border-color: var(--theme-color)

	&[data-state='disabled']
		opacity: 0.5
</style>
