<script lang="ts">
	type Props = {
		value?: string;
		placeholder?: string;
		rows?: number;
		disabled?: boolean;
		name?: string;
		id?: string;
		ariaLabel?: string;
		class?: string;
		[key: string]: unknown;
	};

	let {
		value = $bindable(''),
		placeholder = '',
		rows = 4,
		disabled = false,
		name,
		id,
		ariaLabel,
		class: className = '',
		...rest
	}: Props = $props();

	const rootClass = $derived(`textarea ${className}`.trim());
</script>

<textarea
	class={rootClass}
	bind:value
	{placeholder}
	{rows}
	{disabled}
	{name}
	{id}
	aria-label={ariaLabel}
	data-disabled={disabled || undefined}
	{...rest}
></textarea>

<style lang="sass">

.textarea
	display: block
	width: 100%
	min-height: 80px
	padding: calc(var(--space-xs) * var(--pad-scale, 1))
	font-family: inherit
	font-size: var(--text-sm)
	line-height: 1.5
	background: var(--bg-input)
	color: var(--text-primary)
	border: 1px solid var(--border)
	border-radius: var(--radius-sm)
	resize: vertical
	transition: border-color var(--motionin1), box-shadow var(--motionin1)

	&::placeholder
		color: var(--text-muted)

	&:focus-visible
		outline: none
		border-color: var(--theme-color)
		box-shadow: 0 0 0 2px var(--ring)

	&:disabled,
	&[data-disabled]
		opacity: 0.5
		cursor: not-allowed
</style>
