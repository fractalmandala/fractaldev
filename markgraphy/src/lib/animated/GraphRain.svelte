<script module lang="ts">
	export interface GraphRainProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Animate the rain. Default true. Reduced motion freezes a single frame. */
		animated?: boolean;
		/** Width in character columns. Default 56. */
		cols?: number;
		/** Height in rows. Default 16. */
		rows?: number;
		/** Milliseconds per tick. Default 110. */
		speedMs?: number;
		/** Trail length behind each head. Default 8. */
		trail?: number;
		/** Seed for the reproducible rain. Default 5. */
		seedNum?: number;
		/** Short caption under the art; the art itself is decorative. */
		label?: string;
		class?: string;
	}

	/** Deterministic mulberry32 PRNG so a seed replays the same rain. */
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

	/** Stream characters: ASCII lowercase + digits mixed with shade glyphs. */
	const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789░▒▓░▒';

	function pickGlyph(rand: () => number): string {
		return GLYPHS[Math.floor(rand() * GLYPHS.length)] ?? ' ';
	}

	function newStream(rand: () => number, trail: number): string[] {
		const stream: string[] = [];

		for (let i = 0; i < trail; i++) {
			stream.push(pickGlyph(rand));
		}

		return stream;
	}

	interface Drop {
		/** Head row; may sit above the frame (negative) while the stream enters. */
		y: number;
		/** Ticks between head advances, 1–3. */
		advanceEvery: number;
		step: number;
		stream: string[];
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
		cols = 56,
		rows = 16,
		speedMs = 110,
		trail = 8,
		seedNum = 5,
		label = 'glyph rain',
		class: className = ''
	}: GraphRainProps = $props();

	// svelte-ignore state_referenced_locally
	const rand = $derived(mulberry32(seedNum));
	// svelte-ignore state_referenced_locally
	const width = Math.max(1, cols);
	// svelte-ignore state_referenced_locally
	const height = Math.max(1, rows);

	function span(): number {
		return Math.max(1, trail);
	}

	function spawn(): Drop {
		return {
			y: -Math.floor(rand() * height * 2),
			advanceEvery: 1 + Math.floor(rand() * 3),
			step: 0,
			stream: newStream(rand, span())
		};
	}

	function initialDrops(): Drop[] {
		const out: Drop[] = [];

		for (let i = 0; i < width; i++) {
			out.push(spawn());
		}

		return out;
	}

	// svelte-ignore state_referenced_locally
	let drops = $state<Drop[]>(initialDrops());

	/** Advance every column; heads step on their own cadence and respawn once clear. */
	function tickRain() {
		const trailLen = span();

		for (const d of drops) {
			d.step += 1;

			if (d.step >= d.advanceEvery) {
				d.step = 0;
				d.y += 1;
			}

			if (d.y - trailLen >= height) {
				d.y = -Math.floor(rand() * 3);
				d.advanceEvery = 1 + Math.floor(rand() * 3);
				d.step = 0;
				d.stream = newStream(rand, trailLen);
			} else if (rand() < 0.08) {
				d.stream[Math.floor(rand() * d.stream.length)] = pickGlyph(rand);
			}
		}
	}

	// svelte-ignore state_referenced_locally
	const preTicks = animated && !prefersReduced() ? height * 2 : height * 4;

	// Streams stagger in when animated; a settled mid-fall frame when frozen.
	for (let i = 0; i < preTicks; i++) {
		tickRain();
	}

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
			tickRain();
		}, speedMs);

		return () => window.clearInterval(timer);
	});

	const view = $derived.by((): Seg[][] => {
		const trailLen = span();
		const bright = Math.max(1, Math.round(trailLen / 3));
		const dim = Math.max(bright + 1, Math.round((trailLen * 2) / 3));
		const out: Seg[][] = [];

		for (let r = 0; r < height; r++) {
			const segs: Seg[] = [];
			let buf = '';
			let cls: string | undefined;

			const flush = () => {
				if (buf.length > 0) {
					segs.push({ text: buf, cls });
				}

				buf = '';
			};

			for (let c = 0; c < width; c++) {
				const d = drops[c];
				const dist = d ? d.y - r : -1;
				let ch = ' ';
				let next: string | undefined;

				if (d && dist === 0) {
					ch = '█';
					next = 'hot';
				} else if (d && dist >= 1 && dist <= trailLen) {
					ch = d.stream[dist - 1] ?? ' ';

					if (dist > dim) {
						next = 'faint';
					} else if (dist > bright) {
						next = 'mid';
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
		<div class="rain">
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
	.rain {
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
