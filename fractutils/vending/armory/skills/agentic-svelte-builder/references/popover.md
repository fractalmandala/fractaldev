# Popover (Zero-JS Native Component)

The **Popover** component creates floating contextual popups natively using the HTML **Popover API** (`popover` attribute) and **CSS Anchor Positioning**, styled with **`fractals-styler`** primitives (`pad16`, `radius8`, `bdr`, `maxw320`).

---

## Component Code (`Popover.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    id: string; // Unique ID for popovertarget link
    trigger?: Snippet<[popoverId: string]>;
    children?: Snippet;
  };

  let { id, trigger, children }: Props = $props();
</script>

{#if trigger}
  {@render trigger(id)}
{/if}

<div {id} popover="auto" class="[ popover ] [ pad16 radius8 bdr maxw320 ]">
  {@render children?.()}
</div>

```

### External stylesheet (`popover.sass`)

```sass
	.popover
		margin: 0
		background-color: var(--background10)
		border-color: var(--border)
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)

		/* Native CSS Anchor Positioning */
		position-anchor: --popover-anchor
		top: anchor(bottom)
		left: anchor(center)
		transform: translateX(-50%)

		&::backdrop
			background-color: transparent
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Popover from './Popover.svelte';
</script>

<div class="[ popover-anchor ] [ inline-block position-relative ]">
  <Popover id="my-popover">
    {#snippet trigger(popoverId)}
      <button popovertarget={popoverId} class="button" data-variant="secondary">
        Toggle Popover
      </button>
    {/snippet}

    <h4 class="margin0 text-sm bold">Popover Content</h4>
    <p class="text-xs color-muted">This panel is toggled and positioned 100% natively without JavaScript.</p>
  </Popover>
</div>
```
