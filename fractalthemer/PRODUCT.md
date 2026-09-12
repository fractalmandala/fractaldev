# Gradient Studio & Atmospheric Shader Engine Specification

## Summary

A comprehensive, interactive gradient creation studio and runtime shader engine for `fractalthemer` that allows developers and designers to visually compose, customize, and export 9 distinct generator paradigms (Flow, Mesh, Aurora, Bars, Lines, Stripes, Blocks, Radial/Conic, and Scenes). The builder provides direct canvas manipulation via draggable color spots and mesh pins, live multi-band timeline distribution, contrast accessibility verification, curated artisan palette exploration, and multi-target code and asset export (CSS, SVG, PNG, WebGL shaders, Tailwind, and animated MP4 video).

---

## Problem

Modern web interfaces increasingly demand organic, atmospheric visual identities (auras, fluid mesh fields, generative soundwaves, and refractive geometry). However, crafting multi-layer GPU blend shaders and complex SVG/CSS gradients by hand is tedious, error-prone, and disconnected from accessibility contrast requirements. Developers need a unified, visual studio to explore, compose, calibrate, and export production-ready gradients directly within the `fractalthemer` ecosystem.

---

## Goals / Non-goals

### Goals
- Deliver a unified 5-view surface: **Studio** (interactive generator workspace), **Gallery** (categorized preset browser), **Palette** (curated artisan color library with WCAG contrast ratings), **Saved** (persistent local workspace), and **What's New** (changelog).
- Support 9 distinct generator engines covering fluid fields, atmospheric rays, geometric meshes, procedural soundwaves, and isometric scene patterns.
- Provide direct-manipulation canvas ergonomics (draggable color pins, ring reach handles, live viewport typography preview, and real-time contrast auditing).
- Provide multi-band timeline controls for fine-tuning color stop reach, spread, softening blurs, and dithered noise finishes.
- Export clean, production-ready assets and code across CSS, SVG, WebGL shaders, PNG images, Tailwind configs, and animated MP4 video recordings.

### Non-goals
- Replacing external full-suite vector graphic illustration editors (e.g. Figma or Illustrator).
- Requiring an active internet connection or backend server (all generation, rendering, and persistence run client-side in the browser).

---

## Behavior

### 1. Navigation & Top-Level Modes

1. The studio header provides 5 primary navigation tabs: **Studio**, **Gallery**, **Palette**, **Saved**, and **What's new**, accompanied by a global theme toggle (Light/Dark mode) and a quick search trigger.
2. Clicking **Studio** opens the primary generation workbench with the live interactive canvas, parameter sidebar, and floating control toolbar.
3. Clicking **Gallery** opens a categorized grid of curated gradient studies with live animated preview cards, search filters, and one-click studio loading.
4. Clicking **Palette** displays a searchable artisan color catalog with WCAG contrast rating badges, category filters, and sorting mechanisms.
5. Clicking **Saved** displays user-created and favorited gradient recipes stored in browser `localStorage`.
6. Clicking **What's new** displays a chronological timeline of engine enhancements, new generator types, and export features.
7. The active view indicator smoothly transitions between tabs without reloading or causing layout shift.

---

### 2. Studio: Layout & Canvas Workspace

1. The Studio interface is divided into three coordinated areas:
   - **Left Control Panel**: A floating, collapsible glassmorphic sidebar housing engine selectors, parameter sliders, preset buttons, and color swatch lists.
   - **Central Live Canvas**: A full-bleed interactive viewport rendering the active gradient in real-time, overlaid with interactive manipulation pins and live sample typography.
   - **Bottom Floating Action Bar**: A pill bar displaying the current blend title, engine category, distribution grabber bar, and quick action buttons (Reset, Save, Share, Preview, Export).
2. The canvas renders sample preview text centered in the viewport (e.g. *"Tranquil"*, *"Room to rise"*, *"Stay Feral"*) using high-legibility typography to demonstrate real-world readability.
3. Top canvas utility toggles allow the user to:
   - **Hide / Show Tags**: Toggle visibility of canvas color pin tags and labels.
   - **Contrast Check**: Overlay an accessibility heatmap showing where foreground text maintains WCAG AAA (≥7:1) and AA (≥4.5:1) compliance against the dynamic background.
4. Clicking anywhere on the canvas background outside active control pins allows pan and zoom navigation in supported engines.

---

### 3. Studio: The 9 Generator Engines

The user can switch between 9 distinct generator paradigms via the primary engine dropdown or segmented buttons:

