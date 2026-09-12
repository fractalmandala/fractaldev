<script lang="ts">
	import SharedLayoutBg from '../shared-layout-bg/SharedLayoutBg.svelte';
	import type { AnimatedSidebarMenuProps } from './types.js';

	let { class: className, children }: AnimatedSidebarMenuProps = $props();
</script>

<SharedLayoutBg
	as="ul"
	inset={0}
	pillClassName="sidebar-menu-pill"
	pillContainerClassName="sidebar-menu-pill-wrap"
	data-slot="sidebar-menu"
	class={className}
>
	{@render children()}
</SharedLayoutBg>
