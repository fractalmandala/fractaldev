<script lang="ts">
	import { useAnimatedSidebarPanel } from './context.js';
	import type { AnimatedSidebarGroupLabelProps } from './types.js';

	let { class: className, children }: AnimatedSidebarGroupLabelProps = $props();

	const panel = useAnimatedSidebarPanel();
</script>

<div
	aria-hidden={panel.collapsed}
	data-slot="sidebar-group-label"
	data-collapsed={panel.collapsed ? 'true' : 'false'}
	class={className}
>
	{#if children}
		{@render children()}
	{/if}
</div>