#### 3.1. Flow (Fluid Organic Field)
1. Generates continuous organic fluid blends with customizable color spot emitters.
2. The canvas displays draggable color spot pins. Dragging a pin updates the spatial origin `(x, y)` of that color emitter in real time.
3. Each pin features an outer ring handle; dragging the ring adjusts the radial reach and falloff radius of that specific color.
4. Parameters:
   - `Scale` slider (10% to 100%): Controls the zoom level and wave density of the fluid simulation.
   - `Distortion` slider (0% to 100%): Controls turbulence, swirl magnitude, and liquid warping.
5. Flow presets: *Spring Celadon, Minted Bamboo, Deep Sea, Solar Flare, Orchid, Peach Glow, Electric Violet, Rose Gold*.

#### 3.2. Aurora (Atmospheric Light Curtains)
1. Generates vertical shimmering atmospheric rays simulating the Northern Lights with multi-stage wave blend layers.
2. Parameters:
   - `Lights` slider (0% to 100%): Controls light beam intensity and emission brightness.
   - `Fold` slider (0% to 100%): Controls ray folding, crease frequency, and curtain pleating.
   - `Drift` slider (0% to 100%): Controls horizontal atmospheric drift velocity.
   - `Spread` slider (0% to 100%): Controls vertical ray dispersion and crown height.
   - `Direction` toggle (`Up`, `Right`, `Down`, `Left`): Sets the primary emission trajectory of the light rays.
3. Aurora presets: *Northern lights, Polar dawn, Solar flare, Emerald rays, Ice storm, Ghost light*.

#### 3.3. Mesh (Interactive Delaunay & Bezier Grid)
1. Generates smooth multi-point interpolated color mesh grids.
2. The canvas renders a network of draggable mesh points. Dragging any point dynamically warps the color gradient curves and blend transitions.
3. Mesh actions:
   - `Shuffle`: Randomizes point positions across the canvas while preserving selected colors.
   - `Reset`: Realigns mesh points to a uniform geometric grid.
4. Mesh presets: *Wisteria haze, Coral dream, Matcha air, Peach smoke, Deep sea*.

#### 3.4. Bars (Soundwave & Geometric Equalizer)
1. Generates vertical or horizontal stepped equalizer bars with gradient color progression.
2. Parameters:
   - `Envelope` selector (`Curve`, `Flat`, `Ramp`): Modulates the bar height distribution algorithm across the spectrum.
   - `Count` slider (2 to 64): Adjusts the total number of rendered bars.
   - `Spread` slider (-100% to +100%): Controls the bar gap, density, and spatial distribution.
   - `Speed` slider (0% to 100%): Controls procedural wave animation speed.
3. Interactive Canvas Grabbers: Dragging grabber handles on each bar directly modifies that specific color segment's height on the canvas.
4. Bars presets: *Soundwave, Red alert, Reverb, Pulse, Level, Mono wave*.

#### 3.5. Lines (Flowing Gradient Tubes & SVG Silhouettes)
1. Generates flowing dimensional ribbon tubes and vector silhouette paths with smooth gradient fills.
2. Supports loading vector paths directly from SVG strings or built-in silhouette presets.
3. Line arrangements: *Flow, Tubes, Ribbon, Weave, Candy, Wave*.
4. Parameters: `Thickness`, `Tension`, `Path Complexity`, and `Flow Speed`.

#### 3.6. Stripes & Columns (Prismatic Light Sweeps)
1. Generates vertical, horizontal, or angled optical spectrum bands with prismatic dispersion.
2. Parameters: `Band Count`, `Prism Speed`, `Angle (0° to 360°)`, and `Refraction Blur`.
3. Presets: *Ultraviolet, Festival, Ice pillars, Peacock, Neon dusk*.

#### 3.7. Blocks & Hive (Geometric Mosaic & Cell Fields)
1. Generates structured polygonal, honeycomb, mosaic, and modular grid cells.
2. Styles: `Hive` (hexagonal honeycomb cells) and `Mosaic` (rectangular tiled brick grid).
3. Parameters:
   - `Cell Size` slider (10% to 100%): Controls the grid cell dimensions.
   - `Steps` slider (2 to 16): Controls color quantizing and stair-step transitions.
   - `Edge Softness` slider (0% to 100%): Controls bevel blur and cell outline contrast.
4. Presets: *Honeycomb, Beehive, Coral comb, Jade comb*.

