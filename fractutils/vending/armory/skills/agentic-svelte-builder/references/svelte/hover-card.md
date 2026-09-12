# Svelte 5 Native Hover Card

A Hover Card component featuring delay timers powered by **Svelte 5 Runes** (`$state`, `$effect`, `$props`). Prevents accidental popup triggers using controlled `mouseenter` / `mouseleave` timer effects.

---

## Component Implementation (`HoverCard.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    openDelay?: number;
    closeDelay?: number;
    trigger?: Snippet;
    children?: Snippet;
  };

  let { openDelay = 200, closeDelay = 300, trigger, children }: Props = $props();

  let isHovered = $state(false);
  let open = $state(false);
  let openTimer: NodeJS.Timeout;
  let closeTimer: NodeJS.Timeout;

  function handleMouseEnter() {
    clearTimeout(closeTimer);
    openTimer = setTimeout(() => { open = true; }, openDelay);
  }

  function handleMouseLeave() {
    clearTimeout(openTimer);
    closeTimer = setTimeout(() => { open = false; }, closeDelay);
  }
</script>

<div
  class="[ hover-card-container ] [ position-relative ]"
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
>
  <div class="[ hover-card-trigger ]">
    {@render trigger?.()}
  </div>

  {#if open}
    <div class="[ hover-card-popover ] [ pad16 radius8 bdr width280 position-absolute ]">
      {@render children?.()}
    </div>
  {/if}
</div>

```

### External stylesheet (`hover-card.sass`)

```sass
	.hover-card-container
		display: inline-block

	.hover-card-popover
		top: 100%
		left: 0
		margin-top: 0.5rem
		background-color: var(--background10)
		border-color: var(--border)
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
		z-index: 50
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import HoverCard from './HoverCard.svelte';
</script>

<HoverCard openDelay={150}>
  {#snippet trigger()}
    <a href="/user" class="bold">@sveltejs</a>
  {/snippet}

  <div>
    <strong class="text-sm bold">Svelte 5</strong>
    <p class="text-xs color-muted margin0">Cybernetically enhanced web applications.</p>
  </div>
</HoverCard>
```
