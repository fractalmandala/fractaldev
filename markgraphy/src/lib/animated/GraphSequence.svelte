<script module lang="ts">
	export interface GraphSequenceProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Animate the message flow. Default true. Reduced motion freezes the first message as current. */
		animated?: boolean;
		/** Width of the scene in characters; at least 40 so four participants fit. Default 68. */
		cols?: number;
		/** Height of the scene in rows; at least 10 so header + 6 messages fit. Default 12. */
		rows?: number;
		/** Milliseconds per message. Default 600. */
		speedMs?: number;
		/** Short caption under the art; the diagram itself is the message. */
		label?: string;
		class?: string;
	}

	interface Participant {
		label: string;
		col: number;
	}

	interface Message {
		from: number;
		to: number;
		label: string;
	}

	interface Seg {
		text: string;
		cls?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { overlayRow, type ArtCell } from '../diagram/ascii';

	let {
		title,
		animated = true,
		cols = 68,
		rows = 12,
		speedMs = 600,
		label = 'who calls who, in order',
		class: className = ''
	}: GraphSequenceProps = $props();

	// svelte-ignore state_referenced_locally
	const width = Math.max(40, cols);
	// svelte-ignore state_referenced_locally
	const height = Math.max(10, rows);

	// Four participants at 12% / 38% / 62% / 88% of the width so the labels
	// sit centered on the lifelines and never collide with the side borders.
	// svelte-ignore state_referenced_locally
	const participants: Participant[] = (() => {
		const labels = ['Browser', 'Server', 'DB', 'Worker'];
		const stops = [0.12, 0.38, 0.62, 0.88];
		return labels.map((l, i) => ({ label: l, col: Math.max(2, Math.floor(width * stops[i]!)) }));
	})();

	// A request that fans out to a DB, queues a job, and comes back.
	const messages: Message[] = [
		{ from: 0, to: 1, label: 'GET /api' },
		{ from: 1, to: 2, label: 'query' },
		{ from: 2, to: 3, label: 'enqueue' },
		{ from: 3, to: 2, label: 'result' },
		{ from: 2, to: 1, label: 'rows' },
		{ from: 1, to: 0, label: '200 OK' }
	];

	// Each activation is a row-range during which a participant's lifeline is
	// drawn as a filled bar (the participant is busy). Rows outside are `│`.
	// svelte-ignore state_referenced_locally
	const activations: { pIdx: number; startRow: number; endRow: number }[] = (() => {
		const firstRow = 3;
		const lastRow = firstRow + messages.length - 1;
		return [
			{ pIdx: 0, startRow: firstRow, endRow: lastRow },
			{ pIdx: 1, startRow: firstRow, endRow: lastRow },
			{ pIdx: 2, startRow: firstRow + 1, endRow: firstRow + 4 },
			{ pIdx: 3, startRow: firstRow + 2, endRow: firstRow + 3 }
		];
	})();

	const headerRow = 1;
	const firstMsgRow = 3;

	// svelte-ignore state_referenced_locally
	let tick = $state(0);

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
			tick = (tick + 1) % messages.length;
		}, speedMs);
		return () => window.clearInterval(timer);
	});

	// Pin the current message at the last one when the loop wraps.
	const currentMsg = $derived(Math.min(tick, messages.length - 1));

	/**
	 * Build the three cells that draw a single arrow: a run of dashes, a
	 * centered label, and the head. The label is opaque so it sits on top of
	 * the dashes without us having to split the run.
	 */
	function arrowCells(c1: number, c2: number, isRight: boolean, lbl: string, cls: string): ArtCell[] {
		const c1min = Math.min(c1, c2);
		const c2max = Math.max(c1, c2);
		const headX = isRight ? c2max - 1 : c1min + 1;
		const dashStart = isRight ? c1min + 1 : headX + 1;
		const dashEnd = isRight ? headX - 1 : c2max - 1;
		const labelCenter = Math.round((dashStart + dashEnd) / 2);
		const labelStart = Math.max(dashStart, labelCenter - Math.floor(lbl.length / 2));
		const dashLen = Math.max(0, dashEnd - dashStart + 1);
		return [
			{ at: dashStart, text: '─'.repeat(dashLen), cls },
			{ at: labelStart, text: lbl, cls },
			{ at: headX, text: isRight ? '▶' : '◀', cls }
		];
	}

	const view = $derived.by((): Seg[][] => {
		const lines: Seg[][] = [];

		for (let y = 0; y < height; y++) {
			const cells: ArtCell[] = [];
			const isHeader = y === headerRow;
			const msgIdx = y - firstMsgRow;
			const inRange = msgIdx >= 0 && msgIdx < messages.length;
			const m = inRange ? messages[msgIdx]! : null;
			const isCurrent = m !== null && msgIdx === currentMsg;

			// Lifelines — skip on the header row so the participant name
			// can sit centered on the column without a `│` punching through.
			if (!isHeader) {
				for (let i = 0; i < participants.length; i++) {
					const p = participants[i]!;
					const act = activations.find((a) => a.pIdx === i);
					const inActivation = !!act && y >= act.startRow && y <= act.endRow;
					const isCurrentPart = isCurrent && m !== null && (i === m.from || i === m.to);

					if (inActivation) {
						cells.push({ at: p.col, text: '█', cls: isCurrentPart ? 'on' : 'active' });
					} else {
						cells.push({ at: p.col, text: '│', cls: 'lifeline' });
					}
				}
			}

			// Participant labels on the header row.
			if (isHeader) {
				for (const p of participants) {
					const start = p.col - Math.floor(p.label.length / 2);
					cells.push({ at: start, text: p.label, cls: 'participant' });
				}
			}

			// Arrow row for the current message (if any).
			if (m !== null) {
				const p1 = participants[m.from]!;
				const p2 = participants[m.to]!;
				const isRight = p2.col > p1.col;
				const cls = isCurrent ? 'on' : 'arrow';
				cells.push(...arrowCells(p1.col, p2.col, isRight, m.label, cls));
			}

			lines.push(overlayRow(width, cells));
		}

		return lines;
	});
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="sequence">
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
	.sequence {
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
		line-height: 1.2;
		color: var(--text-primary, oklch(0.93 0 0));
		white-space: pre;
	}

	.participant {
		color: var(--text-primary, oklch(0.93 0 0));
		font-weight: 600;
	}

	.lifeline {
		color: var(--border, oklch(0.6 0 0 / 0.5));
	}

	.active {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.arrow {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.on {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.caption {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}
</style>
