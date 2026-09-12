<script module lang="ts">
	export interface AmplifierDiagramProps {
		/** Starting gain multiplier. Default 3.5. */
		gain?: number;
		/** Show the gain slider and dB readout. Default true. */
		interactive?: boolean;
		/** Animate the waves. Default true. Reduced motion freezes them. */
		animated?: boolean;
		class?: string;
	}
</script>

<script lang="ts">
	import { dashEdge, padRow, splitLabeledEdge, type ArtSeg } from './ascii';

	let {
		gain = 3.5,
		interactive = true,
		animated = true,
		class: className = ''
	}: AmplifierDiagramProps = $props();

	const BARS = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
	const WIDTH = 66;

	const uid = $props.id();

	// svelte-ignore state_referenced_locally
	let multiplier = $state(gain);
	let frame = $state(0);

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
			frame = (frame + 1) % 12;
		}, 150);

		return () => window.clearInterval(timer);
	});

	// Your taste: a small, calm wave. Five columns, always.
	const tasteWave = $derived.by(() => {
		const base = [1, 3, 5, 3, 1];
		return base
			.map((h, i) => BARS[Math.min(7, Math.max(0, h + Math.round(Math.sin((frame + i) * 0.8) * 0.8)))])
			.join('');
	});

	// Amplified: large, scaled by the gain slider. Nine columns, always.
	const ampWave = $derived.by(() => {
		const base = [2, 4, 6, 7, 7, 7, 6, 4, 2];
		return base
			.map((h, i) => {
				const scaled = Math.round((h * multiplier) / 3 + Math.sin((frame + i * 2) * 0.6) * 1.2);
				return BARS[Math.min(7, Math.max(1, scaled))];
			})
			.join('');
	});

	const arrows = '- - - - ▶';

	const art = $derived.by((): ArtSeg[][] => {
		const [edgeBefore, edgeLabel, edgeAfter] = splitLabeledEdge(WIDTH, 'AI IS AN AMPLIFIER');

		return [
			[
				{ text: edgeBefore },
				{ text: edgeLabel, cls: 'title' },
				{ text: edgeAfter }
			],
			[{ text: padRow(WIDTH) }],
			[
				{ text: '|        ' },
				{ text: tasteWave, cls: 'taste' },
				{ text: `     ${arrows}  ` },
				{ text: 'AI', cls: 'chip' },
				{ text: `  ${arrows}     ` },
				{ text: ampWave, cls: 'wave' },
				{ text: '        |' }
			],
			[
				{ text: '|      ', cls: '' },
				{ text: 'your taste', cls: 'muted' },
				{ text: '                               ' },
				{ text: 'amplified', cls: 'muted' },
				{ text: '        |' }
			],
			[{ text: padRow(WIDTH) }],
			[{ text: dashEdge(WIDTH) }]
		];
	});
</script>

<div class="amp {className}">
	<div class="viewport">
		<pre class="art"><code>{#each art as line, i (i)}{#each line as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{#if i < art.length - 1}{'\n'}{/if}{/each}</code></pre>
	</div>

	{#if interactive}
		<div class="controls">
			<label class="gain" for="{uid}-gain">
				Amplification <span class="badge">{multiplier.toFixed(1)}x</span>
				<input id="{uid}-gain" type="range" min="1" max="5" step="0.1" bind:value={multiplier} />
			</label>
			<p class="hint">Signal power: <code>+{(multiplier * 6).toFixed(1)} dB</code></p>
		</div>
	{/if}
</div>

<style>
	.amp {
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
		color: var(--border, oklch(0.6 0 0 / 0.5));
		white-space: pre;
	}

	.title {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.taste {
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.chip {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.wave {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.muted {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 0.875rem;
		border-top: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
	}

	.gain {
		display: flex;
		flex: 1;
		max-width: 20rem;
		align-items: center;
		gap: 0.75rem;
		color: var(--text-secondary, oklch(0.62 0 0));
		white-space: nowrap;
	}

	.gain input {
		flex: 1;
		min-width: 0;
		height: 4px;
		accent-color: var(--graph-accent, oklch(0.78 0.17 155));
		cursor: pointer;
	}

	.badge {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		border: 1px dashed var(--graph-accent, oklch(0.78 0.17 155));
		padding: 0.1rem 0.4rem;
		font-size: 0.75rem;
	}

	.hint {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.hint code {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}
</style>
