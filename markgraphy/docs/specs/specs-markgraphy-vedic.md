---
title: Markgraphy vedic animated graphs
description: Eight Hindu-theme ASCII animations — GraphAgni (havan fire), GraphSurya (rising sun wheel), GraphAum (om ink-in with resonance crest), GraphMandala (K-fold lotus bloom), GraphDiya (row of oil lamps), GraphJapa (108-bead mala), GraphDamru (8-beat Adi tala), GraphGanga (three stepped flow lines) — built on the animation house recipe.
type: markgraphy
---

# Specs: vedic animated graphs

Status: implemented — pending user evaluation (2026-09-06)
  - v1: Agni, Surya, Aum — implemented earlier, still intact across all six integration surfaces.
  - v2: Mandala, Diya, Japa, Damru, Ganga — implemented now, the "circle that holds" set.

## The question this task started from

> can you conceptualize some hindu theme animations, like vedic fire/surya or aum etc.?

then:

> make GraphAum.svelte, GraphAgni.svelte and GraphSurya.svelte

**Answer: three decorative animations added to the `animated` family, each a self-contained
character-cell scene inside the standard `Graph` frame, driven by the same house recipe as
GraphFire/GraphRain** (deterministic mulberry32 seed, `$effect` + `setInterval` tick, derived
run-length-encoded view, SSR/reduced-motion frozen developed frames, glyph whitelist
U+2500–259F + `·` only, `hot`/`mid`/`faint` classes over `--graph-accent/--text-secondary/--text-muted`).

## What was implemented

### 1. `src/lib/animated/GraphAgni.svelte` — the havan fire

A kund (fire pit) at the bottom center breathes a flame column upward.

- Pit geometry: `mouth = max(7, round(width * 0.24))` centered; slanted walls `╲` / `╱` converge
  on the mouth row; a `─` floor line under the pit.
- Heat climbs from the mouth (base row pinned at 1) through a 3-cell-average diffusion step,
  shaped by a cone mask that narrows the flame to ~40% at the top so it reads as a tongue.
- `breath = 1 + 0.3·sin(tick/12)` modulates cooling — the fire visibly inhales/exhales.
- Sparks: at most 7 `·` embers rise from the mouth with 30% lateral jitter, `mid` when young,
  `faint` after.
- Glyph tiers: `█` hot ≥ .75, `▓` ≥ .5, `▒` ≥ .3, `░` ember ≥ .12.
- Props: `cols` 56, `rows` 16, `speedMs` 90, `cooling` 0.6, `seedNum` 3,
  `label` 'the carrier of offerings'. Animated pre-roll 16 ticks; reduced motion freezes a
  developed mid-burn frame (`pitRow*2+6` pre-ticks).

### 2. `src/lib/animated/GraphSurya.svelte` — the sun wheel

A spoke disc rises from behind a horizon line, glints spoke by spoke, and sets, forever.

- Disc: radius 5, halo ring to +1.1, and the crucial `aspect = 2.1` correction
  (`dy * aspect`) because terminal cells are ~2× taller than wide — without it the disc is an
  egg. Tiers `█`/`▓`/`▒` by radial distance, `░` halo.
- Spokes: painted as **dense line segments** (24+ samples per ray, deduped via a per-frame
  `rayMap`) from the halo outward, lengths `2.5 + 2·rand()` per spoke — never angle wedges,
  which fragment into disconnected dashes at large radii (first-draft lesson).
- Rotation: geometry is fixed; a brightness wave `b = 0.5 + 0.5·cos(θ − phase)` rides the
  wheel and any spoke under `b > 0.8` renders accent `hot` — exactly one glint travels the
  wheel at a time.
- Motion: smoothstep-eased triangle over `riseTicks` 90 each way; apex travel capped with
  `Math.max(2, horizonY − radius − 3.5)` so the disc never clips the top edge at noon.
