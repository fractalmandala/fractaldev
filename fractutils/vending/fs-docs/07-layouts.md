---
id: 07-layouts
title: Layouts & Grids
type: design
tags: [layouts, grids, gridding-rules, prose, frames, reel, l3]
summary: Reference guide for Level 3 layout fractals, gridding golden rules, card grids, prose reading measures, aspect frames, and scroll reels.
updated: 2026-08-30
---

Level 3 (L3) fractals govern responsive grid layouts, reading columns, media aspect-ratio frames, and scroll-snap rails. All grids in Fractalstyler2 enforce mathematical harmony and self-sufficiency: grids provide stepping only and carry no hardcoded default gap—compose spacing using `.gap-*`.

## 1. Gridding Golden Rules

To prevent awkward orphan items (such as a 3-item grid breaking into a 2+1 row or a 4-item grid breaking into a 3+1 row), Fractalstyler2 encodes the **Gridding Golden Rules** into its responsive grid scale:

- **Rule 1 (3 items)**: Scales $3 \rightarrow 1$, never $2 + 1$.
- **Rule 2 (4 items or multiples of 4)**: Scales $4 \rightarrow 2 \rightarrow 1$, never $3 + 1$.
- **Rule 3 (6 items)**: Scales $6 \rightarrow 3 \rightarrow 2 \rightarrow 1$ (satisfying both harmonic divisibility rules).

```html
<!-- Harmonic 3-card feature grid with 24px gap -->
<div class="grid-3 gap-md">
  <article class="card">Feature A</article>
  <article class="card">Feature B</article>
  <article class="card">Feature C</article>
</div>

<!-- Harmonic 4-card metric grid with 16px gap -->
<div class="grid-4 gap-sm">
  <div class="card">Metric 1</div>
  <div class="card">Metric 2</div>
  <div class="card">Metric 3</div>
  <div class="card">Metric 4</div>
</div>
```

| Grid Class | Mobile (<640px) | Small (≥640px) | Medium (≥768px) | Large (≥1024px) |
|:---|:---|:---|:---|:---|
| `.grid-1` | 1 column | 1 column | 1 column | 1 column |
| `.grid-2` | 1 column | 1 column | **2 columns** | **2 columns** |
| `.grid-3` | 1 column | 1 column | 1 column | **3 columns** |
| `.grid-4` | 1 column | **2 columns** | **2 columns** | **4 columns** |
| `.grid-6` | 1 column | **2 columns** | **3 columns** | **6 columns** |

---

## 2. Auto-Fit Card Grids (`.card-grid`)

For dynamic collections where item count is variable (for example, product catalogs or agent session cards), `.card-grid` generates an intrinsic, responsive auto-fit grid without requiring manual breakpoint tuning:

```html
<div class="card-grid gap-sm">
  {#each sessions as session}
    <div class="card">...</div>
  {/each}
</div>
```

- **CSS Definition**: `grid-template-columns: repeat(auto-fit, minmax(min(var(--card-min, 280px), 100%), 1fr))`
- **Configuration Knob**: Override `--card-min` locally on the container (e.g. `style="--card-min: 320px;"`) to adjust minimum card width.

---

## 3. Prose Reading Measure (`.prose`)

The `.prose` layout sets an optimal typographic reading measure (bounded to $\le 760\text{px}$) and enforces consistent vertical rhythm between headings, paragraphs, lists, and code blocks:

```html
<article class="prose">
  <h1>Fractal Architecture</h1>
  <p class="text-secondary">A unified styling system for modern desktop and web applications.</p>
  
  <h2>Core Concepts</h2>
  <p>All styling builds upward from token fractals into canonical shells.</p>
</article>
```

- Max-width: `min(100%, 760px)` centered via `margin-inline: auto`.
- Line-height: `1.65` for comfortable reading.
- Vertical spacing: Automatic adjacent-sibling margin (`* + *`) scaled by `--gap-scale`.
- Heading rhythm: Tightened line-height (`1.25`) with proportional top spacing.

---

## 4. Media Aspect-Ratio Frames (`.frame-*`)

Frame presets provide aspect-ratio bounding boxes for images, videos, and embedded previews, ensuring child media — images, video, iframes and inline SVG — covers the container without layout shift:

```html
<!-- 16:9 Video Embed -->
<div class="frame-16-9 radius-md">
  <iframe src="https://example.com/video" title="Video preview"></iframe>
</div>

<!-- 1:1 Square Avatar / Product Image -->
<div class="frame-1-1 radius-full">
  <img src="/avatar.png" alt="User avatar" />
</div>
```

| Class | Aspect Ratio | Primary Use Case |
|:---|:---|:---|
| `.frame-16-9` | `16 / 9` | Widescreen video embeds, dashboard header banners |
| `.frame-9-16` | `9 / 16` | Mobile vertical video previews, story cards |
| `.frame-4-3` | `4 / 3` | Standard photography, presentation slides |
| `.frame-3-4` | `3 / 4` | Portrait images, document covers |
| `.frame-3-2` | `3 / 2` | Landscape photography, artwork |
| `.frame-2-3` | `2 / 3` | Tall portrait photography, poster cards |
| `.frame-1-1` | `1 / 1` | Square icons, profile avatars, album artwork |

---

## 5. Scroll-Snap Reel (`.reel`)

The `.reel` class provides a human-driven, smooth horizontal scroll rail with native CSS scroll-snap:

```html
<div class="reel gap-sm pad-x-sm">
  <div class="card shrink-0 w-240">Card 1</div>
  <div class="card shrink-0 w-240">Card 2</div>
  <div class="card shrink-0 w-240">Card 3</div>
</div>
```

- Native horizontal scroll-snap: `scroll-snap-type: inline mandatory`.
- Inertial containment: `overscroll-behavior-inline: contain`.
- Snap alignment: `scroll-snap-align: start` on every direct child.

[Next - Shells and Markups](./08-shells-and-markups.md)
