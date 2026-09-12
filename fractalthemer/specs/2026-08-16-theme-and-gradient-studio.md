# Feature Specification: Theme Builder Studio & Atmospheric Gradient Engine

- **Feature Name:** Theme Builder Studio & Atmospheric Gradient Engine
- **Spec Path:** `specs/2026-08-16-theme-and-gradient-studio.md`
- **Created Date:** 2026-08-16
- **Status:** Under Review

---

## 1. Feature Overview

The **Theme Builder Studio & Atmospheric Gradient Engine** is a visual design and theming environment built directly into the `fractalthemer` package. It unifies an interactive 21-engine gradient synthesizer, a 9-column semantic theme palette generator with per-swatch color locking, an artisan color explorer with WCAG contrast auditing, and multi-target code/asset export (CSS, SASS, SVG, PNG, WebGL shaders, JSON, and MP4 animated loops).

This feature allows web designers and developers using SvelteKit (and any CSS/SASS-enabled project) to visually author, fine-tune, test, save, and export complete theme suites and dynamic atmospheric backdrops with zero guesswork and zero friction.

---

## 2. Problem Being Solved

1. **Ecosystem Gap in SvelteKit**: While frameworks like Next.js and Vue have rich theme studio tooling, SvelteKit lacks an integrated, visual, and zero-flicker theme creation and atmospheric shader environment.
2. **Disconnected Theme & Gradient Authoring**: Manually calculating harmonic color values for 9 distinct semantic tokens (`--bg`, `--bg-surface`, `--bg-panel`, `--bg-raised`, `--state-hover`, `--state-hover-subtle`, `--border`, `--theme-color`, `--theme-color-alt`) while balancing contrast, hover states, and multi-layer GPU blend shaders is tedious and error-prone.
3. **Loss of Control during Color Generation**: Traditional palette generators randomize all colors at once. Designers need the ability to "lock" foundational colors (e.g. an existing brand accent or dark canvas) while exploring harmonic options for the remaining surfaces.
4. **Standalone Portability**: The builder can be shipped inside `fractalthemer` so consuming projects (like documentation sites, dashboards, or design systems) can embed a live theme customizer with zero external dependencies.

---

## 3. Business Rules & Functional Requirements

### 3.1. Studio Navigation & Core Tabs
1. The Studio interface must provide 5 primary views:
   - **Studio**: The main interactive generator workbench (canvas, parameters, swatches, timeline).
   - **Gallery**: Categorized grid of 70+ curated gradient studies with live preview cards.
   - **Palette**: Searchable library of artisan color swatches with WCAG contrast ratings.
   - **Saved**: Persistent library of user-crafted gradients and custom theme palettes.
   - **What's New**: Feature changelog and release history.
2. A top sub-navigation switches between **Gradient Engine** and **Palette Generator** modes within the Studio.

---

### 3.2. 21 Gradient Generator Engines Across 3 Paradigms

The generator engine must support 21 distinct algorithms organized into 3 primary categories:

#### Category A: 7 Fields
1. **Flow**: Organic fluid noise simulation with draggable color emitter pins, `Scale` (10–100%), and `Distortion` (0–100%) sliders.
2. **Sky**: High-altitude atmospheric horizon wash with elevation angle and twilight diffusion.
3. **Aurora**: Multi-stage ray curtains with `Lights` intensity, ray `Fold`, horizontal `Drift`, vertical `Spread`, and `Direction` (`Up`, `Right`, `Down`, `Left`).
4. **Mesh**: Multi-point interpolated Bezier mesh with draggable canvas nodes, point shuffle, and grid reset.
5. **Still**: Clean, motionless atmospheric depth wash with subtle vignette falloff.
6. **Retro**: Vintage chromatic diffusion with warm tone-mapping and analog softness.
7. **iOS**: Frosted glassmorphic optical blur backdrop with saturated ambient glow.

#### Category B: 7 Stripes
8. **Linear**: High-precision multi-stop directional linear gradients with 0–360° angle control.
9. **Stripes**: Crisp parallel spectral bands with spacing, duty-cycle, and rotation controls.
10. **Bars**: Procedural soundwave/equalizer with `Envelope` (`Curve`, `Flat`, `Ramp`), bar `Count` (2–64), `Spread` (-100% to +100%), `Speed`, and draggable height grabbers per bar.
11. **Columns**: Prismatic vertical light sweeps with optical refraction.
12. **Prism**: Spectral chromatic dispersion simulating white light splitting through glass.
13. **Waves**: Sinuous undulating harmonic wave layers with frequency and amplitude modulations.
14. **Lines**: Dimensional flowing gradient tubes and vector silhouette ribbon paths.

