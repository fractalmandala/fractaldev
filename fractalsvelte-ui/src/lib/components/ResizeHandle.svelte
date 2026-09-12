<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		/** Percentage width of the left pane (10-80). */
		value?: number;
		onValueChange?: (value: number) => void;
		min?: number;
		max?: number;
		label?: string;
		class?: string;
		left?: import('svelte').Snippet;
		right?: import('svelte').Snippet;
	}

	let {
		value = $bindable(30),
		onValueChange,
		min = 10,
		max = 80,
		label = 'Resize split',
		class: className = '',
		left,
		right
	}: Props = $props();

	let dragging = $state(false);
	let container: HTMLDivElement | undefined = $state();

	function onPointerDown(e: PointerEvent) {
		e.preventDefault();
		dragging = true;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragging || !container) return;
		const rect = container.getBoundingClientRect();
		if (rect.width === 0) return;
		const pct = ((e.clientX - rect.left) / rect.width) * 100;
		value = Math.min(max, Math.max(min, pct));
		onValueChange?.(value);
	}

	function stop() {
		dragging = false;
	}

	onMount(() => {
		window.addEventListener('pointerup', stop);
		return () => window.removeEventListener('pointerup', stop);
	});
</script>

<div
	class="k-resize {className}"
	bind:this={container}
	data-resizing={dragging ? 'true' : undefined}
>
	<div class="k-resize-pane" style={`--k-resize-value:${value}%`}>
		{#if left}{@render left?.()}{/if}
	</div>
	<button
		type="button"
		class="k-resize-handle"
		aria-label={label}
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onkeydown={(e) => {
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				value = Math.max(min, value - 2);
				onValueChange?.(value);
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				value = Math.min(max, value + 2);
				onValueChange?.(value);
			}
		}}
	></button>
	<div class="k-resize-pane grow">
		{#if right}{@render right?.()}{/if}
	</div>
</div>
