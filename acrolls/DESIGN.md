# Fractal Design & UI Invariants Guide

This document establishes the design principles, structural invariants, and layout heuristics for developers and AI agents using the **Fractal Design System**.

---

## 1. System Responsibilities vs. Project Design Invariants

| System Layer (`_fractals.sass`)                                                                                  | Project Design Invariants (`DESIGN.md`)                                                   |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Provides the raw physical primitives (`+box`, `+row`, `+surface`, `+cols`, `=control`, `=select`, `=partition`). | Defines the structural hierarchy and grid choices for pages and cards.                    |
| Provides the fluid Utopia token scales (`--space-*`, `--radius-*`, `--text-*`).                                  | Prescribes specific density tokens (e.g. 3px/6px radius, tight title-description rhythm). |
| Guarantees zero specificity conflicts via the cascade order.                                                     | Guides how to compose tags, titles, descriptions, and pinned footers cleanly.             |

---

## 2. Strict 21-Token Contract (The Theme & Color Law)

All surface, border, and ink decisions must strictly resolve from the 21 theme variables defined in `_tokens.sass` and `fractalthemer/_themes.sass`:

- **Surfaces**: `--bg`, `--bg-surface`, `--bg-raised`, `--bg-panel`, `--bg-footer`, `--bg-popover`, `--bg-dialog`, `--bg-terminal`, `--bg-input`, `--bg-canvas`
- **Text & Ink**: `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`
- **States & Feedback**: `--state-hover`, `--state-hover-subtle`, `--state-selected`
- **Borders & Accents**: `--border`, `--border-subtle`, `--theme-color`, `--theme-color-alt` _(aliased to `--theme`)_

> [!CAUTION]
> **Zero Tolerance for Foreign CSS Variables**:
> Never introduce ad-hoc variables like `--card`, `--primary`, `--accent`, `--destructive`, or `--border-strong`. All components must consume the 21-token contract.

---

## 3. Grid Selection & Reading Column Law

When designing grids, choose the layout class based on item count and container context:

```
Full-Width Page (1200px+) ────────────►  .grid-4 (4 cols) or .grid-3 (3 cols)
Reading Column / Docs Shell (<=760px) ─►  .grid-2 (MAX 2 cols) or .card-grid (Auto-fit min 16rem)
Side-by-side / Comparisons (2 items) ──►  .grid-2 (2 desktop ──► 1 mobile)
Micro-icons / Swatches (6 items)     ──►  .grid-6 (6 desktop ──► 4 tablet ──► 2 mobile)
```

### The Reading Column Max Columns Law

Any grid placed within a constrained reading measure (`.docs-main`, `.center-column`, `.measure`, or bounded reading layout $\le 760\text{px}$) must **NEVER exceed 2 columns** (`.grid-2` or `cols={2}`). 3 and 4-column grids are strictly reserved for full-width viewports (`.app-main`).

---

## 4. Card Anatomy & Containment Invariants

A card is an **anchored vertical structure**. It must never have items floating randomly or overflowing horizontal bounds.

```
+──────────────────────────────────────────────+
│ 1. Top Section (Optional)                    │
│    • .frame (16:9 thumbnail preview)         │
│    • Or Category Badge / Version Chip        │
├──────────────────────────────────────────────┤
│ 2. Heading Group (Tight Vertical Rhythm)     │
│    • Title: text-sm / text-md (weight-600)   │
│    • Description: muted text-sm (gap-3xs)    │
├──────────────────────────────────────────────┤
│ 3. Tags & Badges Cluster                     │
│    • .row.wrap.gap-3xs (#tag badges)         │
├──────────────────────────────────────────────┤
│ 4. Footer & Actions (Pinned with Partition)  │
│    • margin-top: auto; padding-top: xs/s     │
│    • border-top: 1px solid var(--border)     │
│    • .row.wrap.ycenter.xbetween.gap-xs       │
+──────────────────────────────────────────────+
```

### Golden Invariants for Cards

1. **Top-Anchored Alignment**:
   Cards always align their flow from top to bottom (`justify-content: flex-start`). Do not use `ycenter` or `yevenly` on cards.
2. **Card Containment (Zero Overflow)**:
   Child elements within cards must NEVER cause horizontal overflow. All multiple-button rows, tag collections, or badge clusters must use `.row.wrap` or `.cluster`. Control components (`.switch-track`, `.avatar`, `.is-icon`) must have `flex-shrink: 0` so they never distort when placed beside fluid text.
3. **Pinned Partition Footer**:
   Card footers must always combine `margin-top: auto`, reciprocal padding (`padding-top: var(--space-xs)` or `var(--space-s)`), and `border-top: 1px solid var(--border)`. Text and badges must NEVER touch or jut directly against a divider line.

---

## 5. UI Geometry & Defect Prevention Invariants

### 5.1 Form Control Optical Baseline Invariant

Native `<select>` and `<input>` elements must always use `=control` / `=select` / `.select` with optical line-height (`line-height: 1.2`) and custom chevron right padding (`padding-right: 28px`). Never apply raw `.input` classes directly to `<select>` elements, which causes vertical glyph truncation in WebKit/macOS.

### 5.2 Partition Breathing Room Invariant

Every divider line (`border-top` or `border-bottom`) that partitions a card, panel, sidebar, or TOC section MUST have reciprocal padding (`var(--space-xs)` or `var(--space-s)`). Content text or action links must NEVER touch a border line directly.

### 5.3 Responsive Shell Invariant

Mobile navigation triggers, drawer buttons, and mobile topbars must strictly use `.hide-desktop` or `+at(lg) display: none !important`. Desktop views must never render redundant drawer triggers.

### 5.4 Mobile Table of Contents Invariant

When 3-column layouts collapse to single-column on mobile (< 1024px), the Table of Contents must transform into an inline collapsible disclosure (`On this page ▾`) placed directly beneath the document header, preserving navigation for mobile readers.

---

## 6. Motion & Physics Standards (`@humanspeak/svelte-motion`)

```
+─────────────────────────────────────────────────────────────────────────────+
│ 1. Spring Physics Presets ($lib/ease.ts)                                     │
│    • SPRING_TIGHT:  { stiffness: 400, damping: 30 } (Pill indicator / Tooltips)│
│    • SPRING_BOUNCE: { stiffness: 350, damping: 20 } (Elastic switches / Icons)│
│    • SPRING_SWAP:   { stiffness: 500, damping: 35 } (State morph transitions) │
│    • SPRING_SLOW:   { stiffness: 200, damping: 25 } (Page / Sheet entrances)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Magnetic Attraction Thresholds                                           │
│    • Max attraction factor: 0.15 to 0.35                                    │
│    • Transition curve: cubic-bezier(0.34, 1.56, 0.64, 1)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. Reduced Motion Accessibility Rule                                        │
│    • All CSS animations must include @media (prefers-reduced-motion: reduce) │
+─────────────────────────────────────────────────────────────────────────────+
```
