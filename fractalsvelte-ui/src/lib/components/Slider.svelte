<script lang="ts">
	interface Props {
		value?: number;
		onValueChange?: (value: number) => void;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		/** Show a live value bubble above the thumb. */
		showValue?: boolean;
		label?: string;
		class?: string;
		[key: string]: unknown;
	}

	let {
		value = $bindable(50),
		onValueChange,
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		showValue = false,
		label = 'Slider',
		class: className = '',
		...rest
	}: Props = $props();

	const pct = $derived(((value - min) / (max - min)) * 100);
	const inputId = `fs-slider-${Math.random().toString(36).slice(2, 8)}`;
	const rootClass = $derived(`slider-group ${className}`.trim());

	function onChange(e: Event) {
		const v = Number((e.currentTarget as HTMLInputElement).value);
		value = v;
		onValueChange?.(v);
	}
</script>

<div class={rootClass} data-disabled={disabled || undefined} {...rest}>
	{#if label || showValue}
		<div class="slider-header">
			<label class="slider-label" for={inputId}>{label}</label>
			{#if showValue}<span class="slider-value">{value}</span>{/if}
		</div>
	{/if}
	<input
		id={inputId}
		class="slider"
		type="range"
		{min}
		{max}
		{step}
		{value}
		{disabled}
		style={`--fs-slider-pct:${pct}%`}
		oninput={onChange}
	/>
</div>

<style lang="sass">

.slider-group
	display: flex
	flex-direction: column
	gap: calc(var(--space-2xs) * var(--gap-scale, 1))
	width: 100%

	&[data-disabled]
		opacity: 0.5
		cursor: not-allowed

.slider-header
	display: flex
	align-items: center
	justify-content: space-between
	width: 100%

.slider-label
	font-family: inherit
	font-size: var(--text-xs)
	font-weight: 500
	color: var(--text-secondary)

.slider-value
	font-family: inherit
	font-size: var(--text-xs)
	font-weight: 600
	color: var(--theme-color)

.slider
	appearance: none
	-webkit-appearance: none
	width: 100%
	height: 6px
	margin: calc(var(--space-2xs) * var(--gap-scale, 1)) 0
	background: linear-gradient(to right, var(--theme-color) var(--fs-slider-pct, 50%), var(--bg-raised) var(--fs-slider-pct, 50%))
	border-radius: var(--radius-full)
	outline: none
	cursor: pointer

	&::-webkit-slider-thumb
		appearance: none
		-webkit-appearance: none
		width: 18px
		height: 18px
		border-radius: var(--radius-full)
		background: var(--bg-popover, var(--bg-surface))
		border: 2px solid var(--theme-color)
		box-shadow: var(--shadow-sm)
		transition: transform var(--motionin1)

	&::-webkit-slider-thumb:hover
		transform: scale(1.1)

	&::-moz-range-thumb
		width: 18px
		height: 18px
		border-radius: var(--radius-full)
		background: var(--bg-popover, var(--bg-surface))
		border: 2px solid var(--theme-color)
		box-shadow: var(--shadow-sm)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px

	&:disabled
		opacity: 0.5
		cursor: not-allowed
</style>
