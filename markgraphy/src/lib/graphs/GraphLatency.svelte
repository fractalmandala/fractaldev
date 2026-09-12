<script module lang="ts">
	import type { GraphPalette } from '../frame/tone';

	/** One percentile-banded data point: p50, p95, p99 in the same unit. */
	export interface LatencyPoint {
		p50: number;
		p95: number;
		p99: number;
		/** Mark the column as a spike. The ^ marker is drawn above it. */
		spike?: boolean;
	}

	/**
	 * Percentile band chart. Each column is stacked: the p50 fill (█) at the
	 * bottom, then p50→p95 (▓), then p95→p99 (▒). Spike markers appear above
	 * columns whose point sets `spike: true`.
	 */
	export interface GraphLatencyProps {
		title: string;
		data: LatencyPoint[];
		unit?: string;
		height?: number;
		labels?: [string, string];
		max?: number;
		palette?: GraphPalette;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import GraphRule from '../frame/GraphRule.svelte';
	import { isMonoPalette } from '../frame/tone';
	import { reveal, stagger } from '../frame/motion';

	let {
		title,
		data,
		unit = 'ms',
		height = 8,
		labels,
		max,
		palette,
		corner,
		class: className = ''
	}: GraphLatencyProps = $props();

	const mono = $derived(isMonoPalette(palette));

	function formatTick(value: number): string {
		if (!Number.isFinite(value)) {
			return '0';
		}
		if (Number.isInteger(value)) {
			return value.toString();
		}
		return value.toFixed(1);
	}

	function formatMs(value: number): string {
		if (value >= 1000) {
			return `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}s`;
		}
		return `${Math.round(value)}`;
	}

	const view = $derived.by(() => {
		const rows = Math.max(3, Math.min(15, height));
		const cap = max ?? data.reduce((m, point) => Math.max(m, point.p99, point.p95, point.p50), 0);
		const scale = cap > 0 ? cap : 1;
		const start = labels?.[0];
		const end = labels?.[1];
		const lastP50 = data.at(-1)?.p50 ?? 0;
		const lastP95 = data.at(-1)?.p95 ?? 0;
		const lastP99 = data.at(-1)?.p99 ?? 0;
		const peakP99 = data.reduce((m, point) => Math.max(m, point.p99), 0);
		const spikeCount = data.filter((point) => point.spike).length;
		return { rows, cap, scale, start, end, lastP50, lastP95, lastP99, peakP99, spikeCount };
	});

	function levelOf(value: number, scale: number, rows: number): number {
		return Math.min(rows, Math.max(0, Math.round((value / scale) * rows)));
	}
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="lat">
			<div class="spikes" aria-hidden="true">
				<span class="yscale" aria-hidden="true">&nbsp;</span>
				<span class="row">
					{#each data as point, i (i)}
						<span class="spike" class:on={point.spike}>{point.spike ? '^' : ' '}</span>
					{/each}
				</span>
			</div>
			<div class="plotrow" style:--plot-h={view.rows}>
				<div class="yscale">
					<span>{formatTick(view.cap)}</span>
					<span>{formatTick(0)}</span>
				</div>
				<div class="plot" aria-hidden="true">
					{#each data as point, i (i)}
						{@const p50 = Math.max(1, levelOf(point.p50, view.scale, view.rows))}
						{@const p95 = Math.max(p50, levelOf(point.p95, view.scale, view.rows))}
						{@const p99 = Math.max(p95, levelOf(point.p99, view.scale, view.rows))}
						<span class="col" use:reveal={{ delay: stagger(i, 18), amount: 0.4 }}>
							{#each Array.from({ length: view.rows }) as _, rowIndex}
								{@const fromBottom = view.rows - 1 - rowIndex}
								{@const tier =
									fromBottom < p50 ? 0 : fromBottom < p95 ? 1 : fromBottom < p99 ? 2 : 3}
								<span
									class="cellrow"
									class:c-p50={tier === 0}
									class:c-p95={tier === 1 && !mono}
									class:c-p95m={tier === 1 && mono}
									class:c-p99={tier === 2 && !mono}
									class:c-p99m={tier === 2 && mono}
									class:transparent={tier === 3}
								>
									{tier === 0 ? '█' : tier === 1 ? '▓' : tier === 2 ? '▒' : ' '}
								</span>
							{/each}
						</span>
					{/each}
				</div>
			</div>
			{#if view.start || view.end}
				<div class="axisrow">
					<span class="spacer" aria-hidden="true">{formatTick(view.cap)}</span>
					<div class="rulewrap">
						<GraphRule />
					</div>
				</div>
				<div class="axisrow">
					<span class="spacer" aria-hidden="true">{formatTick(view.cap)}</span>
					<div class="axislabels">
						<span>{view.start}</span>
						{#if view.end && view.end !== view.start}
							<span>{view.end}</span>
						{/if}
					</div>
				</div>
			{/if}

			<dl class="stats" aria-label="percentile summary">
				<div class="stat">
					<dt>p50</dt>
					<dd>{formatMs(view.lastP50)}{unit}</dd>
				</div>
				<div class="stat">
					<dt>p95</dt>
					<dd class:accent={!mono}>{formatMs(view.lastP95)}{unit}</dd>
				</div>
				<div class="stat">
					<dt>p99</dt>
					<dd class:accent={!mono && palette === 'multi'}>{formatMs(view.lastP99)}{unit}</dd>
				</div>
				<div class="stat">
					<dt>peak p99</dt>
					<dd>{formatMs(view.peakP99)}{unit}</dd>
				</div>
				<div class="stat">
					<dt>spikes</dt>
					<dd class:accent={view.spikeCount > 0 && !mono}>{view.spikeCount}</dd>
				</div>
			</dl>
			<span class="sr-only">
				Latency band chart. {data.length} points. Last p50 {formatMs(view.lastP50)} {unit},
				p95 {formatMs(view.lastP95)} {unit}, p99 {formatMs(view.lastP99)} {unit}.
				{view.spikeCount} spike{view.spikeCount === 1 ? '' : 's'}.
			</span>
		</div>
	</GraphBody>
</Graph>

<style>
	.lat {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.spikes {
		display: flex;
		gap: 0.75rem;
		height: 1em;
	}

	.plotrow {
		display: flex;
		gap: 0.75rem;
	}

	.yscale {
		display: flex;
		width: 4ch;
		flex-shrink: 0;
		flex-direction: column;
		align-items: flex-end;
		justify-content: space-between;
		padding: 1px 0;
		height: calc(var(--plot-h, 8) * 1em);
		text-align: right;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.spacer {
		width: 4ch;
		flex-shrink: 0;
		visibility: hidden;
	}

	.row {
		display: flex;
		flex: 1;
		min-width: 0;
		justify-content: center;
		gap: 0.125rem;
		user-select: none;
	}

	.spike {
		flex: none;
		min-width: 1ch;
		text-align: center;
		color: transparent;
	}

	.spike.on {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.plot {
		display: flex;
		flex: 1;
		min-width: 0;
		align-items: flex-end;
		justify-content: center;
		gap: 0.125rem;
		height: calc(var(--plot-h, 8) * 1em);
		user-select: none;
	}

	.col {
		display: flex;
		height: 100%;
		min-width: 1ch;
		flex-direction: column;
		justify-content: flex-end;
	}

	.cellrow {
		width: 100%;
		height: 1em;
		text-align: center;
	}

	.transparent {
		color: transparent;
	}

	.axisrow {
		display: flex;
		gap: 0.75rem;
	}

	.rulewrap {
		flex: 1;
		min-width: 0;
	}

	.axislabels {
		display: flex;
		flex: 1;
		justify-content: space-between;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.stats {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem 1.25rem;
		margin: 0.25rem 0 0;
	}

	.stat {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
	}

	.stat dt {
		margin: 0;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.stat dd {
		margin: 0;
	}

	.c-p50 {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.c-p95 {
		color: var(--graph-accent-2, oklch(0.78 0.12 70));
	}

	.c-p95m {
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.c-p99 {
		color: var(--graph-accent-3, oklch(0.72 0.13 30));
	}

	.c-p99m {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.accent {
		color: var(--graph-accent, oklch(0.78 0.17 155));
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
