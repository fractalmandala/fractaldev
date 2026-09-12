# Svelte 5 Native Context Menu

A right-click Context Menu component powered by **Svelte 5 Runes** (`$state`, `$effect`, `$props`). Listens for native `contextmenu` events, calculates cursor position, and dismisses on window clicks.

---

## Component Implementation (`ContextMenu.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type MenuItem = {
    label: string;
    action: () => void;
  };

  type Props = {
    items: MenuItem[];
    children?: Snippet;
  };

  let { items, children }: Props = $props();

  let open = $state(false);
  let pos = $state({ x: 0, y: 0 });

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    pos = { x: e.clientX, y: e.clientY };
    open = true;
  }

  // Dismiss menu when clicking outside
  $effect(() => {
    if (!open) return;
    function handleOutsideClick() {
      open = false;
    }
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  });
</script>

<div oncontextmenu={handleContextMenu} class="[ context-menu-trigger ]">
  {@render children?.()}
</div>

{#if open}
  <div
    class="[ context-menu ] [ box pad6 radius8 bdr position-fixed ]"
    style:--menu-top="{pos.y}px" style:--menu-left="{pos.x}px"
    role="menu"
  >
    {#each items as item}
      <button
        class="[ context-menu__item ] [ row ycenter w100 pad8 radius4 text-sm ]"
        onclick={() => { item.action(); open = false; }}
        role="menuitem"
      >
        {item.label}
      </button>
    {/each}
  </div>
{/if}

```

### External stylesheet (`context-menu.sass`)

```sass
	.context-menu
		top: var(--menu-top)
		left: var(--menu-left)
		background-color: var(--background10)
		border-color: var(--border)
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
		min-width: 160px
		z-index: 100

		&__item
			background: none
			border: none
			cursor: pointer
			color: var(--foreground10)
			text-align: left
			&:hover
				background-color: var(--background20)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import ContextMenu from './ContextMenu.svelte';

  const menu = [
    { label: 'Copy Link', action: () => console.log('Copied') },
    { label: 'Inspect Item', action: () => console.log('Inspected') }
  ];
</script>

<ContextMenu items={menu}>
  <div class="[ pad24 bdr radius8 bg-surface ]">
    Right-click inside this area to open the custom menu.
  </div>
</ContextMenu>
```


> Dynamic geometry exception: CSS custom properties carry measured values only; the adjacent stylesheet consumes them for layout. Colors, spacing, typography, and static layout remain in classes or Sass.
