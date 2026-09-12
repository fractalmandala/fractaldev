<script module lang="ts">
	export interface GraphDiyaProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Animate the lighting and the breathing. Default true. Reduced motion freezes a fully lit row. */
		animated?: boolean;
		/** Width of the scene in characters. Default 60. */
		cols?: number;
		/** Height of the scene in rows. Default 14. */
		rows?: number;
		/** Number of diyas in the row. Default 5. */
		lamps?: number;
		/** Milliseconds per tick. Default 110. */
		speedMs?: number;
		/** Seed for the per-lamp phase and gutter schedule. Default 13. */
		seedNum?: number;
		/** Short caption under the art; the art itself is decorative. */
		label?: string;
		class?: string;
	}

	/** Deterministic mulberry32 PRNG so a seed replays the same lighting. */
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
		rows = 14,
		lamps = 5,
		speedMs = 110,
		seedNum = 13,
		label = 'row of light',
		class: className = ''
	}: GraphDiyaProps = $props();

	// svelte-ignore state_referenced_locally
	const width = Math.max(24, cols);
	// svelte-ignore state_referenced_locally
	const height = Math.max(10, rows);
	// svelte-ignore state_referenced_locally
	const N = Math.max(1, Math.min(11, Math.round(lamps)));

	// svelte-ignore state_referenced_locally
	const rand = $derived(mulberry32(seedNum));

	// Spread lamps evenly across the row.
	const margin = 4;
	const usable = width - margin * 2;

	// svelte-ignore state_referenced_locally
	const lampCenters: number[] = (() => {
		const out: number[] = [];

		if (N === 1) {
			out.push(Math.floor(width / 2));
		} else {
			for (let i = 0; i < N; i++) {
				out.push(margin + Math.round((i * usable) / (N - 1)));
			}
		}

		return out;
	})();

	const litTicks = 8;
	const sequenceTicks = N * litTicks;
	const gutterEvery = 40;

	// svelte-ignore state_referenced_locally
	const lampPhase: number[] = Array.from({ length: N }, () => rand());

	// Gutter schedule: each lamp has its own list of (start, end) gutter intervals.
	// svelte-ignore state_referenced_locally
	const gutterSchedule: { start: number; end: number }[][] = Array.from(
		{ length: N },
		() => {
			const out: { start: number; end: number }[] = [];
			let next = sequenceTicks + 16 + Math.floor(rand() * 24);

			while (next < 1000) {
				out.push({ start: next, end: next + 6 });
				next += gutterEvery + Math.floor(rand() * 28);
			}

			return out;
		}
	);

	function flameIntensity(i: number, tick: number): number {
		const litAt = i * litTicks;
		if (tick < litAt) {
			return 0;
		}

		// Lighting phase
		if (tick < litAt + litTicks) {
			return (tick - litAt) / litTicks;
		}

		// Gutter / relight
		for (const g of gutterSchedule[i]!) {
			if (tick >= g.start && tick < g.end) {
				return Math.max(0, 1 - (tick - g.start) / (g.end - g.start));
			}

			if (tick >= g.end && tick < g.end + litTicks) {
				return (tick - g.end) / litTicks;
			}
		}

		// Breathing — kept tight so the static frame still reads all-lit.
		return 0.92 + 0.08 * Math.sin(tick / 3 + lampPhase[i]! * 6.2832);
	}

	// Pick the cell glyph and class for a single flame slot.
	// row 0 = top tip, row 1 = mid, row 2 = base.
	function flameSlot(row: 0 | 1 | 2, intensity: number): { ch: string; cls: string | undefined } {
		if (intensity <= 0) {
			return { ch: ' ', cls: undefined };
		}

		if (row === 0) {
			if (intensity < 0.55) {
				return { ch: '·', cls: 'faint' };
			}
			return { ch: '░', cls: 'faint' };
		}

		if (row === 1) {
			return { ch: '▒', cls: 'mid' };
		}

		// row 2: hot base
		if (intensity < 0.7) {
			return { ch: '▓', cls: 'mid' };
		}
		return { ch: '█', cls: 'hot' };
	}

	const initialTick = animated ? 0 : sequenceTicks;

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
		const out: Seg[][] = [];
		const intensities: number[] = Array.from({ length: N }, (_, i) =>
			flameIntensity(i, tick)
		);
		const baseY = height - 1;
		const wickY = baseY - 1;
		const flameBaseY = wickY - 1; // row 2 of flame
		const flameMidY = wickY - 2; // row 1
		const flameTopY = wickY - 3; // row 0 (tip)

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

				for (let i = 0; i < N; i++) {
					const cx = lampCenters[i]!;
					const inten = intensities[i]!;

					if (y === baseY) {
						if (x >= cx - 1 && x <= cx + 1) {
							ch = '▀';
							next = 'mid';
							break;
						}
					} else if (y === wickY) {
						if (x === cx) {
							ch = '║';
							next = 'mid';
							break;
						}
					} else if (y === flameBaseY) {
						// 3-wide base
						if (x === cx) {
							const f = flameSlot(2, inten);
							ch = f.ch;
							next = f.cls;
							break;
						}
						if (x === cx - 1 || x === cx + 1) {
							const f = flameSlot(2, inten);
							ch = f.ch;
							next = f.cls;
							break;
						}
					} else if (y === flameMidY) {
						// 3-wide mid
						if (x >= cx - 1 && x <= cx + 1) {
							const f = flameSlot(1, inten);
							ch = f.ch;
							next = f.cls;
							break;
						}
					} else if (y === flameTopY) {
						if (x === cx) {
							const f = flameSlot(0, inten);
							ch = f.ch;
							next = f.cls;
							break;
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
		<div class="diya">
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
	.diya {
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
