---
title: Fractalstyler2 SASS Improvement Proposal
description: Comprehensive analysis and recommendations for improving the fractalstyler2 SASS codebase based on Sass best practices
type: fractalstyler2
---

# Fractalstyler2 SASS Improvement Proposal

## Executive Summary

The fractalstyler2 codebase demonstrates strong architectural decisions (token-driven composition, layered cascade, numbered file ordering). However, applying Sass best practices reveals opportunities for improved maintainability, consistency, and developer experience.

This proposal identifies **15 improvement areas** organized by priority and impact.

---

## Table of Contents

1. [Property Order Consistency](#1-property-order-consistency)
2. [Magic Numbers → Token Integration](#2-magic-numbers--token-integration)
3. [Deep Loop Nesting → Extracted Mixins](#3-deep-loop-nesting--extracted-mixins)
4. [Repetitive Classes → Loop Generation](#4-repetitive-classes--loop-generation)
5. [File Separation of Concerns](#5-file-separation-of-concerns)
6. [Line Length and Readability](#6-line-length-and-readability)
7. [Missing Blank Lines Between Rule Sets](#7-missing-blank-lines-between-rule-sets)
8. [Comment Consistency](#8-comment-consistency)
9. [Hardcoded Colors in Presets](#9-hardcoded-colors-in-presets)
10. [Vendor Prefix Consistency](#10-vendor-prefix-consistency)
11. [Accessibility Enhancements](#11-accessibility-enhancements)
12. [Performance: Reduce Specificity](#12-performance-reduce-specificity)
13. [Style Guide Documentation](#13-style-guide-documentation)
14. [File Structure Refinement](#14-file-structure-refinement)
15. [Quick Wins](#15-quick-wins)

---

## 1. Property Order Consistency

### Current State

Properties are grouped logically but inconsistently across files.

### Example from `_05_shells.sass` (lines 24-36)

```sass
.app-header
	display: flex
	flex-direction: row
	align-items: center
	position: sticky
	top: 0
	z-index: var(--z-sticky)
	height: var(--header-height)
	padding-inline: calc(var(--space-sm) * var(--pad-scale, 1))
	background: color-mix(in srgb, var(--bg-surface) 88%, transparent)
	backdrop-filter: blur(12px)
	-webkit-backdrop-filter: blur(12px)
	border-bottom: 1px solid var(--border)
```

### Recommended Standard Order

1. **Positioning** — position, top, right, bottom, left, z-index
2. **Display & Box Model** — display, flex, width, height, padding, margin
3. **Typography** — font-*, line-height, text-*, color
4. **Visual** — background, border, border-radius, box-shadow
5. **Animation** — transition, animation
6. **Misc** — cursor, user-select, pointer-events

### Proposed Refactor

```sass
.app-header
	// Positioning
	position: sticky
	top: 0
	z-index: var(--z-sticky)
	// Display & Box Model
	display: flex
	flex-direction: row
	align-items: center
	height: var(--header-height)
	padding-inline: calc(var(--space-sm) * var(--pad-scale, 1))
	// Visual
	background: color-mix(in srgb, var(--bg-surface) 88%, transparent)
	backdrop-filter: blur(12px)
	-webkit-backdrop-filter: blur(12px)
	border-bottom: 1px solid var(--border)
```

### Impact

Improves scannability and reduces cognitive load when reviewing styles.

---

## 2. Magic Numbers → Token Integration

### Current Issues

| File | Line | Magic Number | Context |
|------|------|--------------|---------|
| `_06_visuals.sass` | 161-162 | `32px` | `.avatar` dimensions |
| `_06_visuals.sass` | 193-194 | `40px`, `22px` | `.switch-track` dimensions |
| `_06_visuals.sass` | 203-204 | `16px` | `.switch-thumb` dimensions |
| `_07_interactions.sass` | 35 | `28px` | `.select` padding-right |
| `_07_interactions.sass` | 106-112 | `0` | `.is-icon` padding/background/border |
| `_05_shells.sass` | 303 | `6px` | `.popover` offset |
| `_05_shells.sass` | 34 | `12px` | `.app-header` backdrop blur |

### Proposal

Introduce semantic tokens for component dimensions in `_00_tokens.sass`:

```sass
// In _00_tokens.sass :root
--avatar-size: 32px
--switch-w: 40px
--switch-h: 22px
--switch-thumb: 16px
--select-arrow-gap: 28px
--popover-offset: 6px
--blur-sm: 12px
```

### Usage

```sass
// Before
.avatar
	width: 32px
	height: 32px

// After
.avatar
	width: var(--avatar-size)
	height: var(--avatar-size)
```

### Benefits

- Values become themeable/overridable
- Consistent with the token-driven philosophy
- Easier to audit and adjust systematically

---

## 3. Deep Loop Nesting → Extracted Mixins

### Current Issue in `_02_dimensions.sass` (lines 112-174)

The responsive bands section has 4 levels of nested `@each` loops:

```sass
@each $mode, $query in $responsive-modes        // Level 1
  @media #{string.unquote($query)}
    @each $name, $prop in $gap-families         // Level 2
      @each $step in $steps                     // Level 3
        .#{$name}-#{$step}-#{$mode}
          #{$prop}: calc(...)
      @each $n in $space-literals               // Level 3
        .#{$name}-#{$n}-#{$mode}
          #{$prop}: #{$n}px
    @each $name, $prop in $pad-families         // Level 2
      // ... repeats the same pattern
    @each $name, $prop in $marg-families        // Level 2
      // ... repeats again
```

### Proposal

Extract a reusable mixin in `_01_config.sass` or a new `_utilities.sass`:

```sass
// In _01_config.sass or _utilities.sass
=emit-responsive-family($name, $prop, $steps, $literals, $scale-var, $mode)
  @each $step in $steps
    .#{$name}-#{$step}-#{$mode}
      #{$prop}: calc(var(--space-#{$step}) * var(#{$scale-var}, 1))
  @each $n in $literals
    .#{$name}-#{$n}-#{$mode}
      #{$prop}: #{$n}px

// Usage in _02_dimensions.sass
@each $mode, $query in $responsive-modes
  @media #{string.unquote($query)}
    @each $name, $prop in $gap-families
      +emit-responsive-family($name, $prop, $steps, $space-literals, --gap-scale, $mode)
    @each $name, $prop in $pad-families
      +emit-responsive-family($name, $prop, $steps, $space-literals, --pad-scale, $mode)
    // ... etc
```

### Benefits

- Reduces ~60 lines to ~20
- Single source of truth for the pattern
- Easier to modify the generation logic

---

## 4. Repetitive Classes → Loop Generation

### Current Issue in `_06_visuals.sass` (lines 114-128)

```sass
.clamp-1
  display: -webkit-box
  -webkit-line-clamp: 1
  -webkit-box-orient: vertical
  overflow: hidden
.clamp-2
  display: -webkit-box
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical
  overflow: hidden
.clamp-3
  display: -webkit-box
  -webkit-line-clamp: 3
  -webkit-box-orient: vertical
  overflow: hidden
```

### Proposal

```sass
@for $i from 1 through 3
  .clamp-#{$i}
    display: -webkit-box
    -webkit-line-clamp: $i
    -webkit-box-orient: vertical
    overflow: hidden
```

### Similarly for Weight Utilities (lines 93-100)

```sass
// Before
.weight-400
  font-weight: 400
.weight-500
  font-weight: 500
.weight-600
  font-weight: 600
.weight-700
  font-weight: 700

// After
@each $weight in (400, 500, 600, 700)
  .weight-#{$weight}
    font-weight: $weight
```

---

## 5. File Separation of Concerns

### Current Issue in `_01_config.sass`

This file contains both:
1. Configuration variables (`$breakpoint`, `$literal-fine`, etc.)
2. Base reset styles (lines 47-78: `*`, `body`, `img`, `button`, `a` resets)

### Proposal

Split into two files:

```
_01_config.sass    → Only $variables and configuration
_01_base.sass      → Element resets and baseline styles
```

### Updated `index.sass`

```sass
@forward '00_tokens'
@forward '00_themes'
@forward '00_presets'
@use '01_config' as *
@use '01_base'          // New file
@use '02_dimensions' as *
// ...
```

### Benefits

- Clearer separation: configuration vs. output
- Config can be loaded with `with (...)` without pulling in resets
- Aligns with the skill's recommended structure (abstracts/ vs. base/)

---

## 6. Line Length and Readability

### Current Issues

Several lines exceed 80 characters:

| File | Line | Length | Content |
|------|------|--------|---------|
| `_02_dimensions.sass` | 35 | 137 | `$pad-families: (pad: padding, pad-x: padding-inline, ...)` |
| `_02_dimensions.sass` | 38 | 152 | `$marg-families: (marg: margin, marg-x: margin-inline, ...)` |
| `_05_shells.sass` | 33 | 101 | `background: color-mix(in srgb, var(--bg-surface) 88%, transparent)` |
| `_07_interactions.sass` | 39 | 142 | `background-image: url("data:image/svg+xml,...")` |

### Proposal

Break long declarations:

```sass
// Before
$pad-families: (pad: padding, pad-x: padding-inline, pad-y: padding-block, pad-top: padding-top, pad-right: padding-right, pad-bottom: padding-bottom, pad-left: padding-left)

// After
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

### For the SVG Data URI

```sass
.select
  // Store as a variable for reusability
  $chevron-down: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23697080' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
  
  background-image: $chevron-down
  background-repeat: no-repeat
  background-position: right 8px center
```

---

## 7. Missing Blank Lines Between Rule Sets

### Current Issue

Inconsistent spacing between rule sets. Examples:

`_06_visuals.sass` lines 14-27:

```sass
.bg
  background: var(--bg)
.surface
  background: var(--bg-surface)
.raised
  background: var(--bg-raised)
```

### Recommended

```sass
.bg
  background: var(--bg)

.surface
  background: var(--bg-surface)

.raised
  background: var(--bg-raised)
```

### Exception

Single-line related utilities (like the bare backgrounds above) can be grouped without blank lines for compactness, but this should be a deliberate choice documented in a comment.

---

## 8. Comment Consistency

### Current State

Comments range from excellent (file headers, complex logic) to missing (simple utilities).

### Proposal

Add section comments consistently:

```sass
// --- Bare backgrounds ---------------------------------------------------------
.bg
  background: var(--bg)

.surface
  background: var(--bg-surface)

// --- Ink colors ----------------------------------------------------------------
.text-primary
  color: var(--text-primary)

.text-secondary
  color: var(--text-secondary)
```

### For Non-Obvious Implementations

```sass
// The radius CHANNELS as classes. Unlike the numeric ladder these follow
// data-shape, so a card on .radius-md goes round -> curved -> pro -> sharp with
// the preset. Reach for these first; the literals are for exact requirements.
@each $step in ('sm' 'md' 'lg')
  .radius-#{$step}
    border-radius: var(--radius-#{$step})
```

This comment is excellent — more like it would help.

---

## 9. Hardcoded Colors in Presets

### Current Issue in `_00_presets.sass` (lines 59-87)

```sass
[data-color='clean']
  --bg-surface: #fbfbfb
  --bg-raised: #f5f7f9
  --bg-panel: #F7F8F9

[data-color='vibrant']
  --bg-surface: #f2f5f7
  --bg-raised: #e8eef3
  --bg-panel: #E9EEF3
```

### Proposal

Define as SASS variables or maps for consistency:

```sass
// At top of _00_presets.sass
$color-preset-clean: (
  bg-surface: #fbfbfb,
  bg-raised: #f5f7f9,
  bg-panel: #F7F8F9
)

$color-preset-vibrant: (
  bg-surface: #f2f5f7,
  bg-raised: #e8eef3,
  bg-panel: #E9EEF3
)

[data-color='clean']
  @each $token, $value in $color-preset-clean
    --#{$token}: #{$value}

[data-color='vibrant']
  @each $token, $value in $color-preset-vibrant
    --#{$token}: #{$value}
```

### Benefits

- Easier to audit all preset values at a glance
- Reduces duplication (dark mode overrides repeat the same values)
- Consistent with the map-based approach used elsewhere

---

## 10. Vendor Prefix Consistency

### Current State

Some properties have vendor prefixes, others don't:

```sass
// Has prefix
-webkit-backdrop-filter: blur(12px)
-webkit-appearance: none
-webkit-line-clamp: 1
-webkit-box-orient: vertical

// Missing prefix (if needed)
backdrop-filter: blur(12px)  // ✅ Has -webkit- above
appearance: none              // ✅ Has -webkit- above
```

### Recommendation

- Document the prefixing strategy (manual vs. autoprefixer)
- If using autoprefixer in the build pipeline, remove manual prefixes
- If not, ensure all properties that need prefixes have them

### Action Item

Check: Does `scripts/build-css.js` run autoprefixer? If not, consider adding it or documenting the manual prefix policy.

---

## 11. Accessibility Enhancements

### Missing from Current Codebase

#### 1. Focus Visible Utility

The skill recommends a `=focus-visible` mixin:

```sass
// Proposal for _01_config.sass or similar
=focus-visible
  &:focus-visible
    outline: 2px solid var(--ring)
    outline-offset: 2px
```

#### 2. Visually Hidden Utility

For screen-reader-only content:

```sass
.sr-only // Screen reader only — visually hidden but accessible
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

#### 3. Skip Link Styles

For keyboard navigation:

```sass
.skip-link
  position: absolute
  top: -40px
  left: 0
  background: var(--bg)
  color: var(--text-primary)
  padding: 8px
  z-index: 100
  
  &:focus
    top: 0
```

---

## 12. Performance: Reduce Specificity

### Current Issue

Some selectors are more specific than needed:

```sass
// _05_shells.sass line 70
.app-shell.open .sidebar-left
  display: block
```

### Proposal

If `.open` is only ever applied to `.app-shell`, simplify:

```sass
.open .sidebar-left  // Lower specificity, same result
  display: block
```

### Or Use a Data Attribute

```sass
[data-drawer-open] .sidebar-left
  display: block
```

---

## 13. Style Guide Documentation

### Proposal

Add at the top of `index.sass`:

```sass
// =============================================================================
// FRACTALSTYLER2 STYLE GUIDE
// =============================================================================
//
// PROPERTY ORDER (enforced for consistency):
//   1. Positioning    — position, top, right, bottom, left, z-index
//   2. Display & Box  — display, flex, grid, width, height, padding, margin
//   3. Typography     — font-*, line-height, text-*, letter-spacing, color
//   4. Visual         — background, border, border-radius, box-shadow
//   5. Animation      — transition, animation
//   6. Misc           — cursor, user-select, pointer-events, overflow
//
// NAMING CONVENTIONS:
//   - Utilities: lowercase, hyphenated (.text-primary, .gap-md)
//   - Compositions: lowercase, hyphenated (.card, .field-label)
//   - Modifiers: nested with &. (button.primary, button.ghost)
//   - Responsive: -mob / -desk suffix (.gap-md-mob, .gap-md-desk)
//   - Negative margins: -- infix (.marg-left--16)
//
// NESTING RULES:
//   - Max 3 levels deep (alignment modifiers under containers)
//   - Prefer flat BEM-style classes over deep nesting
//   - Pseudo-elements (::before, ::after) and states (:hover, :focus) are OK
//
// TOKEN USAGE:
//   - Always use var(--token-name) — never hardcode values
//   - Spacing: var(--space-*) × var(--gap-scale) or var(--pad-scale)
//   - Colors: var(--bg-*), var(--text-*), var(--border), var(--theme-color)
//   - Radius: var(--radius-sm/md/lg) for channels, var(--radius-*) for literals
//   - Motion: var(--motion-fast/base/slow), var(--ease-out/spring)
//
// =============================================================================
```

---

## 14. File Structure Refinement

### Current

```
src/lib/styles/
├── _00_tokens.sass
├── _00_themes.sass
├── _00_presets.sass
├── _01_config.sass (config + base reset)
├── _02_dimensions.sass
├── _03_containers.sass
├── _04_layouts.sass
├── _05_shells.sass
├── _06_visuals.sass
├── _07_interactions.sass
├── _08_own.sass
└── index.sass
```

### Proposed

```
src/lib/styles/
├── _00_tokens.sass
├── _00_themes.sass
├── _00_presets.sass
├── _01_config.sass (config only)
├── _01_base.sass (NEW — element resets)
├── _02_dimensions.sass
├── _03_containers.sass
├── _04_layouts.sass
├── _05_shells.sass
├── _06_visuals.sass
├── _07_interactions.sass
├── _08_own.sass
├── _utilities.sass (NEW — shared mixins for loop generation)
└── index.sass
```

---

## 15. Quick Wins

### Low Effort, High Impact

1. **Add blank lines** between rule sets in `_06_visuals.sass` and `_07_interactions.sass`
2. **Break long lines** in `$pad-families` and `$marg-families` maps
3. **Extract `.clamp-*` loop** (3 classes → 5 lines)
4. **Extract `.weight-*` loop** (4 classes → 3 lines)
5. **Add section comments** to group related utilities
6. **Standardize property order** in `.app-header`, `.drawer`, `.dialog`

---

## Implementation Priority

| Priority | Improvement | Effort | Impact |
|----------|-------------|--------|--------|
| **High** | Extract loop mixins | Medium | Reduces duplication significantly |
| **High** | Magic numbers → tokens | Low | Improves themeability |
| **High** | Property order consistency | Medium | Improves maintainability |
| **Medium** | Split config/base | Low | Cleaner separation of concerns |
| **Medium** | Loop generation for clamp/weight | Low | Reduces repetition |
| **Medium** | Blank lines + comments | Low | Improves readability |
| **Low** | Long line breaks | Low | Improves scannability |
| **Low** | Accessibility utilities | Low | Adds missing functionality |
| **Low** | Preset color maps | Medium | Reduces duplication |

---

## Conclusion

The fractalstyler2 codebase is architecturally sound and follows many best practices (token-driven, layered cascade, numbered ordering). The proposed improvements focus on **consistency**, **maintainability**, and **developer experience** rather than fundamental restructuring.

### Highest-Impact Changes

1. **Extracting the responsive loop pattern into a mixin** — reduces ~60 lines to ~20
2. **Converting magic numbers to tokens** — improves themeability and consistency
3. **Enforcing consistent property order** — improves scannability across all files

These changes would make the codebase more aligned with Sass best practices while preserving the unique architectural decisions that make fractalstyler2 effective.

---

## Appendix: Files Referenced

- `src/lib/styles/_00_tokens.sass`
- `src/lib/styles/_00_presets.sass`
- `src/lib/styles/_01_config.sass`
- `src/lib/styles/_02_dimensions.sass`
- `src/lib/styles/_03_containers.sass`
- `src/lib/styles/_04_layouts.sass`
- `src/lib/styles/_05_shells.sass`
- `src/lib/styles/_06_visuals.sass`
- `src/lib/styles/_07_interactions.sass`
- `src/lib/styles/index.sass`
- `scripts/build-css.js`
