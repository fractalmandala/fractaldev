---
title: Markgraphy observability graphs
description: Three SRE / dashboard-themed static graphs — GraphLatency (p50/p95/p99 band chart with spike markers), GraphSlo (error-budget burn bar over a window), GraphQuota (usage vs limit vs reset-date, billing-style) — built on the static-graph house style.
type: markgraphy
---

# Specs: observability graphs

Status: implemented — pending user evaluation (2026-09-06)

## The question this task started from

> now create : GraphLatency — p50/p95/p99 band chart with spike markers. Pairs
> naturally with GraphUptime/GraphPulse. GraphSlo — error-budget burn bar over a
> window ("62% of 30-day budget spent"). GraphQuota — usage vs limit vs
> reset-date, billing-style.

**Answer: three static (non-animated) graphs added to the `graphs` family**, each
a self-contained panel inside the standard `Graph` frame. They follow the same
house recipe as GraphUptime, GraphMeter, and GraphStat (revealed staggered cells,
scoped CSS with `--graph-accent`/`--graph-accent-2`/`--graph-accent-3`/`--text-secondary`/
`--border`/`--graph-foreground`, no Tailwind, no SVG, ASCII/Unicode glyphs
only). They are designed to be read next to each other on a status page.

## What was implemented

### 1. `src/lib/graphs/GraphLatency.svelte` — the percentile band chart

A 1-ch-per-column percentile band chart. Each column stacks the p50 fill (`█`)
at the bottom, the p50→p95 band (`▓`) above it, and the p95→p99 band (`▒`)
above that. A separate row above the plot draws a `^` over columns whose
`spike: true` flag is set. A stats row below the plot shows p50 / p95 / p99 /
peak p99 / spike count.

- **Levels** are computed per point in the chosen unit (default `ms`) and
  scaled to the largest value across the data (`max(p99)` by default; `max`
  prop locks the y-scale).
- **Mapping per row from the bottom**: rows `0 ≤ r < p50Level` paint `█` (p50
  fill, accent); `p50Level ≤ r < p95Level` paint `▓` (p95 band, accent-2 or
  foreground under mono); `p95Level ≤ r < p99Level` paint `▒` (p99 band,
  accent-3 or muted under mono); rows above `p99Level` are blank.
- **p50 floor**: `p50Level = max(1, levelOf(p50, scale, rows))` so columns with
  a near-zero median still show at least one filled row.
- **Spike row** above the plot: 1ch per data point, `^` rendered only on
  columns with `point.spike === true`, in the accent color. All other slots
  are transparent (not blank) so the column grid stays aligned.
- **Y-axis** (4-ch `yscale` column on the left) shows `formatTick(max)` at
  the top and `0` at the bottom. **X-axis** (under the plot) shows the
  `labels[0]` and `labels[1]` strings flanking a `GraphRule`.
- **Stats row** below the plot: `p50 142ms  p95 612ms  p99 1.1s  peak p99
  1.4s  spikes 2` — formatted with `formatMs()` (`s` suffix above 1000ms,
  integer ms below).
- Props: `data: LatencyPoint[]`, `unit` (default `"ms"`), `height` (default 8,
  clamped 3–15), `labels?: [string, string]`, `max?: number`, `palette`,
  `corner`, `class`.
- `LatencyPoint = { p50, p95, p99, spike? }`.

### 2. `src/lib/graphs/GraphSlo.svelte` — the error-budget burn bar

A horizontal fill bar in the style of `GraphMeter` (`[ ████ · · · · ] 62%`)
with a context block underneath: window, burn rate, time-to-empty, target,
actual. Optionally a daily-burn sparkline above the bar. The bar turns warn
color when the projected end-of-window is earlier than the window close.

- **Bar**: 24 ticks, fill glyph `█` for spent, dim `·` trail for remaining.
  The `pct` on the right shows the percent of budget consumed, in the warn
  color when the budget will exhaust before the window closes.
- **Optional daily sparkline** above the bar: 1ch per daily sample, scaled to
  the largest, glyph set `▁▂▃▄▅▆▇█`. Skipped entirely if `daily` is omitted
  or empty.
- **Context block** below the bar: `window`, `burn rate`, `time-to-empty`,
  `target`, `actual`. `time-to-empty` is in the chosen unit; `burn rate` is a
  × multiplier; `target`/`actual` are rendered as percent strings.
