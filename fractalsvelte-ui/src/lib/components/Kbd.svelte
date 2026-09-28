<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let { class: className = '', children, ...rest }: Props = $props();

	const rootClass = $derived(`kbd ${className}`.trim());
</script>

<kbd class={rootClass} {...rest}>{@render children?.()}</kbd>

<style lang="sass">

.kbd
	display: inline-block
	padding-inline: calc(var(--space-2xs) * var(--pad-scale, 1))
	padding-block: 2px
	font-family: var(--font-mono, monospace)
	font-size: var(--text-xs)
	line-height: 1.4
	background: var(--bg-raised)
	color: var(--text-primary)
	border: 1px solid var(--border)
	border-radius: var(--radius-sm)
	box-shadow: var(--shadow-sm, 0 1px 1px rgba(0, 0, 0, 0.08))
	user-select: none
	white-space: nowrap
</style>
