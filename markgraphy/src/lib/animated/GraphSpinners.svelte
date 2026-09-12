<script module lang="ts">
	/** Which built-in glyph spinner to show. */
	export type SpinnerKind = 'slash' | 'dots' | 'bounce' | 'bar';

	/** Built-in frame sets. All glyphs are inside the Geist Mono whitelist. */
	const FRAME_SETS: Record<SpinnerKind, string[]> = {
		slash: ['|', '/', '-', '\\'],
		dots: ['·', '··', '···', '··'],
		bounce: ['▁', '▃', '▄', '▅', '▆', '▇', '█', '▇', '▆', '▄', '▃'],
		bar: ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█']
	};

	export interface GraphSpinnersProps {
		/** Caption drawn on the frame's top edge as `[ TITLE ]`. */
		title: string;
		/** Which glyph spinner to show. Default 'dots'. */
		kind?: SpinnerKind;
		/** Text shown after the spinner. Default 'loading'. */
		label?: string;
		/** Milliseconds per frame. Default 120. */
		speedMs?: number;
		/** Custom frame set. Overrides `kind` when non-empty. Padded to equal width. */
		frames?: string[];
		/** Animate the frames. Default true. Reduced motion holds frame 0. */
		animated?: boolean;
		/** Character at each corner of the frame. Default '+'. */
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';

	let {
		title,
		kind = 'dots',
		label = 'loading',
		speedMs = 120,
		frames,
		animated = true,
		corner,
		class: className = ''
	}: GraphSpinnersProps = $props();

	let frame = $state(0);

	const moving = $derived(
		animated &&
			(typeof window === 'undefined' ||
				!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	);

	/** Active frames, padded with trailing spaces so nothing shifts between steps. */
	const effFrames = $derived.by(() => {
		const src = frames && frames.length > 0 ? frames : FRAME_SETS[kind];
		const width = src.reduce((max, f) => Math.max(max, f.length), 1);

		return src.map((f) => f + ' '.repeat(width - f.length));
	});

	$effect(() => {
		if (!moving || effFrames.length === 0) {
			return;
		}

		const timer = window.setInterval(() => {
			frame = (frame + 1) % effFrames.length;
		}, Math.max(50, speedMs));

		return () => window.clearInterval(timer);
	});

	// Static or reduced motion: hold frame 0.
	const shown = $derived(
		moving && effFrames.length > 0 ? effFrames[frame % effFrames.length] : (effFrames[0] ?? '')
	);
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="spinner">
			<pre class="art"><code><span class="glyph">{shown}</span><span class="label"> {label}</span></code></pre>
		</div>
	</GraphBody>
</Graph>

<style>
	.spinner {
		min-width: 0;
	}

	.art {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.35;
		color: var(--text-secondary, oklch(0.62 0 0));
		white-space: pre;
	}

	.glyph {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.label {
		color: var(--text-secondary, oklch(0.62 0 0));
	}
</style>
