---
name: svelte-components-patterns
description: Component architecture in Svelte 5 using snippets ({#snippet}, {@render}), event props (onclick), context menus, modal dialogs, dynamic component rendering, and clean prop interfaces.
---

# Svelte 5 Component Patterns

Component design in Svelte 5 uses typed snippets (`{#snippet}` / `{@render}`), simplifies event handling to prop functions, and streamlines context creation. It does not use the `<slot>` or `<slot/>` method which is outdated.

## Core Patterns

### 1. Snippets over Slots

Replace Svelte 4 `<slot>` elements with Svelte 5 `{#snippet}` definitions and `{@render}` tags:

```svelte
<!-- Card.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		header,
		children,
		footer
	}: {
		header?: Snippet;
		children: Snippet;
		footer?: Snippet;
	} = $props();
</script>

<div class="card">
	{#if header}
		<header>{@render header()}</header>
	{/if}

	<main>{@render children()}</main>

	{#if footer}
		<footer>{@render footer()}</footer>
	{/if}
</div>
```

### 2. Event Handlers as Callback Props

In Svelte 5, custom component events are passed as callback props instead of using `createEventDispatcher` or `on:event`:

```svelte
<!-- CustomButton.svelte -->
<script lang="ts">
	let { label, onselect }: { label: string; onselect: (id: string) => void } = $props();
</script>

<button onclick={() => onselect('item-1')}>
	{label}
</button>
```

### 3. Layout Children Rendering

Svelte 5 layouts render child routes using `children`:

```svelte
<!-- +layout.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<div class="app-layout">
	{@render children()}
</div>
```
