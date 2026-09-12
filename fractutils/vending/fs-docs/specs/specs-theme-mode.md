---
id: specs-theme-mode
title: Spec — Theme and Mode
type: spec
tags: [spec, theme, mode, palettes, dark-mode, runtime, pairing]
summary: Definition and technical specification of the theme and mode languages — the 76 paired palettes, the light/dark axis they sit on, cascade order, persistence, and the pairing contract.
updated: 2026-08-31
---

# Spec — Theme and Mode

Status: none claimed — the reviewer verifies. Definition of the two colour
languages that sit beneath the four preset axes: **mode** (light/dark) and
**theme** (which palette fills the token contract).
Registry basis: `REGISTRY.md` §Themes + Amendment A2 (fs2 owns the preset runtime).
Companion reference: [14 — API Reference](../14-api.md).

Unlike the four preset axes, these two are **not** a pure token remap layered on
one palette. Mode selects a whole default palette; theme replaces it. They
interact, and that interaction is the substance of this spec.

---

## §1 — Mechanics

- **Mode** is `data-mode="light" | "dark"` on `<html>`. Absent attribute means
  *follow the OS* — `getMode()` reports `prefers-color-scheme`, not a default,
  so it describes what is actually on screen.
- **Theme** is a class on `<html>` — `class="theme-nordic-frost-dark"`. Absent
  means no palette; the mode defaults in `_00_tokens.sass` stand.
- Both persist: `localStorage['fs2.mode']` and `localStorage['fs2.theme']`.
  Both are restored by `initPresets()` and stamped pre-paint by
  `getPresetScript()`, so a reload shows no flash of the other mode.
- A palette carries its own mode. `setTheme(id)` routes that through
  `setMode()`, so applying a dark palette persists and broadcasts `dark` like
  any other mode change — one path, not two.
- Neither needs JavaScript. A static
  `<html class="theme-night-dark" data-mode="dark">` is fully valid; the
  runtime exists to persist a *choice*, not to make the system work.

---

## §2 — Cascade Order (The Whole Effect)

Position in `index.sass` is the contract. Later wins at equal specificity:

| Layer | Source | Sets |
|:---|:---|:---|
| 1 | `:root` in `_00_tokens.sass` | the light defaults |
| 2 | `[data-mode='dark']` | the dark defaults |
| 3 | `.theme-*` in `_00_themes.sass` | a palette's 22 tokens |
| 4 | `[data-shape]` / `[data-layout]` / `[data-color]` / `[data-motion]` | preset remaps |

Two consequences that are not obvious and that a reviewer must check:

1. **A palette outranks the mode.** `.theme-*` is a class, `[data-mode]` an
   attribute — equal specificity, but themes come later. Flipping mode while a
   palette is applied changes nothing the palette itself defines. This is why
   `toggleThemeMode()` swaps palettes rather than only flipping the attribute.
2. **A theme must never be applied without its mode.** The colour preset's dark
   variants key off `prefers-color-scheme`. A palette set without `data-mode`
   can end up tuned against the OS rather than against itself. `setTheme()`
   sets both together; hand-written markup must too.

---

## §3 — The Pairing Contract

Every palette has a counterpart in the opposite mode. 76 palettes, 38 pairs,
no exceptions.

- Pairing is **declared, not inferred**: a `// twin: <id>` marker above a block
  in `_00_themes.sass` names its counterpart, and `update-registry.js` reads it
  into `ThemeMeta.twin`. Ids that carry a `-light`/`-dark` suffix and have a
  matching sibling pair on that instead.
- Declaration is what allows a pair whose names do not rhyme:
  `theme-catppuccin-mocha` ↔ `theme-catppuccin-latte`,
  `theme-onedark-pro` ↔ `theme-onelight-pro`,
  `theme-light-default` ↔ `theme-dark-default`.
- `twinTheme(id)` is a lookup against that field. It returns `null` only for a
  palette with no declared counterpart — which, after 0.7.1, is none of them.
- 35 of the counterparts are generated (`pnpm pair`). The lightness ramp is
  measured from the three families paired by hand — `sun`, `monochrono`,
  `dracula` — and reproduces them to a mean OKLCH lightness error of
  0.023 / 0.050 / 0.087. Surface chroma is normalised toward the hand-made
  mean rather than scaled by a constant.
- Generated accents keep their source hue. `sun` and `monochrono` flip theirs
  ~180°; `dracula` does not. Two of three families disagreeing is a signature,
  not a rule.
- `pnpm pair` only **adds** counterparts that are missing. It never rewrites an
  existing block, so a hand-tuned palette is safe.

---

## §4 — Never Moves (Opt-outs by Design)

- **The 12 tokens a palette does not set** — the status colours, the shadows,
  and `--ring` — fall through to the per-mode defaults. A palette should not
  have opinions about what "danger" looks like.
- **The four preset axes**: orthogonal. Changing mode or theme never changes
  density, corner shape, tint, or motion.
- **Layout**: no palette or mode changes a single dimension. Colour only.
- **`prefers-reduced-motion`**: unrelated to both.

---

## §5 — Evaluation Protocol (Reviewer)

1. With nothing stored, confirm `getMode()` matches the OS setting and no
   `data-mode` attribute is written.
2. Toggle mode. Confirm the attribute appears, `fs2.mode` is written, and
   `presets.mode` updates in a template.
3. Reload. Confirm the choice survives and there is **no flash** of the other
   mode before paint.
4. Apply a palette. Confirm the class lands, `data-mode` is set to that
   palette's own mode, and both keys persist.
5. Call `toggleThemeMode()`. Confirm it lands on the declared twin — not
   merely on some other palette of the wanted mode, which was the 0.7.0 bug.
6. `setMode(null)` clears the choice and returns to following the OS;
   `setTheme(null)` clears the palette and its mode together.
7. Drive all of the above from a second component and confirm the first stays
   correct — the reactive mirror, not a local snapshot, is the contract.

---

## §6 — Definition Log

- **2026-08-31** — Mode persistence added; `setMode`/`getMode`/`isDark`/
  `onModeChange` published. A duplicate non-persisting `setMode` in `index.ts`
  was shadowing the real one and was removed.
- **2026-08-31** — Theme mode was inferred from `id.includes('-dark')`, which
  mislabelled `theme-catppuccin-mocha` and `theme-onedark-pro` as light. Now
  derived from each palette's own `--bg` luminance.
- **2026-08-31** — `toggleThemeMode()` returned the first palette of the wanted
  mode rather than the active palette's counterpart. `twinTheme()` added.
- **2026-08-31** — Every palette gained a counterpart, growing the set to 76.
  Pairing moved from inferred to declared.
