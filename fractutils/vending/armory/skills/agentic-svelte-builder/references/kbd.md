# Kbd (Zero-JS Native Component)

The **Kbd** component displays keyboard shortcut keys natively using `<kbd>`, styled with **`fractals-styler`** primitives (`row`, `ycenter`, `xcenter`, `pad2`, `padleft6`, `padright6`, `radius4`, `bdr`, `text-xs`, `bold`).

---

## Component Code (`Kbd.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLElement> & {
    children?: Snippet;
  };

  let { children, ...restProps }: Props = $props();
</script>

<kbd class="[ kbd ] [ row ycenter xcenter ] [ pad2 padleft6 padright6 radius4 bdr text-xs bold ]" {...restProps}>
  {@render children?.()}
</kbd>

```

### External stylesheet (`kbd.sass`)

```sass
	.kbd
		display: inline-flex
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
		color: var(--foreground-muted)
		background-color: var(--background20)
		border-bottom-width: 2px
		box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05)
		user-select: none
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Kbd from './Kbd.svelte';
</script>

<p>Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open search.</p>
```
