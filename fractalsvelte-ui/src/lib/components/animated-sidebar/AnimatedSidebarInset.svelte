<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import type { AnimatedSidebarInsetProps } from './types.js';

	let { class: className, children }: AnimatedSidebarInsetProps = $props();
</script>

<motion.main data-slot="sidebar-inset" class={className}>
	{#if children}
		{@render children()}
	{/if}
</motion.main>