- Props: `cols` 60, `rows` 18, `speedMs` 120, `rays` 12, `seedNum` 5,
  `label` 'the mover of days'. Reduced motion freezes a mid-morning frame (`0.3·riseTicks`),
  disc clear of the horizon.

### 3. `src/lib/animated/GraphAum.svelte` — the om ink-in

ॐ drawn stroke by stroke, then held by a traveling resonance crest.

- The figure is five polyline strokes in paint order: bindu, crescent (chandra), upper hump,
  lower hump + tail, om loop. Rasterized once at module load (`rasterizeStrokes()` with a
  `seen` set); every instance shares one cell list and one paint order `s`.
- **Aspect lesson**: the art box is pre-widened to 44×22 (~1.8×) — a square grid renders
  vertically stretched on screen ("snowman" first draft). All stroke coordinates were widened
  through a scratch rasterizer until the figure read round. `cols` floor is 46 (`width =
  Math.max(46, cols)`), default 56.
- Ink-in: over `inkTicks` 46 the strokes appear in paint order; freshly inked cells glow
  accent for 6 ticks (wet ink), then settle to foreground `█`.
- Resonance: settled phase runs a crest at `waveSpeed` 2 with gap 44 along the stroke order —
  cells within `d ≤ 3` of the crest are `hot`, `≤ 12` are `mid`; the wave rests and repeats.
  `seedNum` offsets the phase so several instances shimmer out of sync.
- Props: `cols` 56, `rows` 22, `speedMs` 110, `seedNum` 7,
  `label` 'the primordial vibration'. Reduced motion freezes a settled frame (full ink).

## v2: the circle that holds

Five new animations that revolve around circles, lamps, beads, and rivers —
each kept inside the same `Graph` frame, each driven by the same `mulberry32` seed,
`$effect` + `setInterval` tick, derived run-length-encoded view, SSR/reduced-motion
frozen developed frames, glyph whitelist U+2500–259F + `·` only, and
`hot`/`mid`/`faint` classes over `--graph-accent/--text-secondary/--text-muted`.

### 4. `src/lib/animated/GraphMandala.svelte` — the blooming circle

K-fold rotational symmetry: write one canonical petal, rotate it K times.
Rings bloom ring by ring from a hot bindu; every seed is a different mandala.

- **Canonical petal**: for each cell `(x, y)` relative to the centre, compute polar
  `r = hypot(dx, dy·aspect)` and `θ = atan2(dy·aspect, dx)`, then `θCanon = mod(θ, 2π/K)`.
  A cell belongs to the petal if `r ∈ [r_in, r_out]` and `|sin(K·θ/2)·π/K| ≥ r/8` —
  a half-width that pinches the petal at the centre and opens it at the rim.
- **K-fold symmetry via θCanon**: only the canonical petal is authored; the scene
  rasterizer stamps it K times, one per `θ = θCanon + 2π·j/K` (j = 0..K-1).
  `folds` clamped 3..16 (default 8). With K=8, eight lotus petals per ring.
- **Ring bloom**: each ring i grows over `ringTicks=14` ticks starting at `i·ringTicks`.
  Bloom factor = clamp01((tick - i·ringTicks) / ringTicks). A cell is rendered when
  `r/r_out ≤ bloom`. This produces ring-by-ring outward bloom from the bindu.
- **Per-ring data is seeded**: ring radii are perturbed by `±0.5·(rand() - 0.5)` so
  every seed yields a different mandala (the brief: "every seed = a different mandala").
- **Glyph tier**: `i==0` (bindu) → `█ hot`; inner rings → `▓ mid`; outer → `▒ faint`.
  Slow rotation phase = `tick·0.02` modulates the canonical petal so it shimmers
  without breaking symmetry.
- **Aspect correction**: `aspect = 2.1` so the lotus reads round (terminal cells are
  ~2× taller than wide; without the correction, lotus petals read as fan blades).
