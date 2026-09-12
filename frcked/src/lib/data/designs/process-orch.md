---
version: "alpha"
name: "Process Orchestration Hero"
description: "Process Orchestration Hero Section is designed for introducing a product with clear above-the-fold messaging. Key features include headline hierarchy, supporting copy, and a primary call-to-action. It is suitable for homepage hero areas and campaign landing pages."
colors:
  primary: "#22C55E"
  secondary: "#4ADE80"
  tertiary: "#BBF7D0"
  neutral: "#F7F7F4"
  background: "#F7F7F4"
  surface: "#1A1A1A"
  text-primary: "#1A1A1A"
  text-secondary: "#666666"
  border: "#E5E5DF"
  accent: "#22C55E"
typography:
  display-lg:
    fontFamily: "System Font"
    fontSize: "60px"
    fontWeight: 400
    lineHeight: "60px"
    letterSpacing: "-0.025em"
  body-md:
    fontFamily: "System Font"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "19.5px"
  label-md:
    fontFamily: "System Font"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
rounded:
  md: "2px"
spacing:
  base: "4px"
  sm: "1px"
  md: "2px"
  lg: "4px"
  xl: "6px"
  gap: "4px"
  card-padding: "8px"
  section-padding: "24px"
components:
  button-primary:
    backgroundColor: "#DCFCE7"
    textColor: "#166534"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "6px"
  card:
    rounded: "0px"
    padding: "24px"
---

## Overview

- **Composition cues:**
  - Layout: Grid
  - Content Width: Full Bleed
  - Framing: Open
  - Grid: Strong

## Colors

The color system uses dark mode with #22C55E as the main accent and #F7F7F4 as the neutral foundation.

- **Primary (#22C55E):** Main accent and emphasis color.
- **Secondary (#4ADE80):** Supporting accent for secondary emphasis.
- **Tertiary (#BBF7D0):** Reserved accent for supporting contrast moments.
- **Neutral (#F7F7F4):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #F7F7F4; Surface: #1A1A1A; Text Primary: #1A1A1A; Text Secondary: #666666; Border: #E5E5DF; Accent: #22C55E

## Typography

Typography relies on System Font across display, body, and utility text.

- **Display (`display-lg`):** System Font, 60px, weight 400, line-height 60px, letter-spacing -0.025em.
- **Body (`body-md`):** System Font, 12px, weight 400, line-height 19.5px.
- **Labels (`label-md`):** System Font, 12px, weight 500, line-height 16px.

## Layout

Layout follows a grid composition with reusable spacing tokens. Preserve the grid, full bleed structural frame before changing ornament or component styling. Use 4px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a grid / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Full Bleed
- **Base unit:** 4px
- **Scale:** 1px, 2px, 4px, 6px, 8px, 12px, 15px, 16px
- **Section padding:** 24px, 128px
- **Card padding:** 8px, 9px, 12px, 16px
- **Gaps:** 4px, 8px, 12px, 16px

## Elevation & Depth

Depth is communicated through elevated, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as elevated first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Elevated
- **Borders:** 1px #E5E5DF; 1px #000000; 1px #22C55E; 1px #BBF7D0
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.25) 0px 25px 50px -12px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 1px padding and a 4px radius. Drive the shell with linear-gradient(rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%) so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 2px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 2px, 3px, 4px, 9999px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Anchor interactions to the detected button styles. Reuse the existing card surface recipe for content blocks.

### Buttons
- **Primary:** background #DCFCE7, text #166534, radius 2px, padding 6px, border 0px solid rgb(229, 231, 235).

### Cards and Surfaces
- **Card surface:** radius 0px, padding 24px, shadow none.
- **Card surface:** background #F7F7F4, border 0px solid rgb(229, 231, 235), radius 0px, padding 24px, shadow none.
- **Card surface:** background #0A0F19, border 0px solid rgb(229, 231, 235), radius 3px, padding 12px, shadow none.

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 4px rhythm.
- Do reuse the Elevated surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 2px, 3px, 4px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected minimal motion intensity without a deliberate reason.

## Motion

Motion stays restrained and interface-led across text, layout, and scroll transitions. Timing clusters around 150ms. Easing favors ease and cubic-bezier(0.4. Hover behavior focuses on color changes. Scroll choreography uses GSAP ScrollTrigger for section reveals and pacing.

**Motion Level:** minimal

**Durations:** 150ms

**Easings:** ease, cubic-bezier(0.4, 0, 0.2, 1)

**Hover Patterns:** color

**Scroll Patterns:** gsap-scrolltrigger

## WebGL

Reconstruct the graphics as a full-bleed background field using webgl, custom shaders. The effect should read as technical and atmospheric: fluid wave field with soft amber and sparse spacing. Build it from shader field so the effect reads clearly. Animate it as soft wave motion. Interaction can react to the pointer, but only as a subtle drift. Preserve reduced motion + dom fallback.

**Id:** webgl

**Label:** WebGL

**Stack:** WebGL

**Insights:**
  - **Scene:**
    - **Value:** Full-bleed background field
  - **Effect:**
    - **Value:** Fluid wave field
  - **Primitives:**
    - **Value:** Shader field
  - **Motion:**
    - **Value:** Soft wave motion
  - **Interaction:**
    - **Value:** Pointer-reactive drift
  - **Render:**
    - **Value:** WebGL, custom shaders

**Techniques:** Wave deformation, Pointer parallax, Shader gradients, Noise fields, DOM fallback

**Code Evidence:**
  - **HTML reference:**
    - **Language:** html
    - **Snippet:**
      ```html
      <!-- WebGL Background Canvas -->
      <canvas id="webgl-canvas" class="absolute inset-0 w-full h-full z-0 opacity-40 mix-blend-multiply" style="pointer-events: none;"></canvas>

      <!-- Main Application Container -->
      ```