# Spinner (Zero-JS Native Component)

The **Spinner** component renders loading indicators using an SVG icon animated with pure CSS `@keyframes rotate`. Sizes use CUBE `data-size` attributes.

---

## Component Code (`Spinner.svelte`)

```svelte
<script lang="ts">
  type Props = {
    size?: 'sm' | 'md' | 'lg';
  };

  let { size = 'md' }: Props = $props();
</script>

<svg class="[ spinner ]" data-size={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
  <circle class="spinner__track" cx="12" cy="12" r="10" />
  <path class="spinner__head" d="M12 2 a 10 10 0 0 1 10 10" />
</svg>

```

### External stylesheet (`spinner.sass`)

```sass
	.spinner
		display: inline-block
		animation: spinner-rotate 0.8s linear infinite

		&__track
			stroke: var(--background20)

		&__head
			stroke: var(--brand-primary)
			stroke-linecap: round

		/* CUBE Exception variants via data-size */
		&[data-size="sm"]
			width: 1rem
			height: 1rem

		&[data-size="md"]
			width: 1.5rem
			height: 1.5rem

		&[data-size="lg"]
			width: 2.25rem
			height: 2.25rem

	@keyframes spinner-rotate
		100%
			transform: rotate(360deg)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Spinner from './Spinner.svelte';
</script>

<Spinner size="md" />
```
