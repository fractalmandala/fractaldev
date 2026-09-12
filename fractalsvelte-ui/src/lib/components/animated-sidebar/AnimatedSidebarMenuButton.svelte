<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import { Icon } from 'fractalicons';
	import { luChevronRight } from 'fractalicons/lucide';
	import { SPRING_LAYOUT, SPRING_PRESS } from '../../ease.js';
	import {
		LABEL_ENTER_TRANSITION,
		LABEL_EXIT_TRANSITION,
		REDUCED_TRANSITION
	} from './utils.js';
	import { useAnimatedSidebar, useAnimatedSidebarPanel } from './context.js';
	import type { AnimatedSidebarMenuButtonProps } from './types.js';

	let {
		children,
		icon,
		badge,
		href,
		isActive = false,
		ariaExpanded,
		disabled = false,
		closeOnSelect,
		target,
		rel,
		label,
		onSelect,
		class: className
	}: AnimatedSidebarMenuButtonProps = $props();

	const ctx = useAnimatedSidebar();
	const panel = useAnimatedSidebarPanel();
	const textLabel = $derived(panel.collapsed ? label : undefined);

	function select(event: MouseEvent) {
		if (disabled) {
			event.preventDefault();
			return;
		}
		onSelect?.();
		const shouldCloseOnSelect = closeOnSelect ?? (ariaExpanded === undefined);
		if (ctx.isMobile && shouldCloseOnSelect) ctx.setOpenMobile(false);
	}
</script>

{#snippet content()}
	{#if isActive}
		<motion.span
			layoutId={ctx.layoutId}
			transition={ctx.reduce ? { duration: 0 } : SPRING_LAYOUT}
			data-slot="sidebar-menu-button-pill"
		/>
	{/if}
	{#if icon}
		<span aria-hidden="true" data-slot="sidebar-menu-button-icon">
			{@render icon()}
		</span>
	{/if}
	<motion.span
		initial={false}
		animate={{
			opacity: panel.collapsed ? 0 : 1,
			x: panel.collapsed ? -4 : 0
		}}
		transition={
			ctx.reduce
				? REDUCED_TRANSITION
				: panel.collapsed
					? LABEL_EXIT_TRANSITION
					: LABEL_ENTER_TRANSITION
		}
		aria-hidden={panel.collapsed}
		data-slot="sidebar-menu-button-label"
		data-collapsed={panel.collapsed ? 'true' : 'false'}
	>
		{@render children()}
	</motion.span>
	{#if badge && !panel.collapsed}
		<span data-slot="sidebar-menu-button-badge">{@render badge()}</span>
	{/if}
	{#if ariaExpanded !== undefined}
		<motion.span
			aria-hidden="true"
			initial={false}
			animate={{
				opacity: panel.collapsed ? 0 : 1,
				rotate: ariaExpanded ? 90 : 0,
				x: panel.collapsed ? 4 : 0
			}}
			transition={ctx.reduce ? { duration: 0 } : SPRING_LAYOUT}
			data-slot="sidebar-menu-button-chevron"
		>
			<Icon icon={luChevronRight} size={14} aria-hidden="true" />
		</motion.span>
	{/if}
{/snippet}

{#if href}
	<motion.a
		{href}
		target={target}
		rel={rel ?? (target === '_blank' ? 'noreferrer noopener' : undefined)}
		aria-current={isActive ? 'page' : undefined}
		aria-expanded={ariaExpanded}
		aria-disabled={disabled || undefined}
		aria-label={textLabel}
		title={textLabel}
		tabindex={disabled ? -1 : undefined}
		onclick={select}
		whileTap={ctx.reduce || disabled ? undefined : { scale: 0.98 }}
		transition={SPRING_PRESS}
		data-slot="sidebar-menu-button"
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
		aria-expanded={ariaExpanded}
		aria-label={textLabel}
		title={textLabel}
		onclick={select}
		whileTap={ctx.reduce || disabled ? undefined : { scale: 0.98 }}
		transition={SPRING_PRESS}
		data-slot="sidebar-menu-button"
		data-active={isActive ? 'true' : 'false'}
		data-disabled={disabled ? 'true' : 'false'}
		class={className}
	>
		{@render content()}
	</motion.button>
{/if}
