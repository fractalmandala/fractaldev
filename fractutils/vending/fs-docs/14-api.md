---
id: 14-api
title: API Reference
type: design
tags: [api, runtime, presets, themes, mode, components, pickers, exports]
summary: Complete reference for everything fractalstyler2 exports — entry points, the preset and theming runtime, the reactive mirror, shell components, and the six pickers.
updated: 2026-08-31
---

Everything the package exports, in one place. The stylesheet is the product;
this is the runtime that drives it.

Two rules hold throughout:

- **Nothing here is required.** A CSS consumer who never imports a function
  gets the full system. These helpers exist so you don't hand-roll
  `localStorage` and an anti-flicker script.
- **The core is framework-free.** `fractalstyler2/presets` is plain TypeScript.
  The Svelte entry wraps it with a reactive mirror and nothing else.

---

## 1 · Entry points

| Import | What you get | Needs |
|:---|:---|:---|
| `fractalstyler2/css` | Compiled stylesheet, 28.8 KB gzipped | nothing |
| `fractalstyler2/css/min` | Minified build, 26.8 KB gzipped | nothing |
| `fractalstyler2/styles` | SASS entry — retune the generators | a SASS compiler |
| `fractalstyler2/styles/*` | One partial, e.g. `styles/_02_dimensions.sass` | a SASS compiler |
| `fractalstyler2/tokens` | `_00_tokens.sass` alone | a SASS compiler |
| `fractalstyler2/themes` | `_00_themes.sass` alone | a SASS compiler |
| `fractalstyler2/styles/presets` | `_00_presets.sass` alone | a SASS compiler |
| `fractalstyler2/presets` | The runtime, framework-free | nothing |
| `fractalstyler2` | Runtime + token metadata + Svelte components | Svelte 5 |
| `fractalstyler2/mcp` | The MCP server — see [11](11-mcp-server.md) | an MCP host |

The root entry is **Svelte-only** by design: it exports `.svelte` files, so it
resolves through the `svelte` export condition. A non-Svelte project imports
`fractalstyler2/presets` for the runtime and `fractalstyler2/css` for the
stylesheet, and never touches the root.

```js
// CSS project
import 'fractalstyler2/css';
import { initPresets, toggleMode } from 'fractalstyler2/presets';

// Svelte project
import 'fractalstyler2/css';
import { presets, initPresets, ModeToggle } from 'fractalstyler2';
```

---

## 2 · The preset runtime

Four axes, each a `data-` attribute on `<html>`. See [10](10-presets.md) for
what each value does visually.

| Axis | Values (canonical order) | Default |
|:---|:---|:---|
| `layout` | `tight` · `comfortable` · `sprawling` | `comfortable` |
| `shape` | `round` · `curved` · `pro` · `sharp` | `curved` |
| `color` | `clean` · `general` · `vibrant` | `general` |
| `motion` | `reduced` · `heavy` · `active` · `springy` | `active` |

### `initPresets(): void`

Restores the saved theme, mode, and all four axes from `localStorage` and
applies them. Call once, on mount. Safe on the server — it no-ops when there is
no `document`. Safe to call more than once; the bundled components each call it
so a lone `<ModeToggle />` works with no setup.

### `setPreset(axis, value): void`

Sets one axis, persists it, notifies listeners. Values outside the axis are
ignored rather than throwing, so a bad value is a no-op, not a crash.

### `getPreset(axis): string`

The current value of one axis.

### `cyclePreset(axis): string`

Advances an axis to its next value, wrapping. Returns the new value — what a
single toggle button wants.

### `onPresetChange(fn): () => void`

`fn(axis, value)` on every change, however it was made. Returns an unsubscribe.
This is the hook for a hand-rolled picker outside Svelte.

### `getPresetScript(): string`

Returns the inline head script that stamps saved presets **before first paint**,
so there is no flash of the default theme. Axes and defaults are derived from
the same constants the runtime uses — there is no second hardcoded copy to
drift.

```svelte
<svelte:head>
	{@html `<script>${getPresetScript()}<\/script>`}
</svelte:head>
```

> The `<\/script>` escape is required. Writing `</script>` inside a template
> literal terminates the surrounding script block and breaks the page.

### Constants

`presetAxes` — the axis→values map. `presetDefaults` — the default per axis.
`presetState` — the live values (read it; mutate through `setPreset`).
`STORAGE_KEY` / `THEME_KEY` / `MODE_KEY` — `fs2.presets`, `fs2.theme`, `fs2.mode`.

---

## 3 · Mode

Light/dark, independent of the palettes. Persists.

### `setMode(mode): void`

`'light'`, `'dark'`, or `null`. Sets `data-mode` on `<html>` and writes
`localStorage`. Passing `null` clears the choice and falls back to the OS
preference.

### `getMode(): Mode`

The active mode. When nothing is stored it reports `prefers-color-scheme`
rather than a default, so it tells the truth about what is on screen.

### `isDark(): boolean`

`getMode() === 'dark'`.

### `toggleMode(): Mode`

Flips and persists. Returns the new mode.

### `onModeChange(fn): () => void`

