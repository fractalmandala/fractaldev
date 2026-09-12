# Card (Zero-JS Native Component)

The **Card** component creates styled content containers using semantic HTML (`<article>`, `<header>`, `<footer>`), styled with **`fractals-styler`** primitives (`box`, `w100`, `radius8`, `bdr`, `pad20`, `pad12`).

---

## Component Code (`Card.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLElement> & {
    header?: Snippet;
    footer?: Snippet;
    children?: Snippet;
  };

  let { header, footer, children, ...restProps }: Props = $props();
</script>

<article class="[ card ] [ box w100 ] [ radius8 bdr ]" {...restProps}>
  {#if header}
    <header class="[ card__header ] [ pad20 padbot12 ]">
      {@render header()}
    </header>
  {/if}

  {#if children}
    <div class="[ card__body ] [ pad20 grow ]">
      {@render children()}
    </div>
  {/if}

  {#if footer}
    <footer class="[ card__footer ] [ pad12 padleft20 padright20 ]">
      {@render footer()}
    </footer>
  {/if}
</article>

```

### External stylesheet (`card.sass`)

```sass
	.card
		background-color: var(--background10)
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05)

		&__header
			border-bottom: 1px solid var(--border-subtle)

		&__footer
			border-top: 1px solid var(--border-subtle)
			background-color: var(--background20)
			border-bottom-left-radius: var(--radius8)
			border-bottom-right-radius: var(--radius8)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Card from './Card.svelte';
</script>

<Card>
  {#snippet header()}
    <h3 class="margin0 text-lg bold">Card Title</h3>
  {/snippet}

  <p>Card body content goes here.</p>

  {#snippet footer()}
    <button>Confirm Action</button>
  {/snippet}
</Card>
```
