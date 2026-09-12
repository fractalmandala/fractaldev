<script module lang="ts">
	import type { Glyphs } from '../frame/glyphs';
	import type { GraphPalette } from '../frame/tone';

	/** One stage of the funnel. */
	export interface FunnelStep {
		label: string;
		value: number;
		display?: string;
	}

	export interface GraphFunnelProps {
		title: string;
		steps: FunnelStep[];
		ticks?: number;
		stage?: string;
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
	import { trackMarks } from '../frame/glyphs';
	import { isDim, isMonoPalette, seriesRole, type ToneRole } from '../frame/tone';
	import { reveal, stagger } from '../frame/motion';

	let {
		title,
		steps,
		ticks = 20,
		stage,
		glyphs,
		palette,
		corner,
		class: className = ''
	}: GraphFunnelProps = $props();

	const mono = $derived(isMonoPalette(palette));
	const max = $derived(Math.max(...steps.map((step) => step.value), 1));
	const head = $derived(steps[0]?.value ?? 1);
	const marks = $derived(trackMarks(glyphs));

	const view = $derived.by(() =>
		steps.map((step, index) => {
			const width = Math.max(1, Math.round((step.value / max) * ticks));
			const percent = Math.round((step.value / head) * 100);
			const focused = Boolean(stage) && step.label === stage;
			const receded = Boolean(stage) && !focused;
			const role: ToneRole = mono ? 'accent' : seriesRole(palette, index);

			const cells = Array.from({ length: ticks }, (_, cell) => {
				const filled = cell < width;

				return {
					glyph: filled ? marks.fill : marks.empty,
					role: filled ? role : ('empty' as const)
				};
			});

			return {
				label: step.label,
				value: step.display ?? step.value.toLocaleString(),
				percent: index === 0 ? '' : `${percent}%`,
				dim: isDim(palette, !receded),
				cells
			};
		})
	);

	const spoken = $derived(
		steps
			.map((step) => `${step.label} ${step.display ?? step.value.toLocaleString()}`)
			.join(', ')
	);
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<ol class="steps" role="list">
			{#each view as step, i (step.label)}
				<li
					class="step"
					class:dim={step.dim}
					use:reveal={{ delay: stagger(i, 40), amount: 0.4 }}
				>
					<span class="label">{step.label}</span>
					<GraphTrack>
						{#each step.cells as cell}
							<GraphTick>
								<span
									class="g"
									class:c-accent={cell.role === 'accent'}
									class:c-accent2={cell.role === 'accent2'}
									class:c-accent3={cell.role === 'accent3'}
									class:c-frame={cell.role === 'empty'}
								>
									{cell.glyph}
								</span>
							</GraphTick>
						{/each}
					</GraphTrack>
					<span class="value">{step.value}</span>
					<span class="pct muted">{step.percent}</span>
				</li>
			{/each}
		</ol>
		<span class="sr-only">{spoken}</span>
	</GraphBody>
</Graph>

<style>
	.steps {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.step {
		display: grid;
		grid-template-columns: 7rem minmax(0, 1fr) 8ch 4ch;
		column-gap: 1rem;
		align-items: center;
	}

	.label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.g {
		display: block;
	}

	.value {
		text-align: right;
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.pct {
		text-align: right;
	}

	.muted {
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

	.dim {
		opacity: 0.4;
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
