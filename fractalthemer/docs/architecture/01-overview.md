---
id: architecture-overview
title: System Architecture and Package Design
type: design
tags: [architecture, design-principles, package-structure, sveltekit, exports]
summary: Architectural foundations, modular decomposition, and packaging strategy of fractalthemer.
relates_to: [docs-index, state-and-reactivity, tokens-and-css-contract]
updated: 2026-08-28
---

# System Architecture & Package Design

This document details the architectural topology, design philosophy, and module decomposition of the `fractalthemer` library.

---

## 🎯 Design Principles

1. **Orthogonal Mode, Palette & Background Axes**:
   - `data-mode="light|dark"` defines the binary operating system contrast axis.
   - `data-theme="<name>"` defines the aesthetic color identity.
   - `data-bg-style="plain|aura|gradient|pattern"` controls the backdrop rendering mechanism:
     - `plain`: Clean distraction-free solid color surfaces — the `-bg-*` tokens are opaque and carry the design.
     - `aura`: GPU-accelerated atmospheric multi-layer radial/linear gradient blend shaders calibrated to each theme.
     - `gradient`: Full viewport linear gradient backdrops selected from curated presets.
     - `pattern`: 257 curated vector-grade CSS background patterns across Geometric, Effects, Gradients, and Decorative categories.
     - In any vivid style (`aura`/`gradient`/`pattern`), the `-bg-*` tokens are automatically re-emitted translucent and app chrome auto-frosts — the backdrop becomes the single canvas (see [Tokens & CSS Contract §6](./03-tokens-and-css-contract.md)).

2. **Zero Runtime Styling Overhead**:
   - Every theme is compiled to standard, pure CSS custom properties (`--bg`, `--text-primary`, `--theme-color`, etc.).
   - Switching a theme merely toggles a single class name on `<html>` (`document.documentElement`). No JavaScript virtual DOM trees are recalculated to repaint colors.

3. **True Zero-Flicker SSR Support**:
   - A synchronous inline snippet executes in `app.html` before any stylesheet or markup renders.
   - Dark mode users never experience a white flash on initial page load or page reloads.

4. **Self-Contained Library Surface**:
   - Embedded SVG icons with zero external icon package dependencies.
   - Works with vanilla CSS, SASS, Tailwind, or any UI framework that consumes CSS custom properties.

5. **Persistent Custom Accent Layer**:
   - `--theme-color` / `--theme-color-alt` can be overridden by a user-owned accent layer that rides on top of every theme — built-in or custom.
   - Applied pre-paint by the SSR script; survives theme switches, refreshes, and sessions. Only an explicit reset clears it.

---

## 🏗 Package Topology

The package is built with `@sveltejs/package` and exports both modern TypeScript declarations and precompiled CSS bundles:

```
fractalthemer/
├── dist/                              # Compiled distributable
│   ├── index.js                       # Svelte 5 component & state exports
│   ├── index.d.ts                     # Type definitions
│   ├── styles/
│   │   ├── index.css                  # Precompiled CSS bundle
│   │   ├── index.sass                 # SASS master stylesheet
│   │   ├── _tokens.sass               # Source SASS 30 semantic tokens
│   │   ├── _themes.sass               # Source SASS 41 themes
│   │   ├── _auras.sass                # Source SASS auras & pattern shaders
│   │   ├── _glass.sass                # Source SASS glass regime (--glass-blur, chrome frost)
│   │   └── _theme-picker.sass         # Source SASS 100vh drawer
│   ├── data/
│   │   ├── themes.js                  # 41 Themes dataset & metadata
│   │   ├── gradients.js               # Gradient presets dataset
│   │   ├── patterns.js                # 257 CSS patterns dataset
│   │   └── auras.js                   # Aura coordinates & layer presets
│   └── utils/
│       └── anti-flicker.js            # Standalone SSR script generator
└── src/lib/                           # Source files
    ├── components/                    # Svelte 5 components
    ├── state/                         # Reactive runes state (themeState)
    ├── data/                          # 41 Theme, Aura, Gradient & Pattern definitions
    ├── icons/                         # Embedded SVG icons
    └── styles/                        # Indented SASS source
```

---

## 🔌 Export Contracts

In [`package.json`](../../package.json), the package defines clear subpath exports:

| Export Specifier | Resolved Target | Purpose |
|---|---|---|
| `fractalthemer` | `./dist/index.js` | Components, `themeState`, types, and constants |
| `fractalthemer/styles.css` | `./dist/styles/index.css` | Precompiled, drop-in CSS stylesheet bundle |
| `fractalthemer/styles` | `./dist/styles/index.sass` | SASS root bundle importing all partials |
| `fractalthemer/tokens` | `./dist/styles/_tokens.sass` | Raw SASS theme color design tokens |
| `fractalthemer/themes` | `./dist/styles/_themes.sass` | Raw SASS 41 theme classes |
| `fractalthemer/auras` | `./dist/styles/_auras.sass` | Raw SASS aura shaders & gradient backdrops |
| `fractalthemer/glass` | `./dist/styles/_glass.sass` | Raw SASS glass regime partial (`--glass-blur`, chrome frost) |
| `fractalthemer/picker` | `./dist/styles/_theme-picker.sass` | Raw SASS 100vh responsive drawer styles |
| `fractalthemer/styles/*` | `./dist/styles/*` | Raw SASS wildcard subpath for custom builds |
| `fractalthemer/script` | `./dist/utils/anti-flicker.js` | Standalone script generator for SSR templates |

---

## 🔄 Lifecycle & Execution Flow

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Browser (HTML Parser)
    participant Storage as localStorage
    participant DOM as document.documentElement
    participant Svelte as Svelte 5 Hydration (themeState.init)
    participant UI as ThemePicker / AuraBackground

    Browser->>Storage: Read 'theme', 'bgStyle' & custom accent/token keys
    Storage-->>Browser: Returns saved theme ID (or fallback)
    Browser->>DOM: Set root.className = theme, data-theme, data-mode, data-bg-style
    Note over Browser,DOM: Initial Paint (Zero Flash of Light/Dark)
    Browser->>Svelte: App Mounts & Hydrates
    Svelte->>Storage: themeState.init() validates stored custom themes
    Svelte->>UI: Reactively synchronizes ThemePicker & AuraBackground
```

---

## 🔗 Related Documents

- [State & Reactivity](./02-state-and-reactivity.md)
- [Tokens & CSS Contract](./03-tokens-and-css-contract.md)
- [Quickstart Guide](../guides/01-quickstart.md)
