<script lang="ts">
	import type { AnimatedSidebarContentProps } from './types.js';

	let { class: className, children }: AnimatedSidebarContentProps = $props();
</script>

<div data-slot="sidebar-content" class={className}>
	{#if children}
		{@render children()}
	{/if}
</div>
