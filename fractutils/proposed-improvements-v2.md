---
title: Fractalstyler2 Improvement Proposal v2
description: A holistic improvement proposal grounded in the fractal philosophy and informed by design system, accessibility, motion, typography, layout, and UI polish principles
type: fractalstyler2
---

# Fractalstyler2 Improvement Proposal v2

> *yathā piṇḍe tathā brahmāṇḍe | yathā brahmāṇḍe tathā piṇḍe*
> As above, so below, and vice versa.

This proposal is not a generic Sass audit. It reads the fractal philosophy as the ordering principle and evaluates whether each layer truly seeds the next — whether the same modularity that governs tokens also governs shells, whether the same legibility that governs class names also governs the source code itself.

The v1 proposal treated symptoms (property order, blank lines, magic numbers). This one treats causes: where a layer's internal logic leaks into the next, where a token should exist but doesn't, where the system's own opinions contradict its stated philosophy.

---

## Table of Contents

1. [The Fractal Audit Lens](#1-the-fractal-audit-lens)
2. [Token Contract Gaps](#2-token-contract-gaps)
3. [The Responsive Seam: Configurable but Opaque](#3-the-responsive-seam-configurable-but-opaque)
4. [Motion Language: Tokens Without a Grammar](#4-motion-language-tokens-without-a-grammar)
5. [Accessibility: Missing Primitives](#5-accessibility-missing-primitives)
6. [Typography: The Fluid Scale Has a Gap](#6-typography-the-fluid-scale-has-a-gap)
7. [Concentric Radius: The System Almost Does This](#7-concentric-radius-the-system-almost-does-this)
8. [The Shell Layer: Where Fractals Get Tangled](#8-the-shell-layer-where-fractals-get-tangled)
9. [Composition Primitives: What's Missing](#9-composition-primitives-whats-missing)
10. [The Preset Axes: Internal Consistency](#10-the-preset-axes-internal-consistency)
11. [Source Legibility: The Code Should Read Like the System](#11-source-legibility-the-code-should-read-like-the-system)
12. [The Build Pipeline: Autoprefixer and the Prefix Question](#12-the-build-pipeline-autoprefixer-and-the-prefix-question)
13. [Documentation as Fractal Mirror](#13-documentation-as-fractal-mirror)
14. [Implementation Priority](#14-implementation-priority)

---

## 1. The Fractal Audit Lens

The introduction states three opinions:

1. **Styling syntax should be human legible** — no `__`, `&__`, `> *` patterns
2. **Cognitive load should be minimal** — don't chase variables to find a value
3. **Maximum consistency, minimum opinionation** — the system ensures responsiveness, sizing, typography; the user owns color, fonts, configuration

Every improvement below is tested against these three opinions. If a change makes the system *less* legible, it's rejected regardless of how "best practice" it sounds. If it *reduces* the need to chase values, it's prioritized. If it adds opinionation the user didn't ask for, it's scoped out.

---

## 2. Token Contract Gaps

### The Problem

The token contract is the system's L0 — the seed from which all higher layers grow. But several component dimensions are hardcoded, breaking the fractal chain:

| Location | Hardcoded | Should Be |
|----------|-----------|-----------|
| `_06_visuals.sass:161` | `.avatar` width/height `32px` | `--avatar-size` |
| `_06_visuals.sass:193` | `.switch-track` width `40px` | `--switch-w` |
| `_06_visuals.sass:194` | `.switch-track` height `22px` | `--switch-h` |
| `_06_visuals.sass:203` | `.switch-thumb` dimensions `16px` | `--switch-thumb` |
| `_07_interactions.sass:35` | `.select` padding-right `28px` | `--select-arrow-gap` |
| `_05_shells.sass:303` | `.popover` offset `6px` | `--popover-offset` |
| `_05_shells.sass:34` | `.app-header` blur `12px` | `--blur-sm` |

### Why This Breaks the Fractal

The introduction says: *"To know the 'value' of something, one should not have to chase upwards a series of variables."* But the inverse is also true: if a value is hardcoded in a component, it cannot be themed, overridden, or preset-driven. The token chain is broken at L5.

### Proposal

Add component-dimension tokens to `_00_tokens.sass`:

```sass
// In :root, after the control heights
--avatar-size: 32px
--switch-w: 40px
--switch-h: 22px
--switch-thumb: 16px
--popover-offset: 6px
--blur-sm: 12px
```

This is not adding opinion — it's completing the token contract so the system's own compositions can read from it.

### Concentric Radius Check

The `better-ui` skill teaches: *outer radius = inner radius + padding*. The system already has radius channels (`--radius-sm/md/lg`) that shape presets remap. But `.card` uses `--radius-md` while its inner `.field` uses `--radius-sm` — this is correct by accident, not by documented principle. The system should document that compositions read the channel tokens, and the channels are what presets remap.

---

## 3. The Responsive Seam: Configurable but Opaque

### The Problem

`_01_config.sass` exposes `$breakpoint` as `!default`, making the responsive seam configurable. But the implementation in `_02_dimensions.sass` has 64 lines of nested `@each` loops (lines 112-175) that generate the `-mob`/`-desk` variants. The pattern is:

```sass
@each $mode, $query in $responsive-modes        // Level 1
  @media #{string.unquote($query)}
    @each $name, $prop in $gap-families         // Level 2
      @each $step in $steps                     // Level 3
        .#{$name}-#{$step}-#{$mode}
          #{$prop}: calc(...)
```

This is 4 levels deep for gaps, repeated for pads, margins, radius, sizing, shadows.

### Why This Matters

The fractal philosophy says *"one layer seeds the next."* The responsive seam should seed the responsive variants, not bury them in nested loops. The current implementation works but is hard to audit: if you need to add a new family, you must find all three places (gap/pad/marg) and repeat the pattern.

### Proposal

Extract a generation mixin in `_01_config.sass`:

```sass
=emit-responsive-family($name, $prop, $steps, $literals, $scale-var, $mode, $negatives: false)
  @each $step in $steps
    .#{$name}-#{$step}-#{$mode}
      #{$prop}: calc(var(--space-#{$step}) * var(#{$scale-var}, 1))
    @if $negatives
      .#{$name}--#{$step}-#{$mode}
        #{$prop}: calc(var(--space-#{$step}) * var(#{$scale-var}, 1) * -1)
  @each $n in $literals
    .#{$name}-#{$n}-#{$mode}
      #{$prop}: #{$n}px
    @if $negatives
      .#{$name}--#{$n}-#{$mode}
        #{$prop}: -#{$n}px
```

Usage collapses the 64-line responsive block to ~20 lines:

```sass
@each $mode, $query in $responsive-modes
  @media #{string.unquote($query)}
    @each $name, $prop in $gap-families
      +emit-responsive-family($name, $prop, $steps, $space-literals, --gap-scale, $mode)
    @each $name, $prop in $pad-families
      +emit-responsive-family($name, $prop, $steps, $space-literals, --pad-scale, $mode)
    @each $name, $prop in $marg-families
      +emit-responsive-family($name, $prop, $steps, $space-literals, --gap-scale, $mode, true)
```

This is not adding abstraction for its own sake — it's making the responsive seam a single fractal that seeds all families, rather than repeating the pattern three times.

---

## 4. Motion Language: Tokens Without a Grammar

### The Problem

The motion tokens exist (`--motion-fast/base/slow`, `--ease-out/spring`), and the motion preset axis remaps them. But the system has no guidance on *which duration goes with which interaction*. The `motion-ui` skill teaches a tier system:

| Tier | Budget | Use Case |
|------|--------|----------|
| Feedback | ≤ 150ms | Hover, focus, tap response |
| Presence | ≤ 300ms | Modal mount/unmount, toast |
| Layout | ≤ 350ms | Reorder, resize, shared-element |
| Narrative | ≤ 600ms | Page transitions, reveals |

The current tokens are:
- `--motion-fast: 120ms` — fits Feedback
- `--motion-base: 160ms` — between Feedback and Presence
- `--motion-slow: 240ms` — fits Presence

### Proposal

Document the tier mapping in `_00_tokens.sass`:

```sass
// Motion language — the tier system:
// --motion-fast  → Feedback (hover, focus, tap)
// --motion-base  → Presence (modals, toasts, panels)
// --motion-slow  → Narrative (page transitions, reveals)
// --ease-out     → Standard exit/enter
// --ease-spring  → Playful, overshoot entries
```

This is not adding tokens — it's documenting the grammar the tokens already imply. The preset axes can then be audited: `data-motion='springy'` sets `--ease-out` to the spring curve, which is correct for Narrative but wrong for Feedback (springs in feedback feel laggy). The system should either document this or add a `--ease-feedback` token.

### Interruptible Transitions

The `better-ui` skill teaches: *use CSS transitions for interactive state changes; reserve keyframes for sequences.* The current system uses `transition` correctly on `.drawer`, `.dialog`, `.popover`, `.accordion-content` — all interruptible. This is correct. But `.switch-thumb` uses `transition: translate var(--motion-fast) ease` — the `ease` here is a CSS keyword, not the token. It should be `var(--ease-out)` for consistency.

---

## 5. Accessibility: Missing Primitives

### The Problem

The system has `focus-visible` on `.accordion-trigger`, `.input`, `.select`, `.button` — but no general utility. The `accessibility` skill (WCAG 2.2) and `frontend-a11y` skill teach:

1. **Focus Appearance** (SC 2.4.11): visible focus indicator on all interactive elements
2. **Target Size** (SC 2.5.8): minimum 24×24 CSS pixels
3. **Screen reader only** utility for visually-hidden but accessible content

### Proposal

Add to `_01_config.sass` or `_06_visuals.sass`:

```sass
// --- Accessibility primitives -----------------------------------------------

// Focus ring — compose with &:focus-visible in interactive classes
=focus-ring
  &:focus-visible
    outline: 2px solid var(--ring)
    outline-offset: 2px

// Screen reader only — visually hidden but accessible
.sr-only // Visually hidden; accessible to screen readers
  position: absolute
  width: 1px
  height: 1px
  padding: 0
  margin: -1px
  overflow: hidden
  clip: rect(0, 0, 0, 0)
  white-space: nowrap
  border: 0
```

### Target Size Audit

The control heights are:
- `--control-h-sm: 26px` ✓ (≥ 24px)
- `--control-h-md: 32px` ✓
- `--control-h-lg: 38px` ✓

But `.navtree-link` has `padding-block: calc(var(--space-2xs) * ...)` — `--space-2xs` is `0.3125rem` = `5px`. That's `10px` total vertical padding, plus the text line-height. At small font sizes, this may not reach 24px. The system should document that interactive classes meet the 24px minimum, or add a `--control-hit-min` token.

---

## 6. Typography: The Fluid Scale Has a Gap

### The Problem

The fluid type scale (Utopia 360→1240) is excellent:

```sass
--text-xs: 0.75rem           // Fixed
--text-sm: clamp(0.9375rem, ..., 1rem)
--text-md: clamp(1.125rem, ..., 1.25rem)
...
--text-4xl: clamp(2.7994rem, ..., 3.8147rem)
```

But there's no `--text-body` or `--text-caption` semantic alias. The `better-typography` skill teaches that body text and captions have different optimal sizes and line-heights. The system uses `--text-sm` for body (`.input`, `.button`, `.tab-trigger`) and `--text-xs` for captions (`.field-label`, `.eyebrow`), but these are utility classes, not semantic tokens.

### Proposal

Add semantic type tokens:

```sass
// Semantic type aliases — compositions read these; the utility classes remain for override
--text-body: var(--text-sm)
--text-caption: var(--text-xs)
--text-heading-base: var(--text-md)
```

This is optional — the system works without it — but it completes the fractal: tokens seed utilities, utilities seed compositions. Semantic aliases make the seeding explicit.

### Text Wrapping

The `make-interfaces-feel-better` skill teaches:
- `text-wrap: balance` on headings
- `text-wrap: pretty` on body text

The `.prose` class sets `line-height: 1.65` and heading `line-height: 1.25`, but no `text-wrap`. Adding these would be a free improvement:

```sass
.prose
  // ... existing ...
  h1, h2, h3, h4
    text-wrap: balance
  p, li
    text-wrap: pretty
```

### Font Smoothing

The `make-interfaces-feel-better` skill recommends:

```sass
body, html
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
```

This is a free polish improvement. Add to the base reset in `_01_config.sass`.

---

## 7. Concentric Radius: The System Almost Does This

### The Problem

The `better-ui` skill's first principle: *outer radius = inner radius + padding*. The system has radius channels (`--radius-sm/md/lg`) that shape presets remap. But the relationship between a composition's radius and its children's radius is implicit.

Example: `.card` has `padding: calc(var(--space-md) * ...)` ≈ `27px` and `border-radius: var(--radius-md)` = `16px`. A `.field` inside has `border-radius: var(--radius-sm)` = `8px`. The math: `16px ≠ 8px + 27px`. The concentric principle is violated.

### Why This Matters

Concentric radius is not a strict rule — the `better-ui` skill says *"if padding is large, treat layers as separate surfaces instead of forcing the math."* The card/field relationship is the latter case. But the system should document this, so users know when to follow the channel tokens and when to treat surfaces as separate.

### Proposal

Add a comment in `_06_visuals.sass`:

```sass
// --- Compositions -----------------------------------------------------------
// Radius channels (--radius-sm/md/lg) are what shape presets remap.
// For nested compositions: if padding is small (< 12px), the inner radius
// should be outer-radius + padding (concentric). If padding is large, treat
// them as separate surfaces — the channel tokens are independent.
```

This is documentation, not code change. The system is already correct; it just doesn't say so.

---

## 8. The Shell Layer: Where Fractals Get Tangled

### The Problem

`_05_shells.sass` is 375 lines — the longest file. It contains:
- The app-shell canon (`.app-shell`, `.app-header`, `.app-main`)
- Role-bound rails (`.sidebar-left`, `.sidebar-right`)
- Navigation (`.navtree`, `.toc`)
- Tabs (`.tab-list`, `.tab-trigger`)
- Page frames (`.page-shell`, `.page-split`)
- Overlays (`.drawer`, `.dialog`, `.popover`)
- Accordion (`.accordion`, `.accordion-item`, `.accordion-trigger`)
- Hero (`.hero`)

This is a lot. The fractal philosophy says *"shells wrap them up from outside"* — but the file contains both the wrapping (app-shell) and the wrapped (accordion, tabs).

### Proposal

This is not a file-split proposal — the numbered ordering is deliberate and splitting would break the cascade. But the file should have clearer section comments:

```sass
// --- The app-shell canon ----------------------------------------------------
// The outermost wrap. Everything lives inside .app-shell.

// --- Role-bound rails -------------------------------------------------------
// Left = nav (visible ≥ lg); Right = TOC (visible ≥ xl).

// --- Navigation primitives --------------------------------------------------
// .navtree for sidebars; .toc for page-level table of contents.

// --- Tabs -------------------------------------------------------------------
// .tab-list is the rail; .tab-trigger is the clickable tab.

// --- Overlays ---------------------------------------------------------------
// .drawer, .dialog, .popover — all use .open to show; triggers carry aria.

// --- Accordion --------------------------------------------------------------
// .accordion is the parent; .accordion-item is the collapsible unit.
```

### Specificity Note

The `app-shell.open .sidebar-left` selector (line 70) has specificity (0,3,0). The `better-ui` skill teaches: *keep selector specificity low.* If `.open` is only ever applied to `.app-shell`, the selector could be `.open .sidebar-left` (0,2,0). But this is a minor point — the current specificity is not harmful, just slightly higher than needed.

---

## 9. Composition Primitives: What's Missing

### The Problem

The system provides `.card`, `.field`, `.avatar`, `.kbd`, `.switch-track` as compositions. But common UI patterns are missing:

1. **Badge** — exists in `_07_interactions.sass` but not documented as a composition
2. **Chip/Tag** — similar to badge but with a remove button
3. **Tooltip** — the `.popover` could serve this role, but there's no `.tooltip` class
4. **Divider** — exists in `_06_visuals.sass` but not in the registry

### Proposal

These are not critical — the system is composable, so users can build these. But if they're common enough, they belong in the registry. The decision should be: *is this a fractal that seeds higher layers, or a bespoke widget?*

The `.badge` is a fractal — it's a composition of background, border, radius, padding. It belongs in the registry. The `.tooltip` is a shell — it's a positioned popover with specific behavior. It might belong in `_05_shells.sass`.

### The `.hero` Class

The `.hero` is documented as *"sugar: .box.ycenter + gap-lg + pad-y-xl"*. This is the right pattern — a composition that encapsulates a common need. The system should have more of these: `.section`, `.feature`, `.testimonial` — common page-level compositions.

But this is opinionation, and the system's third opinion is *minimum opinionation*. The line is: *if 80% of users need it, it's a composition; if 20% need it, it's a recipe.* The cookbook (docs/13-cookbook.md) is where recipes live.

---

## 10. The Preset Axes: Internal Consistency

### The Problem

The four preset axes are:
- **Layout**: tight / comfortable / sprawling — remaps `--gap-scale`, `--pad-scale`
- **Shape**: round / curved / pro / sharp — remaps `--radius-sm/md/lg`
- **Color**: clean / general / vibrant — remaps `--bg-surface/raised/panel`
- **Motion**: springy / active / heavy / reduced — remaps `--motion-*`, `--ease-*`

The **Color** axis has a problem: the dark mode overrides are duplicated:

```sass
@media (prefers-color-scheme: dark)
  :root:not([data-mode='light'])[data-color='clean']
    --bg-surface: #121626
    // ...

[data-mode='dark'][data-color='clean']
  --bg-surface: #121626
  // ...
```

The same values appear twice — once for OS dark mode, once for explicit `data-mode='dark'`. This is necessary (the two selectors target different scenarios), but it's duplication that can drift.

### Proposal

Use SASS maps to define the values once:

```sass
$_color-clean-dark: (
  bg-surface: #121626,
  bg-raised: #171C2C,
  bg-panel: #10131D
)

$_color-vibrant-dark: (
  bg-surface: #171E33,
  bg-raised: #26314E,
  bg-panel: #141B2E
)

@mixin emit-color-dark($map)
  @each $token, $value in $map
    --#{$token}: #{$value}

@media (prefers-color-scheme: dark)
  :root:not([data-mode='light'])[data-color='clean']
    +emit-color-dark($_color-clean-dark)
  :root:not([data-mode='light'])[data-color='vibrant']
    +emit-color-dark($_color-vibrant-dark)

[data-mode='dark'][data-color='clean']
  +emit-color-dark($_color-clean-dark)
[data-mode='dark'][data-color='vibrant']
  +emit-color-dark($_color-vibrant-dark)
```

This is not reducing duplication for its own sake — it's ensuring the two paths cannot drift. If a color changes, it changes in one place.

### Motion Preset: The Spring Problem

`data-motion='springy'` sets `--ease-out: cubic-bezier(0.34, 1.56, 0.64, 1)` — which is the same as the default `--ease-spring`. This means in springy mode, `--ease-out` and `--ease-spring` are identical. The preset has collapsed two distinct easings into one.

The fix: `springy` should have its own `--ease-out` that is bouncier than default but not identical to `--ease-spring`. Or document that springy mode makes all easings springy.

---

## 11. Source Legibility: The Code Should Read Like the System

### The Problem

The introduction says styling syntax should be *human legible*. The source code should follow the same principle. Currently:

1. **Long lines** — `$pad-families` is 137 characters; `$marg-families` is 152
2. **Missing blank lines** — `.bg`, `.surface`, `.raised` have no blank lines between them
3. **Inconsistent comments** — some sections have excellent comments; others have none

### Proposal

**Break long maps:**

```sass
$pad-families: (
  pad: padding,
  pad-x: padding-inline,
  pad-y: padding-block,
  pad-top: padding-top,
  pad-right: padding-right,
  pad-bottom: padding-bottom,
  pad-left: padding-left
)
```

**Add blank lines between single-declaration utilities:**

```sass
.bg
  background: var(--bg)

.surface
  background: var(--bg-surface)

.raised
  background: var(--bg-raised)
```

**Add section comments:**

```sass
// --- Bare backgrounds -------------------------------------------------------
.bg
  background: var(--bg)
// ...

// --- Ink colors -------------------------------------------------------------
.text-primary
  color: var(--text-primary)
// ...
```

This is not cosmetic — it's making the source code legible, which is the system's first opinion.

### Property Order

The `sass-best-practices` skill recommends: positioning → display/box → typography → visual → animation → misc. The current code is mostly consistent but has drift in `.app-header`:

```sass
// Current
.app-header
  display: flex           // Display
  flex-direction: row     // Display
  align-items: center     // Display
  position: sticky        // Position (should be first)
  top: 0                  // Position
  z-index: var(--z-sticky) // Position
  height: var(--header-height) // Display
  // ...
```

The fix is simple: reorder to put positioning first. This is a one-time pass, enforced by convention.

---

## 12. The Build Pipeline: Autoprefixer and the Prefix Question

### The Problem

The system has manual vendor prefixes:
- `-webkit-backdrop-filter`
- `-webkit-appearance`
- `-webkit-line-clamp`
- `-webkit-box-orient`

But it's unclear whether these are necessary or if the build pipeline runs autoprefixer. The `scripts/build-css.js` should be checked.

### Proposal

If autoprefixer is in the pipeline, remove manual prefixes. If not, either add autoprefixer or document the manual prefix policy. The `dart-sass` skill teaches: *let autoprefixer handle vendor prefixes; don't maintain them manually.*

---

## 13. Documentation as Fractal Mirror

### The Problem

The introduction is poetic and philosophical. The code is technical and precise. The documentation should bridge them — but currently, the docs explain the code, not the philosophy.

### Proposal

Each doc chapter should open with the fractal it represents:

- **04-tokens.md**: *"L0: the seed. Colors, sizes, font-sizes — the elementary particles from which all else grows."*
- **05-dimensions.md**: *"L1: the spreading out. Gaps, pads, margins — the space between things, as important as the things themselves."*
- **06-containers.md**: *"L2: the box. Everything is a box — and boxes are just dimensions that found their purpose."*

This is not adding fluff — it's making the fractal philosophy explicit in the documentation, so users understand not just *what* the system does, but *why* it's structured this way.

### The Registry as Fractal Map

The registry (REGISTRY.md, registry.json) lists every class. But it doesn't show the fractal relationships — which L0 tokens seed which L1 dimensions, which L2 containers. A visual diagram or a "seeds/seeded-by" column would make the fractal structure explicit.

---

## 14. Implementation Priority

| Priority | Improvement | Effort | Impact | Fractal Reason |
|----------|-------------|--------|--------|----------------|
| **P0** | Token contract gaps (magic numbers) | Low | High | Completes L0 so L5 can read from it |
| **P0** | Source legibility (blank lines, comments, long lines) | Low | High | Makes the code read like the system |
| **P1** | Responsive seam mixin extraction | Medium | High | Makes the seam a single fractal |
| **P1** | Motion tier documentation | Low | Medium | Documents the grammar tokens imply |
| **P1** | Accessibility primitives (.sr-only, focus-ring) | Low | High | Adds missing WCAG primitives |
| **P2** | Preset color map extraction | Medium | Medium | Prevents dark mode drift |
| **P2** | Text-wrap and font-smoothing | Low | Low | Free polish |
| **P2** | Property order pass | Medium | Low | One-time consistency |
| **P3** | Concentric radius documentation | Low | Low | Documents existing correctness |
| **P3** | Shell section comments | Low | Low | Improves navigation |
| **P3** | Semantic type aliases | Low | Low | Optional fractal completion |

---

## Conclusion

The fractal philosophy is not a metaphor — it's an engineering principle. *As above, so below* means the same modularity that governs tokens should govern shells; the same legibility that governs class names should govern source code; the same token-driven approach that governs colors should govern motion.

The v1 proposal treated symptoms. This proposal treats causes: where the fractal chain breaks, where a layer doesn't seed the next, where the system's own opinions contradict its stated philosophy.

The highest-impact changes are also the simplest:
1. **Complete the token contract** — hardcoded component dimensions become tokens
2. **Make the source legible** — blank lines, comments, broken lines
3. **Extract the responsive seam** — one mixin seeds all families

These are not "best practices" imposed from outside. They are the fractal philosophy applied to the system itself.

---

## Appendix: Skills Consulted

This proposal draws from the following loaded skills:

- `sass-best-practices` — property order, code style
- `dart-sass` — compilation, autoprefixer
- `better-ui` — concentric radius, interruptible transitions, scale on press
- `better-layout` — grouping, alignment, logical properties
- `better-typography` — text-wrap, font smoothing
- `accessibility` — WCAG 2.2, focus appearance, target size
- `frontend-a11y` — Svelte-specific patterns
- `design-system` — token architecture, visual audit
- `motion-ui` — tier system, physics budget
- `make-interfaces-feel-better` — text-wrap, font smoothing, image outlines
- `visual-design` — color, composition
- `frontend-design-direction` — art direction

---

*Prepared by FS Design Agent — the fractal design system specialist.*
