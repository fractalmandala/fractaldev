<script module lang="ts">
	/** Health of one appended blip. */
	export type PulseStatus = 'ok' | 'degraded' | 'down';

	export interface GraphPulseProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Append a live blip every interval. Default true. Reduced motion freezes a pre-filled window. */
		animated?: boolean;
		/** Window size in blips, newest at the right. Default 60. */
		length?: number;
		/** Milliseconds between appends. Default 1000. */
		intervalMs?: number;
		/** Chance an appended blip is ok; about 4% of the rest degrade, the rest go down. Default 0.94. */
		okRate?: number;
		/** Replace the built-in generator with your own stream of statuses. */
		feed?: () => PulseStatus;
		/** Seed for the reproducible generator. Default 11. */
		seedNum?: number;
		/** Label at the left edge of the caption row. Default 'now'. */
		from?: string;
		class?: string;
	}

	/** Deterministic mulberry32 PRNG so a seed replays the same window. */
	function mulberry32(seed: number): () => number {
		let a = seed >>> 0;

		return () => {
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	const MARK: Record<PulseStatus, string> = { ok: '█', degraded: '▒', down: '·' };
	const TONE: Record<PulseStatus, string> = { ok: 'up', degraded: 'slow', down: 'down' };

	interface Seg {
		text: string;
		cls: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { formatAgo, graphNow } from '../frame/clock';

	let {
		title,
		animated = true,
		length = 60,
		intervalMs = 1000,
		okRate = 0.94,
		feed,
		seedNum = 11,
		from = 'now',
		class: className = ''
	}: GraphPulseProps = $props();

	// svelte-ignore state_referenced_locally
	const rand = $derived(mulberry32(seedNum));

	function draw(): PulseStatus {
		if (feed) {
			return feed();
		}

		const r = rand();

		if (r < okRate) {
			return 'ok';
		}

		return r < okRate + 0.04 ? 'degraded' : 'down';
	}

	function prefill(): PulseStatus[] {
		const out: PulseStatus[] = [];
		const size = Math.max(1, length);

		for (let i = 0; i < size; i++) {
			out.push(draw());
		}

		return out;
	}

	// svelte-ignore state_referenced_locally
	let blips = $state<PulseStatus[]>(prefill());
	let lastCheckAt = $state(Date.now());

	const time = graphNow();

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
			blips = [...blips.slice(1), draw()];
			lastCheckAt = Date.now();
		}, intervalMs);

		return () => window.clearInterval(timer);
	});

	const segments = $derived.by((): Seg[] => {
		const segs: Seg[] = [];

		for (const blip of blips) {
			const cls = TONE[blip];
			const last = segs[segs.length - 1];

			if (last && last.cls === cls) {
				last.text += MARK[blip];
			} else {
				segs.push({ text: MARK[blip], cls });
			}
		}

		return segs;
	});

	const percent = $derived.by(() => {
		if (blips.length === 0) {
			return 0;
		}

		const ok = blips.filter((blip) => blip === 'ok').length;

		return Math.round((ok / blips.length) * 100);
	});

	const ago = $derived(
		$time == null ? '0s ago' : formatAgo(Math.max(0, $time - lastCheckAt))
	);
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="pulse">
			<div class="viewport">
				<pre class="art" aria-hidden="true"><code>{#each segments as seg, i (i)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}</code></pre>
			</div>
			<div class="meta">
				<p class="legend">
					<span><span class="lg up" aria-hidden="true">█</span> up</span>
					<span><span class="lg slow" aria-hidden="true">▒</span> slow</span>
					<span><span class="lg down" aria-hidden="true">·</span> down</span>
				</p>
				<p class="pct">{percent}%</p>
			</div>
			<p class="caption"><span>{from}</span><span>last check {ago}</span></p>
			<span class="sr-only">{percent} percent uptime over {blips.length} checks</span>
		</div>
	</GraphBody>
</Graph>

<style>
	.pulse {
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
		line-height: 1.4;
		color: var(--text-primary, oklch(0.93 0 0));
		white-space: pre;
	}

	.up {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.slow {
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.down {
		color: var(--text-muted, oklch(0.3 0 0));
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		margin: 0;
		color: var(--text-secondary, oklch(0.62 0 0));
		gap: 0.25rem 1rem;
	}

	.lg {
		user-select: none;
	}

	.pct {
		margin: 0 0 0 auto;
		text-align: right;
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.caption {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border-width: 0;
	}
</style>
