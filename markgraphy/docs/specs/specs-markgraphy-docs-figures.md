---
title: Markgraphy docs-figure animations
description: Three ASCII diagrams for documentation — GraphSequence (sequence diagram), GraphState (state-machine chart), GraphFlame (flame graph) — built on the animation house recipe. The single most common docs figures after flowcharts: sequence, state, and perf.
type: markgraphy
---

# Specs: docs-figure animations

Status: implemented — pending user evaluation (2026-09-06)

## The question this task started from

> Now create:
> GraphSequence — ASCII sequence diagram: participants on columns, labeled dashed arrows, activations. The single most common docs figure after flowcharts; falls straight out of the existing dashEdge/GraphArrow primitives.
> GraphState — state-machine chart (boxes, labeled transitions, self-loops). Perfect for reducer/agent workflow posts.
> GraphFlame — ASCII flame graph: nested rows, width = time. Perf posts with zero JS.

**Answer: three docs-figure animations added to the `animated` family, each a self-contained
character-cell scene inside the standard `Graph` frame, driven by the same house recipe as
GraphFire/GraphRain/GraphMandala** (deterministic tick, `$effect` + `setInterval` tick, derived
view via `overlayRow`, SSR/reduced-motion frozen developed frames, glyph whitelist
U+2500–259F + `·` only, `on`/`arrow`/`<domain>` classes over `--graph-accent/--text-secondary/--border`).

These are *the* figures technical readers expect to see after a code block. Flowcharts
already live in `GraphFlow` and `GraphFlowPlayer`; the missing trio is the next layer down
in the documentation vocabulary.

## What was implemented

### 1. `src/lib/animated/GraphSequence.svelte` — who calls who, in order

A sequence diagram. Four participants (`Browser`, `Server`, `DB`, `Worker`) on columns;
six messages between them; activation bars on the lifelines. The current message and
its endpoints light up.

- **Participant columns**: at `0.12`, `0.38`, `0.62`, `0.88` of the width, so labels
  centered on each lifeline never collide with the side borders. The columns are
  computed once from `cols` (≥ 40).
- **Header row 1**: participant name only — no `│` punched through the label.
- **Lifelines** (rows 2..N): drawn as `│` glyph (`--border` at 0.5 opacity) on every
  non-header row, in every column.
- **Activations**: when a participant is "busy", its lifeline becomes a `█` filled bar
  in the same column. Hardcoded for the request→DB→Worker→DB→Server→Browser path:
  Browser & Server are active across all 6 message rows; DB during rows 1–4;
  Worker during rows 2–3.
- **Messages** (rows 3..8): one per row. Each draws a `─` dash run, a centered
  label, and a `▶` or `◀` head pointing to the receiver. The label is opaque so it
  sits on top of the dashes without splitting the run.
- **Animation**: `tick` cycles 0→5; `currentMsg = min(tick, len-1)` so the last
  message stays lit when the loop wraps. The current row's arrow class flips to `on`
  (accent + 600 weight), and the `from`/`to` columns flip their `█` to `on` while
  the rest stay `active` (muted).
- **Glyph whitelist**: `│ █ ─ ▶ ◀` only — all U+2500–259F.
- **Props**: `cols` 68, `rows` 12, `speedMs` 600, `label` 'who calls who, in order'.
  Reduced motion freezes on the first message (`GET /api`) with the `Browser → Server`
  endpoints lit and the activation bars in place.

### 2. `src/lib/animated/GraphState.svelte` — state machine, stepping through

A state-machine chart. Four states in a 2×2 grid (`ready`, `think`, `act`, `done`),
with labeled transitions on the arrows. The current state and its outgoing
transition light up.

- **2×2 layout** with hardcoded geometry: 14-wide × 3-tall boxes, gutters between.
  Scene `W = 44`, `H = 15`. Box positions: `ready(2,2)`, `think(24,2)`, `act(24,11)`,
  `done(2,11)`.
- **State boxes**: built from `dashEdge(14)` for top/bottom, with the label centered
  on a `|…label…|` middle row. `boxRow(s, y, cls)` returns the single cell that
  belongs to the current `y` (top edge, label row, or bottom edge) — pushing all
  three on every row of the box would let later cells overwrite earlier ones in
  `overlayRow`, which is how the state labels got visually suppressed in an
  earlier draft of this file. The same shape works for any 1–2 word state name.
- **Horizontal arrows** (`ready → think` at row 3, `act → done` at row 12): drawn
  with a `─` dash run, a centered label, and a `▶` or `◀` head. `hArrowCells(c1, c2,
  lbl, cls)` handles both directions and centers the label inside the dash run.
- **Vertical arrows** (`think → act` at col 38, `done → ready` at col 16): drawn
  column-wise with `│` shafts and a `v`/`^` head. Labels `plan` and `reset` sit
  in the gutter.
- **Transitions** (4): `ask`, `plan`, `ok`, `reset`. Each has a `from`/`to` index
  and a label. The cycle is `ready → think → act → done → ready`.
- **Animation**: `tick` cycles 0→3; `currentState = tick mod 4`; `currentTransition =
  transitions[currentState]`. The current state's box gets `on` class (accent + 600
  weight); the current transition's arrow gets `on` class while others stay `arrow`
  (muted).
