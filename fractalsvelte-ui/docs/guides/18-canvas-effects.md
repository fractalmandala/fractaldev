# Canvas and visual effects

The Motion Core and SvelteBits equivalents include OGL-backed and canvas-oriented visual treatments. They are decorative foundations, not a replacement for semantic content.

## Canvas component API

The named Motion Core canvas exports (`AsciiRenderer`, `Card3D`, `DitheredImage`, `Fake3DImage`, `FluidImageReveal`, `FluidSimulation`, `GlassLogo`, `GlassPane`, `GlassSlideshow`, `GlitterCloth`, `Globe`, `GodRays`, `Halo`, `InfiniteGallery`, `InteractiveGrid`, `LavaLamp`, `LiquidMetal`, `NeuralNoise`, `PixelatedImage`, `PlasmaGrid`, `RubiksCube`, `SpecularBand`, `WaterRipple`, and `WatercolorImage`) share these optional props:

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `items` | `string[]` | `['Explore', 'Compose', 'Share']` | Optional labels used when the effect composes supporting content. |
| `text` | `string` | `'Motion that belongs to your interface'` | Optional text passed to text-aware compositions. |
| `label` | `string` | Generated component label | Accessible name for the canvas; omit or replace it when the effect is decorative. |

The SvelteBits background aliases use the same underlying adapter but additionally require `pattern` and `category="background"` when you call `BitsEffect` directly. Named aliases set their pattern and category in the catalogue usage example.

## Runtime requirements

Canvas effects need a browser viewport and should be mounted in a client-safe component. Give the surface a defined size, provide a meaningful `label` only when the effect conveys information, and mark purely decorative effects as hidden from assistive technology.

The repository currently lists OGL and MediaPipe Tasks Vision as runtime dependencies. Applications that do not use those effects should keep them out of their own entry path where possible. Set a non-zero height on the host element; the renderer measures its bounding box and resizes the WebGL canvas with a `ResizeObserver`.

## Composition rules

Place effects behind readable content, use the raw theme tokens for surrounding surfaces, and test over plain and patterned backgrounds. Avoid coupling an effect to a fixed colour palette; use the active theme or explicit component inputs.

## Failure behavior

The content must remain useful if WebGL is unavailable, the canvas is hidden, or the user requests reduced motion. Provide a static surface or a normal semantic component as the fallback.
