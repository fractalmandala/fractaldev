<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContextMenuContext } from './context-menu-context.js';

	const LONG_PRESS_DELAY = 520;
	const LONG_PRESS_TOLERANCE = 10;

	let {
		children,
		disabled = false,
		class: className
	}: { children: Snippet; disabled?: boolean; class?: string } = $props();

	const ctx = getContextMenuContext('ContextMenuTrigger');

	let triggerEl: HTMLElement | null = null;
	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	let touchOrigin: { x: number; y: number } | null = null;

	$effect(() => {
		ctx.triggerRef.current = triggerEl;
		return () => {
			ctx.triggerRef.current = null;
		};
	});

	$effect(
		() => () => {
			if (longPressTimer) clearTimeout(longPressTimer);
		}
	);

	function cancelLongPress() {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
		touchOrigin = null;
	}

	function handleContextMenu(event: MouseEvent) {
		if (event.defaultPrevented || disabled) return;
		event.preventDefault();
		cancelLongPress();
		ctx.openAt({ x: event.clientX, y: event.clientY }, 'pointer');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.defaultPrevented || disabled) return;
		if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
		event.preventDefault();
		const rect = triggerEl?.getBoundingClientRect();
		if (!rect) return;
		ctx.openAt(
			{ x: rect.left + Math.min(24, rect.width / 2), y: rect.top + rect.height / 2 },
			'keyboard'
		);
	}

	function handlePointerDown(event: PointerEvent) {
		if (event.defaultPrevented || disabled || event.pointerType !== 'touch') return;
		const origin = { x: event.clientX, y: event.clientY };
		touchOrigin = origin;
		longPressTimer = setTimeout(() => {
			ctx.openAt(origin, 'touch');
			longPressTimer = null;
			touchOrigin = null;
		}, LONG_PRESS_DELAY);
	}

	function handlePointerMove(event: PointerEvent) {
		const origin = touchOrigin;
		if (
			origin &&
			Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > LONG_PRESS_TOLERANCE
		) {
			cancelLongPress();
		}
	}

	function handlePointerEnd() {
		cancelLongPress();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions — the wrapper delegates
     interactivity to the child (a real element); right-click and long-press are
     the intended activation paths, keyboard via the ContextMenu key / Shift+F10. -->
<span
	bind:this={triggerEl}
	data-slot="context-menu-trigger"
	data-disabled={disabled ? 'true' : undefined}
	data-state={ctx.open ? 'open' : 'closed'}
	class={className}
	aria-controls={ctx.open ? ctx.menuId : undefined}
	aria-haspopup="menu"
	aria-expanded={ctx.open}
	oncontextmenu={handleContextMenu}
	onkeydown={handleKeydown}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerEnd}
	onpointercancel={handlePointerEnd}
>
	{@render children()}
</span>
