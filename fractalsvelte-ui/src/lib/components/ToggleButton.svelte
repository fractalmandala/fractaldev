<script lang="ts">
	interface Props {
		pressed?: boolean;
		onPressedChange?: (pressed: boolean) => void;
		disabled?: boolean;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: import('svelte').Snippet;
	}

	let {
		pressed = $bindable(false),
		onPressedChange,
		disabled = false,
		class: className = '',
		onclick,
		children,
		...rest
	}: Props = $props();

	const rootClass = $derived(['k-toggle-button', className].filter(Boolean).join(' '));

	function toggle(e: MouseEvent) {
		pressed = !pressed;
		onPressedChange?.(pressed);
		onclick?.(e);
	}
</script>

<button
	type="button"
	class={rootClass}
	data-state={pressed ? 'on' : undefined}
	aria-pressed={pressed}
	{disabled}
	onclick={toggle}
	{...rest}
>
	{@render children?.()}
</button>

<style lang="sass">
.k-toggle-button
	display: inline-flex
	align-items: center
	justify-content: center
	gap: 6px
	padding: 6px 14px
	font-size: var(--text-sm)
	font-weight: 500
	border-radius: var(--radius-sm)
	border: 1px solid var(--border)
	background: var(--bg-surface)
	color: var(--text-secondary)
	cursor: pointer
	transition: background-color var(--motion-fast) ease, color var(--motion-fast) ease, border-color var(--motion-fast) ease
	&:hover
		background: var(--state-hover)
	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px
	&[data-state='on']
		background: color-mix(in srgb, var(--theme-color) 12%, var(--bg-surface))
		border-color: color-mix(in srgb, var(--theme-color) 40%, var(--border))
		color: var(--theme-color-alt)
	&:disabled
		opacity: 0.5
		cursor: not-allowed
</style>
