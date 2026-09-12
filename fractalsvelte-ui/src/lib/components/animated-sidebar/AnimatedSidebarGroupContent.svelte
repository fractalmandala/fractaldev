<script lang="ts">
	import type { AnimatedSidebarGroupContentProps } from './types.js';

	let { class: className, children }: AnimatedSidebarGroupContentProps = $props();
</script>

<div data-slot="sidebar-group-content" class={className}>
	{#if children}
		{@render children()}
	{/if}
</div>
