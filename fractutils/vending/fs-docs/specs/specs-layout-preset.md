---
id: specs-layout-preset
title: Spec — Layout (Density) Preset
type: spec
tags: [spec, layout, density, preset, spacing, padding, gap, runtime]
summary: Definition and technical specification of the Layout (Density) preset language, gap and pad scale factors, affected vocabulary, and proof surface on /previews/layout.
updated: 2026-08-30
---

# Spec — Layout (Density) Preset

Status: none claimed — the reviewer verifies. Definition of the layout preset language: what each preset does, and exactly which classes it reaches.  
Registry basis: `REGISTRY.md` §Layout language + Amendment A2 (fs2 owns the preset runtime).  
Live proof surface: `/previews/layout` — a sticky-controlled board staging **movers only**, split by role (gaps vs pads), plus the canonical sidebar vocabulary. The real app-shell around the page is itself the canonical shell specimen.

---

## §1 — Mechanics

- Three values: `tight` / `comfortable` (default) / `sprawling`. `presetAxes.layout` is the canonical order — **tightest → loosest** — and is what the picker renders directly (`presets.svelte.ts:10`, `LayoutPicker.svelte`). Default-ness is declared separately in `presetDefaults`.
- Applied as `data-layout` on `<html>`. **Absent attribute = comfortable.** Selecting the default removes the attribute; every non-default sets it — round-trip guaranteed.
- Mechanism is **two density factors**: gaps and margins read `calc(var(--space-*) × var(--gap-scale, 1))`; paddings read `calc(var(--space-*) × var(--pad-scale, 1))` — at every use site (utilities and compositions). The attribute block sets only the two factors (`_00_tokens.sass`). Pads and gaps scale at **different rates by design**: uniform scaling is a perceptual no-op (if pad and gap inside a box grow equally, nothing changed); breathing opens when padding outgrows gap.
- **Element sizes, heights, and widths never move.** Control heights stay authored at their comfortable values (26/32/38) under all three presets; width/height utilities are px.
- Runtime (fs2-owned per Amendment A2): `src/lib/presets.svelte.ts` — `setPreset('layout', v)`, `initPresets()`, `getPresetScript()` pre-paint head stamp, `LayoutPicker.svelte`. Persistence: `localStorage['fs2.presets']`, non-defaults only.
- Layout never touches radius, text, motion, or color.

---

## §2 — Factor Table (The Whole Effect)

| Factor | tight | comfortable (default) | sprawling |
|---|---|---|---|
| `--gap-scale` (gaps + margins) | 0.85 | 1 (attribute absent) | 1.2 |
| `--pad-scale` (paddings) | 0.7 | 1 (attribute absent) | 1.5 |

Every `--space-*` step (3xs…3xl) keeps its comfortable clamp; use sites apply the role factor. Example: `--space-sm` $\approx$ 18px $\to$ `gap-sm` 15.3px tight / 21.6px sprawling; `pad-sm` 12.6px tight / 27px sprawling — the pad/gap ratio falls in tight (breathing closes) and rises in sprawling (breathing opens). Control heights: 32px in all three.

---

## §3 — Affected Vocabulary (Complete Inventory — Movers Only)

### §3.1 — Utilities (17 space families, role-split)

- **Gap families** (`gap`, `rgap`, `cgap`): step classes read `calc(var(--space-step) × var(--gap-scale, 1))` (`_02_dimensions.sass`).
- **Pad families** (`pad`, `pad-x`, `pad-y`, `pad-top`, `pad-right`, `pad-bottom`, `pad-left`): steps read `calc(… × var(--pad-scale, 1))`.
- **Margin families** (`marg` + 6 directionals): positives and `--` negatives ride `--gap-scale` (margins separate blocks, the same role as gaps).
- All families $\times$ 9 steps $\times$ 3 bands (base / `-mob` / `-desk`).

### §3.2 — Compositions Reading Spaces (Factor-Wrapped at Use Site)

| Class | Gap/margin reads ($\times$gap-scale) | Pad reads ($\times$pad-scale) |
|---|---|---|
| `.badge` | `gap 3xs` | `pad-inline 2xs` |
| `.input` / `.select` | — | `pad-inline xs` |
| `.button` | — | `pad-inline sm` |
| `.kbd` | — | `pad-inline 2xs` |
| `.card` | `gap sm` | `pad md` |
| `.field` | `gap 3xs` | — |
| `.divider` | `margin-block sm` | — |
| `.app-header` / `.app-footer` | — | `pad-inline sm` |
| `.sidebar-left` / `.sidebar-right` | — | `pad sm` |
| `.mobile-toc` | (open) summary `margin-bottom xs` | `pad xs` · (open) summary `pad-bottom 2xs` |
| `.navtree` | `gap sm` | — |
| `.navtree-title` | — | `pad-inline xs` |
| `.navtree-link` | — | `pad-block 3xs` · `pad-inline xs` |
| `.navtree-sub` | `gap 3xs` | `pad-left sm` |
| `.toc` / `.toc-list` | `gap xs` · `gap 3xs` | — |
| `.toc-title` | — | `pad-inline xs` |
| `.toc-footer` | `margin-top xs` | `pad-top xs` |
| `.tab-list` | `gap 2xs` | — |
| `.tab-trigger` | — | `pad-block 2xs` · `pad-inline xs` |
| `.page-shell` | — | `pad-block md` |
| `.drawer` | — | `pad sm` |

---

## §4 — Never Moves (Opt-outs by Design)

- **Control heights stay locked**: `var(--control-h-*)` stay 26/32/38. Buttons/inputs never grow taller under sprawling or shorter under tight; padding-inline alone adjusts breathing.
- **Literal pixel utilities stay locked**: `.gap-16`, `.pad-24`, `.marg-8` are px, unmultiplied.
- **Widths & heights**: `.w-320`, `.h-48`, `.square-32` are px.
- **Aspect frames**: `.frame-*` are ratios.
- **Text, radius, color, motion**: orthogonal axes.

---

## §5 — Evaluation Protocol (Reviewer)

1. Open `/previews/layout`. Sticky control bar shows picker + live gap/pad factor readout.
2. Sweep tight $\to$ comfortable $\to$ sprawling.
3. Observe gap card vs pad card: pad responds more aggressively than gap by design.
4. Verify control heights (buttons/inputs) remain 32px tall while padding breathes.
5. Reload on tight or sprawling: pre-paint attribute stamped, zero FOUC.
