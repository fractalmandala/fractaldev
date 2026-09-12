---
id: specs-motion-preset
title: Spec — Motion (Energy) Preset
type: spec
tags: [spec, motion, energy, preset, transitions, easing, runtime]
summary: Definition and technical specification of the Motion (Energy) preset language, duration tables, spring curves, affected vocabulary, and proof surface on /previews/motion.
updated: 2026-08-30
---

# Spec — Motion (Energy) Preset

Status: none claimed — the reviewer verifies. Definition of the motion preset language: what each preset does, and exactly which classes it reaches.  
Registry basis: `REGISTRY.md` §Motion language + Amendment A2 (fs2 owns the preset runtime).  
Live proof surface: `/previews/motion` — sticky-controlled board staging **movers only**, all interactive (hover, toggle, open).

---

## §1 — Mechanics

- Four values: `reduced` / `heavy` / `active` (default) / `springy`. `presetAxes.motion` is the canonical order — **least → most energy** (still → slow weight → snappy → overshoot) — and is what the picker renders directly (`presets.svelte.ts:12`, `MotionPicker.svelte`). Default-ness is declared in `presetDefaults` (`active`); it does not dictate array position.
- Applied as `data-motion` on `<html>`. **Absent attribute = active.** Selecting the default removes the attribute; every non-default sets it — round-trip guaranteed.
- Mechanism is a **duration + easing remap**: `--motion-fast/base/slow` and (springy only) `--ease-out` — the curve swaps to the spring bezier (same curve as `--ease-spring`). Heavy slows durations but keeps the standard ease; reduced zeroes durations (transitions snap); springy quickens slightly and overshoots.
- **`prefers-reduced-motion: reduce` zeroes all three durations globally regardless of preset** (registry accessibility ruling, `_00_tokens.sass` end) — OS-level reduced-motion always wins.
- Runtime (fs2-owned per Amendment A2): shared `src/lib/presets.svelte.ts` — `setPreset('motion', v)`, `initPresets()`, `getPresetScript()` pre-paint stamp, `MotionPicker.svelte` (glyph = one arc, amplitude 0/4/8/12). Persistence: `localStorage['fs2.presets']`, non-defaults only.
- Motion never touches spacing, radius, color, or layout.

---

## §2 — Value Table (The Whole Effect)

| Token | reduced | heavy | active (default) | springy |
|---|---|---|---|---|
| `--motion-fast` | 0ms | 200ms | 120ms | 140ms |
| `--motion-base` | 0ms | 300ms | 160ms | 200ms |
| `--motion-slow` | 0ms | 450ms | 240ms | 300ms |
| `--ease-out` | (standard) | (standard) | cubic-bezier(0.16, 1, 0.3, 1) | cubic-bezier(0.34, 1.56, 0.64, 1) |

Defaults ship in `:root` (`_00_tokens.sass`); the three presets in the `[data-motion]` blocks. `--motion-slow` is defined for consumer-side use.

---

## §3 — Affected Vocabulary (Complete Inventory — Movers Only)

| Class | Transition Reads | Source |
|---|---|---|
| `.button` | `background/border/color` $\times$ fast | `_07_interactions.sass` |
| `.switch-track` | `background/border` $\times$ fast | `_06_visuals.sass` |
| `.switch-thumb` | `translate` $\times$ fast | `_06_visuals.sass` |
| `.navtree-link` | `background/color` $\times$ fast | `_05_shells.sass` |
| `.toc-link` | `color` $\times$ fast | `_05_shells.sass` |
| `.tab-trigger` | `color/border` $\times$ fast | `_05_shells.sass` |
| `.drawer` | `transform/visibility` $\times$ base + ease-out | `_05_shells.sass` |
| `.dialog` | `opacity/visibility/translate` $\times$ base + ease-out | `_05_shells.sass` |
| `.popover` | `opacity/visibility/translate` $\times$ fast + ease-out | `_05_shells.sass` |
| `.accordion-content` | `grid-template-rows` $\times$ base + ease-out | `_05_shells.sass` |

Census: these 10 classes are every `var(--motion-*)` / `var(--ease-out)` reference in the library. All staged on `/previews/motion` except `.drawer` (the sidebar drawer's slide — visible on the real shell below 1024px).

---

## §4 — Never Moves (Opt-outs by Design)

- **Instant by construction**: anything without a `transition` declaration never animates regardless of preset.
- **Layout, shape, color axes**: untouched.
- **OS reduced-motion**: overrides all presets (§1).

---

## §5 — Evaluation Protocol (Reviewer)

1. Open `/previews/motion`. Sticky control bar shows picker + live readout (durations + curve).
2. Sweep reduced $\to$ heavy $\to$ active $\to$ springy.
3. Test every staged mover: hover buttons/links/tabs, flip switch, toggle accordion and popover, open dialog.
4. Verify springy exhibits physical overshoot, heavy lingers, and reduced snaps instantly.
5. Reload on non-default: attribute stamped pre-paint, zero transition flash.
