<script module lang="ts">
	import type { GraphPalette } from '../frame/tone';

	/** Tone of a flow node: default foreground, accent (live path), or muted. */
	export type FlowTone = 'default' | 'accent' | 'muted';

	export interface FlowNode {
		label: string;
		tone?: FlowTone;
		stretch?: boolean;
	}

	export interface FlowRow {
		nodes: FlowNode[];
	}

	export interface GraphFlowProps {
		title: string;
		rows: FlowRow[];
		palette?: GraphPalette;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import GraphArrow from '../frame/GraphArrow.svelte';
	import { reveal, stagger } from '../frame/motion';
	import { toneRole, type ToneRole } from '../frame/tone';

	let {
		title,
		rows,
		palette,
		corner,
		class: className = ''
	}: GraphFlowProps = $props();

	function nodeRole(tone: FlowTone): ToneRole {
		if (tone === 'accent') {
			return toneRole(palette, 'primary');
		}

		if (tone === 'muted') {
			return toneRole(palette, 'secondary');
		}

		return 'foreground';
	}
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="flow">
			{#each rows as row, rowIndex (rowIndex)}
				<div class="row" use:reveal={{ delay: stagger(rowIndex, 80), amount: 0.5 }}>
					{#each row.nodes as node, nodeIndex (`${node.label}-${nodeIndex}`)}
						{@const tone = node.tone ?? 'default'}
						{@const role = nodeRole(tone)}
						<div class="node" class:stretch={node.stretch}>
							{#if nodeIndex > 0}
								<GraphArrow accent={tone === 'accent'} stretch={node.stretch} />
							{/if}
							<span
								class="label"
								class:c-accent={role === 'accent'}
								class:c-accent2={role === 'accent2'}
								class:c-muted={role === 'muted'}
								class:c-fg={role === 'foreground'}
							>
								{node.label}
							</span>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</GraphBody>
</Graph>

<style>
	.flow {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.row {
		display: flex;
		min-width: 0;
		flex-wrap: wrap;
		align-items: center;
		column-gap: 0.75rem;
		row-gap: 0.5rem;
	}

	@media (min-width: 640px) {
		.row {
			flex-wrap: nowrap;
		}
	}

	.node {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 0.75rem;
	}

	.node.stretch {
		min-width: 4rem;
		flex: 1;
	}

	.label {
		flex-shrink: 0;
		white-space: nowrap;
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
</style>
