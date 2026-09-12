<script module lang="ts">
	export interface GraphJapaProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Animate the marker around the mala. Default true. Reduced motion freezes a mid-mala frame. */
		animated?: boolean;
		/** Width of the scene in characters. Default 60. */
		cols?: number;
		/** Height of the scene in rows. Default 22. */
		rows?: number;
		/** Total beads per mala. The mala is 108; the counter shows current/total. Default 108. */
		beads?: number;
		/** Milliseconds per bead. Default 110. */
		speedMs?: number;
		/** Short caption under the art; the art itself is decorative. */
		label?: string;
		class?: string;
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
		rows = 22,
		beads = 108,
		speedMs = 110,
		label = 'a breath for every bead',
		class: className = ''
	}: GraphJapaProps = $props();

	// Character cells are ~2x taller than wide; correct so the mala reads round.
	const aspect = 2.1;

	// svelte-ignore state_referenced_locally
	const width = Math.max(28, cols);
	// svelte-ignore state_referenced_locally
	const height = Math.max(14, rows);
	// svelte-ignore state_referenced_locally
	const N = Math.max(8, Math.min(216, Math.round(beads)));

	// svelte-ignore state_referenced_locally
	const cx = width / 2;
	// svelte-ignore state_referenced_locally
	const cy = (height - 2) / 2 + 1; // leave two rows for the counter at the bottom

	// Radius: prefer the horizontal budget, fall back to the vertical (aspect-corrected).
	const r = Math.min(cx - 3, (cy - 1.5) * aspect);

	// Bead positions, in display cells. Multiple beads may map to the same cell at
	// the top/bottom of the circle (aspect squeezes them); the map keeps the first index.
	interface Bead {
		x: number;
		y: number;
		i: number;
	}

	// svelte-ignore state_referenced_locally
	const beads$: Bead[] = (() => {
		const out: Bead[] = [];

		for (let i = 0; i < N; i++) {
			const a = (i / N) * Math.PI * 2 - Math.PI / 2;
			const x = Math.round(cx + r * Math.cos(a));
			const y = Math.round(cy + (r * Math.sin(a)) / aspect);
			out.push({ x, y, i });
		}

		return out;
	})();

	// svelte-ignore state_referenced_locally
	const beadCells = new Map<number, number[]>(
		beads$.map((b) => {
			const key = b.y * width + b.x;
			return [key, [b.i]];
		}).reduce((m, [k, v]) => {
			const existing = m.get(k as number);
			if (existing) {
				existing.push(...(v as number[]));
			} else {
				m.set(k as number, v as number[]);
			}
			return m;
		}, new Map<number, number[]>())
	);

	// svelte-ignore state_referenced_locally
	const initialTick = animated ? Math.floor(N * 0.55) : Math.floor(N * 0.5);

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

	const TAIL = 5;
	const SHIMMER_TICKS = 6;

	const view = $derived.by((): Seg[][] => {
		const marker = ((tick % N) + N) % N;
		const inMala = marker; // 0..N-1
		const shimmering = tick > 0 && inMala < SHIMMER_TICKS;

		// Tail indices (the TAIL beads behind the marker, mod N).
		const tailSet = new Set<number>();

		for (let k = 1; k <= TAIL; k++) {
			tailSet.add((marker - k + N) % N);
		}

		const out: Seg[][] = [];
		const counter = `${inMala + 1} / ${N}`;
		const counterRow = height - 1;
		const counterStart = width - counter.length;

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

				// Counter on the bottom row, right-aligned.
				if (y === counterRow && x >= counterStart) {
					ch = counter[x - counterStart]!;
				} else {
					const indices = beadCells.get(y * width + x);

					if (indices && indices.length > 0) {
						const isMarker = indices.includes(marker);
						const isTail = !isMarker && indices.some((i) => tailSet.has(i));

						if (isMarker) {
							ch = '█';
							next = 'hot';
						} else if (shimmering) {
							ch = '▓';
							next = 'mid';
						} else if (isTail) {
							ch = '▒';
							next = 'faint';
						} else {
							ch = '·';
							next = 'faint';
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
		<div class="japa">
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
	.japa {
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
