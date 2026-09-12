<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import { PANEL_TRANSITION, REDUCED_TRANSITION, SIDEBAR_MORPH_TRANSITION } from './utils.js';
	import { setAnimatedSidebarPanelContext, useAnimatedSidebar } from './context.js';
	import type { AnimatedSidebarProps } from './types.js';
	import AnimatedSidebarMobile from './AnimatedSidebarMobile.svelte';

	let {
		side = 'left',
		variant = 'sidebar',
		collapsible = 'icon',
		ariaLabel = 'Sidebar',
		class: className,
		panelClassName,
		style,
		children
	}: AnimatedSidebarProps = $props();

	const ctx = useAnimatedSidebar();
	const collapsed = $derived(collapsible !== 'none' && !ctx.open);
	const offcanvas = $derived(collapsed && collapsible === 'offcanvas');
	const width = $derived(offcanvas ? '0px' : collapsed ? 'var(--sidebar-width-icon)' : 'var(--sidebar-width)');

	// Single getter-based provider covering both branches: on mobile the panel
	// context is the fixed "expanded, non-collapsible" shape React's
	// MobileSidebar provides; on desktop it reflects this aside's collapse.
	setAnimatedSidebarPanelContext({
		get collapsed() {
			return ctx.isMobile ? false : collapsed;
		},
		get collapsible() {
			return ctx.isMobile ? 'none' : collapsible;
		},
		get side() {
			return side;
		}
	});
</script>

{#if ctx.isMobile}
	<AnimatedSidebarMobile {ariaLabel} {side} class={className}>
		{@render children()}
	</AnimatedSidebarMobile>
{:else}
	<motion.aside
		initial={false}
		aria-label={ariaLabel}
		data-slot="sidebar"
		data-state={collapsed ? 'collapsed' : 'expanded'}
		data-collapsible={collapsible}
		data-variant={variant}
		data-side={side}
		animate={{ width }}
		transition={ctx.reduce ? { duration: 0 } : SIDEBAR_MORPH_TRANSITION}
		style={style}
		class={className}
	>
		<motion.div
			initial={false}
			animate={{
				opacity: offcanvas ? 0 : 1,
				x: offcanvas ? (side === 'left' ? '-100%' : '100%') : '0%'
			}}
			transition={ctx.reduce ? REDUCED_TRANSITION : PANEL_TRANSITION}
			data-slot="sidebar-panel"
			data-variant={variant}
			data-side={side}
			data-collapsible={collapsible}
			class={panelClassName}
		>
			{@render children()}
		</motion.div>
	</motion.aside>
{/if}
