<script lang="ts">
	import type { AnimatedSidebarHeaderProps } from './types.js';

	let { class: className, children }: AnimatedSidebarHeaderProps = $props();
</script>

<div data-slot="sidebar-header" class={className}>
	{#if children}
		{@render children()}
	{/if}
</div>
