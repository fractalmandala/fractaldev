---
id: specs-color-preset
title: Spec — Color (Tint) Preset
type: spec
tags: [spec, color, preset, tint, surfaces, runtime]
summary: Definition and technical specification of the Color (Tint) preset language, value tables, surface ladder mechanics, and proof surface on /previews/color.
updated: 2026-08-30
---

# Spec — Color (Tint) Preset

Status: none claimed — the reviewer verifies. Definition of the color preset language: what each preset does, and exactly which classes it reaches.  
Registry basis: `REGISTRY.md` §Color language + Amendment A2 (fs2 owns the preset runtime). Dark variants added 2026-08-29.  
Live proof surface: `/previews/color` — sticky-controlled board staging **movers only** (the surface ladder directly + every composition that reads it).

---

## §1 — Mechanics

- Three values: `clean` / `general` (default) / `vibrant`. `presetAxes.color` is the canonical order — **least → most tinted** — and is what the picker renders directly (`presets.svelte.ts:11`, `ColorPicker.svelte`). Default-ness is declared in `presetDefaults` (`general`); it does not dictate array position.
- Applied as `data-color` on `<html>`. **Absent attribute = general** (the theme mixins' values). Selecting the default removes the attribute; every non-default sets it — round-trip guaranteed.
- Mechanism is a **surface-ladder tint**: exactly three tokens remap — `--bg-surface`, `--bg-raised`, `--bg-panel` (`_00_tokens.sass`). Clean flattens the ladder's separation toward the page bg; vibrant deepens it. Mode-aware: light values are the default block, dark values override under both dark paths (`prefers-color-scheme: dark` without `data-mode='light'`, and explicit `data-mode='dark'`).
- Runtime (fs2-owned per Amendment A2): shared `src/lib/presets.svelte.ts` — `setPreset('color', v)`, `initPresets()`, `getPresetScript()` pre-paint stamp, `ColorPicker.svelte` (glyph = one swatch, fill intensity 0 / 0.45 / 1). Persistence: `localStorage['fs2.presets']`, non-defaults only.
- Color never touches ink, theme-color, borders, shadows, radius, spacing, or motion.

---

## §2 — Value Table (The Whole Effect)

| Token | clean | general (default) | vibrant |
|---|---|---|---|
| `--bg-surface` (light) | #fbfbfb | #f8f7f7 | #f2f5f7 |
| `--bg-raised` (light) | #f5f7f9 | #f1f5f9 | #e8eef3 |
| `--bg-panel` (light) | #F7F8F9 | #F1F3F5 | #E9EEF3 |
| `--bg-surface` (dark) | #121626 | #141824 | #171E33 |
| `--bg-raised` (dark) | #171C2C | #1C2232 | #26314E |
| `--bg-panel` (dark) | #10131D | #101420 | #141B2E |

General values ship in the theme mixins (`_00_tokens.sass`); clean/vibrant in the preset blocks (`_00_tokens.sass` §Color). Dark clean/vibrant values are implemented judgments — tuning is the author's call.

---

## §3 — Affected Vocabulary (Complete Inventory — Movers Only)

| Class | Reads | Source |
|---|---|---|
| `.surface` / `.raised` / `.panel` (dress) | the three tokens, directly | `_06_visuals.sass` |
| `.card` | `bg-surface` | `_06_visuals.sass` |
| `.kbd` | `bg-raised` | `_06_visuals.sass` |
| `.switch-track` (unchecked) | `bg-raised` | `_06_visuals.sass` |
| `.badge` | `bg-raised` | `_07_interactions.sass` |
| `.button.ghost:hover` | `bg-raised` | `_07_interactions.sass` |
| `.app-header` | `bg-surface` (color-mix 88%) | `_05_shells.sass` |
| `.mobile-toc` / `.mobile-toc[open]` | `bg-surface` / `bg-raised` | `_05_shells.sass` |
| `.accordion-item` / `.accordion-trigger:hover` | `bg-surface` / `bg-raised` | `_05_shells.sass` |

Census: these reads are every `var(--bg-surface|raised|panel)` reference in the library.

---

## §4 — Never Moves (Opt-outs by Design)

- **Page and chrome backgrounds are not the ladder**: `--bg`, `--bg-footer`, `--bg-popover`, `--bg-dialog`, `--bg-input`, `--bg-terminal`, `--bg-canvas` stay mode-authored.
- **Ink**: `--text-primary/secondary/muted/inverse` stay.
- **Brand + status**: `--theme-color(-alt)`, `--success/warning/danger/info`, `--ring`, `--state-*` stay.
- **Lines + depth**: `--border(-subtle)`, `--shadow-*` stay.
- Radius, spacing, motion: orthogonal axes.

---

## §5 — Evaluation Protocol (Reviewer)

1. Open `/previews/color`. The control bar (picker + live readout of the three tokens + current mode) is sticky.
2. Sweep clean → general → vibrant. The ladder card shows the three tokens directly; every composition card rides them.
3. In dark mode (OS or `[data-mode='dark']`), the sweep re-tints with dark values (§2) — the readout prints them.
4. Reload on clean or vibrant: attribute stamped pre-paint, no flash.

---

## §6 — Definition Log

- **2026-08-29 — IMPLEMENTED: dark variants + monotonic order.** Prior state: color presets were light-only with dark "landing later"; axis order was default-first (`general, clean, vibrant`). Changes: dark value blocks under both dark paths; axis reordered to the monotonic **clean → general → vibrant** with `general` declared as default in `presetDefaults` (position no longer encodes defaultness); the four pickers now share one runtime pattern (monotonic array + separate defaults).
