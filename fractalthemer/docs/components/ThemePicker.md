---
id: theme-picker-component
title: ThemePicker Component & Drawer Reference
type: design
tags: [components, drawer, themepicker, off-canvas, svelte5, ui]
summary: Complete functional logic and specification for the right off-canvas theme drawer (anchored below the site header, half-viewport on phones), tabs, filters, and mobile breakpoints.
relates_to: [state-and-reactivity, responsive-drawer-guide, aura-background-component]
source: src/lib/components/ThemePicker.svelte
updated: 2026-08-28
---

# ThemePicker Component & Off-Canvas Drawer

The [`ThemePicker.svelte`](../../src/lib/components/ThemePicker.svelte) component is the primary interface for user theme exploration. It renders a trigger button cluster (quick mode toggle + palette icon) that opens a hardware-accelerated off-canvas drawer sliding from the right edge, anchored below the site header (`top: var(--header-height, 0px)`) and covering half the viewport on phones.

---

## 🎯 Functional Specification

- **Role**: Primary UI drawer allowing users to switch themes, toggle plain vs. aura background modes, filter by Light/Dark/Custom palettes, cycle randomly, reset preferences, and manage the persistent custom accent.
- **Custom Accent Control Row**: A checkbox enables the persistent accent override layer; two color+hex field pairs — **Accent** and **Alt (hover)** (the latter marked `· auto` while still auto-derived) — edit `--theme-color` / `--theme-color-alt` live, and an undo button resets the layer back to the active theme's own accents. The layer persists across theme switches and refreshes (see [State & Reactivity §7](../architecture/02-state-and-reactivity.md)).
- **Placement**: Fixed to the right viewport edge below the site header (`right: 0; top: var(--header-height, 0px); height: calc(100vh - var(--header-height, 0px))`).
- **Dimensions**:
  - Desktop (`≥ 1025px`): `width: min(94vw, 480px)`; height fills from below the header to the viewport bottom.
  - Phones (`≤ 768px`): `width: 50vw` (`min-width: 200px`) — half the viewport so the page behind stays visible.
- **Mode-aware catalogs**: Gradient, pattern, and aura presets are each classified light or dark; the drawer only offers presets fitting the active mode, so the rendered backdrop always matches the theme mode. Picks are remembered per mode in `localStorage` (`ft-<family>-<light|dark>`), and a light/dark flip archives the leaving mode's picks and restores the target mode's (see [State & Reactivity](../architecture/02-state-and-reactivity.md)).
- **Header Reset**: resets the theme and background style to defaults — it does **not** clear the custom accent layer; accent colors persist until the user resets them via the accent row's undo (`resetCustomAccent()`).
- **Scrolling**: `overflow-y: scroll` with thin scrollbars, sticky headers, and sticky footers.
- **Dismissal**: Dismisses on outside click (via `.theme-drawer-backdrop`), `Escape` keyboard shortcut, or the explicit close `✕` button.

---

## ⚙️ Component Props

```typescript
interface Props {
    showModeToggle?: boolean;     // Whether to show the Sun/Moon button next to palette trigger (default: true)
    triggerButton?: Snippet;      // Optional custom Svelte 5 snippet to override the palette button
}
```

---

## 🧬 State & Svelte 5 Runes Breakdown

Inside [`src/lib/components/ThemePicker.svelte`](../../src/lib/components/ThemePicker.svelte):

### 1. Local Runes State
- `let activeTab = $state<'all' | 'light' | 'dark' | 'gradients' | 'custom'>('all');`: Tracks the active category tab.
- `let searchFilter = $state<string>('');`: Supports instant substring filtering across theme names, aura names, and gradient preset names.
- `let pickerEl = $state<HTMLDivElement | null>(null);`: Binds to the root container for outside-click boundary calculations.

