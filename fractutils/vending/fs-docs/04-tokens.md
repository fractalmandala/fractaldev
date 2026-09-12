---
title: Tokens & Theming
description: Fluid Utopia scales, the strict color contract, tokens that scale and modulate across the layers.
---

All literal values in live inside `_00_tokens.sass`. Components and mixins never hardcode hex colors, arbitrary pixel font sizes, or ad-hoc variables — they strictly resolve from the centralized token scale. A few principles have guided the creation of this tokens set, apart from the underlying fractal genes. 

1. Clamps and modular scales are great, doubly so when they work smooth. But does any of us really want to do the mathematics of these things? And should we? If modularity is so great, why cant there be drop-in-and-use systems? Utopia provides such templates, and we use them.
=> for font sizes, and all dimensions, you don't really even have to get into config at all. Just pick and use.

2. A visual language makes itself "felt" by the same syntax shinging through across different pages and components. And the "shine" of UI design often lies in how things like border-radius, shadow, transition are applied. These exist at token level, so that they bloom through to all layers.

3. Colors! If there is no color coherence, there is no design. But very few among us are happy "receiving" a palette and using it for all posterity! We like play, and we like having space to play. Color tokens are set on the principle of scaffold + harness we saw in the introduction. And why be a closed system? The tokens are set such that you can steal themes from elsewhere too, like ShadCN, and use here frictionless.

4. Presets are nice, aren't they? For roundedness vs sharpness - shape, compactness vs. breathing space, clean spaces vs color contrast, and heavy motion vs vibrancy and spring -> four preset families help you set quick character to your styling. 

## The 31 Colours

The system defines 31 semantic CSS custom properties across 6 core categories. All 76 built-in palettes map 1:1 onto these exact token variables — as does any theme you write yourself:

| Category | Token Variable | Purpose | Light Default | Dark Default |
| :--- | :--- | :--- | :--- | :--- |
| Base Surface | `--bg` | Application canvas backdrop | `#fdfefe` | `#0E1118` |
| Card Surface | `--bg-surface` | Primary card and container material | `#f8f7f7` | `#141824` |
| Elevated Surface | `--bg-raised` | Hover states, pill tracks, badge surfaces | `#f1f5f9` | `#1C2232` |
| Panel Surface | `--bg-panel` | Sidebars, drawers, toolbars, headers | `#F1F3F5` | `#101420` |
| Footer Surface | `--bg-footer` | Pinned application and page footers | `#E9ECEF` | `#0B0D14` |
| Flyout Surfaces | `--bg-popover`, `--bg-dialog` | Dropdown menus, modals, dialog cards | `#FFFFFF` | `#20273A` |
| Specialty Surfaces | `--bg-terminal`, `--bg-input`, `--bg-canvas` | Code blocks, form inputs, outer canvas | `#0F172A`, `#FFF`, `#F8F9FA` | `#080A0F`, `#121622`, `#0E1118` |
| Typography | `--text-primary` | Headings, titles, high-contrast ink | `#0f172a` | `#EDF2F7` |
| | `--text-secondary` | Body paragraphs, descriptions, labels | `#5b6472` | `#9BB0C7` |
| | `--text-muted` | Captions, timestamps, metadata | `#929497` | `#5D7087` |
| | `--text-inverse` | Contrast text on solid brand buttons | `#ffffff` | `#0E1118` |
| **Interaction States** | `--state-hover` | Hover fill on rows, list items, ghost buttons | `#E2E8F0` | — |
| | `--state-hover-subtle` | Fainter hover, for dense lists | `#F1F5F9` | — |
| | `--state-selected` | The current row, tab or nav item (`.button.active`) | `#CBD5E1` | — |
| Borders | `--border` | Primary borders, card outlines, separators | `#E2E8F0` | `#28324A` |
| | `--border-subtle` | Faint dividers, table rows, inner items | `#EDF2F7` | `#1E2538` |
| Theme Color | `--theme-color` (`--theme-color`) | Primary action color, active tabs, badges | `#04825B` | `#38BDF8` |
| | `--theme-color-alt` (`--theme-color-alt`) | Hover state for primary action buttons | `#047857` | `#0EA5E9` |
| | `--ring` | Visible focus outline ring | `rgba(0,127,78,0.35)` | `rgba(16,185,129,0.4)` |
| Status Feedback | `--success`, `--success-hover` | Success states, confirmed badges | `#10B981`, `#059669` | `#34D399`, `#6EE7B7` |
| | `--warning`, `--warning-hover` | Warning alerts, pending states | `#F59E0B`, `#D97706` | `#FBBF24`, `#FCD34D` |
| | `--danger`, `--danger-hover` | Destructive buttons, error alerts | `#EF4444`, `#DC2626` | `#F87171`, `#FCA5A5` |
| | `--info`, `--info-hover` | Information callouts, notifications | `#3B82F6`, `#2563EB` | `#60A5FA`, `#93C5FD` |
| | `--feedback-error` | Form validation error text and outlines | `#DC2626` | `#F87171` |


