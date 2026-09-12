# Slider (Zero-JS Native Component)

The **Slider** component wraps native HTML `<input type="range">` with Svelte 5 state binding (`bind:value`), styled with **`fractals-styler`** primitives (`w100`, `height6`, `radiusfull`).

---

## Component Code (`Slider.svelte`)

```svelte
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  type Props = Omit<HTMLInputAttributes, 'type'> & {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
  };

  let { value = $bindable(50), min = 0, max = 100, step = 1, ...restProps }: Props = $props();
</script>

<input
  type="range"
  bind:value={value}
  {min}
  {max}
  {step}
  class="[ slider ] [ w100 height6 radiusfull ]"
  {...restProps}
/>

```

### External stylesheet (`slider.sass`)

```sass
	.slider
		appearance: none
		background-color: var(--border)
		outline: none

		&::-webkit-slider-thumb
			appearance: none
			width: 1.125rem
			height: 1.125rem
			border-radius: var(--radiusfull)
			background-color: var(--brand-primary)
			cursor: pointer
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2)
			transition: transform 0.15s ease

			&:hover
				transform: scale(1.1)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Slider from './Slider.svelte';

  let volume = $state(75);
</script>

<Slider bind:value={volume} min={0} max={100} />
<p>Volume: {volume}%</p>
```
