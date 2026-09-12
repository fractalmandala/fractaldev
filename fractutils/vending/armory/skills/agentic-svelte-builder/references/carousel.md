# Carousel (Tier 2 Native Component)

The **Carousel** component provides horizontal sliding natively using CSS `scroll-snap-type: x mandatory`, styled with **`fractals-styler`** primitives (`w100`, `row`, `gap16`, `padbot8`).

---

## Component Code (`Carousel.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    children?: Snippet;
  };

  let { children }: Props = $props();
</script>

<div class="[ carousel-container ] [ w100 ]">
  <div class="[ carousel-track ] [ row gap16 padbot8 ]">
    {@render children?.()}
  </div>
</div>

```

### External stylesheet (`carousel.sass`)

```sass
	.carousel-container
		overflow: hidden

	.carousel-track
		overflow-x: auto
		scroll-snap-type: x mandatory
		scroll-behavior: smooth
		scrollbar-width: none
		&::-webkit-scrollbar
			display: none

		:global(.carousel-slide)
			flex: 0 0 80%
			scroll-snap-align: center
			scroll-snap-stop: always
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Carousel from './Carousel.svelte';
</script>

<Carousel>
  <div class="carousel-slide"><img src="https://picsum.photos/600/300?img=1" alt="Slide 1" /></div>
  <div class="carousel-slide"><img src="https://picsum.photos/600/300?img=2" alt="Slide 2" /></div>
  <div class="carousel-slide"><img src="https://picsum.photos/600/300?img=3" alt="Slide 3" /></div>
</Carousel>
```