#### 3.8. Rings & Radial / Conic (Concentric & Angular Sweeps)
1. Generates concentric circular ripples, stepped acoustic rings, or 360° angular conic gradient sweeps.
2. Parameters: `Origin X/Y`, `Ring Count`, `Exponential Decay`, and `Conic Angle`.
3. Presets: *Moonlight, Rising sun, Cherry orb, Lapis light*.

#### 3.9. Scenes & Mist (Atmospheric Skyline & Fog)
1. Generates layered landscape silhouettes, atmospheric fog banks, and horizon mist.
2. Parameters: `Mist Density`, `Layer Depth`, `Horizon Height`, and `Turbulence`.
3. Presets: *Glint, Mist, Skyline, Dawn horizon*.

---

### 4. Studio: Color Palette & Swatch Management

1. **Color Stop List**: The sidebar lists all active colors for the current gradient. Each entry displays:
   - Color swatch dot with live color fill.
   - Artisan Japanese/designer color name (e.g. *Inked Lapis, Glazed Azure, Young Willow, Pine Leaf*).
   - Hex code string (e.g. `#08324f`).
   - WCAG contrast indicator badge against current canvas background (`AAA`, `AA`, or fail warning).
   - Reorder drag handle to rearrange color sequence.
   - Delete button (`✕`) to remove the stop (disabled when minimum stops reached).
2. **Adding Colors**: Clicking `+ Add colour` appends a new harmonious color stop to the palette and introduces a new emitter pin onto the canvas.
3. **Color Picker Modal**: Clicking any swatch opens a modal containing:
   - Artisan palette tabs: `Custom`, `All`, `Grey`, `Red`, `Yellow`, `Green`, `Blue`, `Purple`, `Brown`.
   - Grid of curated shade chips with instant preview on hover.
   - Hex text input, RGB sliders, and eyedropper tool.
4. **Color Actions**:
   - `Shuffle`: Randomizes active colors using harmonious color-theory algorithms (analogous, complementary, triadic, monochromatic).
   - `Reset`: Restores default colors for the current engine preset.

---

### 5. Studio: Finish Controls (Soften & Noise)

1. **Soften Slider (0px to 100px)**:
   - Controls the global Gaussian blur and blend smoothing applied to layers.
   - Increases optical depth and liquid dissipation without clipping container bounds.
2. **Noise / Dither Slider (0% to 20%)**:
   - Injects a fine procedural grain texture overlay.
   - Eliminates CSS 8-bit color banding and digital step artifacts on subtle gradient transitions.

---

### 6. Studio: Multi-Band Distribution Timeline Bar

1. A horizontal multi-band slider is docked at the bottom of the canvas.
2. The bar visually displays the relative segment width and spatial reach for each color stop.
3. The user can drag divider handles along the bar to rebalance color influence across the gradient in real time.
4. Clicking directly on any colored segment highlights the corresponding pin and swatch in the sidebar.

---

### 7. Studio: Actions Bar (Save, Share, Preview, Export)

1. **Title & Engine Display**: Displays the current editable blend name (e.g. *Soundwave • Bars*) with inline rename capability.
2. **Reset (`✕`)**: Reverts all modifications back to the default preset state with a single click.
3. **Save**:
   - Persists the current recipe (all parameters, colors, engine type, and metadata) to `localStorage`.
   - Adds an entry into the **Saved** view.
   - Displays a success confirmation toast.
4. **Share**:
   - Encodes all active gradient parameters into a shareable URL hash or compressed query string.
   - Automatically copies the URL to the user's clipboard and displays a feedback toast.
   - Opening a shared link restores the exact gradient state instantly.
5. **Preview**:
   - Toggles full-screen distraction-free mode, hiding all sidebars, toolbars, and canvas pins.
   - Pressing `Escape` or clicking anywhere exits preview mode.
6. **Export Modal**: Clicking **Export** opens a dialog with multi-format generation tabs:
   - **CSS**: Pure vanilla CSS (`background: linear-gradient(...)` / `radial-gradient(...)` / multi-layer `@keyframes` animation code). Includes copy button.
   - **SVG**: Scalable vector markup containing embedded `<defs>` linear/radial gradient tags and filters. Includes direct download (`.svg`) and copy markup.
   - **PNG**: High-resolution raster image snapshot (1x, 2x, 4x retina scale) with instant download.
   - **Shader (GLSL/WebGL)**: Fragment shader code compatible with Three.js, raw WebGL, or Canvas2D context.
   - **Tailwind**: Clean `tailwind.config.js` theme background extension snippet.
   - **MP4 Video Recording**:
     - Generates an animated video loop of the gradient motion.
     - Offers quality settings (*Fast clip*, *High-res 60fps*, *Lossless 4K*).
     - Renders using client-side WebCodecs / MediaRecorder and exports a `.mp4` file.

