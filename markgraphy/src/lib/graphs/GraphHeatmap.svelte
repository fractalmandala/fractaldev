<script module lang="ts">
	import type { Glyphs } from '../frame/glyphs';
	import type { GraphPalette } from '../frame/tone';

	/** Labeled 2d intensity matrix with an optional less/more legend. */
	export interface HeatRow {
		label: string;
		values: number[];
	}

	export interface GraphHeatmapProps {
		title: string;
		columns: string[];
		rows: HeatRow[];
		max?: number;
		legend?: boolean;
		caption?: string;
		glyphs?: Glyphs;
		palette?: GraphPalette;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { intensityGlyph, intensityLevel, resolveGlyphs } from '../frame/glyphs';
	import { intensityRole } from '../frame/tone';
	import type { ToneRole } from '../frame/tone';
	import { reveal, stagger } from '../frame/motion';

	let {
		title,
		columns,
		rows,
		max,
		legend = true,
		caption,
		glyphs,
		palette,
		corner,
		class: className = ''
	}: GraphHeatmapProps = $props();

	const set = $derived(resolveGlyphs(glyphs));
	const peak = $derived(max ?? Math.max(0, ...rows.flatMap((row) => row.values), 0));

	const scale = $derived(
		set.map((glyph, index) => ({
			glyph,
			key: `${glyph}-${index}`,
			role: intensityRole(Math.round((index / Math.max(set.length - 1, 1)) * 4), palette)
		}))
	);

	const view = $derived(
		rows.map((row) => ({
			label: row.label,
			spoken: `${row.label}: ${columns
				.map((column, index) => `${column} ${row.values[index] ?? 0}`)
				.join(', ')}`,
			cells: columns.map((_, index) => {
				const level = intensityLevel(row.values[index] ?? 0, peak);
				return {
					glyph: intensityGlyph(level, set),
					role: intensityRole(level, palette) as ToneRole
				};
			})
		}))
	);
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="hm">
			<div class="wrap">
				<div class="cols">
					<span class="spacer"></span>
					{#each columns as column, c (c)}
						<span class="colhead">{column}</span>
					{/each}
				</div>
				<ul class="rows" role="list">
					{#each view as row, r (row.label)}
						<li
							class="row"
							aria-label={row.spoken}
							use:reveal={{ delay: stagger(r, 40), amount: 0.4 }}
						>
							<span class="label">{row.label}</span>
							<span class="cells" aria-hidden="true">
								{#each row.cells as cell, c (c)}
									<span
										class="cell"
										class:c-frame={cell.role === 'empty'}
										class:c-muted={cell.role === 'muted'}
										class:c-fg={cell.role === 'foreground'}
										class:c-accent={cell.role === 'accent'}
										class:c-accent2={cell.role === 'accent2'}
										class:c-accent3={cell.role === 'accent3'}
									>
										{cell.glyph}
									</span>
								{/each}
							</span>
						</li>
					{/each}
				</ul>
			</div>
			{#if legend || caption}
				<div class="foot">
					{#if caption}
						<p class="muted">{caption}</p>
					{:else}
						<span></span>
					{/if}
					{#if legend}
						<p class="legend">
							<span>Less</span>
							<span class="scale" aria-hidden="true">
								{#each scale as entry (entry.key)}
									<span
										class="sglyph"
										class:c-frame={entry.role === 'empty'}
										class:c-muted={entry.role === 'muted'}
										class:c-fg={entry.role === 'foreground'}
										class:c-accent={entry.role === 'accent'}
										class:c-accent2={entry.role === 'accent2'}
										class:c-accent3={entry.role === 'accent3'}
									>
										{entry.glyph}
									</span>
								{/each}
							</span>
							<span>More</span>
						</p>
					{/if}
				</div>
			{/if}
			<span class="sr-only">{rows.length} rows across {columns.length} columns</span>
		</div>
	</GraphBody>
</Graph>

<style>
	.hm {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.wrap {
		display: flex;
		width: 100%;
		flex-direction: column;
		gap: 0.5rem;
	}

	.cols {
		display: flex;
		width: 100%;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.spacer {
		width: 7rem;
		flex: 0 0 auto;
	}

	.colhead {
		overflow: hidden;
		min-width: 1.25ch;
		flex: 1 1 0%;
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.rows {
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		list-style: none;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.label {
		overflow: hidden;
		width: 7rem;
		flex: 0 0 auto;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.cells {
		display: flex;
		min-width: 0;
		flex: 1 1 0%;
		gap: 0.25rem;
	}

	.cell {
		min-width: 1.25ch;
		flex: 1 1 0%;
		line-height: 1;
		text-align: center;
		user-select: none;
	}

	.foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.legend {
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.scale {
		display: flex;
		user-select: none;
	}

	.sglyph {
		width: 1ch;
		text-align: center;
	}

	.muted {
		margin: 0;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.c-accent {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.c-accent2 {
		color: var(--graph-accent-2, oklch(0.78 0.12 70));
	}

	.c-accent3 {
		color: var(--graph-accent-3, oklch(0.72 0.13 30));
	}

	.c-frame {
		color: var(--border, oklch(0.6 0 0 / 0.5));
	}

	.c-fg {
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.c-muted {
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
