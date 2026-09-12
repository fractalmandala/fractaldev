<script module lang="ts">
	import type { Glyphs } from '../frame/glyphs';

	/** Share grid of ~100 cells; filled cells carry the accent. */
	export interface GraphWaffleProps {
		title: string;
		value: number;
		cells?: number;
		columns?: number;
		caption?: string;
		glyphs?: Glyphs;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { trackMarks } from '../frame/glyphs';
	import { reveal, stagger } from '../frame/motion';

	let {
		title,
		value,
		cells = 100,
		columns = 10,
		caption,
		glyphs,
		corner,
		class: className = ''
	}: GraphWaffleProps = $props();

	const view = $derived.by(() => {
		const clamped = Math.min(1, Math.max(0, value));
		const filled = Math.round(clamped * cells);
		const rowCount = Math.ceil(cells / columns);
		const marks = trackMarks(glyphs, { empty: '░', rest: '░', fill: '█' });
		const percent = Math.round(clamped * 100);
		return { filled, rowCount, marks, percent };
	});
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="wrap">
			<div class="grid" aria-hidden="true">
				{#each Array.from({ length: view.rowCount }) as _, row}
					<div class="wrow" use:reveal={{ delay: stagger(row, 40), amount: 0.4 }}>
						{#each Array.from({ length: columns }) as _, column}
							{@const index = row * columns + column}
							{#if index >= cells}
								<span class="cell"></span>
							{:else}
								<span
									class="cell"
									class:c-accent={index < view.filled}
									class:c-frame={index >= view.filled}
								>
									{index < view.filled ? view.marks.fill : view.marks.empty}
								</span>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
			<p class="pct c-accent">{view.percent}%</p>
			{#if caption}
				<p class="muted">{caption}</p>
			{/if}
			<span class="sr-only">{view.percent} percent{#if caption}. {caption}{/if}</span>
		</div>
	</GraphBody>
</Graph>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.grid {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		user-select: none;
	}

	.wrow {
		display: flex;
		justify-content: center;
		gap: 0.125rem;
	}

	.cell {
		min-width: 1ch;
		text-align: center;
	}

	.pct {
		margin: 0;
	}

	.muted {
		margin: 0;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.c-accent {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.c-frame {
		color: var(--border, oklch(0.6 0 0 / 0.5));
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
