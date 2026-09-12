# Markgraphy — Data-Viz Utilities

Spec for the **Data-Viz Utilities** batch of three animated components, added
on top of the [animated](specs-markgraphy-animated.md),
[vedic](specs-markgraphy-vedic.md),
[fingerprint](specs-markgraphy-fingerprint.md), and
[observability](specs-markgraphy-observability.md) batches.

| Slug | Component | Theme |
| --- | --- | --- |
| `graph-scatter` | GraphScatter | x/y dot plot in the glyph grid with an optional linear-trend row. |
| `graph-cron` | GraphCron | Zero-dep 5-field cron parser, next-N runs on a tick timeline. |
| `graph-deps` | GraphDeps | Recursive dependency tree from a `DepNode[]` manifest, with version tags and depth marks. |

These three are the **inspectable data** set — every one of them takes a
small structured input (`ScatterPoint[]`, a cron string, a `DepNode[]`) and
renders a deterministic, copy-pasteable view of it. They share the same
house style as the rest of `src/lib/animated/` (Graph + GraphBody frame,
scoped CSS, `--graph-*` tokens, `prefers-reduced-motion` freeze, RLE view
where applicable).

## Component files

- [GraphScatter.svelte](../../src/lib/animated/GraphScatter.svelte)
- [GraphCron.svelte](../../src/lib/animated/GraphCron.svelte)
- [GraphDeps.svelte](../../src/lib/animated/GraphDeps.svelte)

## Integration inventory

| Surface | Touched | Notes |
| --- | --- | --- |
| [src/lib/index.ts](../../src/lib/index.ts) | +7 lines | Re-exports `GraphScatter`, `GraphCron`, `GraphDeps` (default + Props) and the helper types `ScatterPoint`, `CronProps` re-exported via `GraphCronProps`, `DepNode`. |
| [src/site/docs/catalog.ts](../../src/site/docs/catalog.ts) | +90 lines | 3 catalog entries with the reusable `CLASS` row. Slugs `graph-scatter`, `graph-cron`, `graph-deps` added to `ANIMATED_SLUGS`. |
| [src/site/docs/previews.ts](../../src/site/docs/previews.ts) | +50 lines | 3 preview entries — `graph-scatter` 'CORRELATION' (12 points + trend), `graph-cron` 'EVERY 15' (`*/15 * * * *` from 2026-09-06 11:53 UTC), `graph-deps` 'DEPS' (markgraphy + docs as roots, svelte / shiki / mdsvex / vite as leaves). |
| [src/routes/(site)/llms.txt/+server.ts](../../src/routes/(site)/llms.txt/+server.ts) | +3 table rows, count updated | `GraphScatter`, `GraphCron`, `GraphDeps` rows in the components table. Count bumped from "nineteen" to "twenty-five" (covers this batch + the [fingerprint](specs-markgraphy-fingerprint.md) batch). |
| [src/routes/(site)/sitemap.xml/+server.ts](../../src/routes/(site)/sitemap.xml/+server.ts) | +3 slugs | `graph-scatter`, `graph-cron`, `graph-deps` in `DOC_SLUGS`. |
| [src/routes/(site)/docs/animations/+page.svelte](../../src/routes/(site)/docs/animations/+page.svelte) | +3 imports, +3 demo entries | New tiles added in the wall. Page header bumped Nineteen → Twenty-five. |
| [docs/specs/specs-markgraphy-util.md](../../docs/specs/specs-markgraphy-util.md) | this document | new |

`ANIMATED_SLUGS` is bumped to include all three — these are animated
(animated={true} by default, with a `prefers-reduced-motion` freeze path),
so the animations page, llms.txt count, and sitemap all reflect them. The
static observability graphs in [specs-markgraphy-observability.md](specs-markgraphy-observability.md)
are **not** affected; their `ANIMATED_SLUGS` membership is unchanged.

The `src/routes/(site)/docs/[slug]/+page.server.ts` `entries()` call
returns `components.map(...)`, so the three new slugs automatically
prerender to `/docs/graph-scatter`, `/docs/graph-cron`, and
`/docs/graph-deps` with the live preview, props table, and copy-ready
snippet — no separate route file needed.

## GraphScatter — x/y dot plot in the glyph grid

### What you see

