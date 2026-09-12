# Tooltip (Zero-JS Native Component)

The **Tooltip** component renders hover tooltips natively using CSS `:hover` / `:focus-within` and data attributes, styled with **`fractals-styler`** primitives (`pad6`, `padleft10`, `padright10`, `radius4`, `text-xs`, `bold`).

---

## Component Code (`Tooltip.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    text: string;
    children?: Snippet;
  };

  let { text, children }: Props = $props();
</script>

<span class="[ tooltip-container ] [ position-relative ]" data-tooltip={text}>
  {@render children?.()}
</span>

```

### External stylesheet (`tooltip.sass`)

```sass
	.tooltip-container
		display: inline-block

		&::after
			content: attr(data-tooltip)
			position: absolute
			bottom: 100%
			left: 50%
			transform: translateX(-50%) translateY(-4px)
			padding: var(--px6) var(--px10)
			font-size: var(--text-xs)
			font-weight: 600
			color: var(--foreground-inverse)
			background-color: var(--foreground10)
			border-radius: var(--radius4)
			white-space: nowrap
			pointer-events: none
			opacity: 0
			visibility: hidden
			transition: opacity 0.15s ease, transform 0.15s ease
			z-index: 50

		&:hover::after, &:focus-within::after
			opacity: 1
			visibility: visible
			transform: translateX(-50%) translateY(-8px)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Tooltip from './Tooltip.svelte';
</script>

<Tooltip text="Click to save your progress">
  <button class="button" data-variant="primary">Save</button>
</Tooltip>
```