- Props: `cols` 48, `rows` 24, `folds` 8, `rings` 5, `speedMs` 130, `seedNum` 11,
  `label` 'the circle that holds'. Reduced motion freezes a fully-bloomed frame.

### 5. `src/lib/animated/GraphDiya.svelte` — the row of light

N oil lamps along the bottom, each a 3×3 flame that lights left-to-right,
breathes together, occasionally gutters and relights. The Diwali component.

- **Lighting sequence**: lamp i lights at `i·litTicks` (8 ticks per lamp), ramps from
  0 → 1 over `litTicks`. After the sequence ends (`tick ≥ N·litTicks`), all lamps
  breathe together.
- **Breathing**: `0.92 + 0.08·sin(tick/3 + lampPhase[i]·2π)`. Amplitude kept tight
  (0.84..1.0) so the still frame reads all-lit (the breathing is felt, not seen —
  a fix from v1: wider amplitude made lamps appear dim in screenshots).
- **Gutter schedule**: each lamp has its own deterministic list of `{start, end}`
  gutter intervals (6 ticks of dying, 8 of relighting). First gutter starts at
  `sequenceTicks + 16..40` (seeded jitter), then `40..68` ticks between gutters.
  Result: occasionally one lamp gutters and relights, but the row never goes dark
  in aggregate.
- **3×3 flame glyph tiers** by row and intensity:
  - row 0 (tip): `< 0.55` → `· faint`, else `░ faint`
  - row 1 (mid): `▒ mid`
  - row 2 (base): `< 0.7` → `▓ mid`, else `█ hot`
  - threshold `<= 0` returns space (was `< 0.18` in v1 — tightened so even a 0.05
    flame shows the base).
- **3-char cup `▀▀▀` + 1-char wick `║`** at the bottom, with the 3×3 flame above.
- Props: `cols` 60, `rows` 14, `lamps` 5 (clamped 1..11), `speedMs` 110,
  `seedNum` 13, `label` 'row of light'. Reduced motion freezes a fully-lit frame
  (initialTick = sequenceTicks so all lamps are bright).

### 6. `src/lib/animated/GraphJapa.svelte` — the 108-bead mala

A mala circle of 108 beads with one marker advancing clockwise, a soft tail behind
it, and a corner counter `X / 108`. The meditative sibling of `GraphTimer`.

- **Mala geometry**: 108 beads at polar `(r·cos(θ), r·sin(θ)/aspect)` with `aspect=2.1`.
  At the top and bottom of the circle, several adjacent beads collapse to the same
  display cell — handled by `beadCells = Map<cellKey, beadIndex[]>` (dedupe), so
  a single cell may represent up to 2 beads without duplicating the glyph.
- **Bead glyph**: `·` (faint) for the bead itself, `▒` (mid) for the next 5 beads
  in the marker's tail (soft tail, no streak). Marker cell is `█ hot` (orange).
- **Revolution shimmer**: on every full revolution (each 108 ticks), the whole
  ring shimmers for the first 6 ticks — all beads temporarily `▒ mid`. This
  visualizes the mala completing a cycle without re-drawing the whole scene.
- **Counter**: `markerX / 108` rendered on the bottom row, right-aligned. The
  `markerX` is `tick mod 108`. `initialTick = ⌊108·0.55⌋ = 59` so the static
  frame shows `60 / 108` mid-mala.
- **Radius**: `r = min(cx-3, (cy-1.5)·aspect)` — prefer horizontal budget,
  fall back to aspect-corrected vertical, leaving 2 rows for the counter.
- Props: `cols` 60, `rows` 22, `beads` 108 (clamped 8..216), `speedMs` 110,
  `label` 'a breath for every bead'. Reduced motion freezes a mid-mala frame.

### 7. `src/lib/animated/GraphDamru.svelte` — the beat of creation

