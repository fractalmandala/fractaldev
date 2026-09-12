---
id: 09-visuals-and-interactions
title: Visuals & Interactions
type: design
tags: [visuals, interactions, buttons, inputs, surfaces, ink, borders, l5]
summary: Reference guide for Level 5 dress fractals, including bare surfaces, text inks, borders, typography classes, UI compositions, and interactive controls.
updated: 2026-08-30
---

Level 5 (L5) fractals provide skin, typography, surfaces, and interactive behaviors. Components own their own hover states, borders, and transitions—avoiding disconnected `.hover` or `.transition` utility clutter.


## 1. Bare Surfaces & Text Color Roles

Surfaces and text colors map directly to the 31 semantic tokens defined in `_00_tokens.sass`.

### Surface Backgrounds
```html
<div class="surface pad-md border">Card Material</div>
<aside class="panel pad-sm">Sidebar Material</aside>
<div class="raised pad-xs radius-sm">Hover / Pill Material</div>
```

| Class | CSS Property Applied | Semantic Role |
|:---|:---|:---|
| `.bg` | `background: var(--bg)` | Canvas / window backdrop |
| `.surface` | `background: var(--bg-surface)` | Card and container material |
| `.raised` | `background: var(--bg-raised)` | Elevated pills, hover highlights |
| `.panel` | `background: var(--bg-panel)` | Sidebars, drawers, headers |
| `.footer` | `background: var(--bg-footer)` | Fixed bottom footers |
| `.canvas` | `background: var(--bg-canvas)` | Graph/node canvas |
| `.terminal` | `background: var(--bg-terminal)` | Code blocks, terminal views |

### Text Colors
```html
<h1 class="text-primary text-xl">High-contrast heading</h1>
<p class="text-secondary text-sm">Standard readable body text.</p>
<span class="text-muted text-xs">Faint caption</span>
<span class="text-success text-xs">Operation succeeded</span>
```

- High-contrast text: `.text-primary` (`var(--text-primary)`)
- Body text: `.text-secondary` (`var(--text-secondary)`)
- Metadata / captions: `.text-muted` (`var(--text-muted)`)
- Inverted text on solid brand buttons: `.text-inverse` (`var(--text-inverse)`)
- Brand accent: `.text-theme` (`var(--theme-color)`)
- Status inks: `.text-success`, `.text-warning`, `.text-danger`, `.text-info`

---

## 2. Border Lines & Partition Laws

Borders follow 1px solid hairline partitioning:

- `.border`: `1px solid var(--border)` on all sides
- `.border-subtle`: `1px solid var(--border-subtle)` (faint row dividers)
- Directional dividers: `.border-top`, `.border-right`, `.border-bottom`, `.border-left`

---

## 3. Typography & Truncation

```html
<span class="text-xs weight-600 tt-u mono text-muted">TELEMETRY</span>
<p class="truncate w-160">Very long path that will truncate gracefully with ellipsis</p>
<p class="clamp-2 text-sm text-secondary">Two-line summary paragraph clamped automatically.</p>
```

| Category | Classes | Description |
|:---|:---|:---|
| Font Sizes | `.text-xs` through `.text-4xl` | Fluid Utopia type scale (12px to 61px) |
| Font Weights | `.weight-400`, `.weight-500`, `.weight-600`, `.weight-700` | Standard weight steps |
| Typeface & Casing | `.mono`, `.tt-u` (uppercase), `.tt-c` (capitalize) | Code font, uppercase, title case |
| Truncation | `.truncate` | Single line with `text-overflow: ellipsis` |
| Line Clamping | `.clamp-1`, `.clamp-2`, `.clamp-3` | Multi-line clamp using `-webkit-line-clamp` |
| Eyebrow Labels | `.eyebrow` | Uppercase, tracked small section label |

---

## 4. UI Compositions

Fractalstyler2 includes semantic container compositions that inherit shape and layout presets:

### Card (`.card`)
```html
<article class="card border">
  <h3 class="text-md weight-600 marg-0">Card Title</h3>
  <p class="text-sm text-secondary">Card content automatically receives standard padding and gap.</p>
</article>
```

### Form Field (`.field`, `.field-label`, `.field-error`)
```html
<div class="field">
  <label class="field-label" for="username">Username</label>
  <input id="username" class="input" type="text" placeholder="Enter username..." />
  <span class="field-error">Username is required</span>
</div>
```

### Toggle Switch (`.switch-track`, `.switch-thumb`)

```html
<button
  type="button"
  role="switch"
  aria-checked={isEnabled}
  class="switch-track"
  class:checked={isEnabled}
  onclick={() => isEnabled = !isEnabled}
>
  <span class="switch-thumb"></span>
</button>
```

### Avatar, Divider, and Keyboard Kbd
- `.avatar`: 32px circular image wrapper (`.radius-full`).
- `.divider`: 1px horizontal rule with proportional block margins.
- `.kbd`: Monospace keyboard shortcut badge (e.g. `<kbd class="kbd">⌘K</kbd>`).

---

## 5. Interactive Elements & Controls

### The Button Quartet (`.button`)
Buttons in Fractalstyler2 are nested under `.button` and never standalone:

```html
<!-- Primary Brand Button -->
<button class="button primary">Save Changes</button>

<!-- Ghost / Subtle Button -->
<button class="button ghost">Cancel</button>

<!-- Active / Selected State -->
<button class="button active">Active View</button>

<!-- Icon-Only Button -->
<button class="button is-icon" aria-label="Settings">
  <svg width="16" height="16">...</svg>
</button>
```

| Modifier | Visual Behavior |
|:---|:---|
| `.button.primary` | Solid brand background (`var(--theme-color)`), inverted ink, hover shade |
| `.button.ghost` | Transparent background, subtle hover highlight (`var(--bg-raised)`) |
| `.button.active` | Selected background (`var(--state-selected)`), 1px border |
| `.button.is-icon` | Zero padding, transparent background, color transition on hover |

### Form Inputs & Dropdowns
- `.input`: Standard input box with `var(--bg-input)`, border, and `--ring` focus state.
- `.select`: Dropdown selector with embedded SVG arrow, standard height, and focus ring.
- `.badge`: Compact status indicator (`.radius-sm`).
- Links: `.link` (underlined on hover), `.link-plain` (inherits ink), `.link-parent` (colors child links on card hover).

---

## 6. Responsive Visibility Helpers

Show or hide elements based on viewport size:

- `.hide-mobile`: Hidden below 768px.
- `.hide-desktop`: Hidden at or above 768px.
- `.only-mobile`: Visible exclusively on mobile viewports.

[Next - Presets](./10-presets.md)
