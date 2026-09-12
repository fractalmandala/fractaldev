# Svelte 5 Native Carousel

An interactive Carousel component powered by **Svelte 5 Runes** (`$state`, `$derived`, `$effect`, `$props`). Manages active slide index, auto-play timers, and prev/next slide navigation controls seamlessly.

---

## Component Implementation (`Carousel.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    totalSlides: number;
    autoplay?: boolean;
    interval?: number;
    children?: Snippet<[currentIndex: number]>;
  };

  let { totalSlides, autoplay = false, interval = 3000, children }: Props = $props();

  let currentIndex = $state(0);

  function next() {
    currentIndex = (currentIndex + 1) % totalSlides;
  }

  function prev() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
  }

  // Reactive timer effect for autoplay
  $effect(() => {
    if (!autoplay) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  });
</script>

<div class="[ carousel ] [ box w100 position-relative ]">
  <div class="[ carousel__viewport ] [ w100 ]">
    {@render children?.(currentIndex)}
  </div>

  <div class="[ carousel__controls ] [ row ycenter xbetween position-absolute w100 pad12 ]">
    <button class="button" data-variant="secondary" data-size="sm" onclick={prev}>&larr;</button>
    <button class="button" data-variant="secondary" data-size="sm" onclick={next}>&rarr;</button>
  </div>

  <div class="[ carousel__dots ] [ row ycenter xcenter gap8 margintop12 ]">
    {#each Array(totalSlides) as _, i}
      <button
        class="[ carousel__dot ] [ width8 height8 radiusfull ]"
        aria-selected={i === currentIndex}
        onclick={() => currentIndex = i}
        aria-label="Go to slide {i + 1}"
      ></button>
    {/each}
  </div>
</div>

```

### External stylesheet (`carousel.sass`)

```sass
	.carousel
		&__controls
			top: 50%
			transform: translateY(-50%)
			pointer-events: none
			button
				pointer-events: auto

		&__dot
			border: none
			padding: 0
			background-color: var(--border)
			cursor: pointer
			transition: background-color 0.2s ease, transform 0.2s ease
			&[aria-selected="true"]
				background-color: var(--brand-primary)
				transform: scale(1.25)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Carousel from './Carousel.svelte';

  const slides = ['Slide 1', 'Slide 2', 'Slide 3'];
</script>

<Carousel totalSlides={slides.length} autoplay>
  {#snippet children(index)}
    <div class="[ slide-content ] [ pad48 text-lg bold text-center ]">
      {slides[index]}
    </div>
  {/snippet}
</Carousel>
```