Two triangles meeting at a binding line; on every beat they pulse a shade and
a `▒` ripple expands and fades. The rhythm is an 8-beat Adi tala with clap/wave
counts in the corner.

- **Adi tala pattern** (4+2+2 structure): `BEAT_KIND = [clap, wave-up, wave-down,
  wave-up, clap, wave-up, clap, wave-down]`. Beats 1, 5, 7 are claps; the rest
  alternate wave directions. One tala = 8 beats × 10 ticks = 80 ticks.
- **Triangles**: up triangle (rows lineY-triH..lineY-1, apex top, base bottom,
  base 9 cells wide, height 5 rows) and down triangle (rows lineY+1..lineY+triH,
  mirrored). They meet at a horizontal `─` binding line at `lineY`.
- **Beat pulse**: on each beat boundary, both triangles pulse a shade:
  - clap: `█ hot` (orange, full intensity) for `beatTicks` ticks, fading
    to `▓ mid` (linear) across the beat.
  - wave-up / wave-down: `▒ mid` shifting to `░ faint` across the beat.
- **Ripples**: on every beat, a ring of `▒` cells at radius `r = (age+1)·1.4`
  expands from the binding line and fades over `RIPPLE_TICKS=12` ticks
  (intensity = 1 - age/RIPPLE_TICKS). Aspect-corrected projection so the ripple
  reads as a ring, not an oval.
- **Counter (bottom-right)**: `tala T · beat B/8 · KIND` where T increments every
  80 ticks (full tala) and B = (tick/beatTicks) mod 8.
- Props: `cols` 60, `rows` 16, `speedMs` 220, `label` 'the first sound'.
  Reduced motion freezes a clap beat (initialTick = 0).

### 8. `src/lib/animated/GraphGanga.svelte` — the descent

Three meandering flow lines cascading in steps with a lone diya flame bobbing
downstream. A calmer `GraphStream`.

- **Three lines** at y = 0.25·H, 0.5·H, 0.75·H. Each line is a stepped polyline:
  a horizontal segment, a 1-row step down (two cells: the diagonal `╲` and the
  cell one row below), another horizontal segment, another step. Steps happen
  at the same x positions on all three lines so the rivers cascade in rhythm.
- **Per-cell flow wave**: each cell of a line is `·` (faint) by default; its
  intensity modulates with `0.5 + 0.5·sin(phase + cellIndex·0.7)` (seeded per
  cell) and is updated each tick. Glyph tiers: `█` ≥ 0.85, `▓` ≥ 0.7,
  `▒` ≥ 0.5, `░` ≥ 0.3, else `·`.
- **Diya**: rides the bottom line. Position = `tick mod diyaPathLen` (counts
  only non-step cells, ~24 along the bottom line). Drawn as a 2-cell
  `██ hot` wick+flame + 1-cell `▒` base. Vertical bob: `sin(tick·0.3 + phase)·0.35`
  (subtle drift). `initialTick = ⌊pathLen·0.3⌋` so the diya sits ~1/3 downstream
  in the static frame.
