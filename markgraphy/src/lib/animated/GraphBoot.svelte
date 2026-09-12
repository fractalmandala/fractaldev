<script module lang="ts">
	export interface GraphBootStep {
		/** Short label, e.g. 'compose up', 'migrate', 'seed'. */
		label: string;
		/** Optional ETA in 'ms' to surface in the per-step tag, e.g. '~1.4s'. */
		eta?: string;
		/** If true, this step fails; the final summary shows ✗ and stops. Default false. */
		fail?: boolean;
	}

	export interface GraphBootProps {
		/** Caption on the frame's top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Ordered list of deploy/boot steps to show. */
		steps: GraphBootStep[];
		/** Milliseconds per tick of the boot animation. Default 90. */
		speedMs?: number;
		/** Total ticks each step is "in progress" before flipping to ✓/✗. Default 14. */
		stepTicks?: number;
		/** Seed for any stochastic timing jitter per step. Default 5. */
		seedNum?: number;
		/** Animate the boot. Default true. Reduced motion freezes a mid-run frame. */
		animated?: boolean;
		/** Short caption under the art. */
		label?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';

	let {
		title,
		steps,
		speedMs = 90,
		stepTicks = 14,
		seedNum = 5,
		animated = true,
		label = 'from cold to live',
		class: className = ''
	}: GraphBootProps = $props();

	interface Seg {
		text: string;
		cls?: string;
	}

	// svelte-ignore state_referenced_locally
	const list: GraphBootStep[] = steps.length > 0 ? steps : [{ label: 'idle' }];

	// svelte-ignore state_referenced_locally
	const stepDur = Math.max(2, Math.round(stepTicks));

	// Seeded per-step duration jitter so a step takes 70%..130% of the default.
	function mulberry32(seed: number): () => number {
		let a = seed >>> 0;
		return () => {
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	// svelte-ignore state_referenced_locally
	const rand = $derived(mulberry32(seedNum));
	// svelte-ignore state_referenced_locally
	const jitter: number[] = list.map(() => 0.7 + rand() * 0.6);

	// Per-step tick length = stepDur * jitter (rounded, >= 3).
	// svelte-ignore state_referenced_locally
	const stepLens: number[] = list.map((_, i) =>
		Math.max(3, Math.round(stepDur * (jitter[i] ?? 1)))
	);

	// Total ticks to complete the whole boot (sum of all step lengths) plus 6 ticks of post-summary.
	const totalTicks = stepLens.reduce((a, b) => a + b, 0) + 6;
	// svelte-ignore state_referenced_locally
	const initialTick = animated ? Math.min(totalTicks, Math.floor(totalTicks * 0.6)) : totalTicks;

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
			if (tick < totalTicks) {
				tick += 1;
			} else {
				tick = 0;
			}
		}, speedMs);

		return () => window.clearInterval(timer);
	});

	// For each step, derive: status, fill (0..1), and tickSinceEnd.
	// status: 'pending' | 'running' | 'ok' | 'fail'
	const stepState = $derived.by(() => {
		const out: { status: 'pending' | 'running' | 'ok' | 'fail'; fill: number }[] = [];
		let acc = 0;

		for (let i = 0; i < list.length; i++) {
			const len = stepLens[i] ?? stepDur;
			const start = acc;
			const end = acc + len;
			acc = end;

			if (tick < start) {
				out.push({ status: 'pending', fill: 0 });
			} else if (tick < end) {
				const fill = (tick - start) / Math.max(1, len - 1);
				out.push({ status: 'running', fill: Math.min(1, fill) });
			} else {
				// A failing step fails on its final tick and everything after.
				const failed = !!list[i]?.fail && tick >= end;
				out.push({ status: failed ? 'fail' : 'ok', fill: 1 });
			}
		}

		return out;
	});

	// A failing step halts later steps — if any prior step is 'fail', all subsequent
	// are marked skipped (kept pending) so the summary makes sense.
	const haltedAt = $derived.by(() => {
		for (let i = 0; i < stepState.length; i++) {
			if (stepState[i]!.status === 'fail') {
				return i;
			}
		}
		return -1;
	});

	// For rendering, an effective state honors the halt.
	const effectiveState = $derived(
		stepState.map((s, i) => {
			if (haltedAt >= 0 && i > haltedAt) {
				return { status: 'pending' as const, fill: 0 };
			}
			return s;
		})
	);

	// Total elapsed time: a synthetic ETA in seconds. Each step = 0.6s base.
	// svelte-ignore state_referenced_locally
	const totalEta = $derived(
		(stepLens.reduce((a, b) => a + b, 0) * (speedMs / 1000)).toFixed(1)
	);
	// svelte-ignore state_referenced_locally
	const elapsedS = $derived(
		Math.min(parseFloat(totalEta), (tick * speedMs) / 1000).toFixed(1)
	);

	// Pass / fail summary
	const summary = $derived.by(() => {
		const anyFail = haltedAt >= 0;
		const okCount = effectiveState.filter((s) => s.status === 'ok').length;
		const failCount = effectiveState.filter((s) => s.status === 'fail').length;
		const total = list.length;

		if (anyFail) {
			return { kind: 'fail' as const, ok: okCount, fail: failCount, total };
		}
		return { kind: 'ok' as const, ok: total, fail: 0, total };
	});

	// RLE view of the per-step rows
	const view = $derived.by((): Seg[] => {
		const out: Seg[] = [];
		// Find the longest label, cap at 18 chars to keep rows tidy
		const labelWidth = Math.min(18, Math.max(8, ...list.map((s) => s.label.length + 2)));

		for (let i = 0; i < list.length; i++) {
			const step = list[i]!;
			const state = effectiveState[i]!;

			// "[ label ]  [▰▰▰▱▱▱▱▱▱▱]  ·1.2s ✓"
			const pad = labelWidth - step.label.length;
			const paddedLabel = step.label + ' '.repeat(Math.max(0, pad));

			out.push({ text: '  ' });
			out.push({ text: paddedLabel, cls: 'mid' });

			// bar — 10 cells wide
			const barWidth = 10;
			const filled = Math.round(state.fill * barWidth);

			if (state.status === 'pending') {
				out.push({ text: '[' });
				out.push({ text: '·'.repeat(barWidth), cls: 'faint' });
				out.push({ text: ']' });
				out.push({ text: '   ' });
				out.push({ text: '…', cls: 'faint' });
			} else if (state.status === 'running') {
				out.push({ text: '[' });
				out.push({ text: '▰'.repeat(filled), cls: 'hot' });
				out.push({ text: '▱'.repeat(barWidth - filled), cls: 'faint' });
				out.push({ text: ']' });
				out.push({ text: '   ' });
				if (step.eta) {
					out.push({ text: step.eta, cls: 'mid' });
				} else {
					out.push({ text: '…', cls: 'faint' });
				}
			} else if (state.status === 'ok') {
				out.push({ text: '[' });
				out.push({ text: '▰'.repeat(barWidth), cls: 'mid' });
				out.push({ text: ']' });
				out.push({ text: '   ' });
				if (step.eta) {
					out.push({ text: step.eta, cls: 'mid' });
				} else {
					out.push({ text: 'ok', cls: 'mid' });
				}
				out.push({ text: '  ' });
				out.push({ text: '✓', cls: 'hot' });
			} else {
				out.push({ text: '[' });
				out.push({ text: '▰'.repeat(filled) + '▱'.repeat(barWidth - filled), cls: 'faint' });
				out.push({ text: ']' });
				out.push({ text: '   ' });
				if (step.eta) {
					out.push({ text: step.eta, cls: 'mid' });
				} else {
					out.push({ text: '—', cls: 'faint' });
				}
				out.push({ text: '  ' });
				out.push({ text: '✗', cls: 'fail' });
			}

			out.push({ text: '\n' });
		}

		// Summary row
		out.push({ text: '  ' });
		out.push({ text: '─'.repeat(labelWidth), cls: 'faint' });
		out.push({ text: '\n' });

		out.push({ text: '  ' });
		out.push({ text: 'total', cls: 'mid' });
		out.push({ text: ' '.repeat(Math.max(0, labelWidth - 5)) });

		const mark = summary.kind === 'ok' ? '✓' : '✗';
		const markCls = summary.kind === 'ok' ? 'hot' : 'fail';
		const passedText = `${summary.ok}/${summary.total} passed`;
		const space = '   ';

		out.push({ text: passedText, cls: 'mid' });
		out.push({ text: space });
		out.push({ text: `${elapsedS}s / ${totalEta}s`, cls: 'mid' });
		out.push({ text: '  ' });
		out.push({ text: mark, cls: markCls });

		return out;
	});
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="boot">
			<div class="viewport">
				<pre class="art" aria-hidden="true"><code>{#each view as seg, i (i)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}</code></pre>
			</div>
			<p class="caption">{label}</p>
		</div>
	</GraphBody>
</Graph>

<style>
	.boot {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-width: 0;
	}

	.viewport {
		overflow-x: auto;
	}

	.art {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.5;
		color: var(--text-primary, oklch(0.93 0 0));
		white-space: pre;
		font-variant-numeric: tabular-nums;
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

	.fail {
		color: var(--graph-fail, oklch(0.7 0.18 25));
		font-weight: 600;
	}

	.caption {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}
</style>
