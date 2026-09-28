<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		class: className
	}: {
		children: Snippet;
		class?: string;
	} = $props();
</script>

<span aria-hidden="true" data-slot="context-menu-shortcut" class={className}>
	{@render children()}
</span>

<style lang="sass">
[data-slot="context-menu-shortcut"]
	margin-left: auto
	padding-left: var(--space-sm)
	font-size: var(--text-xs)
	font-weight: 500
	letter-spacing: 0.025em
	color: var(--text-muted)
</style>