## The Fluid Scales

All type and space scales use fluid viewport formulas interpolating smoothly between 360px (mobile) and 1240px (desktop):

### Typography Steps
```sass
--text-xs:  0.75rem                                       // 12px
--text-sm:  clamp(0.9375rem, 0.9119rem + 0.1136vw, 1rem)   // 15px - 16px
--text-md:  clamp(1.125rem, 1.0739rem + 0.2273vw, 1.25rem)// 18px - 20px
--text-lg:  clamp(1.35rem, 1.2631rem + 0.3864vw, 1.5625rem)// 21.6px - 25px
--text-xl:  clamp(1.62rem, 1.4837rem + 0.6057vw, 1.9531rem)// 26px - 31.25px
--text-2xl: clamp(1.944rem, 1.7405rem + 0.9044vw, 2.4414rem)// 31.1px - 39px
--text-3xl: clamp(2.3328rem, 2.0387rem + 1.3072vw, 3.0518rem)// 37.3px - 48.8px
--text-4xl: clamp(2.7994rem, 2.384rem + 1.8461vw, 3.8147rem)// 44.8px - 61px
```

### Spacing Steps
```sass
--space-3xs: clamp(0.3125rem, 0.3125rem + 0vw, 0.3125rem) // 5px
--space-2xs: clamp(0.5625rem, 0.5369rem + 0.1136vw, 0.625rem) // 9px - 10px
--space-xs:  clamp(0.875rem, 0.8494rem + 0.1136vw, 0.9375rem) // 14px - 15px
--space-sm:   clamp(1.125rem, 1.0739rem + 0.2273vw, 1.25rem) // 18px - 20px
--space-md:   clamp(1.6875rem, 1.6108rem + 0.3409vw, 1.875rem) // 27px - 30px
--space-lg:   clamp(2.25rem, 2.1477rem + 0.4545vw, 2.5rem) // 36px - 40px
--space-xl:  clamp(3.375rem, 3.2216rem + 0.6818vw, 3.75rem) // 54px - 60px
--space-2xl: clamp(4.5rem, 4.2955rem + 0.9091vw, 5rem) // 72px - 80px
--space-3xl: clamp(6.75rem, 6.4432rem + 1.3636vw, 7.5rem) // 108px - 120px
```

And here's how things get fractal - every token also exists as a class! Use `.text-4xl` and you know what you get. Set a `.gap-2xs` and it follows `--space-2xs`, as do `pad-2xs` and others.

Fractalstyler2 owns the contract for themes with 76 palettes and runtime to apply them.

With JavaScript disabled or before hydration, `_00_tokens.sass` renders `=light-theme-tokens` by default, or `=dark-theme-tokens` when `@media (prefers-color-scheme: dark)` is active.

`setTheme(id)` swaps the palette class on `<html>` and pairs it with `data-mode`. Everything below is a class or an attribute, so all of it works with JavaScript disabled:
- Dark/Light mode flipping (`[data-mode='dark']`, `[data-mode='light']`)
- Preset color families (`theme-night-dark`, `theme-frozen-dark`, `theme-nord-dark`, etc.)
- User-customized accent colors (`--theme-color`, `--theme-color-alt`)
- Preset axes (`[data-shape]`, `[data-layout]`, `[data-color]`, `[data-motion]`)

[Next - Dimensions & Spacing](./05-dimensions.md)
