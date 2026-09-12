<script lang="ts">
	import type { AnimatedSidebarGroupProps } from './types.js';

	let { class: className, children }: AnimatedSidebarGroupProps = $props();
</script>

<div data-slot="sidebar-group" class={className}>
	{#if children}
		{@render children()}
	{/if}
</div>
