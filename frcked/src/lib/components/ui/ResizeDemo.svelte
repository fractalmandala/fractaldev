<script lang="ts">
	/**
	 * ========================================================================
	 * TUTORIAL DEMO: HOW TO USE THE SVELTE 5 RESIZABLE ATTACHMENTS
	 * ========================================================================
	 * This component demonstrates all 3 interactive resizing patterns plus
	 * passive dimension observation.
	 */
	import {
		createResizable,
		observeResize,
		type ResizeObserverDetail
	} from '$lib/actions/resizeAction.svelte';

	// ------------------------------------------------------------------------
	// PATTERN 1: RESIZE ONLY WIDTH (e.g. Navigation Sidebar with a Vertical Rail)
	// ------------------------------------------------------------------------
	// - `axis: 'x'`: Restricts movement strictly to the horizontal X-axis.
	// - `side: 'right'`: The rail is on the right of the panel. Dragging right
	//   adds to width (+dx).
	// - `collapseBelow: 110`: If dragged narrower than 110px, it snaps to 0px.
	// - `sidebar.style`: A derived string (`width: 260px;`) ready for `style=`.
	// - `sidebar.rail`: Svelte 5 attachment function passed to `{@attach}`.
	const sidebar = createResizable({
		axis: 'x',
		side: 'right',
		initial: 260,
		min: 160,
		max: 420,
		collapseBelow: 110,
		varName: '--demo-sidebar-w'
	});

	// ------------------------------------------------------------------------
	// PATTERN 2: RESIZE ONLY HEIGHT (e.g. Bottom Drawer / Console Panel)
	// ------------------------------------------------------------------------
	// - `axis: 'y'`: Restricts movement strictly to the vertical Y-axis.
	// - `side: 'top'`: The rail is on the top of the panel. Dragging upwards
	//   increases height (-dy on clientY, inverted so moving up expands).
	// - `collapseBelow: 60`: Snaps to 0px if dragged very low.
	const terminal = createResizable({
		axis: 'y',
		side: 'top',
		initial: 140,
		min: 70,
		max: 300,
		collapseBelow: 60,
		varName: '--demo-panel-h'
	});

	// ------------------------------------------------------------------------
	// PATTERN 3: 2D RESIZING (e.g. Floating Card / Specimen Canvas)
	// ------------------------------------------------------------------------
	// - `axis: 'both'`: Resizes both width and height simultaneously.
	// - `side: 'bottom-right'`: Corner grip handle placed at the bottom-right.
	const box2D = createResizable({
		axis: 'both',
		side: 'bottom-right',
		initialWidth: 200,
		initialHeight: 120,
		minWidth: 100,
		maxWidth: 360,
		minHeight: 80,
		maxHeight: 240
	});

	// ------------------------------------------------------------------------
	// PATTERN 4: PASSIVE DIMENSION OBSERVATION (ResizeObserver)
	// ------------------------------------------------------------------------
	// - `observeResize(cb)`: Pure measurement attachment without any drag handles.
	let observedW = $state(0);
	let observedH = $state(0);

	function onObserved(detail: ResizeObserverDetail) {
		observedW = Math.round(detail.width);
		observedH = Math.round(detail.height);
	}
</script>

