<script module lang="ts">
	import type { Glyphs } from '../frame/glyphs';
	import type { GraphPalette, ToneRole } from '../frame/tone';

	export interface BarSeries {
		label: string;
		values: number[];
		size?: 'sm' | 'lg';
	}

	export interface GraphBarsProps {
		title: string;
		from: BarSeries;
		to: BarSeries;
		processor?: string;
		glyphs?: Glyphs;
		palette?: GraphPalette;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import GraphArrow from '../frame/GraphArrow.svelte';
	import { trackMarks } from '../frame/glyphs';
	import { toneRole } from '../frame/tone';
	import { reveal, stagger } from '../frame/motion';

	let {
		title,
		from,
		to,
		processor,
		glyphs,
		palette,
		corner,
		class: className = ''
	}: GraphBarsProps = $props();

	const marks = $derived(trackMarks(glyphs));
	const fromHeight = $derived(from.size === 'lg' ? 8 : 5);
	const toHeight = $derived(to.size === 'lg' ? 8 : 5);
	const fromRole = $derived(toneRole(palette, 'secondary'));
	const spoken = $derived(
		`${from.label} to ${to.label}${processor ? ` via ${processor}` : ''}`
	);
</script>

{#snippet miniBars(values: number[], height: number, base: number, tone: 'accent' | 'muted')}
	{@const onRole: ToneRole =
		tone === 'accent' ? toneRole(palette, 'primary') : toneRole(palette, 'secondary')}
	<div class="bars" aria-hidden="true">
		{#each values as value, i (i)}
			{@const max = Math.max(...values, 1)}
			{@const level = Math.round((value / max) * (height - 1))}
			<span class="col" use:reveal={{ delay: base + stagger(i, 30) }}>
				{#each Array.from({ length: height }) as _, row (row)}
					{@const fromBottom = height - 1 - row}
					{@const on = fromBottom <= level}
					<span
						class="cell"
						class:off={!on}
						class:c-accent={on && onRole === 'accent'}
						class:c-accent2={on && onRole === 'accent2'}
						class:c-muted={on && onRole === 'muted'}>{on ? marks.fill : ' '}</span>
				{/each}
			</span>
		{/each}
	</div>
{/snippet}

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="flow">
			<div class="group">
				{@render miniBars(from.values, fromHeight, 40, 'muted')}
				<p
					class="label"
					class:c-muted={fromRole === 'muted'}
					class:c-accent2={fromRole === 'accent2'}>{from.label}</p>
			</div>

			<div class="mid">
				<GraphArrow />
				{#if processor}
					<span>{processor}</span>
				{/if}
				<GraphArrow />
			</div>

			<div class="group">
				{@render miniBars(to.values, toHeight, 160, 'accent')}
				<p class="label c-fg">{to.label}</p>
			</div>
		</div>
		<span class="sr-only">{spoken}</span>
	</GraphBody>
</Graph>

<style>
	.flow {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	@media (min-width: 640px) {
		.flow {
			flex-direction: row;
			align-items: flex-end;
			justify-content: center;
			gap: 2rem;
		}
	}

	.group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.bars {
		display: flex;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.col {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		width: 1ch;
	}

	.cell {
		height: 1em;
		width: 100%;
		text-align: center;
	}

	.off {
		color: transparent;
	}

	.mid {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	@media (max-width: 639.98px) {
		.mid {
			transform: rotate(90deg);
		}
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
