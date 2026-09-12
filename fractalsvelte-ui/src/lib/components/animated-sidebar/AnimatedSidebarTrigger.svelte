<script lang="ts">
	import { untrack } from 'svelte';
	import { useAnimatedSidebar } from './context.js';
	import type { AnimatedSidebarTriggerProps } from './types.js';

	let {
		'aria-label': ariaLabel = 'Toggle sidebar',
		type = 'button',
		onclick,
		class: className,
		children
	}: AnimatedSidebarTriggerProps = $props();

	const ctx = useAnimatedSidebar();
	let buttonEl = $state<HTMLButtonElement | null>(null);

	$effect(() => {
		ctx.registerTrigger(untrack(() => buttonEl));
		return () => ctx.registerTrigger(null);
	});

	const expanded = $derived(ctx.isMobile ? ctx.openMobile : ctx.open);

	function handleClick(event: MouseEvent) {
		onclick?.(event);
		if (!event.defaultPrevented) ctx.toggleSidebar();
	}
</script>

<button
	bind:this={buttonEl}
	type={type}
	aria-label={ariaLabel}
	aria-expanded={expanded}
	data-slot="sidebar-trigger"
	data-state={expanded ? 'expanded' : 'collapsed'}
	onclick={handleClick}
	class={className}
>
	{@render children()}
</button>
