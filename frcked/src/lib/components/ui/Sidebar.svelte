<script lang="ts">

	import {
		createResizable,
		observeResize,
		type ResizeObserverDetail
	} from '$lib/actions';

	const sidebar = createResizable({
		axis: 'x',
		side: 'right',
		initial: 260,
		min: 160,
		max: 420,
		collapseBelow: 110,
		varName: '--demo-sidebar-w'
	});

	let observedW = $state(0);
	let { children } = $props()
	function onObserved(detail: ResizeObserverDetail) {
		observedW = Math.round(detail.width);
	}

</script>

<aside class="fk-sidebar box" style={sidebar.style}>
					{#if sidebar.isCollapsed}
						<button class="expand-btn" onclick={() => sidebar.expand()}>
							Expand Sidebar
						</button>
					{/if}

	{@render children()}
</aside>
			<div
				class="resize-rail-vertical"
				class:dragging={sidebar.isDragging}
				{@attach sidebar.rail}
				title="Drag to resize sidebar width"
			>
				<div class="rail-knurling"></div>
			</div>