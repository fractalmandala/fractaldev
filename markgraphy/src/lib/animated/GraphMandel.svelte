<script module lang="ts">
	/** ASCII Mandelbrot with a slow cinematic zoom into seahorse valley. */
	export interface GraphMandelProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. */
		title: string;
		/** Columns of the grid. Default 66. */
		cols?: number;
		/** Rows of the grid. Default 20. */
		rows?: number;
		/** Escape count -> glyph, low to high. Keep it ASCII for grid alignment. */
		charset?: string;
		/** Milliseconds per zoom tick. Default 140. */
		speedMs?: number;
		/** Window shrink factor per tick. Default 1.06. */
		zoomPerTick?: number;
		/** Starting iteration budget; grows +2 per tick, capped at 300. Default 90. */
		maxIter?: number;
		/** Start playing on mount. Default true. Reduced motion starts paused. */
		animated?: boolean;
		/** Show the playback controls. Default true. */
		showControls?: boolean;
		/** Character at each corner of the frame. Default "+". */
		corner?: string;
		class?: string;
	}

	/** The classic seahorse valley point the zoom converges toward. */
	const TARGET_X = -0.743643887037151;
	const TARGET_Y = 0.131825904205330;
	const START_X = -0.7;
	const START_Y = 0;
	/** Half of the re span [-2.2, 0.9]. */
	const START_HALF_RE = 1.55;
	const ITER_CAP = 300;
	/** Character cells are roughly twice as tall as they are wide. */
	const CELL_ASPECT = 2;
	/** Glyphs this far from the end of the charset render with the accent 'hot' tint. */
	const HOT_FROM_END = 3;

	/** Iterations before |z| escapes the radius-2 disc; `budget` means inside the set. */
	function escapeCount(re0: number, im0: number, budget: number): number {
		let zr = 0;
		let zi = 0;
		let count = 0;

		while (count < budget) {
			const zr2 = zr * zr;
			const zi2 = zi * zi;

			if (zr2 + zi2 > 4) {
				return count;
			}

			zi = 2 * zr * zi + im0;
			zr = zr2 - zi2 + re0;
			count++;
		}

		return count;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';

	let {
		title,
		cols = 66,
		rows = 20,
		charset = ' .:-=+*#%@',
		speedMs = 140,
		zoomPerTick = 1.06,
		maxIter = 90,
		animated = true,
		showControls = true,
		corner,
		class: className = ''
	}: GraphMandelProps = $props();

	interface ArtSeg {
		text: string;
		cls?: string;
	}

	// svelte-ignore state_referenced_locally
	let cx = $state(START_X);
	let cy = $state(START_Y);
	let halfRe = $state(START_HALF_RE);
	// svelte-ignore state_referenced_locally
	let iters = $state(Math.max(1, maxIter));
	// svelte-ignore state_referenced_locally
	let isPlaying = $state(animated);

	$effect(() => {
		// Reduced motion never auto-plays. Explicit play by the user is still fine.
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		if (query.matches) {
			isPlaying = false;
		}

		const onChange = (event: MediaQueryListEvent) => {
			if (event.matches) {
				isPlaying = false;
			}
		};

		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	});

	$effect(() => {
		if (!isPlaying) {
			return;
		}

		const timer = window.setInterval(tick, Math.max(30, speedMs));

		return () => window.clearInterval(timer);
	});

	function tick(): void {
		const factor = Math.max(1.0001, zoomPerTick);
		// Close the same fraction of the remaining distance to the target each tick,
		// so the seahorse valley point stays at a fixed offset inside the window.
		const drift = 1 - 1 / factor;

		cx += (TARGET_X - cx) * drift;
		cy += (TARGET_Y - cy) * drift;
		halfRe /= factor;
		iters = Math.min(ITER_CAP, iters + 2);
	}

	function handleToggle() {
		isPlaying = !isPlaying;
	}

	function handleReset() {
		cx = START_X;
		cy = START_Y;
		halfRe = START_HALF_RE;
		iters = Math.max(1, maxIter);
	}

	const halfIm = $derived((halfRe * rows * CELL_ASPECT) / cols);
	const zoom = $derived(START_HALF_RE / halfRe);
	const zoomLabel = $derived(zoom >= 100 ? String(Math.round(zoom)) : zoom.toFixed(1));
	const iterLabel = $derived(String(iters).padStart(3, '0'));

	// Every row is padded to exactly `cols` cells so the grid width never shifts.
	const art = $derived.by((): ArtSeg[][] => {
		const glyphs = Array.from(charset.length > 0 ? charset : ' ');
		const last = glyphs.length - 1;
		const hotFloor = Math.max(0, glyphs.length - HOT_FROM_END);
		const out: ArtSeg[][] = [];

		for (let r = 0; r < rows; r++) {
			const im0 = cy + halfIm - ((r + 0.5) / rows) * 2 * halfIm;
			const row: ArtSeg[] = [];
			let buf = '';
			let hot = false;

			const flush = () => {
				if (buf.length > 0) {
					row.push(hot ? { text: buf, cls: 'hot' } : { text: buf });
					buf = '';
				}
			};

			for (let c = 0; c < cols; c++) {
				const re0 = cx - halfRe + ((c + 0.5) / cols) * 2 * halfRe;
				const count = escapeCount(re0, im0, iters);
				const idx = Math.min(last, Math.floor((count / iters) * glyphs.length));
				const isHot = idx >= hotFloor;

				if (isHot !== hot) {
					flush();
					hot = isHot;
				}

				buf += glyphs[idx] ?? ' ';
			}

			flush();
			out.push(row);
		}

		return out;
	});
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="mandel">
			<div class="viewport">
				<pre class="art"><code>{#each art as line, i (i)}{#each line as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{#if i < art.length - 1}{'\n'}{/if}{/each}</code></pre>
			</div>

			<p class="caption">zoom {zoomLabel}x · iter {iterLabel}</p>

			{#if showControls}
				<div class="controls">
					<div class="buttons">
						<button
							class="ctrl primary"
							type="button"
							onclick={handleToggle}
							aria-label={isPlaying ? 'Pause zoom' : 'Play zoom'}
						>
							{isPlaying ? '❚❚ pause' : '▶ play'}
						</button>
						<button class="ctrl" type="button" onclick={handleReset} aria-label="Reset zoom">
							reset
						</button>
					</div>
				</div>
			{/if}
		</div>
	</GraphBody>
</Graph>

<style>
	.mandel {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		min-width: 0;
		font-size: 0.875rem;
	}

	.viewport {
		overflow-x: auto;
	}

	.art {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.2;
		color: var(--text-secondary, oklch(0.62 0 0));
		white-space: pre;
	}

	.hot {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.caption {
		margin: 0;
		font-size: 0.75rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
		padding-top: 0.875rem;
		border-top: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
	}

	.buttons {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.ctrl {
		padding: 0.25rem 0.6rem;
		font-size: 0.75rem;
		color: var(--text-secondary, oklch(0.62 0 0));
		background: none;
		border: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
		border-radius: 0;
		cursor: pointer;
	}

	.ctrl:hover {
		color: var(--text-primary, oklch(0.93 0 0));
		border-color: var(--text-secondary, oklch(0.62 0 0));
	}

	.primary {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		border-color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}
</style>
