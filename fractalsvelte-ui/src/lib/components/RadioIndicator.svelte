<script lang="ts">
	import type { RadioState } from '#lib/data/componentTypes.ts';

	interface Props {
		state?: RadioState;
		disabled?: boolean;
		class?: string;
		[key: string]: unknown;
	}

	let { state = 'unchecked', disabled = false, class: className = '', ...rest }: Props = $props();

	const rootClass = $derived(`k-radio ${className}`.trim());
</script>

<span
	class={rootClass}
	data-state={disabled ? 'disabled' : state}
	aria-hidden="true"
	{...rest}
></span>

<style lang="sass">

.k-radio
	display: inline-flex
	align-items: center
	justify-content: center
	width: 18px
	height: 18px
	flex-shrink: 0
	border: 1.5px solid var(--border-strong)
	border-radius: var(--radius-full)
	background: var(--bg-input)
	transition: border-color var(--motionin1)

	&::after
		content: ''
		width: 8px
		height: 8px
		border-radius: var(--radius-full)
		background: var(--theme-color)
		transform: scale(0)
		transition: transform var(--motionin1)

	&[data-state='checked']
		border-color: var(--theme-color)
		&::after
			transform: scale(1)

	&[data-state='disabled']
		opacity: 0.5
</style>
