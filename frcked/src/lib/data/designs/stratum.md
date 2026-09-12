---
version: "alpha"
name: "Stratum - System Coordination Framework"
description: "Stratum System Feature Section is designed for highlighting product capabilities and value points. Key features include reusable structure, responsive behavior, and production-ready presentation. It is suitable for component libraries and responsive product interfaces."
colors:
  primary: "#A3907A"
  secondary: "#8C8273"
  tertiary: "#A1AE7A"
  neutral: "#7A756D"
  background: "#EAE5DF"
  surface: "#A3907A"
  text-primary: "#8C8273"
  text-secondary: "#7A756D"
  border: "#EAE5DF"
  accent: "#A3907A"
typography:
  display-lg:
    fontFamily: "Inter"
    fontSize: "96px"
    fontWeight: 200
    lineHeight: "96px"
    letterSpacing: "-0.025em"
    textTransform: "uppercase"
  body-md:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 200
    lineHeight: "16px"
  label-md:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 300
    lineHeight: "20px"
rounded:
  md: "5px"
spacing:
  base: "4px"
  sm: "1px"
  md: "4px"
  lg: "8px"
  xl: "10px"
  gap: "6px"
  card-padding: "8px"
  section-padding: "24px"
components:
  button-primary:
    textColor: "#2C2C2A"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "14px"
  button-link:
    textColor: "{colors.secondary}"
    rounded: "0px"
    padding: "0px"
  card:
    rounded: "{rounded.md}"
    padding: "16px"
---

## Overview

The Stratum System is built upon a "Calculated Skeuomorphism" aesthetic, merging high-fidelity physical realism with decentralized data architecture. The design philosophy centers on architectural stability, using rigid, heavy-bezel containers and subtle noise textures to ground abstract technical data. The mood is precise, clinical, and tactile, relying on soft ambient glows and micro-hairline grids to establish a sense of spatial volume.

- **Mood:** Preserve a stratum, system, upon, calculated, skeuomorphism, aesthetic tone rather than defaulting to a generic SaaS look.

- **Composition cues:**
  - Layout: Grid
  - Content Width: Full Bleed
  - Framing: Glassy
  - Grid: Strong

## Colors

The color system uses light mode with #A3907A as the main accent and #7A756D as the neutral foundation.

