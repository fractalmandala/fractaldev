<script module lang="ts">
	export interface TerminalLine {
		/** 'prompt' for the `$ ` prefix line, 'output' for streamed text. */
		kind: 'prompt' | 'output';
		/** Text content. For 'prompt' this is the typed command; for 'output' the streamed block. */
		text: string;
	}

	export interface GraphTerminalProps {
		/** Caption on the frame's top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title: string;
		/** Scripted session: prompt lines get typed character-by-character; output lines stream. */
		lines: TerminalLine[];
		/** Milliseconds per character (typing). Default 28. */
		typeMs?: number;
		/** Milliseconds per character (streaming output). Default 14. */
		streamMs?: number;
		/** Milliseconds to hold the fully-revealed script before restarting. Default 1600. */
		holdMs?: number;
		/** Loop the session. Default true. */
		loop?: boolean;
		/** Animate the typing and streaming. Default true. Reduced motion shows full script. */
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
		lines,
		typeMs = 28,
		streamMs = 14,
		holdMs = 1600,
		loop = true,
		animated = true,
		label = 'a session, scripted',
		class: className = ''
	}: GraphTerminalProps = $props();

	interface Seg {
		text: string;
		cls?: string;
	}

	const script: TerminalLine[] = lines.length > 0
		? lines
		: [
				{ kind: 'prompt', text: 'echo ready' },
				{ kind: 'output', text: 'ready' }
			];

	// Per-character durations for each line, in ticks (1 char = 1 tick).
	const charMs: number[] = script.map((l) => (l.kind === 'prompt' ? typeMs : streamMs));
	const totalChars: number = script.reduce((sum, l) => sum + l.text.length, 0);

	const initialChar = animated ? Math.floor(totalChars * 0.55) : totalChars;

	let char = $state(initialChar);

	const moving = $derived(
		animated &&
			(typeof window === 'undefined' ||
				!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	);

	$effect(() => {
		if (!moving) {
			return;
		}

		if (char < totalChars) {
			// We have to advance at a variable rate depending on the current line's kind.
			// Find the active line by accumulating characters, then advance one char
			// at the current line's per-char duration.
			let acc = 0;
			let active = 0;
			for (let i = 0; i < script.length; i++) {
				const next = acc + script[i]!.text.length;
				if (char >= acc && char < next) {
					active = i;
					break;
				}
				acc = next;
			}
			const delay = charMs[active] ?? typeMs;

			const timer = window.setTimeout(() => {
				char += 1;
			}, delay);

			return () => window.clearTimeout(timer);
		}

		if (loop) {
			const timer = window.setTimeout(() => {
				char = 0;
			}, holdMs);

			return () => window.clearTimeout(timer);
		}
	});

	// Reveal computation: how many chars of each line are visible.
	// Frozen: char = totalChars (everything revealed).
	const view = $derived.by((): Seg[] => {
		const out: Seg[] = [];
		const totalReveal = moving ? char : Number.POSITIVE_INFINITY;
		let remaining = totalReveal;
		let lastActiveIndex = -1;
		let cursorInsertAt = -1;

		for (let i = 0; i < script.length; i++) {
			const line = script[i]!;
			const take = Math.max(0, Math.min(line.text.length, remaining));

			if (line.kind === 'prompt') {
				out.push({ text: '$ ', cls: 'prompt' });
				out.push({ text: line.text.slice(0, take), cls: 'cmd' });
			} else {
				out.push({ text: '  ' });
				out.push({ text: line.text.slice(0, take), cls: 'out' });
			}

			if (take > 0) {
				lastActiveIndex = i;
			}

			// Remember position right after the last prompt line's text
			// (before the \n separator) so we can insert the cursor inline.
			if (line.kind === 'prompt' && lastActiveIndex === i) {
				cursorInsertAt = out.length;
			}

			if (i < script.length - 1) {
				out.push({ text: '\n' });
			}

			remaining -= take;
		}

		// Trailing cursor on the active prompt line, or on the last active line.
		// Only show a cursor if not finished, or if still animating.
		const finished = char >= totalChars;
		const showCursor = !finished || (loop && moving);

		if (showCursor && lastActiveIndex >= 0) {
			// Find the most recent prompt line; if none, append cursor at the end.
			let promptLine = -1;
			for (let i = 0; i <= lastActiveIndex; i++) {
				if (script[i]!.kind === 'prompt') {
					promptLine = i;
				}
			}

			const cursor: Seg = { text: '█', cls: 'cursor blinking' };
			if (promptLine >= 0 && cursorInsertAt >= 0) {
				// Insert inline after the prompt line's text (before any \n).
				out.splice(cursorInsertAt, 0, cursor);
			} else {
				out.push(cursor);
			}
		}

		return out;
	});
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="terminal">
			<div class="viewport">
				<pre class="art" aria-hidden="true"><code>{#each view as seg, i (i)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}</code></pre>
			</div>
			<p class="caption">{label}</p>
		</div>
	</GraphBody>
</Graph>

<style>
	.terminal {
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
		line-height: 1.45;
		color: var(--text-primary, oklch(0.93 0 0));
		white-space: pre;
		font-family: var(--font-sans);
	}

	.prompt {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.cmd {
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.out {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.cursor {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	@media (prefers-reduced-motion: no-preference) {
		.cursor.blinking {
			animation: blink 1s steps(1) infinite;
		}

		@keyframes blink {
			50% {
				opacity: 0;
			}
		}
	}

	.caption {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}
</style>
