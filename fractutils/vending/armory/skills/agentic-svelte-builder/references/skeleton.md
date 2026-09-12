# Skeleton (Zero-JS Native Component)

The **Skeleton** component displays a loading shimmer effect using pure CSS `@keyframes` pulse animation, styled with **`fractals-styler`** primitives (`radius6`).

---

## Component Code (`Skeleton.svelte`)

```svelte
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLDivElement> & {
    width?: string;
    height?: string;
    circle?: boolean;
  };

  let { width = '100%', height = '1rem', circle = false, ...restProps }: Props = $props();
</script>

<div
  class="[ skeleton ] [ radius6 ]"
  data-shape={circle ? 'circle' : 'rounded'}
  style:--skeleton-width={width}
  style:--skeleton-height={height}
  {...restProps}
></div>

```

### External stylesheet (`skeleton.sass`)

Width and height are dynamic geometry values, so they cross the component boundary as
CSS custom properties. Color, shape, and animation remain in the external stylesheet.

```sass
	.skeleton
		display: inline-block
		width: var(--skeleton-width)
		height: var(--skeleton-height)
		background-color: var(--background20)
		animation: skeleton-pulse 1.5s ease-in-out infinite

	@keyframes skeleton-pulse
		0%, 100%
			opacity: 1
		50%
			opacity: 0.4
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Skeleton from './Skeleton.svelte';
</script>

<div class="[ row ycenter gap16 ]">
  <Skeleton circle width="40px" height="40px" />
  <div class="[ grow ]">
    <Skeleton width="60%" height="1rem" />
    <Skeleton width="40%" height="0.75rem" />
  </div>
</div>
```
