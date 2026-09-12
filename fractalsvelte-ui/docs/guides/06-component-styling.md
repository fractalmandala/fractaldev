# Component styling hooks

Components consume the raw public token vocabulary and a small set of stable `--ui-*` contract variables. You normally theme the root once, then use scoped `Theme` tokens or local layout variables for exceptions.

## Raw tokens

Use `--bg-*` for surfaces, `--text-*` for foregrounds, `--state-*` for interaction states, `--border` and `--border-subtle` for boundaries, `--theme-color` and `--theme-color-alt` for emphasis, and `--ring` for focus. Do not introduce `--color-*` aliases in consumer overrides.

## Component contracts

Use `--ui-control-*` for control density, `--ui-card-*` for cards, `--ui-popover-*` for popovers, `--ui-focus-*` for focus geometry, and `--ui-*-z-index` for overlays and toasts. See [Component contracts](16-component-contracts.md) for the complete list.

## Local overrides

Layout primitives expose local variables such as `--stack-space`, `--grid-min`, and `--sidebar-size`. Set these on the primitive instance rather than editing the library Sass.

```svelte
<Card style="--ui-card-radius: var(--radius-12); --ui-card-shadow: none">
	Content inherits the application tokens.
</Card>
```
