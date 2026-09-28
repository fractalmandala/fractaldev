<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		cite?: string;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let { cite, class: className = '', children, ...rest }: Props = $props();

	const rootClass = $derived(`k-blockquote ${className}`.trim());
</script>

<blockquote class={rootClass} {...rest}>
	{@render children?.()}
	{#if cite}<cite class="k-blockquote-cite">— {cite}</cite>{/if}
</blockquote>

<style lang="sass">

.k-blockquote
	margin: 0
	padding: var(--space-sm) var(--space-md)
	border-left: 3px solid var(--theme-color)
	border-radius: 0 var(--radius-md) var(--radius-md) 0
	background: var(--bg-surface)
	font-family: inherit
	font-size: var(--text-lg)
	font-style: italic
	color: var(--text-primary)

	.k-blockquote-cite
		display: block
		margin-top: 8px
		font-size: var(--text-sm)
		font-style: normal
		color: var(--text-muted)
</style>
