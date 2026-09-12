<script module lang="ts">
	export interface GraphGangaProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Animate the flow and the floating diya. Default true. Reduced motion freezes a frame mid-flow. */
		animated?: boolean;
		/** Width of the scene in characters. Default 60. */
		cols?: number;
		/** Height of the scene in rows. Default 18. */
		rows?: number;
		/** Milliseconds per tick. Default 110. */
		speedMs?: number;
		/** Seed for the flow pattern and the diya's vertical bob. Default 17. */
		seedNum?: number;
		/** Short caption under the art; the art itself is decorative. */
		label?: string;
		class?: string;
	}

	/** Deterministic mulberry32 PRNG so a seed replays the same flow. */
	function mulberry32(seed: number): () => number {
		let a = seed >>> 0;

		return () => {
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	interface Seg {
		text: string;
		cls?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';

	let {
		title,
		animated = true,
		cols = 60,
		rows = 18,
		speedMs = 110,
		seedNum = 17,
		label = 'the descent',
		class: className = ''
	}: GraphGangaProps = $props();

	// svelte-ignore state_referenced_locally
	const width = Math.max(28, cols);
	// svelte-ignore state_referenced_locally
	const height = Math.max(10, rows);
	const aspect = 2.1;

	// svelte-ignore state_referenced_locally
	const rand = $derived(mulberry32(seedNum));

	// Three flow lines, evenly spaced vertically.
	const lineYs = [Math.floor(height * 0.25), Math.floor(height * 0.5), Math.floor(height * 0.75)];

	// Each line is a stepped polyline. We build it once: horizontal segments
	// separated by a 1-row step down. Steps are at the same x positions on every
	// line (so the rivers cascade in a rhythm), but the starting y differs.
	interface Line {
		cells: { x: number; y: number; step: boolean }[];
		startY: number;
	}

	// svelte-ignore state_referenced_locally
	const lines: Line[] = lineYs.map((startY) => {
		const cells: Line['cells'] = [];
		const xStart = 3;
		const xEnd = width - 3;
		const numSteps = 2; // each line steps down twice
		const segLen = Math.floor((xEnd - xStart) / (numSteps + 1));
		let x = xStart;
		let y = startY;
		const maxY = Math.min(height - 2, startY + numSteps);

		for (let s = 0; s <= numSteps; s++) {
			// Horizontal segment
			for (let dx = 0; dx < segLen && x + dx < xEnd; dx++) {
				cells.push({ x: x + dx, y, step: false });
			}
			x += segLen;

			// Step down (a diagonal cell + the cell one row below).
			if (s < numSteps && y < maxY) {
				cells.push({ x, y, step: true });
				cells.push({ x, y: y + 1, step: true });
				y += 1;
			}
		}

		return { cells, startY };
	});

	// The diya rides the bottom line; its position advances with the tick.
	// svelte-ignore state_referenced_locally
	const diyaLine = lines[2]!; // bottom line
	// svelte-ignore state_referenced_locally
	const diyaPathLen = diyaLine.cells.filter((c) => !c.step).length;
	// svelte-ignore state_referenced_locally
	const diyaBobAmp = 0.35; // vertical drift in rows
	// svelte-ignore state_referenced_locally
	const diyaBobPhase = rand() * 6.2832;

	// svelte-ignore state_referenced_locally
	const initialTick = animated ? Math.floor(diyaPathLen * 0.3) : Math.floor(diyaPathLen * 0.5);

	// svelte-ignore state_referenced_locally
	let tick = $state(initialTick);

	const moving = $derived(
		animated &&
			(typeof window === 'undefined' ||
				!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	);

	$effect(() => {
		if (!moving) {
			return;
		}

		const timer = window.setInterval(() => {
			tick += 1;
		}, speedMs);

		return () => window.clearInterval(timer);
	});

	// Build a cell map for the diya's flame. The diya rides the bottom line at
	// the cell whose path-index == tick mod diyaPathLen. The flame hovers above
	// with a slow vertical bob.
	const diyaRow = $derived(() => {
		const idx = ((tick % diyaPathLen) + diyaPathLen) % diyaPathLen;
		// Find the idx-th non-step cell along the bottom line.
		let count = 0;
		for (const c of diyaLine.cells) {
			if (c.step) continue;
			if (count === idx) return c;
			count += 1;
		}
		return diyaLine.cells[0]!;
	});

	const view = $derived.by((): Seg[][] => {
		// Per-line flow pattern: a moving wave so the water "flows" downstream.
		function flowGlyph(lineIdx: number, pathIdx: number, tick: number): { ch: string; cls: string | undefined } {
			// Phase offset per line so the three rivers don't move in lockstep.
			const phase = (pathIdx * 0.35 - tick * 0.25 + lineIdx * 1.7) % (Math.PI * 2);
			const v = 0.5 + 0.5 * Math.sin(phase);
			if (v > 0.78) {
				return { ch: '▓', cls: 'mid' };
			}
			if (v > 0.4) {
				return { ch: '▒', cls: 'faint' };
			}
			return { ch: '░', cls: 'faint' };
		}

		// Build a map of flow cells: key y*width+x -> glyph.
		const flowMap = new Map<number, { ch: string; cls: string | undefined }>();

		lines.forEach((line, lineIdx) => {
			let pathIdx = 0;
			for (const cell of line.cells) {
				if (cell.step) {
					// Step cell: a single `╲` glyph (faint) — the cascade stair.
					const key = cell.y * width + cell.x;
					flowMap.set(key, { ch: '╲', cls: 'faint' });
				} else {
					const g = flowGlyph(lineIdx, pathIdx, tick);
					const key = cell.y * width + cell.x;
					flowMap.set(key, g);
					pathIdx += 1;
				}
			}
		});

		// Diya position and flame cells.
		const d = diyaRow();
		const bob = Math.round(diyaBobAmp * Math.sin(tick * 0.18 + diyaBobPhase));
		const dx = d.x;
		const dy = d.y + bob; // can drift up by 1
		const flame = [
			{ x: dx, y: dy - 1, ch: '║', cls: 'mid' as string | undefined }, // wick
			{ x: dx, y: dy - 2, ch: '▒', cls: 'faint' as string | undefined }, // mid
			{ x: dx, y: dy - 3, ch: '░', cls: 'faint' as string | undefined } // tip
		];
		const hotFlame = { x: dx, y: dy - 2, ch: '▓', cls: 'mid' as string | undefined };

		const out: Seg[][] = [];

		for (let y = 0; y < height; y++) {
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
				let ch = ' ';
				let next: string | undefined;

				const f = flowMap.get(y * width + x);
				if (f) {
					ch = f.ch;
					next = f.cls;
				}

				// Flame overrides flow where the diya sits.
				for (const fc of flame) {
					if (fc.x === x && fc.y === y) {
						ch = fc.ch;
						next = fc.cls;
						break;
					}
				}
				if (hotFlame.x === x && hotFlame.y === y) {
					ch = hotFlame.ch;
					next = 'hot';
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

		return out;
	});
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="ganga">
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
	.ganga {
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
