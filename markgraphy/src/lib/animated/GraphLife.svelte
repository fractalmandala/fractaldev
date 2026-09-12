<script module lang="ts">
	/** Conway's Game of Life in block glyphs, framed. Alive is accent, the dead leave a faint trail. */
	export interface GraphLifeProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. */
		title: string;
		/** Columns of the board. Default 44. */
		cols?: number;
		/** Rows of the board. Default 14. */
		rows?: number;
		/** Random fill probability when no `seed` is given. Default 0.28. */
		density?: number;
		/** Explicit initial board. Padded/cropped to `cols` x `rows`. */
		seed?: boolean[][];
		/** PRNG seed for the random board, reproducible. Default 7. */
		seedNum?: number;
		/** Milliseconds per generation. Default 220. */
		speedMs?: number;
		/** Start playing on mount. Default true. Reduced motion starts paused. */
		animated?: boolean;
		/** Show the playback controls. Default true. */
		showControls?: boolean;
		/** Character at each corner of the frame. Default "+". */
		corner?: string;
		class?: string;
	}

	/** Deterministic PRNG so `seedNum` reproduces the same board. */
	function mulberry32(seedValue: number): () => number {
		let a = seedValue >>> 0;
		return () => {
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';

	let {
		title,
		cols = 44,
		rows = 14,
		density = 0.28,
		seed,
		seedNum = 7,
		speedMs = 220,
		animated = true,
		showControls = true,
		corner,
		class: className = ''
	}: GraphLifeProps = $props();

	interface ArtSeg {
		text: string;
		cls?: string;
	}

	function initialBoard(): boolean[][] {
		if (seed) {
			return Array.from({ length: rows }, (_, r) =>
				Array.from({ length: cols }, (_, c) => seed[r]?.[c] === true)
			);
		}

		const rng = mulberry32(seedNum);

		return Array.from({ length: rows }, () => Array.from({ length: cols }, () => rng() < density));
	}

	function emptyGrid(): boolean[][] {
		return Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));
	}

	function emptyTrail(): number[][] {
		return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
	}

	// svelte-ignore state_referenced_locally
	let grid = $state(initialBoard());
	// svelte-ignore state_referenced_locally
	let trail = $state(emptyTrail());
	let gen = $state(0);
	// svelte-ignore state_referenced_locally
	let isPlaying = $state(animated);

	$effect(() => {
		// Reduced motion never auto-plays. Explicit play/step by the user is still fine.
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

		const timer = window.setInterval(step, Math.max(30, speedMs));

		return () => window.clearInterval(timer);
	});

	function step(): void {
		const nextGrid = emptyGrid();
		const nextTrail = emptyTrail();

		for (let r = 0; r < rows; r++) {
			const up = (r - 1 + rows) % rows;
			const down = (r + 1) % rows;

			for (let c = 0; c < cols; c++) {
				const left = (c - 1 + cols) % cols;
				const right = (c + 1) % cols;
				const neighbors =
					(grid[up][left] ? 1 : 0) +
					(grid[up][c] ? 1 : 0) +
					(grid[up][right] ? 1 : 0) +
					(grid[r][left] ? 1 : 0) +
					(grid[r][right] ? 1 : 0) +
					(grid[down][left] ? 1 : 0) +
					(grid[down][c] ? 1 : 0) +
					(grid[down][right] ? 1 : 0);

				const wasAlive = grid[r][c];
				const lives = wasAlive ? neighbors === 2 || neighbors === 3 : neighbors === 3;
				nextGrid[r][c] = lives;

				if (wasAlive && !lives) {
					nextTrail[r][c] = 2;
				} else if (!lives) {
					nextTrail[r][c] = Math.max(0, trail[r][c] - 1);
				}
			}
		}

		grid = nextGrid;
		trail = nextTrail;
		gen += 1;
	}

	function handleToggle() {
		isPlaying = !isPlaying;
	}

	function handleStep() {
		step();
	}

	function handleReset() {
		grid = initialBoard();
		trail = emptyTrail();
		gen = 0;
	}

	const pop = $derived(grid.flat().filter((cell) => cell).length);
	const genLabel = $derived(String(gen).padStart(3, '0'));
	const popLabel = $derived(String(pop).padStart(3, '0'));

	// Every row is padded to exactly `cols` cells so the grid width never shifts.
	const art = $derived.by((): ArtSeg[][] => {
		const out: ArtSeg[][] = [];

		for (let r = 0; r < rows; r++) {
			const segs: ArtSeg[] = [];
			let buf = '';
			let mode: 'plain' | 'on' | 'trail' = 'plain';

			const flush = () => {
				if (buf.length > 0) {
					segs.push(mode === 'plain' ? { text: buf } : { text: buf, cls: mode });
					buf = '';
				}
			};

			for (let c = 0; c < cols; c++) {
				const next = grid[r][c] ? 'on' : trail[r][c] > 0 ? 'trail' : 'plain';

				if (next !== mode) {
					flush();
					mode = next;
				}

				buf += grid[r][c] ? '█' : trail[r][c] > 0 ? '▒' : ' ';
			}

			flush();
			out.push(segs);
		}

		return out;
	});
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="life">
			<div class="viewport">
				<pre class="art"><code>{#each art as line, i (i)}{#each line as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{#if i < art.length - 1}{'\n'}{/if}{/each}</code></pre>
			</div>

			<p class="caption">gen {genLabel} · pop {popLabel}</p>

			{#if showControls}
				<div class="controls">
					<div class="buttons">
						<button
							class="ctrl primary"
							type="button"
							onclick={handleToggle}
							aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
						>
							{isPlaying ? '❚❚ pause' : '▶ play'}
						</button>
						<button class="ctrl" type="button" onclick={handleStep} aria-label="Advance one generation">
							step >
						</button>
						<button class="ctrl" type="button" onclick={handleReset} aria-label="Reset simulation">
							reset
						</button>
					</div>
				</div>
			{/if}
		</div>
	</GraphBody>
</Graph>

<style>
	.life {
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
		color: var(--text-muted, oklch(0.3 0 0));
		white-space: pre;
	}

	.on {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.trail {
		color: var(--text-muted, oklch(0.3 0 0));
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
