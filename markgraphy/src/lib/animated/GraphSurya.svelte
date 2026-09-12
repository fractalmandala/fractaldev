<script module lang="ts">
	export interface GraphSuryaProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Animate the day cycle. Default true. Reduced motion freezes a mid-morning frame. */
		animated?: boolean;
		/** Width of the scene in characters. Default 60. */
		cols?: number;
		/** Height of the scene in rows. Default 18. */
		rows?: number;
		/** Milliseconds per tick. Default 120. */
		speedMs?: number;
		/** Number of spokes on the wheel. Default 12. */
		rays?: number;
		/** Seed for the per-spoke length jitter. Default 5. */
		seedNum?: number;
		/** Short caption under the art; the art itself is decorative. */
		label?: string;
		class?: string;
	}

	/** Deterministic mulberry32 PRNG so a seed replays the same wheel. */
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
		speedMs = 120,
		rays = 12,
		seedNum = 5,
		label = 'the mover of days',
		class: className = ''
	}: GraphSuryaProps = $props();

	// svelte-ignore state_referenced_locally
	const width = Math.max(32, cols);
	// svelte-ignore state_referenced_locally
	const height = Math.max(12, rows);
	const horizonY = height - 3;
	const radius = 5;
	const centerX = Math.floor(width / 2);
	const riseTicks = 90;
	// Character cells are ~2x taller than wide; correct so the disc reads round.
	const aspect = 2.1;
	const halo = radius + 1.1;

	// svelte-ignore state_referenced_locally
	const rand = $derived(mulberry32(seedNum));
	// svelte-ignore state_referenced_locally
	const rayLens = Array.from({ length: Math.max(3, rays) }, () => 2.5 + 2 * rand());

	// The sun rises from below the horizon to the apex and sets again, forever.
	function sunY(tick: number): number {
		const pp = tick % (riseTicks * 2);
		const tri = pp < riseTicks ? pp / riseTicks : (riseTicks * 2 - pp) / riseTicks;
		const ease = tri * tri * (3 - 2 * tri);

		return horizonY - (radius + 1 + ease * Math.max(2, horizonY - radius - 3.5));
	}

	function initialTick(): number {
		// Mid-morning: disc clear of the horizon, no ray clipped by the top edge.
		return Math.round(riseTicks * 0.3);
	}

	// svelte-ignore state_referenced_locally
	let tick = $state(initialTick());

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
		const cy = sunY(tick);
		const phase = tick * 0.09;
		const sector = (Math.PI * 2) / Math.max(3, rays);
		const n = Math.max(3, rays);

		// Spokes are dense line segments painted from the halo outward; a
		// brightness wave rides the wheel so one spoke glints at a time.
		const rayMap = new Map<number, { u: number; b: number }>();

		for (let k = 0; k < n; k++) {
			const th = k * sector - Math.PI / 2;
			const len = rayLens[k];
			const b = 0.5 + 0.5 * Math.cos(th - phase);
			const steps = Math.ceil(len * 4);

			for (let i = 0; i <= steps; i++) {
				const r = halo + 0.5 + (i / steps) * len;
				const px = Math.round(centerX + r * Math.cos(th));
				const py = Math.round(cy + (r * Math.sin(th)) / aspect);
				const key = py * width + px;

				if (px >= 0 && px < width && py >= 0 && py < horizonY && !rayMap.has(key)) {
					rayMap.set(key, { u: i / steps, b });
				}
			}
		}

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

				if (y === horizonY) {
					ch = '─';
				} else if (y < horizonY) {
					const dx = x - centerX;
					const dy = (y - cy) * aspect;
					const d = Math.sqrt(dx * dx + dy * dy);

					if (d <= radius) {
						const t = d / radius;

						if (t < 0.45) {
							ch = '█';
							next = 'hot';
						} else if (t < 0.8) {
							ch = '▓';
						} else {
							ch = '▒';
							next = 'mid';
						}
					} else if (d <= halo) {
						ch = '░';
						next = 'faint';
					} else {
						const rc = rayMap.get(y * width + x);

						if (rc) {
							if (rc.u < 0.45) {
								ch = '▓';
							} else if (rc.u < 0.8) {
								ch = '▒';
								next = 'mid';
							} else {
								ch = '░';
								next = 'faint';
							}

							if (rc.b > 0.8) {
								next = 'hot';
							}
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
		<div class="surya">
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
	.surya {
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
