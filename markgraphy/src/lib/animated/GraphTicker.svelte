<script module lang="ts">
	/** One token of the marquee: a label plus its health status. */
	export interface TickerItem {
		label: string;
		status: 'ok' | 'warn' | 'down';
	}

	export interface GraphTickerProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Tokens rotated through the row, in order. */
		items: TickerItem[];
		/** Milliseconds per rotation step. Default 140. */
		speedMs?: number;
		/** Animate the rotation. Default true. Reduced motion shows the first items. */
		animated?: boolean;
		/** Character at each corner of the frame. Default '+'. */
		corner?: string;
		class?: string;
	}

	interface Seg {
		text: string;
		cls?: string;
	}

	/** Visible columns the row is padded to. */
	const COLS = 44;
	/** Separator between tokens. '·' is U+00B7, covered by Geist Mono. */
	const SEP = '  ·  ';

	const BADGE: Record<TickerItem['status'], string> = {
		ok: '[ OK ]',
		warn: '[ WARN ]',
		down: '[ DOWN ]'
	};
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';

	let {
		title,
		items,
		speedMs = 140,
		animated = true,
		corner,
		class: className = ''
	}: GraphTickerProps = $props();

	let offset = $state(0);

	const moving = $derived(
		animated &&
			(typeof window === 'undefined' ||
				!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	);

	$effect(() => {
		if (!moving || items.length < 2) {
			return;
		}

		const timer = window.setInterval(() => {
			offset = (offset + 1) % items.length;
		}, speedMs);

		return () => window.clearInterval(timer);
	});

	// Whole tokens rotate position, so status colors stay attached to their
	// labels — the row is never sliced mid-token. Frozen state always renders
	// from the first item.
	const row = $derived.by((): Seg[] => {
		const base = moving ? offset : 0;
		const segs: Seg[] = [];
		let used = 0;

		for (let i = 0; i < items.length; i += 1) {
			const item = items[(base + i) % items.length];
			const token = `${BADGE[item.status]} ${item.label}`;

			if (segs.length > 0 && used + SEP.length + token.length > COLS) {
				break;
			}

			if (segs.length > 0) {
				segs.push({ text: SEP, cls: 'sep' });
				used += SEP.length;
			}

			segs.push({ text: token, cls: item.status });
			used += token.length;
		}

		if (used < COLS) {
			segs.push({ text: ' '.repeat(COLS - used) });
		}

		return segs;
	});
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="viewport">
			<pre class="art"><code>{#key offset}<span class="tick" class:live={moving}>{#each row as seg, i (i)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}</span>{/key}</code></pre>
		</div>
	</GraphBody>
</Graph>

<style>
	.viewport {
		overflow-x: auto;
	}

	.art {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.4;
		color: var(--text-secondary, oklch(0.62 0 0));
		white-space: pre;
	}

	.tick {
		display: inline-block;
	}

	.ok {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.warn {
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.down {
		color: var(--text-muted, oklch(0.3 0 0));
	}

	.sep {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	@media (prefers-reduced-motion: no-preference) {
		.tick.live {
			animation: tick 0.14s ease-out;
		}

		@keyframes tick {
			from {
				opacity: 0.4;
				transform: translateX(0.3rem);
			}

			to {
				opacity: 1;
				transform: translateX(0);
			}
		}
	}
</style>
