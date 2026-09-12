<script module lang="ts">
	import type { Glyphs } from '../frame/glyphs';
	import type { GraphPalette } from '../frame/tone';

	/** One ranked row: label, a full-width glyph bar, and the value. */
	export interface RankItem {
		label: string;
		value: number;
		display?: string;
	}

	export interface GraphRankProps {
		title: string;
		items: RankItem[];
		max?: number;
		ticks?: number;
		glyphs?: Glyphs;
		palette?: GraphPalette;
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
		items,
		max,
		ticks = 20,
		glyphs,
		palette,
		corner,
		class: className = ''
	}: GraphRankProps = $props();

	const peak = $derived(max ?? Math.max(...items.map((entry) => entry.value), 1));
	const marks = $derived(trackMarks(glyphs, { empty: '-', rest: '=', fill: '=' }));
	const indexes = $derived(Array.from({ length: ticks }, (_, i) => i));

	function filledCount(value: number): number {
		return Math.min(ticks, Math.round((Math.max(value, 0) / peak) * ticks));
	}

	function formatValue(item: RankItem): string {
		if (item.display) {
			return item.display;
		}

		return item.value.toLocaleString('en-US', {
			maximumFractionDigits: Number.isInteger(item.value) ? 0 : 1
		});
	}
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<ol class="rank" role="list">
			{#each items as entry, index (entry.label)}
				{@const filled = filledCount(entry.value)}
				{@const shown = formatValue(entry)}
				<li
					class="row"
					aria-label="{entry.label} {shown}"
					use:reveal={{ delay: stagger(index, 50), amount: 0.4 }}
				>
					<span class="label">{entry.label}</span>
					<span class="mid">
						<span class="brace" aria-hidden="true">[</span>
						<GraphTrack>
							{#each indexes as tick (tick)}
								<GraphTick>
									<span class="g" class:fill={tick < filled}>
										{tick < filled ? marks.fill : marks.empty}
									</span>
								</GraphTick>
							{/each}
						</GraphTrack>
						<span class="brace" aria-hidden="true">]</span>
					</span>
					<span class="value">{shown}</span>
				</li>
			{/each}
		</ol>
	</GraphBody>
</Graph>

<style>
	.rank {
		display: flex;
		width: 100%;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.row {
		display: grid;
		grid-template-columns: 7rem minmax(0, 1fr) 7rem;
		align-items: center;
		column-gap: 1rem;
	}

	.label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.mid {
		display: flex;
		min-width: 0;
		align-items: center;
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

	.value {
		text-align: right;
		color: var(--text-secondary, oklch(0.62 0 0));
	}
</style>