- **Calmer than GraphStream**: speedMs=110 (vs Stream's 80), bob amplitude 0.35
  (gentler), and the steps are deliberate (one per segment) not chaotic.
- Props: `cols` 60, `rows` 18, `speedMs` 110, `seedNum` 17, `label` 'the descent'.
  Reduced motion freezes a mid-flow frame.

## v1 + v2 integration inventory (same seven surfaces as every component)

| Surface | Change |
| --- | --- |
| `src/lib/index.ts` | `GraphAgni`, `GraphAum`, `GraphSurya`, `GraphMandala`, `GraphDiya`, `GraphJapa`, `GraphDamru`, `GraphGanga` + their Props type exports |
| `src/site/docs/catalog.ts` | 8 entries (props tables end with shared `CLASS`); `ANIMATED_SLUGS` += 8 slugs |
| `src/site/docs/previews.ts` | `graph-agni` 'HAVAN' (48×12), `graph-aum` 'AUM', `graph-surya` 'DAWN' (52×14), `graph-mandala` 'YANTRA' (40×20), `graph-diya` 'DIWALI' (60×12), `graph-japa` 'MALA' (52×20), `graph-damru` 'BEAT' (60×12), `graph-ganga` 'GANGES' (60×14) |
| `src/routes/(site)/llms.txt/+server.ts` | 8 table rows; "All eleven animations" → "All fourteen" → "All nineteen" |
| `src/routes/(site)/sitemap.xml/+server.ts` | 8 slugs (inserted alphabetically) |
| `src/routes/(site)/docs/animations/+page.svelte` | 8 demo tiles; "Eleven" → "Fourteen" → "Nineteen" (+ "vedic figures" / "circle that holds") |
| `docs/specs/specs-markgraphy-vedic.md` | this document |

## Verification (evidence)

- `pnpm check` — 0 errors, 0 warnings. Each component declares `svelte-ignore
  state_referenced_locally` above prop-derived const initializers (house pattern).
- `pnpm build` — succeeds; all eight pages prerender with their frozen frames.
- Route sweep: `/docs/graph-agni`, `/docs/graph-aum`, `/docs/graph-surya`,
  `/docs/graph-mandala`, `/docs/graph-diya`, `/docs/graph-japa`,
  `/docs/graph-damru`, `/docs/graph-ganga`, `/docs/animations` → all 200.
- Screenshots (`qa-screenshots/`): `vedic2-mandala.png` (K-fold lotus, hot bindu,
  tiered rings), `vedic2-diya.png` (five lamps lit, even after the breathing
  amplitude tightening), `vedic2-japa.png` (108-bead circle, marker + tail +
  counter), `vedic2-damru.png` (two triangles on binding line, tala 1 beat 1/8
  CLAP), `vedic2-ganga.png` (three stepped lines, lone diya mid-flow),
  `vedic2-wall.png` (all nineteen tiles on the animations page).
- Iterations worth remembering: Diya went through a breathing-amplitude tightening
  (0.7..1.0 → 0.84..1.0) and an initialTick shift (`floor(sequenceTicks·0.85)`
  → `sequenceTicks`) so the still frame shows all lamps clearly lit; the wider
  amplitude had caught the first lamp in its first gutter/relight phase under
  the headless screenshot timing.

## How to evaluate

1. Dev server is running at http://localhost:4173 (started during verification — stop it if
   you restart your own).
2. http://localhost:4173/docs/animations — watch all eight among the nineteen tiles:
   - v1: Agni's fire should breathe and throw sparks; Surya's glint should travel the
     wheel while the disc rises and sets; Aum should ink in, then shimmer along the strokes.
   - v2: Mandala's rings should bloom ring by ring from the bindu; Diya's lamps should
     light left-to-right, breathe, and occasionally gutter; Japa's marker should advance
     clockwise with a soft tail and the counter should read `X / 108`; Damru's triangles
     should pulse on every beat with `▒` ripples and a tala counter in the corner; Ganga's
     three lines should flow and the diya should bob downstream.
3. http://localhost:4173/docs/graph-agni · /docs/graph-aum · /docs/graph-surya ·
   /docs/graph-mandala · /docs/graph-diya · /docs/graph-japa · /docs/graph-damru ·
   /docs/graph-ganga — component pages with props tables and copy-ready snippets.
4. Press the accent dots in the header — all eight re-theme with the accent (fire core,
   sun glint, wet ink / crest, mandala bindu, lamp flame, japa marker, damru clap, ganga
   diya).
5. Emulate reduced motion (devtools → Rendering → prefers-reduced-motion: reduce) —
   each freezes on its composed frame: mid-burn fire, mid-morning sun, settled ॐ,
   fully-bloomed mandala, all-lamps-lit diya, mid-mala japa, clap-beat damru, mid-flow
   ganga.
