<script module lang="ts">
	export interface GraphStateProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Animate the state cycle. Default true. Reduced motion freezes on the start state. */
		animated?: boolean;
		/** Milliseconds per state step. Default 700. */
		speedMs?: number;
		/** Short caption under the art; the chart itself is the message. */
		label?: string;
		class?: string;
	}

	interface State {
		id: string;
		label: string;
		col: number;
		row: number;
	}

	interface Transition {
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
	import { dashEdge, overlayRow, type ArtCell } from '../diagram/ascii';

	let {
		title,
		animated = true,
		speedMs = 700,
		label = 'state machine, stepping through',
		class: className = ''
	}: GraphStateProps = $props();

	// Hardcoded 2×2 layout: 14-wide boxes, vertical and horizontal arrows in
	// the gutters, 1-char gap between everything. W/H are scene dimensions
	// in characters; the Graph frame adds one row/col on each side.
	const W = 44;
	const H = 15;
	const BOX_W = 14;
	const BOX_H = 3;

	// svelte-ignore state_referenced_locally
	const states: State[] = [
		{ id: 'ready', label: 'ready', col: 2, row: 2 },
		{ id: 'think', label: 'think', col: 24, row: 2 },
		{ id: 'act', label: 'act', col: 24, row: 11 },
		{ id: 'done', label: 'done', col: 2, row: 11 }
	];

	// svelte-ignore state_referenced_locally
	const transitions: Transition[] = [
		{ from: 0, to: 1, label: 'ask' },
		{ from: 1, to: 2, label: 'plan' },
		{ from: 2, to: 3, label: 'ok' },
		{ from: 3, to: 0, label: 'reset' }
	];

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
			tick = (tick + 1) % states.length;
		}, speedMs);
		return () => window.clearInterval(timer);
	});

	// The current state and its outgoing transition both glow. Under reduced
	// motion this freezes on the start state with the first transition lit,
	// which reads as "ready to begin".
	const currentState = $derived(tick % states.length);
	const currentTransition = $derived(transitions[currentState]!);

	/** Build the three cells that draw one state box at (col, row). */
	function boxRow(s: State, y: number, cls: string): ArtCell {
		const top = dashEdge(BOX_W);
		const inner = BOX_W - 2;
		const pad = inner - s.label.length;
		const left = Math.floor(pad / 2);
		const right = pad - left;
		const mid = '|' + ' '.repeat(left) + s.label + ' '.repeat(right) + '|';
		const yOff = y - s.row;
		// yOff: 0 = top edge, 1 = label row, 2 = bottom edge.
		const text = yOff === 0 || yOff === 2 ? top : mid;
		return { at: s.col, text, cls };
	}

	/** Build the cells that draw one horizontal arrow between two boxes. */
	function hArrowCells(c1: number, c2: number, lbl: string, cls: string): ArtCell[] {
		const isRight = c2 > c1;
		if (isRight) {
			const dashStart = c1 + BOX_W;
			const dashEnd = c2 - 2;
			const headX = c2 - 1;
			const labelCenter = Math.round((dashStart + dashEnd) / 2);
			const labelStart = Math.max(dashStart, labelCenter - Math.floor(lbl.length / 2));
			const dashLen = Math.max(0, dashEnd - dashStart + 1);
			return [
				{ at: dashStart, text: '─'.repeat(dashLen), cls },
				{ at: labelStart, text: lbl, cls },
				{ at: headX, text: '▶', cls }
			];
		}
		const dashStart = c2 + BOX_W + 1;
		const dashEnd = c1 - 1;
		const headX = c2 + BOX_W;
		const labelCenter = Math.round((dashStart + dashEnd) / 2);
		const labelStart = Math.max(dashStart, labelCenter - Math.floor(lbl.length / 2));
		const dashLen = Math.max(0, dashEnd - dashStart + 1);
		return [
			{ at: headX, text: '◀', cls },
			{ at: labelStart, text: lbl, cls },
			{ at: dashStart, text: '─'.repeat(dashLen), cls }
		];
	}

	const view = $derived.by((): Seg[][] => {
		const lines: Seg[][] = [];

		for (let y = 0; y < H; y++) {
			const cells: ArtCell[] = [];

			// State boxes.
			for (let i = 0; i < states.length; i++) {
				const s = states[i]!;
				const inBox = y >= s.row && y <= s.row + BOX_H - 1;
				if (!inBox) {
					continue;
				}
				const isCurrent = i === currentState;
				const cls = isCurrent ? 'on' : 'state';
				cells.push(boxRow(s, y, cls));
			}

			// Top horizontal: ready → think (row 3).
			if (y === 3) {
				const t = transitions[0]!;
				const isCurrentT =
					currentTransition.from === t.from && currentTransition.to === t.to;
				cells.push(
					...hArrowCells(
						states[t.from]!.col,
						states[t.to]!.col,
						t.label,
						isCurrentT ? 'on' : 'arrow'
					)
				);
			}

			// Bottom horizontal: act → done (row 12), right to left.
			if (y === 12) {
				const t = transitions[2]!;
				const isCurrentT =
					currentTransition.from === t.from && currentTransition.to === t.to;
				cells.push(
					...hArrowCells(
						states[t.from]!.col,
						states[t.to]!.col,
						t.label,
						isCurrentT ? 'on' : 'arrow'
					)
				);
			}

			// Right vertical: think → act (col 38, rows 5–10, head v at row 10).
			if (y >= 5 && y <= 10) {
				const t = transitions[1]!;
				const isCurrentT =
					currentTransition.from === t.from && currentTransition.to === t.to;
				const cls = isCurrentT ? 'on' : 'arrow';
				cells.push({ at: 38, text: y === 10 ? 'v' : '│', cls });
				if (y === 7) {
					cells.push({ at: 39, text: t.label, cls });
				}
			}

			// Left vertical: done → ready (col 16, rows 5–10, head ^ at row 5).
			if (y >= 5 && y <= 10) {
				const t = transitions[3]!;
				const isCurrentT =
					currentTransition.from === t.from && currentTransition.to === t.to;
				const cls = isCurrentT ? 'on' : 'arrow';
				cells.push({ at: 16, text: y === 5 ? '^' : '│', cls });
				if (y === 8) {
					cells.push({ at: 17, text: t.label, cls });
				}
			}

			lines.push(overlayRow(W, cells));
		}

		return lines;
	});
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="state">
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
	.state {
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

	/* Per-class styling for the spans inside <pre>. */
	:global(.state span.state) {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	:global(.state span.on) {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	:global(.state span.arrow) {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.caption {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}
</style>
