# Svelte 5 Native Accordion

A controlled, accessible Accordion component powered by **Svelte 5 Context** and **Runes** (`$state`, `$bindable`, `$props`). Supports single or multiple open items with smooth collapse state tracking and keyboard navigation.

---

## Component Implementation

### 1. Accordion Root (`Accordion.svelte`)

```svelte
<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  type Props = {
    value?: string | string[];
    multiple?: boolean;
    children?: Snippet;
  };

  let { value = $bindable(multiple ? [] : ''), multiple = false, children }: Props = $props();

  // Expose context for child AccordionItem components
  setContext('accordion', {
    get value() { return value; },
    toggle(id: string) {
      if (multiple && Array.isArray(value)) {
        if (value.includes(id)) {
          value = value.filter(i => i !== id);
        } else {
          value = [...value, id];
        }
      } else {
        value = value === id ? '' : id;
      }
    }
  });
</script>

<div class="[ accordion ] [ box w100 ] [ radius8 bdr ]">
  {@render children?.()}
</div>
```

### 2. Accordion Item (`AccordionItem.svelte`)

```svelte
<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  type Props = {
    id: string;
    title: string;
    children?: Snippet;
  };

  let { id, title, children }: Props = $props();

  const accordion = getContext<{ value: string | string[]; toggle: (id: string) => void }>('accordion');
  let isOpen = $derived(
    Array.isArray(accordion.value) ? accordion.value.includes(id) : accordion.value === id
  );
</script>

<div class="[ accordion-item ] [ box w100 ]" data-state={isOpen ? 'open' : 'closed'}>
  <button
    class="[ accordion-item__trigger ] [ row ycenter xbetween ] [ pad16 text-sm bold w100 ]"
    onclick={() => accordion.toggle(id)}
    aria-expanded={isOpen}
  >
    <span>{title}</span>
    <svg class="[ accordion-item__chevron ] [ width16 height16 ]" data-state={isOpen ? 'open' : 'closed'} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  </button>

  {#if isOpen}
    <div class="[ accordion-item__content ] [ pad16 text-sm lh15 ]">
      {@render children?.()}
    </div>
  {/if}
</div>

```

### External stylesheet (`accordion.sass`)

```sass
	.accordion-item
		border-bottom: 1px solid var(--border)
		&:last-child
			border-bottom: none

		&__trigger
			background: none
			border: none
			cursor: pointer
			color: var(--foreground10)
			text-align: left

		&__chevron
			transition: transform 0.2s ease
			&[data-state="open"]
				transform: rotate(180deg)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Accordion from './Accordion.svelte';
  import AccordionItem from './AccordionItem.svelte';

  let activeTab = $state('item-1');
</script>

<Accordion bind:value={activeTab}>
  <AccordionItem id="item-1" title="What is Svelte 5?">
    Svelte 5 introduces Runes ($state, $derived, $effect) for fine-grained reactivity.
  </AccordionItem>
  <AccordionItem id="item-2" title="How does Context work?">
    Svelte setContext/getContext shares state cleanly down the component tree.
  </AccordionItem>
</Accordion>
```
