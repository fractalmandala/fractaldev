<script module lang="ts">
	import type { Glyphs } from '../frame/glyphs';
	import type { GraphPalette } from '../frame/tone';

	/** Line or area plot drawn from columns of glyphs, with y-scale labels. */
	export interface GraphPlotProps {
		title: string;
		data: number[];
		labels?: string[];
		height?: number;
		variant?: 'line' | 'area';
		progress?: number;
		glyphs?: Glyphs;
		palette?: GraphPalette;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import GraphRule from '../frame/GraphRule.svelte';
	import { clamp01, trackMarks } from '../frame/glyphs';
	import { isMonoPalette } from '../frame/tone';
	import { reveal, stagger } from '../frame/motion';

	let {
		title,
		data,
		labels,
		height = 7,
		variant = 'area',
		progress = 1,
		glyphs,
		palette,
		corner,
		class: className = ''
	}: GraphPlotProps = $props();

	const mono = $derived(isMonoPalette(palette));

	function formatTick(value: number) {
		if (Number.isInteger(value)) {
			return String(value);
		}

		return value.toFixed(1);
	}

	const view = $derived.by(() => {
		const max = Math.max(...data, 0);
		const min = Math.min(0, ...data);
		const range = max - min || 1;
		const end = labels?.[labels.length - 1];
		const start = labels?.[0];
		const yLabel = formatTick(max);
		const revealed = Math.round(clamp01(progress) * data.length);
		const lastLive = Math.max(0, revealed - 1);
		const marks = trackMarks(glyphs);
		return { max, min, range, end, start, yLabel, revealed, lastLive, marks };
	});
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="wrap">
			<div class="plotrow" style:--plot-h={height}>
				<div class="yscale">
					<span>{view.yLabel}</span>
					<span>{formatTick(view.min)}</span>
				</div>
				<div class="plot" aria-hidden="true">
					{#each data as value, column}
						{@const level = Math.round(((value - view.min) / view.range) * (height - 1))}
						{@const live = column === view.lastLive && column < view.revealed}
						{@const shown = column < view.revealed}
						<span class="col" use:reveal={{ delay: stagger(column, 40), amount: 0.4 }}>
							{#each Array.from({ length: height }) as _, row}
								{@const fromBottom = height - 1 - row}
								{@const isCap = shown && fromBottom === level}
								{@const isFill = shown && variant === 'area' && fromBottom < level}
								<span
									class="cellrow"
									class:c-accent={isCap && live}
									class:c-fg={isCap && !live}
									class:c-accent2={isFill && !mono}
									class:c-muted={isFill && mono}
									class:transparent={!isCap && !isFill}
								>
									{isCap ? view.marks.fill : isFill ? view.marks.rest : ' '}
								</span>
							{/each}
						</span>
					{/each}
				</div>
			</div>
			{#if view.start || view.end}
				<div class="axisrow">
					<span class="spacer" aria-hidden="true">{view.yLabel}</span>
					<div class="rulewrap">
						<GraphRule />
					</div>
				</div>
				<div class="axisrow">
					<span class="spacer" aria-hidden="true">{view.yLabel}</span>
					<div class="axislabels">
						<span>{view.start}</span>
						{#if view.end && view.end !== view.start}
							<span>{view.end}</span>
						{/if}
					</div>
				</div>
			{/if}
			<span class="sr-only">
				{variant} plot, {data.length} points, min {formatTick(view.min)}, max
				{formatTick(view.max)}
			</span>
		</div>
	</GraphBody>
</Graph>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
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
		height: calc(var(--plot-h, 7) * 1em);
		text-align: right;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.plot {
		display: flex;
		min-width: 0;
		align-items: flex-end;
		justify-content: center;
		gap: 0.125rem;
		height: calc(var(--plot-h, 7) * 1em);
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

	.spacer {
		width: 4ch;
		flex-shrink: 0;
		visibility: hidden;
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

	.c-accent {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.c-accent2 {
		color: var(--graph-accent-2, oklch(0.78 0.12 70));
	}

	.c-muted {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.c-fg {
		color: var(--text-primary, oklch(0.93 0 0));
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
