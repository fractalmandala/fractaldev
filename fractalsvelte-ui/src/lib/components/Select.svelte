<script lang="ts">
	type Option = { label: string; value: string; disabled?: boolean };
	type Props = {
		value?: string;
		options: Option[];
		placeholder?: string;
		disabled?: boolean;
		class?: string;
		[key: string]: unknown;
	};

	let {
		value = $bindable(''),
		options,
		placeholder = 'Select an option',
		disabled = false,
		class: className = '',
		...rest
	}: Props = $props();

	const rootClass = $derived(`select ${className}`.trim());
</script>

<select
	class={rootClass}
	bind:value
	{disabled}
	aria-label={placeholder}
	data-disabled={disabled || undefined}
	{...rest}
>
	<option value="" disabled>{placeholder}</option>
	{#each options as option}
		<option value={option.value} disabled={option.disabled}>{option.label}</option>
	{/each}
</select>

<style lang="sass">

.select
	display: block
	width: 100%
	height: var(--control-h-md)
	padding-inline: calc(var(--space-xs) * var(--pad-scale, 1))
	padding-right: 28px
	font-family: inherit
	font-size: var(--text-sm)
	appearance: none
	-webkit-appearance: none
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23697080' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
	background-repeat: no-repeat
	background-position: right 8px center
	background-color: var(--bg-input)
	color: var(--text-primary)
	border: 1px solid var(--border)
	border-radius: var(--radius-sm)
	cursor: pointer
	transition: border-color var(--motionin1), box-shadow var(--motionin1)

	&:focus-visible
		outline: none
		border-color: var(--theme-color)
		box-shadow: 0 0 0 2px var(--ring)

	&:disabled,
	&[data-disabled]
		opacity: 0.5
		cursor: not-allowed
</style>
