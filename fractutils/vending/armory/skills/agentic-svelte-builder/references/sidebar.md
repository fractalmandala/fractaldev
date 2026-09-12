# Sidebar (Tier 2 Native Component)

The **Sidebar** component provides a collapsible side navigation menu using the HTML **Popover API** (`popover` attribute), styled with **`fractals-styler`** primitives (`box`, `h100`, `width260`, `pad20`, `gap8`, `gap32`, `text-lg`, `bold`).

---

## Component Code (`Sidebar.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    id?: string;
    children?: Snippet;
  };

  let { id = 'app-sidebar', children }: Props = $props();
</script>

<aside {id} popover="auto" class="[ sidebar ] [ width260 h100 ]">
  <div class="[ sidebar__inner ] [ box h100 pad20 ]">
    <div class="[ sidebar__header ] [ row ycenter xbetween marginbot32 ]">
      <span class="[ sidebar__logo ] [ text-lg bold ]">Workspace</span>
      <button popovertarget={id} popovertargetaction="hide" class="[ sidebar__close ] [ text-xl lh1 ]">&times;</button>
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
		position: fixed
		top: 0
		left: 0
		margin: 0
		padding: 0
		border: none
		background-color: var(--sidebar-bg)
		color: var(--foreground-inverse)
		box-shadow: 4px 0 15px rgba(0, 0, 0, 0.15)
		transition: transform 0.25s ease

		@starting-style
			&:popover-open
				transform: translateX(-100%)

		&__close
			background: none
			border: none
			color: var(--foreground-muted)
			cursor: pointer
			&:hover
				color: var(--foreground-inverse)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Sidebar from './Sidebar.svelte';
</script>

<button popovertarget="app-sidebar" class="button" data-variant="secondary">
  Toggle Sidebar
</button>

<Sidebar id="app-sidebar">
  <a href="/dashboard" class="[ color-inverse ] [ no-underline ]">Dashboard</a>
  <a href="/settings" class="[ color-muted ] [ no-underline ]">Settings</a>
</Sidebar>
```
