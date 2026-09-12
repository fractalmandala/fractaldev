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

	function toggle(e: MouseEvent) {
		pressed = !pressed;
		onPressedChange?.(pressed);
		onclick?.(e);
	}
</script>

<button
	type="button"
	class="k-toggle-button {className}"
	data-state={pressed ? 'on' : undefined}
	aria-pressed={pressed}
	{disabled}
	onclick={toggle}
	{...rest}
>
	{@render children?.()}
</button>