- **Math** (the bit that bit first):
  - `pace = spent / elapsed` (per-unit rate of budget consumption).
  - `inferredRate = burnRate ?? (pace * window)` — so 1× means "consuming
    budget at the on-pace rate".
  - `timeToEmpty` is in the chosen unit, computed as either
    `(remaining * window) / burnRate` (when `burnRate` is given) or
    `(remaining * elapsed) / spent` (when inferred from elapsed). **Not**
    `(remaining / inferredRate)` — that would be in window-fractions, not
    days, and the static display was originally 0.4 instead of 11.
  - `willExhaust = timeToEmpty < (window - elapsed)`.
- **Warn color** (`--graph-accent-3`) is applied to: the `pct` (when
  `willExhaust`), the burn rate (when `> 1×`), the time-to-empty (when
  `willExhaust`), the actual (when it exceeds target), and the flag line
  `↗ will exhaust the budget before the window closes`.
- Props: `budget: 0..1`, `window` (default 30), `unit` (default `"d"`),
  `target?`, `actual?`, `burnRate?`, `elapsed?`, `daily?: number[]`,
  `caption?`, `corner`, `class`.

### 3. `src/lib/graphs/GraphQuota.svelte` — the billing-style usage bar

A big headline "X / Y unit" above the bar, with a context block underneath:
resets, days left, projected, avg/day, pace. A warn color treatment kicks in
when the end-of-window projection would exceed the limit.

- **Headline**: large `used / limit unit` line — `used` in the accent color
  (warn when projected to exceed), `limit` in the foreground, `unit` muted.
- **Bar**: 24 ticks, identical to `GraphSlo`'s bar. Filled ticks go
  `--graph-accent` when on track and `--graph-accent-3` (warn) when
  `willExceed`.
- **Projection**: `projection = (used / daysInto) * daysTotal` (only if both
  `daysInto` and `daysTotal` are given). `projectedPct = projection / limit`.
- **Pace label**: `over budget` if `projectedPct > 100`, `tight` if
  `≥ 95`, `on track` if `≥ 75`, else `ahead`. `pace` and `projected` go
  warn when the projection exceeds the limit.
- **Optional `format` prop** for non-integer or unusual unit displays
  (defaults to `Math.round(n).toLocaleString('en-US')` for thousands
  grouping).
- **Flag line** (when over budget): `↗ projected to exceed the limit before
  reset` in the warn color.
- Props: `used`, `limit`, `unit?`, `resets?`, `daysInto?`, `daysTotal?`,
  `format?`, `caption?`, `corner`, `class`.

## Integration inventory

| Surface | Change |
| --- | --- |
| `src/lib/graphs/GraphLatency.svelte` | new — 340 lines, 1ch columns + spike row + 5-stat footer |
| `src/lib/graphs/GraphSlo.svelte` | new — 312 lines, 24-tick bar + daily sparkline + 5-row context |
| `src/lib/graphs/GraphQuota.svelte` | new — 303 lines, headline + 24-tick bar + 5-row context |
| `src/lib/index.ts` | 3 default exports + 3 type exports (`LatencyPoint`, `GraphLatencyProps`, `GraphSloProps`, `GraphQuotaProps`) inserted alphabetically |
| `src/site/docs/catalog.ts` | 3 new entries (after `graph-uptime`, before `graph-slope`); props tables include the shared `PALETTE`/`CORNER`/`CLASS` rows where appropriate |
| `src/site/docs/previews.ts` | 3 new imports (alphabetical in the static block); 3 new entries: `graph-latency` 'CHECKOUT' (30 cols, 2 spikes), `graph-slo` 'CHECKOUT 99.9%' (62% / 30d / 1.4×), `graph-quota` 'API QUOTA — OPENAI' (124,500 / 200,000, projected 207,500 → over budget) |
| `src/routes/(site)/llms.txt/+server.ts` | 3 new `ComponentRow` entries (Latency, SLO, Quota) inserted alphabetically in `COMPONENTS`. The "All N animations" prose is unchanged because these are not animated. |
| `src/routes/(site)/sitemap.xml/+server.ts` | 3 new slugs (`graph-latency`, `graph-quota`, `graph-slo`) inserted alphabetically in `DOC_SLUGS` |
| `docs/specs/specs-markgraphy-observability.md` | this document |

