<script module lang="ts">
	export interface GraphTypewriterProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Lines typed one character at a time, in order. */
		lines: string[];
		/** Milliseconds per character. Default 55. */
		speedMs?: number;
		/** Milliseconds to hold the full text before restarting. Default 1400. */
		holdMs?: number;
		/** Clear and retype after the hold. Default true. */
		loop?: boolean;
		/** Cursor character shown after the last revealed character. Default '█'. */
		cursor?: string;
		/** Animate the typing. Default true. Reduced motion shows the full text. */
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
		lines,
		speedMs = 55,
		holdMs = 1400,
		loop = true,
		cursor = '█',
		animated = true,
		corner,
		class: className = ''
	}: GraphTypewriterProps = $props();

	let count = $state(0);

	const moving = $derived(
		animated &&
			(typeof window === 'undefined' ||
				!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	);

	const total = $derived(lines.reduce((sum, line) => sum + line.length, 0));
	const finished = $derived(count >= total);
	const blinking = $derived(moving && !(finished && !loop));

	$effect(() => {
		if (!moving) {
			return;
		}

		if (count < total) {
			const timer = window.setTimeout(() => {
				count += 1;
			}, speedMs);

			return () => window.clearTimeout(timer);
		}

		if (loop) {
			const timer = window.setTimeout(() => {
				count = 0;
			}, holdMs);

			return () => window.clearTimeout(timer);
		}
	});

	const view = $derived.by(() => {
		// Frozen (reduced motion or animated=false): everything revealed at once.
		let left = moving ? count : Number.POSITIVE_INFINITY;
		const rows: string[] = [];
		let at = lines.length > 0 ? 0 : -1;

		for (let i = 0; i < lines.length; i += 1) {
			const take = Math.max(0, Math.min(lines[i].length, left));
			rows.push(lines[i].slice(0, take));

			if (take > 0) {
				at = i;
			}

			left -= take;
		}

		return { rows, at };
	});
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="viewport">
			<pre class="art"><code>{#each view.rows as row, i (i)}{row}{#if i === view.at}<span class="cursor" class:blinking>{cursor}</span>{/if}{#if i < view.rows.length - 1}{'\n'}{/if}{/each}</code></pre>
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

	.cursor {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	@media (prefers-reduced-motion: no-preference) {
		.cursor.blinking {
			animation: blink 1.1s steps(1) infinite;
		}

		@keyframes blink {
			50% {
				opacity: 0;
			}
		}
	}
</style>
