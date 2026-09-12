<script lang="ts">
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';
	import { createResizable } from '$lib/actions';

	interface Props {
		initial?: number;
		min?: number;
		max?: number;
		collapseBelow?: number;
		storageKey?: string;
		children?: Snippet;
	}

	let {
		initial = 260,
		min = 160,
		max = 420,
		collapseBelow = 110,
		storageKey,
		children
	}: Props = $props();

	const sidebar = untrack(() =>
		createResizable({
			axis: 'x',
			side: 'right',
			initial,
			min,
			max,
			collapseBelow,
			storageKey,
			varName: '--sidebar-width'
		})
	);
</script>

<aside
	class="fk-sidebar box"
	style={sidebar.style}
>
	{#if !sidebar.isCollapsed}
		{@render children?.()}
	{/if}
</aside>

<div
	class="resize-rail-vertical"
	class:dragging={sidebar.isDragging}
	use:sidebar.rail
	title="Drag to resize sidebar width"
>
	<div class="rail-knurling"></div>
</div>