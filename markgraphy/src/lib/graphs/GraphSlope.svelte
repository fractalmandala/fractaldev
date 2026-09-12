<script module lang="ts">
	import type { GraphPalette } from '../frame/tone';

	/** One before → after row. */
	export interface SlopeItem {
		label: string;
		from: number;
		to: number;
	}

	export interface GraphSlopeProps {
		title: string;
		fromLabel: string;
		toLabel: string;
		items: SlopeItem[];
		palette?: GraphPalette;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { toneRole } from '../frame/tone';
	import { reveal, stagger } from '../frame/motion';

	let {
		title,
		fromLabel,
		toLabel,
		items,
		palette,
		corner,
		class: className = ''
	}: GraphSlopeProps = $props();

	function format(value: number) {
		return value.toLocaleString('en-US', {
			maximumFractionDigits: Number.isInteger(value) ? 0 : 1
		});
	}

	const rows = $derived.by(() =>
		items.map((row) => {
			const up = row.to > row.from;
			const down = row.to < row.from;
			const arrowRole = up
				? toneRole(palette, 'primary')
				: down
					? toneRole(palette, 'secondary')
					: 'empty';
			const toRole = up
				? 'accent'
				: down
					? toneRole(palette, 'secondary')
					: 'foreground';

			return {
				label: row.label,
				spoken: `${row.label} from ${format(row.from)} to ${format(row.to)}`,
				from: format(row.from),
				to: format(row.to),
				arrow: up || down ? '→' : '–',
				arrowRole,
				toRole
			};
		})
	);
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="col">
			<div class="head">
				<span></span>
				<span class="hlabel">{fromLabel}</span>
				<span></span>
				<span class="hlabel">{toLabel}</span>
			</div>
			<ul class="rows" role="list">
				{#each rows as row, i (row.label)}
					<li
						class="row"
						aria-label={row.spoken}
						use:reveal={{ delay: stagger(i, 40), amount: 0.4 }}
					>
						<span class="label">{row.label}</span>
						<span class="num muted">{row.from}</span>
						<span
							class="arrow"
							aria-hidden="true"
							class:c-accent={row.arrowRole === 'accent'}
							class:c-accent2={row.arrowRole === 'accent2'}
							class:c-accent3={row.arrowRole === 'accent3'}
							class:c-muted={row.arrowRole === 'muted'}
							class:c-frame={row.arrowRole === 'empty'}
						>
							{row.arrow}
						</span>
						<span
							class="num"
							class:c-accent={row.toRole === 'accent'}
							class:c-accent2={row.toRole === 'accent2'}
							class:c-accent3={row.toRole === 'accent3'}
							class:c-muted={row.toRole === 'muted'}
							class:c-fg={row.toRole === 'foreground'}
						>
							{row.to}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	</GraphBody>
</Graph>

<style>
	.col {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 6.5rem 2rem 6.5rem;
		column-gap: 0.75rem;
		align-items: end;
	}

	.hlabel {
		text-align: right;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.rows {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 6.5rem 2rem 6.5rem;
		column-gap: 0.75rem;
		align-items: baseline;
	}

	.label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.num {
		text-align: right;
	}

	.muted {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.arrow {
		text-align: center;
		user-select: none;
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

	.c-muted {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.c-frame {
		color: var(--border, oklch(0.6 0 0 / 0.5));
	}

	.c-fg {
		color: var(--text-primary, oklch(0.93 0 0));
	}
</style>