`ANIMATED_SLUGS` is **not** modified — these are static observability graphs,
not animations. The animations page (`/docs/animations`) and its count
prose are unchanged.

The `src/routes/(site)/docs/[slug]/+page.server.ts` `entries()` call
returns `components.map(...)`, so the three new slugs automatically
prerender to `/docs/graph-latency`, `/docs/graph-slo`, and
`/docs/graph-quota` with the live preview, props table, and copy-ready
snippet — no separate route file needed.

## Verification (evidence)

- `pnpm build` — succeeds (`✓ built in 4.0s`); 3 new HTML pages prerender
  in `.vercel/output/static/docs/`.
- Route sweep: `/docs/graph-latency`, `/docs/graph-slo`, `/docs/graph-quota`
  → all 200.
- Docs index page now shows `33 graphs, 25 animations, 6 diagrams` (was `30
  graphs, 25 animations` before).
- The three new entries are in the left-rail nav (alphabetical:
  `latency`, `slo`, `quota` between `kpi` and `spec`).
- Screenshots (`qa-screenshots/`):
  - `obs3-graph-latency.png` — 30-column band chart with `^ ^` spike markers
    on columns 12 and 22; the p50 fill is solid orange (`█`), p50→p95 is
    dimmer (`▓`), p95→p99 is muted (`▒`). Stats row: `p50 85ms  p95 508ms
    p99 847ms  peak p99 1.2s  spikes 2`. X-axis: `09:00 … 09:30`.
  - `obs3-graph-slo.png` — daily-burn sparkline above the bar; 62% fill on
    the bar; `window 30d  burn rate 1.03×  time-to-empty 11d` (the
    `time-to-empty` was first reported as `0.4d` because it was computed
    in window-fractions instead of days — fixed to `(remaining * elapsed) /
    spent` so 11d is correct); `target 0.10%  actual 0.14%` (actual in
    warn because `> target`); flag `↗ will exhaust the budget before the
    window closes` in warn.
  - `obs3-graph-quota.png` — headline `124,500 / 200,000 API calls`; bar
    in warn (because the projection `207,500` exceeds the 200,000 limit);
    `resets Oct 1  days left 12 / 30  projected 207,500 (104% of limit)
    avg / day 6,917  pace over budget`; flag `↗ projected to exceed the
    limit before reset`.
- `pnpm check` reports 3 errors and 1 warning — **all in pre-existing
  untracked files** (`src/lib/animated/GraphState.svelte` CSS error,
  `src/lib/animated/GraphScatter.svelte` `state_referenced_locally`
  warning) that another agent left on disk. None of the new code is
  affected. Per the "do not edit existing component styles" rule, I
  didn't touch them.

## How to evaluate

1. The preview server is running at http://127.0.0.1:4173.
2. http://127.0.0.1:4173/docs/graph-latency — should show a 30-column band
   chart with two `^` spike markers on columns 12 and 22; the p50 fill is
   the orange accent, the p50→p95 band is dimmer, the p95→p99 band is
   muted. The stats row reads `p50 85ms  p95 508ms  p99 847ms  peak p99
   1.2s  spikes 2`. Try passing your own `data` and watch the band heights
   and spike positions move.
3. http://127.0.0.1:4173/docs/graph-slo — should show a daily-burn
   sparkline above a 62%-filled bar; `window 30d  burn rate 1.03×
   time-to-empty 11d  target 0.10%  actual 0.14%`; the `↗ will exhaust
   the budget before the window closes` line in warn. Try `budget={0.2}`
   or `budget={0.95}` to see the bar move and the flag appear/disappear.
4. http://127.0.0.1:4173/docs/graph-quota — should show a big
   `124,500 / 200,000 API calls` headline, a warn-colored bar (because
   the projection is 104%), `resets Oct 1  days left 12 / 30  projected
   207,500 (104% of limit)  avg / day 6,917  pace over budget`. Try
   `used={80_000}` to see the bar drop out of warn.
5. http://127.0.0.1:4173/docs — the left rail should list `latency`,
   `slo`, and `quota` in alphabetical order; the page header should
   read `33 graphs, 25 animations, 6 diagrams`.
6. Press an accent dot in the header (top right) — all three re-theme
   together (p50 fill, bar fill, headline, warn).