#### Category C: 7 Objects
15. **Rings**: Concentric acoustic circular ripples with exponential decay and radius modulation.
16. **Pixel**: Retro 8-bit quantized modular pixel grid with pixel size and dither controls.
17. **Blocks**: Structured polygonal and tiled modular grid cells with edge bevels.
18. **Beehive**: Hexagonal honeycomb cell matrix with cell size and border contrast controls.
19. **Balls**: Floating radial metaballs with liquid gravitational blending.
20. **Radial**: Multi-point radial spotlight emitters with circular and elliptical aspect ratios.
21. **Conic**: 360-degree angular conic sweeps around a draggable central focal origin.

---

### 3.3. Canvas Direct Manipulation & Multi-Band Timeline
1. **Draggable Canvas Pins**: Every color stop in supported engines (Flow, Mesh, Radial, Aurora) renders as a draggable canvas pin. Dragging repositioning coordinates `(x, y)` directly updates the shader.
2. **Ring Reach Handles**: Outer pin rings allow users to resize the influence radius of individual color emitters directly on the canvas.
3. **Multi-Band Timeline Slider**: A horizontal bar at the canvas bottom displays relative color distribution bands. Users can drag divider handles along the timeline to rebalance color dominance across the viewport.
4. **Finish Sliders**:
   - `Soften` (0px to 100px): Global Gaussian blur and liquid dissipation.
   - `Noise` (0% to 20%): Procedural grain texture overlay to eliminate 8-bit digital color banding.
5. **Readability & Contrast Overlays**:
   - `Hide / Show Tags`: Toggles label tags on canvas pins.
   - `Contrast Check`: Renders an accessibility heatmap showing text readability scores over the canvas.

---

### 3.4. 9-Column Semantic Theme Palette Generator

1. **Semantic Color Contract**: The palette generator models the 9 core semantic theme variables:
   1. `--bg`: Deepest application canvas backdrop.
   2. `--bg-surface`: Primary card and content container background.
   3. `--bg-panel`: Sidebar, toolbar, and drawer panel background.
   4. `--bg-raised`: Elevated popovers, dropdowns, and floating cards.
   5. `--state-hover`: Neutral hover background tint.
   6. `--state-hover-subtle` (or `--state-hover-soft`): Gentle list-item and table-row hover tint.
   7. `--border`: Primary separator, card outline, and divider line color.
   8. `--theme-color`: Primary brand action and accent color.
   9. `--theme-color-alt`: Hover and active state for brand action buttons.

2. **Color Harmony Algorithms**:
   - `Monochromatic`, `Analogous`, `Complementary`, `Split-Complementary`, `Triadic`, `Tetradic`, `Shades`, `Tints`.

3. **Per-Color Locking Invariant**:
   - Every color column features an interactive Lock icon toggle (`🔒` / `🔓`).
   - When a swatch is **Locked**, its color value remains 100% frozen when the user clicks **Randomize**, **Reset**, or switches harmony modes.
   - Any number of swatches (0 to 9) can be locked simultaneously.
   - Unlocked swatches recalculate according to the active harmony algorithm relative to the locked/base color.

4. **Live Contrast Ratios**:
   - Every column displays its contrast score against White (`W:`) and Black (`B:`) and against the active `--bg`.
   - Badges indicate WCAG AAA (≥7:1) or AA (≥4.5:1) compliance.

5. **Instant Live Application**:
   - A **"Apply as Active Theme"** button instantly injects the 9 generated tokens into `document.documentElement` and `themeState`.

---

### 3.5. Gallery, Palette & Saved Libraries
1. **Gallery**: 70+ categorized preset gradient studies with search and category filter pills (`All`, `Linear`, `iOS`, `Radial`, `Conic`, `Mesh`, `Flow`, `Retro`, `Stripes`, `Blocks`, `Arch`, `Waves`, `Rings`, `Pixel`, `Dark`, `Light`, `Mono`).
2. **Artisan Palette Catalog**: Comprehensive swatch library sortable by `Hue`, `Light to dark`, and `Dark to light`, with category filters (`All`, `Grey`, `Red`, `Yellow`, `Green`, `Blue`, `Purple`, `Brown`).
3. **Saved Library**: Persistent local storage of custom gradient recipes and custom 9-token theme palettes.

---

