---
title: Markgraphy component manifest
description: Manifest of every component against the markdown-graphs reference — file, provenance, what it proves, and build status per unit.
type: markgraphy
---

# Markgraphy component manifest

Full parity with the reference library (`ref/`, markdown-graphs). One dashed frame (`Graph`), one accent, glyphs draw everything, no SVG, zero dependencies.

Status values: `implemented — pending user evaluation` / `assigned` / `planned`.

## Frame (src/lib/frame/)

| Unit | Reference source | What it proves | Status |
| --- | --- | --- | --- |
| Graph | `ref/registry/default/graph-frame/graph-frame.tsx` | Dashed frame via `repeating-linear-gradient`, 4 `+` corners, `[ TITLE ]` figcaption, `aria-labelledby`, tabular-nums | implemented — pending user evaluation |
| GraphBody | same | Frame padding (2rem, 1.5/0.75 tight variant) | implemented — pending user evaluation |
| GraphRule | same | Dashed 1px rule | implemented — pending user evaluation |
| GraphTrack / GraphTick | same | Range tracks that span the frame (flex ticks) | implemented — pending user evaluation |
| GraphArrow | `ref/registry/default/graph-frame/graph-arrow.tsx` | Dashed arrow, accent/stretch variants | implemented — pending user evaluation |
| glyphs.ts | `ref/registry/default/graph-frame/graph-motion.ts` | GLYPH_SETS shade/ascii/hash/bar, resolveGlyphs, trackMarks, intensityLevel/Glyph | implemented — pending user evaluation |
| tone.ts | same | Palette (mono/duo/multi) role logic, series/dim/tone roles | implemented — pending user evaluation |
| motion.ts + motion.css | same | fadeUp/stagger → `reveal` action + `stagger()` cap 280ms, reduced-motion off | implemented — pending user evaluation |
| clock.ts | `ref/registry/default/graph-frame/graph-clock.ts` | parseInstant/formatHms/formatAgo/formatClock, `graphNow` ticking store | implemented — pending user evaluation |
| themes.css | `ref/registry.json` cssVars | Dark/light token sets + override contract | implemented — pending user evaluation |

## Graphs (src/lib/graphs/)

| # | Component | Reference source | Draws | Status |
| --- | --- | --- | --- | --- |
| 1 | GraphTable | `ref/registry/default/graph-table/graph-table.tsx` | Data table, optional footer totals | implemented — pending user evaluation |
| 2 | GraphStat | `ref/registry/default/graph-stat/graph-stat.tsx` | 2–4 large figures with labels | implemented — pending user evaluation |
| 3 | GraphTimer | `ref/registry/default/graph-timer/graph-timer.tsx` | Elapsed / ago / clock | implemented — pending user evaluation |
| 4 | GraphCountdown | `ref/registry/default/graph-countdown/graph-countdown.tsx` | Time left until a date | implemented — pending user evaluation |
| 5 | GraphFlow | `ref/registry/default/graph-flow/graph-flow.tsx` | Process nodes on dashed arrows | implemented — pending user evaluation |
| 6 | GraphTimeline | `ref/registry/default/graph-timeline/graph-timeline.tsx` | Dated events, one row current | implemented — pending user evaluation |
| 7 | GraphMeter | `ref/registry/default/graph-meter/graph-meter.tsx` | Progress as `=`/`-` track | implemented — pending user evaluation |
| 8 | GraphSpark | `ref/registry/default/graph-spark/graph-spark.tsx` | Sparkline from block glyphs | implemented — pending user evaluation |
| 9 | GraphRank | `ref/registry/default/graph-rank/graph-rank.tsx` | Ranked list, one bar per row | implemented — pending user evaluation |
| 10 | GraphCells | `ref/registry/default/graph-cells/graph-cells.tsx` | Filled/empty grid | implemented — pending user evaluation |
| 11 | GraphDiff | `ref/registry/default/graph-diff/graph-diff.tsx` | Add/remove/keep rows | implemented — pending user evaluation |
| 12 | GraphSpec | `ref/registry/default/graph-spec/graph-spec.tsx` | Label/value sheet | implemented — pending user evaluation |
| 13 | GraphBars | `ref/registry/default/graph-bars/graph-bars.tsx` | Two bar groups side by side | implemented — pending user evaluation |
| 14 | GraphCompare | `ref/registry/default/graph-compare/graph-compare.tsx` | Feature matrix ✓/– | implemented — pending user evaluation |
| 15 | GraphKpi | `ref/registry/default/graph-kpi/graph-kpi.tsx` | One number + sparkline | implemented — pending user evaluation |
| 16 | GraphSlope | `ref/registry/default/graph-slope/graph-slope.tsx` | Before → after figures | implemented — pending user evaluation |
| 17 | GraphBullet | `ref/registry/default/graph-bullet/graph-bullet.tsx` | Actual vs target on one track | implemented — pending user evaluation |
| 18 | GraphStack | `ref/registry/default/graph-stack/graph-stack.tsx` | Parts of a whole as glyphs | implemented — pending user evaluation |
| 19 | GraphFunnel | `ref/registry/default/graph-funnel/graph-funnel.tsx` | Steps that narrow | implemented — pending user evaluation |
| 20 | GraphWaffle | `ref/registry/default/graph-waffle/graph-waffle.tsx` | Share of 100 cells | implemented — pending user evaluation |
| 21 | GraphTree | `ref/registry/default/graph-tree/graph-tree.tsx` | File/org tree | implemented — pending user evaluation |
| 22 | GraphUptime | `ref/registry/default/graph-uptime/graph-uptime.tsx` | One glyph per day, % up | implemented — pending user evaluation |
| 23 | GraphPlot | `ref/registry/default/graph-plot/graph-plot.tsx` | Line/area from glyph columns | implemented — pending user evaluation |
| 24 | GraphWaterfall | `ref/registry/default/graph-waterfall/graph-waterfall.tsx` | Running total as floating bars | implemented — pending user evaluation |
| 25 | GraphInvoice | `ref/registry/default/graph-invoice/graph-invoice.tsx` | Bill-to, line items, totals | implemented — pending user evaluation |
| 26 | GraphHeatmap | `ref/registry/default/graph-heatmap/graph-heatmap.tsx` | Labeled 2d intensity matrix | implemented — pending user evaluation |
| 27 | GraphCalendar | `ref/registry/default/graph-calendar/graph-calendar.tsx` | One month, marked days | implemented — pending user evaluation |
| 28 | GraphActivity | `ref/registry/default/graph-activity/graph-activity.tsx` | GitHub-style contribution grid | implemented — pending user evaluation |
| 29 | GraphGantt | `ref/registry/default/graph-gantt/graph-gantt.tsx` | Schedule on a character track | implemented — pending user evaluation |

29 graphs + frame = 30 registry items, matching the reference count (Frame counts as one).
