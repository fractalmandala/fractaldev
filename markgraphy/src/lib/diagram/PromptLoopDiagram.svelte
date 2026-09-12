<script module lang="ts">
	export interface PromptLoopDiagramProps {
		/** Start playing on mount. Default true. */
		autoPlay?: boolean;
		/** Milliseconds per step. Default 1200. */
		speedMs?: number;
		/** Show the playback controls. Default true. */
		showControls?: boolean;
		class?: string;
	}
</script>

<script lang="ts">
	import { dashEdge, labeledEdgeSegs, overlayRow, padRow, type ArtSeg } from './ascii';

	let {
		autoPlay = true,
		speedMs = 1200,
		showControls = true,
		class: className = ''
	}: PromptLoopDiagramProps = $props();

	const WIDTH = 55;
	const STEPS = 6;

	const uid = $props.id();

	// svelte-ignore state_referenced_locally
	let step = $state(0);
	// svelte-ignore state_referenced_locally
	let isPlaying = $state(autoPlay);
	// svelte-ignore state_referenced_locally
	let intervalTime = $state(speedMs);

	$effect(() => {
		if (!isPlaying) {
			return;
		}

		const timer = window.setInterval(() => {
			step = (step + 1) % STEPS;
		}, intervalTime);

		return () => window.clearInterval(timer);
	});

	function handleTogglePlay() {
		isPlaying = !isPlaying;
	}

	function handleNext() {
		step = (step + 1) % STEPS;
	}

	function handlePrev() {
		step = (step - 1 + STEPS) % STEPS;
	}

	const flow = (k: number) => (step === k ? 'flow on' : 'flow');
	const node = (k: number) => (step === k ? 'node on' : 'node');
	const back = () => (step === 5 ? 'back on' : 'back');

	const art = $derived.by((): ArtSeg[][] => {
		return [
			labeledEdgeSegs(WIDTH, 'The Prompt Loop'),
			[{ text: padRow(WIDTH) }],
			overlayRow(WIDTH, [{ at: 8, text: '~> Ask for the thing you want', cls: node(0) }]),
			overlayRow(WIDTH, [{ at: 26, text: '│', cls: flow(0) }]),
			overlayRow(WIDTH, [{ at: 26, text: 'v', cls: flow(0) }]),
			overlayRow(WIDTH, [
				{ at: 21, text: 'AI builds it', cls: node(1) },
				{ at: 35, text: '◀ - - - - - - - ┐', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 26, text: '│', cls: flow(1) },
				{ at: 51, text: '│', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 26, text: 'v', cls: flow(1) },
				{ at: 51, text: '│', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 16, text: "It's not quite right", cls: node(2) },
				{ at: 51, text: '│', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 26, text: '│', cls: flow(2) },
				{ at: 51, text: '│', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 26, text: 'v', cls: flow(2) },
				{ at: 51, text: '│', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 8, text: '~> Make me a few variants', cls: node(3) },
				{ at: 51, text: '│', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 26, text: '│', cls: flow(3) },
				{ at: 51, text: '│', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 26, text: 'v', cls: flow(3) },
				{ at: 51, text: '│', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 16, text: 'v1 · v2 · v3 · v4', cls: node(3) },
				{ at: 51, text: '│', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 26, text: '│', cls: flow(3) },
				{ at: 51, text: '│', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 26, text: 'v', cls: flow(3) },
				{ at: 51, text: '│', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 17, text: 'None of them are it', cls: node(4) },
				{ at: 51, text: '│', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 26, text: '│', cls: flow(4) },
				{ at: 51, text: '│', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 26, text: 'v', cls: flow(4) },
				{ at: 51, text: '│', cls: back() }
			]),
			overlayRow(WIDTH, [
				{ at: 26, text: '└', cls: back() },
				{ at: 28, text: '- - - - - - - - - - -', cls: back() },
				{ at: 51, text: '┘', cls: back() }
			]),
			overlayRow(WIDTH, [{ at: 30, text: 'Repeat forever', cls: step === 5 ? 'tag on' : 'tag' }]),
			[{ text: padRow(WIDTH) }],
			[{ text: dashEdge(WIDTH) }]
		];
	});
</script>

<div class="loop {className}">
	<div class="viewport">
		<pre class="art"><code>{#each art as line, i (i)}{#each line as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{#if i < art.length - 1}{'\n'}{/if}{/each}</code></pre>
	</div>

	{#if showControls}
		<div class="controls">
			<div class="buttons">
				<button class="ctrl" type="button" onclick={handlePrev} aria-label="Previous step">◀</button>
				<button class="ctrl primary" type="button" onclick={handleTogglePlay}>
					{isPlaying ? '❚❚ pause' : '▶ play'}
				</button>
				<button class="ctrl" type="button" onclick={handleNext} aria-label="Next step">▶</button>
			</div>

			<div class="dots">
				{#each [0, 1, 2, 3, 4, 5] as s (s)}
					<button
						class="dot"
						class:on={step === s}
						type="button"
						onclick={() => {
							step = s;
							isPlaying = false;
						}}
						aria-label="Step {s + 1}"
					></button>
				{/each}
			</div>

			<label class="speed" for="{uid}-speed">
				Speed {(intervalTime / 1000).toFixed(1)}s
				<input id="{uid}-speed" type="range" min="400" max="2500" step="100" bind:value={intervalTime} />
			</label>
		</div>
	{/if}
</div>

<style>
	.loop {
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
		line-height: 1.35;
		color: var(--border, oklch(0.6 0 0 / 0.5));
		white-space: pre;
	}

	.node {
		color: var(--text-secondary, oklch(0.62 0 0));
		transition: color 0.25s ease;
	}

	.node.on {
		color: var(--text-primary, oklch(0.93 0 0));
		font-weight: 600;
	}

	.flow {
		color: var(--text-muted, oklch(0.3 0 0));
		transition: color 0.25s ease;
	}

	.back {
		color: var(--text-muted, oklch(0.3 0 0));
		transition: color 0.25s ease;
	}

	.back.on {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.tag {
		color: var(--text-secondary, oklch(0.62 0 0));
		font-style: italic;
		transition: color 0.25s ease;
	}

	.tag.on {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	@media (prefers-reduced-motion: no-preference) {
		.flow.on {
			color: var(--graph-accent, oklch(0.78 0.17 155));
			font-weight: 600;
			animation: pulse 1s infinite alternate;
		}

		@keyframes pulse {
			from {
				opacity: 0.7;
			}

			to {
				opacity: 1;
			}
		}
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
		padding-top: 0.875rem;
		border-top: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
	}

	.buttons {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.ctrl {
		padding: 0.25rem 0.6rem;
		font-size: 0.75rem;
		color: var(--text-secondary, oklch(0.62 0 0));
		background: none;
		border: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
		border-radius: 0;
		cursor: pointer;
	}

	.ctrl:hover {
		color: var(--text-primary, oklch(0.93 0 0));
		border-color: var(--text-secondary, oklch(0.62 0 0));
	}

	.primary {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		border-color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.dots {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.dot {
		width: 8px;
		height: 8px;
		padding: 0;
		background: var(--text-muted, oklch(0.3 0 0));
		border: none;
		border-radius: 50%;
		cursor: pointer;
	}

	.dot.on {
		background: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.speed {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: var(--text-secondary, oklch(0.62 0 0));
		white-space: nowrap;
	}

	.speed input {
		width: 80px;
		height: 4px;
		accent-color: var(--graph-accent, oklch(0.78 0.17 155));
		cursor: pointer;
	}
</style>