`fn(mode)` on every mode change, whoever caused it — a toggle, `setTheme()`,
or `initPresets()` restoring a saved choice. Returns an unsubscribe.

### `type Mode = 'light' | 'dark'`

---

## 4 · Themes

76 palettes, each a class on `<html>`. Cascade order is
`:root` → `[data-mode]` → `.theme-*` → presets, so **a palette outranks the
mode**.

### `setTheme(id): void`

Applies a palette by id, or clears it with `null`. Persists. A palette carries
its own mode, so this routes through `setMode` — the mode persists and notifies
like any other change. An unknown id is ignored.

### `getTheme(): string | null`

The active palette id, or `null`.

### `twinTheme(id): string | null`

The same palette in the opposite mode — `theme-sun-light` ↔ `theme-sun-dark`.
Returns `null` when there is no counterpart.

### `toggleThemeMode(): string | null`

Swaps to the active palette's counterpart. With no palette applied it is just
`toggleMode()`. Returns the palette active afterwards, or `null` when none is.

Every palette is paired, so this always has somewhere to go. Pairing is
declared in `_00_themes.sass` rather than inferred from the name, which is what
lets `theme-catppuccin-mocha` pair with `theme-catppuccin-latte`.

The 35 generated counterparts are derived, not hand-picked — `scripts/generate-pairs.mjs`
walks the lightness ramp measured from the three families that were paired by
hand (`sun`, `monochrono`, `dracula`) and keeps each palette's own hue and
chroma. Accents keep their hue rather than flipping it; `sun` and `monochrono`
flip theirs by hand, but two of three families disagreeing is a signature, not
a rule. Every generated palette clears 7:1 on primary text, 4.5:1 on secondary,
and 3:1 on the accent.

A derived counterpart is faithful to *its source*, not to an upstream project.
`theme-gruvbox-light` comes out near-neutral because `theme-gruvbox-dark`'s
ground is neutral grey — real Gruvbox Light is cream. Same for
`theme-catppuccin-latte` and `theme-onelight-pro`: they are this system's
counterpart to the dark palette it already had, not a port of the upstream
light theme. Hand-edit the block if you want the authentic one — `pnpm pair` only adds
counterparts that are missing and never rewrites an existing block, so edits
there are safe.

### Constants

`themes` — `readonly ThemeMeta[]`, i.e. `{ id, mode, twin? }`. `themeIds` — the ids alone.

The full definition of both languages — cascade order, the pairing contract, and
the protocol for verifying them — is [Spec — Theme and Mode](specs/specs-theme-mode.md).

---

## 5 · The reactive mirror (Svelte only)

`presets` is a `$state` object mirroring the whole runtime — the four axes plus
`mode` and `theme`. Read it straight in a template:

```svelte
<script>
	import { presets, initPresets, toggleMode } from 'fractalstyler2';
	import { onMount } from 'svelte';
	onMount(() => initPresets());
</script>

<button class="button ghost" onclick={() => toggleMode()}>
	{#if presets.mode === 'dark'}☀{:else}☾{/if}
</button>

<p>Density is {presets.layout}, palette is {presets.theme ?? 'none'}.</p>
```

It stays correct however the change was made — a picker, `setTheme()`, the OS
preference at load, or another component entirely. That is the point of it:
reading `document.documentElement.getAttribute('data-mode')` into local state
goes stale the moment anything else changes the mode.

Outside Svelte, `onPresetChange` and `onModeChange` give you the same guarantee.

---

## 6 · Components

All are optional. Every one is a thin wrapper over the class contract — a
consumer copying [canonical-markups.md](../src/lib/styles/canonical-markups.md)
by hand gets identical output. None ships a `<style>` block.

### Shells

| Component | Renders |
|:---|:---|
| `AppShell` | `.app-shell` — header / main / footer, sidebars optional |
| `PageShell` | `.page-shell` — a single content column |
| `PageSplit` | `.page-split` — main plus a sidebar |
| `Hero` | `.hero` |
| `Accordion` / `AccordionItem` | the disclosure pair |

### Pickers

Every picker takes `class` and calls `initPresets()` itself.

| Component | Control | Extra props |
|:---|:---|:---|
| `LayoutPicker` | 3 buttons | — |
| `ShapePicker` | 4 buttons | — |
| `ColorPicker` | 3 buttons | — |
| `MotionPicker` | 4 buttons | — |
| `ModeToggle` | 1 button | `palettes` |
| `ThemePicker` | popover panel | `filter`, `showModeToggle`, `trigger` |

```svelte
<script>
	import { ModeToggle, ThemePicker, ShapePicker } from 'fractalstyler2';
</script>

<ModeToggle />
<ThemePicker filter="dark" />
<ShapePicker class="gap-4" />
```

**`ModeToggle`** — sun/moon button, `aria-pressed` tracking the mode. Calls
`toggleMode()` by default. Set `palettes` to call `toggleThemeMode()` instead,
swapping to the active palette's twin. Every palette has one.

**`ThemePicker`** — a popover over all 76 palettes: mode filter, search, a
scrolling list, and a Reset that calls `setTheme(null)`. Closes on Escape and
on click-outside.

