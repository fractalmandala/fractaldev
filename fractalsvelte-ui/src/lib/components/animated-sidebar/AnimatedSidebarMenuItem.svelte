<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import { SPRING_LAYOUT } from '../../ease.js';
	import SharedLayoutBgItem from '../shared-layout-bg/SharedLayoutBgItem.svelte';
	import type { AnimatedSidebarMenuItemProps } from './types.js';

	let { class: className, children }: AnimatedSidebarMenuItemProps = $props();
</script>

<motion.li
	layout="position"
	transition={SPRING_LAYOUT}
	data-slot="sidebar-menu-item"
	class={className}
>
	<SharedLayoutBgItem>
		{#if children}
			{@render children()}
		{/if}
	</SharedLayoutBgItem>
</motion.li>
