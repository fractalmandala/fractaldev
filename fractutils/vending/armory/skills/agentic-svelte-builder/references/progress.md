# Progress (Zero-JS Native Component)

The **Progress** component displays progress bars natively using `<progress>`, styled with **`fractals-styler`** primitives (`w100`, `height10`, `radiusfull`).

---

## Component Code (`Progress.svelte`)

```svelte
<script lang="ts">
  import type { HTMLProgressAttributes } from 'svelte/elements';

  type Props = HTMLProgressAttributes & {
    value?: number;
    max?: number;
  };

  let { value = 0, max = 100, ...restProps }: Props = $props();
</script>

<progress class="[ progress ] [ w100 height10 radiusfull ]" {value} {max} {...restProps}>
  {value}%
</progress>

```

### External stylesheet (`progress.sass`)

```sass
	.progress
		appearance: none
		border: none
		overflow: hidden
		background-color: var(--background20)

		&::-webkit-progress-bar
			background-color: var(--background20)
			border-radius: var(--radiusfull)

		&::-webkit-progress-value
			background-color: var(--brand-primary)
			border-radius: var(--radiusfull)
			transition: width 0.3s ease

		&::-moz-progress-bar
			background-color: var(--brand-primary)
			border-radius: var(--radiusfull)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Progress from './Progress.svelte';

  let value = $state(65);
</script>

<Progress {value} max={100} />
```
