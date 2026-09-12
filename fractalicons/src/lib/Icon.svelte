<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import type { IconData, IconSize, AnimationTrigger } from './types.js';

	interface Props extends SVGAttributes<SVGSVGElement> {
		icon: IconData;
		size?: IconSize;
		title?: string;
		decorative?: boolean;
		/**
		 * When an animation plays (only affects animated sets like `materialanim`).
		 * - `load`    — play once when the icon mounts (default; matches prior behavior)
		 * - `hover`   — replay every time the pointer enters
		 * - `click`   — replay on click
		 * - `visible` — play once when scrolled into view
		 * - `loop`    — play continuously
		 * - `none`    — never animate; render the finished (fully drawn) state
		 */
		trigger?: AnimationTrigger;
	}

	let {
		icon,
		size = '1em',
		title,
		decorative = !title,
		trigger = 'load',
		...rest
	}: Props = $props();

	// Animated sets embed CSS @keyframes in their body; static icons never do.
	const animated = $derived(icon.body.includes('@keyframes'));

	const ariaHidden = $derived(decorative ? 'true' : undefined);
	const role = $derived(decorative ? undefined : 'img');
	const labelledBy = $derived(title && !decorative ? `${icon.set}-${icon.name}-title` : undefined);
	const dimension = $derived(typeof size === 'number' ? `${size}px` : size);

	let svgEl = $state<SVGSVGElement>();
	// Whether the animation is currently active (drives the `data-fi-play` marker).
	// Starts idle; the effect below turns it on for `load`/`loop` after mount.
	let playing = $state(false);

	// Force a from-the-start replay: drop the play marker, then re-add it a frame
	// later so the browser restarts the CSS animations.
	function replay() {
		playing = false;
		requestAnimationFrame(() => requestAnimationFrame(() => (playing = true)));
	}

	$effect(() => {
		if (!animated) return;

		if (trigger === 'load' || trigger === 'loop') {
			playing = true;
		} else if (trigger === 'none') {
			playing = false;
		} else if (trigger === 'hover' || trigger === 'click') {
			playing = false; // idle until the interaction fires
		} else if (trigger === 'visible' && svgEl) {
			playing = false;
			const io = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							replay();
							io.disconnect();
							break;
						}
					}
				},
				{ threshold: 0.2 }
			);
			io.observe(svgEl);
			return () => io.disconnect();
		}
	});

	const onenter = () => trigger === 'hover' && animated && replay();
	const onleave = () => trigger === 'hover' && animated && (playing = false);
	const onclick = () => trigger === 'click' && animated && replay();
</script>

<svg
	bind:this={svgEl}
	xmlns="http://www.w3.org/2000/svg"
	viewBox={icon.viewBox}
	width={dimension}
	height={dimension}
	fill="currentColor"
	aria-hidden={ariaHidden}
	aria-labelledby={labelledBy}
	{role}
	{...rest}
	part="icon"
	class:fractalicon={true}
	class:fi-anim={animated}
	data-fi-play={animated && playing ? '' : undefined}
	data-fi-loop={animated && trigger === 'loop' ? '' : undefined}
	onmouseenter={onenter}
	onmouseleave={onleave}
	{onclick}
>
	{#if title && !decorative}
		<title id={labelledBy}>{title}</title>
	{/if}
	<!-- Icon bodies are generated at build time by scripts/generate-icons.js from vendored SVG
	     files, never from user input. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html icon.body}
</svg>

<style>
	/* Animated icons hold their finished (fully drawn) state until told to play,
	   so `hover`/`click`/`visible`/`none` don't fire on mount. Scoped to our own
	   animated svgs via `.fi-anim`, so no other page SVGs are affected. */
	:global(svg.fi-anim:not([data-fi-play]) *) {
		animation: none !important;
		stroke-dasharray: none !important;
		stroke-dashoffset: 0 !important;
	}
	/* `loop` mode: repeat every embedded animation indefinitely. */
	:global(svg.fi-anim[data-fi-loop] *) {
		animation-iteration-count: infinite !important;
	}
</style>
