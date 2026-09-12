# Input (Zero-JS Native Component)

The **Input** component wraps standard HTML `<input>` with Svelte 5 two-way state binding (`bind:value`), styled with **`fractals-styler`** primitives (`w100`, `pad8`, `padleft12`, `padright12`, `radius6`, `bdr`, `text-sm`, `lh125`).

---

## Component Code (`Input.svelte`)

```svelte
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  type Props = HTMLInputAttributes & {
    value?: string | number;
  };

  let inputProps: Props = $props();
  let { value = $bindable(''), ...restProps } = inputProps;
</script>

<input
  bind:value={value}
  class="[ input ] [ w100 pad8 padleft12 padright12 radius6 bdr text-sm lh125 ] {inputProps.class ?? ''}"
  {...restProps}
/>

```

### External stylesheet (`input.sass`)

```sass
	.input
		color: var(--foreground10)
		background-color: var(--background10)
		border-color: var(--border)
		transition: border-color 0.15s ease, box-shadow 0.15s ease

		&::placeholder
			color: var(--foreground-subtle)

		&:focus
			outline: none
			border-color: var(--brand-primary)
			box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15)

		&:disabled
			background-color: var(--background20)
			cursor: not-allowed
			opacity: 0.7
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Input from './Input.svelte';

  let username = $state('');
</script>

<Input bind:value={username} placeholder="Enter your username..." />
<p>Value: {username}</p>
```
