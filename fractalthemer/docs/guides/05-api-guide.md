---
id: api-guide
title: Fractalthemer Programmatic API & Svelte 5 Usage Guide
type: guide
tags: [architecture, runes, svelte5, api, conditional-rendering]
summary: Comprehensive guide for programmatic control with themeState, conditional Svelte 5 template rendering ({#if themeState.isDark}), reactive class bindings, and UI component recipes.
relates_to: [theme-picker-component, tokens-and-css-contract, aura-background-component]
updated: 2026-08-28
---

# 🛠 Programmatic API & Svelte 5 Usage Guide

`fractalthemer` exports a reactive Svelte 5 singleton object called **`themeState`**. Because it is built with `$state` and `$derived` runes, any change to `themeState` immediately triggers reactive UI updates across your entire application.

```typescript
import { themeState } from 'fractalthemer';
```

---

## ⚡ 1. Conditional Template Rendering in Svelte (`{#if}`)

You can use `themeState` directly inside any Svelte template for conditional logic, dynamic asset switching, and state-aware markup:

### ☀️ / 🌙 Conditional Light vs Dark Mode Content

```svelte
<script lang="ts">
  import { themeState } from 'fractalthemer';
</script>

<div class="user-greeting">
  {#if themeState.isDark}
    <p>🌙 Good evening! Dark mode is currently active.</p>
  {:else}
    <p>☀️ Good day! Light mode is currently active.</p>
  {/if}
</div>
```

---

### 🖼 Switching Dynamic Logos & Media Assets

Render different logos or imagery depending on whether the user is in light or dark mode:

```svelte
<script lang="ts">
  import { themeState } from 'fractalthemer';
</script>

<header class="brand-header">
  <img 
    src={themeState.isDark ? '/brand/logo-white.svg' : '/brand/logo-black.svg'} 
    alt="Acme Inc." 
    class="brand-logo"
  />
</header>
```

---

### 🎨 Background Style Conditional Blocks (`plain` vs `aura` vs `gradient` vs `pattern`)

```svelte
<script lang="ts">
  import { themeState } from 'fractalthemer';
</script>

<div class="status-pill">
  {#if themeState.isGradient && themeState.activeGradientPreset}
    <span>🌈 Active Gradient: <strong>{themeState.activeGradientPreset.name}</strong></span>
  {:else if themeState.isAura}
    <span>✨ Active Aura: <strong>{themeState.activeAuraPreset?.name || themeState.currentTheme.auraName}</strong></span>
  {:else}
    <span>◻ Flat Plain Background</span>
  {/if}
</div>
```

---

### 🎭 Targeted Theme Checks & Custom Classes

```svelte
<script lang="ts">
  import { themeState } from 'fractalthemer';
</script>

<!-- Conditionally add class bindings -->
<div 
  class="dashboard-card" 
  class:dracula-glow={themeState.current === 'theme-dracula-dark'}
  class:is-dark={themeState.isDark}
>
  <h3>{themeState.currentTheme.name}</h3>
  <p>{themeState.currentTheme.description}</p>
</div>
```

---

## 🎛 2. Complete Programmatic API Reference

### 🔄 Mode & Theme Switching

```typescript
import { themeState } from 'fractalthemer';

// 1. Binary Light / Dark Flip
themeState.toggleMode(); // Flips to default light/dark equivalent

// 2. Direct Theme Selection (any of the 41 themes)
themeState.setTheme('theme-dracula-dark');
themeState.setTheme('theme-nord-dark');
themeState.setTheme('theme-catppuccin-mocha');
themeState.setTheme('theme-himalaya-light');

// 3. Carousel Cycling
themeState.cycleNext();   // Advances to the next theme in the catalog
themeState.cycleRandom(); // Activates a random theme from the catalog
themeState.resetDefault(); // Resets back to 'theme-light-default'
```

---

### 🌌 203 Atmospheric Aura Gradients API

```typescript
import { themeState, AURA_PRESETS } from 'fractalthemer';

// Activate any of the 203 aura presets by ID:
themeState.setAura('mesh-frosted-jade');
themeState.setAura('glass-emerald-lens');
themeState.setAura('aurora-beams');
themeState.setAura('solstice-veil');

// Revert to theme default aura:
themeState.clearAura();

// Inspect all 203 aura presets:
console.log(themeState.allAuras.length); // 203
console.log(themeState.activeAuraPreset); // Current active AuraPreset or null
```

---

### 🌈 382 Linear Gradient Presets API

```typescript
import { themeState, GRADIENT_PRESETS } from 'fractalthemer';

// Set active linear gradient backdrop:
themeState.setGradient('omolon');
themeState.setGradient('radioactive-heat');
themeState.setGradient('the-sky-and-the-sea');

// Clear gradient and restore aura/plain:
themeState.clearGradient();

// Inspect gradient presets:
console.log(themeState.allGradients.length); // 382
console.log(themeState.activeGradientPreset); // Current active GradientPreset or null
```

---

### 📐 Background Mode Toggle (`plain` | `aura` | `gradient` | `pattern`)

```typescript
import { themeState } from 'fractalthemer';

// Explicitly set mode:
themeState.setBgStyle('plain');    // Flat background surface
themeState.setBgStyle('aura');     // Multi-layer GPU blend shader
themeState.setBgStyle('gradient'); // Full viewport linear gradient
themeState.setBgStyle('pattern');  // Full viewport CSS pattern

// Cycle through modes:
themeState.toggleBgStyle(); // 'plain' -> 'aura' -> 'gradient' -> 'pattern' -> 'plain'
```

---

### 🚪 Drawer Programmatic Control

```typescript
import { themeState } from 'fractalthemer';

themeState.openPicker();   // Opens 100vh right drawer
themeState.closePicker();  // Closes drawer
themeState.togglePicker(); // Toggles open/closed state

console.log(themeState.isOpen); // boolean
```

---

### 🎯 Persistent Custom Accent API

The accent is an **override layer** above any theme — it survives theme switches, refreshes, and sessions, and is cleared only by an explicit reset:

```typescript
import { themeState } from 'fractalthemer';

// Set the accent: applies + persists to localStorage, auto-derives the alt shade
themeState.setCustomAccentColor('#7C3AED');

// Take control of the hover accent (stops auto-derivation until reset)
themeState.setCustomAccentAltColor('#4C1D95');

// Manual reset — the only path back to the theme's own accents
themeState.resetCustomAccent();

// Reactive state
console.log(themeState.useCustomAccent);     // boolean
console.log(themeState.customAccentColor);   // override hex
console.log(themeState.customAccentAltColor);
```

The overrides map to `--theme-color` (+ `--theme-color`) and `--theme-color-alt` (+ `--theme-color-alt`). Persistence keys and behavior notes: [§4 Persistence Model](#-4-persistence-model).

---

## 🧩 3. Custom Component Recipes

### Recipe A: Minimalist Custom Theme Switcher Button

A standalone icon button you can embed anywhere in your navigation bar:

```svelte
<script lang="ts">
  import { themeState } from 'fractalthemer';
</script>

<button
  type="button"
  class="mode-toggle-btn"
  aria-label={themeState.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
  onclick={() => themeState.toggleMode()}
>
  {#if themeState.isDark}
    <span class="icon">☀️</span>
    <span class="label">Light</span>
  {:else}
    <span class="icon">🌙</span>
    <span class="label">Dark</span>
  {/if}
</button>

<style>
  .mode-toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: var(--radius-6);
    border: 1px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .mode-toggle-btn:hover {
    background: var(--bg-raised);
    border-color: var(--theme-color);
  }
</style>
```

---

### Recipe B: Custom Theme Dropdown Select

A standard HTML `<select>` powered by `themeState.allThemes`:

```svelte
<script lang="ts">
  import { themeState } from 'fractalthemer';
</script>

<label class="theme-select-wrapper">
  <span>Theme</span>
  <select
    value={themeState.current}
    onchange={(e) => themeState.setTheme(e.currentTarget.value)}
  >
    <optgroup label="Light Themes">
      {#each themeState.allThemes.filter(t => t.mode === 'light') as theme (theme.id)}
        <option value={theme.id}>{theme.name}</option>
      {/each}
    </optgroup>
    <optgroup label="Dark Themes">
      {#each themeState.allThemes.filter(t => t.mode === 'dark') as theme (theme.id)}
        <option value={theme.id}>{theme.name}</option>
      {/each}
    </optgroup>
  </select>
</label>

<style>
  .theme-select-wrapper {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  select {
    padding: 6px 10px;
    border-radius: var(--radius-4);
    border: 1px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: inherit;
    cursor: pointer;
  }
</style>
```

---

### Recipe C: Active Theme Pill Badge

Display active theme and aura details with live color swatches:

```svelte
<script lang="ts">
  import { themeState } from 'fractalthemer';
</script>

<div class="theme-badge">
  <span 
    class="swatch" 
    style:background-color={themeState.currentTheme.accentColor}
  ></span>
  <span class="theme-name">{themeState.currentTheme.name}</span>
  <span class="mode-tag">{themeState.isDark ? 'Dark' : 'Light'}</span>
</div>

<style>
  .theme-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    border-radius: var(--radius-full);
    border: 1px solid var(--border);
    background: var(--bg-panel);
    font-size: var(--text-xs);
    color: var(--text-primary);
  }

  .swatch {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
  }

  .mode-tag {
    color: var(--text-muted);
    font-size: 10px;
    text-transform: uppercase;
  }
</style>
```

---

### Recipe D: Build Your Own Mode & Picker Toggles

Skip `<ThemeToggle />` and the drawer's built-in icons entirely — every toggle is just `themeState` plus two reactive reads. **Verified API:** `toggleMode()` flips light/dark, `togglePicker()` opens/closes the drawer, and the states you branch on are `themeState.isDark` and `themeState.isOpen`.

```svelte
<script lang="ts">
  import { themeState } from 'fractalthemer';
</script>

<!-- 1. Mode toggle — {#if themeState.isDark} picks the icon -->
<button
  type="button"
  class="my-toggle"
  aria-label={themeState.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  onclick={() => themeState.toggleMode()}
>
  {#if themeState.isDark}
    ☀️ <!-- dark is active; clicking goes light -->
  {:else}
    🌙
  {/if}
</button>

<!-- 2. Picker toggle — {#if themeState.isOpen} swaps the open/close affordance -->
<button
  type="button"
  class="my-toggle"
  aria-haspopup="dialog"
  aria-expanded={themeState.isOpen}
  onclick={() => themeState.togglePicker()}
>
  {#if themeState.isOpen}
    ✕
  {:else}
    🎨
  {/if}
</button>
```

Notes:

- **Any markup works** — text, emoji, your own icon set, `currentColor` SVGs. The examples are deliberately unstyled so you bring your own CSS.
- **Open-only triggers:** use `themeState.openPicker()` for a palette icon that should only ever open; the drawer's backdrop, `Escape` key, and `✕` button handle closing.
- **No event wiring beyond `onclick`.** `isDark` and `isOpen` are Svelte 5 `$state`/`$derived`, so both buttons re-render instantly when anything (including the drawer's own controls) changes them.
- **The drawer UI stays fractalthemer's** — only the trigger is yours. Drawer ergonomics and breakpoints: [Responsive Drawer Guide](./04-responsive-drawer.md).

---

## 💾 4. Persistence Model

Everything the picker touches survives refreshes, sessions, and theme switches via `localStorage`. The custom accent is an **override layer**, not a theme property — it rides on top of whatever theme is active until explicitly reset.

| Key | Written by | Purpose |
|---|---|---|
| `theme` | `setTheme()` | Active theme id |
| `bgStyle` | `setBgStyle()` | `plain` \| `aura` \| `gradient` \| `pattern` |
| `aura` / `gradient` / `pattern` | setters | Active preset id per style |
| `customThemes` / `customTokens` | `saveCustomTheme()` | User-authored themes |
| `useCustomAccent` | accent setters | Master switch for the accent layer |
| `customAccentColor` | `setCustomAccentColor()` | Overrides `--theme-color` (+ `--theme-color`) |
| `customAccentAltColor` | `setCustomAccentAltColor()` | Overrides `--theme-color-alt` (+ `--theme-color-alt`) |

Behavior notes:

- **Accent survives theme switches.** `apply()` sets the theme's own tokens first, then re-applies the accent layer last — the accent always wins. It also ships in the anti-flicker inline script, so it is applied before first paint (no accent flash on hard refresh).
- **Alt starts auto.** `--theme-color-alt` is derived (−12% lightness) from the accent until the user sets it directly; afterwards the two are independent until reset.
- **Reset is manual only.** `themeState.resetCustomAccent()` clears the accent layer; `resetDefault()` clears everything. Switching themes never touches it.

```ts
themeState.setCustomAccentColor('#7C3AED');      // sets + persists, derives alt
themeState.setCustomAccentAltColor('#4C1D95');   // takes control of alt
themeState.resetCustomAccent();                  // back to the theme's own accents
```

## 🔗 Related Documentation

- [Quickstart Guide](./01-quickstart.md)
- [Zero-Flicker SSR Guide](./02-anti-flicker-guide.md)
- [ThemePicker Component Spec](../components/ThemePicker.md)
- [AuraBackground Component Spec](../components/AuraBackground.md)
- [Theme Catalog (41 Themes)](../themes/01-theme-catalog.md)
- [Gradient Presets Catalog (382 Gradients)](../themes/03-gradients-catalog.md)
