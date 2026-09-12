# Collapsible (Zero-JS Native Component)

The **Collapsible** component toggles panel visibility natively using `<details>` and `<summary>`, styled with **`fractals-styler`** primitives (`box`, `w100`, `radius6`, `bdr`, `pad12`, `pad16`, `text-sm`, `bold`).

---

## Component Code (`Collapsible.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    title: string;
    open?: boolean;
    children?: Snippet;
  };

  let { title, open = false, children }: Props = $props();
</script>

<details class="[ collapsible ] [ box w100 ] [ radius6 bdr ]" {open}>
  <summary class="[ collapsible__trigger ] [ row ycenter xbetween ] [ pad12 padleft16 padright16 text-sm bold ]">
    <span>{title}</span>
    <svg class="[ collapsible__chevron ] [ width16 height16 ]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  </summary>
  <div class="[ collapsible__content ] [ pad12 padleft16 padright16 text-sm ]">
    {@render children?.()}
  </div>
</details>

```

### External stylesheet (`collapsible.sass`)

```sass
	.collapsible
		&[open] .collapsible__chevron
			transform: rotate(180deg)

		&__trigger
			cursor: pointer
			list-style: none
			&::-webkit-details-marker
				display: none

		&__chevron
			transition: transform 0.2s ease

		&__content
			border-top: 1px solid var(--border)
			background-color: var(--background20)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Collapsible from './Collapsible.svelte';
</script>

<Collapsible title="Show Advanced Options">
  <p>Here are additional configuration settings...</p>
</Collapsible>
```
