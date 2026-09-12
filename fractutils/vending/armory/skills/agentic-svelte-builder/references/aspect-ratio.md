# Aspect Ratio (Zero-JS Native Component)

The **Aspect Ratio** component enforces a specific width-to-height ratio for contained media using CSS `aspect-ratio`, styled with **`fractals-styler`** utility classes (`w100`, `h100`).

---

## Component Code (`AspectRatio.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLDivElement> & {
    ratio?: number | string; // e.g., 16 / 9 or "16 / 9"
    children?: Snippet;
  };

  let { ratio = 16 / 9, children, ...restProps }: Props = $props();
</script>

<div class="[ aspect-ratio ] [ w100 position-relative ]" style:--aspect-ratio={ratio} {...restProps}>
  {@render children?.()}
</div>

```

### External stylesheet (`aspect-ratio.sass`)

The measured ratio is the only dynamic geometry value and crosses the component boundary
as `--aspect-ratio`; all static layout remains in the external stylesheet.

```sass
	.aspect-ratio
		aspect-ratio: var(--aspect-ratio)
		overflow: hidden
		:global(img), :global(video), :global(iframe)
			width: 100%
			height: 100%
			object-fit: cover
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import AspectRatio from './AspectRatio.svelte';
</script>

<AspectRatio ratio={16 / 9}>
  <img src="https://picsum.photos/800/450" alt="Landscape" />
</AspectRatio>
```
