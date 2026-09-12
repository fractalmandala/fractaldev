<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import { type Snippet } from 'svelte';
	import { EASE_OUT } from '../../ease.js';
	import { getContextMenuContext, type MenuPoint } from './context-menu-context.js';

	const VIEWPORT_PADDING = 8;
	const MORPH_DURATION = 0.3;
	const CLIP_SHOWN = 'inset(0px 0px 0px 0px round 12px)';

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}

	function getEnabledItems(container: HTMLElement | null) {
		if (!container) return [];
		return Array.from(
			container.querySelectorAll<HTMLElement>(
				'[data-context-menu-item="true"]:not([data-disabled="true"])'
			)
		);
	}

	function collapsedClip(origin: MenuPoint, size: { width: number; height: number }) {
		const half = 8;
		const top = clamp(origin.y - half, 0, size.height);
		const right = clamp(size.width - origin.x - half, 0, size.width);
		const bottom = clamp(size.height - origin.y - half, 0, size.height);
		const left = clamp(origin.x - half, 0, size.width);
		return `inset(${top}px ${right}px ${bottom}px ${left}px round 10px)`;
	}

	let {
		children,
		class: className,
		ariaLabel = 'Context menu'
	}: {
		children: Snippet;
		class?: string;
		ariaLabel?: string;
	} = $props();

	const ctx = getContextMenuContext('ContextMenuContent');

	let portalReady = $state(false);
	$effect(() => {
		portalReady = true;
	});

	let portalEl = $state<HTMLDivElement | null>(null);
	let contentEl = $state<HTMLDivElement | null>(null);
	let position = $state<MenuPoint>({ x: 0, y: 0 });
	let origin = $state<MenuPoint>({ x: 0, y: 0 });
	let size = $state({ width: 0, height: 0 });
	let morphReady = $state(false);
	let typeahead = '';
	let typeaheadTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		ctx.contentRef.current = contentEl;
		return () => {
			ctx.contentRef.current = null;
		};
	});

	$effect(() => () => {
		if (typeaheadTimer) clearTimeout(typeaheadTimer);
	});

	// Measure the freshly placed menu, clamp it into the viewport, and record
	// where the pointer landed so the clip can collapse toward that corner.
	$effect(() => {
		if (!ctx.open) {
			morphReady = false;
			return;
		}
		const content = ctx.contentRef.current;
		if (!content) return;
		content.dataset.invocation = String(ctx.invocation);

		const rect = content.getBoundingClientRect();
		const left = Math.max(
			VIEWPORT_PADDING,
			Math.min(
				Math.max(ctx.point.x, VIEWPORT_PADDING),
				window.innerWidth - rect.width - VIEWPORT_PADDING
			)
		);
		const top = Math.max(
			VIEWPORT_PADDING,
			Math.min(
				Math.max(ctx.point.y, VIEWPORT_PADDING),
				window.innerHeight - rect.height - VIEWPORT_PADDING
			)
		);

		position = { x: left, y: top };
		size = { width: rect.width, height: rect.height };
		origin = {
			x: clamp(ctx.point.x - left, 12, Math.max(12, rect.width - 12)),
			y: clamp(ctx.point.y - top, 12, Math.max(12, rect.height - 12))
		};
		morphReady = false;

		if (ctx.reduce || ctx.modality === 'keyboard') {
			morphReady = true;
			return;
		}

		// Let the measured collapsed clip paint once before expanding it. Without
		// this preparation frame, the first invocation can batch both states and
		// appear at full size without the morph.
		let openFrame = 0;
		const prepareFrame = requestAnimationFrame(() => {
			openFrame = requestAnimationFrame(() => {
				morphReady = true;
			});
		});
		return () => {
			cancelAnimationFrame(prepareFrame);
			cancelAnimationFrame(openFrame);
		};
	});

	// Focus the first enabled item once the menu is visible.
	$effect(() => {
		if (!ctx.open) return;
		const frame = requestAnimationFrame(() => {
			const first = getEnabledItems(ctx.contentRef.current)[0];
			first?.focus({ preventScroll: true });
		});
		return () => cancelAnimationFrame(frame);
	});

	const moveFocus = (direction: 1 | -1) => {
		const items = getEnabledItems(ctx.contentRef.current);
		if (items.length === 0) return;
		const current = items.indexOf(document.activeElement as HTMLElement);
		const next = current < 0 ? 0 : (current + direction + items.length) % items.length;
		items[next]?.focus();
	};

	function handleContextMenu(event: MouseEvent) {
		event.preventDefault();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			ctx.setOpen(false);
			ctx.triggerRef.current?.focus();
			return;
		}
		if (event.key === 'Tab') {
			ctx.setOpen(false);
			return;
		}
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			moveFocus(event.key === 'ArrowDown' ? 1 : -1);
			return;
		}
		if (event.key === 'Home' || event.key === 'End') {
			event.preventDefault();
			const items = getEnabledItems(ctx.contentRef.current);
			items[event.key === 'Home' ? 0 : items.length - 1]?.focus();
			return;
		}
		if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
			typeahead += event.key.toLocaleLowerCase();
			if (typeaheadTimer) clearTimeout(typeaheadTimer);
			typeaheadTimer = setTimeout(() => {
				typeahead = '';
			}, 500);
			const match = getEnabledItems(ctx.contentRef.current).find((item) =>
				(item.dataset.label ?? item.textContent ?? '')
					.trim()
					.toLocaleLowerCase()
					.startsWith(typeahead)
			);
			match?.focus();
		}
	}

	// Move the portalled layer into <body> once mounted so it escapes any
	// ancestor transform/overflow (mirrors React createPortal).
	$effect(() => {
		const el = portalEl;
		if (!el || el.parentElement === document.body) return;
		document.body.appendChild(el);
	});

	const visualOpen = $derived(ctx.open && morphReady);
	const clipHidden = $derived(collapsedClip(origin, size));
	const transition = $derived(
		ctx.modality === 'keyboard'
			? { duration: 0 }
			: ctx.reduce
				? { duration: 0.1, ease: EASE_OUT }
				: {
						clipPath: { duration: MORPH_DURATION, ease: EASE_OUT },
						opacity: { duration: MORPH_DURATION, ease: EASE_OUT }
					}
	);
</script>

{#if portalReady}
	<div
		bind:this={portalEl}
		data-slot="context-menu-portal"
		data-state={ctx.open ? 'open' : 'closed'}
		aria-hidden={!ctx.open}
		inert={!ctx.open}
		style={`left:${position.x}px;top:${position.y}px`}
	>
		<motion.div
			bind:ref={contentEl}
			id={ctx.menuId}
			role="menu"
			aria-label={ariaLabel}
			data-morph-ready={morphReady ? 'true' : 'false'}
			tabindex={-1}
			initial={false}
			animate={{
				opacity: visualOpen ? 1 : 0,
				clipPath:
					ctx.reduce || ctx.modality === 'keyboard' || visualOpen ? CLIP_SHOWN : clipHidden
			}}
			transition={transition}
			onkeydown={handleKeydown}
			oncontextmenu={handleContextMenu}
			data-slot="context-menu-content"
			class={className}
		>
			{@render children()}
		</motion.div>
	</div>
{/if}
