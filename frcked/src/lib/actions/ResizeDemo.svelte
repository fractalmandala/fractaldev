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
	} from './resizeAction.svelte';

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

<div class="resize-showcase">
	<header class="showcase-header">
		<h3>Modular Svelte 5 Resizable Attachments</h3>
		<p>Zero-dependency, pointer-captured, accessible interactive resizing.</p>
	</header>

	<!-- Example 1: Sidebar with a Resize Rail (Width Only) -->
	<section class="demo-section">
		<div class="section-title">
			<span class="badge">Axis: X</span>
			<strong>Sidebar with Vertical Resize Rail (Width Only)</strong>
			<span class="subtext">Drag rail, use ← → arrow keys, double-click to reset</span>
		</div>

		<div class="mock-workspace">
			<aside class="demo-sidebar" style={sidebar.style}>
				<div class="sidebar-content">
					<div class="sidebar-header">
						<span>Navigation</span>
						<span class="dim-pill">{sidebar.currentWidth}px</span>
					</div>
					<ul class="nav-links">
						<li><span>📁</span> Projects</li>
						<li><span>📐</span> Design Systems</li>
						<li><span>🎨</span> Palettes</li>
						<li><span>⚙️</span> Preferences</li>
					</ul>
					{#if sidebar.isCollapsed}
						<button class="expand-btn" onclick={() => sidebar.expand()}>
							Expand Sidebar
						</button>
					{/if}
				</div>
			</aside>

			<!-- The Sidebar Resize Rail -->
			<div
				class="resize-rail-vertical"
				class:dragging={sidebar.isDragging}
				{@attach sidebar.rail}
				title="Drag to resize sidebar width"
			>
				<div class="rail-knurling"></div>
			</div>

			<main class="demo-canvas">
				<div class="canvas-meta">
					Main Content Area — Sidebar Width: <code>{sidebar.currentWidth}px</code>
					{#if sidebar.isCollapsed}
						<span class="collapsed-tag">COLLAPSED</span>
					{/if}
				</div>
			</main>
		</div>
	</section>

	<!-- Example 2: Bottom Panel with a Horizontal Rail (Height Only) -->
	<section class="demo-section">
		<div class="section-title">
			<span class="badge yellow">Axis: Y</span>
			<strong>Bottom Drawer / Terminal Panel (Height Only)</strong>
			<span class="subtext">Drag rail, use ↑ ↓ arrow keys</span>
		</div>

		<div class="mock-terminal-container">
			<div class="terminal-main">
				<span>Editor Workspace View</span>
			</div>

			<!-- The Horizontal Resize Rail -->
			<div
				class="resize-rail-horizontal"
				class:dragging={terminal.isDragging}
				{@attach terminal.rail}
				title="Drag to resize terminal height"
			>
				<div class="rail-knurling-horizontal"></div>
			</div>

			<div class="demo-terminal" style={terminal.style}>
				<div class="terminal-bar">
					<span>Console Output</span>
					<span class="dim-pill">{terminal.currentHeight}px</span>
				</div>
				<pre class="terminal-log">
$ pnpm --dir frcked run check
svelte-check found 0 errors and 0 warnings
$ vite build
✓ built in 2.92s
				</pre>
			</div>
		</div>
	</section>

	<!-- Example 3: 2D Corner Resizer (Both Width and Height) -->
	<section class="demo-section">
		<div class="section-title">
			<span class="badge purple">Axis: Both</span>
			<strong>Floating Specimen Card (Width + Height)</strong>
		</div>

		<div class="card-sandbox">
			<div
				class="resizable-card"
				style={box2D.style}
				{@attach observeResize(onObserved)}
			>
				<div class="card-inner">
					<h4>Interactive Specimen</h4>
					<p class="card-dim">{box2D.width} × {box2D.height} px</p>
					<p class="obs-dim">Observed: {observedW} × {observedH} px</p>
				</div>

				<!-- 2D Corner Handle -->
				<div
					class="corner-handle"
					class:dragging={box2D.isDragging}
					{@attach box2D.handle}
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

<style lang="sass">
.resize-showcase
	display: flex
	flex-direction: column
	gap: 2rem
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
	color: #e2e8f0

.showcase-header
	h3
		margin: 0 0 0.25rem 0
		font-size: 1.15rem
		color: #f8fafc

	p
		margin: 0
		font-size: 0.825rem
		color: #94a3b8

.demo-section
	display: flex
	flex-direction: column
	gap: 0.6rem
	background: #0f172a
	border: 1px solid #1e293b
	border-radius: 8px
	padding: 1rem

.section-title
	display: flex
	align-items: center
	gap: 0.6rem
	font-size: 0.85rem
	flex-wrap: wrap

.badge
	background: #2563eb
	color: #fff
	font-size: 0.7rem
	font-weight: 600
	padding: 0.15rem 0.45rem
	border-radius: 4px

	&.yellow
		background: #d97706

	&.purple
		background: #7c3aed

.subtext
	color: #64748b
	font-size: 0.75rem

.mock-workspace
	display: flex
	height: 220px
	border: 1px solid #334155
	border-radius: 6px
	overflow: hidden
	background: #090d16

.demo-sidebar
	background: #0f172a
	height: 100%
	border-right: none
	overflow: hidden
	display: flex
	flex-direction: column
	flex-shrink: 0
	transition: width 0.05s ease-out

.sidebar-content
	padding: 0.75rem
	width: 100%
	box-sizing: border-box

.sidebar-header
	display: flex
	justify-content: space-between
	align-items: center
	font-weight: 600
	font-size: 0.8rem
	margin-bottom: 0.5rem
	color: #cbd5e1

.dim-pill
	background: #1e293b
	color: #38bdf8
	padding: 0.1rem 0.35rem
	border-radius: 3px
	font-size: 0.7rem

.nav-links
	list-style: none
	padding: 0
	margin: 0
	display: flex
	flex-direction: column
	gap: 0.4rem
	font-size: 0.78rem
	color: #94a3b8

	li
		display: flex
		align-items: center
		gap: 0.4rem
		padding: 0.25rem 0.4rem
		border-radius: 4px
		background: #1e293b44

.expand-btn
	margin-top: 0.5rem
	padding: 0.25rem 0.5rem
	font-size: 0.75rem
	background: #2563eb
	color: white
	border: none
	border-radius: 4px
	cursor: pointer

.resize-rail-vertical
	width: 6px
	background: #1e293b
	cursor: col-resize
	position: relative
	flex-shrink: 0
	display: flex
	align-items: center
	justify-content: center
	transition: background 0.15s ease
	user-select: none

	&:hover,
	&.dragging
		background: #38bdf8

		.rail-knurling
			background: white

.rail-knurling
	width: 2px
	height: 24px
	background: #475569
	border-radius: 1px

.demo-canvas
	flex: 1
	background: #020617
	padding: 1rem
	display: flex
	align-items: center
	justify-content: center

.canvas-meta
	font-size: 0.8rem
	color: #64748b

	code
		color: #38bdf8
		background: #0f172a
		padding: 0.15rem 0.35rem
		border-radius: 4px

.collapsed-tag
	background: #ef4444
	color: white
	padding: 0.1rem 0.4rem
	border-radius: 3px
	font-size: 0.7rem
	margin-left: 0.5rem

.mock-terminal-container
	display: flex
	flex-direction: column
	height: 240px
	border: 1px solid #334155
	border-radius: 6px
	overflow: hidden
	background: #090d16

.terminal-main
	flex: 1
	display: flex
	align-items: center
	justify-content: center
	color: #64748b
	font-size: 0.8rem

.resize-rail-horizontal
	height: 6px
	background: #1e293b
	cursor: row-resize
	display: flex
	align-items: center
	justify-content: center
	transition: background 0.15s ease
	user-select: none
	flex-shrink: 0

	&:hover,
	&.dragging
		background: #f59e0b

		.rail-knurling-horizontal
			background: white

.rail-knurling-horizontal
	height: 2px
	width: 32px
	background: #475569
	border-radius: 1px

.demo-terminal
	background: #020617
	display: flex
	flex-direction: column
	overflow: hidden
	flex-shrink: 0

.terminal-bar
	padding: 0.35rem 0.75rem
	background: #0f172a
	border-bottom: 1px solid #1e293b
	font-size: 0.75rem
	display: flex
	justify-content: space-between
	align-items: center
	color: #94a3b8

.terminal-log
	margin: 0
	padding: 0.5rem 0.75rem
	font-size: 0.72rem
	color: #4ade80
	overflow: auto
	flex: 1

.card-sandbox
	padding: 1.5rem
	background: #020617
	border-radius: 6px
	display: flex
	align-items: center
	justify-content: center

.resizable-card
	background: #1e1b4b
	border: 1px solid #4338ca
	border-radius: 8px
	position: relative
	overflow: hidden
	box-shadow: 0 4px 20px rgba(67, 56, 202, 0.25)
	display: flex
	flex-direction: column

.card-inner
	padding: 1rem
	user-select: none

	h4
		margin: 0 0 0.4rem 0
		font-size: 0.85rem
		color: #c7d2fe

.card-dim
	margin: 0
	font-size: 0.8rem
	font-weight: 600
	color: #a5b4fc

.obs-dim
	margin: 0.25rem 0 0 0
	font-size: 0.7rem
	color: #818cf8

.corner-handle
	position: absolute
	right: 0
	bottom: 0
	width: 16px
	height: 16px
	cursor: nwse-resize
	display: flex
	align-items: center
	justify-content: center
	color: #6366f1
	user-select: none

	&:hover,
	&.dragging
		color: #a5b4fc
</style>