### 2. Derived Filters
```typescript
const filteredThemes = $derived.by(() => {
    let list: ThemeInfo[] = [];
    if (activeTab === 'light') list = LIGHT_THEMES;
    else if (activeTab === 'dark') list = DARK_THEMES;
    else if (activeTab === 'custom') list = themeState.customThemes;
    else list = themeState.allThemes;

    if (!searchFilter.trim()) return list;

    const q = searchFilter.toLowerCase().trim();
    return list.filter(
        (t) =>
            t.name.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q) ||
            t.auraName.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q)
    );
});

// Gradients (and patterns/auras analogously) are pre-filtered to the active
// mode before the search filter applies, so the drawer only offers presets
// that fit the current light/dark mode:
const filteredGradients = $derived.by(() => {
    const list = GRADIENT_PRESETS.filter((g) => isGradientDark(g) === themeState.isDark);
    if (!searchFilter.trim()) return list;
    const q = searchFilter.toLowerCase().trim();
    return list.filter(
        (g) => g.name.toLowerCase().includes(q) || g.id.toLowerCase().includes(q)
    );
});
```

### 3. Lifecycle Hooks (`onMount`)
- Initializes `themeState.init()` to synchronize `localStorage` values.
- Registers global event listeners for `click` outside and `Escape` key.
- Tears down event listeners cleanly on component unmount.

---

## 🎨 Drawer DOM & Style Hierarchy

```
<div class="theme-controls">
  ├── <button class="theme-icon-btn"> (Quick Sun/Moon Mode Toggle)
  ├── <button class="theme-icon-btn"> (Palette Trigger)
  └── {#if themeState.isOpen}
      ├── <div class="theme-drawer-backdrop"> (Click outside dismiss overlay)
      └── <div class="theme-popover" role="dialog"> (Fixed Right Drawer, below the header)
          ├── <div class="theme-style-switcher"> (Sticky Plain vs Aura vs Gradient + Close Button)
          ├── <div class="theme-accent-bar"> (Custom Accent checkbox + Accent/Alt pickers + reset)
          ├── <div class="theme-tabs"> (Sticky All / Light / Dark / Gradients / Custom / Next Filter Tabs)
          ├── <div class="theme-search-bar"> (Sticky Live Search Input)
          ├── <div class="theme-grid-container"> (Scrollable Themes or 382 Gradients Grid)
          │    ├── {#each filteredThemes as theme}
          │    │    └── <button class="theme-card"> (Theme preview dot swatches + Aura tag)
          │    └── {#each filteredGradients as grad}
          │         └── <button class="theme-gradient-card"> (Gradient bar + Swatch dots)
          └── <div class="theme-popover-footer"> (Sticky Reset to Default & Random buttons)
```

---

## 📐 Responsive Breakpoint Rules

Styled in [`_theme-picker.sass`](../../src/lib/styles/_theme-picker.sass):

### Desktop (`≥ 1025px`)
- Drawer anchors **below the site header**: `top: var(--header-height, 0px)`, `height: calc(100vh - var(--header-height, 0px))` (with a `100dvh` override where supported).
- Drawer width is **`min(94vw, 480px)`**.
- Theme grid uses `grid-template-columns: repeat(auto-fill, minmax(130px, 1fr))` rendering 2 columns of rich preview cards.
- Mode switcher buttons and tab bars span horizontally with ample spacing.

### Phones (`≤ 768px`)
- Drawer width is **`50vw`** (`min-width: 200px`) — half the viewport, so the page behind stays visible and live preset changes can be watched.

### Tablet & narrow desktop (`≤ 1024px`)
- Internal layout only (width is unchanged):
- Theme grid switches to a **single-column** layout (`grid-template-columns: 1fr`).
- Plain/Aura toggle buttons stack into a full-width button group.
- Font sizes and padding adapt to prevent horizontal overflow or clipping.

---

## 🔗 Related Documents

- [State & Reactivity](../architecture/02-state-and-reactivity.md)
- [Responsive Drawer Guide](../guides/04-responsive-drawer.md)
- [Theme Catalog](../themes/01-theme-catalog.md)
