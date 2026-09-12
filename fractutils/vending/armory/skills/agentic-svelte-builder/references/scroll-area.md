# Scroll Area (Zero-JS Native Component)

The **Scroll Area** component provides custom scrollbars natively using CSS `overflow: auto`, styled with **`fractals-styler`** primitives (`box`, `w100`, `padright4`).

---

## Component Code (`ScrollArea.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLDivElement> & {
    maxHeight?: string;
    children?: Snippet;
  };

  let { maxHeight = '300px', children, ...restProps }: Props = $props();
</script>

<div class="[ scroll-area ] [ box w100 padright4 ]" style:--scroll-area-max-height={maxHeight} {...restProps}>
  {@render children?.()}
</div>

```

### External stylesheet (`scroll-area.sass`)

The caller-supplied max height is dynamic geometry and crosses the boundary as
`--scroll-area-max-height`; scrollbar styling remains here.

```sass
	.scroll-area
		max-height: var(--scroll-area-max-height)
		overflow-y: auto
		scrollbar-width: thin
		scrollbar-color: var(--border) transparent

		&::-webkit-scrollbar
			width: 6px

		&::-webkit-scrollbar-track
			background: transparent

		&::-webkit-scrollbar-thumb
			background-color: var(--border)
			border-radius: var(--radiusfull)
			&:hover
				background-color: var(--foreground-subtle)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import ScrollArea from './ScrollArea.svelte';
</script>

<ScrollArea maxHeight="200px">
  <p>Long scrolling content here...</p>
</ScrollArea>
```
