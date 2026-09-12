---
title: Styling and Animation
description: Sizing, coloring, and controlling animated icon sets with the trigger prop.
type: fractalicons
---

Icons are unstyled SVG primitives, so you drive color, size, and motion entirely from CSS — including reacting to a **parent** element like a button.

- **Color is automatic.** Every icon paints with `currentColor` (both fill and stroke), so it inherits the surrounding text color. Change `color` anywhere up the tree and the icon follows.
- **A stable `.fractalicon` class** is on every icon's `<svg>` (plus `part="icon"` for shadow-DOM `::part()` styling), so you can target it without `:global` gymnastics.
- Anything you pass through — `class`, `style`, `stroke`, `transform`, data attributes — lands on the `<svg>`.

```svelte
<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luHeart, luSettings, luBell } from 'fractalicons/lucide';

	let ringing = $state(false);
</script>

<!-- 1. Recolor on hover — nothing but currentColor -->
<button class="like"><Icon icon={luHeart} /> Like</button>

<!-- 2. Scale + spin the icon when the BUTTON is hovered -->
<button class="settings"><Icon icon={luSettings} /> Settings</button>

<!-- 3. Animate on click via a toggled state class -->
<button class="bell" class:ringing onclick={() => (ringing = !ringing)}>
	<Icon icon={luBell} />
	{ringing ? 'Ring!' : 'Notify'}
</button>

<style>
	button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* smooth transitions on the icon */
	button :global(.fractalicon) {
		transition:
			transform 0.2s ease,
			color 0.2s ease;
	}

	/* 1. color inherits — just set it on hover */
	.like:hover {
		color: crimson;
	}

	/* 2. transform the icon based on the parent's hover */
	.settings:hover :global(.fractalicon) {
		transform: scale(1.3) rotate(45deg);
		color: #2563eb;
	}

	/* 3. react to a state class */
	.bell.ringing :global(.fractalicon) {
		transform: rotate(360deg);
		color: #d97706;
	}
</style>
```

> In a plain (non-Svelte-scoped) stylesheet you can drop the `:global(...)` wrapper: `.settings:hover .fractalicon { … }`.


## Animations

The animated family (`materialanim`) accepts a `trigger` prop controlling **when** the animation runs. Non-playing icons render their finished (fully drawn) state, and `prefers-reduced-motion` is always respected.

| `trigger` | Behavior                                                            |
| :-------- | :------------------------------------------------------------------ |
| `load`    | Play once when the icon mounts _(default — matches prior behavior)_ |
| `hover`   | Replay each time the pointer enters                                 |
| `click`   | Replay on click                                                     |
| `visible` | Play once when scrolled into view                                   |
| `loop`    | Play continuously                                                   |
| `none`    | Never animate; show the finished state                              |

```svelte
<script lang="ts">
	import { Icon } from 'fractalicons';
	import { maaLoadingLoop } from 'fractalicons/materialanim';
</script>

<Icon icon={maaLoadingLoop} size={32} trigger="hover" />
<Icon icon={maaLoadingLoop} size={32} trigger="loop" />
```

> The `trigger` prop is a no-op on static families, so it's always safe to pass.
