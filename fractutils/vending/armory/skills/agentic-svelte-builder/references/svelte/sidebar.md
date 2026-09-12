# SvelteKit Native Sidebar with Persistence

A Sidebar component integrated with **SvelteKit** `page.url.pathname` for active link matching and `localStorage` persistence via **Svelte 5 Runes** (`$state`, `$effect`, `$props`).

---

## Component Implementation (`Sidebar.svelte`)

```svelte
<script lang="ts">
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';

  type Props = {
    open?: boolean;
    storageKey?: string;
    children?: Snippet;
  };

  let { open = $bindable(true), storageKey = 'sidebar-state', children }: Props = $props();

  // Restore state from localStorage on mount
  $effect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      open = saved === 'true';
    }
  });

  // Sync state back to localStorage on change
  $effect(() => {
    localStorage.setItem(storageKey, String(open));
  });

  function isActive(path: string): boolean {
    return page.url.pathname === path;
  }
</script>

<aside class="[ sidebar ] [ box h100 ]" data-state={!open ? 'active' : 'inactive'}>
  <div class="[ sidebar__inner ] [ box h100 pad20 ]">
    <div class="[ sidebar__header ] [ row ycenter xbetween marginbot32 ]">
      <span class="[ sidebar__logo ] [ text-lg bold ]">Dashboard</span>
      <button class="[ sidebar__toggle ] [ text-sm ]" onclick={() => open = !open}>
        {open ? '◀' : '▶'}
      </button>
    </div>

    <nav class="[ sidebar__nav ] [ box gap8 ]">
      {@render children?.()}
    </nav>
  </div>
</aside>

```

### External stylesheet (`sidebar.sass`)

```sass
	.sidebar
		width: 260px
		background-color: var(--sidebar-bg)
		color: var(--foreground-inverse)
		transition: width 0.25s ease

		&--collapsed
			width: 64px
			.sidebar__logo
				display: none

		&__toggle
			background: none
			border: none
			color: var(--foreground-muted)
			cursor: pointer

		&__nav
			:global(a)
				color: var(--foreground-muted)
				text-decoration: none
				padding: 0.5rem 0.75rem
				border-radius: 6px
				&:hover, &[aria-current="page"]
					color: var(--foreground-inverse)
					background-color: rgba(255, 255, 255, 0.1)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Sidebar from './Sidebar.svelte';
</script>

<Sidebar>
  <a href="/dashboard" aria-current="page">Dashboard</a>
  <a href="/settings">Settings</a>
</Sidebar>
```
