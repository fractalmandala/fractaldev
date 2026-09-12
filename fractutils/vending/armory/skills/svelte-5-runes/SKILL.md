---
name: svelte-5-runes
description: Design, implement, and audit Svelte 5 reactive state, derivations, effects, and props using $state, $derived, $effect, $props, $bindable, and $host. Enforces direct derived assignments and prevents legacy stores or $: declarations.
metadata:
  origin: ECC
---

# Svelte 5 Runes & Fine-Grained Reactivity

Svelte 5 introduces runes — explicit compile-time primitives that govern reactivity across components and module boundaries. This skill provides rules and code patterns for implementing Svelte 5 runes correctly.

## Core Runes Reference

### 1. `$state` & `$state.raw`

- Use `let count = $state(0)` for mutable reactive state.
- Objects and arrays wrapped in `$state` are deeply reactive proxies.
- Use `$state.raw` for large data structures or immutable objects where deep proxying is unnecessary.

### 2. `$derived` & `$derived.by`

- Use `let doubled = $derived(count * 2)` for computed reactive values.
- **CRITICAL**: Always write derived expressions directly (`let x = $derived(val)`). Never wrap simple expressions in anonymous functions like `$derived(() => val)`.
- Use `$derived.by(() => { ... return result; })` ONLY when multi-statement complex computation blocks are required.

### 3. `$props` & `$bindable`

- Declare component props with `let { value = 0, title, children }: Props = $props()`.
- Use `$bindable()` for two-way binding props: `let { value = $bindable(0) }: Props = $props()`.

### 4. `$effect` & `$effect.pre`

- Use `$effect(() => { ... })` for side-effects like DOM manipulation or subscribing to external events.
- `$effect` runs after component mount and DOM updates.
- `$effect.pre` runs before DOM updates occur.
- Return a cleanup function from `$effect` to handle unmounting/teardown.

## Common Anti-Patterns & Fixes

### ❌ Anti-Pattern: Anonymous Function in `$derived`

```svelte
<!-- INCORRECT -->
<script>
	let count = $state(0);
	let doubled = $derived(() => count * 2);
</script>
```

### ✅ Correct: Direct Derived Assignment

```svelte
<!-- CORRECT -->
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>
```

### ❌ Anti-Pattern: Svelte 4 Store Imports

```svelte
<!-- INCORRECT -->
<script>
	import { writable } from 'svelte/store';
	const count = writable(0);
</script>
```

### ✅ Correct: Svelte 5 State Module

```svelte
<!-- CORRECT -->
<script>
	let count = $state(0);
</script>
```
