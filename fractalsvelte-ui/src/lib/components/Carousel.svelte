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
	};

	let { items, index = $bindable(0), label = 'Carousel' }: Props = $props();
	let current = $derived(items[Math.max(0, Math.min(index, items.length - 1))]);

	function previous() {
		index = (index - 1 + items.length) % items.length;
	}

	function next() {
		index = (index + 1) % items.length;
	}
</script>

<section class="carousel" aria-label={label} aria-roledescription="carousel">
	{#if current}
		<MotionDiv class="carousel-slide" key={current.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={tweenContent}>
			{#if current.image}<img src={current.image} alt="" />{/if}
			<div><span class="carousel-count">{index + 1} / {items.length}</span><h3>{current.title}</h3>{#if current.description}<p>{current.description}</p>{/if}</div>
		</MotionDiv>
	{/if}
	<div class="carousel-controls"><button type="button" aria-label="Previous slide" onclick={previous} disabled={items.length < 2}>←</button><button type="button" aria-label="Next slide" onclick={next} disabled={items.length < 2}>→</button></div>
</section>
