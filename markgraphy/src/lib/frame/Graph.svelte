<script module lang="ts">
	/** Dash rhythm of the frame. `token` follows the theme's `--graph-framer`. */
	export type GraphDash = 'token' | 'std' | 'gap' | 'long' | 'short' | 'dot' | 'alt' | 'solid';
		/**
	 * Frame motion.
	 * - `march`   marching ants, clockwise
	 * - `reverse` marching ants, counter-clockwise
	 * - `pulse`   dashes drift out and back
	 * - `scan`    a sweep of light travels around the frame
	 * - `draw`    frame draws itself in on hover (no loop)
	 */
	export type GraphMotion = 'none' | 'march' | 'reverse' | 'pulse' | 'scan' | 'draw';

	/** Inner padding. */
	export type GraphPad = 'none' | 'sm' | 'md' | 'lg';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { easingValue, type Easing } from './motion';

	export interface GraphProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. Uppercase, 1–2 words. */
		title?: string;
		/** Character at each corner of the frame. Default "+". */
		corner?: string;
		/** Dash rhythm. Default 'token' (follows `--graph-framer`). */
		dash?: GraphDash;
		/** Frame motion. Every loop is off under `prefers-reduced-motion`. Default 'none'. */
		motion?: GraphMotion;
		/** Seconds per motion cycle — for `draw`, the hover duration.
		 * Defaults per motion (draw 0.3, march 0.7, pulse 2, scan 3). */
		speed?: number;
		/** Curve the motion runs on — an `EASINGS` name or a raw timing function. */
		easing?: Easing;
		/** Pause the loop while hovered. Default false. */
		pauseOnHover?: boolean;
		/** Blink the corner glyphs. Default false. */
		cornerBlink?: boolean;
		/** Inner padding. Default 'none'. */
		pad?: GraphPad;
		/** Frame colour override. Defaults to `--text-primary`. */
		ink?: string;
		/** Corner + title colour override. Defaults to `--graph-accent`. */
		accent?: string;
		class?: string;
		children?: Snippet;
	}

	let {
		title,
		corner = '+',
		dash = 'token',
		motion = 'none',
		speed,
		easing,
		pauseOnHover = false,
		cornerBlink = false,
		pad = 'none',
		ink,
		accent,
		class: className = '',
		children
	}: GraphProps = $props();

	const uid = $props.id();

	const style = $derived(
		[
			speed !== undefined ? `--fg-speed:${speed}s` : '',
			easing ? `--fg-timing:${easingValue(easing)}` : '',
			ink ? `--fg-ink:${ink}` : '',
			accent ? `--graph-accent:${accent}` : ''
		]
			.filter(Boolean)
			.join(';') || undefined
	);
</script>

<figure
	class="graph {className}"
	data-dash={dash}
	data-motion={motion}
	data-pad={pad}
	data-pause={pauseOnHover ? '' : undefined}
	data-blink={cornerBlink ? '' : undefined}
	{style}
	aria-labelledby={title ? uid : undefined}