Each row wears its own theme class, so the swatches inside it are that palette
rendering itself rather than a hardcoded preview — change a palette in
`_00_themes.sass` and its row updates with it.

| Prop | Default | Effect |
|:---|:---|:---|
| `filter` | `'all'` | Which mode the list opens on — `'all'`, `'light'`, `'dark'`. The user can still switch it. |
| `showModeToggle` | `true` | Renders a `ModeToggle` inside the panel. |
| `trigger` | — | A snippet replacing the default palette-glyph button. |

```svelte
<ThemePicker filter="dark" showModeToggle={false}>
	{#snippet trigger()}
		<span class="text-xs">Theme</span>
	{/snippet}
</ThemePicker>
```

Like every component here it ships no stylesheet. The panel is `.popover`, the
list is `.box.scroll-y.h-256`, and each row is a `.row` whose `.bg`/`.border`
resolve from the theme class on that row.

---

## 7 · Building your own controls

The bundled pickers are conveniences. Everything they do is public, so a custom
control is not a downgrade — it is the same API with your own markup.

### In Svelte

Read `presets`, write through the setters. Nothing else is needed: the mirror
stays correct no matter who changes the value.

```svelte
<script lang="ts">
	import { presets, presetAxes, setPreset, cyclePreset, initPresets } from 'fractalstyler2';
	import { onMount } from 'svelte';
	onMount(() => initPresets());
</script>

<!-- a segmented control over any axis -->
<div class="row gap-2" role="group" aria-label="Density">
	{#each presetAxes.layout as value}
		<button
			type="button"
			class="button ghost text-xs"
			class:active={presets.layout === value}
			aria-pressed={presets.layout === value}
			onclick={() => setPreset('layout', value)}
		>
			{value}
		</button>
	{/each}
</div>
```

A one-button cycler, if you would rather not show every value:

```svelte
<button class="button ghost" onclick={() => cyclePreset('shape')}>
	Corners: {presets.shape}
</button>
```

### Without a framework

`fractalstyler2/presets` is plain TypeScript. Subscribe instead of reading a
mirror; the callbacks fire however the change was made.

```js
import { initPresets, setPreset, onPresetChange, onModeChange, toggleMode }
	from 'fractalstyler2/presets';

initPresets();

document.querySelector('#dark').addEventListener('click', () => toggleMode());
onModeChange((mode) => {
	document.querySelector('#dark').textContent = mode === 'dark' ? '☀' : '☾';
});

onPresetChange((axis, value) => {
	if (axis !== 'layout') return;
	for (const el of document.querySelectorAll('[data-layout-value]')) {
		el.classList.toggle('active', el.dataset.layoutValue === value);
	}
});
```

Both subscriptions return an unsubscribe function. Call it when your control
goes away.

### Rules that keep a custom control correct

1. **Call `initPresets()` once**, on mount. It restores everything from storage.
   Calling it again is harmless.
2. **Never read `document.documentElement` into local state.** It is right at
   the moment you read it and wrong the moment anything else changes. Use
   `presets`, or `onModeChange` / `onPresetChange`.
3. **Never write the attribute or class yourself.** `setPreset`, `setMode`, and
   `setTheme` persist and notify; a raw `setAttribute` does neither, so the rest
   of the page goes out of step.
4. **Add `getPresetScript()` to `<head>`** or accept a flash of the default on
   every load.
5. **Compose the markup from the registry.** The bundled pickers ship no
   stylesheet, and yours does not need one either — `.button.ghost`,
   `.row`, `.popover`, and `.scroll-y` cover the shapes a control takes.

---

## 8 · Token metadata

Constants describing the scales, for tooling that needs to enumerate them.
They **describe** the stylesheet; they do not generate it.

| Export | Contents |
|:---|:---|
| `breakpoints` | `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 |
| `spaceScale` | `3xs` … `3xl` |
| `typographyScale` | `xs` … `4xl` |
| `radiusSteps` | `0`, `2`, `3`, `4`, `6`, `8`, `12`, `16`, `24`, `full` |
| `surfaceRoles` | `bg`, `surface`, `raised`, `panel`, `footer`, `popover`, `dialog`, `terminal`, `input`, `canvas` |
| `inkRoles` | `primary`, `secondary`, `muted`, `inverse`, `theme-color`, `theme-color-alt` |
| `tokens` | all of the above, plus `version` |
| `version` | the package version |

Types: `Breakpoint`, `SpaceStep`, `TypographyStep`, `RadiusStep`,
`SurfaceRole`, `InkRole`, `Mode`, `PresetAxis`, `ThemeMeta`.

The breakpoints are metadata for *your* media queries. The system itself is
fluid and does not use them — see [05](05-dimensions.md).

---

## 9 · What is deliberately absent

- **No authoring mixins, no SASS functions.** Compose in markup. The SASS
  distribution exists so you can retune the generators, not to author against.
- **No JS styling API.** Nothing sets inline styles or injects rules.
- **No component library.** The shells are conveniences over documented markup.

See [12](12-agent-plugin.md) for the rules an agent is handed, and
[13](13-cookbook.md) for patterns built from the registry alone.
