<script module lang="ts">
	export type WorkflowTone = 'default' | 'accent' | 'muted';

	export interface WorkflowNode {
		id: string;
		label: string;
		hint?: string;
		tone?: WorkflowTone;
	}

	export interface WorkflowEdge {
		from: string;
		to: string;
		label?: string;
		tone?: WorkflowTone;
	}

	export interface GraphWorkflowProps {
		title: string;
		nodes: WorkflowNode[];
		edges?: WorkflowEdge[];
		path?: string[];
		animated?: boolean;
		autoPlay?: boolean;
		speedMs?: number;
		showControls?: boolean;
		label?: string;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';

	let {
		title,
		nodes,
		edges,
		path,
		animated = true,
		autoPlay = false,
		speedMs = 1200,
		showControls = true,
		label,
		corner,
		class: className = ''
	}: GraphWorkflowProps = $props();

	const uid = $props.id();

	const idIndex = $derived.by(() => {
		const idx = new Map<string, number>();
		for (let i = 0; i < nodes.length; i++) idx.set(nodes[i].id, i);
		return idx;
	});

	const effectiveEdges = $derived.by(() => {
		const known = (edges ?? []).filter(
			(e) => idIndex.has(e.from) && idIndex.has(e.to) && e.from !== e.to
		);
		if (known.length > 0) return known;
		const chain: WorkflowEdge[] = [];
		for (let i = 0; i < nodes.length - 1; i++) {
			chain.push({ from: nodes[i].id, to: nodes[i + 1].id });
		}
		return chain;
	});

	const ranks = $derived.by(() => {
		const rank = new Map<string, number>();
		for (const n of nodes) rank.set(n.id, 0);
		const maxIter = nodes.length + 1;
		for (let iter = 0; iter < maxIter; iter++) {
			let changed = false;
			for (const e of effectiveEdges) {
				const rFrom = rank.get(e.from) ?? 0;
				const rTo = rank.get(e.to) ?? 0;
				if (rTo < rFrom + 1) {
					rank.set(e.to, rFrom + 1);
					changed = true;
				}
			}
			if (!changed) break;
		}
		return rank;
	});

	const layers = $derived.by(() => {
		const map = new Map<number, WorkflowNode[]>();
		for (const n of nodes) {
			const r = ranks.get(n.id) ?? 0;
			if (!map.has(r)) map.set(r, []);
			map.get(r)!.push(n);
		}
		return Array.from(map.entries())
			.sort((a, b) => a[0] - b[0])
			.map(([, list]) => list);
	});

	const NODE_GAP = 2;
	const EDGE_GAP = 2;

	function nodeInnerWidth(n: WorkflowNode): number {
		const w = Math.max(n.label.length, n.hint?.length ?? 0);
		return w + 2;
	}
	function nodeWidth(n: WorkflowNode): number {
		return nodeInnerWidth(n) + 2;
	}
	function nodeHeight(n: WorkflowNode): number {
		return n.hint ? 4 : 3;
	}

	const layout = $derived.by(() => {
		const dims = new Map<string, { w: number; h: number }>();
		for (const n of nodes) dims.set(n.id, { w: nodeWidth(n), h: nodeHeight(n) });

		const layerWidths = layers.map(
			(layer) =>
				layer.reduce((s, n) => s + dims.get(n.id)!.w, 0) +
				Math.max(0, layer.length - 1) * NODE_GAP
		);
		const width = Math.max(0, ...layerWidths);

		const positions = new Map<string, { col: number; row: number }>();
		let curRow = 0;
		for (let i = 0; i < layers.length; i++) {
			const layer = layers[i];
			const layerWidth = layerWidths[i];
			const leftPad = Math.max(0, Math.floor((width - layerWidth) / 2));
			let curCol = leftPad;
			let layerHeight = 0;
			for (const n of layer) {
				positions.set(n.id, { col: curCol, row: curRow });
				curCol += dims.get(n.id)!.w + NODE_GAP;
				layerHeight = Math.max(layerHeight, dims.get(n.id)!.h);
			}
			curRow += layerHeight + EDGE_GAP;
		}
		const height = Math.max(0, curRow - EDGE_GAP);

		return { positions, dims, width, height };
	});

	function kahnPath(): string[] {
		const inDeg = new Map<string, number>();
		for (const n of nodes) inDeg.set(n.id, 0);
		for (const e of effectiveEdges) {
			if (idIndex.has(e.to)) inDeg.set(e.to, (inDeg.get(e.to) ?? 0) + 1);
		}
		const queue: string[] = [];
		for (const [id, d] of inDeg) if (d === 0) queue.push(id);
		const out: string[] = [];
		while (queue.length > 0) {
			const id = queue.shift()!;
			out.push(id);
			for (const e of effectiveEdges) {
				if (e.from === id) {
					const next = (inDeg.get(e.to) ?? 0) - 1;
					inDeg.set(e.to, next);
					if (next === 0) queue.push(e.to);
				}
			}
		}
		if (out.length < nodes.length) {
			for (const n of nodes) if (!out.includes(n.id)) out.push(n.id);
		}
		return out;
	}

	const effectivePath = $derived.by(() => {
		if (!path) return null;
		const filtered = path.filter((id) => idIndex.has(id));
		return filtered.length > 0 ? filtered : null;
	});

	const topologicalPath = $derived(effectivePath ?? kahnPath());

	const pathIndex = $derived.by(() => {
		const idx = new Map<string, number>();
		topologicalPath.forEach((id, i) => idx.set(id, i));
		return idx;
	});

	let step = $state(0);
	let playing = $state(false);
	// svelte-ignore state_referenced_locally
	let intervalTime = $state(speedMs);

	const count = $derived(topologicalPath.length);
	const activeStep = $derived(count === 0 ? -1 : Math.min(step, count - 1));

	const motionAllowed = $derived(
		animated &&
			(typeof window === 'undefined' ||
				!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	);

	$effect(() => {
		if (autoPlay && motionAllowed) {
			playing = true;
		}
	});

	$effect(() => {
		if (!playing || count === 0) return;
		const timer = window.setInterval(() => {
			step = (activeStep + 1) % count;
		}, Math.max(100, intervalTime));
		return () => window.clearInterval(timer);
	});

	function handleTogglePlay() {
		if (count === 0) return;
		playing = !playing;
	}
	function handleNext() {
		if (count === 0) return;
		step = (activeStep + 1) % count;
	}
	function handlePrev() {
		if (count === 0) return;
		step = (activeStep - 1 + count) % count;
	}

	// --- Render: 2D char grid → list of (text, cls) segments per row ---

	type Cell = { ch: string; cls?: string };
	type Seg = { text: string; cls?: string };

	class Grid {
		rows: Cell[][];
		width: number;
		height: number;
		constructor(width: number, height: number) {
			this.width = width;
			this.height = height;
			this.rows = Array.from({ length: height }, () =>
				Array.from({ length: width }, () => ({ ch: ' ' }))
			);
		}
		set(col: number, row: number, ch: string, cls?: string): void {
			if (col < 0 || col >= this.width || row < 0 || row >= this.height) return;
			const cell = this.rows[row][col];
			cell.ch = ch;
			if (cls) cell.cls = cls;
		}
		rowToSegs(row: number): Seg[] {
			const segs: Seg[] = [];
			let run = '';
			let runCls: string | undefined;
			for (const cell of this.rows[row]) {
				if (cell.cls === runCls) {
					run += cell.ch;
				} else {
					if (run) segs.push({ text: run, cls: runCls });
					run = cell.ch;
					runCls = cell.cls;
				}
			}
			if (run) segs.push({ text: run, cls: runCls });
			return segs;
		}
	}

	function drawBox(
		grid: Grid,
		n: WorkflowNode,
		pos: { col: number; row: number },
		dim: { w: number; h: number },
		cls: string
	): void {
		const x = pos.col;
		const y = pos.row;
		const w = dim.w;
		const h = dim.h;
		const innerW = w - 2;

		grid.set(x, y, '┌', cls);
		for (let c = 1; c < w - 1; c++) grid.set(x + c, y, '─', cls);
		grid.set(x + w - 1, y, '┐', cls);

		const labelText = ' ' + n.label.padEnd(Math.max(0, innerW), ' ');
		for (let c = 0; c < w; c++) {
			const ch = c === 0 || c === w - 1 ? '│' : labelText[c];
			grid.set(x + c, y + 1, ch, cls);
		}

		if (h >= 4 && n.hint) {
			const hintText = ' ' + n.hint.padEnd(Math.max(0, innerW), ' ');
			for (let c = 0; c < w; c++) {
				const ch = c === 0 || c === w - 1 ? '│' : hintText[c];
				grid.set(x + c, y + 2, ch, cls);
			}
		}

		const bRow = y + h - 1;
		grid.set(x, bRow, '└', cls);
		for (let c = 1; c < w - 1; c++) grid.set(x + c, bRow, '─', cls);
		grid.set(x + w - 1, bRow, '┘', cls);
	}

	function drawEdge(
		grid: Grid,
		from: { col: number; row: number; w: number; h: number },
		to: { col: number; row: number; w: number; h: number },
		cls: string
	): void {
		const sCx = from.col + Math.floor(from.w / 2);
		const sBot = from.row + from.h;
		const tCx = to.col + Math.floor(to.w / 2);
		const tTop = to.row;

		// Same row, or any case where the target is at or above the source's bottom:
		// skip — drawing would overlap the source box.
		if (sBot >= tTop) return;

		if (sCx === tCx) {
			for (let r = sBot; r < tTop - 1; r++) grid.set(sCx, r, '│', cls);
			grid.set(sCx, tTop - 1, 'v', cls);
			return;
		}

		const sCorner = sCx < tCx ? '└' : '┘';
		const tCorner = sCx < tCx ? '┐' : '┌';

		grid.set(sCx, sBot, sCorner, cls);
		if (sCx < tCx) {
			for (let c = sCx + 1; c < tCx; c++) grid.set(c, sBot, '─', cls);
		} else {
			for (let c = sCx - 1; c > tCx; c--) grid.set(c, sBot, '─', cls);
		}
		grid.set(tCx, sBot, tCorner, cls);

		for (let r = sBot + 1; r < tTop - 1; r++) grid.set(tCx, r, '│', cls);
		grid.set(tCx, tTop - 1, 'v', cls);
	}

	function nodeCls(n: WorkflowNode, state: 'active' | 'done' | 'pending'): string {
		const base = `node ${state}`;
		if (n.tone === 'accent') return `${base} explicit-accent`;
		if (n.tone === 'muted') return `${base} explicit-muted`;
		return base;
	}

	function edgeCls(e: WorkflowEdge, state: 'active' | 'done' | 'pending'): string {
		const base = `edge ${state}`;
		if (e.tone === 'accent') return `${base} explicit-accent`;
		if (e.tone === 'muted') return `${base} explicit-muted`;
		return base;
	}

	const art = $derived.by(() => {
		const { positions, dims, width, height } = layout;
		if (nodes.length === 0 || width === 0 || height === 0) {
			return [[{ text: '( no nodes )', cls: 'detail' }]];
		}

		const grid = new Grid(width, height);

		// Edges first so node boxes stamp on top.
		for (const e of effectiveEdges) {
			const fp = positions.get(e.from);
			const tp = positions.get(e.to);
			if (!fp || !tp) continue;
			const fd = dims.get(e.from)!;
			const td = dims.get(e.to)!;

			const fromIdx = pathIndex.get(e.from) ?? -1;
			const toIdx = pathIndex.get(e.to) ?? -1;

			let state: 'active' | 'done' | 'pending';
			if (fromIdx >= 0 && toIdx >= 0 && fromIdx < activeStep && toIdx <= activeStep) {
				state = 'done';
			} else if (toIdx === activeStep && fromIdx >= 0 && fromIdx < activeStep) {
				state = 'active';
			} else {
				state = 'pending';
			}
			drawEdge(
				grid,
				{ col: fp.col, row: fp.row, w: fd.w, h: fd.h },
				{ col: tp.col, row: tp.row, w: td.w, h: td.h },
				edgeCls(e, state)
			);
		}

		for (const n of nodes) {
			const p = positions.get(n.id);
			const d = dims.get(n.id);
			if (!p || !d) continue;
			const idx = pathIndex.get(n.id) ?? -1;
			let state: 'active' | 'done' | 'pending';
			if (activeStep < 0 || idx === -1) {
				state = 'pending';
			} else if (idx === activeStep) {
				state = 'active';
			} else if (idx < activeStep) {
				state = 'done';
			} else {
				state = 'pending';
			}
			drawBox(grid, n, p, d, nodeCls(n, state));
		}

		return grid.rows.map((_, i) => grid.rowToSegs(i));
	});
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="workflow" class:anim={animated} class:playing>
			<div class="viewport">
				<pre class="art"><code>{#each art as line, i (i)}{#each line as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{#if i < art.length - 1}{'\n'}{/if}{/each}</code></pre>
				{#if label}
					<p class="caption">{label}</p>
				{/if}
			</div>

			{#if showControls && count > 0}
				<div class="controls">
					<div class="buttons">
						<button class="ctrl" type="button" onclick={handlePrev} aria-label="Previous step">◀</button>
						<button class="ctrl primary" type="button" onclick={handleTogglePlay}>
							{playing ? '❚❚ pause' : '▶ play'}
						</button>
						<button class="ctrl" type="button" onclick={handleNext} aria-label="Next step">▶</button>
					</div>

					<div class="dots">
						{#each topologicalPath as _id, i (i)}
							<button
								class="dot"
								class:on={activeStep === i}
								type="button"
								onclick={() => {
									step = i;
									playing = false;
								}}
								aria-label={`Step ${i + 1}`}
							></button>
						{/each}
					</div>

					<label class="speed" for="{uid}-speed">
						Speed {(intervalTime / 1000).toFixed(1)}s
						<input id="{uid}-speed" type="range" min="400" max="2500" step="100" bind:value={intervalTime} />
					</label>
				</div>
			{/if}
		</div>
	</GraphBody>
</Graph>

<style>
	.workflow {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	.viewport {
		overflow-x: auto;
	}

	.art {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.35;
		color: var(--text-primary, oklch(0.93 0 0));
		white-space: pre;
	}

	.caption {
		margin: 0.5rem 0 0;
		color: var(--text-secondary, oklch(0.62 0 0));
		font-size: 0.75rem;
		letter-spacing: 0.04em;
	}

	.node { color: var(--text-primary, oklch(0.93 0 0)); }
	.node.active { color: var(--text-primary, oklch(0.93 0 0)); font-weight: 600; }
	.node.done { color: var(--graph-accent, oklch(0.78 0.17 155)); }
	.node.pending { color: var(--text-secondary, oklch(0.62 0 0)); }
	.node.explicit-accent { color: var(--graph-accent, oklch(0.78 0.17 155)); }
	.node.explicit-muted { color: var(--text-muted, oklch(0.3 0 0)); }

	.edge { color: var(--border, oklch(0.6 0 0 / 0.5)); }
	.edge.active { color: var(--graph-accent, oklch(0.78 0.17 155)); }
	.edge.done { color: var(--graph-accent, oklch(0.78 0.17 155)); }
	.edge.pending { color: var(--text-muted, oklch(0.3 0 0)); }
	.edge.explicit-accent { color: var(--graph-accent, oklch(0.78 0.17 155)); }
	.edge.explicit-muted { color: var(--text-muted, oklch(0.3 0 0)); }

	.detail { color: var(--text-secondary, oklch(0.62 0 0)); }

	@media (prefers-reduced-motion: no-preference) {
		.anim .node,
		.anim .edge { transition: color 0.25s ease; }
		.anim.playing .node.active { animation: pulse 1s infinite alternate; }
	}

	@keyframes pulse {
		from { opacity: 0.7; }
		to { opacity: 1; }
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
		padding-top: 0.875rem;
		border-top: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
	}

	.buttons { display: flex; align-items: center; gap: 0.35rem; }

	.ctrl {
		padding: 0.25rem 0.6rem;
		font-size: 0.75rem;
		color: var(--text-secondary, oklch(0.62 0 0));
		background: none;
		border: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
		border-radius: 0;
		cursor: pointer;
	}
	.ctrl:hover {
		color: var(--text-primary, oklch(0.93 0 0));
		border-color: var(--text-secondary, oklch(0.62 0 0));
	}
	.primary {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		border-color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.dots { display: flex; align-items: center; gap: 0.4rem; }

	.dot {
		width: 8px;
		height: 8px;
		padding: 0;
		background: var(--text-muted, oklch(0.3 0 0));
		border: none;
		border-radius: 50%;
		cursor: pointer;
	}
	.dot.on { background: var(--graph-accent, oklch(0.78 0.17 155)); }

	.speed {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: var(--text-secondary, oklch(0.62 0 0));
		white-space: nowrap;
	}

	.speed input {
		width: 80px;
		height: 4px;
		accent-color: var(--graph-accent, oklch(0.78 0.17 155));
		cursor: pointer;
	}
</style>