>
	{#if title}
		<figcaption id={uid} class="title"><span class="ink">[ {title} ]</span></figcaption>
	{/if}
	<span aria-hidden="true" class="corner tl">{corner}</span>
	<span aria-hidden="true" class="corner tr">{corner}</span>
	<span aria-hidden="true" class="corner bl">{corner}</span>
	<span aria-hidden="true" class="corner br">{corner}</span>
	{@render children?.()}
</figure>

<style>
	/*
	 * The frame is four repeating gradients, one per edge, painted on a
	 * ::before layer so motion (masks, colour interpolation) never touches the
	 * content. Every rhythm is expressed as two numbers:
	 *   --fg-on      length of the drawn segment
	 *   --fg-period  length of one on+off cycle
	 * Marching translates by exactly one period, so a single keyframe set
	 * serves every preset. The default rhythm stays a token (--graph-framer)
	 * so a host can swap it without touching the component.
	 */
	.graph {
		--fg-ink: var(--text-primary);
		position: relative;
		min-width: 0;
		margin: 0;
		font-family: var(--font-mono);
		color: var(--text-primary, oklch(0.93 0 0));
		font-variant-numeric: tabular-nums;
	}

	.graph::before {
		content: '';
		position: absolute;
		z-index: 0;
		inset: 0;
		pointer-events: none;
		background-image:
			repeating-linear-gradient(to right, var(--fg-dash)),
			repeating-linear-gradient(to bottom, var(--fg-dash)),
			repeating-linear-gradient(to right, var(--fg-dash)),
			repeating-linear-gradient(to bottom, var(--fg-dash));
		background-repeat: repeat-x, repeat-y, repeat-x, repeat-y;
		background-position:
			0 0,
			100% 0,
			0 100%,
			0 0;
		background-size:
			100% 1px,
			1px 100%,
			100% 1px,
			1px 100%;
	}

	/* ── dash presets ─────────────────────────────────────────────── */

	.graph[data-dash='gap'] {
		--fg-on: 4px;
		--fg-period: 16px;
	}

	.graph[data-dash='long'] {
		--fg-on: 12px;
		--fg-period: 24px;
	}

	.graph[data-dash='short'] {
		--fg-on: 2px;
		--fg-period: 4px;
	}

	.graph[data-dash='dot'] {
		--fg-on: 1px;
		--fg-period: 4px;
	}

	.graph[data-dash='solid'] {
		--fg-on: 8px;
		--fg-period: 8px;
	}

	.graph[data-dash='std'] {
		--fg-on: 8px;
		--fg-period: 16px;
	}

	/* Morse: short-long. Four stops, so it composes --fg-dash itself. */
	.graph[data-dash='alt'] {
		--fg-period: 16px;
		--fg-dash:
			var(--fg-ink) 0 2px, transparent 2px 5px, var(--fg-ink) 5px 13px, transparent 13px 16px;
	}

	/* Theme-driven default. Declared after the presets so it wins on ties. */
	.graph[data-dash='token'] {
		--fg-period: 8px;
		--fg-dash: var(--graph-framer, var(--fg-ink) 0 4px, transparent 4px 8px);
	}

	/* ── padding ──────────────────────────────────────────────────── */

	.graph[data-pad='sm'] {
		padding: 1rem;
	}

	.graph[data-pad='md'] {
		padding: 1.5rem;
	}

	.graph[data-pad='lg'] {
		padding: 2rem;
	}

	/* ── motion ───────────────────────────────────────────────────── */

	.graph[data-motion='pulse'],
	.graph[data-motion='reverse'] {
		--fg-speed: 2s;
	}

	.graph[data-motion='scan'] {
		--fg-speed: 3s;
	}

	/* `draw` is a hover transition, not a loop — it stays on under reduced motion. */
	.graph[data-motion='draw'] {
		--fg-speed: 0.3s;
	}

	.graph[data-motion='draw']::before {
		background-image:
			repeating-linear-gradient(to right, var(--fg-dash)),
			repeating-linear-gradient(to bottom, var(--fg-dash)),
			repeating-linear-gradient(to left, var(--fg-dash)),
			repeating-linear-gradient(to top, var(--fg-dash));
		background-repeat: no-repeat;
		background-position:
			0 0,
			100% 0,
			100% 100%,
			0 100%;
		background-size:
			0% 1px,
			1px 0%,
			0% 1px,
			1px 0%;
		transition: background-size var(--fg-speed) var(--fg-timing, ease-in-out);
	}

	.graph[data-motion='draw']:hover::before {
		background-size:
			100% 1px,
			1px 100%,
			100% 1px,
			1px 100%;
	}

	@media (prefers-reduced-motion: no-preference) {
		.graph[data-motion='march']::before {
			animation: fg-march var(--fg-speed) var(--fg-timing, linear) infinite;
		}

		.graph[data-motion='reverse']::before {
			animation: fg-march var(--fg-speed) var(--fg-timing, linear) infinite reverse;
		}

		.graph[data-motion='pulse']::before {
			animation: fg-march var(--fg-speed) var(--fg-timing, ease-in-out) infinite alternate;
		}

		.graph[data-motion='scan']::before {
			animation:
				fg-march 0.7s var(--fg-timing, linear) infinite,
				fg-scan var(--fg-speed) var(--fg-timing, ease-in-out) infinite;
			mask-image: linear-gradient(to right, transparent, black 25%, black 75%, transparent);
			mask-size: 200% 200%;
		}

		.graph[data-pause]:hover,
		.graph[data-pause]:hover::before {
			animation-play-state: paused;
		}

		.graph[data-blink] .corner {
			animation: fg-blink 2s linear infinite;
		}
	}

	@keyframes fg-march {
		to {
			background-position:
				var(--fg-period) 0,
				100% var(--fg-period),
				calc(-1 * var(--fg-period)) 100%,
				0 calc(-1 * var(--fg-period));
		}
	}

	@keyframes fg-scan {
		0%,
		100% {
			mask-position: 0% 0%;
		}
		50% {
			mask-position: 100% 100%;
		}
	}

	@keyframes fg-blink {
		0%,
		45%,
		55%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	/* ── glyphs ───────────────────────────────────────────────────── */

	.corner {
		position: absolute;
		z-index: 10;
		display: flex;
		width: 1rem;
		height: 1rem;
		align-items: center;
		justify-content: center;
		font-size: 1.4rem;
		line-height: 1;
		color: var(--graph-accent, oklch(0.78 0.17 155));
		user-select: none;
		pointer-events: none;
	}

	.tl {
		top: 0;
		left: 0;
		transform: translate(-50%, -50%);
	}

	.tr {
		top: 0;
		right: 0;
		transform: translate(50%, -50%);
	}

	.bl {
		bottom: 0;
		left: 0;
		transform: translate(-50%, 50%);
	}

	.br {
		right: 0;
		bottom: 0;
		transform: translate(50%, 50%);
	}

	.title {
		position: absolute;
		top: 0;
		left: 50%;
		z-index: 10;
		transform: translate(-50%, -50%);
		background: var(--bg, var(--bg-surface, #101010));
		padding: 0 0.625rem;
		letter-spacing: 0.05em;
		white-space: nowrap;
		text-transform: uppercase;
	}

	.ink {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}
</style>
