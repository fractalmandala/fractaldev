# Drawer / Sheet (Tier 2 Native Component)

The **Drawer / Sheet** component renders side overlay sheets natively using HTML `<div popover="auto">` and CSS `@starting-style`, styled with **`fractals-styler`** primitives (`box`, `h100`, `width360`, `maxw100`, `pad16`, `pad20`, `bdr`, `text-md`, `bold`).

---

## Component Code (`Drawer.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    id: string; // Unique ID for popovertarget link
    title?: string;
    trigger?: Snippet<[drawerId: string]>;
    children?: Snippet;
  };

  let { id, title, trigger, children }: Props = $props();
</script>

{#if trigger}
  {@render trigger(id)}
{/if}

<div {id} popover="auto" class="[ drawer ] [ width360 maxw100 h100 ]">
  <div class="[ drawer__content ] [ box h100 ]">
    <div class="[ drawer__header ] [ row ycenter xbetween ] [ pad16 padleft20 padright20 ]">
      {#if title}
        <h4 class="[ drawer__title ] [ margin0 text-md bold ]">{title}</h4>
      {/if}
      <button class="[ drawer__close ] [ text-xl lh1 ]" popovertarget={id} popovertargetaction="hide">&times;</button>
    </div>
    <div class="[ drawer__body ] [ pad20 grow ]">
      {@render children?.()}
    </div>
  </div>
</div>

```

### External stylesheet (`drawer.sass`)

```sass
	.drawer
		margin: 0
		padding: 0
		border: none
		background: transparent
		position: fixed
		inset: 0 0 0 auto
		transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)
		transform: translateX(0)

		@starting-style
			&:popover-open
				transform: translateX(100%)

		&__content
			background-color: var(--background10)
			box-shadow: -10px 0 25px rgba(0, 0, 0, 0.1)

		&__header
			border-bottom: 1px solid var(--border)

		&__close
			background: none
			border: none
			cursor: pointer
			color: var(--foreground-muted)

		&__body
			overflow-y: auto
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Drawer from './Drawer.svelte';
</script>

<Drawer id="side-drawer" title="Navigation Drawer">
  {#snippet trigger(drawerId)}
    <button popovertarget={drawerId} class="button" data-variant="secondary">
      Open Drawer
    </button>
  {/snippet}

  <p>Drawer menu items and options go here.</p>
</Drawer>
```
