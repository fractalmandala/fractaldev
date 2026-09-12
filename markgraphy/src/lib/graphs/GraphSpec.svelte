<script module lang="ts">
	export interface SpecRow {
		label: string;
		value: string;
		accent?: boolean;
	}

	export interface GraphSpecProps {
		title: string;
		rows: SpecRow[];
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { reveal, stagger } from '../frame/motion';

	let {
		title,
		rows,
		corner,
		class: className = ''
	}: GraphSpecProps = $props();
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<dl class="rows">
			{#each rows as row, i (row.label)}
				<div class="row" use:reveal={{ delay: stagger(i, 40), amount: 0.5 }}>
					<dt class="muted">{row.label}</dt>
					<dd class="value" class:accent={row.accent}>{row.value}</dd>
				</div>
			{/each}
		</dl>
	</GraphBody>
</Graph>

<style>
	.rows {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 0;
	}

	.row {
		display: grid;
		grid-template-columns: minmax(7rem, 11rem) minmax(0, 1fr);
		align-items: baseline;
		column-gap: 1.5rem;
	}

	.muted {
		margin: 0;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.value {
		margin: 0;
	}

	.value.accent {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}
</style>
