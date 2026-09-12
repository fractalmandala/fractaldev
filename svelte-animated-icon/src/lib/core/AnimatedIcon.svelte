<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export interface Props extends HTMLAttributes<HTMLDivElement> {
		/** Pre-stripped SVG inner content (no <svg> wrapper, no bounding rect) */
		svg: string;
		/** SVG coordinate space of `svg`. Phosphor is 256; Remix/Lucide are 24. */
		viewBox?: string;
		/** Template id: draw | cascade | pop | spin | jelly | orbit | assemble | trace | tada | flip | swing | wave | march | boil | glitch | native-draw | wipe | rise | iris | split | drop | stamp */
		template?: string;
		size?: number;
		/**
		 * hover → animate on the icon's own mouseenter/leave.
		 * mount → animate once when loaded.
		 * controlled → parent drives via `active` prop.
		 */
		trigger?: 'hover' | 'mount' | 'controlled';
		/** When trigger === 'controlled', animate while true. */
		active?: boolean;
		/** Force the template to repeat forever. */
		loop?: boolean;
		/** Speed multiplier; 2 = twice as fast. */
		speed?: number;
		/** Override the timing easing (any CSS easing string); null = keep the template's own. */
		easing?: string | null;
		class?: string;
		color?: string;
	}
</script>

<script lang="ts">
	import { getTemplate, clearProps } from '$lib/core/templates.svelte';

	let {
		svg,
		viewBox = '0 0 256 256',
		template = 'draw',
		size = 24,
		trigger = 'hover',
		active = false,
		loop = false,
		speed = 1,
		easing = null,
		class: className = '',
		color,
		...rest
	}: Props = $props();

	let svgEl = $state<SVGSVGElement | null>(null);
	let anims: Animation[] = [];

	export function startAnimation(): void {
		stopAnimation();
		if (!svgEl) return;
		anims = getTemplate(template).run(svgEl);
		for (const a of anims) {
			const eff = a.effect;
			if (!eff) continue;
			const patch: OptionalEffectTiming = {};
			if (loop) patch.iterations = Infinity;
			if (easing) patch.easing = easing;
			if (speed !== 1) {
				const t = eff.getComputedTiming();
				if (typeof t.duration === 'number') patch.duration = t.duration / speed;
				patch.delay = (t.delay ?? 0) / speed;
			}
			if (Object.keys(patch).length) eff.updateTiming(patch);
		}
	}

	export function stopAnimation(): void {
		for (const a of anims) {
			try {
				a.cancel();
			} catch {
				/* already finished */
			}
		}
		anims = [];
		if (svgEl) clearProps(svgEl);
	}

	$effect(() => {
		if (trigger === 'mount' && svg) startAnimation();
	});

	$effect(() => {
		if (trigger !== 'controlled' || !svg) return;
		if (active) startAnimation();
		else stopAnimation();
		// Cancel any running (possibly looping) animation when the trigger mode
		// changes away from 'controlled' (or when active/svg change), so it doesn't
		// keep playing after the box is unchecked.
		return () => stopAnimation();
	});
</script>

<div
	{...rest}
	class="animated-icon {className}"
	role="img"
	onmouseenter={(e) => {
		if (trigger === 'hover') startAnimation();
		if (typeof rest.onmouseenter === 'function') rest.onmouseenter(e);
	}}
	onmouseleave={(e) => {
		if (trigger === 'hover') stopAnimation();
		if (typeof rest.onmouseleave === 'function') rest.onmouseleave(e);
	}}
	style:color={color}
>
	<svg
		bind:this={svgEl}
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		{viewBox}
		style="overflow: visible; display: block"
	>
		{@html svg}
	</svg>
</div>

