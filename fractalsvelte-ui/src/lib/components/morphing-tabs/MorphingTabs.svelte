<script lang="ts">
	import { untrack } from 'svelte';
	import {
		AnimatePresence,
		animate,
		motion,
		useMotionValue,
		useReducedMotion
	} from '@humanspeak/svelte-motion';
	import { EASE_OUT, SPRING_GLIDE, SPRING_PRESS } from '../../ease.js';
	import { useId } from '../../use-id.js';
	import MorphingTab from './MorphingTab.svelte';
	import {
		DRAG_THRESHOLD,
		SURFACE_INSET,
		TAB_WIDTH,
		moveItem,
		safeId,
		sameOrder
	} from './utils.js';
	import type { MorphingTabPosition, MorphingTabsProps } from './types.js';

	let {
		items,
		value,
		defaultValue,
		onValueChange,
		onOrderChange,
		onClose,
		ariaLabel = 'Tabs',
		class: className,
		classNames
	}: MorphingTabsProps = $props();

	const reduce = useReducedMotion();
	const uid = useId();

	type DragSession = {
		id: string;
		pointerId: number;
		originX: number;
		startLeft: number;
		startIndex: number;
		targetIndex: number;
		moved: boolean;
		finishing: boolean;
		startOrder: string[];
		slotLefts: number[];
	};

	const itemIds = $derived(items.map((item) => item.id));
	const itemMap = $derived(new Map(items.map((item) => [item.id, item])));

	// Tab order survives item add/remove: retained ids keep their position,
	// new ids append at the end (see the sync effect below). Init-only reads
	// are untracked — they intentionally snapshot the first render.
	let order = $state<string[]>(untrack(() => itemIds));
	let internalValue = $state<string | null>(
		untrack(() => defaultValue ?? items[0]?.id ?? null)
	);
	const controlled = $derived(value !== undefined);
	const currentValue = $derived(controlled ? (value ?? null) : internalValue);

	let rootEl = $state<HTMLDivElement | null>(null);
	let railEl = $state<HTMLDivElement | null>(null);
	let surfaceWidth = $state(0);
	let tabGap = $state(12);
	let draggingId = $state<string | null>(null);
	let dragTargetIndex = $state(-1);

	const dragLeft = useMotionValue(SURFACE_INSET);
	const surfaceLeft = useMotionValue(SURFACE_INSET);

	const tabButtonRefs: Record<string, HTMLButtonElement | null> = {};
	const tabPositionRefs: Record<string, MorphingTabPosition | null> = {};

	// Plain (non-reactive) session/controls: mutated from handlers and read
	// back inside the same flush, so no render needs to be scheduled.
	let dragRef: DragSession | null = null;
	let dragAnimation: ReturnType<typeof animate> | null = null;
	let surfaceAnimation: ReturnType<typeof animate> | null = null;

	// Measure the root/rail once and keep surface width + gap in sync.
	$effect(() => {
		const root = rootEl;
		const rail = railEl;
		if (!root || !rail) return;
		const measure = () => {
			surfaceWidth = root.clientWidth;
			const nextGap = Number.parseFloat(getComputedStyle(rail).columnGap);
			if (Number.isFinite(nextGap)) tabGap = nextGap;
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(root);
		return () => observer.disconnect();
	});

	// Sync `order` with the incoming item ids.
	$effect(() => {
		const available = new Set(itemIds);
		const retained = order.filter((id) => available.has(id));
		const retainedSet = new Set(retained);
		const added = itemIds.filter((id) => !retainedSet.has(id));
		const next = [...retained, ...added];
		if (!sameOrder(order, next)) order = next;
	});

	const orderedItems = $derived(
		order.flatMap((id) => {
			const item = itemMap.get(id);
			return item ? [item] : [];
		})
	);

	const firstEnabledItem = $derived(
		orderedItems.find((item) => !item.disabled) ?? orderedItems[0] ?? null
	);
	const activeItem = $derived(
		currentValue && itemMap.has(currentValue)
			? (itemMap.get(currentValue) ?? null)
			: firstEnabledItem
	);
	const activeId = $derived(activeItem?.id ?? null);

	const slotLefts = $derived(
		order.map((_, index) => SURFACE_INSET + index * (TAB_WIDTH + tabGap))
	);

	const dragStartIndex = $derived(draggingId ? order.indexOf(draggingId) : -1);

	// Where a tab sits visually while another tab is dragged: the dragged tab
	// jumps to its target slot, neighbors shift by one to fill the gap.
	function visualIndexFor(index: number) {
		if (dragStartIndex < 0 || dragTargetIndex < 0) return index;
		if (index === dragStartIndex) return dragTargetIndex;
		if (
			dragTargetIndex > dragStartIndex &&
			index > dragStartIndex &&
			index <= dragTargetIndex
		) {
			return index - 1;
		}
		if (
			dragTargetIndex < dragStartIndex &&
			index >= dragTargetIndex &&
			index < dragStartIndex
		) {
			return index + 1;
		}
		return index;
	}

	const activeOrderIndex = $derived(activeId ? order.indexOf(activeId) : -1);
	const activeVisualIndex = $derived(
		activeOrderIndex < 0 ? -1 : visualIndexFor(activeOrderIndex)
	);

	function setActive(id: string | null) {
		if (id && itemMap.get(id)?.disabled) return;
		if (!controlled) internalValue = id;
		onValueChange?.(id);
	}

	// If the current value is gone (item removed/disabled), fall back to the
	// first enabled item.
	$effect(() => {
		if (currentValue && itemMap.has(currentValue)) return;
		if (firstEnabledItem && firstEnabledItem.id !== currentValue) {
			setActive(firstEnabledItem.id);
		}
	});

	// Slide the liquid surface under the active tab. Spring by default; jump
	// while a drag is running and when reduced motion is preferred.
	$effect.pre(() => {
		if (
			!activeId ||
			activeVisualIndex < 0 ||
			activeId === draggingId ||
			!slotLefts[activeVisualIndex]
		) {
			return;
		}
		surfaceAnimation?.stop();
		if (draggingId) return;
		surfaceAnimation = animate(
			surfaceLeft,
			slotLefts[activeVisualIndex],
			reduce.current ? { duration: 0 } : SPRING_GLIDE
		);
	});

	function commitOrder(next: string[], notify: boolean) {
		if (!sameOrder(order, next)) order = next;
		if (notify) onOrderChange?.(next);
	}

	function registerPosition(id: string, position: MorphingTabPosition | null) {
		tabPositionRefs[id] = position;
	}

	function registerTabButton(id: string, node: HTMLButtonElement | null) {
		tabButtonRefs[id] = node;
	}

	function startDrag(id: string, event: PointerEvent) {
		if (event.button !== 0 || itemMap.get(id)?.disabled || dragRef) return;

		const startIndex = order.indexOf(id);
		if (startIndex < 0) return;
		const capturedSlots = order.map(
			(_, index) => SURFACE_INSET + index * (TAB_WIDTH + tabGap)
		);
		const startLeft = capturedSlots[startIndex];

		dragAnimation?.stop();
		dragAnimation = null;
		dragLeft.set(startLeft);
		dragRef = {
			id,
			pointerId: event.pointerId,
			originX: event.clientX,
			startLeft,
			startIndex,
			targetIndex: startIndex,
			moved: false,
			finishing: false,
			startOrder: order.slice(),
			slotLefts: capturedSlots
		};
	}

	function moveDrag(event: PointerEvent) {
		const drag = dragRef;
		if (!drag || drag.finishing || drag.pointerId !== event.pointerId) return;

		const delta = event.clientX - drag.originX;
		if (!drag.moved && Math.abs(delta) < DRAG_THRESHOLD) return;
		event.preventDefault();

		if (!drag.moved) {
			drag.moved = true;
			(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
			if (drag.id === activeId) {
				surfaceAnimation?.stop();
				surfaceLeft.set(drag.startLeft);
			}
			draggingId = drag.id;
			dragTargetIndex = drag.startIndex;
		}

		const minLeft = drag.slotLefts[0];
		const maxLeft = drag.slotLefts[drag.slotLefts.length - 1];
		const visualLeft = Math.max(minLeft, Math.min(maxLeft, drag.startLeft + delta));
		let targetIndex = drag.startIndex;

		if (visualLeft >= drag.startLeft) {
			for (let index = drag.startIndex + 1; index < drag.slotLefts.length; index += 1) {
				if (visualLeft + TAB_WIDTH / 2 >= drag.slotLefts[index]) {
					targetIndex = index;
				}
			}
		} else {
			for (let index = drag.startIndex - 1; index >= 0; index -= 1) {
				if (visualLeft <= drag.slotLefts[index] + TAB_WIDTH / 2) {
					targetIndex = index;
				}
			}
		}

		dragLeft.set(visualLeft);
		if (targetIndex !== drag.targetIndex) {
			drag.targetIndex = targetIndex;
			dragTargetIndex = targetIndex;
		}
	}

	function finishDrag(pointerId: number) {
		const drag = dragRef;
		if (!drag || drag.pointerId !== pointerId || drag.finishing) return;

		if (!drag.moved) {
			dragRef = null;
			return;
		}

		drag.finishing = true;
		const targetLeft = drag.slotLefts[drag.targetIndex];
		const controls = animate(
			dragLeft,
			targetLeft,
			reduce.current ? { duration: 0 } : SPRING_GLIDE
		);
		dragAnimation = controls;

		void controls.then(async () => {
			if (dragAnimation !== controls) return;
			const next = moveItem(drag.startOrder, drag.startIndex, drag.targetIndex);

			if (!reduce.current) {
				// Wait for every displaced tab's spring to settle before
				// committing the new order (500ms safety cap).
				await new Promise<void>((resolve) => {
					const startedAt = performance.now();
					const check = () => {
						const settled = next.every((id, index) => {
							if (id === drag.id) return true;
							const position = tabPositionRefs[id];
							if (!position) return true;
							return (
								Math.abs(position.get() - drag.slotLefts[index]) < 0.5 &&
								Math.abs(position.getVelocity()) < 10
							);
						});
						if (settled || performance.now() - startedAt > 500) {
							resolve();
							return;
						}
						requestAnimationFrame(check);
					};
					check();
				});
			}

			if (dragAnimation !== controls) return;
			if (drag.id === activeId) {
				surfaceLeft.set(targetLeft);
			} else if (activeId) {
				const activePosition = tabPositionRefs[activeId];
				if (activePosition) surfaceLeft.set(activePosition.get());
			}
			tabPositionRefs[drag.id]?.jump(targetLeft);
			dragAnimation = null;
			dragRef = null;
			commitOrder(next, !sameOrder(drag.startOrder, next));
			draggingId = null;
			dragTargetIndex = -1;
		});
	}

	// Pointer capture can be lost anywhere in the window; finish the drag on
	// any pointerup/pointercancel (capture phase, like the original).
	$effect(() => {
		const finishFromWindow = (event: PointerEvent) => finishDrag(event.pointerId);
		window.addEventListener('pointerup', finishFromWindow, true);
		window.addEventListener('pointercancel', finishFromWindow, true);
		return () => {
			window.removeEventListener('pointerup', finishFromWindow, true);
			window.removeEventListener('pointercancel', finishFromWindow, true);
		};
	});

	function moveBy(id: string, direction: -1 | 1) {
		const current = order;
		const index = current.indexOf(id);
		const nextIndex = index + direction;
		if (
			index < 0 ||
			nextIndex < 0 ||
			nextIndex >= current.length ||
			itemMap.get(id)?.disabled
		) {
			return;
		}
		commitOrder(moveItem(current, index, nextIndex), true);
	}

	function handleTabKeyDown(id: string, event: KeyboardEvent) {
		const index = order.indexOf(id);
		if (index < 0) return;

		// Alt+arrows reorder; plain arrows move focus roving-style.
		if (
			event.altKey &&
			(event.key === 'ArrowLeft' || event.key === 'ArrowRight')
		) {
			event.preventDefault();
			moveBy(id, event.key === 'ArrowLeft' ? -1 : 1);
			return;
		}
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

		event.preventDefault();
		const direction = event.key === 'ArrowLeft' ? -1 : 1;
		const nextIndex = (index + direction + order.length) % order.length;
		const nextId = order[nextIndex];
		setActive(nextId);
		requestAnimationFrame(() => tabButtonRefs[nextId]?.focus());
	}

	function handleSelect(id: string) {
		const drag = dragRef;
		if (drag?.id === id && drag.moved) return;
		setActive(id);
	}
</script>

{#if orderedItems.length > 0}
	<div
		bind:this={rootEl}
		data-slot="morphing-tabs-root"
		class={[className, classNames?.root].filter(Boolean).join(' ') || undefined}
	>
		<div data-slot="morphing-tabs-rail-wrap">
			<div
				bind:this={railEl}
				role="tablist"
				aria-label={ariaLabel}
				aria-orientation="horizontal"
				data-slot="morphing-tabs-rail"
				class={classNames?.rail}
			>
				{#each orderedItems as item, index (item.id)}
					{@const isActive = item.id === activeId}
					{@const isDragging = item.id === draggingId}
					{@const visualIndex = visualIndexFor(index)}
					{@const targetLeft = slotLefts[visualIndex] ?? SURFACE_INSET}
					{@const tabId = `${uid}-tab-${safeId(item.id)}`}
					<MorphingTab
						{item}
						tabId={tabId}
						panelId={`${uid}-panel`}
						{isActive}
						{isDragging}
						anyDragging={Boolean(draggingId)}
						{targetLeft}
						reduce={reduce.current}
						{classNames}
						zIndex={isDragging ? 30 : isActive ? 20 : 1}
						surfaceHost={rootEl}
						{surfaceWidth}
						surfaceClassName={classNames?.activeTab}
						{dragLeft}
						{surfaceLeft}
						{registerPosition}
						{registerTabButton}
						onPointerDown={(event) => startDrag(item.id, event)}
						onPointerMove={moveDrag}
						onPointerUp={(event) => finishDrag(event.pointerId)}
						onPointerCancel={(event) => finishDrag(event.pointerId)}
						onLostPointerCapture={(event) => finishDrag(event.pointerId)}
						onSelect={handleSelect}
						onTabKeyDown={handleTabKeyDown}
						{onClose}
					/>
				{/each}
			</div>
		</div>

		<div
			id={`${uid}-panel`}
			role="tabpanel"
			aria-labelledby={`${uid}-tab-${safeId(activeId ?? 'empty')}`}
			data-slot="morphing-tabs-panel"
			class={classNames?.content}
		>
			<AnimatePresence mode="popLayout" initial={false}>
				{#if activeItem}
					<motion.div
						key={activeItem.id}
						initial={
							reduce.current
								? { opacity: 0 }
								: { opacity: 0, y: 8, filter: 'blur(6px)' }
						}
						animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
						exit={
							reduce.current
								? { opacity: 0, transition: { duration: 0.08, ease: EASE_OUT } }
								: {
										opacity: 0,
										y: -5,
										filter: 'blur(5px)',
										transition: { duration: 0.12, ease: EASE_OUT }
									}
						}
						transition={
							reduce.current ? { duration: 0.12, ease: EASE_OUT } : SPRING_PRESS
						}
						data-slot="morphing-tabs-panel-content"
					>
						{@render activeItem.content()}
					</motion.div>
				{/if}
			</AnimatePresence>
		</div>
	</div>
{/if}
