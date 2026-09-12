<script module lang="ts">
	export interface GraphMandalaProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Animate the bloom. Default true. Reduced motion freezes a fully bloomed frame. */
		animated?: boolean;
		/** Width of the scene in characters; at least 38 so the outermost ring fits. Default 48. */
		cols?: number;
		/** Height of the scene in rows; at least 20 so the circle fits the cell aspect. Default 24. */
		rows?: number;
		/** Rotational folds (K). One cell of the canonical petal is rotated K times. Default 8. */
		folds?: number;
		/** Number of concentric lotus-petal rings. Default 5. */
		rings?: number;
		/** Milliseconds per tick. Default 130. */
		speedMs?: number;
		/** Seed for the per-ring radius and phase perturbation. Default 11. */
		seedNum?: number;
		/** Short caption under the art; the art itself is decorative. */
		label?: string;
		class?: string;
	}

	/** Deterministic mulberry32 PRNG so a seed replays the same mandala. */
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
		cols = 48,
		rows = 24,
		folds = 8,
		rings = 5,
		speedMs = 130,
		seedNum = 11,
		label = 'the circle that holds',
		class: className = ''
	}: GraphMandalaProps = $props();

	// Character cells are ~2x taller than wide; aspect-correct so the lotus reads round.
	const aspect = 2.1;

	// svelte-ignore state_referenced_locally
	const width = Math.max(38, cols);
	// svelte-ignore state_referenced_locally
	const height = Math.max(20, rows);
	const cx = width / 2;
	const cy = height / 2;
	// svelte-ignore state_referenced_locally
	const K = Math.max(3, Math.min(16, Math.round(folds)));
	// svelte-ignore state_referenced_locally
	const N = Math.max(3, Math.min(7, Math.round(rings)));

	// svelte-ignore state_referenced_locally
	const rand = $derived(mulberry32(seedNum));

	// Per-ring radii; seeded perturbation so every seed is a different mandala.
	interface Ring {
		r_in: number;
		r_out: number;
		phase: number;
	}

	// svelte-ignore state_referenced_locally
	const ringData: Ring[] = (() => {
		const maxR = Math.min(width / 2 - 0.5, (height / 2) * aspect - 0.5);
		const baseR = maxR / (N - 0.2);
		const out: Ring[] = [];

		for (let i = 0; i < N; i++) {
			const center = (i + 0.5) * baseR;
			const half = 0.38 * baseR * (0.85 + 0.3 * rand());
			const r_in = Math.max(0, center - half);
			const r_out = Math.min(maxR, center + half);
			const phase = (rand() - 0.5) * 0.5;
			out.push({ r_in, r_out, phase });
		}

		return out;
	})();

	const ringTicks = 14;
	const maxBloom = N * ringTicks;
	const phaseSpeed = 0.02;

	// svelte-ignore state_referenced_locally
	const initialTick = animated ? Math.floor(maxBloom * 0.65) : maxBloom;

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
		const phase = tick * phaseSpeed;
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
				const dx = x - cx;
				const dy = (y - cy) * aspect;
				const d = Math.sqrt(dx * dx + dy * dy);
				// Angle in [-π, π]; subtract phase so the whole figure slowly rotates.
				const a = Math.atan2(dy, dx) - phase;
				// Find the petal this cell belongs to: nearest of K divisions of the circle.
				const kFloat = (a + Math.PI) * (K / (Math.PI * 2));
				const k = Math.round(kFloat);
				const localA = a - k * ((Math.PI * 2) / K) + Math.PI;
				const localAbs = Math.abs(localA);

				let ch = ' ';
				let next: string | undefined;

				for (let i = 0; i < N; i++) {
					const r = ringData[i]!;
					if (d < r.r_in || d > r.r_out) {
						continue;
					}
					// t goes 0 (inner edge of ring) to 1 (outer edge).
					const t = (d - r.r_in) / (r.r_out - r.r_in);
					// Lotus petal: half-width peaks at the middle, narrows at both ends.
					const halfWidth = (Math.PI / K) * Math.sin(Math.PI * t);
					if (localAbs > halfWidth) {
						continue;
					}
					// Per-ring bloom progress: 0 → 1 over `ringTicks`, then stays 1.
					const growth = Math.min(1, Math.max(0, (tick - i * ringTicks) / ringTicks));
					if (t > growth) {
						break; // not yet reached at this radius; nothing deeper
					}
					// Glyph by ring: bindu ring hot, middle rings mid, outer rings faint.
					if (i === 0) {
						ch = '█';
						next = 'hot';
					} else if (i < N / 2) {
						ch = '▓';
						next = 'mid';
					} else {
						ch = '▒';
						next = 'faint';
					}
					break;
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
		<div class="mandala">
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
	.mandala {
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
