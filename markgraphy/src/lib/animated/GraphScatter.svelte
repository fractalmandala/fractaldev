<script module lang="ts">
	/** A single point in the scatter plot. */
	export interface ScatterPoint {
		x: number;
		y: number;
		/** Optional label rendered muted next to the dot. */
		label?: string;
		/** Accent (hot) — useful to highlight a chosen point or trend seed. */
		accent?: boolean;
	}

	export interface GraphScatterProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. */
		title: string;
		/** Points to plot. x and y are real numbers; the plot scales them. */
		data: ScatterPoint[];
		/** Scene width in columns (excluding y-axis gutter). Default 60. */
		cols?: number;
		/** Scene height in rows (excluding x-axis row and optional trend row). Default 14. */
		rows?: number;
		/** Render a single-row linear trend strip below the plot. Default false. */
		trend?: boolean;
		/** Animate the reveal. Default true. Reduced motion shows the full plot. */
		animated?: boolean;
		/** Milliseconds between reveals of new points. Default 60. */
		speedMs?: number;
		/** Caption rendered muted under the plot. */
		label?: string;
		class?: string;
	}

	interface Seg {
		text: string;
		cls?: string;
	}

	/** Find the linear regression line (slope, intercept) for a set of points. */
	function regression(points: { x: number; y: number }[]): { slope: number; intercept: number } {
		const n = points.length;
		if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0 };

		let sx = 0;
		let sy = 0;
		let sxx = 0;
		let sxy = 0;
		for (const p of points) {
			sx += p.x;
			sy += p.y;
			sxx += p.x * p.x;
			sxy += p.x * p.y;
		}
		const denom = n * sxx - sx * sx;
		if (denom === 0) return { slope: 0, intercept: sy / n };
		const slope = (n * sxy - sx * sy) / denom;
		const intercept = (sy - slope * sx) / n;
		return { slope, intercept };
	}

	/** Format a number to up to 3 significant characters, trimming trailing zeros. */
	function compactNumber(n: number): string {
		if (!Number.isFinite(n)) return '0';
		const abs = Math.abs(n);
		if (abs >= 1000) return Math.round(n).toString();
		if (abs >= 10) return n.toFixed(1).replace(/\.0$/, '');
		if (abs >= 1) return n.toFixed(2).replace(/\.?0+$/, '');
		return n.toFixed(3).replace(/\.?0+$/, '');
	}

	/** Build the full row-by-row, run-length-encoded view of the plot. */
	function buildView(
		data: ScatterPoint[],
		plotCols: number,
		plotRows: number,
		trend: boolean
	): Seg[][] {
		const totalCols = plotCols;
		const totalRows = plotRows + (trend ? 1 : 0);

		// Empty grid.
		const grid: string[][] = [];
		for (let y = 0; y < totalRows; y++) {
			grid.push(new Array<string>(totalCols).fill(' '));
		}

		// Compute extent.
		const xs = data.map((p) => p.x);
		const ys = data.map((p) => p.y);
		const xMin = Math.min(...xs);
		const xMax = Math.max(...xs);
		const yMin = Math.min(...ys);
		const yMax = Math.max(...ys);
		const xRange = xMax - xMin || 1;
		const yRange = yMax - yMin || 1;

		// Map each point to a plot cell. Two points landing on the same cell merge
		// and the higher-tier glyph wins (accent > mid > faint).
		const tier: number[][] = [];
		for (let y = 0; y < plotRows; y++) tier.push(new Array<number>(plotCols).fill(-1));

		for (const p of data) {
			const col = Math.max(0, Math.min(plotCols - 1, Math.round(((p.x - xMin) / xRange) * (plotCols - 1))));
			const row = Math.max(0, Math.min(plotRows - 1, plotRows - 1 - Math.round(((p.y - yMin) / yRange) * (plotRows - 1))));
			const t = p.accent ? 2 : 1;
			if (tier[row][col] < t) tier[row][col] = t;
		}

		for (let row = 0; row < plotRows; row++) {
			for (let col = 0; col < plotCols; col++) {
				const t = tier[row][col];
				if (t < 0) continue;
				grid[row][col] = t === 2 ? 'X' : t === 1 ? 'o' : '.';
			}
		}

		// Faint grid baseline (a thin `·` ribbon every 4 columns, mid on the bottom row).
		for (let c = 0; c < plotCols; c += 4) {
			if (grid[plotRows - 1][c] === ' ') grid[plotRows - 1][c] = '.';
		}

		// Trend row: linear regression rendered as a single row of bar glyphs.
		if (trend) {
			const { slope, intercept } = regression(data);
			const trendRow = totalRows - 1;
			const barAt = (xVal: number) => {
				const y = slope * xVal + intercept;
				const norm = (y - yMin) / yRange;
				return norm;
			};
			for (let c = 0; c < plotCols; c++) {
				const xVal = xMin + (c / (plotCols - 1)) * xRange;
				const norm = barAt(xVal);
				const h = Math.max(0, Math.min(1, norm));
				grid[trendRow][c] = h >= 0.85 ? '#' : h >= 0.6 ? '*' : h >= 0.35 ? ':' : h > 0.1 ? '.' : ' ';
			}
		}

		// Y-axis tick lines: a `|` at col -1 (we use a separator column in the
		// caller) — but here we just leave the plot area clean.
		return grid.map((row) => runLength(row));
	}

	/** Run-length encode a row into classed segments. */
	function runLength(row: string[]): Seg[] {
		const segs: Seg[] = [];
		let buf = '';
		let cls: string | undefined;

		const setSeg = (ch: string, next: string | undefined) => {
			if (next === cls) {
				buf += ch;
			} else {
				if (buf.length > 0) segs.push({ text: buf, cls });
				cls = next;
				buf = ch;
			}
		};

		for (const ch of row) {
			if (ch === 'X') setSeg(ch, 'hot');
			else if (ch === 'o') setSeg(ch, 'mid');
			else if (ch === '*' || ch === ':' || ch === '.') setSeg(ch, 'faint');
			else if (ch === '#') setSeg(ch, 'trend');
			else setSeg(ch, undefined);
		}
		if (buf.length > 0) segs.push({ text: buf, cls });
		return segs;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';

	let {
		title,
		data,
		cols = 60,
		rows = 14,
		trend = false,
		animated = true,
		speedMs = 60,
		label = '',
		class: className = ''
	}: GraphScatterProps = $props();

	// Layout constants. The y-axis gutter is 5 chars wide; the x-axis is one
	// row at the bottom; the trend strip is one row below that.
	const Y_GUTTER = 5;
	const X_AXIS_ROWS = 1;
	const TREND_ROWS = $derived(trend ? 1 : 0);
	const plotCols = $derived(Math.max(8, cols - Y_GUTTER));
	const plotRows = $derived(Math.max(3, rows - X_AXIS_ROWS - TREND_ROWS));

	// Compute extents for axis labels.
	const extent = $derived.by(() => {
		if (data.length === 0) {
			return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
		}
		const xs = data.map((p) => p.x);
		const ys = data.map((p) => p.y);
		return {
			xMin: Math.min(...xs),
			xMax: Math.max(...xs),
			yMin: Math.min(...ys),
			yMax: Math.max(...ys)
		};
	});

	const moving = $derived(
		animated &&
			(typeof window === 'undefined' ||
				!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	);

	let revealed = $state(0);

	const preRevealed = $derived(moving ? 0 : data.length);

	$effect(() => {
		revealed = preRevealed;
	});

	$effect(() => {
		if (!moving || data.length < 2) return;
		const timer = window.setInterval(() => {
			revealed = revealed >= data.length ? 0 : revealed + 1;
		}, Math.max(40, speedMs));
		return () => window.clearInterval(timer);
	});

	// The full grid is built once; the reveal mask determines which points show.
	const fullView = $derived.by((): Seg[][] => buildView(data, plotCols, plotRows, trend));

	// Apply reveal: only the first `revealed` data points are drawn.
	const view = $derived.by((): Seg[][] => {
		if (revealed >= data.length) return fullView;
		// Build a mask of which plot cells are revealed.
		const mask = Array.from({ length: plotRows }, () => new Array<boolean>(plotCols).fill(false));
		for (let i = 0; i < revealed; i++) {
			const p = data[i];
			if (!p) continue;
			const xRange = extent.xMax - extent.xMin || 1;
			const yRange = extent.yMax - extent.yMin || 1;
			const col = Math.max(0, Math.min(plotCols - 1, Math.round(((p.x - extent.xMin) / xRange) * (plotCols - 1))));
			const row = Math.max(0, Math.min(plotRows - 1, plotRows - 1 - Math.round(((p.y - extent.yMin) / yRange) * (plotRows - 1))));
			mask[row][col] = true;
		}
		return fullView.map((rowSegs, r) => {
			// When trend is on, the last row is the trend strip — never reveal-masked.
			if (trend && r === plotRows) return rowSegs;
			// For plot rows, hide any point cell that isn't yet revealed.
			return rowSegs.map((seg) => {
				if (!seg.cls || seg.cls === 'faint' || seg.cls === 'trend') return seg;
				return { text: seg.text.replace(/[Xo]/g, ' '), cls: undefined };
			});
		});
	});

	// Build the y-axis label column (top: yMax, bottom: yMin).
	const yAxisLabel = $derived.by((): Seg[][] => {
		const totalRows = plotRows + TREND_ROWS;
		const grid: string[][] = [];
		for (let r = 0; r < totalRows; r++) grid.push(new Array<string>(Y_GUTTER).fill(' '));
		// Right-align labels.
		const writeLabel = (row: number, text: string) => {
			const offset = Math.max(0, Y_GUTTER - 1 - text.length);
			for (let i = 0; i < text.length && offset + i < Y_GUTTER; i++) {
				grid[row][offset + i] = text[i];
			}
		};
		writeLabel(0, compactNumber(extent.yMax));
		writeLabel(plotRows - 1, compactNumber(extent.yMin));
		if (trend) writeLabel(plotRows, 'trend');
		return grid.map((row) => runLengthY(row));
	});

	function runLengthY(row: string[]): Seg[] {
		const segs: Seg[] = [];
		let buf = '';
		let cls: string | undefined;
		for (const ch of row) {
			const next: string | undefined = ch === ' ' ? undefined : 'ax';
			if (next === cls) {
				buf += ch;
			} else {
				if (buf.length > 0) segs.push({ text: buf, cls });
				cls = next;
				buf = ch;
			}
		}
		if (buf.length > 0) segs.push({ text: buf, cls });
		return segs;
	}

	// X-axis label row: left = xMin, center, right = xMax.
	const xAxisLabel = $derived.by((): Seg[] => {
		const total = plotCols;
		const text = `${compactNumber(extent.xMin)} ─────── ${compactNumber(extent.xMax)}`;
		if (text.length <= total) {
			const pad = total - text.length;
			const left = Math.floor(pad / 2);
			return [{ text: ' '.repeat(left) + text + ' '.repeat(pad - left), cls: 'ax' }];
		}
		return [{ text: text.slice(0, total), cls: 'ax' }];
	});
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="viewport">
			<pre class="art" aria-hidden="true"><code>{#each view as row, r (r)}{#each yAxisLabel[r] as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each} │ {#each row as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{#if r < view.length - 1}{'\n'}{/if}{/each}
{#each xAxisLabel as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{#if trend}
{#each view[view.length - 1] ?? [] as seg, j (j)}{#if seg.cls}<span class="trend {seg.cls}">{seg.text}</span>{:else}<span class="trend">{seg.text}</span>{/if}{/each}{/if}</code></pre>
			{#if label}
				<p class="caption">{label}</p>
			{/if}
			<span class="sr-only">
				Scatter plot with {data.length} points, x {compactNumber(extent.xMin)} to {compactNumber(extent.xMax)},
				y {compactNumber(extent.yMin)} to {compactNumber(extent.yMax)}{trend ? ', trend strip below' : ''}.
			</span>
		</div>
	</GraphBody>
</Graph>

<style>
	.viewport {
		overflow-x: auto;
	}

	.art {
		margin: 0;
		font-size: 0.78rem;
		line-height: 1.2;
		color: var(--text-primary, oklch(0.93 0 0));
		white-space: pre;
		font-variant-numeric: tabular-nums;
	}

	.hot {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.mid {
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.faint {
		color: var(--text-muted, oklch(0.3 0 0));
	}

	.trend {
		color: var(--graph-accent-2, oklch(0.78 0.12 70));
	}

	.ax {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.caption {
		margin: 0.4rem 0 0;
		font-size: 0.78rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border-width: 0;
	}
</style>
