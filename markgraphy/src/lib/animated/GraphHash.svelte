<script module lang="ts">
	export interface GraphHashProps {
		/** Caption on the frame's top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Any string — its digest is the seed. Default 'markgraphy'. */
		input?: string;
		/** Grid width in cells. Default 16. */
		cols?: number;
		/** Grid height in rows. Default 6. */
		rows?: number;
		/** Milliseconds per tick of the scan-line sweep. Default 60. */
		speedMs?: number;
		/** Animate the scan line. Default true. Reduced motion freezes mid-sweep. */
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
		input = 'markgraphy',
		cols = 16,
		rows = 6,
		speedMs = 60,
		animated = true,
		label = 'any string → a glyph fingerprint',
		class: className = ''
	}: GraphHashProps = $props();

	interface Seg {
		text: string;
		cls?: string;
	}

	// svelte-ignore state_referenced_locally
	const W = Math.max(4, Math.min(32, Math.round(cols)));
	// svelte-ignore state_referenced_locally
	const H = Math.max(2, Math.min(16, Math.round(rows)));

	// 4-tier glyph ladder: faint → mid → hot → solid
	const TIER: readonly string[] = ['·', '░', '▒', '▓'];
	// '·' is faint, '░' is low, '▒' is mid, '▓' is high. We don't use '█' so
	// the fingerprint reads as a checkered density, not solid blocks.

	/**
	 * 64-bit FNV-1a-ish digest. Pure function of the input string — same input
	 * always yields the same 64-bit digest, no PRNG state. This is the
	 * "any string → deterministic fingerprint" property.
	 */
	function digest64(s: string): bigint {
		// 64-bit FNV-1a constants
		const FNV_OFFSET = 0xcbf29ce484222325n;
		const FNV_PRIME = 0x100000001b3n;
		const MASK = 0xffffffffffffffffn;

		let h = FNV_OFFSET;
		for (let i = 0; i < s.length; i++) {
			h ^= BigInt(s.charCodeAt(i));
			h = (h * FNV_PRIME) & MASK;
		}
		return h;
	}

	// 4 chars * 4 bits = 16 hex chars
	function digestHex(s: string): string {
		return digest64(s).toString(16).padStart(16, '0');
	}

	// svelte-ignore state_referenced_locally
	const hex = digestHex(input ?? '');

	// Map the digest to a 2D tier grid. Each cell uses 2 bits of the digest
	// to pick one of 4 tiers. We walk bits in row-major order.
	// svelte-ignore state_referenced_locally
	const tier: number[][] = (() => {
		const d = digest64(input ?? '');
		const out: number[][] = [];
		let bit = 0;

		for (let y = 0; y < H; y++) {
			const row: number[] = [];
			for (let x = 0; x < W; x++) {
				// Take 2 bits starting at `bit`, LSB-first.
				const b0 = Number((d >> BigInt(bit)) & 1n);
				const b1 = Number((d >> BigInt(bit + 1)) & 1n);
				row.push(b0 | (b1 << 1));
				bit += 2;
			}
			out.push(row);
		}

		return out;
	})();

	// Scan line: a column that sweeps left-to-right then wraps.
	// Period = W + 6 (so the line fully exits the grid before re-entering).
	// svelte-ignore state_referenced_locally
	const initialTick = animated ? Math.floor((W + 6) * 0.4) : Math.floor((W + 6) * 0.5);
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
			tick = (tick + 1) % (W + 6);
		}, speedMs);

		return () => window.clearInterval(timer);
	});

	// Where the scan line currently is. -1..W-1; -W when wrapping.
	const scanCol = $derived(tick - 2);

	// Render the grid as RLE per row.
	const view = $derived.by((): Seg[] => {
		const out: Seg[] = [];

		// Header: input label
		const inputLabel = (input ?? '').slice(0, 28);
		const headerPad = Math.max(0, W - inputLabel.length - 4);
		out.push({ text: '·' });
		out.push({ text: ' ' });
		out.push({ text: inputLabel, cls: 'mid' });
		out.push({ text: ' '.repeat(headerPad) });
		out.push({ text: '\n' });

		for (let y = 0; y < H; y++) {
			out.push({ text: ' ' });
			for (let x = 0; x < W; x++) {
				const t = tier[y]![x]!;
				const ch = TIER[t]!;
				const onScan = x === scanCol;
				const cls =
					t === 0
						? onScan
							? 'faint-on'
							: 'faint'
						: t === 1
							? onScan
								? 'low-on'
								: 'low'
							: t === 2
								? onScan
									? 'mid-on'
									: 'mid'
								: onScan
									? 'high-on'
									: 'high';
				out.push({ text: ch, cls });
			}
			out.push({ text: '\n' });
		}

		// Hex digest on the bottom — split into 2 rows of 8 chars for width.
		out.push({ text: ' ' });
		out.push({ text: hex.slice(0, 8), cls: 'hex' });
		out.push({ text: ' ' });
		out.push({ text: hex.slice(8, 16), cls: 'hex' });

		return out;
	});
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="hash">
			<div class="viewport">
				<pre class="art" aria-hidden="true"><code>{#each view as seg, i (i)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}</code></pre>
			</div>
			<p class="caption">{label}</p>
		</div>
	</GraphBody>
</Graph>

<style>
	.hash {
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
		font-size: 0.95rem;
		line-height: 1.1;
		color: var(--text-primary, oklch(0.93 0 0));
		white-space: pre;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.05em;
	}

	/* Tier colors */
	.faint {
		color: var(--text-muted, oklch(0.3 0 0));
	}
	.low {
		color: var(--text-secondary, oklch(0.62 0 0));
	}
	.mid {
		color: var(--text-primary, oklch(0.93 0 0));
	}
	.high {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	/* Scan-line accent: same tier, but brightened */
	.faint-on {
		color: var(--text-secondary, oklch(0.62 0 0));
	}
	.low-on {
		color: var(--text-primary, oklch(0.93 0 0));
	}
	.mid-on {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}
	.high-on {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.hex {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.caption {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}
</style>