---

### 8. Gallery View Behavior

1. Displays a responsive grid of preset cards representing diverse gradient styles.
2. Top filter pills categorize the gallery: `All`, `Linear`, `iOS`, `Radial`, `Conic`, `Mesh`, `Flow`, `Retro`, `Stripes`, `Blocks`, `Arch`, `Waves`, `Rings`, `Pixel`, `Dark`, `Light`, `Mono`.
3. Each card displays:
   - Live animated gradient thumbnail.
   - Preset title (e.g. *Wisteria night, Hanada sky, Celadon water, Sunset on the port*).
   - Engine type badge (`Mesh`, `Flow`, `Waves`, `Arch`, `Linear`, etc.).
   - Color swatch dots indicating component palette colors.
   - Favorite heart button to quickly save to the user's library.
4. Clicking any card immediately opens it in the **Studio** with all parameters loaded for editing.

---

### 9. Palette View Behavior

1. Displays the comprehensive artisan color reference library.
2. Top search bar filters colors by name (e.g. *"Celadon"*, *"Willow"*, *"Lapis"*) or hex substring in real time.
3. Category filter chips: `All`, `Grey`, `Red`, `Yellow`, `Green`, `Blue`, `Purple`, `Brown`.
4. Sorting controls:
   - `Hue`: Orders swatches by chromatic spectral hue.
   - `Light to dark`: Orders swatches by luminance descending.
   - `Dark to light`: Orders swatches by luminance ascending.
5. Each color card displays:
   - Colored swatch block.
   - Artisan name in English (e.g. *Spring Celadon, Young Willow, Pine Leaf, Black Moss*).
   - Hex code string.
   - WCAG contrast compliance badge (`AAA`, `AA`).
6. Clicking any color copies its hex code to the clipboard and shows a confirmation toast.

---

### 10. Saved View Behavior

1. Displays all custom gradients created or favorited by the user.
2. If no items are saved, renders an empty state illustration with a button linking to the Studio: *"No saved blends yet. Save blends from the studio or the gallery and they'll wait here."*
3. Each card includes options to:
   - Open and edit in Studio.
   - Rename preset.
   - Delete from saved storage.
   - Export directly.

---

### 11. Keyboard, Accessibility & Performance Invariants

1. **Zero-Lag Slider Interactivity**: All slider parameter adjustments (scale, distortion, noise, soften, spread) update the canvas at a steady 60fps using `requestAnimationFrame` and CSS GPU composition.
2. **Keyboard Accessibility**:
   - `Escape`: Closes open modals, color pickers, and exits preview mode.
   - `Arrow Keys` (when canvas pin is focused): Nudges pin coordinates in 1% increments (`Shift + Arrow` for 5% increments).
   - `Space`: Toggles preview mode.
3. **Storage Invariants**: All modifications to saved presets and active working session survive browser reloads via `localStorage` synchronization.
4. **Offline Capability**: The studio is 100% functional offline with zero network requests required for generation, rendering, or export.

---

### 12. Runtime Integration Contract (fractalthemer core)

The studio is a design surface for the same backdrop families the runtime ships. Its integration with the `themeState` runtime obeys the following contract:

1. **Backdrop Activation**: Applying a studio creation to the app maps onto `themeState` — `setBgStyle('gradient' | 'pattern')` plus the corresponding preset registration in `data/gradients.ts` / `data/patterns.ts`. The studio never mutates the DOM directly.
2. **Glass Regime Awareness**: Under any vivid backdrop (`aura` / `gradient` / `pattern`), the runtime re-emits every `-bg-*` token as a translucent `color-mix` and auto-frosts app chrome (see `docs/architecture/03-tokens-and-css-contract.md` §6). Studio canvas contrast checks must therefore evaluate sample typography against the composite backdrop, not against an opaque token value.
3. **Custom Accent Respect**: Studio previews render accents through `--theme-color` / `--theme-color-alt` so the persistent custom accent layer (`localStorage`: `useCustomAccent`, `customAccentColor`, `customAccentAltColor`) remains authoritative inside the studio.
4. **Storage Separation**: The studio's Saved view uses its own keys and never writes the runtime keys above except through an explicit "apply to app" action.
