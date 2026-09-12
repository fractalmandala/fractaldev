<script module lang="ts">
	import type { Glyphs } from '../frame/glyphs';
	import type { GraphPalette } from '../frame/tone';

	/** Tasks on a shared character track: spans positioned via --start/--span. */
	export interface GanttItem {
		label: string;
		start: number;
		end: number;
		accent?: boolean;
		complete?: number;
	}

	export interface GraphGanttProps {
		title: string;
		items: GanttItem[];
		ticks?: string[];
		columns?: number;
		stage?: string;
		progress?: number;
		glyphs?: Glyphs;
		palette?: GraphPalette;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { clamp01, trackMarks } from '../frame/glyphs';
	import { isDim, toneRole } from '../frame/tone';
	import type { ToneRole } from '../frame/tone';
	import { reveal, stagger } from '../frame/motion';

	let {
		title,
		items,
		ticks,
		columns = 24,
		stage,
		progress,
		glyphs,
		palette,
		corner,
		class: className = ''
	}: GraphGanttProps = $props();

	const marks = $derived(trackMarks(glyphs));
	const playhead = $derived(
		progress == null ? null : Math.round(clamp01(progress) * (columns - 1))
	);
	const cols = $derived(Array.from({ length: columns }, (_, index) => index));

	const view = $derived(
		items.map((entry) => {
			const start = Math.round(clamp01(entry.start) * columns);
			const end = Math.max(start + 1, Math.round(clamp01(entry.end) * columns));
			const span = end - start;
			const done = Math.round(clamp01(entry.complete ?? 1) * span);
			const focused = stage ? entry.label === stage : Boolean(entry.accent);
			const dim = Boolean(stage) && !focused;
			const spoken = `${entry.label} from ${Math.round(entry.start * 100)}% to ${Math.round(
				entry.end * 100
			)}%${entry.complete != null ? `, ${Math.round(entry.complete * 100)}% complete` : ''}`;
			const bar = Array.from({ length: span }, (_, index) => {
				const filled = index < done;
				return {
					glyph: filled ? marks.fill : marks.rest,
					role: (
						filled
							? focused
								? toneRole(palette, 'primary')
								: 'foreground'
							: toneRole(palette, 'secondary')
					) as ToneRole
				};
			});
			return { entry, start, span, done, focused, dim, spoken, bar };
		})
	);
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="gantt">
			{#if playhead != null}
				<div class="rowcols">
					<span class="spacer"></span>
					<span class="track" aria-hidden="true" style:--cols={columns}>
						<span class="marker c-accent" style:--pos={playhead}>▾</span>
					</span>
				</div>
			{/if}
			<ul class="items" role="list">
				{#each view as item, i (item.entry.label)}
					<li
						class="row"
						class:dim={isDim(palette, !item.dim)}
						aria-label={item.spoken}
						use:reveal={{ delay: stagger(i, 50), amount: 0.4 }}
					>
						<span class="label" class:c-accent={item.focused} class:c-fg={!item.focused}>
							{item.entry.label}
						</span>
						<span class="track" aria-hidden="true" style:--cols={columns}>
							{#each cols as c (c)}
								<span class="cell">
									{c >= item.start && c < item.start + item.span ? '' : marks.empty}
								</span>
							{/each}
							<span class="bar" style:--start={item.start + 1} style:--span={item.span}>
								{#each item.bar as cell, index (index)}
									<span
										class="bcell"
										class:c-accent={cell.role === 'accent'}
										class:c-fg={cell.role === 'foreground'}
										class:c-muted={cell.role === 'muted'}
										class:c-accent2={cell.role === 'accent2'}
									>
										{cell.glyph}
									</span>
								{/each}
							</span>
						</span>
					</li>
				{/each}
			</ul>
			{#if ticks && ticks.length > 0}
				<div class="rowcols">
					<span class="spacer"></span>
					<div class="ticks">
						{#each ticks as tick (tick)}
							<span>{tick}</span>
						{/each}
					</div>
				</div>
			{/if}
			<span class="sr-only">{items.length} tasks</span>
		</div>
	</GraphBody>
</Graph>

<style>
	.gantt {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.rowcols {
		display: grid;
		grid-template-columns: 7rem minmax(0, 1fr);
		align-items: center;
		column-gap: 1rem;
	}

	.spacer {
		min-width: 0;
	}

	.items {
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		list-style: none;
	}

	.row {
		display: grid;
		grid-template-columns: 7rem minmax(0, 1fr);
		align-items: center;
		column-gap: 1rem;
	}

	.row.dim {
		opacity: 0.4;
	}

	.label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.track {
		position: relative;
		display: flex;
		width: 100%;
		min-width: 0;
		user-select: none;
	}

	.cell {
		min-width: 1ch;
		flex: 1 1 0%;
		text-align: center;
		color: var(--border, oklch(0.6 0 0 / 0.5));
	}

	.bar {
		position: absolute;
		top: 0;
		bottom: 0;
		left: calc((var(--start) - 1) * 100% / var(--cols));
		width: calc(var(--span) * 100% / var(--cols));
		display: flex;
	}

	.bcell {
		min-width: 0;
		flex: 1 1 0%;
		text-align: center;
	}

	.marker {
		position: absolute;
		top: 0;
		left: calc((var(--pos) + 0.5) * 100% / var(--cols));
		transform: translateX(-50%);
	}

	.ticks {
		display: flex;
		justify-content: space-between;
		color: var(--text-secondary, oklch(0.62 0 0));
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
