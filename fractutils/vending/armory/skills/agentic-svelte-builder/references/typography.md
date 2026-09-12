# Typography (Zero-JS Native Component)

The **Typography** component provides heading and body text primitives wrapping native HTML tags (`<h1>`-`<h6>`, `<p>`, `<blockquote>`, `<code>`), styled with **`fractals-styler`** primitives (`text-xl`, `text-lg`, `text-sm`, `bold`, `lh125`, `lh15`, `margin0`, `pad2`, `padleft6`, `padright6`, `radius4`).

---

## Component Code (`Typography.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'blockquote' | 'code';
    children?: Snippet;
  };

  let { variant = 'p', children }: Props = $props();
</script>

{#if variant === 'h1'}
  <h1 class="[ typography typography--h1 ] [ margin0 text-xl bold lh125 ]">{@render children?.()}</h1>
{:else if variant === 'h2'}
  <h2 class="[ typography typography--h2 ] [ margin0 text-lg bold lh125 ]">{@render children?.()}</h2>
{:else if variant === 'h3'}
  <h3 class="[ typography typography--h3 ] [ margin0 text-md bold lh125 ]">{@render children?.()}</h3>
{:else if variant === 'h4'}
  <h4 class="[ typography typography--h4 ] [ margin0 text-sm bold ]">{@render children?.()}</h4>
{:else if variant === 'blockquote'}
  <blockquote class="[ typography typography--blockquote ] [ margin0 padleft16 ]">{@render children?.()}</blockquote>
{:else if variant === 'code'}
  <code class="[ typography typography--code ] [ pad2 padleft6 padright6 radius4 text-sm ]">{@render children?.()}</code>
{:else}
  <p class="[ typography typography--p ] [ margin0 text-sm lh15 ]">{@render children?.()}</p>
{/if}

```

### External stylesheet (`typography.sass`)

```sass
	.typography
		&--h1, &--h2, &--h3, &--h4
			color: var(--foreground10)

		&--p
			color: var(--foreground-muted)

		&--blockquote
			border-left: 3px solid var(--border)
			font-style: italic
			color: var(--foreground-muted)

		&--code
			font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
			background-color: var(--background20)
			color: var(--foreground10)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Typography from './Typography.svelte';
</script>

<Typography variant="h1">Main Page Title</Typography>
<Typography variant="p">Standard paragraph content with rich typography styling.</Typography>
```
