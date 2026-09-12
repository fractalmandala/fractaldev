# Separator (Zero-JS Native Component)

The **Separator** component visually separates content using `<hr>` or `role="separator"`, styled with **`fractals-styler`** primitives (`margin0`). Orientation exceptions use CUBE `data-orientation` attributes.

---

## Component Code (`Separator.svelte`)

```svelte
<script lang="ts">
  type Props = {
    orientation?: 'horizontal' | 'vertical';
  };

  let { orientation = 'horizontal' }: Props = $props();
</script>

<hr
  class="[ separator ] [ margin0 ]"
  data-orientation={orientation}
  role="separator"
  aria-orientation={orientation}
/>

```

### External stylesheet (`separator.sass`)

```sass
	.separator
		border: none
		background-color: var(--border)

		/* CUBE Exception variants via data-orientation */
		&[data-orientation="horizontal"]
			width: 100%
			height: 1px

		&[data-orientation="vertical"]
			width: 1px
			height: 100%
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Separator from './Separator.svelte';
</script>

<p>Section 1</p>
<Separator orientation="horizontal" />
<p>Section 2</p>
```
