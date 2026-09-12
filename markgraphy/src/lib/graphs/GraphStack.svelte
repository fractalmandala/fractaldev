<script module lang="ts">
	import type { Glyphs } from '../frame/glyphs';
	import type { GraphPalette } from '../frame/tone';

	/** One part of a whole. */
	export interface StackSegment {
		label: string;
		value: number;
	}

	/** One stacked track made of segments. */
	export interface StackRow {
		label: string;
		segments: StackSegment[];
	}

	export interface GraphStackProps {
		title: string;
		rows: StackRow[];
		accent?: string;
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
	import { resolveGlyphs } from '../frame/glyphs';
	import { isDim, isMonoPalette, seriesRole, type ToneRole } from '../frame/tone';
	import { reveal, stagger } from '../frame/motion';

	let {
		title,
		rows,
		accent,
		ticks = 24,
		glyphs,
		palette,
		corner,
		class: className = ''
	}: GraphStackProps = $props();

	const DEFAULT_GLYPHS = ['█', '▓', '▒', '░', '#', '=', '+', '-'];

	interface Piece {
		label: string;
		glyph: string;
		count: number;
		highlighted: boolean;
	}

	function paintRow(
		segments: StackSegment[],
		tickCount: number,
		set: readonly string[],
		accentLabel?: string
	): Piece[] {
		const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
		let left = tickCount;

		return segments.map((segment, index) => {
			const raw = Math.round((segment.value / total) * tickCount);
			const count =
				index === segments.length - 1
					? Math.max(0, left)
					: Math.min(Math.max(0, raw), left);
			left -= count;
			const highlighted = accentLabel
				? segment.label === accentLabel
				: index === 0;

			return {
				label: segment.label,
				glyph: set[index % set.length] ?? '█',
				count,
				highlighted
			};
		});
	}

	const mono = $derived(isMonoPalette(palette));
	const set = $derived(glyphs == null ? DEFAULT_GLYPHS : resolveGlyphs(glyphs));

	const legend = $derived.by(() => {
		const names: string[] = [];

		for (const row of rows) {
			for (const segment of row.segments) {
				if (!names.includes(segment.label)) {
					names.push(segment.label);
				}
			}
		}

		return names.map((label, index) => {
			const highlighted = mono ? (accent ? label === accent : index === 0) : true;

			return {
				label,
				glyph: set[index % set.length] ?? '█',
				role: seriesRole(palette, index),
				dim: isDim(palette, highlighted),
				highlighted
			};
		});
	});

	const view = $derived.by(() =>
		rows.map((row) => {
			const painted = paintRow(row.segments, ticks, set, accent);
			const pieces = painted.flatMap((piece) => {
				const role: ToneRole = seriesRole(palette, legend.findIndex((l) => l.label === piece.label));
				const dim = isDim(palette, mono ? piece.highlighted : true);

				return Array.from({ length: piece.count }, () => ({
					glyph: piece.glyph,
					role,
					dim
				}));
			});

			return {
				label: row.label,
				spoken: `${row.label}: ${row.segments
					.map((segment) => `${segment.label} ${segment.value}`)
					.join(', ')}`,
				pieces
			};
		})
	);
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="col">
			<ul class="tracks" role="list">
				{#each view as row, i (row.label)}
					<li
						class="track-row"
						aria-label={row.spoken}
						use:reveal={{ delay: stagger(i, 40), amount: 0.4 }}
					>
						<span class="label">{row.label}</span>
						<GraphTrack>
							{#each row.pieces as piece}
								<GraphTick>
									<span
										class="g"
										class:c-accent={piece.role === 'accent'}
										class:c-accent2={piece.role === 'accent2'}
										class:c-accent3={piece.role === 'accent3'}
										class:c-fg={piece.role === 'foreground'}
										class:dim={piece.dim}
									>
										{piece.glyph}
									</span>
								</GraphTick>
							{/each}
						</GraphTrack>
					</li>
				{/each}
			</ul>
			<ul class="legend" role="list">
				{#each legend as entry (entry.label)}
					<li class="key" class:dim={entry.dim}>
						<span
							class="g"
							aria-hidden="true"
							class:c-accent={entry.role === 'accent'}
							class:c-accent2={entry.role === 'accent2'}
							class:c-accent3={entry.role === 'accent3'}
							class:c-fg={entry.role === 'foreground'}
						>
							{entry.glyph}
						</span>
						<span class:c-fg={entry.highlighted} class:c-muted={!entry.highlighted}>
							{entry.label}
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
		gap: 1.5rem;
	}

	.tracks {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.track-row {
		display: grid;
		grid-template-columns: 7rem minmax(0, 1fr);
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

	.legend {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		column-gap: 1rem;
		row-gap: 0.25rem;
	}

	.key {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.g {
		display: block;
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

	.c-fg {
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.dim {
		opacity: 0.4;
	}
</style>
