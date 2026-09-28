<script lang="ts">
	import type { MarqueeDirection } from '#lib/data/componentTypes.ts';

	type Props = {
		items: string[];
		speed?: number;
		direction?: MarqueeDirection;
		label?: string;
		class?: string;
		[key: string]: unknown;
	};

	let {
		items,
		speed = 22,
		direction = 'left',
		label = 'Scrolling content',
		class: className = '',
		...rest
	}: Props = $props();

	const rootClass = $derived(`marquee ${className}`.trim());
	let style = $derived(`--marquee-duration: ${Math.max(1, speed)}s`);
</script>

<div class={rootClass} data-direction={direction} aria-label={label} {style} {...rest}>
	<div class="marquee-track">
		{#each [...items, ...items] as item, index (`${item}-${index}`)}
			<span aria-hidden={index >= items.length ? 'true' : undefined}>{item}</span>
		{/each}
	</div>
</div>

<style lang="sass">

@keyframes marquee-scroll
	from
		transform: translateX(0)
	to
		transform: translateX(-50%)

.marquee
	overflow: hidden
	display: flex
	user-select: none
	position: relative
	width: 100%
	mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)

	&[data-direction='right'] .marquee-track
		animation-direction: reverse

	&:hover .marquee-track
		animation-play-state: paused

.marquee-track
	display: flex
	flex-shrink: 0
	align-items: center
	gap: calc(var(--space-lg) * var(--gap-scale, 1))
	min-width: 100%
	width: max-content
	animation: marquee-scroll var(--marquee-duration, 22s) linear infinite

@media (prefers-reduced-motion: reduce)
	.marquee-track
		animation: none
</style>
