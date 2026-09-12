<script module lang="ts">
	import type { Glyphs } from '../frame/glyphs';
	import type { GraphPalette } from '../frame/tone';

	/** One labeled grid of cells; a value of `1` is filled, anything else is empty. */
	export interface CellGrid {
		label: string;
		cells: number[][];
	}

	export interface GraphCellsProps {
		title: string;
		items: CellGrid[];
		glyphs?: Glyphs;
		palette?: GraphPalette;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { trackMarks } from '../frame/glyphs';
	import { isMonoPalette, seriesRole } from '../frame/tone';
	import { reveal, stagger } from '../frame/motion';

	let {
		title,
		items,
		glyphs,
		palette,
		corner,
		class: className = ''
	}: GraphCellsProps = $props();

	const marks = $derived(trackMarks(glyphs, { empty: '·', rest: '░', fill: '█' }));

	const summary = $derived.by(() => {
		let filled = 0;
		let total = 0;
		for (const item of items) {
			for (const row of item.cells) {
				for (const cell of row) {
					total += 1;
					if (cell === 1) {
						filled += 1;
					}
				}
			}
		}
		return `${filled} of ${total} cells filled`;
	});
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="wrap">
			<div class="flow">
				{#each items as item, itemIndex (item.label)}
					{@const labelRole = isMonoPalette(palette) ? 'muted' : seriesRole(palette, itemIndex)}
					<div class="group">
						<div class="grid" aria-hidden="true">
							{#each item.cells as row, rowIndex (rowIndex)}
								<div class="row" use:reveal={{ delay: stagger(itemIndex * 8 + rowIndex, 40) }}>
									{#each row as cell, cellIndex (cellIndex)}
										{@const filled = cell === 1}
										{@const role = filled
											? isMonoPalette(palette)
												? 'accent'
												: seriesRole(palette, itemIndex)
											: 'frame'}
										<span
											class="cell"
											class:c-accent={role === 'accent'}
											class:c-accent2={role === 'accent2'}
											class:c-accent3={role === 'accent3'}
											class:c-fg={role === 'foreground'}
											class:c-frame={role === 'frame'}>{filled ? marks.fill : marks.empty}</span>
									{/each}
								</div>
							{/each}
						</div>
						<p
							class="label"
							class:c-muted={labelRole === 'muted'}
							class:c-accent={labelRole === 'accent'}
							class:c-accent2={labelRole === 'accent2'}
							class:c-accent3={labelRole === 'accent3'}>{item.label}</p>
					</div>
				{/each}
			</div>
		</div>
		<span class="sr-only">{summary}</span>
	</GraphBody>
</Graph>

<style>
	.wrap {
		container-type: inline-size;
	}

	.flow {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2.5rem;
	}

	@container (min-width: 28rem) {
		.flow {
			flex-direction: row;
			justify-content: center;
			gap: 3rem;
		}
	}

	.group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.grid {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.row {
		display: flex;
		gap: 0.25rem;
	}

	.cell {
		width: 1ch;
		text-align: center;
		user-select: none;
	}

	.label {
		margin: 0;
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

	.c-fg {
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.c-frame {
		color: var(--border, oklch(0.6 0 0 / 0.5));
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
