---
id: specs-shape-preset
title: Spec — Shape (Corner Radius) Preset
type: spec
tags: [spec, shape, radius, preset, corners, runtime]
summary: Definition and technical specification of the Shape preset language, channel tables, affected vocabulary, and proof surface on /previews/shape.
updated: 2026-08-31
---

# Spec — Shape (Corner Radius) Preset

> The axis is named **shape** everywhere in the API — `data-shape`,
> `presetAxes.shape`, `setPreset('shape', …)`, `ShapePicker`. "Radius" describes
> what it remaps, not what it is called.

Status: none claimed — the reviewer verifies. Definition of the shape preset language: what each preset does, and exactly which classes it reaches.  
Registry basis: `REGISTRY.md` §Shape language + Amendment A2 (fs2 owns the preset runtime).  
Live proof surface: `/previews/shape` — a sticky-controlled board that stages **the workings only** (§3's 11 movers, each labeled with its P-code).

---

## §1 — Mechanics

- Four values: `round` / `curved` (default) / `pro` / `sharp`. `presetAxes.shape` is the canonical monotonic order — **roundest → sharpest** — and is what the picker renders directly (`presets.svelte.ts:11`, `ShapePicker.svelte:14`). Default-ness is declared separately in `presetDefaults` (`presets.svelte.ts:18`); it does not dictate array position.
- Applied as `data-shape` on `<html>`. **Absent attribute = curved** (the default per `presetDefaults`). Selecting the default removes the attribute; every non-default sets it — round-trip guaranteed.
- Mechanism is a pure token remap: the preset rewrites the three radius channels (`_00_tokens.sass`); no component CSS changes.
- Runtime (fs2-owned per Amendment A2): `src/lib/presets.svelte.ts` — `setPreset('shape', v)`, `initPresets()`, `getPresetScript()` pre-paint head stamp, `ShapePicker.svelte`. Persistence: `localStorage['fs2.presets']`, non-defaults only.
- `prefers-reduced-motion` is orthogonal; shape never touches motion, color, or spacing.

---

## §2 — Channel Table (The Whole Effect)

| Channel | round | curved (default) | pro | sharp |
|---|---|---|---|---|
| `--radius-sm` | 16px | 8px | 4px | 0 |
| `--radius-md` | 24px | 16px | 8px | 0 |
| `--radius-lg` | 32px | 24px | 16px | 0 |

`:root` defaults and all four `[data-shape]` blocks in `_00_tokens.sass` carry this table.

---

## §3 — Affected Vocabulary (Complete Inventory — Movers Only)

Full census: `border-radius` appears across the 11 channel readers below, the `--radius-full` trio (§4), and literal utilities (§5).

### §3.1 — Reads `--radius-sm` (6)

| Code | Class | Source | Proof on `/previews/shape` |
|---|---|---|---|
| P1 | `.button` (+ `.primary`, `.ghost`, `.is-icon`, `.active`) | `_07_interactions.sass` | sm card (buttons); picker glyphs |
| P2 | `.badge` | `_07_interactions.sass` | sm card (badge) + card corner tags |
| P3 | `.kbd` | `_06_visuals.sass` | sm card (⌘K) |
| P4 | `.input` | `_07_interactions.sass` | sm card (input) |
| P5 | `.select` | `_07_interactions.sass` | sm card (select) |
| P6 | `.navtree-link` | `_05_shells.sass` | sm card (navtree links) + left rail $\ge$lg |

### §3.2 — Reads `--radius-md` (4)

| Code | Class | Source | Proof on `/previews/shape` |
|---|---|---|---|
| P7 | `.card` | `_06_visuals.sass` | every card on the board |
| P8 | `.popover` | `_05_shells.sass` | md card |
| P9 | `.accordion-item` | `_05_shells.sass` | md card + left rail accordions |
| P10 | `.mobile-toc` | `_05_shells.sass` | md card (details specimen) + page-top dropdown |

### §3.3 — Reads `--radius-lg` (1)

| Code | Class | Source | Proof on `/previews/shape` |
|---|---|---|---|
| P11 | `.dialog` | `_05_shells.sass` | modal preview |

---

## §4 — Intentionally Circular (`--radius-full` = 9999px)

The following controls deliberately remain circular across all shape presets (even under `sharp`):
- `.avatar`: 32px user profile circle.
- `.switch-track`: pill-shaped toggle container.
- `.switch-thumb`: 16px circular toggle knob.

---

## §5 — Literal Utilities (Opt-outs by Design)

- Literal classes (`.radius-0`, `.radius-4`, `.radius-8`, `.radius-16`, `.radius-full`) are unremappable exact pixel values.

---

## §6 — Evaluation Protocol (Reviewer)

1. Open `/previews/shape`. Sticky control bar shows picker + live channel readout.
2. Sweep round $\to$ curved $\to$ pro $\to$ sharp.
3. Verify `sharp` turns all 11 movers to strictly $0\text{px}$ sharp $90^\circ$ corners while avatar and switches remain circular.
4. Reload on non-default: attribute stamped pre-paint, zero visual flash.
