<script module lang="ts">
	import type { GraphPalette } from '../frame/tone';

	export type CompareCell = string | boolean;

	export interface CompareRow {
		label: string;
		values: CompareCell[];
	}

	export interface GraphCompareProps {
		title: string;
		columns: string[];
		rows: CompareRow[];
		accent?: string;
		palette?: GraphPalette;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { reveal, stagger } from '../frame/motion';
	import { isMonoPalette, seriesRole } from '../frame/tone';

	let {
		title,
		columns,
		rows,
		accent,
		palette,
		corner,
		class: className = ''
	}: GraphCompareProps = $props();

	const template = $derived(`minmax(7rem, 1fr) repeat(${columns.length}, minmax(4.5rem, 7rem))`);
	const summary = $derived(`${rows.length} features compared across ${columns.length} columns`);

	function cellText(value: CompareCell): string {
		if (typeof value === 'boolean') {
			return value ? '✓' : '–';
		}

		return value;
	}
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="scroll">
			<div class="sheet">
				<div class="head" style:--cols={template}>
					<span></span>
					{#each columns as column, index (column)}
						{@const focused = !!accent && column === accent}
						{@const role = isMonoPalette(palette)
							? focused
								? 'accent'
								: 'muted'
							: seriesRole(palette, index)}
						<span
							class="right"
							class:c-accent={role === 'accent'}
							class:c-accent2={role === 'accent2'}
							class:c-accent3={role === 'accent3'}
							class:c-muted={role === 'muted'}>{column}</span>
					{/each}
				</div>
				<ul class="rows" role="list">
					{#each rows as row, r (row.label)}
						<li
							class="line"
							style:--cols={template}
							use:reveal={{ delay: stagger(r, 40), amount: 0.4 }}
						>
							<span class="label">{row.label}</span>
							{#each columns as column, index (index)}
								{@const value = row.values[index]}
								{@const mark = typeof value === 'boolean'}
								{@const on = value === true}
								{@const focused = !!accent && column === accent}
								{@const dim = !!accent && !focused}
								{@const mono = isMonoPalette(palette)}
								{@const series = on && !mono ? seriesRole(palette, index) : null}
								{@const faded = dim && !on && mono}
								<span
									class="right"
									class:dim={faded}
									class:c-accent={(on && mono && (focused || !accent)) || series === 'accent'}
									class:c-accent2={series === 'accent2'}
									class:c-accent3={series === 'accent3'}
									class:c-fg={(on && mono && dim) || (!mark && focused)}
									class:c-frame={mark && !on}
									class:c-muted={!mark && dim}>{value == null ? '' : cellText(value)}</span>
							{/each}
						</li>
					{/each}
				</ul>
			</div>
		</div>
		<span class="sr-only">{summary}</span>
	</GraphBody>
</Graph>

<style>
	.scroll {
		overflow-x: auto;
	}

	.sheet {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-width: 32rem;
	}

	.head,
	.line {
		display: grid;
		grid-template-columns: var(--cols);
		column-gap: 1rem;
	}

	.head {
		align-items: end;
	}

	.line {
		align-items: baseline;
	}

	.rows {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.right {
		text-align: right;
	}

	.dim {
		opacity: 0.4;
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
