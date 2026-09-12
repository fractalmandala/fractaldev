<script module lang="ts">
	/** Live appending sparkline with a big current value, like a terminal KPI. */
	export type StreamKind = 'elapsed' | 'ago';

	export interface GraphStreamProps {
		/** Caption on the frame's top edge. */
		title: string;
		/** Points kept in the rolling history. Default 40. */
		length?: number;
		/** Milliseconds between appends. Default 900. */
		intervalMs?: number;
		/** Initial history. Default a seeded, SSR-safe random walk from 50. */
		values?: number[];
		/** Next-value generator. Default a gentle random walk clamped to 0..100. */
		generate?: (tick: number, previous: number) => number;
		/** Suffix after the value, e.g. 'ms' or '%'. Default ''. */
		unit?: string;
		/** Caption flavor: 'ago' counts since the last append; 'elapsed' since mount. */
		kind?: StreamKind;
		/** Animate the appends. Default true. Reduced motion freezes the stream. */
		animated?: boolean;
		class?: string;
	}

	const SPARK: readonly string[] = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

	const DEFAULT_GENERATE = (_tick: number, previous: number): number => {
		const drift = (Math.random() - 0.5) * 12;
		return Math.min(100, Math.max(0, previous + drift));
	};

	/**
	 * Deterministic walk so server and client render the same default
	 * history — no hydration mismatch, and it still reads as random.
	 */
	function seededWalk(count: number, start = 50): number[] {
		let seed = 0x9e3779b9;

		const rand = () => {
			seed = (seed + 0x6d2b79f5) | 0;
			let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};

		const out = [start];

		for (let i = 1; i < count; i++) {
			const previous = out[out.length - 1] ?? start;
			out.push(Math.min(100, Math.max(0, previous + (rand() - 0.5) * 10)));
		}

		return out;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { formatAgo, formatHms, graphNow } from '../frame/clock';
	import { reveal } from '../frame/motion';

	let {
		title,
		length = 40,
		intervalMs = 900,
		values,
		generate,
		unit = '',
		kind = 'ago',
		animated = true,
		class: className = ''
	}: GraphStreamProps = $props();

	// svelte-ignore state_referenced_locally
	let history = $state(
		values == null
			? seededWalk(Math.max(1, Math.floor(length)))
			: values.slice(-Math.max(1, Math.floor(length)))
	);
	let tick = $state(0);
	let updatedAt = $state(Date.now());
	const startedAt = Date.now();

	const now = graphNow();
	const nextValue = $derived(generate ?? DEFAULT_GENERATE);

	const moving = $derived(
		animated &&
			(typeof window === 'undefined' ||
				!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	);

	const cap = $derived(Math.max(1, Math.floor(length)));

	$effect(() => {
		if (!moving) {
			return;
		}

		const timer = window.setInterval(() => {
			tick += 1;
			const previous = history[history.length - 1] ?? 50;
			const next = nextValue(tick, previous);
			const keep = cap - 1;

			history = keep > 0 ? [...history.slice(-keep), next] : [next];
			updatedAt = Date.now();
		}, intervalMs);

		return () => window.clearInterval(timer);
	});

	const current = $derived(history.length > 0 ? (history[history.length - 1] ?? 0) : 0);
	const display = $derived(
		Number.isFinite(current) ? (Number.isInteger(current) ? String(current) : current.toFixed(1)) : '—'
	);

	/** Block-glyph mapping, same approach as GraphSpark. */
	const max = $derived(Math.max(...history, 1));
	const points = $derived(
		history.map((value) => {
			const index = Math.round((value / max) * (SPARK.length - 1));
			return SPARK[index] ?? SPARK[0] ?? '▁';
		})
	);

	const caption = $derived.by(() => {
		const time = $now;

		if (time == null) {
			return kind === 'ago' ? 'updated 0s ago' : 'elapsed 00:00:00';
		}

		if (!moving || kind === 'elapsed') {
			return `elapsed ${formatHms(Math.max(0, time - startedAt))}`;
		}

		return `updated ${formatAgo(Math.max(0, time - updatedAt))}`;
	});
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="stream" use:reveal={{ amount: 0.5 }}>
			<p class="value">
				{display}{#if unit}<span class="unit"> {unit}</span>{/if}
			</p>
			{#if points.length > 0}
				<div class="spark" aria-hidden="true">
					{#each points as glyph, i (i)}
						<span class="cell" class:c-accent={i === points.length - 1}>{glyph}</span>
					{/each}
				</div>
			{/if}
			<p class="muted">{caption}</p>
		</div>
		<span class="sr-only">{display}{unit}. {caption}</span>
	</GraphBody>
</Graph>

<style>
	.stream {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.value {
		margin: 0;
		font-size: 1.875rem;
		line-height: 1.2;
		letter-spacing: -0.025em;
		font-variant-numeric: tabular-nums;
		color: var(--text-primary, oklch(0.93 0 0));
	}

	@media (min-width: 640px) {
		.value {
			font-size: 2.25rem;
		}
	}

	.unit {
		font-size: 1.25rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.spark {
		display: flex;
		justify-content: flex-start;
		column-gap: 0.125rem;
		width: 100%;
		min-width: 0;
		user-select: none;
	}

	.cell {
		flex: none;
		min-width: 1ch;
	}

	.c-accent {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.muted {
		margin: 0;
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
