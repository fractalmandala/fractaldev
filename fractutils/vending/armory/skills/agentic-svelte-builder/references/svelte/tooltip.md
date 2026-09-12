# Svelte 5 Native Tooltip

An accessible Tooltip component featuring show/hide timers powered by **Svelte 5 Runes** (`$state`, `$effect`, `$props`).

---

## Component Implementation (`Tooltip.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    text: string;
    delay?: number;
    children?: Snippet;
  };

  let { text, delay = 200, children }: Props = $props();

  let visible = $state(false);
  let timer: NodeJS.Timeout;

  function show() {
    timer = setTimeout(() => { visible = true; }, delay);
  }

  function hide() {
    clearTimeout(timer);
    visible = false;
  }
</script>

<span
  class="[ tooltip-wrapper ] [ position-relative ]"
  onmouseenter={show}
  onmouseleave={hide}
  onfocusin={show}
  onfocusout={hide}
>
  {@render children?.()}

  {#if visible}
    <div class="[ tooltip-bubble ] [ pad6 padleft10 padright10 radius4 text-xs bold position-absolute ]" role="tooltip">
      {text}
    </div>
  {/if}
</span>

```

### External stylesheet (`tooltip.sass`)

```sass
	.tooltip-wrapper
		display: inline-block

	.tooltip-bubble
		bottom: 100%
		left: 50%
		transform: translateX(-50%) translateY(-4px)
		color: var(--foreground-inverse)
		background-color: var(--foreground10)
		white-space: nowrap
		pointer-events: none
		z-index: 50
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Tooltip from './Tooltip.svelte';
</script>

<Tooltip text="Click to save your work">
  <button class="button" data-variant="primary">Save</button>
</Tooltip>
```
