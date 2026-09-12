<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' | 'soft';
	type Size = 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon' | 'icon-lg';

	type Props = {
		variant?: Variant | 'danger';
		size?: Size;
		shape?: 'default' | 'pill';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		loading?: boolean;
		href?: string;
		class?: string;
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
		[key: string]: unknown;
	};

	let {
		variant = 'primary',
		size = 'md',
		shape = 'default',
		type = 'button',
		disabled = false,
		loading = false,
		href,
		class: className = '',
		children,
		onclick,
		...rest
	}: Props = $props();

	// 'danger' remains accepted as an alias of 'destructive'.
	const intent = $derived(variant === 'danger' ? 'destructive' : variant);
	const inert = $derived(disabled || loading);
	const rootClass = $derived(`button ${intent} ${size} ${className}`.trim());
</script>

{#if href}
	<a
		class={rootClass}
		data-variant={intent}
		data-size={size}
		data-shape={shape}
		data-loading={loading}
		aria-busy={loading || undefined}
		aria-disabled={inert || undefined}
		{href}
		{onclick}
		{...rest}
	>
		{#if loading}
			<span class="button-spinner" aria-hidden="true"></span>
		{/if}
		{@render children?.()}
	</a>
{:else}
	<button
		class={rootClass}
		data-variant={intent}
		data-size={size}
		data-shape={shape}
		data-loading={loading}
		aria-busy={loading || undefined}
		{type}
		disabled={inert}
		{onclick}
		{...rest}
	>
		{#if loading}
			<span class="button-spinner" aria-hidden="true"></span>
		{/if}
		{@render children?.()}
	</button>
{/if}
