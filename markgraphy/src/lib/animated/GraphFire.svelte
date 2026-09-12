<script module lang="ts">
	export interface GraphFireProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Animate the burn. Default true. Reduced motion freezes a mid-burn frame. */
		animated?: boolean;
		/** Width of the fire in characters. Default 60. */
		cols?: number;
		/** Height of the fire in rows. Default 14. */
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

	const HOT = 0.75;
	const MID = 0.5;
	const LOW = 0.3;
	const EMBER = 0.12;

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
		cols = 60,
		rows = 14,
		speedMs = 90,
		cooling = 0.6,
		seedNum = 3,
		label = 'simulated fire',
		class: className = ''
	}: GraphFireProps = $props();

	// svelte-ignore state_referenced_locally
	const rand = $derived(mulberry32(seedNum));
	// svelte-ignore state_referenced_locally
	const width = Math.max(1, cols);
	// svelte-ignore state_referenced_locally
	const height = Math.max(1, rows);

	function initialGrid(): number[][] {
		const grid: number[][] = [];

		for (let y = 0; y < height; y++) {
			grid.push(new Array<number>(width).fill(0));
		}

		for (let x = 0; x < width; x++) {
			grid[height - 1][x] = 1;
		}

		return grid;
	}

	/** Each cell takes heat from below minus random cooling; the base row stays max. */
	function stepFire(grid: number[][]): number[][] {
		const next: number[][] = [];

		for (let y = 0; y < height; y++) {
			next.push(new Array<number>(width).fill(0));
		}

		for (let y = 0; y < height - 1; y++) {
			for (let x = 0; x < width; x++) {
				const below =
					(grid[y + 1][(x - 1 + width) % width] +
						grid[y + 1][x] +
						grid[y + 1][(x + 1) % width]) /
					3;

				next[y][x] = Math.max(0, below * (1 - rand() * cooling * 0.5));
			}
		}

		for (let x = 0; x < width; x++) {
			next[height - 1][x] = 1;
		}

		return next;
	}

	const moving = $derived(
		animated &&
			(typeof window === 'undefined' ||
				!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	);

	let sim = initialGrid();

	// svelte-ignore state_referenced_locally
	const preTicks = animated && !prefersReduced() ? 4 : height * 2 + 6;

	// Just lit when animated; a developed mid-burn when frozen.
	for (let i = 0; i < preTicks; i++) {
		sim = stepFire(sim);
	}

	// svelte-ignore state_referenced_locally
	let grid = $state<number[][]>(sim);

	$effect(() => {
		if (!moving) {
			return;
		}

		const timer = window.setInterval(() => {
			grid = stepFire(grid);
		}, speedMs);

		return () => window.clearInterval(timer);
	});

	const view = $derived.by((): Seg[][] => grid.map((row) => heatSegs(row)));
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="fire">
			<div class="viewport">
				<pre class="art" aria-hidden="true"><code>{#each view as line, i (i)}{#each line as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{#if i < view.length - 1}{'\n'}{/if}{/each}</code></pre>
			</div>
			{#if label}
				<p class="caption">{label}</p>
			{/if}
		</div>
	</GraphBody>
</Graph>

<style>
	.fire {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
		font-size: 0.875rem;
	}

	.viewport {
		overflow-x: auto;
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

	.caption {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}
</style>
