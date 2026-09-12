# Accordion (Zero-JS Native Component)

The **Accordion** component allows toggling collapsible content panels. In modern HTML/CSS, single or multi-open accordions are natively powered by `<details>` and `<summary>` elements without any JavaScript. Single-open accordions use the native `name` attribute on `<details>` (`name="accordion"`). Styled with **`fractals-styler`** layout primitives and CUBE grouping.

---

## Component Code (`Accordion.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type AccordionItem = {
    id: string;
    title: string;
    content: Snippet | string;
    open?: boolean;
  };

  type Props = {
    items: AccordionItem[];
    name?: string; // Set same name for exclusive single-open accordion behavior
  };

  let { items, name = 'accordion-group' }: Props = $props();
</script>

<div class="[ accordion ] [ box w100 ] [ radius8 bdr ]">
  {#each items as item (item.id)}
    <details class="[ accordion__item ] [ box w100 ]" name={name} open={item.open}>
      <summary class="[ accordion__summary ] [ row ycenter xbetween ] [ pad16 text-sm bold ]">
        <span class="accordion__title">{item.title}</span>
        <svg class="[ accordion__icon ] [ width16 height16 ]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </summary>
      <div class="[ accordion__content ] [ pad16 text-sm lh15 ]">
        {#if typeof item.content === 'string'}
          <p class="margin0">{item.content}</p>
        {:else}
          {@render item.content()}
        {/if}
      </div>
    </details>
  {/each}
</div>

```

### External stylesheet (`accordion.sass`)

```sass
	/* Lean CUBE SASS for native details marker & open animation */
	.accordion__item
		border-bottom: 1px solid var(--border)
		&:last-child
			border-bottom: none
		&[open] .accordion__icon
			transform: rotate(180deg)

	.accordion__summary
		cursor: pointer
		list-style: none
		user-select: none
		background-color: var(--background10)
		transition: background-color 0.2s ease
		&::-webkit-details-marker
			display: none
		&:hover
			background-color: var(--background20)

	.accordion__icon
		transition: transform 0.2s ease

	.accordion__content
		background-color: var(--background10)
		color: var(--foreground-muted)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Accordion from './Accordion.svelte';

  const items = [
    { id: '1', title: 'What is Svelte 5?', content: 'Svelte 5 introduces Runes for explicit, fine-grained reactivity.' },
    { id: '2', title: 'Is JS required for Accordion?', content: 'No! The details name attribute natively creates exclusive accordion behavior in browser CSS/HTML.' }
  ];
</script>

<Accordion {items} name="faq" />
```
