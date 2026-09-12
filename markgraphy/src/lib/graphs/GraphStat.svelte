<script module lang="ts">
	/** Large figures with labels. Two to four numbers, no trend. */
	export interface StatItem {
		value: string;
		label: string;
		hint?: string;
		accent?: boolean;
	}

	export interface GraphStatProps {
		title: string;
		items: StatItem[];
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
		items,
		corner,
		class: className = ''
	}: GraphStatProps = $props();

	const columns = $derived(Math.min(items.length, 4));
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<ul
			class="stats"
			class:cols2={columns === 2}
			class:cols3={columns === 3}
			class:cols4={columns === 4}
			role="list"
		>
			{#each items as item, i (item.label)}
				<li class="stat" class:accent={item.accent} use:reveal={{ delay: stagger(i, 60) }}>
					<p class="value">{item.value}</p>
					<p class="muted">{item.label}</p>
					{#if item.hint}
						<p class="muted">{item.hint}</p>
					{/if}
				</li>
			{/each}
		</ul>
	</GraphBody>
</Graph>

<style>
	.stats {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	@media (min-width: 640px) {
		.cols2 {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.cols3 {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.cols4 {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.value {
		margin: 0;
		font-size: 1.875rem;
		line-height: 1.2;
		letter-spacing: -0.025em;
	}

	@media (min-width: 640px) {
		.value {
			font-size: 2.25rem;
		}
	}

	.muted {
		margin: 0;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.stat.accent .value {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}
</style>
