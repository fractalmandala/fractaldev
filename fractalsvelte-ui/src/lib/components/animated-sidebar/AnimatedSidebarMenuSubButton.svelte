<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import { SPRING_PRESS } from '../../ease.js';
	import { useAnimatedSidebar } from './context.js';
	import type { AnimatedSidebarMenuSubButtonProps } from './types.js';

	let {
		children,
		icon,
		href,
		isActive = false,
		disabled = false,
		closeOnSelect = true,
		target,
		rel,
		onSelect,
		class: className
	}: AnimatedSidebarMenuSubButtonProps = $props();

	const ctx = useAnimatedSidebar();

	function select(event: MouseEvent) {
		if (disabled) {
			event.preventDefault();
			return;
		}
		onSelect?.();
		if (ctx.isMobile && closeOnSelect) ctx.setOpenMobile(false);
	}
</script>

{#snippet content()}
	<span aria-hidden="true" data-slot="sidebar-menu-sub-button-icon">
		{#if icon}
			{@render icon()}
		{:else}
			<span data-slot="sidebar-menu-sub-button-dot"></span>
		{/if}
	</span>
	<span data-slot="sidebar-menu-sub-button-label">{@render children()}</span>
{/snippet}

{#if href}
	<motion.a
		{href}
		target={target}
		rel={rel ?? (target === '_blank' ? 'noreferrer noopener' : undefined)}
		aria-current={isActive ? 'page' : undefined}
		aria-disabled={disabled || undefined}
		tabindex={disabled ? -1 : undefined}
		onclick={select}
		whileTap={ctx.reduce || disabled ? undefined : { scale: 0.98 }}
		transition={SPRING_PRESS}
		data-slot="sidebar-menu-sub-button"
		data-active={isActive ? 'true' : 'false'}
		data-disabled={disabled ? 'true' : 'false'}
		class={className}
	>
		{@render content()}
	</motion.a>
{:else}
	<motion.button
		type="button"
		disabled={disabled}
		aria-current={isActive ? 'page' : undefined}
		onclick={select}
		whileTap={ctx.reduce || disabled ? undefined : { scale: 0.98 }}
		transition={SPRING_PRESS}
		data-slot="sidebar-menu-sub-button"
		data-active={isActive ? 'true' : 'false'}
		data-disabled={disabled ? 'true' : 'false'}
		class={className}
	>
		{@render content()}
	</motion.button>
{/if}
