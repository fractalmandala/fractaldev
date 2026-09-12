# Svelte 5 Controlled Drawer / Sheet

A controlled side/bottom Drawer component powered by **Svelte 5 Runes** (`$state`, `$bindable`, `$effect`, `$props`). Features slide animations, backdrop blur, and open state binding.

---

## Component Implementation (`Drawer.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    open?: boolean;
    title?: string;
    children?: Snippet;
  };

  let { open = $bindable(false), title, children }: Props = $props();

  $effect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  });

  function close() {
    open = false;
  }
</script>

{#if open}
  <div class="[ drawer-backdrop ] [ position-fixed ]" onclick={close} role="presentation">
    <div
      class="[ drawer-panel ] [ box width360 maxw100 h100 position-fixed ]"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <header class="[ row ycenter xbetween ] [ pad16 padleft20 padright20 bdr ]">
        {#if title}
          <h4 class="margin0 text-md bold">{title}</h4>
        {/if}
        <button class="[ drawer-close ] [ text-xl lh1 ]" onclick={close} aria-label="Close drawer">&times;</button>
      </header>
      <div class="[ drawer-body ] [ pad20 grow ]">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}

```

### External stylesheet (`drawer.sass`)

```sass
	.drawer-backdrop
		inset: 0
		background-color: rgba(15, 23, 42, 0.5)
		backdrop-filter: blur(4px)
		z-index: 100

	.drawer-panel
		top: 0
		right: 0
		background-color: var(--background10)
		box-shadow: -10px 0 25px rgba(0, 0, 0, 0.1)

	.drawer-close
		background: none
		border: none
		cursor: pointer
		color: var(--foreground-muted)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Drawer from './Drawer.svelte';

  let showDrawer = $state(false);
</script>

<button class="button" data-variant="secondary" onclick={() => showDrawer = true}>Open Drawer</button>

<Drawer bind:open={showDrawer} title="Navigation">
  <p>Drawer menu items...</p>
</Drawer>
```