- A framed `[ TITLE ]` block, `cols × rows` (default 60 × 14).
- A 4- to 5-character y-axis gutter on the left showing the y-axis tick
  labels: `yMax` (top row) and `yMin` (bottom row), right-aligned, muted.
- A `│` separator at column `Y_GUTTER`.
- The plot area: 1 character per data point's `(x, y)`. Tier glyphs:
  - `X` — accent (hot) dot, drawn when `point.accent === true`.
  - `o` — mid (foreground) dot for the rest.
  - `.` — faint baseline dot, painted every 4 columns on the bottom row
    so the column grid reads as aligned even when no point falls there.
- A `─` ribbon under the plot with `<xMin> ─────── <xMax>` centered
  (compact numbers: trim trailing zeros, integer when ≥ 10, 1 decimal
  when ≥ 1, 3 decimals otherwise).
- **Optional trend row** (when `trend={true}`): one extra row below the
  plot. The trend is the **linear regression** of the input data:
  `slope = (n·Σxy − Σx·Σy) / (n·Σx² − (Σx)²)`,
  `intercept = (Σy − slope·Σx) / n`. The row paints a 4-tier bar
  glyph at every column: `h ≥ 0.85 → #` (trend accent), `≥ 0.6 → *`,
  `≥ 0.35 → :`, `> 0.1 → .`, else space. A `trend` label is written
  in the y-gutter at the trend-row position.
- An optional muted caption (`label` prop) under the art.
- Screen-reader: `Scatter plot with N points, x a to b, y c to d[, trend
  strip below]`.

### Mechanics

- Cell mapping: `col = round((x − xMin) / xRange × (plotCols − 1))`,
  `row = plotRows − 1 − round((y − yMin) / yRange × (plotRows − 1))`,
  clamped to the plot box. Two points that land on the same cell merge
  — the higher tier wins (accent > mid).
- Reveal animation: when animated and not reduced motion, the
  `setInterval(40ms..speedMs)` walks `revealed` from 0 to `data.length`,
  and the visible view masks the plot cells whose data-index ≥
  `revealed`. The trend row is never masked (it always shows the
  fitted line). Frozen state reveals every point at once.
- The full grid is built once via `buildView()` and re-derived only on
  prop change (data, cols, rows, trend). The RLE encoding is stable
  for stable input.
- Reduced-motion: `moving = false` → `revealed = data.length` from
  the first tick; the full scatter is shown statically.
- `compactNumber(n)` formats 0.8 → `0.8`, 1.2 → `1.2`, 12.5 → `12.5`,
  1234 → `1234`, NaN/Infinity → `0`.

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | — | Caption on the top edge. |
| `data` | `ScatterPoint[]` | — | `[{ x, y, label?, accent? }, …]`. |
| `cols` | number | `60` | Scene width (including 5-ch y-gutter). Clamped 13+ (so `plotCols ≥ 8`). |
| `rows` | number | `14` | Scene height (including 1-ch x-axis + optional trend row). Clamped 4+. |
| `trend` | boolean | `false` | Render the linear-trend strip below the plot. |
| `animated` | boolean | `true` | Animate the point-by-point reveal. |
| `speedMs` | number | `60` | Milliseconds per reveal tick. |
| `label` | string | `''` | Caption under the art. |
| `class` | string | — | Passed to the frame. |

`ScatterPoint = { x: number, y: number, label?: string, accent?: boolean }`.

## GraphCron — next-N runs of a cron expression

### What you see

- A framed `[ TITLE ]` block.
- **Row 0 (header)**: the cron expression echoed centered, muted.
  On a parse error, the row reads `error: <message>` in warn.
- **Row 1 (tick timeline)**: a horizontal `· · · · · · ·` strip of N
  markers, evenly spaced across the plot width. The currently active
  run is `●` (hot). When animated, a `|` "now" cursor sweeps
  left-to-right across the timeline, advancing one slot per tick.
- **Row 2 (date ribbon)**: the day-of-month of each run, last-2-chars,
  under its marker, muted (active run is hot).
- **Row 3 (hour:min ribbon)**: `HH:MM` of each run under its marker,
  muted (active run is hot).
- **Row 4 (caption)**: `next: YYYY-MM-DD HH:MM` for the active run,
  muted. On empty runs: `no runs match this expression`.

### Mechanics

