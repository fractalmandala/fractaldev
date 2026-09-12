<script module lang="ts">
	import type { ArtSeg } from '../diagram/ascii';

	/** How a column is painted: a single block, or a fill down to the baseline. */
	export type ScopeMode = 'line' | 'area';

	export interface GraphScopeProps {
		/** Caption on the frame's top edge. */
		title: string;
		/** Series to scroll through. The window loops over it. */
		data: number[];
		/** Visible columns. Default 44. */
		window?: number;
		/** Grid height in rows. Default 6. */
		rows?: number;
		/** Milliseconds between ticks. Default 160. */
		speedMs?: number;
		/** 'line' draws one block per column; 'area' fills down to the baseline. */
		mode?: ScopeMode;
		/** Animate the scroll. Default true. Reduced motion freezes the window. */
		animated?: boolean;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { reveal } from '../frame/motion';

	let {
		title,
		data,
		window: visible = 44,
		rows = 6,
		speedMs = 160,
		mode = 'line',
		animated = true,
		class: className = ''
	}: GraphScopeProps = $props();

	let offset = $state(0);

	const moving = $derived(
		animated &&
			(typeof window === 'undefined' ||
				!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	);

	const cols = $derived(Math.max(1, Math.floor(visible)));
	const gridRows = $derived(Math.max(1, Math.floor(rows)));
	const loop = $derived(Math.max(1, data.length));

	$effect(() => {
		if (!moving) {
			return;
		}

		const timer = window.setInterval(() => {
			offset = (offset + 1) % loop;
		}, speedMs);

		return () => window.clearInterval(timer);
	});

	/** The values currently inside the window, left to right. */
	const values = $derived.by(() => {
		if (data.length === 0) {
			return [];
		}

		return Array.from({ length: cols }, (_, col) => data[(offset + col) % data.length]);
	});

	/** Value to grid row, normalized within the current window. Top row = 0. */
	const points = $derived.by(() => {
		if (values.length === 0) {
			return [];
		}

		const min = Math.min(...values);
		const max = Math.max(...values);
		const span = max - min;
		const bottom = gridRows - 1;

		return values.map((value) => {
			if (span <= 0) {
				return Math.round(bottom / 2);
			}

			return Math.round((1 - (value - min) / span) * bottom);
		});
	});

	/**
	 * rows × cols grid as segment rows. Only the newest (rightmost) column's
	 * top cell takes a class, so each row splits into at most two segments.
	 */
	const art = $derived.by((): ArtSeg[][] => {
		const grid: ArtSeg[][] = [];
		const last = cols - 1;

		for (let row = 0; row < gridRows; row++) {
			const chars: string[] = [];
			let nowAt = -1;

			for (let col = 0; col < cols; col++) {
				const point = points[col];

				if (point === undefined) {
					chars.push(' ');
					continue;
				}

				if (row === point) {
					chars.push('█');

					if (col === last) {
						nowAt = col;
					}
				} else if (mode === 'area' && row > point) {
					chars.push('▒');
				} else {
					chars.push(' ');
				}
			}

			const segs: ArtSeg[] = [];

			if (nowAt > 0) {
				segs.push({ text: chars.slice(0, nowAt).join('') });
			}

			if (nowAt >= 0) {
				segs.push({ text: chars.slice(nowAt).join(''), cls: 'now' });
			} else {
				segs.push({ text: chars.join('') });
			}

			grid.push(segs);
		}

		return grid;
	});
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="scope" use:reveal={{ amount: 0.5 }}>
			<div class="viewport" aria-hidden="true">
				<pre class="art"><code>{#each art as line, i (i)}{#each line as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{#if i < art.length - 1}{'\n'}{/if}{/each}</code></pre>
			</div>
			<span class="sr-only">
				Oscilloscope window of {cols} columns over {data.length} samples, {mode} mode
			</span>
		</div>
	</GraphBody>
</Graph>

<style>
	.scope {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-width: 0;
	}

	.viewport {
		overflow-x: auto;
	}

	.art {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.4;
		color: var(--text-primary, oklch(0.93 0 0));
		white-space: pre;
		user-select: none;
	}

	.now {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
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
