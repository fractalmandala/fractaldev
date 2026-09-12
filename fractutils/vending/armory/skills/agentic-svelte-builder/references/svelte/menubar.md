# Svelte 5 Native Menubar

A desktop-style top Menubar component powered by **Svelte 5 Runes** (`$state`, `$props`). Features horizontal ARIA keyboard arrow key navigation across top-level menus.

---

## Component Implementation (`Menubar.svelte`)

```svelte
<script lang="ts">
  type MenuChild = {
    label: string;
    action: () => void;
  };

  type TopMenu = {
    title: string;
    items: MenuChild[];
  };

  type Props = {
    menus: TopMenu[];
  };

  let { menus }: Props = $props();

  let activeMenuIndex = $state<number | null>(null);
  let activeSubIndex = $state(0);

  function handleKeydown(e: KeyboardEvent) {
    if (activeMenuIndex === null) return;

    if (e.key === 'ArrowRight') {
      activeMenuIndex = (activeMenuIndex + 1) % menus.length;
      activeSubIndex = 0;
    } else if (e.key === 'ArrowLeft') {
      activeMenuIndex = (activeMenuIndex - 1 + menus.length) % menus.length;
      activeSubIndex = 0;
    } else if (e.key === 'ArrowDown') {
      const items = menus[activeMenuIndex].items;
      activeSubIndex = (activeSubIndex + 1) % items.length;
    } else if (e.key === 'ArrowUp') {
      const items = menus[activeMenuIndex].items;
      activeSubIndex = (activeSubIndex - 1 + items.length) % items.length;
    } else if (e.key === 'Enter') {
      menus[activeMenuIndex].items[activeSubIndex]?.action();
      activeMenuIndex = null;
    } else if (e.key === 'Escape') {
      activeMenuIndex = null;
    }
  }
</script>

<div class="[ menubar ] [ row ycenter gap4 pad4 radius8 bdr ]" onkeydown={handleKeydown} role="menubar">
  {#each menus as menu, menuIdx}
    <div class="[ menubar__item ] [ position-relative ]">
      <button
        class="[ button ] [ pad6 padleft12 padright12 text-sm bold ]"
        data-variant="ghost"
        onclick={() => activeMenuIndex = activeMenuIndex === menuIdx ? null : menuIdx}
        role="menuitem"
        aria-expanded={activeMenuIndex === menuIdx}
      >
        {menu.title}
      </button>

      {#if activeMenuIndex === menuIdx}
        <div class="[ menubar__dropdown ] [ box pad6 radius8 bdr minw180 position-absolute ]" role="menu">
          {#each menu.items as sub, subIdx}
            <button
              class="[ menubar__subitem ] [ row ycenter w100 pad8 radius4 text-sm ]"
              data-state={subIdx === activeSubIndex ? 'active' : 'inactive'}
              onclick={() => { sub.action(); activeMenuIndex = null; }}
              role="menuitem"
            >
              {sub.label}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>

```

### External stylesheet (`menubar.sass`)

```sass
	.menubar
		background-color: var(--background10)
		border-color: var(--border)

	.menubar__dropdown
		top: 100%
		left: 0
		margin-top: 0.25rem
		background-color: var(--background10)
		border-color: var(--border)
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
		z-index: 50

	.menubar__subitem
		background: none
		border: none
		cursor: pointer
		color: var(--foreground10)
		text-align: left
		&:hover, &[aria-selected="true"]
			background-color: var(--background20)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Menubar from './Menubar.svelte';

  const topMenus = [
    {
      title: 'File',
      items: [
        { label: 'New Tab', action: () => console.log('New Tab') },
        { label: 'Save', action: () => console.log('Save') }
      ]
    },
    {
      title: 'Edit',
      items: [
        { label: 'Undo', action: () => console.log('Undo') },
        { label: 'Redo', action: () => console.log('Redo') }
      ]
    }
  ];
</script>

<Menubar menus={topMenus} />
```
