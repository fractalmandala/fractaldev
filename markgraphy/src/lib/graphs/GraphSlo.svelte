<script module lang="ts">
	/**
	 * Error-budget burn bar. One fill for spent, a dim trail for the remaining
	 * budget, plus window, burn rate, time-to-empty, target, and actual.
	 * Pairs with GraphLatency, GraphUptime, and GraphPulse.
	 */
	export interface GraphSloProps {
		title: string;
		/** Fraction of the error budget consumed, 0–1. */
		budget: number;
		/** Window length in the chosen unit. Default 30. */
		window?: number;
		/** Window unit. Default 'd'. */
		unit?: 'h' | 'd' | 'w' | 'mo';
		/** Allowed error rate as a fraction, e.g. 0.001 for 99.9%. */
		target?: number;
		/** Actual error rate as a fraction. */
		actual?: number;
		/** Burn rate multiplier (1 = on pace). If set, takes precedence over elapsed. */
		burnRate?: number;
		/** Days (or hours, weeks) elapsed so far. Used to compute time-to-empty. */
		elapsed?: number;
		/** Optional sparkline of daily burn samples, 0..1 each. */
		daily?: number[];
		/** Optional caption below the panel. */
		caption?: string;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import GraphTrack from '../frame/GraphTrack.svelte';
	import GraphTick from '../frame/GraphTick.svelte';
	import { reveal, stagger } from '../frame/motion';
	import { trackMarks } from '../frame/glyphs';

	let {
		title,
		budget,
		window = 30,
		unit = 'd',
		target,
		actual,
		burnRate,
		elapsed,
		daily,
		caption,
		corner,
		class: className = ''
	}: GraphSloProps = $props();

	const ticks = 24;

	const view = $derived.by(() => {
		const spent = Math.min(1, Math.max(0, budget));
		const remaining = 1 - spent;
		const filled = Math.round(spent * ticks);
		// burnRate, when set, is “× the on-pace rate”. When inferred from
		// elapsed, the per-day pace is spent / elapsed, which is on-pace when
		// spent equals elapsed/window. So inferredRate = pace * window.
		const pace = elapsed != null && elapsed > 0 ? spent / elapsed : null;
		const inferredRate = burnRate ?? (pace != null ? pace * window : null);
		// timeToEmpty is in the chosen unit (days by default). Two paths:
		//   burnRate path:    remaining window-budget at the given rate
		//                    → remaining * window / burnRate
		//   elapsed path:     remaining budget at the observed per-unit pace
		//                    → remaining * elapsed / spent
		const timeToEmpty =
			burnRate != null
				? (remaining * window) / burnRate
				: pace != null && spent > 0
					? (remaining * elapsed) / spent
					: null;
		const willExhaust =
			timeToEmpty != null && elapsed != null ? timeToEmpty < window - elapsed : false;
		const percent = Math.round(spent * 100);
		const targetPct = target != null ? target * 100 : null;
		const actualPct = actual != null ? actual * 100 : null;
		return {
			spent,
			remaining,
			filled,
			inferredRate,
			timeToEmpty,
			willExhaust,
			percent,
			targetPct,
			actualPct
		};
	});

	const marks = $derived(trackMarks(undefined, { empty: '·', rest: '·', fill: '█' }));

	function formatPct(n: number | null): string {
		if (n == null) {
			return '—';
		}
		if (n === 0) {
			return '0%';
		}
		if (n < 0.01) {
			return `${n.toFixed(3)}%`;
		}
		if (n < 1) {
			return `${n.toFixed(2)}%`;
		}
		return `${n.toFixed(1)}%`;
	}

	function formatRate(n: number | null): string {
		if (n == null) {
			return '—';
		}
		return `${n.toFixed(n < 10 ? 2 : 1)}×`;
	}

	function formatEta(n: number | null, u: string): string {
		if (n == null) {
			return '—';
		}
		if (n < 0) {
			return 'past due';
		}
		return `${n.toFixed(n < 10 ? 1 : 0)}${u}`;
	}

	const dailyPoints = $derived.by(() => {
		if (!daily || daily.length === 0) {
			return null;
		}
		const set = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
		const max = Math.max(...daily, 0.001);
		return daily.map((value) => {
			const ratio = Math.min(1, Math.max(0, value / max));
			return set[Math.min(7, Math.max(0, Math.round(ratio * 7)))] ?? '·';
		});
	});

	const indexes = $derived(Array.from({ length: ticks }, (_, i) => i));
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="slo" use:reveal={{ amount: 0.5 }}>
			{#if dailyPoints}
				<p class="daily" aria-hidden="true">
					<span class="daily-label">daily burn</span>
					<span class="daily-spark">
						{#each dailyPoints as glyph, i (`${glyph}-${i}`)}
							<span class="cell">{glyph}</span>
						{/each}
					</span>
				</p>
			{/if}
			<p class="bar">
				<span class="brace" aria-hidden="true">[</span>
				<GraphTrack>
					{#each indexes as index, i (index)}
						<GraphTick>
							<span
								class="g"
								class:fill={index < view.filled}
								use:reveal={{ delay: stagger(i, 14), amount: 0.4 }}
							>
								{index < view.filled ? marks.fill : marks.empty}
							</span>
						</GraphTick>
					{/each}
				</GraphTrack>
				<span class="brace" aria-hidden="true">]</span>
				<span class="pct" class:warn={view.willExhaust}>{view.percent}%</span>
			</p>
			<dl class="rows">
				<div class="row">
					<dt>window</dt>
					<dd>{window}{unit}</dd>
				</div>
				<div class="row">
					<dt>burn rate</dt>
					<dd class:warn={view.inferredRate != null && view.inferredRate > 1}>
						{formatRate(view.inferredRate)}
					</dd>
				</div>
				<div class="row">
					<dt>time-to-empty</dt>
					<dd class:warn={view.willExhaust}>{formatEta(view.timeToEmpty, unit)}</dd>
				</div>
				<div class="row">
					<dt>target</dt>
					<dd>{formatPct(view.targetPct)}</dd>
				</div>
				<div class="row">
					<dt>actual</dt>
					<dd class:warn={view.targetPct != null && view.actualPct != null && view.actualPct > view.targetPct}>
						{formatPct(view.actualPct)}
					</dd>
				</div>
			</dl>
			{#if view.willExhaust}
				<p class="flag">↗ will exhaust the budget before the window closes</p>
			{/if}
			{#if caption}
				<p class="muted">{caption}</p>
			{/if}
			<span class="sr-only">
				Error budget {view.percent} percent spent of a {window}{unit} window
				{#if view.inferredRate != null}, burn rate {formatRate(view.inferredRate)}{/if}
				{#if view.timeToEmpty != null}, time to empty {formatEta(view.timeToEmpty, unit)}{/if}.
			</span>
		</div>
	</GraphBody>
</Graph>

<style>
	.slo {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.daily {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 0;
	}

	.daily-label {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.daily-spark {
		display: inline-flex;
		gap: 0.125rem;
		user-select: none;
	}

	.cell {
		min-width: 1ch;
		text-align: center;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.bar {
		display: flex;
		width: 100%;
		align-items: center;
		column-gap: 0.75rem;
		margin: 0;
	}

	.brace {
		user-select: none;
		color: var(--border, oklch(0.6 0 0 / 0.5));
	}

	.g {
		color: var(--border, oklch(0.6 0 0 / 0.5));
	}

	.g.fill {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.pct {
		width: 5ch;
		flex-shrink: 0;
		text-align: right;
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.pct.warn,
	.warn {
		color: var(--graph-accent-3, oklch(0.72 0.13 30));
	}

	.rows {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.35rem 1.25rem;
		margin: 0;
	}

	.row {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
	}

	.row dt {
		margin: 0;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.row dd {
		margin: 0;
	}

	.flag {
		margin: 0;
		text-align: center;
		color: var(--graph-accent-3, oklch(0.72 0.13 30));
	}

	.muted {
		margin: 0;
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
