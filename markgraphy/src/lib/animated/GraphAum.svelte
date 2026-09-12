<script module lang="ts">
	export interface GraphAumProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Animate the ink-in and resonance. Default true. Reduced motion freezes a settled frame. */
		animated?: boolean;
		/** Width of the scene in characters; at least 46 so the figure fits. Default 56. */
		cols?: number;
		/** Height of the scene in rows. Default 22. */
		rows?: number;
		/** Milliseconds per tick. Default 110. */
		speedMs?: number;
		/** Seed offsets the resonance wave along the stroke. Default 7. */
		seedNum?: number;
		/** Short caption under the art; the art itself is decorative. */
		label?: string;
		class?: string;
	}

	// The figure is drawn from five stroke polylines in paint order: bindu,
	// crescent, the two humps with the tail, and the om loop. It is rasterized
	// once at module load; every instance shares the same cell order.
	// The art box is pre-widened (~1.8x) because terminal cells are ~2x taller
	// than wide; on screen the figure reads round.
	const ART_W = 44;
	const ART_H = 22;

	const STROKES: number[][][] = [
		// bindu — the dot above
		[[32, 0]],
		// crescent (chandra) — shallow cup opening up
		[
			[25, 2],
			[30, 3],
			[36, 3],
			[41, 2]
		],
		// upper hump: tip at upper-left, arc right, return to the cusp
		[
			[7, 8],
			[14, 5],
			[23, 5],
			[31, 7],
			[29, 10],
			[22, 12],
			[13, 12]
		],
		// lower hump + tail: bulge right, descend, curl left along the bottom
		[
			[13, 12],
			[23, 12],
			[32, 14],
			[36, 17],
			[34, 19],
			[27, 21],
			[14, 21],
			[5, 20]
		],
		// the om loop — small circle hanging at the left, painted last
		[
			[9, 13],
			[4, 12],
			[0, 14],
			[2, 17],
			[5, 18],
			[9, 16],
			[9, 14],
			[7, 13]
		]
	];

	interface InkCell {
		x: number;
		y: number;
		/** Paint order along the strokes; drives the ink-in and the wave. */
		s: number;
	}

	function rasterizeStrokes(): InkCell[] {
		const seen = new Set<number>();
		const cells: InkCell[] = [];
		let s = 0;

		for (const pts of STROKES) {
			for (let i = 0; i < pts.length - 1; i++) {
				const [x0, y0] = pts[i] as [number, number];
				const [x1, y1] = pts[i + 1] as [number, number];
				const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 4;

				for (let t = 0; t <= steps; t++) {
					const x = Math.round(x0 + ((x1 - x0) * t) / steps);
					const y = Math.round(y0 + ((y1 - y0) * t) / steps);
					const key = y * ART_W + x;

					if (x >= 0 && x < ART_W && y >= 0 && y < ART_H && !seen.has(key)) {
						seen.add(key);
						cells.push({ x, y, s });
						s += 1;
					}
				}
			}
		}

		return cells;
	}

	const INK_CELLS = rasterizeStrokes();
	const INK_MAP = new Map<number, number>(
		INK_CELLS.map((cell) => [cell.y * ART_W + cell.x, cell.s])
	);
	const INK_TOTAL = INK_CELLS.length;

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
		cols = 56,
		rows = 22,
		speedMs = 110,
		seedNum = 7,
		label = 'the primordial vibration',
		class: className = ''
	}: GraphAumProps = $props();

	// svelte-ignore state_referenced_locally
	const width = Math.max(46, cols);
	// svelte-ignore state_referenced_locally
	const height = Math.max(ART_H, rows);
	const offsetX = Math.floor((width - ART_W) / 2);
	const offsetY = Math.floor((height - ART_H) / 2);

	const inkTicks = 46;
	const waveSpeed = 2;
	const waveGap = 44;
	const waveLength = INK_TOTAL + waveGap;

	// svelte-ignore state_referenced_locally
	const seedPhase = (((seedNum * 7) % waveLength) + waveLength) % waveLength;

	// svelte-ignore state_referenced_locally
	const initialTick = animated
		? inkTicks + Math.floor((waveLength * 0.4) / waveSpeed)
		: inkTicks;

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

	const view = $derived.by((): Seg[][] => {
		const reveal = Math.min(INK_TOTAL, Math.floor((tick / inkTicks) * INK_TOTAL));
		const wavePos =
			reveal >= INK_TOTAL
				? (seedPhase + (tick - inkTicks) * waveSpeed) % waveLength
				: -1;
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
				const ax = x - offsetX;
				const ay = y - offsetY;
				const s = ax >= 0 && ax < ART_W && ay >= 0 && ay < ART_H
					? INK_MAP.get(ay * ART_W + ax)
					: undefined;
				let ch = ' ';
				let next: string | undefined;

				if (s !== undefined) {
					if (reveal < INK_TOTAL) {
						// Wet ink: freshly drawn cells glow, then settle to the foreground.
						if (s < reveal) {
							ch = '█';

							if (reveal - s <= 6) {
								next = 'hot';
							}
						}
					} else {
						// Resonance: one crest travels the stroke order and rests.
						const d = (wavePos - s + waveLength) % waveLength;

						ch = '█';

						if (d <= 3) {
							next = 'hot';
						} else if (d <= 12) {
							next = 'mid';
						}
					}
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
		<div class="aum">
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
	.aum {
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

	.caption {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}
</style>
