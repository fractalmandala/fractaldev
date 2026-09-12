# Component index

The catalogue is grouped by purpose and is available from the live sidebar and the `components` export in [`src/lib/docs/catalogue.ts`](../../src/lib/docs/catalogue.ts). Every entry has a live preview, usage example, and props table at `/components/<slug>`.

## Core components

Actions include `Button` and `AnimatedButton`. Inputs include `Input`, `Textarea`, `Checkbox`, `Switch`, and `Select`. Feedback includes `Badge`, `Alert`, `Progress`, `Skeleton`, and `Toast`. Layout includes `Card`, `Avatar`, `Accordion`, `Tabs`, `Separator`, `Carousel`, and `Stepper`. Overlay includes `Dialog` and `Tooltip`. `Theme` is the layout-neutral foundation wrapper, and `ThemeSetter` is the optional appearance drawer used by the docs shell.

## Motion components

Motion primitives include `AnimatedCard`, `Reveal`, `MotionList`, `Presence`, `Magnetic`, `TextLoop`, `Marquee`, `Counter`, and the lower-level `BitsEffect` adapter. These use Svelte Motion and share the reduced-motion policy documented in [Motion](17-motion.md).

## Motion Core and SvelteBits equivalents

The catalogue also exposes the Sass-first equivalents for the Motion Core and SvelteBits patterns. They are implemented through `MotionCore`, `BitsEffect`, OGL, and Svelte Motion while keeping the public styling contract independent of the source library’s colours or CSS.

Use the live catalogue rather than this summary for the complete current list; the catalogue is intentionally data-driven so new patterns appear in navigation and documentation together. Every exported component, including pattern aliases and the two appearance components, has a page at `/components/<slug>`.

### Motion Core pattern exports

The Motion Core equivalents are exported as named Svelte components. Canvas names use the shared OGL surface; motion, navigation, showcase, and typography names use the shared Svelte Motion adapter.

`AsciiRenderer`, `Card3D`, `DitheredImage`, `Fake3DImage`, `FluidImageReveal`, `FluidSimulation`, `GlassLogo`, `GlassPane`, `GlassSlideshow`, `GlitterCloth`, `Globe`, `GodRays`, `Halo`, `InfiniteGallery`, `InteractiveGrid`, `LavaLamp`, `LiquidMetal`, `NeuralNoise`, `PixelatedImage`, `PlasmaGrid`, `RubiksCube`, `SpecularBand`, `WaterRipple`, `WatercolorImage`, `CardStack`, `FlipCardStack`, `FlipGrid`, `FloatingMenu`, `ImageTrail`, `InfinitePhysicsGallery`, `LogoCarousel`, `MacosDock`, `Preloader`, `RadialGallery`, `Slideshow`, `SplitHover`, `SplitReveal`, `StackingWords`, `TextRepel`, `TextScramble`, `UnderlayNavigation`, `VideoPlayer`, and `WeightWave`.

### SvelteBits pattern exports

Each SvelteBits name is a named alias of `BitsEffect`. Pass its documented `pattern` slug and the matching `category` (`animation`, `background`, `component`, or `text`). The complete names are:

- Animation: `AnimatedContent`, `Antigravity`, `BlobCursor`, `ClickSpark`, `Crosshair`, `Cubes`, `CursorGrid`, `ElectricBorder`, `FadeContent`, `GhostCursor`, `GlareHover`, `GradualBlur`, `LaserFlow`, `LogoLoop`, `MagicRings`, `Magnet`, `MagnetLines`, `MetaBalls`, `MetallicPaint`, `Noise`, `OrbitImages`, `PixelTrail`, `PixelTransition`, `Ribbons`, `ShapeBlur`, `SplashCursor`, `StarBorder`, `StickerPeel`, `TargetCursor`.
- Background: `Aurora`, `Balatro`, `Ballpit`, `Beams`, `ColorBends`, `DarkVeil`, `Dither`, `DotField`, `DotGrid`, `EvilEye`, `FaultyTerminal`, `FloatingLines`, `Galaxy`, `GradientBlinds`, `Grainient`, `GridDistortion`, `GridMotion`, `GridScan`, `Hyperspeed`, `Iridescence`, `LetterGlitch`, `LightPillar`, `LightRays`, `Lightning`, `LineWaves`, `LiquidChrome`, `LiquidEther`, `Orb`, `Particles`, `PixelBlast`, `PixelSnow`, `Plasma`, `PlasmaWave`, `Prism`, `PrismaticBurst`, `Radar`, `RippleGrid`, `ShapeGrid`, `Silk`, `SoftAurora`, `Threads`, `Waves`.
- Component: `AnimatedList`, `BorderGlow`, `BounceCards`, `BubbleMenu`, `CardNav`, `CardSwap`, `ChromaGrid`, `CircularGallery`, `DecayCard`, `Dock`, `DomeGallery`, `ElasticSlider`, `FlowingMenu`, `FlyingPosters`, `Folder`, `GlassIcons`, `GlassSurface`, `GooeyNav`, `InfiniteMenu`, `MagicBento`, `Masonry`, `ModelViewer`, `PillNav`, `PixelCard`, `ProfileCard`, `ReflectiveCard`, `ScrollStack`, `SpotlightCard`, `Stack`, `StaggeredMenu`, `TiltedCard`.
- Text: `ASCIIText`, `BlurText`, `CircularText`, `CountUp`, `CurvedLoop`, `DecryptedText`, `FallingText`, `FuzzyText`, `GlitchText`, `GradientText`, `RotatingText`, `ScrambledText`, `ScrollFloat`, `ScrollReveal`, `ScrollVelocity`, `ShinyText`, `Shuffle`, `SplitText`, `TextCursor`, `TextPressure`, `TextType`, `TrueFocus`, `VariableProximity`.

## Selecting a component

Choose native controls for form semantics, `Card` and layout primitives for structure, `Theme` for scoped visual language, and motion/canvas components only where movement or visual texture communicates something useful.
