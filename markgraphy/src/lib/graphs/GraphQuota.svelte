<script module lang="ts">
	/**
	 * Quota usage bar: used against a hard limit, with reset date and an end-
	 * of-window projection. Billing-style: surfaces the headline figure, the
	 * "X of Y" copy, and pace so a customer can see whether they will run out.
	 */
	export interface GraphQuotaProps {
		title: string;
		used: number;
		limit: number;
		/** Unit label, e.g. "API calls" or "GB". */
		unit?: string;
		/** Optional reset label, e.g. "Oct 1" or "in 4 days". */
		resets?: string;
		/** Days elapsed in the current window. Enables the projection. */
		daysInto?: number;
		/** Window length in days. */
		daysTotal?: number;
		/** Optional number formatter. Defaults to thousands-grouped. */
		format?: (n: number) => string;
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
		used,
		limit,
		unit,
		resets,
		daysInto,
		daysTotal,
		format,
		caption,
		corner,
		class: className = ''
	}: GraphQuotaProps = $props();

	const ticks = 24;
	const fmt = $derived(format ?? defaultFormat);

	function defaultFormat(n: number): string {
		if (!Number.isFinite(n)) {
			return '0';
		}
		return Math.round(n).toLocaleString('en-US');
	}

	const view = $derived.by(() => {
		const safeLimit = limit > 0 ? limit : 0;
		const ratio = safeLimit > 0 ? Math.min(1, Math.max(0, used / safeLimit)) : 0;
		const filled = Math.round(ratio * ticks);
		const remaining = Math.max(0, safeLimit - used);
		const percent = Math.round(ratio * 100);
		const projection =
			daysInto != null && daysTotal != null && daysInto > 0 && daysTotal > daysInto
				? (used / daysInto) * daysTotal
				: null;
		const overBudget = projection != null && projection > safeLimit;
		const projectedPct =
			projection != null && safeLimit > 0 ? (projection / safeLimit) * 100 : null;
		const daysLeft = daysTotal != null && daysInto != null ? Math.max(0, daysTotal - daysInto) : null;
		const perDay = daysInto != null && daysInto > 0 ? used / daysInto : null;
		const pace = projectedPct == null
			? '—'
			: overBudget
				? 'over budget'
				: projectedPct >= 95
					? 'tight'
					: projectedPct >= 75
						? 'on track'
						: 'ahead';
		const willExceed = overBudget;
		return {
			ratio,
			filled,
			remaining,
			percent,
			projection,
			projectedPct,
			daysLeft,
			perDay,
			pace,
			willExceed
		};
	});

	const marks = $derived(trackMarks(undefined, { empty: '·', rest: '·', fill: '█' }));
	const indexes = $derived(Array.from({ length: ticks }, (_, i) => i));
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="quota" use:reveal={{ amount: 0.5 }}>
			<p class="headline">
				<span class="used" class:warn={view.willExceed}>{fmt(used)}</span>
				<span class="of">/</span>
				<span class="limit">{fmt(limit)}</span>
				{#if unit}<span class="unit">{unit}</span>{/if}
			</p>
			<p class="bar">
				<span class="brace" aria-hidden="true">[</span>
				<GraphTrack>
					{#each indexes as index, i (index)}
						<GraphTick>
							<span
								class="g"
								class:fill={index < view.filled}
								class:warn={index < view.filled && view.willExceed}
								use:reveal={{ delay: stagger(i, 14), amount: 0.4 }}
							>
								{index < view.filled ? marks.fill : marks.empty}
							</span>
						</GraphTick>
					{/each}
				</GraphTrack>
				<span class="brace" aria-hidden="true">]</span>
				<span class="pct" class:warn={view.willExceed}>{view.percent}%</span>
			</p>
			<dl class="rows">
				{#if resets}
					<div class="row">
						<dt>resets</dt>
						<dd>{resets}</dd>
					</div>
				{/if}
				{#if view.daysLeft != null}
					<div class="row">
						<dt>days left</dt>
						<dd>{view.daysLeft}{daysTotal != null ? ` / ${daysTotal}` : ''}</dd>
					</div>
				{/if}
				{#if view.projection != null && view.projectedPct != null}
					<div class="row">
						<dt>projected</dt>
						<dd class:warn={view.willExceed}>
							{fmt(view.projection)} ({Math.round(view.projectedPct)}% of limit)
						</dd>
					</div>
				{/if}
				{#if view.perDay != null}
					<div class="row">
						<dt>avg / day</dt>
						<dd>{fmt(view.perDay)}</dd>
					</div>
				{/if}
				<div class="row">
					<dt>pace</dt>
					<dd class:warn={view.willExceed}>{view.pace}</dd>
				</div>
			</dl>
			{#if view.willExceed}
				<p class="flag">↗ projected to exceed the limit before reset</p>
			{/if}
			{#if caption}
				<p class="muted">{caption}</p>
			{/if}
			<span class="sr-only">
				Used {fmt(used)} of {fmt(limit)}{unit ? ` ${unit}` : ''}, {view.percent} percent of quota
				{#if resets}, resets {resets}{/if}
				{#if view.projection != null}, projected to use {fmt(view.projection)} by end of window{/if}.
			</span>
		</div>
	</GraphBody>
</Graph>

<style>
	.quota {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.headline {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: baseline;
		gap: 0.4rem;
		margin: 0;
		font-size: 1.4rem;
		line-height: 1.1;
		letter-spacing: -0.015em;
	}

	.used {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.used.warn {
		color: var(--graph-accent-3, oklch(0.72 0.13 30));
	}

	.of {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.limit {
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.unit {
		color: var(--text-secondary, oklch(0.62 0 0));
		font-size: 0.95rem;
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

	.g.fill.warn {
		color: var(--graph-accent-3, oklch(0.72 0.13 30));
	}

	.pct {
		width: 5ch;
		flex-shrink: 0;
		text-align: right;
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.pct.warn {
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

	.warn {
		color: var(--graph-accent-3, oklch(0.72 0.13 30));
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
