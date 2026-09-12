---
id: aura-background-component
title: AuraBackground Component & GPU Gradient Engine
type: design
tags: [components, auras, gradients, shaders, blend-modes, gpu-acceleration]
summary: Mechanics of the multi-layer GPU blend gradient background, CSS filter blur nodes, and theme synchronization.
relates_to: [theme-picker-component, auras-catalog, tokens-and-css-contract]
source: src/lib/components/AuraBackground.svelte
updated: 2026-08-28
---

# AuraBackground Component & GPU Gradient Engine

The [`AuraBackground.svelte`](../../src/lib/components/AuraBackground.svelte) component renders an ambient, atmospheric background blend layer calibrated to the active theme.

---

## 🎯 Functional Specification

- **Role**: Renders multi-layer hardware-accelerated radial and linear gradients beneath application content when `themeState.isAura` is true (`data-bg-style="aura"`).
- **Positioning**: Fixed to the entire viewport (`position: fixed; inset: 0; z-index: 0; pointer-events: none;`).
- **Performance**:
  - `contain: strict`: Isolates repainting to the aura container.
  - `transform: translateZ(0)` & `will-change: transform`: Forces composite layer creation on the GPU.
  - `pointer-events: none`: Ensures zero interference with mouse, touch, or click gestures.
- **Zero DOM Pollution in Plain Mode**: When `themeState.bgStyle === 'plain'`, the component evaluates `{#if themeState.isAura}` to false and unmounts completely from the DOM.
- **Glass Regime Synergy**: In any vivid mode (`aura` / `gradient` / `pattern`), `themeState` re-emits the `-bg-*` tokens translucent and `_glass.sass` auto-frosts app chrome — so this component's backdrop reads as the single canvas behind glass surfaces (see [Tokens Contract §6](../architecture/03-tokens-and-css-contract.md)).

---

## 🧩 Template Architecture

Inside [`src/lib/components/AuraBackground.svelte`](../../src/lib/components/AuraBackground.svelte):

```svelte
<script lang="ts">
    import { themeState } from '../state/theme.svelte.js';
</script>

{#if themeState.isAura}
    <div class="aura-ambient" aria-hidden="true">
        {#if themeState.activeCustomAuraLayers && themeState.activeCustomAuraLayers.length > 0}
            {#each themeState.activeCustomAuraLayers as layer, i (layer.layer || i)}
                <div
                    class="aura-layer"
                    style:background={layer.background}
                    style:mix-blend-mode={layer.blendMode || 'normal'}
                    style:filter={`blur(${layer.blurMobile || layer.blur || 75}px)`}
                    style:opacity={layer.opacity !== undefined ? layer.opacity : 1}
                ></div>
            {/each}
        {:else}
            <div class="aura-layer aura-layer-1"></div>
            <div class="aura-layer aura-layer-2"></div>
            <div class="aura-layer aura-layer-3"></div>
            <div class="aura-layer aura-layer-4"></div>
            <div class="aura-layer aura-layer-5"></div>
            <div class="aura-layer aura-layer-6"></div>
        {/if}
    </div>
{:else if themeState.isGradient && themeState.activeGradientPreset}
    <div class="aura-gradient-backdrop" aria-hidden="true">
        <div class="gradient-canvas" style:background={themeState.activeGradientPreset.css}></div>
        <div class="gradient-overlay-soft"></div>
    </div>
{/if}
```

---

## 🌈 CSS Gradient & Blend Mode Mechanics

Defined in [`_auras.sass`](../../src/lib/styles/_auras.sass), each theme targets `.aura-ambient` via CSS selectors:

```sass
.theme-sun-dark[data-bg-style="aura"] .aura-ambient,
[data-theme="theme-sun-dark"][data-bg-style="aura"] .aura-ambient
    .aura-layer-1
        background: linear-gradient(135deg, rgba(8,47,73,0.82) 0%, rgba(14,116,144,0.48) 48%, rgba(34,211,238,0.30) 100%)
        mix-blend-mode: normal
        filter: blur(75px)
    .aura-layer-2
        background: radial-gradient(ellipse 55% 42% at 28% 42%, rgba(34,211,238,0.42) 0%, transparent 68%)
        mix-blend-mode: screen
        filter: blur(120px)
    .aura-layer-3
        background: radial-gradient(ellipse 45% 55% at 72% 58%, rgba(103,232,249,0.30) 0%, transparent 68%)
        mix-blend-mode: screen
        filter: blur(138px)
```

### Layer Composition Techniques

1. **Base Atmosphere (`.aura-layer-1`)**: Wide linear or radial gradient providing ambient undertone.
2. **Focal Node (`.aura-layer-2`)**: Offset radial highlight using `mix-blend-mode: screen` or `hard-light`.
3. **Harmonic Glow (`.aura-layer-3`)**: Secondary accent node creating chromatic depth.
4. **Surface Light (`.aura-layer-4+`)**: Specular highlight or soft vignette.

---

## 🔗 Related Documents

- [Auras Catalog](../themes/02-auras-catalog.md)
- [ThemePicker Component](./ThemePicker.md)
