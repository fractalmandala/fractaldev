# Input Group (Zero-JS Native Component)

The **Input Group** component combines text inputs with prefix/suffix elements, styled with **`fractals-styler`** primitives (`row`, `ycenter`, `w100`, `pad8`, `padleft12`, `padright12`, `text-sm`, `bdr`).

---

## Component Code (`InputGroup.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    prefix?: Snippet | string;
    suffix?: Snippet | string;
    children?: Snippet;
  };

  let { prefix, suffix, children }: Props = $props();
</script>

<div class="[ input-group ] [ row ycenter w100 ]">
  {#if prefix}
    <span class="[ input-group__addon input-group__addon--prefix ] [ row ycenter pad8 padleft12 padright12 text-sm bdr ]">
      {#if typeof prefix === 'string'}
        {prefix}
      {:else}
        {@render prefix()}
      {/if}
    </span>
  {/if}

  <div class="[ input-group__field ] [ grow ]">
    {@render children?.()}
  </div>

  {#if suffix}
    <span class="[ input-group__addon input-group__addon--suffix ] [ row ycenter pad8 padleft12 padright12 text-sm bdr ]">
      {#if typeof suffix === 'string'}
        {suffix}
      {:else}
        {@render suffix()}
      {/if}
    </span>
  {/if}
</div>

```

### External stylesheet (`input-group.sass`)

```sass
	.input-group
		&__addon
			color: var(--foreground-muted)
			background-color: var(--background20)
			white-space: nowrap

			&--prefix
				border-right: none
				border-top-left-radius: var(--radius6)
				border-bottom-left-radius: var(--radius6)

			&--suffix
				border-left: none
				border-top-right-radius: var(--radius6)
				border-bottom-right-radius: var(--radius6)

		&__field
			:global(.input)
				border-radius: 0
				&:first-child
					border-top-left-radius: var(--radius6)
					border-bottom-left-radius: var(--radius6)
				&:last-child
					border-top-right-radius: var(--radius6)
					border-bottom-right-radius: var(--radius6)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import InputGroup from './InputGroup.svelte';
  import Input from './Input.svelte';

  let amount = $state('0.00');
</script>

<InputGroup prefix="$" suffix="USD">
  <Input type="number" bind:value={amount} />
</InputGroup>
```