### 3.6. Multi-Target Export Engine
1. **CSS**: Pure vanilla CSS (`linear-gradient`, `radial-gradient`, `@keyframes`, custom properties).
2. **SASS**: Single-tab indented `.sass` stylesheet with `$variables` and `@mixin` definitions.
3. **SVG**: Resolution-independent vector file with `<defs>` filters and linear/radial tags.
4. **PNG**: 1x, 2x, 4x retina raster snapshot download.
5. **WebGL/GLSL**: Fragment shader code for Canvas2D/WebGL integrations.
6. **JSON**: Raw structured recipe object for serialization.
7. **Animated MP4**: Client-side canvas video loop recording with quality settings (*Fast clip*, *High-res 60fps*, *Lossless 4K*).

---

## 4. Impacted Files & Modules

```
fractalthemer/
├── src/lib/
│   ├── components/
│   │   ├── studio/
│   │   │   ├── ThemeStudio.svelte        # Master Studio container & modal
│   │   │   ├── GradientCanvas.svelte     # Interactive canvas renderer with pins
│   │   │   ├── GeneratorControls.svelte  # 21-engine parameter panels & sliders
│   │   │   ├── PaletteGenerator.svelte   # 9-column lockable theme palette generator
│   │   │   ├── GalleryView.svelte        # 70+ preset gallery browser
│   │   │   ├── PaletteCatalog.svelte     # Artisan color swatches with WCAG badges
│   │   │   ├── SavedView.svelte          # Persistent local storage library
│   │   │   ├── TimelineBar.svelte        # Multi-band color distribution slider
│   │   │   └── ExportModal.svelte        # CSS/SASS/SVG/PNG/Shader/MP4 export
│   │   ├── ThemePicker.svelte            # Added Studio launch trigger
│   │   └── AuraBackground.svelte         # Extended shader renderer
│   ├── engines/
│   │   ├── flow.ts, aurora.ts, mesh.ts, bars.ts, lines.ts, stripes.ts
│   │   ├── blocks.ts, rings.ts, scenes.ts, color-harmony.ts
│   ├── data/
│   │   ├── gallery-presets.ts            # 70+ Curated gradient presets
│   │   ├── artisan-colors.ts             # Japanese/artisan color database
│   │   └── tokens.ts                     # 9 Core semantic token definitions
│   ├── styles/
│   │   ├── _studio.sass                  # Single-tab indented SASS for Studio UI
│   │   ├── _palette-gen.sass             # 9-column palette layout & lock styling
│   │   └── index.sass                    # Exported master stylesheet
│   └── index.ts                          # Export ThemeStudio, PaletteGenerator, engines
```

---

## 5. Input / Output Contracts

### 5.1. Gradient Recipe Schema (`GradientRecipe`)
```typescript
export interface ColorStopPin {
    id: string;
    color: string;
    x: number; // 0.0 to 1.0 (relative canvas position)
    y: number; // 0.0 to 1.0
    radius: number; // 0.0 to 1.0 (reach / influence)
    locked?: boolean;
}

export interface GradientRecipe {
    id: string;
    name: string;
    category: 'fields' | 'stripes' | 'objects' | 'scenes';
    engineType: string; // 'flow' | 'aurora' | 'mesh' | 'bars' | ...
    colors: ColorStopPin[];
    parameters: Record<string, number | string | boolean>;
    soften: number; // 0 to 100px
    noise: number;  // 0 to 20%
    updatedAt: number;
}
```

### 5.2. 9-Column Semantic Palette Schema (`SemanticThemePalette`)
```typescript
export interface PaletteColumn {
    token: '--bg' | '--bg-surface' | '--bg-panel' | '--bg-raised' | '--state-hover' | '--state-hover-subtle' | '--border' | '--theme-color' | '--theme-color-alt';
    label: string;
    hex: string;
    hsl: { h: number; s: number; l: number };
    locked: boolean;
    contrastWhite: number;
    contrastBlack: number;
}

export interface SemanticThemePalette {
    id: string;
    name: string;
    harmonyMode: 'monochromatic' | 'analogous' | 'complementary' | 'split-comp' | 'triadic' | 'tetradic' | 'shades' | 'tints';
    baseColor: string;
    columns: PaletteColumn[];
}
```

---

## 6. Acceptance Criteria