- **Glyph whitelist**: `─ │ ▶ ◀ v ^ | dashEdge` — U+2500–259F.
- **Props**: `speedMs` 700, `label` 'state machine, stepping through'.
  Reduced motion freezes on the first state (`ready`) with the `ask` transition lit —
  reads as "ready to begin".

### 3. `src/lib/animated/GraphFlame.svelte` — flame graph, width = time

A flame graph. A root frame `main` with three children (`boot`, `run`, `exit`); two
of them have grandchildren, and one has great-grandchildren. Each frame's width is
its share of the parent's width; siblings sum to the parent. The scene cycles
through four hot leaves; each tick lights the leaf and the chain of ancestors
leading to the root.

- **Tree**:
  - `main` (60) → `boot` (18) / `run` (30) / `exit` (12)
  - `boot` → `init` (8) / `check` (10)
  - `init` → `load` (5) / `parse` (3)
  - `run` → `work` (18) / `tail` (12)
  - `work` → `step` (8) / `io` (10)
- **Layout**: `maxDepth(root) + 1` rows. `layout(frame, row, startX, path, out)`
  walks the tree depth-first, emitting a `Positioned` record per frame and
  recursing into children at `row + 1`. Sibling x-positions accumulate from
  `startX`.
- **Frame rendering** (`renderFrame(name, width, isHot)`):
  - `width < 1` → `''` (invisible)
  - `width === 1` → `│` (collapsed to a single tick)
  - `width === 2` → `││` (just the side borders)
  - `width >= 3` → `│` + left-aligned label + `█` (hot) or `▒` (cool) fill + `│`
- **Path set** (`currentPath`): `Set<string>` of names from the root to the current
  leaf. Used to tag each frame as `inPath` (hot) or not (cool).
- **Animation**: `tick` cycles 0..3 over four pre-defined paths
  (`main/boot/init/load`, `main/boot/init/parse`, `main/run/work/step`,
  `main/run/work/io`). The full ancestor chain glows accent + 600; cool frames
  stay muted.
- **Glyph whitelist**: `│ █ ▒` — U+2500–259F.
- **Props**: `speedMs` 600, `label` 'flame graph, width = time'.
  Reduced motion freezes on the first leaf (`load`) with its chain
  (`main/boot/init/load`) lit — the static frame already reads as "the hot path".

## Integration inventory (same seven surfaces as every component)

| Surface | Change |
| --- | --- |
| `src/lib/index.ts` | `GraphSequence`, `GraphState`, `GraphFlame` + their Props type exports |
| `src/site/docs/catalog.ts` | 3 entries (`graph-sequence`, `graph-state`, `graph-flame`) inserted alphabetically; props tables end with shared `CLASS` |
| `src/site/docs/previews.ts` | 3 entries: `graph-sequence` 'REQUEST', `graph-state` 'AGENT', `graph-flame` 'PROFILE' (all with `title` + `speedMs`); imports updated |
| `src/routes/(site)/llms.txt/+server.ts` | 3 new table rows under "Animated"; "twenty-five" → "twenty-eight" |
| `src/routes/(site)/sitemap.xml/+server.ts` | 3 new slugs inserted in the animated block (`graph-sequence`, `graph-state`, `graph-flame`) |
| `src/routes/(site)/docs/animations/+page.svelte` | 3 demo tiles; imports updated; "Twenty-five" → "Twenty-eight" in title + lead |
| `docs/specs/specs-markgraphy-docs-figures.md` | this document |

## How to evaluate

1. `pnpm check` — 0 errors, 0 warnings.
2. `pnpm build` — succeeds; the three new pages prerender with their frozen frames.
3. Route sweep: `/docs/graph-sequence`, `/docs/graph-state`, `/docs/graph-flame`,
   `/docs/animations` → all 200.
4. On `/docs/animations`:
   - **GraphSequence**: the dashed arrow advances message by message; the current
     pair of participants has its lifeline bar glow accent; the message label sits
     centered on the dashes.
   - **GraphState**: the 2×2 grid cycles `ready → think → act → done → ready`; the
     current state box and the outgoing arrow light up together.
   - **GraphFlame**: the four hot leaves cycle; only the leaf and its chain of
     ancestors glow; the rest stay cool in `▒`.
5. Press the accent dots in the header — all three re-theme with the accent
   (current message arrow, current state box + arrow, hot path frames).
6. Emulate reduced motion (devtools → Rendering → prefers-reduced-motion: reduce) —
   each freezes on its composed frame: first message, `ready` state with `ask` lit,
   `load` leaf with `main/boot/init/load` chain lit.

## Why these three, together

These are the three most common ASCII docs figures technical writing uses after a
flowchart. Together they cover:

- **Time-ordered interactions** between actors — `GraphSequence`.
- **State + transitions** of any finite state machine — `GraphState`.
- **Time as width** in a hierarchical profile — `GraphFlame`.

All three share the same `Graph` frame, the same `--graph-*` tokens, the same
reduced-motion story, and the same `<Graph><GraphBody>…</GraphBody></Graph>`
template. They differ only in the geometry they draw inside.
