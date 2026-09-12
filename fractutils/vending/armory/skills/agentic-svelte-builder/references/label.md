# Label (Zero-JS Native Component)

The **Label** component wraps HTML `<label for="...">`, styled with **`fractals-styler`** primitives (`row`, `ycenter`, `gap4`, `text-sm`, `bold`).

---

## Component Code (`Label.svelte`)

```svelte
<script lang="ts">
  import type { HTMLLabelAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type Props = HTMLLabelAttributes & {
    required?: boolean;
    children?: Snippet;
  };

  let { required = false, children, ...restProps }: Props = $props();
</script>

<label class="[ label ] [ row ycenter gap4 text-sm bold ]" {...restProps}>
  {@render children?.()}
  {#if required}
    <span class="[ label__required ]" aria-hidden="true">*</span>
  {/if}
</label>

```

### External stylesheet (`label.sass`)

```sass
	.label
		display: inline-flex
		color: var(--foreground10)
		user-select: none
		cursor: pointer

		&__required
			color: var(--danger-text)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Label from './Label.svelte';
  import Input from './Input.svelte';
</script>

<Label for="username-field" required>Username</Label>
<Input id="username-field" placeholder="Enter username..." />
```
