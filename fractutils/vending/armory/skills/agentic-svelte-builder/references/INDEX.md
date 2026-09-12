# Native HTML + CSS Svelte 5 Component Library (Zero-JS Architecture)

This documentation directory contains implementation guides for **44 native HTML/CSS recipes** and **24 Svelte 5 recipes**. The two counts are recipe counts, not unique component counts: **14 component names intentionally have both variants**. The machine-readable routing source is [`MANIFEST.json`](./MANIFEST.json).

The native recipes use HTML and CSS where possible; the Svelte recipes add Runes,
snippets, controlled state, and SvelteKit integration where needed. Recipe code blocks
are reference material. Generated components must follow the active workspace contract,
including external indented SASS when the Svelte Boss requires zero in-component styles.

---

## 37 Tier 1: 100% Native HTML + CSS Components (Zero JS Required)

These components rely 100% on native HTML5 / modern CSS specifications (Popover API, CSS Anchor Positioning, `:has()`, `<details name="...">`, `<dialog>`, etc.) with zero functional loss when JS is disabled.

| Component | Documentation File | Core Native Mechanism |
| :--- | :--- | :--- |
| **Accordion** | [`accordion.md`](./accordion.md) | `<details name="...">` + `<summary>` |
| **Alert** | [`alert.md`](./alert.md) | `<aside role="alert">` + CSS variants |
| **Aspect Ratio** | [`aspect-ratio.md`](./aspect-ratio.md) | CSS `aspect-ratio` property |
| **Avatar** | [`avatar.md`](./avatar.md) | `<img>` + CSS `object-fit` and fallback styling |
| **Badge** | [`badge.md`](./badge.md) | `<span>` / `<mark>` + CSS styling |
| **Breadcrumb** | [`breadcrumb.md`](./breadcrumb.md) | `<nav aria-label="Breadcrumb"><ol>` |
| **Button** | [`button.md`](./button.md) | `<button>` + `HTMLButtonAttributes` rest props |
| **Button Group** | [`button-group.md`](./button-group.md) | Flexbox container + border-collapse styling |
| **Card** | [`card.md`](./card.md) | `<article>` container + SASS nesting |
| **Checkbox** | [`checkbox.md`](./checkbox.md) | `<input type="checkbox">` + `$bindable(checked)` |
| **Collapsible** | [`collapsible.md`](./collapsible.md) | `<details>` + `<summary>` element |
| **Dialog** | [`dialog.md`](./dialog.md) | Native `<dialog>` + Invoker Commands / Popover API |
| **Empty State** | [`empty.md`](./empty.md) | Presentational container + SVG |
| **Field** | [`field.md`](./field.md) | `<fieldset>` + `<legend>` layout wrapper |
| **Input** | [`input.md`](./input.md) | `<input>` + `HTMLInputAttributes` + `$bindable(value)` |
| **Input Group** | [`input-group.md`](./input-group.md) | Flexbox wrapper combining `<input>` with labels |
| **Item** | [`item.md`](./item.md) | Presentational list item / layout box |
| **Kbd** | [`kbd.md`](./kbd.md) | Standard HTML `<kbd>` tag |
| **Label** | [`label.md`](./label.md) | Standard HTML `<label for="...">` |
| **Native Select** | [`native-select.md`](./native-select.md) | `<select>` + `<option>` + `$bindable(value)` |
| **Popover** | [`popover.md`](./popover.md) | Popover API (`popover`) + CSS Anchor Positioning |
| **Progress** | [`progress.md`](./progress.md) | Native HTML `<progress>` element |
| **Radio Group** | [`radio-group.md`](./radio-group.md) | `<fieldset>` + `<input type="radio">` + `$bindable(value)` |
| **Scroll Area** | [`scroll-area.md`](./scroll-area.md) | CSS `overflow: auto` + custom scrollbar styling |
| **Select** | [`select.md`](./select.md) | Customizable `<select>` with CSS `appearance: base-select` |
| **Separator** | [`separator.md`](./separator.md) | HTML `<hr>` / `<div role="separator">` |
| **Skeleton** | [`skeleton.md`](./skeleton.md) | `<div>` with CSS `@keyframes` shimmer animation |
| **Slider** | [`slider.md`](./slider.md) | Native `<input type="range">` + `$bindable(value)` |
| **Spinner** | [`spinner.md`](./spinner.md) | SVG or `<div>` with CSS `@keyframes rotate` |
| **Switch** | [`switch.md`](./switch.md) | Native `<input type="checkbox" role="switch">` |
| **Table** | [`table.md`](./table.md) | Standard HTML `<table>` elements |
| **Tabs** | [`tabs.md`](./tabs.md) | CSS `:checked` radio inputs + CSS `:has()` / sibling selector |
| **Textarea** | [`textarea.md`](./textarea.md) | Standard HTML `<textarea>` + `$bindable(value)` |
| **Toggle** | [`toggle.md`](./toggle.md) | `<input type="checkbox">` styled as toggle button |
| **Toggle Group** | [`toggle-group.md`](./toggle-group.md) | `<fieldset>` with styled radio/checkbox buttons |
| **Tooltip** | [`tooltip.md`](./tooltip.md) | CSS Anchor Positioning + `:hover`/`:focus-visible` |
| **Typography** | [`typography.md`](./typography.md) | Native `<h1>`-`<h6>`, `<p>`, `<blockquote>`, `<code>` |

---

## 7 Tier 2: CSS + HTML Primary Components (Minor JS Enhancement optional)

These components leverage CSS scroll-snap, popovers, and anchor positioning for 90%+ of their function, relying on minimal JS only for optional features like auto-play timers or gesture physics.

| Component | Documentation File | Native CSS/HTML Mechanism | Optional JS Enhancement |
| :--- | :--- | :--- | :--- |
| **Carousel** | [`carousel.md`](./carousel.md) | CSS `scroll-snap-type: x mandatory` | Auto-play timers & pagination buttons |
| **Drawer / Sheet** | [`drawer.md`](./drawer.md) | `<dialog>` / Popover API + `@starting-style` | Drag-to-dismiss touch gesture physics |
| **Dropdown Menu** | [`dropdown-menu.md`](./dropdown-menu.md) | Popover API / CSS focus-within | Complex keyboard ARIA arrow key navigation |
| **Hover Card** | [`hover-card.md`](./hover-card.md) | CSS `:hover` + CSS Anchor Positioning | Hover-intent delay timers |
| **Navigation Menu** | [`navigation-menu.md`](./navigation-menu.md) | CSS mega-menus using `:hover` or Popover API | Hover delay timers & sliding active indicators |
| **Pagination** | [`pagination.md`](./pagination.md) | Standard HTML `<a>` links (`?page=N`) | Client-side SPA navigation without reloads |
| **Sidebar** | [`sidebar.md`](./sidebar.md) | CSS checkbox / Popover API collapsible sidebar | LocalStorage state persistence across reloads |