1. **21 Generator Engines**: All 21 algorithms (7 Fields, 7 Stripes, 7 Objects) render accurately in the live canvas without console errors.
2. **Direct Canvas Pin Manipulation**: Dragging color pins and ring reach handles updates the gradient composition in real time at a steady 60fps.
3. **Multi-Band Timeline**: Dragging timeline grabbers rebalances color dominance across the active blend.
4. **9-Column Palette Generator**: Correctly displays all 9 semantic tokens with live contrast ratios and color swatches.
5. **Per-Color Locking Invariant**: Any number of columns can be locked; locked colors remain frozen during Randomize, Reset, and Harmony mode switching.
6. **70+ Gallery Presets**: Gallery displays all 70+ presets with filter chips and loads them directly into the Studio on click.
7. **Artisan Color Explorer**: Sorts by Hue, Light-to-Dark, Dark-to-Light with category filtering and click-to-copy hex functionality.
8. **Multi-Format Export**: Generates valid, copyable/downloadable CSS, indented SASS, SVG, PNG, WebGL Shader, and MP4 video recordings.
9. **Package Integration**: `ThemeStudio` is cleanly exported from `fractalthemer` and compiles cleanly via `pnpm run check && pnpm run package`.
10. **Design Conventions**: All stylesheet files strictly adhere to single-tab indented SASS (`.sass`) without curly braces or semicolons.

---

## 7. Technical Risks & Mitigations

1. **Rendering Performance on Complex Meshes / Fluids**:
   - *Risk*: High CPU/GPU load during rapid slider scrubbing on low-power mobile devices.
   - *Mitigation*: Use WebGL fragment shaders and `requestAnimationFrame` debouncing, falling back to optimized multi-layer CSS radial blends.
2. **MP4 Video Encoding in Browser**:
   - *Risk*: Heavy WebCodecs/MediaRecorder memory consumption on long recordings.
   - *Mitigation*: Limit loop duration to 3–5 seconds, optimize canvas resolution presets, and use hardware-accelerated H.264 profiles.
3. **SASS Importer Resolution**:
   - *Risk*: Consuming apps encountering path resolution issues with `@use 'fractalthemer/styles'`.
   - *Mitigation*: Provide precompiled drop-in CSS (`import 'fractalthemer/styles.css'`) alongside explicit subpath SASS exports.

---

## 8. Suggested Implementation Plan

- **Step 1: Color Harmony & 9-Column Palette Engine**
  - Implement color harmony algorithms (`analogous`, `complementary`, `split-comp`, `triadic`, `tetradic`, `shades`, `tints`).
  - Implement per-color locking state machine and WCAG contrast calculations.
- **Step 2: 21 Gradient Generator Engines & Shaders**
  - Implement shader generators for 7 Fields, 7 Stripes, and 7 Objects.
  - Build direct-manipulation canvas pin and ring grabber layer.
- **Step 3: Studio UI & Multi-Band Timeline**
  - Build the floating control sidebar, multi-band timeline bar, and finish sliders (`soften`, `noise`).
  - Implement live typography overlay and contrast heatmap check.
- **Step 4: Gallery, Palette Explorer & Saved Storage**
  - Populate 70+ gallery presets and artisan color library.
  - Implement `localStorage` serialization for custom recipes and palettes.
- **Step 5: Multi-Format Export Engine**
  - Build export pipelines for CSS, indented SASS, SVG, PNG (1x/2x/4x), WebGL Shader, JSON, and MP4 video recorder.
- **Step 6: Packaging, Verification & Documentation**
  - Export `ThemeStudio` and `PaletteGenerator` in `package.json` and `src/lib/index.ts`.
  - Verify with `pnpm run check`, `pnpm run package`, and live testing in `acrolls/examples/kit-consumer`.

---

## 9. Validation Checklist

- [ ] All 21 generator engines render smoothly without lag or artifacts.
- [ ] Canvas pins and ring handles allow intuitive direct-manipulation repositioning.
- [ ] Palette generator correctly maps to the 9 semantic theme tokens.
- [ ] Color locking works flawlessly: locked colors do not change during randomization.
- [ ] Multi-band timeline rebalances gradient distribution interactively.
- [ ] All 70+ gallery presets load and render properly.
- [ ] Artisan color catalog searches and sorts accurately by hue/luminance.
- [ ] Export generates clean CSS, single-tab indented SASS, SVG, PNG, Shaders, and MP4 video.
- [ ] `svelte-check` reports 0 errors and 0 warnings.
- [ ] `fractalthemer` build and package export succeed without missing assets.
- [ ] Consumer project (`acrolls/examples/kit-consumer`) compiles and runs cleanly.
- [ ] User gives final receipt confirmation.
