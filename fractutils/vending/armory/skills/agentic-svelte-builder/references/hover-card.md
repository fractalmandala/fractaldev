# Hover Card (Tier 2 Native Component)

The **Hover Card** component displays rich popup previews on hover using CSS `:hover` / `:focus-within`, styled with **`fractals-styler`** primitives (`pad16`, `radius8`, `bdr`, `width280`).

---

## Component Code (`HoverCard.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    trigger?: Snippet;
    children?: Snippet;
  };

  let { trigger, children }: Props = $props();
</script>

<div class="[ hover-card-wrapper ] [ position-relative ]">
  <div class="[ hover-card-trigger ]">
    {@render trigger?.()}
  </div>
  <div class="[ hover-card-popover ] [ pad16 radius8 bdr width280 ]">
    {@render children?.()}
  </div>
</div>

```

### External stylesheet (`hover-card.sass`)

```sass
	.hover-card-wrapper
		display: inline-block
		&:hover .hover-card-popover, &:focus-within .hover-card-popover
			opacity: 1
			visibility: visible
			transform: translateY(0)

	.hover-card-popover
		position: absolute
		top: 100%
		left: 0
		margin-top: 0.5rem
		background-color: var(--background10)
		border-color: var(--border)
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
		opacity: 0
		visibility: hidden
		transform: translateY(4px)
		transition: opacity 0.2s ease, transform 0.2s ease
		z-index: 40
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import HoverCard from './HoverCard.svelte';
</script>

<HoverCard>
  {#snippet trigger()}
    <a href="/users/svelte" class="bold color-foreground">@sveltejs</a>
  {/snippet}

  <div>
    <strong class="text-sm bold">Svelte</strong>
    <p class="text-xs color-muted margin0">Cybernetically enhanced web apps.</p>
  </div>
</HoverCard>
```
