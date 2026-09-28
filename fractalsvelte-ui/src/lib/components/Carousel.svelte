<script lang="ts">
	import { MotionDiv } from '@humanspeak/svelte-motion';
	import { tweenContent } from '#lib/motion/presets.ts';

	type CarouselItem = {
		id: string;
		title: string;
		description?: string;
		image?: string;
	};

	type Props = {
		items: CarouselItem[];
		index?: number;
		label?: string;
		class?: string;
	};

	let { items, index = $bindable(0), label = 'Carousel', class: className = '' }: Props = $props();
	const rootClass = $derived(['carousel', className].filter(Boolean).join(' '));
	let current = $derived(items[Math.max(0, Math.min(index, items.length - 1))]);

	function previous() {
		index = (index - 1 + items.length) % items.length;
	}

	function next() {
		index = (index + 1) % items.length;
	}
</script>

<section class={rootClass} aria-label={label} aria-roledescription="carousel">
	{#if current}
		<MotionDiv class="carousel-slide" key={current.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={tweenContent}>
			{#if current.image}<img src={current.image} alt="" />{/if}
			<div><span class="carousel-count">{index + 1} / {items.length}</span><h3>{current.title}</h3>{#if current.description}<p>{current.description}</p>{/if}</div>
		</MotionDiv>
	{/if}
	<div class="carousel-controls"><button type="button" aria-label="Previous slide" onclick={previous} disabled={items.length < 2}>←</button><button type="button" aria-label="Next slide" onclick={next} disabled={items.length < 2}>→</button></div>
</section>

<style lang="sass">
.carousel
	position: relative
	display: flex
	flex-direction: column
	width: 100%
	max-width: 480px
	background: var(--bg-surface)
	border: 1px solid var(--border)
	border-radius: var(--radius-lg)
	overflow: hidden

:global(.carousel-slide)
	display: flex
	flex-direction: column
	gap: var(--space-xs)
	padding: var(--space-md)

	img
		width: 100%
		height: 200px
		object-fit: cover
		border-radius: var(--radius-md)

	h3
		margin: 0
		font-size: var(--text-md)
		font-weight: 600
		color: var(--text-primary)

	p
		margin: var(--space-3xs) 0 0
		font-size: var(--text-sm)
		color: var(--text-secondary)

	.carousel-count
		display: inline-block
		font-size: var(--text-xs)
		color: var(--text-muted)
		font-family: var(--font-mono)
		margin-bottom: var(--space-3xs)

.carousel-controls
	display: flex
	align-items: center
	justify-content: flex-end
	gap: var(--space-2xs)
	padding: var(--space-xs) var(--space-md)
	border-top: 1px solid var(--border-subtle)
	background: var(--bg-raised)

	button
		display: inline-flex
		align-items: center
		justify-content: center
		width: 28px
		height: 28px
		border-radius: var(--radius-sm)
		border: 1px solid var(--border)
		background: var(--bg-surface)
		color: var(--text-primary)
		cursor: pointer
		transition: background var(--motion-fast) ease
		&:hover:not(:disabled)
			background: var(--state-hover)
		&:disabled
			opacity: 0.4
			cursor: not-allowed
</style>
