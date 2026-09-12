<script lang="ts">
	import { untrack } from 'svelte';
	import { motion } from '@humanspeak/svelte-motion';
	import type { Snippet } from 'svelte';
	import { FOCUSABLE_SELECTOR, PANEL_TRANSITION, REDUCED_TRANSITION } from './utils.js';
	import { useAnimatedSidebar } from './context.js';
	import type { SidebarSide } from './types.js';

	let {
		ariaLabel,
		side,
		class: className,
		children
	}: { ariaLabel: string; side: SidebarSide; class?: string; children: Snippet } = $props();

	const ctx = useAnimatedSidebar();
	let wrapEl = $state<HTMLDivElement | null>(null);
	let panelEl = $state<HTMLDivElement | null>(null);

	// Portal the whole overlay to the body.
	$effect(() => {
		const el = untrack(() => wrapEl);
		if (!el || el.parentElement === document.body) return;
		document.body.appendChild(el);
	});

	// Scroll lock + initial focus while open; restores scroll and refocuses the
	// trigger on close.
	$effect(() => {
		if (!ctx.openMobile) return;

		const body = document.body;
		const scrollY = window.scrollY;
		const previous = {
			left: body.style.left,
			overflow: body.style.overflow,
			position: body.style.position,
			right: body.style.right,
			top: body.style.top
		};

		body.style.position = 'fixed';
		body.style.top = `-${scrollY}px`;
		body.style.left = '0';
		body.style.right = '0';
		body.style.overflow = 'hidden';

		const focusFrame = requestAnimationFrame(() => {
			const panel = untrack(() => panelEl);
			const first = panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
			(first ?? panel)?.focus({ preventScroll: true });
		});

		return () => {
			cancelAnimationFrame(focusFrame);
			body.style.position = previous.position;
			body.style.top = previous.top;
			body.style.left = previous.left;
			body.style.right = previous.right;
			body.style.overflow = previous.overflow;
			window.scrollTo(0, scrollY);
			untrack(() => ctx.triggerElement)?.focus({ preventScroll: true });
		};
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			ctx.setOpenMobile(false);
			return;
		}

		if (event.key !== 'Tab') return;
		const panel = untrack(() => panelEl);
		const focusable = panel
			? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
			: [];

		if (focusable.length === 0) {
			event.preventDefault();
			panel?.focus();
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

<div bind:this={wrapEl} data-slot="sidebar-mobile" data-open={ctx.openMobile ? 'true' : 'false'} class={className}>
	<motion.button
		type="button"
		aria-label="Close sidebar"
		tabindex={ctx.openMobile ? 0 : -1}
		initial={false}
		animate={{ opacity: ctx.openMobile ? 1 : 0 }}
		transition={ctx.reduce ? REDUCED_TRANSITION : PANEL_TRANSITION}
		onclick={() => ctx.setOpenMobile(false)}
		data-slot="sidebar-mobile-backdrop"
	/>
	<motion.div
		bind:ref={panelEl}
		role="dialog"
		aria-modal="true"
		aria-label={ariaLabel}
		aria-hidden={!ctx.openMobile}
		inert={!ctx.openMobile}
		tabindex={-1}
		data-mobile="true"
		data-state={ctx.openMobile ? 'expanded' : 'collapsed'}
		data-side={side}
		initial={false}
		animate={{
			opacity: ctx.reduce ? (ctx.openMobile ? 1 : 0) : 1,
			x: ctx.reduce ? 0 : ctx.openMobile ? '0%' : side === 'left' ? '-100%' : '100%'
		}}
		transition={ctx.reduce ? REDUCED_TRANSITION : PANEL_TRANSITION}
		onkeydown={handleKeyDown}
		data-slot="sidebar-mobile-panel"
	>
		{@render children()}
	</motion.div>
</div>
