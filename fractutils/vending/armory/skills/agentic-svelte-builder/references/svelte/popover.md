# Svelte 5 Controlled Popover

A controlled Popover component powered by **Svelte 5 Runes** (`$state`, `$bindable`, `$effect`, `$props`). Features click-outside dismissal via `$effect()`, controlled open bindings, and CSS Anchor Positioning.

---

## Component Implementation (`Popover.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    open?: boolean;
    trigger?: Snippet;
    children?: Snippet;
  };

  let { open = $bindable(false), trigger, children }: Props = $props();

  $effect(() => {
    if (!open) return;
    function handleOutsideClick() { open = false; }
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  });
</script>

<div class="[ popover-container ] [ position-relative ]">
  <div
    onclick={(e) => { e.stopPropagation(); open = !open; }}
    onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (open = !open)}
    role="button"
    tabindex="0"
    aria-expanded={open}
  >
    {@render trigger?.()}
  </div>

  {#if open}
    <div
      class="[ popover-panel ] [ pad16 radius8 bdr maxw320 position-absolute ]"
      onclick={(e) => e.stopPropagation()}
    >
      {@render children?.()}
    </div>
  {/if}
</div>

```

### External stylesheet (`popover.sass`)

```sass
	.popover-container
		display: inline-block

	.popover-panel
		top: 100%
		left: 50%
		transform: translateX(-50%)
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
  import Popover from './Popover.svelte';

  let isOpen = $state(false);
</script>

<Popover bind:open={isOpen}>
  {#snippet trigger()}
    <button class="button" data-variant="secondary">Toggle Popover</button>
  {/snippet}

  <h4 class="margin0 text-sm bold">Popover Title</h4>
  <p class="text-xs color-muted">Controlled Svelte 5 popover panel.</p>
</Popover>
```
