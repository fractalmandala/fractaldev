<script lang="ts">
	type Size = 'sm' | 'md' | 'lg';
	type Variant = 'ghost' | 'outline' | 'solid';

	interface Props {
		/** Required — describes the action for screen readers. */
		label: string;
		size?: Size;
		variant?: Variant;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: import('svelte').Snippet;
	}

	let {
		label,
		size = 'md',
		variant = 'ghost',
		disabled = false,
		type = 'button',
		class: className = '',
		onclick,
		children,
		...rest
	}: Props = $props();
</script>

<button
	{type}
	class="k-icon-button {className}"
	data-size={size}
	data-variant={variant}
	aria-label={label}
	title={label}
	{disabled}
	{onclick}
	{...rest}
>
	{@render children?.()}
</button>
