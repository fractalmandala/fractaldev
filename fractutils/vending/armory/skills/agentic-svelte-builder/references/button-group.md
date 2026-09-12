# Button Group (Zero-JS Native Component)

The **Button Group** component joins multiple buttons using **`fractals-styler`** layout primitives (`row`, `ycenter`) with collapsed border-radius styling.

---

## Component Code (`ButtonGroup.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLDivElement> & {
    children?: Snippet;
  };

  let { children, ...restProps }: Props = $props();
</script>

<div class="[ button-group ] [ row ycenter ]" role="group" {...restProps}>
  {@render children?.()}
</div>

```

### External stylesheet (`button-group.sass`)

```sass
	.button-group
		display: inline-flex
		:global(.button)
			border-radius: 0
			margin-left: -1px
			&:first-child
				border-top-left-radius: var(--radius6)
				border-bottom-left-radius: var(--radius6)
				margin-left: 0
			&:last-child
				border-top-right-radius: var(--radius6)
				border-bottom-right-radius: var(--radius6)
			&:focus
				z-index: 1
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import ButtonGroup from './ButtonGroup.svelte';
  import Button from './Button.svelte';
</script>

<ButtonGroup>
  <Button variant="outline">Left</Button>
  <Button variant="outline">Center</Button>
  <Button variant="outline">Right</Button>
</ButtonGroup>
```
