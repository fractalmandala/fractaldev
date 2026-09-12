# Technical Architecture Specification: Real Procedural Generator Engines, Silhouette Forms & Preset Colourways

- **Document:** `PRODUCT-TECH.md`
- **Product Spec Reference:** [`docs/specs/2026-08-16-engines-and-presets-spec.md`](./docs/specs/2026-08-16-engines-and-presets-spec.md)
- **Target Repository:** `fractalthemer` (`ddd0dba`)
- **Status:** Proposed Tech Spec

---

## 1. Context

`fractalthemer` provides an interactive visual studio (`ThemeStudio.svelte`) for gradient synthesis and theme generation. The current canvas renderer ([`src/lib/components/studio/GradientCanvas.svelte:50-160 @ ddd0dba`](file:///Users/amrit/fractalmandala/fractalthemer/src/lib/components/studio/GradientCanvas.svelte#L50-L160)) implements full procedural pipelines for `linear`, `radial`, `conic`, `bars`, `blocks`, and `beehive`, while falling back to a shared multi-point radial Gaussian blend for the remaining engines.

To achieve complete fidelity with the reference system (`feralui.dev/gradients`):
1. Each of the 14 targeted engines requires its own dedicated mathematical shader/canvas simulation.
2. The `forms` engine requires a dedicated **24 SVG Silhouette Mask Set** with vector path clipping and gradient fills.
3. The generator controls ([`src/lib/components/studio/GeneratorControls.svelte @ ddd0dba`](file:///Users/amrit/fractalmandala/fractalthemer/src/lib/components/studio/GeneratorControls.svelte)) require:
   - An **Arrangement Presets Grid** per engine (e.g. for Lines: *Snake, Drops, Loops, Ribbon, Doodle, Wander, Waves, Echo*).
   - A **12-Colourway Circular Pie-Wheel Swatch Grid** (*Solar, Lagoon, Coral, Aerial, Botanic, Violet, Cobalt, Cinder, Vivid, Rainbow, Rosewater, Midnight*) for instantaneous re-tinting.

---

## 2. Proposed Changes

### 2.1. Module & Data Architecture

```
src/lib/
  data/
    colourways.ts           # [NEW] 12 curated multi-segment colourway wheel presets
    silhouettes.ts          # [NEW] 24 SVG vector path definitions for the Forms engine
    arrangements.ts         # [NEW] Arrangement presets for Lines, Bars, Flow, Aurora, etc.
  engines/
    canvas-shaders.ts       # [NEW] Pure procedural mathematical render routines for all 21 engines
    color-converter.ts      # [EXISTING] Hex ↔ RGB ↔ HSL & WCAG math
    color-harmony.ts        # [EXISTING] 9-column theme palette generator
  components/studio/
    GradientCanvas.svelte   # [MODIFY] Connect 21 dedicated render routines & 24 SVG silhouette clipping
    GeneratorControls.svelte# [MODIFY] Render 24 Silhouette form grid, 12 Colourway pie-wheels, & Arrangement cards
    ColourwayWheel.svelte   # [NEW] Circular multi-segment SVG pie swatch component
    SilhouetteGrid.svelte   # [NEW] 24 SVG vector silhouette selection grid
```

---

### 2.2. Procedural Mathematical Simulation Algorithms (`canvas-shaders.ts`)

#### A. Fields Engines
1. **`flow`**: 2D Simplex/Perlin turbulence noise displacement.
   $$\vec{P}'(x, y) = (x, y) + \text{distortion} \cdot (\text{noise}(s x, s y), \text{noise}(s x + 100, s y + 100))$$
   Interpolates between color emitters weighted by inverse distance to $\vec{P}'$.
2. **`sky`**: Horizontal atmospheric Rayleigh scattering.
   $$L(y) = \text{zenithColor} \cdot (1 - y) + \text{horizonColor} \cdot e^{-\alpha y} + \text{sunGlow} \cdot \cos^2(\theta_{\text{elev}})$$
3. **`aurora`**: Vertical sinusoidal shimmering ray curtains.
   $$I(x, y) = \sum_{k=1}^3 A_k \sin\left(\omega_k x + \phi_k + \text{drift} \cdot t\right) \cdot \exp\left(-\frac{(y - y_{\text{curtain}})^2}{2\sigma^2}\right)$$
4. **`mesh`**: 2D Delaunay / multi-node Bezier interpolation across draggable canvas nodes.
5. **`still`**: Ambient depth wash with quadratic vignette $V(r) = 1 - (r / R_{\max})^2$.
6. **`retro`**: Filmic tone-mapping with warm chromatic aberration and noise dither.
7. **`ios`**: Saturated multi-point Gaussian bloom with simulated frosted-glass dispersion.

#### B. Stripes Engines
8. **`stripes`**: Parallel alternating spectral bands with angular rotation matrix $R(\theta)$.
9. **`columns`**: Vertical pillar sweeps with refractive edge dispersion.
10. **`prism`**: Optical chromatic dispersion splitting white light into component wavelengths:
    $$n(\lambda) = A + \frac{B}{\lambda^2}$$
11. **`waves`**: Multi-layer sinusoidal harmonics $y_i(x) = A_i \sin(k_i x + \phi_i)$.
12. **`lines`**: Dimensional ribbon tubes along vector paths (Snake, Loops, Ribbon, Doodle, Wander, Waves, Echo).

#### C. Objects & Forms Engines
13. **`balls`**: Metaball liquid gravitational potential blending:
    $$V(x, y) = \sum_{i=1}^N \frac{R_i^2}{(x - x_i)^2 + (y - y_i)^2} \ge 1.0$$
14. **`forms`**: 24 SVG silhouette clipping paths (*Arch, Clover, Heart, Drapery, 4-Leaf, Sunburst, Flower, Starburst, Cross, Ring, Sparkle, Horizontal Stripes, Dome, Propeller, Squiggle, Flower-8, Teardrop, Circle, Pebble, Eye-Ring, Crescent, Star, X-Pill, Wave*) filled with active gradient shader.

---

### 2.3. State & Reactivity Additions (`studio.svelte.ts`)

```typescript
export interface StudioRecipe {
  // ... existing fields ...
  activeSilhouette?: string;      // Active form id (e.g. 'arch', 'clover', 'heart')
  activeArrangement?: string;     // Active arrangement id (e.g. 'snake', 'loops')
  activeColourway?: string;       // Active colourway id (e.g. 'solar', 'lagoon')
  swirl?: number;                 // Flow swirl parameter (0-100)
  elevation?: number;             // Sky elevation angle (0-90)
  lights?: number;                // Aurora luminescence (0-100)
  fold?: number;                  // Aurora curtain pleat fold (0-100)
  drift?: number;                 // Aurora drift velocity (0-100)
  tension?: number;               // Lines curve tension (0-100)
  thickness?: number;             // Lines stroke thickness (2-40px)
}
```

---

## 3. Testing and Validation

| Product Invariant (from Spec §4) | Validation Technique | Expected Result |
|---|---|---|
| **§4.1.1 `flow` turbulence** | Change `Scale`, `Distortion`, `Swirl` sliders | Visual filaments distort organically in real-time. |
| **§4.1.2 `sky` horizon** | Change `Elevation` slider (0°–90°) | Sun position shifts smoothly between horizon and zenith. |
| **§4.1.3 `aurora` curtains** | Change `Lights`, `Fold`, `Drift` sliders | Sinusoidal ray curtain pleats fold and drift across canvas. |
| **§4.1.12 `lines` tubes** | Select *Snake, Loops, Ribbon, Doodle, Wander* | Canvas draws smooth continuous ribbon tube along selected path. |
| **§4.1.13 `balls` metaballs** | Move ball pins close to each other | Overlapping balls merge with smooth gooey liquid necks. |
| **§4.1.14 `forms` 24 silhouettes**| Click each of the 24 SVG silhouette cards | Shape boundary clips the inner gradient on the canvas cleanly. |
| **§4.2 12-Colourway pie wheels** | Click *Solar, Lagoon, Coral, Aerial, etc.* | Immediately updates all pin colors on the active canvas. |
| **§4.3 Arrangement presets** | Click arrangement preset card | Repositions canvas pins without overwriting current colors. |
| **Type Check & Compilation** | `pnpm run check && pnpm run package` | **0 errors, 0 warnings**, and clean `dist/` build. |

---

## 4. Parallelization

- **Execution Mode**: Single-agent sequential execution.
- **Rationale**: The mathematical algorithms in `canvas-shaders.ts`, the dataset definitions (`colourways.ts`, `silhouettes.ts`, `arrangements.ts`), and the UI components (`GradientCanvas.svelte`, `GeneratorControls.svelte`) share state types and must be integrated cohesively into the Svelte 5 runes lifecycle.
