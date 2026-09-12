# Button (Zero-JS Native Component)

The **Button** component wraps HTML `<button>` with **`fractals-styler`** primitives (`row`, `ycenter`, `xcenter`, `gap8`, `radius6`, `text-sm`) and CUBE Exception data attributes (`data-variant="primary|secondary|outline|ghost|destructive"` and `data-size="sm|md|lg"`).

---

## Component Code (`Button.svelte`)

```svelte
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type Props = HTMLButtonAttributes & {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  };

  let {
    variant = 'primary',
    size = 'md',
    onclick,
    children,
    ...restProps
  }: Props = $props();
</script>

<button
  class="[ button ] [ row ycenter xcenter gap8 ] [ radius6 text-sm bold ]"
  data-variant={variant}
  data-size={size}
  {onclick}
  {...restProps}
>
  {@render children?.()}
</button>

```

### External stylesheet (`button.sass`)

```sass
	.button
		cursor: pointer
		border: 1px solid transparent
		transition: background-color 0.15s ease, border-color 0.15s ease

		&:disabled, &[aria-disabled="true"]
			opacity: 0.5
			cursor: not-allowed

		/* Size Exceptions */
		&[data-size="sm"]
			padding: var(--px4) var(--px10)
		font-size: var(--text-xs)

		&[data-size="md"]
			padding: var(--px8) var(--px16)
		font-size: var(--text-sm)

		&[data-size="lg"]
			padding: var(--px12) var(--px20)
		font-size: var(--text-md)

		/* Variant Exceptions */
		&[data-variant="primary"]
			background-color: var(--brand-primary)
			color: var(--foreground-inverse)
			&:hover:not(:disabled)
				background-color: var(--brand-primary-hover)

		&[data-variant="secondary"]
			background-color: var(--background20)
			color: var(--foreground10)
			&:hover:not(:disabled)
				background-color: var(--background30)

		&[data-variant="outline"]
			background-color: transparent
			border-color: var(--border)
			color: var(--foreground10)
			&:hover:not(:disabled)
				background-color: var(--background10)

		&[data-variant="ghost"]
			background-color: transparent
			color: var(--foreground10)
			&:hover:not(:disabled)
				background-color: var(--background20)

		&[data-variant="destructive"]
			background-color: var(--danger-bg)
			color: var(--foreground-inverse)
			&:hover:not(:disabled)
				background-color: var(--danger-hover)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Button from './Button.svelte';

  function handleClick() {
    console.log('Button clicked!');
  }
</script>

<Button variant="primary" onclick={handleClick}>Submit Form</Button>
<Button variant="outline" disabled>Disabled State</Button>
```
