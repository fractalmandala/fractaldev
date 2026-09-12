---
id: docs-index
title: Fractal Themer Documentation Index
type: design
tags: [theming, svelte5, auras, dark-mode, tokens, documentation, patterns]
summary: Central navigation manifest and architecture map for the fractalthemer Svelte 5 theming system.
relates_to: [architecture-overview, theme-picker-component, theme-catalog]
updated: 2026-08-28
---

# Fractal Themer Documentation

`fractalthemer` is an ultra-light, drop-in theming and atmospheric background engine for Svelte 5 and SvelteKit. It provides full control over binary light/dark modes, 41 curated tiered color palettes, 203 GPU-accelerated gradient auras, 382 gradient presets, 257 vector-grade CSS patterns, a persistent custom accent layer, an automatic glass regime for vivid backdrops, and a responsive right off-canvas drawer with strict background isolation.

---

## 🗺 Documentation Map

### 🏛 Architecture & Core Concepts
- [**System Overview**](./architecture/01-overview.md): High-level system architecture, package structure, and design principles.
- [**State & Reactivity**](./architecture/02-state-and-reactivity.md): Detailed breakdown of the Svelte 5 `$state` and `$derived` runes in `themeState`.
- [**Tokens & CSS Contract**](./architecture/03-tokens-and-css-contract.md): 30 semantic custom properties, the two background regimes (opaque `plain` vs. auto-glass vivid), and the `[data-glass]` blur contract.

### 🧩 Components Reference
- [**ThemePicker.svelte**](./components/ThemePicker.md): Complete functional logic for the unified 1-system right off-canvas drawer (Plain, Aura, Gradient, Pattern).
- [**AuraBackground.svelte**](./components/AuraBackground.md): Multi-layer GPU blend shader rendering, CSS patterns, and background isolation mechanics.
- [**ThemeToggle.svelte**](./components/ThemeToggle.md): Standalone compact Sun/Moon mode switcher component.
- [**ThemeScript.svelte**](./components/ThemeScript.md): Head script injector preventing Flash of Unstyled Content (FOUC) on SSR.

### 📖 Integration & How-To Guides
- [**Quickstart Guide**](./guides/01-quickstart.md): Step-by-step setup in any new or existing SvelteKit project.
- [**Zero-Flicker SSR Guide**](./guides/02-anti-flicker-guide.md): How storage synchronization and inline `<script>` initialization prevent theme flashing.
- [**Custom Themes Guide**](./guides/03-custom-themes.md): Runtime token overriding, custom aura layers, and `localStorage` persistence.
- [**Responsive Drawer Layout**](./guides/04-responsive-drawer.md): Mobile drawer ergonomics, touch scrolling, and responsive viewport behavior.
- [**API & Conditional Rendering Guide**](./guides/05-api-guide.md): `{#if themeState.isDark}` templates and component recipes.

### 🎨 Palettes & Backgrounds
- [**Theme Catalog (41 Themes)**](./themes/01-theme-catalog.md): Complete index of all 21 Light and 20 Dark curated themes with swatch values and descriptions.
- [**Auras Catalog (203 Presets)**](./themes/02-auras-catalog.md): Listing of atmospheric gradient blend presets and blend modes.
- [**Gradients Catalog**](./themes/03-gradients-catalog.md): Comprehensive catalog of curated vibrant gradient presets.

---

## 📦 Package Source Code Links

| Module | Source Link | Purpose |
|---|---|---|
| Main Entrypoint | [`src/lib/index.ts`](../src/lib/index.ts) | Public API exports |
| State Manager | [`src/lib/state/theme.svelte.ts`](../src/lib/state/theme.svelte.ts) | Svelte 5 reactive singleton |
| Theme Drawer | [`src/lib/components/ThemePicker.svelte`](../src/lib/components/ThemePicker.svelte) | Off-canvas drawer component |
| Aura Backdrop | [`src/lib/components/AuraBackground.svelte`](../src/lib/components/AuraBackground.svelte) | Ambient background renderer |
| Mode Toggle | [`src/lib/components/ThemeToggle.svelte`](../src/lib/components/ThemeToggle.svelte) | Quick Sun/Moon toggle |
| Master Styles | [`src/lib/styles/index.sass`](../src/lib/styles/index.sass) | SASS root bundle |
| Tokens Sass | [`src/lib/styles/_tokens.sass`](../src/lib/styles/_tokens.sass) | CSS custom properties & fluid scales |
| Themes Sass | [`src/lib/styles/_themes.sass`](../src/lib/styles/_themes.sass) | 41 theme definitions |
| Auras Sass | [`src/lib/styles/_auras.sass`](../src/lib/styles/_auras.sass) | GPU blend layer & pattern styles |
| Glass Sass | [`src/lib/styles/_glass.sass`](../src/lib/styles/_glass.sass) | Glass regime: `--glass-blur` + auto chrome frost |
| Drawer Sass | [`src/lib/styles/_theme-picker.sass`](../src/lib/styles/_theme-picker.sass) | Drawer layout & animations |
| Theme Data | [`src/lib/data/themes.ts`](../src/lib/data/themes.ts) | Metadata and token maps |
| Pattern Data | [`src/lib/data/patterns.ts`](../src/lib/data/patterns.ts) | 257 CSS pattern definitions |
| Anti-Flicker | [`src/lib/utils/anti-flicker.ts`](../src/lib/utils/anti-flicker.ts) | Zero-dependency SSR script builder |
