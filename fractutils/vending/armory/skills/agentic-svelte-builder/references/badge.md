# Badge (Zero-JS Native Component)

The **Badge** component renders small status indicators, tags, or count pills using native inline HTML (`<span>` or `<mark>`), styled with **`fractals-styler`** primitives (`row`, `ycenter`, `pad4`, `padright10`, `padleft10`, `radiusfull`, `text-xs`, `bold`). Variants use CUBE `data-variant` attributes.

---

## Component Code (`Badge.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLSpanElement> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
    children?: Snippet;
  };

  let { variant = 'primary', children, ...restProps }: Props = $props();
</script>

<span
  class="[ badge ] [ row ycenter ] [ pad4 padleft10 padright10 radiusfull text-xs bold lh1 ]"
  data-variant={variant}
  {...restProps}
>
  {@render children?.()}
</span>

```

### External stylesheet (`badge.sass`)

```sass
	.badge
		white-space: nowrap
		display: inline-flex

		/* CUBE Exception variants via data-variant attribute */
		&[data-variant="primary"]
			background-color: var(--brand-primary)
			color: var(--foreground-inverse)

		&[data-variant="secondary"]
			background-color: var(--background20)
			color: var(--foreground10)

		&[data-variant="outline"]
			background-color: transparent
			border: 1px solid var(--border)
			color: var(--foreground-muted)

		&[data-variant="destructive"]
			background-color: var(--danger-bg)
			color: var(--foreground-inverse)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Badge from './Badge.svelte';
</script>

<Badge variant="primary">New Feature</Badge>
<Badge variant="destructive">Deprecated</Badge>
```
