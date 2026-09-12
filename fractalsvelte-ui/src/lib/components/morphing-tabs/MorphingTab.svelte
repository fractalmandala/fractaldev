<script lang="ts">
	import { motion, useMotionValue, useSpring, useTransform } from '@humanspeak/svelte-motion';
	import { untrack } from 'svelte';
	import { Icon } from 'fractalicons';
	import { luX } from 'fractalicons/lucide';
	import { SPRING_GLIDE } from '../../ease.js';
	import {
		PANEL_RADIUS,
		RAIL_HEIGHT,
		SURFACE_INSET,
		TAB_HEIGHT,
		TAB_TOP,
		TAB_WIDTH,
		liquidTabPath
	} from './utils.js';
	import type { MorphingTabProps } from './types.js';

	let {
		item,
		tabId,
		panelId,
		isActive,
		isDragging,
		anyDragging,
		targetLeft,
		reduce,
		classNames,
		zIndex,
		surfaceHost,
		surfaceWidth,
		surfaceClassName,
		dragLeft,
		surfaceLeft,
		registerPosition,
		registerTabButton,
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onPointerCancel,
		onLostPointerCapture,
		onSelect,
		onTabKeyDown,
		onClose
	}: MorphingTabProps = $props();

	// Per-tab springs must be created during init (motion values are
	// lifecycle-bound), which is why the tab chrome lives in its own child.
	// untrack: init-only reads of reactive props must not be tracked.
	const target = useMotionValue(untrack(() => targetLeft));
	const position = useSpring(target, SPRING_GLIDE);
	const settledTransform = useTransform(
		untrack(() => (reduce ? target : position)),
		(left) => `translate3d(${left}px, 0, 0)`
	);
	const draggedTransform = useTransform(
		untrack(() => dragLeft),
		(left) => `translate3d(${left}px, 0, 0)`
	);

	// One path transform per liquid driver; the template picks the branch
	// matching the drag state (mirrors the keyed LiquidSurfacePath).
	const idlePath = useTransform(
		untrack(() => surfaceLeft),
		(v) => liquidTabPath(v, surfaceWidth)
	);
	const displacedPath = useTransform(
		untrack(() => position),
		(v) => liquidTabPath(v, surfaceWidth)
	);
	const draggedPath = useTransform(
		untrack(() => dragLeft),
		(v) => liquidTabPath(v, surfaceWidth)
	);

	// Keep the spring target in sync with the assigned slot (layout effect
	// timing so the spring never renders one frame behind).
	$effect.pre(() => {
		target.set(targetLeft);
		if (reduce) position.jump(targetLeft);
	});

	// Register the spring with the root for settle-check + snap after a
	// reorder. untrack: the callback identity changes every parent render;
	// only the mount/unmount moments matter.
	$effect.pre(() => {
		untrack(() => registerPosition(item.id, position));
		return () => untrack(() => registerPosition(item.id, null));
	});

	let buttonEl = $state<HTMLButtonElement | null>(null);
	$effect(() => {
		untrack(() => registerTabButton(item.id, buttonEl));
		return () => untrack(() => registerTabButton(item.id, null));
	});

	// The liquid surface is portalled into the root element so it paints
	// under every tab, regardless of where this tab sits in the tree.
	let surfaceEl = $state<SVGSVGElement | null>(null);
	$effect(() => {
		const host = surfaceHost;
		const el = surfaceEl;
		if (!el || !host) return;
		host.appendChild(el);
		return () => {
			if (el.parentNode === host) el.remove();
		};
	});
</script>

{#if isActive && surfaceHost && surfaceWidth > SURFACE_INSET * 2}
	<svg
		bind:this={surfaceEl}
		aria-hidden="true"
		focusable="false"
		viewBox={`0 0 ${surfaceWidth} ${RAIL_HEIGHT + PANEL_RADIUS}`}
		preserveAspectRatio="none"
		data-slot="morphing-tabs-surface"
		data-dragging={isDragging ? 'true' : undefined}
		class={surfaceClassName}
	>
		{#if isDragging}
			<motion.path d={draggedPath} fill="currentColor" />
		{:else if anyDragging}
			<motion.path d={displacedPath} fill="currentColor" />
		{:else}
			<motion.path d={idlePath} fill="currentColor" />
		{/if}
	</svg>
{/if}

<motion.div
	data-slot="morphing-tabs-tab-wrap"
	data-dragging={isDragging ? 'true' : undefined}
	data-disabled={item.disabled ? 'true' : undefined}
	style={{ zIndex, transform: isDragging ? draggedTransform : settledTransform }}
	onPointerDown={onPointerDown}
	onPointerMove={onPointerMove}
	onPointerUp={onPointerUp}
	onPointerCancel={onPointerCancel}
	onLostPointerCapture={onLostPointerCapture}
>
	<div
		data-slot="morphing-tabs-tab-box"
		style={`width:${TAB_WIDTH}px;height:${TAB_HEIGHT}px;margin-top:${TAB_TOP}px;`}
	>
		{#if !isActive}
			<span
				aria-hidden="true"
				data-slot="morphing-tabs-hover"
				data-dragging={isDragging ? 'true' : undefined}
			></span>
		{/if}

		<button
			bind:this={buttonEl}
			id={tabId}
			type="button"
			role="tab"
			aria-selected={isActive}
			aria-controls={panelId}
			aria-disabled={item.disabled || undefined}
			tabindex={isActive ? 0 : -1}
			disabled={item.disabled}
			data-slot="morphing-tabs-tab"
			data-active={isActive ? 'true' : undefined}
			class={classNames?.tab}
			onclick={() => onSelect(item.id)}
			onkeydown={(event) => onTabKeyDown(item.id, event)}
		>
			<span
				aria-hidden="true"
				data-slot="morphing-tabs-focus-ring"
				data-active={isActive ? 'true' : undefined}
			></span>
			{#if item.icon}
				{@const IconComponent = item.icon}
				<span aria-hidden="true" data-slot="morphing-tabs-icon" class={classNames?.icon}>
					<IconComponent />
				</span>
			{/if}
			<span data-slot="morphing-tabs-label" class={classNames?.label}>{item.label}</span>
		</button>

		{#if onClose}
			<button
				type="button"
				aria-label={`Close ${item.label}`}
				data-slot="morphing-tabs-close"
				data-inactive={!isActive ? 'true' : undefined}
				class={classNames?.close}
				onpointerdown={(event) => event.stopPropagation()}
				onclick={(event) => {
					event.stopPropagation();
					onClose(item.id);
				}}
			>
				<Icon icon={luX} size={14} />
			</button>
		{/if}
	</div>
</motion.div>
