<script lang="ts">
	import { untrack } from 'svelte';
	import {
		AnimatePresence,
		motion,
		useReducedMotion
	} from '@humanspeak/svelte-motion';
	import { Icon } from 'fractalicons';
	import { luX } from 'fractalicons/lucide';
	import { EASE_OUT } from '../../ease.js';
	import { useCenterMorphModalContext } from './context.js';
	import type { CenterMorphModalContentProps } from './types.js';

	let {
		children,
		ariaLabel,
		ariaDescribedBy,
		dismissible = true,
		showCloseButton = true,
		closeButtonLabel = 'Close modal',
		class: className,
		backdropClass
	}: CenterMorphModalContentProps = $props();

	const ctx = useCenterMorphModalContext('CenterMorphModalContent');
	const reduce = useReducedMotion();

	let portalEl = $state<HTMLDivElement | null>(null);
	let panelEl = $state<HTMLDivElement | null>(null);

	const FOCUSABLE_SELECTOR = [
		'a[href]',
		'button:not([disabled])',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'[tabindex]:not([tabindex="-1"])'
	].join(',');

	// Complex clip-path strings can snap when a spring resolves its final
	// distance. Keep the radius constant so the whole duration reads as a
	// surface unfolding, rather than finishing early and spending its last
	// frames rounding corners.
	const CENTER_FOLDED_CLIP = 'inset(48% 48% 48% 48% round 30px)';
	const CENTER_OPEN_CLIP = 'inset(0% 0% 0% 0% round 30px)';
	const CENTER_UNFOLD_EASE = [0.2, 0, 0.2, 1] as const;
	const CENTER_UNFOLD_TRANSITION = {
		duration: 0.43,
		ease: CENTER_UNFOLD_EASE
	} as const;

	function getFocusableElements(root: HTMLElement | null) {
		if (!root) return [];
		return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
			(element) => element.tabIndex >= 0
		);
	}

	// Port of createPortal: the effect defers the move to the browser, so SSR
	// renders the same markup with no mounted gate.
	$effect(() => {
		const el = portalEl;
		if (!el || el.parentElement === document.body) return;
		document.body.appendChild(el);
	});

	// Body scroll lock + focus trap while open. The ref reads are untracked:
	// bind:this settles once, and a re-run would yank focus back to the first
	// focusable mid-interaction.
	$effect(() => {
		if (!ctx.open) return;
		const overlay = untrack(() => portalEl);
		const panel = untrack(() => panelEl);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		const focusFrame = requestAnimationFrame(() => {
			const [firstFocusable] = getFocusableElements(overlay);
			(firstFocusable ?? panel)?.focus();
		});

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && dismissible) {
				event.preventDefault();
				ctx.setOpen(false);
				return;
			}
			if (event.key !== 'Tab') return;
			const focusable = getFocusableElements(overlay);
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
		};

		window.addEventListener('keydown', onKeyDown);
		return () => {
			cancelAnimationFrame(focusFrame);
			window.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = previousOverflow;
			document.getElementById(ctx.triggerId)?.focus();
		};
	});
</script>

<div bind:this={portalEl} data-slot="center-morph-modal-portal">
	<AnimatePresence>
		{#if ctx.open}
			<!-- Backdrop and panel are separate direct children so the exit
			     clones attach to this still-connected portal (the library
			     freezes each node and animates it out; clones are
			     pointer-events: none, so no presence gate is needed). -->
			<motion.button
				key="backdrop"
				type="button"
				aria-label="Dismiss modal"
				tabindex={-1}
				disabled={!dismissible}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: reduce.current ? 0.1 : 0.28, ease: EASE_OUT }}
				onclick={() => ctx.setOpen(false)}
				data-slot="center-morph-modal-backdrop"
				class={backdropClass}
			/>
		{/if}

		{#if ctx.open}
			<div data-slot="center-morph-modal-center">
				<div data-slot="center-morph-modal-column">
					<motion.div
						key="panel"
						bind:ref={panelEl}
						id={ctx.contentId}
						role="dialog"
						aria-modal="true"
						aria-label={ariaLabel}
						aria-describedby={ariaDescribedBy}
						tabindex={-1}
						initial={reduce.current
							? { opacity: 0, clipPath: CENTER_OPEN_CLIP }
							: { opacity: 1, clipPath: CENTER_FOLDED_CLIP }}
						animate={{ opacity: 1, clipPath: CENTER_OPEN_CLIP }}
						exit={reduce.current
							? { opacity: 0, clipPath: CENTER_OPEN_CLIP }
							: { opacity: 1, clipPath: CENTER_FOLDED_CLIP }}
						transition={reduce.current
							? { duration: 0.14, ease: EASE_OUT }
							: CENTER_UNFOLD_TRANSITION}
						style="border-radius:30px"
						data-slot="center-morph-modal-panel"
						class={className}
					>
						{@render children()}

						{#if showCloseButton}
							<motion.button
								type="button"
								aria-label={closeButtonLabel}
								onclick={() => ctx.setOpen(false)}
								initial={reduce.current ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{
									opacity: 0,
									scale: reduce.current ? 1 : 0.88,
									transition: { duration: 0.1, ease: EASE_OUT }
								}}
								transition={{
									delay: reduce.current ? 0 : 0.16,
									duration: reduce.current ? 0.12 : 0.2,
									ease: EASE_OUT
								}}
								data-slot="center-morph-modal-close"
							>
								<Icon icon={luX} size={16} aria-hidden="true" />
							</motion.button>
						{/if}
					</motion.div>
				</div>
			</div>
		{/if}
	</AnimatePresence>
</div>
