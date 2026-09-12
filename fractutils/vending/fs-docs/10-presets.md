---
id: 10-presets
title: Presets & Runtime Tuning
type: design
tags: [presets, shape, layout, color, motion, svelte, runtime]
summary: Reference guide for Fractalstyler2's four preset tuning axes (Layout, Shape, Color, Motion), Svelte 5 runtime state, UI pickers, and zero-flicker head scripts.
updated: 2026-08-30
---

Fractalstyler2 includes a runtime tuning engine governing four fundamental aesthetic axes: **Layout Density**, **Shape Sharpness**, **Color Saturation**, and **Motion Physics**. 

Presets allow users and applications to adjust character (such as switching from a soft rounded interface to a sharp professional IDE aesthetic) without breaking token contracts.

Presets are applied as data attributes on the `<html>` root element (`data-layout`, `data-shape`, `data-color`, `data-motion`). When an axis is set to its default value, the attribute is removed to keep the DOM clean.

```html
<!-- Example: Pro sharpness with tight layout density -->
<html data-shape="pro" data-layout="tight">
```

## 1. Layout Axis (`data-layout`)
Controls spacing multipliers across gap, padding, and layout measures:

| Value | Multiplier Description | Best Used For |
|:---|:---|:---|
| `tight` | `--gap-scale: 0.75`, `--pad-scale: 0.75` | High-density data tables, code editors, sidebars |
| `comfortable` | `--gap-scale: 1.0`, `--pad-scale: 1.0` *(Default)* | Standard web apps, documentation, dashboards |
| `sprawling` | `--gap-scale: 1.35`, `--pad-scale: 1.35` | Marketing hero pages, luxury portfolios, reading layouts |

## 2. Shape Axis (`data-shape`)
Controls border-radius channels across cards, buttons, badges, and modals:

| Value | Radius Scale | Character |
|:---|:---|:---|
| `round` | Full-radius buttons (16px–24px), soft pill shapes | Playful, mobile-first, consumer interfaces |
| `curved` | Balanced 6px–8px radius *(Default)* | Modern standard web applications |
| `pro` | Compact 2px–3px radius | Technical developer tools, telemetry interfaces |
| `sharp` | Strict 0px radius (`--radius-*: 0px`) | Architectural, terminal-inspired, minimal zero-radius UIs |

## 3. Color Axis (`data-color`)
Tunes background contrasts, surface elevations, and border prominence:

| Value | Contrast Behavior |
|:---|:---|
| `clean` | Faint borders, unified breathing surfaces with minimal card contrast |
| `general` | Balanced surface elevation and standard 1px hairline borders *(Default)* |
| `vibrant` | High-contrast cards, deep panel backgrounds, and saturated brand accents |

## 4. Motion Axis (`data-motion`)
Controls transition durations and spring easing curves:

| Value | Transition Behavior |
|:---|:---|
| `reduced` | Zero duration (`0ms`); respects accessibility preferences |
| `heavy` | Slow, deliberate 300ms easing for subtle luxury transitions |
| `active` | Crisp 150ms transitions for responsive feedback *(Default)* |
| `springy` | Bouncy spring curve (`cubic-bezier(0.34, 1.56, 0.64, 1)`) |


## Svelte 5 Runtime API

Fractalstyler2 exports reactive state and helpers:

```ts
import {
  presets,
  setPreset,
  initPresets,
  getPresetScript,
  type PresetAxis
} from 'fractalstyler2';
```

### Initializing on Mount
In your root layout (`+layout.svelte`), call `initPresets()` to load saved settings from `localStorage`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { initPresets } from 'fractalstyler2';

  onMount(() => {
    initPresets();
  });
</script>
```

### Changing a Preset
```ts
// Switch to zero-radius sharp UI
setPreset('shape', 'sharp');

// Switch to high-density tight layout
setPreset('layout', 'tight');
```

> To prevent Flash of Unstyled Content (FOUC) before client-side hydration, inject `getPresetScript()` into your HTML `<head>`:

```svelte
<!-- src/routes/+layout.svelte or src/app.html -->
<svelte:head>
  {@html `<script>${getPresetScript()}<\/script>`}
</svelte:head>
```

The script runs synchronously before first paint, reading `localStorage` and stamping the active `data-*` attributes directly onto `<html>`.

---

## UI Picker Components

Fractalstyler2 ships six ready-to-use Svelte 5 picker components — one per
preset axis, plus the two theming controls. Each takes a `class` prop and calls
`initPresets()` itself, so a lone picker works with no other setup.

```svelte
<script lang="ts">
  import {
    ShapePicker,
    LayoutPicker,
    ColorPicker,
    MotionPicker,
    ModeToggle,
    ThemePicker
  } from 'fractalstyler2';
</script>

<div class="box gap-sm pad-md surface border">
  <div class="row ycenter xbetween">
    <span class="text-sm weight-500">Corner Shape</span>
    <ShapePicker />
  </div>

  <div class="row ycenter xbetween">
    <span class="text-sm weight-500">Density</span>
    <LayoutPicker />
  </div>

  <div class="row ycenter xbetween">
    <span class="text-sm weight-500">Color Contrast</span>
    <ColorPicker />
  </div>

  <div class="row ycenter xbetween">
    <span class="text-sm weight-500">Motion</span>
    <MotionPicker />
  </div>

  <div class="row ycenter xbetween">
    <span class="text-sm weight-500">Mode</span>
    <ModeToggle />
  </div>

  <ThemePicker />
</div>
```

`ModeToggle` flips light/dark and persists it. `ThemePicker` opens a popover
over all 76 palettes with a mode filter, search, and a Reset. Both are covered
in full, along with every runtime function they call, in
[14 - API Reference](./14-api.md).

[Next - MCP](./11-mcp-server.md)