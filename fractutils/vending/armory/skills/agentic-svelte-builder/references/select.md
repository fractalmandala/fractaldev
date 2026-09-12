# Select (Zero-JS Native Component)

The **Select** component leverages modern CSS `appearance: base-select` (Customizable Native Select) to allow HTML option styling, styled with **`fractals-styler`** primitives (`w100`, `pad8`, `padleft12`, `padright12`, `radius6`, `bdr`, `text-sm`).

---

## Component Code (`Select.svelte`)

```svelte
<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type Props = HTMLSelectAttributes & {
    value?: string | number;
    children?: Snippet;
  };

  let { value = $bindable(''), children, ...restProps }: Props = $props();
</script>

<select bind:value={value} class="[ custom-select ] [ w100 pad8 padleft12 padright12 radius6 bdr text-sm ]" {...restProps}>
  {@render children?.()}
</select>

```

### External stylesheet (`select.sass`)

```sass
	.custom-select
		appearance: base-select /* Native customizable select in modern browsers */
		background-color: var(--background10)
		border-color: var(--border)
		cursor: pointer

		&::picker(select)
			appearance: base-select
			padding: var(--px8)
			border-radius: var(--radius8)
			box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Select from './Select.svelte';

  let value = $state('sv');
</script>

<Select bind:value={value}>
  <option value="sv">Svelte 5</option>
  <option value="react">React</option>
  <option value="vue">Vue</option>
</Select>
```