- **Primary (#A3907A):** Main accent and emphasis color.
- **Secondary (#8C8273):** Supporting accent for secondary emphasis.
- **Tertiary (#A1AE7A):** Reserved accent for supporting contrast moments.
- **Neutral (#7A756D):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #EAE5DF; Surface: #A3907A; Text Primary: #8C8273; Text Secondary: #7A756D; Border: #EAE5DF; Accent: #A3907A

- **Gradients:** bg-gradient-to-b from-[#ffffff] to-[#DCD6CC], bg-gradient-to-b from-[#ffffff] to-[#EAE5DF], bg-gradient-to-b from-[#FDFBF7] to-[#F5F2EB], hover:bg-gradient-to-r hover:from-black/[0.02] hover:to-transparent

## Typography

Typography relies on Inter across display, body, and utility text.

- **Display (`display-lg`):** Inter, 96px, weight 200, line-height 96px, letter-spacing -0.025em, uppercase.
- **Body (`body-md`):** Inter, 12px, weight 200, line-height 16px.
- **Labels (`label-md`):** Inter, 14px, weight 300, line-height 20px.

## Layout

*   **Grid Logic:** A centralized, max-width (7xl) container creates a professional, focused atmosphere. The layout features a primary vertical spine with hairline border dividers.
*   **Section Rhythm:** Spacing is generous, characterized by large top-padding (20-28 units) for the hero and consistent 6-10 unit gaps between structural elements.
*   **Content Density:** Data tables are horizontally scrollable on mobile but utilize an 8-column flexible grid system to align header items with tabular content.
*   **Bezel Pattern:** A "double-bezel" system wraps primary containers: an outer 1px gradient stroke combined with an inner, soft-inset shadow to simulate physical hardware thickness.

Treat the page as a grid / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Full Bleed
- **Base unit:** 4px
- **Scale:** 1px, 4px, 8px, 10px, 12px, 14px, 16px, 20px
- **Section padding:** 24px, 56px
- **Card padding:** 8px, 12px, 16px, 18px
- **Gaps:** 6px, 8px, 12px, 16px

## Elevation & Depth

*   **Surface Recipe:** Surfaces are defined by custom gradient fills (e.g., `bg-gradient-to-b from-[#FDFBF7] to-[#EAE5DF]`) paired with `backdrop-blur-md`.
*   **Shadow Strategy:** A dual-shadow system is mandatory: a subtle, outer drop-shadow for volume (`rgba(0,0,0,0.08)`) and a sharp, white inset-shadow (`inset 0 1px 0 white`) to mimic pressed metal or glass edges.
*   **Blur & Glow:** Large-scale radial gradients with heavy blur (`180px`) are reserved for background aura, while `backdrop-blur-md` is used exclusively for floating components to separate them from the base plane.

*   **Radius Hierarchy:** Elements adopt a small-scale, crisp radius. Buttons use `5px`, cards use `7px` to `11px`, and large interface bezels use `15px`.
*   **Silhouette Discipline:** Hard, sharp corners are avoided in favor of "squircle-adjacent" rounded corners that prevent visual fatigue without losing structural rigidity.
*   **Icon Geometry:** Iconography must be thin-stroke (1.5px) and linear, often paired with `drop-shadow(0 1px 0 white)` to ensure they feel physically engraved onto the interface surface.

*   **Floating Anchors:** Depth-aware data containers that utilize pulse-animations (`animate-ping`) and inset-border styling to signal live status updates.
*   **Skeuo-Buttons:** Heavy, multi-layered button structures that combine a `p-[1px]` wrapper for the highlight border with an inner `shadow-[inset_0_1px_0_white]` to create a "pushed-in" physical feel.
*   **Data Rows:** High-density rows that use hover-state gradients (transparent to low-opacity black) to reveal depth without requiring intrusive highlight colors.
*   **Navigation Dock:** A singular, fixed bottom-anchor component utilizing `backdrop-blur-xl` and a complex stack of shadows to appear detached and "floating" above the base layer.

Surfaces should read as glass first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Glass
- **Borders:** 1px #EAE5DF; 1px #DCD6CC
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgb(255, 255, 255) 0px 1px 0px 0px inset; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.2) 0px 1px 2px 0px inset
- **Blur:** 12px, 24px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 1px padding and a 6px radius. Drive the shell with linear-gradient(rgb(255, 255, 255), rgb(253, 251, 247), rgb(220, 214, 204)) so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 2px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 2px, 3px, 4px, 5px, 6px, 8px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Anchor interactions to the detected button styles. Reuse the existing card surface recipe for content blocks.

### Buttons
- **Primary:** text #2C2C2A, radius 5px, padding 14px, border 0px solid rgb(229, 231, 235).
- **Links:** text #8C8273, radius 0px, padding 0px, border 0px solid rgb(229, 231, 235).

### Cards and Surfaces
- **Card surface:** border 0px solid rgb(229, 231, 235), radius 5px, padding 16px, shadow rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgb(255, 255, 255) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.02) 0px -1px 1px 0px inset, blur 12px.

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 4px rhythm.
- Do reuse the Glass surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 2px, 3px, 4px, 5px, 6px, 8px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected moderate motion intensity without a deliberate reason.

## Motion

*   **Hover States:** Button hover effects must utilize `transition-colors duration-300` and `group-hover:translate-x-1` for icons to create a sense of tactile mechanical movement. *   **System Reveal:** Use gradual opacity fades and gentle slide-ins for component rows to imply loading of a heavy system. *   **Interaction:** All transitions (hover, focus, load) should favor linear or ease-in-out timing functions to mirror the rigidity of physical controls rather than the elasticity of modern digital interfaces.

**Motion Level:** moderate

**Durations:** 150ms, 300ms, 1000ms

**Easings:** ease, 0, 0.2, 1), cubic-bezier(0.4, cubic-bezier(0

**Hover Patterns:** color, text, shadow