- **Zero-dep parser**:
  - `parseField(raw, min, max, names?)` — handles `*`, `n`, `n-m`,
    `*/n`, `n,m,o`, and named tokens (`JAN..DEC` for months, `SUN..SAT`
    for days-of-week). Splits on `,` then on `/` (step) then on `-`
    (range). Step must be a positive integer.
  - `parseToken(token, min, max, names?)` — looks up `names[t]`
    (case-insensitive) before falling back to `parseInt` clamped to
    `[min, max]`.
  - `parseCron(expr)` — splits on whitespace, expects exactly 5 fields,
    returns `{ minutes, hours, doms, months, dows, bothRestricted }`.
    DOW 7 is treated as 0 (Sunday) — the Vixie cron convention.
  - `matches(parsed, date)` — minute, hour, month must match. **DOM/DOW
    semantics**: when `bothRestricted === true` (both fields are not
    `*`), the run matches if **either** DOM or DOW is in the allowed
    set (this is the standard Vixie `OR` rule); when only one is
    restricted, both must independently match.
  - `nextRuns(expr, from, count)` — starts at `from` rounded down to
    the minute + 1 minute, then walks forward one minute at a time
    (capped at `4 × 366 × 24 × 60` minutes ≈ 4 years) and collects
    every minute where `matches()` is true, formatted as
    `{ ms, hourMin, date }`.
- **Tick**: `setInterval(60ms..speedMs)` advances `tick` modulo
  `runs.length`. `active = moving ? tick : 0`. Frozen state highlights
  the first run.
- **`nowCol`**: the column the `|` cursor sits on for the current tick;
  computed as `round((slot / max(1, runs.length − 1)) × (width − 1))`.
- `runCount` is clamped to `[1, 64]`. `width` is clamped to `≥ 20`.

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | — | Caption on the top edge. |
| `expr` | string | — | Standard 5-field cron: `min hour dom mon dow`. |
| `count` | number | `8` | Number of next runs to render. Clamped 1..64. |
| `baseTime` | number | `Date.now()` | ms-since-epoch start; runs are computed strictly after this. |
| `cols` | number | `60` | Scene width in characters. Clamped ≥ 20. |
| `rows` | number | `12` | Scene height in rows. |
| `animated` | boolean | `true` | Animate the tick + now-cursor. |
| `speedMs` | number | `220` | Milliseconds per tick. |
| `label` | string | `''` | Caption under the art. |
| `class` | string | — | Passed to the frame. |

### Supported cron syntax (zero-dep)

- **Minutes / hours**: 0..59 / 0..23.
- **DOM**: 1..31.
- **Month**: 1..12, or `JAN..DEC`.
- **DOW**: 0..6 (or 7 = Sunday), or `SUN..SAT`.
- **Each field** accepts: `*`, `n`, `n-m`, `*/n`, `n-m/s`,
  comma-lists (`1,3,5`), and named tokens (months / DOW).
- **DOM/DOW rule**: when both are restricted, runs match if **either**
  DOM or DOW is in the set (Vixie cron).

## GraphDeps — dependency tree from a manifest

### What you see

- A framed `[ TITLE ]` block.
- A vertical list of rows, one per `DepNode` (recursively flattened).
  Each row reads, left-to-right:
  - A muted depth mark: a run of `·` characters, one per depth level
    (deeper = more dots).
  - A muted branch glyph: `├─ ` (not last) or `└─ ` (last) of the parent.
  - The package name, hot (accent + bold) when `node.accent === true`,
    foreground otherwise.
  - A muted `@` separator.
  - The version string, muted, smaller.
- Rows that aren't the accent root are dimmed (`opacity: 0.55`) so the
  highlighted package reads first.
- A `row`-level keyframe `dep-fade 0.32s ease-out` animates each row in
  on reveal (transform: translateX(0.2rem) → 0; opacity 0 → 1).
  `@media (prefers-reduced-motion: reduce)` sets `animation: none`.
- An optional muted caption (`label` prop) under the tree.
- Screen-reader: `Dependency tree with N packages under M roots.`

### Mechanics

