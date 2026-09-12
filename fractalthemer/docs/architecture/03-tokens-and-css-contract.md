---

## id: tokens-and-css-contract
title: Semantic Theme Color Tokens Contract
type: design
tags: \[tokens, css-variables, design-system, colors, themes\]
summary: Contract specifications for semantic color tokens, tiered surfaces, text contrast, borders, and interactive state colors.
relates\_to: \[architecture-overview, theme-catalog\]
updated: 2026-08-16

# 🎨 Semantic Theme Color Tokens Contract

`fractalthemer` focuses strictly on theme colors and contrast. It purposefully does **not** export global font scales or spacing scales, leaving typography sizing and layout spacing completely under your application's control.

All 41 themes supply the complete semantic token contract defined in [`_tokens.sass`](../../src/lib/styles/_tokens.sass) and [`_themes.sass`](../../src/lib/styles/_themes.sass).

---

## 🏛 1. Layered Surface Tokens

Every theme provides tiered background surfaces to maintain distinct visual hierarchy and elevation without heavy border lines:

```
+-------------------------------------------------------------+
| --bg (Deepest Canvas Backdrop)                              |
|  +-------------------------------------------------------+  |
|  | --bg-panel (Sidebars, Toolbars, Drawer Panels)        |  |
|  |  +-------------------------------------------------+  |  |
|  |  | --bg-surface (Cards, Content Containers)        |  |  |
|  |  |  +-------------------------------------------+  |  |  |
|  |  |  | --bg-raised (Elevated Badges, Dropdowns)  |  |  |  |
|  |  |  +-------------------------------------------+  |  |  |
|  |  +-------------------------------------------------+  |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```


| Token           | Category | Description                                           |
| --------------- | -------- | ----------------------------------------------------- |
| `--bg`          | Surface  | Deepest canvas backdrop                               |
| `--bg-surface`  | Surface  | Primary card and article body background              |
| `--bg-raised`   | Surface  | Raised header elements, dropdowns, floating surfaces  |
| `--bg-panel`    | Surface  | Lateral sidebars, navigation panels, drawer container |
| `--bg-footer`   | Surface  | Bottom footer surface                                 |
| `--bg-popover`  | Surface  | Context menus, popup dialogs, drawer interior         |
| `--bg-dialog`   | Surface  | Modal backdrop and dialog cards                       |
| `--bg-terminal` | Surface  | Code blocks, command line, and monospace terminal     |
| `--bg-input`    | Surface  | Text inputs, textareas, and select menus              |
| `--bg-canvas`   | Surface  | Viewport canvas background                            |


---

## 🖋 2. Text &amp; Typography Contrast Tokens


| Token              | Description                                           |
| ------------------ | ----------------------------------------------------- |
| `--text-primary`   | Main high-contrast titles, headers, bold body         |
| `--text-secondary` | Paragraphs, descriptions, secondary metadata          |
| `--text-muted`     | Faint timestamps, captions, disabled labels           |
| `--text-inverse`   | Contrast text rendered on top of brand accent buttons |


---

## 🔲 3. Borders &amp; Dividers


| Token             | Description                                  |
| ----------------- | -------------------------------------------- |
| `--border`        | Primary separator and card outline border    |
| `--border-subtle` | Subtle divider lines and inner table borders |


---

## 🎯 4. Brand Accent &amp; Theme Colors


| Token               | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| `--theme-color`     | Primary brand accent color (buttons, active badges, highlights) |
| `--theme-color-alt` | Hover and focus state for brand accent buttons                  |
| `--theme`           | Alias pointing to `--theme-color`                               |


---

## 💫 5. Interactive State & Feedback Tokens

| Token | Description |
|---|---|
| `--state-hover` | Neutral hover background tint |
| `--state-hover-subtle` | Gentle list-item hover tint |
| `--state-selected` | Active tab, selected item highlight |
| `--success` | Confirmed badges, success messages |
| `--success-hover` | Hover state for success actions |
| `--warning` | Warning alerts, pending state |
| `--warning-hover` | Hover state for warning actions |
| `--danger` | Destructive buttons, danger alerts |
| `--danger-hover` | Hover state for danger actions |
| `--info` | Information callouts, notifications |
| `--info-hover` | Hover state for info actions |
| `--feedback-error` | Validation errors and destructive alerts |
| `--ring` | Focus ring glow outline |


---

## 💅 Example Usage in Your Application CSS

```css
/* Card Container */
.card {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}

.card:hover {
  background-color: var(--state-hover);
}

/* Primary Action Button */
.btn-primary {
  background-color: var(--theme-color);
  color: var(--text-inverse);
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: var(--theme-color-alt);
}

/* Secondary Muted Text */
.card-caption {
  color: var(--text-muted);
  font-size: 12px;
}
```

## 🧊 6. Glass Regime (Vivid Backgrounds)

The layered surface tokens above are **opaque by design** — in `plain` mode, the contrast between `--bg-panel` (sidebar) and `--bg-surface` (main area) *is* the layout. But when a vivid background (aura, gradient, pattern) owns the canvas, opaque surfaces would clash with and hide it.

So the two regimes are mutually exclusive:

- **`plain`** — `-bg-*` tokens are opaque; surfaces carry the design.
- **`aura` / `gradient` / `pattern`** — the backdrop becomes the only background. ThemeState re-emits every `-bg-*` token as `color-mix(in srgb, <theme literal> N%, transparent)` inline on `:root`, so all surfaces turn glass automatically — no consumer CSS changes needed. `--bg` goes fully transparent, floating layers (`--bg-popover`, `--bg-dialog`, `--bg-input`) stay nearly opaque for legibility, and `--bg-terminal` stays opaque for code readability.

The blur half ships in `fractalthemer/styles` (`_glass.sass`) and is **fully automatic** — no markup changes required:

```css
:root[data-bg-style='aura'],   /* same for gradient / pattern */
:root[data-bg-style='gradient'],
:root[data-bg-style='pattern'] {
  --glass-blur: 14px;
}

/* App chrome frosted automatically in vivid modes */
:root[data-bg-style='aura'] :where(header, nav, aside, footer, dialog,
    [role='banner'], [role='navigation'], [role='complementary'],
    [role='contentinfo'], [role='dialog'], [popover], [data-glass]) {
  backdrop-filter: blur(var(--glass-blur, 14px)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--glass-blur, 14px)) saturate(140%);
}
```

Design notes:

- **Auto by default.** Structural chrome (`header`, `nav`, `aside`, `footer`, `dialog`, popover, and the standard ARIA landmarks) gets the frost the moment a vivid background is active — regardless of how the consumer names their classes. `data-glass` remains as an opt-in for custom surfaces (a `.sidebar` div, a `.card`).
- **Safe where nothing is painted.** Chrome elements with no `-bg-*` background just frost the backdrop behind them — the classic glass navbar effect. Everything outside the chrome list is left untouched: an unpainted page stays crisp, and painted surfaces already read as glass from the token translucency alone (blur is the garnish, not the mechanism).
- **Zero specificity.** The `:where()` wrapper means any consumer rule can override or unset the blur (`backdrop-filter: none`) with a single class.
- Tune depth globally by overriding `--glass-blur`.

### Consuming tokens in both regimes

Never hardcode assumptions about opacity: read surfaces through the tokens and let the regime decide. A `background: var(--bg-panel)` sidebar is opaque in `plain` and frosted under an aura — same code, correct in both worlds.
