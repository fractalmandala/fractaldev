<script module lang="ts">
	export interface GraphAgniProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title?: string;
		/** Animate the burn. Default true. Reduced motion freezes a mid-burn frame. */
		animated?: boolean;
		/** Show the playback controls. Default true. */
		showControls?: boolean;
		/** Width of the scene in characters. Default 56. */
		cols?: number;
		/** Height of the scene in rows. Default 16. */
		rows?: number;
		/** Milliseconds per simulation step. Default 90. */
		speedMs?: number;
		/** Random decay strength; higher burns out sooner. Default 0.6. */
		cooling?: number;
		/** Seed for the reproducible burn. Default 3. */
		seedNum?: number;
		/** Short caption under the art; the art itself is decorative. */
		label?: string;
		class?: string;
	}

	/** Deterministic mulberry32 PRNG so a seed replays the same burn. */
	function mulberry32(seed: number): () => number {
		let a = seed >>> 0;

		return () => {
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	/** One-time reduced-motion check, for choosing the opening frame only. */
	function prefersReduced(): boolean {
		return (
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	interface Seg {
		text: string;
		cls?: string;
	}

	interface Spark {
		x: number;
		y: number;
		age: number;
	}

	/**
	 * Knob ranges. ROW_MAX doubles as the height the viewport reserves, so the
	 * two can never drift apart and leave the rows slider shifting the page.
	 */
	const COL_MIN = 24;
	const COL_MAX = 96;
	const ROW_MIN = 10;
	const ROW_MAX = 32;
	const SPEED_MIN = 30;
	const SPEED_MAX = 300;
	const COOL_MIN = 0.1;
	const COOL_MAX = 1.2;

	const HOT = 0.75;
	const MID = 0.5;
	const LOW = 0.3;
	const EMBER = 0.12;

	/** Slider position as a percentage, for painting the filled part of the track. */
	function fill(value: number, min: number, max: number): string {
		return `${((value - min) / (max - min)) * 100}%`;
	}

	/** Run-length encode one row of heat into classed segments, never per-cell spans. */
	function heatSegs(row: number[]): Seg[] {
		const segs: Seg[] = [];
		let buf = '';
		let cls: string | undefined;

		for (const heat of row) {
			let ch = ' ';
			let next: string | undefined;

			if (heat >= HOT) {
				ch = '█';
				next = 'hot';
			} else if (heat >= MID) {
				ch = '▓';
			} else if (heat >= LOW) {
				ch = '▒';
				next = 'mid';
			} else if (heat >= EMBER) {
				ch = '░';
				next = 'faint';
			}

			if (next === cls) {
				buf += ch;
			} else {
				if (buf.length > 0) {
					segs.push({ text: buf, cls });
				}

				cls = next;
				buf = ch;
			}
		}

		if (buf.length > 0) {
			segs.push({ text: buf, cls });
		}

		return segs;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';

	let {
		title,
		animated = true,
		showControls = true,
		cols = 56,
		rows = 16,
		speedMs = 90,
		cooling = 0.6,
		seedNum = 3,
		class: className = ''
	}: GraphAgniProps = $props();

	// Live knobs. The props seed them; the controls own them from then on.
	// svelte-ignore state_referenced_locally
	let colsIn = $state(cols);
	// svelte-ignore state_referenced_locally
	let rowsIn = $state(rows);
	// svelte-ignore state_referenced_locally
	let speedIn = $state(speedMs);
	// svelte-ignore state_referenced_locally
	let coolIn = $state(cooling);

	// svelte-ignore state_referenced_locally
	const rand = $derived(mulberry32(seedNum));

	const width = $derived(Math.max(24, colsIn));
	const height = $derived(Math.max(10, rowsIn));

	// The havan kund: a shallow pit at the bottom center. Fire rises from the
	// mouth between the slanted walls; everything above is flame column.
	const mouth = $derived(Math.max(7, Math.round(width * 0.24)));
	const centerX = $derived(Math.floor(width / 2));
	const pitLeft = $derived(centerX - Math.floor(mouth / 2));
	const pitRight = $derived(pitLeft + mouth - 1);
	const pitRow = $derived(height - 2);

	// Flame column narrows toward the top so the burn reads as a tongue, not a wall.
	function coneMask(y: number, x: number): number {
		const flameRows = pitRow;
		const t = 1 - y / flameRows;
		const spread = mouth / 2;
		const allow = spread * (0.4 + 0.6 * (1 - t));
		const dx = Math.abs(x - centerX) / spread;

		if (dx > 1) {
			return 0;
		}

		return dx <= allow / spread ? 1 - 0.3 * dx : 0;
	}

	function initialGrid(): number[][] {
		const grid: number[][] = [];

		for (let y = 0; y < pitRow; y++) {
			grid.push(new Array<number>(width).fill(0));
		}

		for (let x = pitLeft; x <= pitRight; x++) {
			grid[pitRow - 1][x] = 1;
		}

		return grid;
	}

	// Heat climbs from the mouth, shaped by the cone, breathing on the cooling term.
	function stepFlame(grid: number[][], tick: number): number[][] {
		const next: number[][] = [];
		const breath = 1 + 0.3 * Math.sin(tick / 12);

		for (let y = 0; y < pitRow; y++) {
			next.push(new Array<number>(width).fill(0));
		}

		// Optional reads: a knob can resize the scene a frame before the grid
		// is re-seeded, so the row below may be a different width, or absent.
		for (let y = 0; y < pitRow - 1; y++) {
			for (let x = pitLeft - 1; x <= pitRight + 1; x++) {
				const row = grid[y + 1];
				const below = ((row?.[x - 1] ?? 0) + (row?.[x] ?? 0) + (row?.[x + 1] ?? 0)) / 3;

				next[y][x] = Math.max(
					0,
					below * (1 - rand() * coolIn * breath * 0.5) * coneMask(y, x)
				);
			}
		}

		for (let x = pitLeft; x <= pitRight; x++) {
			next[pitRow - 1][x] = 1;
		}

		return next;
	}

	function stepSparks(sparks: Spark[], grid: number[][]): Spark[] {
		const alive: Spark[] = [];

		for (const s of sparks) {
			const y = s.y - 1;
			const x = s.x + (rand() < 0.3 ? (rand() < 0.5 ? -1 : 1) : 0);
			const age = s.age + 1;

			if (y >= 0 && age < height + 2) {
				alive.push({ x, y, age });
			}
		}

		if (sparks.length < 7 && rand() < 0.22) {
			const x = pitLeft + Math.floor(rand() * mouth);
			const y = pitRow - 2;

			if ((grid[pitRow - 1]?.[x] ?? 0) >= 1) {
				alive.push({ x, y, age: 0 });
			}
		}

		return alive;
	}

	// Starts from `animated`; the button owns it from the first press onwards.
	// svelte-ignore state_referenced_locally
	let playing = $state(animated);

	// Reduced motion sets the *opening* state only. Pressing play is explicit
	// consent, so it still runs the burn.
	$effect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		if (query.matches) playing = false;
		const onChange = (e: MediaQueryListEvent) => { if (e.matches) playing = false; };
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	});

	let sim = initialGrid();
	let embers: Spark[] = [];

	// svelte-ignore state_referenced_locally
	const preTicks = animated && !prefersReduced() ? 16 : pitRow * 2 + 6;

	// Just lit when animated; a developed mid-burn when frozen.
	for (let i = 0; i < preTicks; i++) {
		sim = stepFlame(sim, i);
		embers = stepSparks(embers, sim);
	}

	// svelte-ignore state_referenced_locally
	let tick = $state(preTicks);
	// svelte-ignore state_referenced_locally
	let grid = $state<number[][]>(sim);
	// svelte-ignore state_referenced_locally
	let sparks = $state<Spark[]>(embers);

	// Resizing invalidates every cell, so the scene is re-lit and warmed to a
	// developed burn — otherwise a drag of the cols knob shows an empty pit.
	// svelte-ignore state_referenced_locally
	let lastGeometry = `${width}x${height}`;

	$effect(() => {
		const geometry = `${width}x${height}`;

		if (geometry === lastGeometry) {
			return;
		}

		lastGeometry = geometry;

		let next = initialGrid();
		let motes: Spark[] = [];
		const warm = pitRow * 2 + 6;

		for (let i = 0; i < warm; i++) {
			next = stepFlame(next, i);
			motes = stepSparks(motes, next);
		}

		grid = next;
		sparks = motes;
		tick = warm;
	});

	$effect(() => {
		if (!playing) {
			return;
		}

		const timer = window.setInterval(() => {
			grid = stepFlame(grid, tick);
			sparks = stepSparks(sparks, grid);
			tick += 1;
		}, speedIn);

		return () => window.clearInterval(timer);
	});

	const view = $derived.by((): Seg[][] => {
		const out: Seg[][] = [];

		for (let y = 0; y < height; y++) {
			if (y === pitRow - 1 || y === pitRow) {
				// Flame rows: heat segments with the slanted pit walls overlaid.
				const segs: Seg[] = [];
				let buf = '';
				let cls: string | undefined;

				const flush = () => {
					if (buf.length > 0) {
						segs.push({ text: buf, cls });
					}

					buf = '';
				};

				for (let x = 0; x < width; x++) {
					let ch: string;
					let next: string | undefined;

					if (y === pitRow && (x === pitLeft - 1 || x === pitRight + 1)) {
						ch = x === pitLeft - 1 ? '╲' : '╱';
					} else if (x >= pitLeft && x <= pitRight) {
						const heat = y === pitRow ? 1 : grid[y]?.[x] ?? 0;
						const spark = sparks.find((s) => s.x === x && s.y === y);

						if (heat >= HOT) {
							ch = '█';
							next = spark ? 'faint' : 'hot';
						} else if (heat >= MID) {
							ch = '▓';
						} else if (heat >= LOW) {
							ch = '▒';
							next = 'mid';
						} else if (heat >= EMBER) {
							ch = '░';
							next = 'faint';
						} else {
							ch = ' ';
						}
					} else {
						ch = ' ';
					}

					if (next === cls) {
						buf += ch;
					} else {
						flush();
						cls = next;
						buf = ch;
					}
				}

				flush();
				out.push(segs);
			} else if (y === pitRow + 1) {
				// Pit floor line under the mouth.
				const pad = Math.max(0, pitLeft - 1);
				const line = '─'.repeat(Math.min(mouth + 2, width - pad));
				out.push([
					{ text: ' '.repeat(pad) },
					{ text: line, cls: 'pit' },
					{ text: ' '.repeat(Math.max(0, width - pad - line.length)) }
				]);
			} else {
				// Open flame rows, with sparks drifting above.
				const segs: Seg[] = [];
				let buf = '';
				let cls: string | undefined;

				const flush = () => {
					if (buf.length > 0) {
						segs.push({ text: buf, cls });
					}

					buf = '';
				};

				for (let x = 0; x < width; x++) {
					const spark = sparks.find((s) => s.x === x && s.y === y);
					const heat = grid[y]?.[x] ?? 0;
					let ch = ' ';
					let next: string | undefined;

					if (spark) {
						ch = '·';
						next = spark.age < 2 ? 'mid' : 'faint';
					} else if (heat >= HOT) {
						ch = '█';
						next = 'hot';
					} else if (heat >= MID) {
						ch = '▓';
					} else if (heat >= LOW) {
						ch = '▒';
						next = 'mid';
					} else if (heat >= EMBER) {
						ch = '░';
						next = 'faint';
					}

					if (next === cls) {
						buf += ch;
					} else {
						flush();
						cls = next;
						buf = ch;
					}
				}

				flush();
				out.push(segs);
			}
		}

		return out;
	});
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="agni">
			<div class="viewport" style="--agni-reserve:{showControls ? ROW_MAX : rowsIn}">
				<pre class="art" aria-hidden="true"><code>{#each view as line, i (i)}{#each line as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{#if i < view.length - 1}{'\n'}{/if}{/each}</code></pre>
			</div>
			{#if showControls}
				<div class="box controls">
					<div class="buttons">
						<button
							class="button ghost"
							type="button"
							onclick={() => (playing = !playing)}
							aria-label={playing ? 'Pause the flame' : 'Play the flame'}
						>
							<span class="accented">[ </span> {playing ? 'pause' : 'play'} <span class="accented"> ]</span>
						</button>
					</div>
					<div class="knobs">
						<label class="knob box">
							<span class="text-xs tt-u text-muted">cols</span>
							<input
								type="range"
								min={COL_MIN}
								max={COL_MAX}
								step="2"
								style="--fill:{fill(colsIn, COL_MIN, COL_MAX)}"
								bind:value={colsIn}
							/>
						</label>
						<label class="knob box">
							<span class="text-xs tt-u text-muted">rows</span>
							<input
								type="range"
								min={ROW_MIN}
								max={ROW_MAX}
								step="1"
								style="--fill:{fill(rowsIn, ROW_MIN, ROW_MAX)}"
								bind:value={rowsIn}
							/>
						</label>
						<label class="knob box">
							<span class="text-xs tt-u text-muted">speed</span>
							<input
								type="range"
								min={SPEED_MIN}
								max={SPEED_MAX}
								step="10"
								style="--fill:{fill(speedIn, SPEED_MIN, SPEED_MAX)}"
								bind:value={speedIn}
							/>
						</label>
						<label class="knob box">
							<span class="text-xs tt-u text-muted">cooling</span>
							<input
								type="range"
								min={COOL_MIN}
								max={COOL_MAX}
								step="0.05"
								style="--fill:{fill(coolIn, COOL_MIN, COOL_MAX)}"
								bind:value={coolIn}
							/>
						</label>
					</div>
				</div>
			{/if}
		</div>
	</GraphBody>
</Graph>

<style>
	.agni {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		min-width: 0;
		font-size: 0.875rem;
	}

	/*
	 * The scene is bottom-anchored inside a box tall enough for the tallest
	 * row count the knob allows. The pit then sits on a fixed baseline: raising
	 * `rows` fills in sky above the fire instead of pushing the controls — and
	 * the page below them — down. Without controls there is nothing to resize
	 * it, so the box reserves only the rows actually drawn.
	 */
	.viewport {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		overflow-x: auto;
		/* In the centered column the viewport sizes to max-content; cap it so a
		   narrow frame gets an inner scroll instead of the art bleeding out. */
		max-width: 100%;
	}

	.art {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.15;
		color: var(--text-primary, oklch(0.93 0 0));
		white-space: pre;
	}

	.hot {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.mid {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.faint {
		color: var(--text-muted, oklch(0.3 0 0));
	}

	.pit {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
		align-self: stretch;
		padding-top: 0.875rem;
		border-top: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
	}

	.buttons {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.knobs {
		display: grid;
		grid-template-columns: repeat(2, auto);
		gap: 0.35rem 1rem;
	}

	/*
	 * Fully custom track: `accent-color` alone leaves the UA's own bordered
	 * track behind. Going bare means painting the filled portion by hand —
	 * WebKit has no equivalent of ::-moz-range-progress — so `--fill` carries
	 * the value as a percentage and both engines share one gradient.
	 */
	.knob input {
		appearance: none;
		-webkit-appearance: none;
		width: 100%;
		min-width: 0;
		height: 1rem;
		border: 0;
		background: none;
		cursor: pointer;
	}

	.knob input::-webkit-slider-runnable-track {
		height: var(--knob-track);
		border: 0;
		border-radius: 999px;
		background: var(--text-muted);
		background-image: linear-gradient(to right, var(--graph-accent, oklch(0.78 0.17 155)) 0 var(--fill), transparent var(--fill) 100%);
	}

	.knob input::-webkit-slider-thumb {
		appearance: none;
		-webkit-appearance: none;
		width: var(--knob-thumb);
		height: var(--knob-thumb);
		/* Centre the thumb on the thinner track. */
		margin-top: calc((var(--knob-track) - var(--knob-thumb)) / 2);
		border: 0;
		border-radius: 999px;
		background: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.knob input::-moz-range-track {
		height: var(--knob-track);
		border: 0;
		border-radius: 999px;
		background: var(--text-muted);
		background-image: linear-gradient(to right, var(--graph-accent, oklch(0.78 0.17 155)) 0 var(--fill), transparent var(--fill) 100%);
	}

	/* The gradient above already draws the fill; don't paint it twice. */
	.knob input::-moz-range-progress {
		background: transparent;
	}

	.knob input::-moz-range-thumb {
		width: var(--knob-thumb);
		height: var(--knob-thumb);
		border: 0;
		border-radius: 999px;
		background: var(--graph-accent, oklch(0.78 0.17 155));
	}
</style>
