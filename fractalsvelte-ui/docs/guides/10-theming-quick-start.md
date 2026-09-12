# Theming quick start

There are two supported theming paths: global application tokens and a scoped `Theme` component.

## Global theme

Import the system first, then set raw tokens in the consuming application’s root Sass:

```sass
@use 'fractalsvelte/styles/system'

:root
	--theme-color: #7c3aed
	--theme-color-alt: #6d28d9
	--radius-6: 10px
	--shadow-m: 0 8px 24px rgb(15 23 42 / .12)
```

All components inherit the new values.

## Scoped theme

Use `Theme` when a subtree needs a separate visual language:

```svelte
<Theme theme="dark" tokens={{ '--theme-color': '#f97316', '--theme-color-alt': '#ea580c' }}>
	<Card><Button>Orange action</Button></Card>
</Theme>
```

`Theme` is layout-neutral and does not create a new visual surface by itself. It only scopes custom properties and an optional light/dark mode.

## Theme accents

`--theme-color` aliases `--theme-color`, and `--theme-color-alt` aliases `--theme-color-alt`. Set both source values instead of overriding the aliases.
