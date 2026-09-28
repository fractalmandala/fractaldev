<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		inset = false,
		class: className
	}: {
		children: Snippet;
		inset?: boolean;
		class?: string;
	} = $props();
</script>

<div data-slot="context-menu-label" data-inset={inset ? 'true' : undefined} class={className}>
	{@render children()}
</div>

<style lang="sass">
[data-slot="context-menu-label"]
	padding: var(--space-2xs) var(--space-xs)
	font-size: var(--text-xs)
	font-weight: 600
	text-transform: uppercase
	letter-spacing: 0.12em
	color: var(--text-muted)

	&[data-inset="true"]
		padding-left: 2rem
</style>
