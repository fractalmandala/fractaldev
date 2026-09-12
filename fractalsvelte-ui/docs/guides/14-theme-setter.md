# Theme setter

The documentation shell exposes a responsive right-side Theme setter from the header. It is a reference implementation of the appearance API, not a required dependency for consuming applications.

## Use the component

Import the optional component and bind the two public props. Its children remain the page content; the drawer and backdrop are layered over that content only while `open` is true.

```svelte
<script lang="ts">
	import { Button, ThemeSetter } from 'fractalsvelte/components';
	let open = $state(false);
	let mode = $state<'light' | 'dark'>('light');
</script>

<ThemeSetter bind:open bind:mode>
	<Button onclick={() => open = true}>Appearance</Button>
	<!-- the rest of your page -->
</ThemeSetter>
```

| Prop | Type | Default | Behavior |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Bindable drawer visibility; Escape and the backdrop close it. |
| `mode` | `'light'` or `'dark'` | `'light'` | Bindable document mode; updates `data-theme`, `data-mode`, and `color-scheme` on `<html>` and `<body>`. |
| `children` | `Snippet` | — | Content rendered beneath the optional drawer. |

## Tabs

- Theme: select a preset family and choose preset or custom accent values.
- Auras: choose a two-layer, blended Aura background.
- Gradients: apply a supplied CSS gradient as the page background.
- Patterns: apply supplied background declarations, including image and size.

The mode filter shows backgrounds classified for the active mode, with an All modes escape hatch. The currently selected background remains visible if it does not match the active mode.

## Persistence

The setter stores mode, family, and background selection under `fractalsvelte.mode`, `fractalsvelte.theme-family`, and `fractalsvelte.background`. The background value is a small JSON selection (`plain`, `aura`, `gradient`, or `pattern` plus an ID). Validate stored values before using them.

The setter does not store arbitrary color strings separately. When **Use my accents** is selected, the two color inputs override the selected family’s `--theme-color` and `--theme-color-alt` declarations in the active scope. Selecting **Use preset accents** restores the selected light/dark variant’s pair.

## Replacing the setter

Bind `mode` and `open` if you want the same behavior, or omit `ThemeSetter` and implement the documented root attributes yourself. The library components do not require the drawer.

The drawer is responsive: it occupies the full viewport on narrow screens and a bounded right-side panel on larger screens. Its tabs lazy-load the Aura, Gradient, and Pattern catalogues, and each preview is filtered to the active mode until **All modes** is selected.