- **Flatten** (`flatten()`) walks `deps` recursively, threading a
  `prefix` (the accumulated `│  ` columns), a `trail` key (for unique
  row keys across shared subtrees), and the current depth.
  - `singleRoot` (`isRoot && nodes.length === 1`) means the tree has
    exactly one root — in that case the root row carries no branch
    glyph and no depth mark (the depth mark starts at the first child
    with one `·`).
  - For non-single-root trees, the root row gets `├─ ` / `└─ ` and
    the first child's depth mark is one `·`.
  - Recursion stops at `maxDepth` (clamped 1..16, default 6).
- **Cascade reveal**: when animated and not reduced motion, an
  interval walks `revealed` from 0 to `rows.length` (and wraps to 0),
  inserting a new row per tick at `speedMs` (clamped ≥ 40ms). Frozen
  state shows the full tree.
- The component does **not** attempt cycle detection — it trusts the
  input. (Cyclic manifests are a caller problem.)

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | — | Caption on the top edge. |
| `deps` | `DepNode[]` | — | Root-level dependencies. |
| `depth` | number | `6` | Maximum depth to render. Clamped 1..16. |
| `animated` | boolean | `true` | Animate the cascade. |
| `speedMs` | number | `80` | Milliseconds between cascading reveals. |
| `label` | string | `''` | Caption under the art. |
| `class` | string | — | Passed to the frame. |

`DepNode = { name: string, version: string, children?: DepNode[], accent?: boolean }`.

## Verification (run 2026-09-06)

- `pnpm check` → 0 errors. The 1 warning (`state_referenced_locally`
  in `GraphScatter.svelte` for the `trend` prop) is the
  `svelte-ignore`-tagged house pattern — explicitly intentional and
  documented in the file.
- `pnpm build` → ✓ built in ~4s, all pages (including the 3 new
  prerendered HTML files) emitted under `.vercel/output/static/docs/`.
- Route sweep against `pnpm preview` on port 4173:
  - `/docs/graph-scatter` → 200
  - `/docs/graph-cron` → 200
  - `/docs/graph-deps` → 200
  - `/docs/animations` → 200
  - `/llms.txt` → 200 (count reads `twenty-five`)
  - `/sitemap.xml` → 200 (3 new slugs present)
- Screenshots in `qa-screenshots/`:
  - `util-scatter.png` — 12 dots in positive correlation, 1 accent
    `X` at (5.4, 3.4), trend row below with `# * :` glyphs, axis
    label `1.2 ─────── 6.8`, y-gutter reads `4.1` (top) and `0.8`
    (bottom).
  - `util-cron.png` — `[ EVERY 15 ]` header echoing `*/15 * * * *`,
    `●` + 7 `·` markers on the tick line, day-of-month `06 06 06 06
    06 06 06 06` ribbon, hour:min `12:00 12:15 12:30 12:45 13:00
    13:15 13:30 13:45` ribbon, caption `next: 2026-09-06 12:00`.
  - `util-deps.png` — two roots (`markgraphy` accent, `docs`
    dimmed) with two children each (`svelte ^5.0.0`, `shiki ^4.0.0`,
    `mdsvex ^0.12.0`, `vite ^5.0.0`), depth marks, branch glyphs.
  - `util-wall.png` — the 25-tile animations page wall.
- `pnpm check` reports the `GraphSlo` `elapsed is possibly undefined`
  error in the user's parallel work — not touched, not in our 3
  files.

## How to evaluate

Open a preview and look at each one frozen (reduced motion is on by
default in headless captures; in a real browser, toggle "Reduce
motion" in your OS or call `<GraphXxx animated={false} />`).

- `/docs/graph-scatter` — does the 12-point scatter read at a
  glance? Are the accent dot and the trend row clearly
  distinguishable from the mid dots? Try `trend={false}` to compare.
- `/docs/graph-cron` — does the timeline read as a schedule? Does
  the active `●` clearly mark the "next" run? Try `expr="0 * * * *"`
  (hourly) or `expr="0 9 * * 1-5"` (weekday 9am) to see the
  scheduler pick a different cadence.
- `/docs/graph-deps` — does the tree read top-down? Is the accent
  root obvious, with the leaves dimmed? Try a deeper manifest with
  nested children.
- `/docs/animations` — are the 3 new tiles (Scatter, Cron, Deps) on
  the wall, mixed in with the other 22?
- Press an accent dot in the header — all 3 re-theme with the
  accent (scatter's accent dot, cron's active marker, deps' accent
  root).

Status: **implemented — pending user evaluation.**
