<script lang="ts">
	import type { AnimatedSidebarFooterProps } from './types.js';

	let { class: className, children }: AnimatedSidebarFooterProps = $props();
</script>

<div data-slot="sidebar-footer" class={className}>
	{#if children}
		{@render children()}
	{/if}
</div>
