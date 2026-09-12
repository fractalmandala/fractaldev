<script lang="ts">
	import { AnimatePresence, motion, useReducedMotion, type Variants } from '@humanspeak/svelte-motion';
	import type { Snippet } from 'svelte';
	import { EASE_OUT, SPRING_PANEL } from '../../ease.js';
	import { usePopoverPortalPosition } from '../../use-popover-position.svelte.js';
	import { getMorphPopoverContext, type MorphAlign, type MorphSide } from './context.js';

	let {
		children,
		side = 'bottom',
		align = 'end',
		sideOffset = 8,
		radius = 16,
		class: className
	}: {
		children: Snippet;
		side?: MorphSide;
		align?: MorphAlign;
		/** Gap between trigger and panel, in px. Default 8. */
		sideOffset?: number;
		/** Panel corner radius, in px. Default 16. */
		radius?: number;
		class?: string;
	} = $props();

	const ctx = getMorphPopoverContext('MorphPopoverContent');
	const reduce = useReducedMotion();

	const originFor = (side: MorphSide, align: MorphAlign) =>
		`${side === 'bottom' ? 'top' : 'bottom'} ${align === 'end' ? 'right' : 'left'}`;

	// A clip that hides everything but the corner nearest the trigger, so the
	// panel appears to grow out of it. inset(top right bottom left).
	function clipHidden(side: MorphSide, align: MorphAlign, radius: number) {
		const top = side === 'bottom' ? '0%' : '92%';
		const bottom = side === 'bottom' ? '92%' : '0%';
		const right = align === 'end' ? '0%' : '92%';
		const left = align === 'end' ? '92%' : '0%';
		return `inset(${top} ${right} ${bottom} ${left} round ${radius}px)`;
	}
	const clipShown = (radius: number) => `inset(0% 0% 0% 0% round ${radius}px)`;

	// Preserve the original spring character on the wrapper, but tween the
	// complex clip-path so it cannot snap when the spring resolves its final
	// distance.
	const MORPH_CLIP_TRANSITION = { duration: 0.32, ease: EASE_OUT } as const;

	let portalReady = $state(false);
	$effect(() => {
		portalReady = true;
	});

	let portalEl = $state<HTMLDivElement | null>(null);
	let contentEl = $state<HTMLDivElement | null>(null);

	$effect(() => {
		ctx.contentRef.current = contentEl;
		return () => {
			ctx.contentRef.current = null;
		};
	});

	// Only measure while open: the panel doesn't exist on the page otherwise.
	const layout = usePopoverPortalPosition(
		() => ctx.triggerRef.current,
		() => contentEl,
		() => portalReady && ctx.open
	);

	const left = $derived(
		layout
			? align === 'end'
				? layout.trigger.left + layout.trigger.width - layout.content.width
				: layout.trigger.left
			: 0
	);
	const top = $derived(
		layout
			? side === 'bottom'
				? layout.trigger.top + layout.trigger.height + sideOffset
				: layout.trigger.top - layout.content.height - sideOffset
			: 0
	);

	// Both directions travel between the exact same hidden/show states. Exit
	// targets "hidden" directly instead of introducing separate choreography.
	const wrap = $derived<Variants | undefined>(
		reduce.current
			? undefined
			: {
					hidden: { opacity: 0, scale: 0.96, transition: SPRING_PANEL },
					show: { opacity: 1, scale: 1, transition: SPRING_PANEL }
				}
	);
	const clip = $derived<Variants | undefined>(
		reduce.current
			? undefined
			: {
					hidden: {
						clipPath: clipHidden(side, align, radius),
						transition: MORPH_CLIP_TRANSITION
					},
					show: {
						clipPath: clipShown(radius),
						transition: MORPH_CLIP_TRANSITION
					}
				}
	);

	// Move the portalled layer into <body> once mounted so it escapes any
	// ancestor transform/overflow (mirrors React createPortal).
	$effect(() => {
		const el = portalEl;
		if (!el || el.parentElement === document.body) return;
		document.body.appendChild(el);
	});
</script>

{#if portalReady}
	<AnimatePresence>
		{#if ctx.open}
			<motion.div
				bind:ref={portalEl}
				key="morph-panel"
				variants={wrap}
				initial={reduce.current ? { opacity: 0 } : 'hidden'}
				animate={reduce.current ? { opacity: 1 } : 'show'}
				exit={reduce.current ? { opacity: 0 } : 'hidden'}
				transition={reduce.current ? { duration: 0.12 } : undefined}
				data-slot="popover-morph-portal"
				style={`left:${left}px;top:${top}px;visibility:${layout ? 'visible' : 'hidden'};transform-origin:${originFor(side, align)}`}
			>
				<motion.div
					bind:ref={contentEl}
					id={ctx.contentId}
					role="dialog"
					aria-labelledby={ctx.triggerId}
					tabindex={-1}
					variants={clip}
					style={`border-radius:${radius}px`}
					data-slot="popover-morph-panel"
					class={className}
				>
					{@render children()}
				</motion.div>
			</motion.div>
		{/if}
	</AnimatePresence>
{/if}
