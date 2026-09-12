<script module lang="ts">
	export interface GraphFlameProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Animate the hot-path cycle. Default true. Reduced motion freezes on the first leaf. */
		animated?: boolean;
		/** Milliseconds per leaf. Default 600. */
		speedMs?: number;
		/** Short caption under the art; the chart itself is the message. */
		label?: string;
		class?: string;
	}

	interface Frame {
		name: string;
		width: number;
		children?: Frame[];
	}

	interface Positioned {
		name: string;
		width: number;
		row: number;
		startX: number;
		endX: number;
		inPath: boolean;
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
		speedMs = 600,
		label = 'flame graph, width = time',
		class: className = ''
	}: GraphFlameProps = $props();

	// Scene width in characters. Each frame's width is its share of the
	// parent's width; siblings sum to the parent. 60 chars reads cleanly
	// even at the narrowest leaves.
	const W = 60;

	// svelte-ignore state_referenced_locally
	const root: Frame = {
		name: 'main',
		width: W,
		children: [
			{
				name: 'boot',
				width: 18,
				children: [
					{
						name: 'init',
						width: 8,
						children: [
							{ name: 'load', width: 5 },
							{ name: 'parse', width: 3 }
						]
					},
					{ name: 'check', width: 10 }
				]
			},
			{
				name: 'run',
				width: 30,
				children: [
					{
						name: 'work',
						width: 18,
						children: [
							{ name: 'step', width: 8 },
							{ name: 'io', width: 10 }
						]
					},
					{ name: 'tail', width: 12 }
				]
			},
			{ name: 'exit', width: 12 }
		]
	};

	// Each leaf has a path of ancestors from the root. One tick per leaf
	// keeps the cycle short and the visual change easy to read.
	// svelte-ignore state_referenced_locally
	const paths: string[][] = [
		['main', 'boot', 'init', 'load'],
		['main', 'boot', 'init', 'parse'],
		['main', 'run', 'work', 'step'],
		['main', 'run', 'work', 'io']
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
			tick = (tick + 1) % paths.length;
		}, speedMs);
		return () => window.clearInterval(timer);
	});

	// Frozen on paths[0] under reduced motion — the load leaf and its
	// chain, so the static frame already reads as "the hot path".
	const currentPath = $derived(new Set(paths[tick % paths.length]!));

	function maxDepth(frame: Frame, depth = 0): number {
		if (!frame.children || frame.children.length === 0) {
			return depth;
		}
		let best = depth;
		for (const c of frame.children) {
			const d = maxDepth(c, depth + 1);
			if (d > best) {
				best = d;
			}
		}
		return best;
	}

	// svelte-ignore state_referenced_locally
	const H = maxDepth(root) + 1;

	function layout(
		frame: Frame,
		row: number,
		startX: number,
		path: Set<string>,
		out: Positioned[]
	): void {
		out.push({
			name: frame.name,
			width: frame.width,
			row,
			startX,
			endX: startX + frame.width,
			inPath: path.has(frame.name)
		});
		if (frame.children) {
			let cx = startX;
			for (const child of frame.children) {
				layout(child, row + 1, cx, path, out);
				cx += child.width;
			}
		}
	}

	/**
	 * Draw one frame as a bar of glyphs. Narrow frames collapse to just the
	 * side borders; wider frames get a left-aligned label and a fill of
	 * shade glyphs. The fill density is the only thing that distinguishes
	 * a hot frame from a cool one in monochrome.
	 */
	function renderFrame(name: string, width: number, isHot: boolean): string {
		if (width < 1) {
			return '';
		}
		if (width === 1) {
			return '│';
		}
		if (width === 2) {
			return '││';
		}
		const interior = width - 2;
		const labelLen = Math.min(name.length, interior);
		const label = name.slice(0, labelLen);
		const fillCount = interior - labelLen;
		const fill = isHot ? '█' : '▒';
		return '│' + label + fill.repeat(fillCount) + '│';
	}

	const view = $derived.by((): Seg[][] => {
		const positioned: Positioned[] = [];
		layout(root, 0, 0, currentPath, positioned);

		const lines: Seg[][] = [];
		for (let row = 0; row < H; row++) {
			const cells: ArtCell[] = positioned
				.filter((f) => f.row === row)
				.map((f) => ({
					at: f.startX,
					text: renderFrame(f.name, f.width, f.inPath),
					cls: f.inPath ? 'on' : 'flame'
				}));
			lines.push(overlayRow(W, cells));
		}

		return lines;
	});
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="flame">
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
	.flame {
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

	:global(.flame span.flame) {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	:global(.flame span.on) {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.caption {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}
</style>
