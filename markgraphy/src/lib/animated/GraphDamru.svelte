<script module lang="ts">
	export interface GraphDamruProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Animate the tala. Default true. Reduced motion freezes a clap beat. */
		animated?: boolean;
		/** Width of the scene in characters. Default 60. */
		cols?: number;
		/** Height of the scene in rows. Default 16. */
		rows?: number;
		/** Milliseconds per beat. Default 220. */
		speedMs?: number;
		/** Short caption under the art; the art itself is decorative. */
		label?: string;
		class?: string;
	}

	interface Seg {
		text: string;
		cls?: string;
	}

	// Adi tala: 8 beats, structure 4+2+2 (laghu 4, drutam 2, drutam 2).
	// Beats 1, 5, 7 are claps (both hands); the rest are waves alternating.
	const BEAT_KIND: ('clap' | 'wave-up' | 'wave-down')[] = [
		'clap',
		'wave-up',
		'wave-down',
		'wave-up',
		'clap',
		'wave-up',
		'clap',
		'wave-down'
	];
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';

	let {
		title,
		animated = true,
		cols = 60,
		rows = 16,
		speedMs = 220,
		label = 'the first sound',
		class: className = ''
	}: GraphDamruProps = $props();

	// svelte-ignore state_referenced_locally
	const width = Math.max(28, cols);
	// svelte-ignore state_referenced_locally
	const height = Math.max(10, rows);
	const beatTicks = 10; // ticks per beat; one tala = 80 ticks
	const RIPPLE_TICKS = 12; // ripple lifetime

	// svelte-ignore state_referenced_locally
	const cx = Math.floor(width / 2);
	// Damru binding line (where the two triangles meet).
	// svelte-ignore state_referenced_locally
	const lineY = Math.floor(height / 2) - 1;
	// Triangle half-base (cells each side of center).
	const baseHalf = 4;
	// Height of each triangle in rows.
	const triH = 5;

	// Up triangle cells: rows lineY-1 (apex) down to lineY-triH (base), centered on cx.
	// Apex is 1 cell wide, base is (2*baseHalf+1)=9 cells wide.
	interface Triangle {
		cells: { x: number; y: number; relX: number; relY: number }[];
	}

	// svelte-ignore state_referenced_locally
	const upTri: Triangle = (() => {
		const cells: Triangle['cells'] = [];

		for (let row = 0; row < triH; row++) {
			// row 0 = top (apex), row triH-1 = bottom (base)
			const w = 1 + 2 * row; // 1, 3, 5, 7, 9
			const halfW = (w - 1) / 2;
			const y = lineY - triH + row;
			for (let dx = -halfW; dx <= halfW; dx++) {
				cells.push({ x: cx + dx, y, relX: dx, relY: row });
			}
		}

		return { cells };
	})();

	// Down triangle: mirror below the binding line.
	// svelte-ignore state_referenced_locally
	const downTri: Triangle = (() => {
		const cells: Triangle['cells'] = [];

		for (let row = 0; row < triH; row++) {
			const w = 1 + 2 * row;
			const halfW = (w - 1) / 2;
			const y = lineY + 1 + row;
			for (let dx = -halfW; dx <= halfW; dx++) {
				cells.push({ x: cx + dx, y, relX: dx, relY: row });
			}
		}

		return { cells };
	})();

	const initialTick = animated ? 0 : beatTicks * 4;

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

	// Pulse intensity for a triangle, given the age of the last beat and whether
	// this triangle is the active one for that beat.
	function pulse(age: number, active: boolean): number {
		if (!active) {
			return 0.18;
		}
		// Decay from 1.0 at age 0 to ~0.25 by age = beatTicks*2
		return Math.max(0.25, 1 - age / (beatTicks * 2));
	}

	const view = $derived.by((): Seg[][] => {
		const beatIdx = Math.floor(tick / beatTicks) % 8;
		const age = tick % beatTicks;
		const kind = BEAT_KIND[beatIdx]!;

		const upActive = kind === 'clap' || kind === 'wave-up';
		const downActive = kind === 'clap' || kind === 'wave-down';
		const upI = pulse(age, upActive);
		const downI = pulse(age, downActive);

		// Glyph by pulse intensity.
		function triGlyph(i: number): { ch: string; cls: string | undefined } {
			if (i >= 0.8) {
				return { ch: '█', cls: 'hot' };
			}
			if (i >= 0.55) {
				return { ch: '▓', cls: 'mid' };
			}
			if (i >= 0.3) {
				return { ch: '▒', cls: 'faint' };
			}
			return { ch: '░', cls: 'faint' };
		}

		// Ripples: ages 0..RIPPLE_TICKS-1 in the recent past, drawn as a ring of `▒`.
		// Newest first so young ripples override older ones at the same cell.
		const rippleAges: number[] = [];

		for (let a = 0; a < RIPPLE_TICKS; a++) {
			if (tick - a >= 0 && (tick - a) % beatTicks === 0) {
				rippleAges.push(a);
			}
		}

		// Map of cell -> {ch, cls} for ripples (drawn UNDER the triangles).
		const rippleMap = new Map<number, { ch: string; cls: string | undefined }>();

		for (const a of rippleAges) {
			const r = (a + 1) * 1.4;
			const lifeLeft = 1 - a / RIPPLE_TICKS;
			if (lifeLeft < 0.25) {
				continue;
			}
			const cls = lifeLeft > 0.6 ? 'mid' : 'faint';
			// Approximate the ring by sampling the grid perimeter at distance r.
			// We step around the circle in angle increments and project to cells.
			const steps = Math.max(20, Math.ceil(r * 8));

			for (let s = 0; s < steps; s++) {
				const ang = (s / steps) * Math.PI * 2;
				const px = cx + r * Math.cos(ang);
				const py = lineY + (r * Math.sin(ang)) / 2.1;
				const ix = Math.round(px);
				const iy = Math.round(py);
				if (ix < 0 || ix >= width || iy < 0 || iy >= height) {
					continue;
				}
				const key = iy * width + ix;

				if (!rippleMap.has(key)) {
					rippleMap.set(key, { ch: '▒', cls });
				}
			}
		}

		// Pre-fill cells: start blank.
		const out: Seg[][] = [];

		// Convert triangle cells to Maps for O(1) lookup
		const upTriMap = new Map(upTri.cells.map(c => [`${c.x},${c.y}`, c]));
		const downTriMap = new Map(downTri.cells.map(c => [`${c.x},${c.y}`, c]));

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

				// Binding line at lineY: a row of `─` across the width.
				if (y === lineY) {
					ch = '─';
				} else {
					// Ripples go first (lowest priority).
					const r = rippleMap.get(y * width + x);
					if (r) {
						ch = r.ch;
						next = r.cls;
					}
				}

				// Triangles override ripples where they overlap.
				if (y >= lineY - triH && y < lineY) {
					// Up triangle region
					const cell = upTriMap.get(`${x},${y}`);
					if (cell) {
						const g = triGlyph(upI);
						ch = g.ch;
						next = g.cls;
					}
				} else if (y > lineY && y <= lineY + triH) {
					// Down triangle region
					const cell = downTriMap.get(`${x},${y}`);
					if (cell) {
						const g = triGlyph(downI);
						ch = g.ch;
						next = g.cls;
					}
				}

				// Bottom-row counter: "tala X · beat Y · CLAP/WAVE"
				if (y === height - 1) {
					const beatNo = beatIdx + 1;
					const talaNo = Math.floor(tick / (beatTicks * 8)) + 1;
					const kindShort = kind === 'clap' ? 'CLAP' : kind === 'wave-up' ? 'WAVE↑' : 'WAVE↓';
					const text = `tala ${talaNo} · beat ${beatNo}/8 · ${kindShort}`;
					// Right-align the text in the row.
					const start = Math.max(0, width - text.length);
					if (x >= start) {
						ch = text[x - start]!;
						next = undefined;
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
		<div class="damru">
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
	.damru {
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
