---
title: Markgraphy diagram set
description: Porting decisions for the diagram set — tokenized accents, computed ASCII art, skin and monospace discipline, --font-mono repair, glyph coverage checks.
type: markgraphy
---

# Markgraphy diagram set

Ported from `/Users/amrit/fractalmandala/fractalsvelte/src/lib/comps/graphing/` (user's own Svelte components). Status values: `implemented — pending user evaluation` / `planned`.

## Porting decisions

- **Accent system replaced.** The source hard-coded eight hex accents (`ACCENT_COLORS`) per component. Here every diagram reads the `--graph-*` variables (`--graph-accent`, `--graph-foreground`, `--text-secondary`, `--text-muted`, `--border`, `--bg`, `--font-mono`), so the site accent picker re-themes diagrams exactly like graphs. No `accent` prop.
- **Skin replaced.** Rounded 12–14px dark cards became the library's square, dashed-border language (`--border`, flat controls, no border-radius).
- **Art is computed, not hand-counted.** `src/lib/diagram/ascii.ts` builds frame edges and rows from character grids (`dashEdge`, `splitLabeledEdge`, `overlayRow`, pad helpers), so borders line up at any title/label/value width. The source art had several off-by-one rows; the ports guarantee alignment. Helpers are exported for custom figures.
- **Monospace discipline.** No letter-spacing or padding inside the art (both broke the character grid in the source — e.g. the padded `AI` chip became plain accent text); in-art font weights stay ≤ 600 (only 400/500/600 are imported; 700 would synthesize).
- **`--font-mono` token repaired.** The token was missing its semicolon in `themes.css`, so its value swallowed the next declaration (dark `--bg` was lost) and every `font-family: var(--font-mono, …)` fell back to the inherited body font — a proportional sans, which misaligned all character art. Now `"Geist Mono", ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace`.
- **Art glyph set is coverage-checked.** Geist Mono ships box drawing + block elements (fontsource `symbols2` subset, U+2500–259F) but not ▲▼→←, so art uses covered glyphs only (`v`, `^`; `◀▶` and the `▂▃▄▅▆▇█` bars are covered). Verified per-glyph with a canvas advance-width probe: every art glyph equals `M` at 400 and 600.
- **Motion guards.** Amplifier freezes under `prefers-reduced-motion: reduce`; PromptLoop's pulse animation only runs under `no-preference`; both expose an opt-out (`animated`, pause button).

## Diagrams (src/lib/diagram/)

| Unit | Source | What it proves | Status |
| --- | --- | --- | --- |
| parser.ts | `fractalsvelte/.../graphing/parser.ts` | HTML-escape → tokenize `[ TITLES ]`, arrows, glyph blocks, corners, box chars into `.diag-*` spans; `alignBoxLines` | implemented — pending user evaluation |
| ascii.ts | new (port hardening) | Computed frame edges + overlay rows; guarantees art alignment | implemented — pending user evaluation |
| AsciiDiagram.svelte | `AsciiDiagram.svelte` | Tokenized rendering of raw diagrams via `{@html}` of escaped input; copy button; bordered/glow/fontSize/lineHeight/align props; children fallback | implemented — pending user evaluation |
| DiagramEditor.svelte | `DiagramEditor.svelte` | 5 presets, glyph palette (6 groups), auto-align, live preview, copy as text / Svelte / `.svx` (imports rewritten to `'markgraphy'`); `bind:this` replaces `getElementById` | implemented — pending user evaluation |
| AmplifierDiagram.svelte | `AmplifierDiagram.svelte` | Animated taste→amplifier waves (150ms interval), gain slider 1–5x scales output, dB readout | implemented — pending user evaluation |
| NestedRadiiDiagram.svelte | `NestedRadiiDiagram.svelte` | outer/inset sliders drive ASCII art + formula + live CSS preview box | implemented — pending user evaluation |
| PromptLoopDiagram.svelte | `PromptLoopDiagram.svelte` | Six-step player: play/pause/prev/next, seek dots, speed slider, step highlight + pulse | implemented — pending user evaluation |
| MetricsTableDiagram.svelte | `MetricsTableDiagram.svelte` | Cost ledger with labels, calls/time columns, total row; dynamic title width | implemented — pending user evaluation |

## Wiring

| Surface | Change | Status |
| --- | --- | --- |
| `src/lib/index.ts` | All six components + prop types + parser/ascii helpers exported | implemented — pending user evaluation |
| `src/site/docs/catalog.ts` | Six `ComponentDoc` entries (slugs `ascii-diagram`, `diagram-editor`, `amplifier-diagram`, `nested-radii-diagram`, `prompt-loop-diagram`, `metrics-table-diagram`) + Editor in Get-started nav | implemented — pending user evaluation |
| `/docs/[slug]` | Live previews + copyable code for all six | implemented — pending user evaluation |
| `/docs/editor` | Full-width editor playground page | implemented — pending user evaluation |
| `/llms.txt` | "Diagrams" section with use/not-for table | implemented — pending user evaluation |
| `/sitemap.xml` | Six diagram slugs + `/docs/editor` | implemented — pending user evaluation |
| Home gallery | PromptLoop + Amplifier row ("Animated diagrams, same accent") | implemented — pending user evaluation |

## Animated roadmap (ideated 2026-08-30, not started)

Candidates that keep the glyph-only, one-accent, reduced-motion-safe contract:

1. GraphTypewriter — text that types itself with a block cursor, loops; markdown callouts.
2. GraphScope — scrolling oscilloscope from any number series (generalizes Amplifier's wave).
3. GraphFlowPlayer — generic step-player for GraphFlow/GraphTree data (generalizes PromptLoop).
4. GraphLife — Conway's Game of Life in ░▒▓█, seedable, play/step.
5. GraphMandel — ASCII Mandelbrot with slow zoom (the brand is fractal).
6. GraphStream — appending ticker sparkline paired with `graphNow`.
7. GraphPulse — live uptime strip that appends blips.
8. GraphSpinners — spinner family (dots/braille/moon/bar) with a label.
9. GraphTicker — marquee status line `[ OK ] api · [ DEGRADED ] cache`.
10. GraphFire / GraphRain — demoscene fire, matrix rain (decorative, opt-in).

Verification: `pnpm check` (0/0), `/docs/editor`, `/docs/<diagram-slug>`, home gallery, accent picker re-themes all diagrams.
