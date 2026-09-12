---
id: auras-catalog
title: Atmospheric Aura Gradients Catalog
type: design
tags: [auras, gradient-presets, shaders, blend-modes, css-filters]
summary: Reference of all atmospheric GPU gradient blend presets, node coordinates, blur values, and mix-blend-modes in fractalthemer.
relates_to: [aura-background-component, theme-catalog]
updated: 2026-08-16
---

# Atmospheric Aura Gradients Catalog

The aura engine in `fractalthemer` provides GPU-accelerated atmospheric gradient blend layers configured in [`_auras.sass`](../../src/lib/styles/_auras.sass).

---

## 🌌 Aura Presets Directory

### 1. Frosted Jade (`mesh-frosted-jade`)
- **Matched Themes**: `theme-light-default`
- **Layers**:
  - `Layer 1`: Radial gradient at `25% 30%`, emerald `rgba(52,211,153,0.5)`, blur `200px`.
  - `Layer 2`: Radial gradient at `75% 25%`, jade `rgba(16,185,129,0.4)`, blur `175px`.
  - `Layer 3`: Radial gradient at `50% 80%`, cyan `rgba(6,182,212,0.35)`, soft-light, blur `200px`.
  - `Layer 4`: Radial gradient at `30% 70%`, mint `rgba(209,250,229,0.5)`, overlay, blur `150px`.

### 2. Glacier Mist (`glacier-mist`)
- **Matched Themes**: `theme-himalaya-light`
- **Layers**:
  - `Layer 1`: Linear gradient azure `#4DD2FF` into indigo `#5B6EF5`, hard-light, blur `90px`.
  - `Layer 2`: Linear gradient cyan `#35E6C0` into azure, soft-light, blur `90px`.

### 3. Golden Hour (`golden-hour`)
- **Matched Themes**: `theme-sun-light`
- **Layers**:
  - `Layer 1`: Linear gradient warm amber `#FFB74D` into burnt terracotta `#B74D00`, hard-light, blur `125px`.
  - `Layer 2`: Linear gradient golden peach into amber, soft-light, blur `100px`.

### 4. Liquid Cyan (`glass-liquid-cyan`)
- **Matched Themes**: `theme-sun-dark`
- **Layers**:
  - `Layer 1`: Linear gradient deep navy into cyan `rgba(34,211,238,0.30)`, blur `75px`.
  - `Layer 2`: Radial ellipse highlight at `28% 42%`, cyan, screen, blur `120px`.
  - `Layer 3`: Radial ellipse at `72% 58%`, light blue, screen, blur `138px`.
  - `Layer 4`: Specular angle light, screen, blur `45px`.

### 5. Blood Aurora (`blood-aurora`)
- **Matched Themes**: `theme-obsidian-crimson-dark`
- **Layers**:
  - 6 distinct layered radial and linear volcanic basalt flares blending from deep ruby into glowing vermillion and basalt black with multiply vignettes.

### 6. Neon Tokyo (`mesh-neon-tokyo`)
- **Matched Themes**: `theme-synthwave-dark`
- **Layers**:
  - `Layer 1`: Radial magenta node at `15% 20%`, screen, blur `200px`.
  - `Layer 2`: Radial cyan node at `85% 15%`, screen, blur `175px`.
  - `Layer 3`: Radial electric yellow at `50% 80%`, screen, blur `200px`.
  - `Layer 4`: Violet overlay node at `70% 50%`, blur `150px`.

---

## 🎨 Aura Shader Rules & Best Practices

1. **Keep Layer Count ≤ 6**: Limits GPU memory overhead while achieving maximum chromatic diffusion.
2. **Use `contain: strict` on Ambient Wrapper**: Prevents repaints from cascading into the main DOM tree.
3. **Always Blur ≥ 75px on Radial Nodes**: Eliminates hard color banding across high-density retina displays.

---

## 🔗 Related Documents

- [AuraBackground Component](../components/AuraBackground.md)
- [Theme Catalog](./01-theme-catalog.md)
