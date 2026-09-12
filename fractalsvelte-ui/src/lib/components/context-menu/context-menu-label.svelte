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
