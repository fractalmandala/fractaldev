# fractalthemer

> An ultra-light, zero-runtime-overhead theming and ambient background system for SvelteKit and modern web applications. Features 41 curated light & dark themes, 203 atmospheric GPU auras, 382 gradient presets, 257 CSS background patterns, a persistent custom accent layer, an automatic glass regime for vivid backdrops, and a responsive drawer with strict background isolation.

[![npm version](https://img.shields.io/npm/v/fractalthemer.svg)](https://www.npmjs.com/package/fractalthemer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-orange.svg)](https://svelte.dev)

---

## ✨ Features

### 🏛 41 Curated Light & Dark Themes
- **21 Light Themes**: Clean editorial palettes, soft off-whites, terracotta ceramics, and vibrant accents (*Emerald Light, Paper Light, Botanical, Latte, Clay Studio, Nord Light, Matcha, Sunset Amber*, etc.).
- **20 Dark Themes**: Deep obsidian canvases, velvety darks, and neon synthwaves (*Dracula, Catppuccin Mocha, Nord Dark, Gruvbox, OneDark Pro, Synthwave, Obsidian Crimson, Amethyst Void*, etc.).
- **30 Semantic CSS Tokens**: Standardized `:root` CSS variables mapped across `--bg`, `--bg-surface`, `--bg-panel`, `--text-primary`, `--theme-color`, `--border`, etc.

### 🌌 203 Atmospheric GPU Aura Presets
- Multi-layer GPU-accelerated atmospheric gradient blends calibrated to match every theme.
- Categorized across *aura, mesh, glass, grain, flux, nebula, lattice, prism*.

### 📐 257 CSS Background Patterns
- Curated vector-grade CSS background patterns across 4 categories:
  - **📐 Geometric (99)**: Dots, grids, isometric cubes, diagonals, checks, zigzags, honeycombs, circuits, cross-hashes.
  - **✨ Effects (66)**: Spotlights, light beams, cyber scanlines, bokeh, particles, starfields.
  - **🌈 Gradients (48)**: Multi-stop mesh gradients, chromatic conic sweeps, sunsets, twilight velvet blends.
  - **🎨 Decorative (44)**: Luxury radial glows, badge frames, vignette halos, organic curvature.

### 🛡️ Strict Background Interchangeability & Isolation
- **1 Unified Navigation System**: Seamlessly switch between `Plain`, `Aura`, `Gradient`, and `Pattern` in the drawer.
- **Full Isolation**: Only the selected background family is rendered, while the last preset in every family is retained for instant switching without leftover blurs, overlays, or conflicting CSS properties.
- **Pointer-Events Isolation**: Backdrops operate strictly at `z-index: -1` with `pointer-events: none !important`.

### 🧊 Auto Glass Regime
- **Plain vs. Vivid**: With `plain`, the `-bg-*` tokens are opaque and carry the design (sidebar vs. main contrast). The moment an aura, gradient, or pattern owns the canvas, every `-bg-*` token is re-emitted translucent (`color-mix` toward transparent) so surfaces stop competing with the backdrop.
- **Auto-Frosting**: App chrome (`header`, `nav`, `aside`, `footer`, `dialog`, popover, ARIA landmarks) gets `backdrop-filter` blur automatically in vivid modes — zero markup changes. `data-glass` opts in any custom surface; `--glass-blur` tunes depth; `:where()` keeps specificity at zero.

### 🎯 Persistent Custom Accent Layer
- **Overrides Any Theme**: `--theme-color` and `--theme-color-alt` can be set by the user (picker or `themeState` API) and ride on top of every theme — built-in or custom.
- **Survives Everything**: Persisted to `localStorage` and applied pre-paint by the anti-flicker script, so it survives refreshes, sessions, and theme switches. Only an explicit reset clears it.
- **Smart Alt**: `--theme-color-alt` auto-derives (−12% lightness) until the user takes control of it.

### ⚡ Pure Svelte 5 Runes & Zero-Flicker SSR
- Reactive Svelte 5 state management via `themeState` (`$state`, `$derived`).
- Anti-flicker SSR script preventing Flash of Unstyled Content (FOUC) across page reloads and browser hydration.

---

## 📦 Installation & Setup

### 1. Install Package

```bash
pnpm add fractalthemer
# or
npm install fractalthemer
```

### 2. Zero-Flicker SSR Script

Place `<ThemeScript />` in your root layout — it injects a tiny synchronous script into `<head>` that reads `localStorage` (theme, background style, custom theme tokens, and the custom accent) and applies everything before first paint:

```svelte
<script lang="ts">
  import { ThemeScript } from 'fractalthemer';
</script>

<ThemeScript />
```

Prefer wiring `src/app.html` manually? Paste the output of [`getAntiFlickerScript()`](./docs/guides/02-anti-flicker-guide.md) into `<head>` — the guide walks through all three methods.

### 3. Add to Root Layout (`src/routes/+layout.svelte`)

```svelte
<script lang="ts">
  import 'fractalthemer/styles.css';
  import { ThemeScript, AuraBackground, ThemePicker } from 'fractalthemer';

  let { children } = $props();
</script>

<!-- Zero-flicker initialization (before first paint) -->
<ThemeScript />

<!-- Ambient background layer (handles Plain, Aura, Gradient, and Pattern) -->
<AuraBackground />

<div class="appshell">
  <header>
    <!-- Drawer launcher & mode switcher -->
    <ThemePicker />
  </header>

  <main>
    {@render children()}
  </main>
</div>
```

---

## 🕹️ Runtime State & API (`themeState`)

Import `themeState` anywhere in your application for reactive runes-based theme control:

```typescript
import { themeState } from 'fractalthemer';

// Switch theme
themeState.setTheme('theme-dracula-dark');

// Toggle light / dark mode
themeState.toggleMode();

// Switch background style ('plain' | 'aura' | 'gradient' | 'pattern').
// In vivid modes (aura/gradient/pattern) the -bg-* tokens automatically turn
// translucent glass and app chrome frosts — see docs/architecture/03.
themeState.setBgStyle('aura');
themeState.setAura('aura-midnight-emerald');
themeState.setGradient('grad-sunset-violet');
themeState.setPattern('pat-cyber-grid');

// Persistent custom accent (override layer above any theme — survives
// refreshes and theme switches; cleared only by an explicit reset)
themeState.setCustomAccentColor('#7C3AED');    // applies + persists, derives alt
themeState.setCustomAccentAltColor('#4C1D95'); // take control of the hover accent
themeState.resetCustomAccent();                // back to the theme's own accents

// Drawer control (drive the drawer from your own buttons too)
themeState.togglePicker(); // or openPicker() / closePicker()

// Cycle themes
themeState.cycleNext();
themeState.cycleRandom();
```

---

## 💅 Styling Options

### Option A: Precompiled CSS (Zero-Config)
```typescript
import 'fractalthemer/styles.css';
```

### Option B: Raw Indented SASS Imports
```sass
// Master bundle (tokens, themes, auras, glass, drawer)
@use 'fractalthemer/styles'

// Or granular sub-modules:
@use 'fractalthemer/tokens'   // 30 semantic color tokens (_tokens.sass)
@use 'fractalthemer/themes'   // 41 curated theme classes (_themes.sass)
@use 'fractalthemer/auras'    // GPU gradient aura & pattern shaders (_auras.sass)
@use 'fractalthemer/glass'    // Auto glass regime: --glass-blur + chrome frost (_glass.sass)
@use 'fractalthemer/picker'   // Responsive right drawer (_theme-picker.sass)
```

---

## 📄 Documentation

Comprehensive architecture guides, component APIs, and token specifications:

### 📖 Guides
- [Quickstart Guide](./docs/guides/01-quickstart.md): Step-by-step setup in any SvelteKit project.
- [Zero-Flicker SSR Guide](./docs/guides/02-anti-flicker-guide.md): Storage synchronization and instant initialization.
- [Custom Themes & Storage Guide](./docs/guides/03-custom-themes.md): Saving, deleting, and rehydrating custom themes — plus the persistent custom accent layer.
- [Responsive Drawer Guide](./docs/guides/04-responsive-drawer.md): Drawer ergonomics, breakpoints, and driving it from your own buttons.
- [API & Conditional Rendering Guide](./docs/guides/05-api-guide.md): `{#if themeState.isDark}` templates, component recipes, and building your own mode/picker toggles.
- [Tokens & CSS Contract](./docs/architecture/03-tokens-and-css-contract.md): 30 semantic tokens and the auto glass regime.

### 🧩 Components
- [`<ThemePicker />`](./docs/components/ThemePicker.md): Responsive right sliding drawer with search, mode switcher, and instant preview.
- [`<AuraBackground />`](./docs/components/AuraBackground.md): Ambient background layer for Plain, Aura, Gradient, and Pattern modes.
- [`<ThemeToggle />`](./docs/components/ThemeToggle.md): Compact Sun/Moon toggle button.
- [`<ThemeScript />`](./docs/components/ThemeScript.md): Head script injector for zero-flicker SSR hydration.

### 🎨 Catalogs
- [41 Curated Themes Catalog](./docs/themes/01-theme-catalog.md): Complete index of all 21 Light and 20 Dark curated themes.
- [Atmospheric Auras Catalog](./docs/themes/02-auras-catalog.md): 203 atmospheric gradient blend presets.
- [Gradient Presets Catalog](./docs/themes/03-gradients-catalog.md): Curated gradient backgrounds.

---

## 📜 License

MIT © [Fractal Mandala](https://github.com/fractalmandala)
