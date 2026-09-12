<script lang="ts">
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import type { Snippet } from 'svelte';
	import { EASE_OUT, SPRING_PANEL } from '../ease.js';

	let {
		open,
		onOpenChange,
		side = 'right',
		children,
		class: className,
		backdropClassName,
		ariaLabel,
		dismissable = true
	}: {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		side?: 'left' | 'right';
		children: Snippet;
		/** Class for the panel surface. */
		class?: string;
		/** Class for the backdrop. */
		backdropClassName?: string;
		ariaLabel?: string;
		/** Close when the backdrop is clicked. Default true. */
		dismissable?: boolean;
	} = $props();

	const reduce = useReducedMotion();
	const offscreen = $derived(side === 'right' ? '100%' : '-100%');

	$effect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onOpenChange(false);
		};
		window.addEventListener('keydown', onKey);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			window.removeEventListener('keydown', onKey);
			document.body.style.overflow = prevOverflow;
		};
	});
</script>

<!-- Backdrop and panel are direct AnimatePresence children so both get exit
     clones; fixed positioning moves onto each element (no wrapper div). -->
<AnimatePresence>
	{#if open}
		<motion.button
			key="backdrop"
			type="button"
			aria-label="Close"
			tabindex={dismissable ? 0 : -1}
			onclick={() => dismissable && onOpenChange(false)}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.25, ease: EASE_OUT }}
			data-slot="drawer-backdrop"
			class={backdropClassName}
		/>
		<motion.aside
			key="panel"
			role="dialog"
			aria-modal="true"
			aria-label={ariaLabel}
			initial={$reduce ? { opacity: 0 } : { x: offscreen }}
			animate={$reduce ? { opacity: 1 } : { x: 0 }}
			exit={$reduce ? { opacity: 0 } : { x: offscreen }}
			transition={$reduce ? { duration: 0.2, ease: EASE_OUT } : SPRING_PANEL}
			data-slot="drawer-panel"
			data-side={side}
			class={className}
		>
			{@render children()}
		</motion.aside>
	{/if}
</AnimatePresence>