<div class="box gap-xl font-mono">
	<header class="box gap-2xs">
		<h3 class="text-lg bold text-primary marg-0">Modular Svelte 5 Resizable Attachments</h3>
		<p class="text-sm text-muted marg-0">Zero-dependency, pointer-captured, accessible interactive resizing.</p>
	</header>

	<!-- Example 1: Sidebar with a Resize Rail (Width Only) -->
	<section class="card pad-lg box gap-md">
		<div class="row ycenter gap-sm wrap">
			<span class="badge surface text-xs text-theme pad-xs radius-sm">Axis: X</span>
			<strong class="text-sm text-primary">Sidebar with Vertical Resize Rail (Width Only)</strong>
			<span class="text-xs text-muted">Drag rail, use ← → arrow keys, double-click to reset</span>
		</div>

		<div class="row border radius-md surface h-224 min0">
			<aside class="panel box scroll-y shrink-0 border-right" style={sidebar.style}>
				<div class="box gap-sm pad-sm full">
					<div class="row xbetween ycenter text-xs bold text-secondary">
						<span>Navigation</span>
						<span class="badge surface text-theme text-xs pad-2xs radius-sm">{sidebar.currentWidth}px</span>
					</div>
					<ul class="box gap-xs pad-0 marg-0 text-xs text-muted">
						<li class="row ycenter gap-xs pad-xs radius-sm surface"><span>📁</span> Projects</li>
						<li class="row ycenter gap-xs pad-xs radius-sm surface"><span>📐</span> Design Systems</li>
						<li class="row ycenter gap-xs pad-xs radius-sm surface"><span>🎨</span> Palettes</li>
						<li class="row ycenter gap-xs pad-xs radius-sm surface"><span>⚙️</span> Preferences</li>
					</ul>
					{#if sidebar.isCollapsed}
						<button type="button" class="button small outline marg-top-xs" onclick={() => sidebar.expand()}>
							Expand Sidebar
						</button>
					{/if}
				</div>
			</aside>

			<!-- The Sidebar Resize Rail -->
			<div
				class="resize-rail-vertical"
				class:dragging={sidebar.isDragging}
				use:sidebar.rail
				title="Drag to resize sidebar width"
			>
				<div class="rail-knurling"></div>
			</div>

			<main class="grow box xcenter ycenter pad-md canvas text-xs text-muted min0">
				<div>
					Main Content Area — Sidebar Width: <code class="text-theme surface pad-2xs radius-sm">{sidebar.currentWidth}px</code>
					{#if sidebar.isCollapsed}
						<span class="badge surface text-danger text-xs pad-2xs radius-sm">COLLAPSED</span>
					{/if}
				</div>
			</main>
		</div>
	</section>

	<!-- Example 2: Bottom Panel with a Horizontal Rail (Height Only) -->
	<section class="card pad-lg box gap-md">
		<div class="row ycenter gap-sm wrap">
			<span class="badge surface text-xs text-warning pad-xs radius-sm">Axis: Y</span>
			<strong class="text-sm text-primary">Bottom Drawer / Terminal Panel (Height Only)</strong>
			<span class="text-xs text-muted">Drag rail, use ↑ ↓ arrow keys</span>
		</div>

		<div class="box border radius-md surface h-256 min0">
			<div class="grow box xcenter ycenter text-xs text-muted canvas">
				<span>Editor Workspace View</span>
			</div>

			<!-- The Horizontal Resize Rail -->
			<div
				class="resize-rail-horizontal"
				class:dragging={terminal.isDragging}
				use:terminal.rail
				title="Drag to resize terminal height"
			>
				<div class="rail-knurling-horizontal"></div>
			</div>

			<div class="terminal box shrink-0" style={terminal.style}>
				<div class="row xbetween ycenter pad-xs border-bottom text-xs text-muted panel">
					<span>Console Output</span>
					<span class="badge text-theme text-xs pad-2xs radius-sm">{terminal.currentHeight}px</span>
				</div>
				<pre class="pad-sm text-xs text-success scroll-y grow marg-0">$ pnpm --dir frcked run check
svelte-check found 0 errors and 0 warnings
$ vite build
✓ built in 178ms</pre>
			</div>
		</div>
	</section>

	<!-- Example 3: 2D Corner Resizer (Both Width and Height) -->
	<section class="card pad-lg box gap-md">
		<div class="row ycenter gap-sm wrap">
			<span class="badge surface text-xs text-theme pad-xs radius-sm">Axis: Both</span>
			<strong class="text-sm text-primary">Floating Specimen Card (Width + Height)</strong>
		</div>

		<div class="card pad-xl box xcenter ycenter canvas radius-md">
			<div
				class="panel border radius-md relative box pad-md"
				style={box2D.style}
				use:observeResize={onObserved}
			>
				<h4 class="text-sm bold text-primary marg-0">Interactive Specimen</h4>
				<p class="text-xs text-theme marg-top-xs">{box2D.width} × {box2D.height} px</p>
				<p class="text-xs text-muted marg-0">Observed: {observedW} × {observedH} px</p>

				<!-- 2D Corner Handle -->
				<div
					class="corner-handle"
					class:dragging={box2D.isDragging}
					use:box2D.handle
					title="Drag corner to resize 2D box"
				>
					<svg width="10" height="10" viewBox="0 0 10 10">
						<path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke="currentColor" stroke-width="1.5" />
					</svg>
				</div>
			</div>
		</div>
	</section>
</div>
