---
id: quickstart-guide
title: SvelteKit Quickstart & Integration Guide
type: design
tags: [quickstart, installation, sveltekit, layout, setup]
summary: Step-by-step procedure to install, configure, and mount fractalthemer in any new or existing SvelteKit project.
relates_to: [docs-index, anti-flicker-guide, responsive-drawer-guide]
updated: 2026-08-28
---

# SvelteKit Quickstart & Integration Guide

Follow this guide to install and configure `fractalthemer` in your SvelteKit or Svelte 5 application.

---

## 📥 Step 1: Install the Package

Install `fractalthemer` using your preferred package manager:

```bash
pnpm add fractalthemer
# or
npm install fractalthemer
# or
yarn add fractalthemer
```

---

## ⚡ Step 2: Zero-Flicker Initialization

The simplest path is `<ThemeScript />` in your root layout — it injects a tiny synchronous script into `<head>` that applies the saved theme, background style, custom theme tokens, and custom accent before first paint:

```svelte
<ThemeScript />
```

Prefer configuring `src/app.html` manually? Copy the generated script from the [Zero-Flicker SSR Guide](./02-anti-flicker-guide.md) — it covers all three methods (manual inline script, `getAntiFlickerScript()`, and the component).

---

## 🎨 Step 3: Mount Components in `src/routes/+layout.svelte`

Import the stylesheet and place `<ThemeScript />`, `<AuraBackground />`, and `<ThemePicker />` in your root layout:

```svelte
<script lang="ts">
  import 'fractalthemer/styles.css';
  import { ThemeScript, AuraBackground, ThemePicker } from 'fractalthemer';

  let { children } = $props();
</script>

<!-- Zero-flicker initialization (before first paint) -->
<ThemeScript />

<!-- Ambient gradient backdrop (renders when aura mode is enabled) -->
<AuraBackground />

<!-- App Shell -->
<div class="app">
  <header class="app-header">
    <h1>My Application</h1>
    
    <!-- Theme trigger buttons & 100vh off-canvas drawer -->
    <ThemePicker />
  </header>

  <main class="app-main">
    {@render children()}
  </main>
</div>
```

---

## 🖋 Step 4: Consume Semantic Tokens in Your CSS

Style your components using the standard CSS custom properties:

```css
.card {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-8);
  padding: var(--space-m);
}

.button-primary {
  background-color: var(--theme-color);
  color: var(--text-inverse);
}

.button-primary:hover {
  background-color: var(--theme-color-alt);
}
```

> **Note:** Read surfaces through the tokens and let the background regime decide opacity. Under a vivid backdrop (aura / gradient / pattern), these same token backgrounds automatically turn translucent glass and app chrome frosts — see [Tokens & CSS Contract §6](../architecture/03-tokens-and-css-contract.md).

---

## 🎨 Step 5: (Optional) Using Raw Indented SASS

If your project is built with indented SASS (`.sass`) or SCSS, you can `@use` the stylesheets directly from `fractalthemer`:

```sass
// In your master index.sass:
@use 'fractalthemer/styles'

// Or granular partials:
@use 'fractalthemer/tokens'  // 30 semantic CSS custom properties
@use 'fractalthemer/themes'  // 41 theme classes (.theme-*)
@use 'fractalthemer/auras'   // Multi-layer GPU blend shaders & gradient canvas
@use 'fractalthemer/glass'   // Auto glass regime: --glass-blur + chrome frost
@use 'fractalthemer/picker'  // 100vh drawer and controls
```

---

## 🔗 Related Documents

- [Zero-Flicker SSR Guide](./02-anti-flicker-guide.md)
- [Responsive Drawer Guide](./04-responsive-drawer.md)
- [Theme Catalog](../themes/01-theme-catalog.md)
