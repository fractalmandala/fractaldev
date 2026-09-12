---
name: markdown-graphs
description: >-
  Picks and writes markdown graphs (ASCII-framed Svelte components for
  SvelteKit and mdsvex) next to prose. Chooses a component from the
  markgraphy library, writes real Svelte usage, and never draws SVG,
  Mermaid, Chart.js, canvas, or ASCII art. Use when explaining a refactor,
  incident, postmortem, tradeoff, pull request, sprint, or migration; when the
  user mentions markdown graphs, ASCII diagrams, framed charts, GraphFlow, or
  GraphTimeline; or when a write-up would scan faster with a figure.
---

# markdown graphs

markgraphy components draw charts with characters: a dashed frame, `+`
corners, and a `[ TITLE ]` on the top edge. Svelte 5, zero dependencies. The
package installs from npm and the components are imported — nothing is copied
into your project.

## When to use

A figure earns its place when the writing has shape: a path, a night, a
matrix, a diff, a countdown. One sentence → no graph. Before a wall of
bullets, ask if a framed figure would scan faster.

## Install

```bash
pnpm add markgraphy
```

Svelte 5 is the only peer. No CSS import, no config — theming is CSS
variables (below). If the import does not resolve, the package is missing.

Read [recipes.md](recipes.md) before writing usage. Unsure which component?
Fetch https://markgraphy.vercel.app/llms.txt.

## Procedure

1. Decide if a figure earns it. One sentence → no graph. A path, a night, a matrix, a diff → yes.
2. Pick **at most two** graphs from the chooser. Prefer a pair in recipes.md.
3. Confirm the package is installed. Then write the usage — swap labels, keep the API.
4. Write the reply in this shape. Do not lead with the figure.

```
1–3 sentences (the claim)

<GraphA … />

1–3 sentences (what the second figure adds)

<GraphB … />
```

5. Check the rules. Then send.

## Chooser

Writing first. Data shape if nothing matches.

| The writing is             | Use                                              | Recipe       |
| -------------------------- | ------------------------------------------------ | ------------ |
| A path or a refactor       | `GraphFlow`, then `GraphTimeline`                | Refactor     |
| An incident / postmortem   | `GraphTimeline`, then `GraphUptime`              | Incident     |
| Pick A vs B                | `GraphCompare`, then `GraphRank` if size matters | Pick one     |
| What a PR changed          | `GraphDiff`, then `GraphSlope`                   | Pull request |
| Overlapping work this week | `GraphGantt`, then `GraphStat`                   | This week    |
| A migration in flight      | `GraphMeter`, then `GraphKpi`                    | Migration    |
| Nested files / org         | `GraphTree`                                      | —            |

| The data is                    | Use              | Not                                |
| ------------------------------ | ---------------- | ---------------------------------- |
| A handful of numbers, no axis  | `GraphSpark`     | Plot                               |
| A series that needs a y-scale  | `GraphPlot`      | Spark                              |
| One fill from 0 to 1           | `GraphMeter`     | Bullet                             |
| Actual vs a target             | `GraphBullet`    | Meter                              |
| Parts of a whole               | `GraphStack`     | Pie. Waffle if you want ~100 cells |
| A short ranked list            | `GraphRank`      | Bars                               |
| A small filled / empty grid    | `GraphCells`     | Waffle, Activity                   |
| Two small histograms           | `GraphBars`      | Rank                               |
| One headline + a trend         | `GraphKpi`       | Stat                               |
| Two to four numbers, no trend  | `GraphStat`      | KPI                                |
| Before → after numbers         | `GraphSlope`     | Bars                               |
| Elapsed / how long ago / clock | `GraphTimer`     | Countdown                          |
| Time left until a date         | `GraphCountdown` | Timer                              |
| Status per day                 | `GraphUptime`    | Activity, Heatmap                  |
| Daily counts over months       | `GraphActivity`  | Calendar, Uptime                   |
| One month, a few marks         | `GraphCalendar`  | Activity                           |
| A labeled intensity grid       | `GraphHeatmap`   | Activity                           |
| A running total                | `GraphWaterfall` | Stack                              |
| Steps that drop off            | `GraphFunnel`    | Flow, Rank                         |
| Rows of numbers                | `GraphTable`     | Rank, Spark                        |
| From / bill-to / line items    | `GraphInvoice`   | Table                              |
| Label / value sheet            | `GraphSpec`      | Stat                               |

Skip the frame primitives (`Graph`, `GraphBody`, `GraphRule`, `GraphTrack`,
`GraphTick`, `GraphArrow`) unless you are assembling a custom figure.

## Import

In a `+page.svelte` (or any component):

```svelte
<script>
	import { GraphFlow } from 'markgraphy';
</script>

<GraphFlow title="AUTH" rows={[{ nodes: [{ label: 'request' }, { label: 'handler' }] }]} />
```

In an `.svx` markdown file (mdsvex), imports go in the script block at the
top, then the component sits next to the prose:

```mdsvex
<script>
	import { GraphMeter } from 'markgraphy';
</script>

Prose before the figure.

<GraphMeter title="ROWS" value={0.67} caption="users table" />
```

Named exports match the component names: `Graph<Name>`. There is no default
export.

## Component cheat sheet

All 29 graphs. `title` is required and drawn as `[ TITLE ]` — uppercase,
1–2 words. `palette` / `glyphs` exist only on drawing graphs.

| Component        | Key props                                                 | Use for                                    |
| ---------------- | --------------------------------------------------------- | ------------------------------------------ |
| `GraphActivity`  | `days: { date, count }[]`                                 | Daily counts over months, contribution grid |
| `GraphBars`      | `from`, `to`: `{ label, values }`                          | Two small histograms, before and after     |
| `GraphBullet`    | `items: { label, value, target?, max? }[]`                 | Actual versus a target on one track        |
| `GraphCalendar`  | `year`, `month`, `marks?`, `today?`                        | One month with a few days marked           |
| `GraphCells`     | `items: { label, cells }[]`                                | A small filled / empty grid                |
| `GraphCompare`   | `columns`, `rows: { label, values }[]`, `accent?`          | Feature matrix of checks and dashes        |
| `GraphCountdown` | `to`, `done?`, `caption?`                                  | Time left until a date                     |
| `GraphDiff`      | `rows: { label, value, sign? }[]`                          | Add / remove / keep rows                   |
| `GraphFlow`      | `rows: { nodes: { label, tone? }[] }[]`                    | A pipeline or request path                 |
| `GraphFunnel`    | `steps: { label, value }[]`, `stage?`                      | Steps that get narrower as people drop off |
| `GraphGantt`     | `items: { label, start, end, complete? }[]`, `ticks?`      | Overlapping work on a shared track         |
| `GraphHeatmap`   | `columns`, `rows: { label, values }[]`                     | A labeled intensity grid                   |
| `GraphInvoice`   | `from?`, `to?`, `meta?`, `items`, `totals?`, `note?`       | From, bill-to, line items, totals          |
| `GraphKpi`       | `value`, `label`, `hint?`, `data`                          | One headline number with a sparkline       |
| `GraphMeter`     | `value` (0–1), `caption?`, `ticks?`                        | One fill from 0 to 1                       |
| `GraphPlot`      | `data`, `labels?`, `height?`, `variant?`                   | A series that needs a y-scale              |
| `GraphRank`      | `items: { label, value, display? }[]`                      | A ranked list, one bar per row             |
| `GraphSlope`     | `fromLabel`, `toLabel`, `items: { label, from, to }[]`     | Before → after numbers per row             |
| `GraphSpark`     | `data`, `caption?`                                         | A handful of numbers, no axis              |
| `GraphSpec`      | `rows: { label, value }[]`                                 | Aligned label / value sheet                |
| `GraphStack`     | `rows: { label, segments }[]`                              | Parts of a whole on one track              |
| `GraphStat`      | `items: { value, label, hint?, accent? }[]`                | Two to four large numbers, no trend        |
| `GraphTable`     | `headers`, `rows`, `footer?`, `align?`                     | Rows of numbers with headers               |
| `GraphTimeline`  | `events: { date, label, state? }[]`                        | Steps in order, one marked current         |
| `GraphTimer`     | `kind?: 'elapsed' \| 'ago' \| 'clock'`, `at?`              | Elapsed time, how long ago, or the clock   |
| `GraphTree`      | `nodes: { label, meta?, children? }[]`                     | Nested files or an org chart               |
| `GraphUptime`    | `days: ('ok' \| 'degraded' \| 'down' \| 'empty')[]`        | Status per day, blast radius of an outage  |
| `GraphWaffle`    | `value` (0–100), `caption?`                                | A share as ~100 cells                      |
| `GraphWaterfall` | `items: { label, value, kind? }[]`                         | A running total as floating bars           |

## Theme

Set CSS variables on any container. Dark-first — components assume a dark
page and pick these up wherever they are scoped.

| Variable             | Default                  | Use                                  |
| -------------------- | ------------------------ | ------------------------------------ |
| `--graph-foreground` | `oklch(0.93 0 0)`        | primary text                         |
| `--text-secondary`      | `oklch(0.62 0 0)`        | secondary text                       |
| `--graph-accent`     | `oklch(0.78 0.17 155)`   | the one highlight                    |
| `--graph-accent-2`   | `oklch(0.78 0.12 70)`    | second series (`palette="duo"`)      |
| `--graph-accent-3`   | `oklch(0.75 0.1 200)`    | third series (`palette="multi"`)     |
| `--border`      | `oklch(0.6 0 0 / 0.5)`   | frame dashes and corner marks        |
| `--text-muted`      | `oklch(0.3 0 0)`         | empty cells and tracks               |
| `--font-mono`       | mono stack               | the font — anything monospace works  |

```css
:root {
	--graph-accent: oklch(0.78 0.17 155);
}
```

## Motion

Motion is already in the components: a `reveal` action fades and rises each
row or track once, when it scrolls into view. Transform + opacity only,
~220ms, and `prefers-reduced-motion` sets the duration to 0. Do not add
loops, pulses, or CSS animation.

## Rules

- At most two graphs in a section. Prose between them. Never a gallery.
- Titles: 1–2 words, uppercase, no punctuation. Drawn as `[ TITLE ]`.
- Labels: lowercase, plain (`auth middleware`, not `AuthMiddleware Layer`).
- Copy props from recipes.md or the docs. Do not invent APIs, extra hues, or chart libraries.
- Default is one accent (`--graph-accent`). `palette="duo"` / `"multi"` only when a second or third series needs it.
- Unused rows recede (~0.4 opacity). Numbers: `tabular-nums`, right-aligned.

## Do not

- Draw SVG, Mermaid, Chart.js, canvas, or Markdown ASCII art if the component exists.
- Restyle the frame (no extra borders, no rounded cards, no new corner marks).
- Dump every graph you know into one reply.
- Use a pie chart. Stack or Waffle.
- Pass `palette` on Table, Invoice, Spec, Stat, Tree, or the frame primitives.

## Example prompts

These are user messages. Match the pair, copy usage from the recipe, swap in their labels.

**Refactor** → `GraphFlow`, then `GraphTimeline`

```
We're moving session checks out of route handlers into middleware. Write a short plan for the team.

Use markdown graphs for the before/after request path and the week-by-week rollout. Prose between the two figures. Don't draw SVG.
```

**Incident** → `GraphTimeline`, then `GraphUptime`

```
Draft a tight postmortem: p95 crossed 800ms at 14:02, we rolled back the cache flag at 14:11, the write-up is still open.

Use markdown graphs — a timeline of the night, then which days users felt it. No SVG or ASCII art charts.
```

**Pull request** → `GraphDiff`, then `GraphSlope`

```
Leave a PR review comment on the auth refactor. Summarize what files moved, then show how coverage changed on main vs this branch.

Use markdown graphs from this project. At most two figures. Don't invent APIs or draw SVG.
```

**Pick one** → `GraphCompare`, then `GraphRank` if install size is part of the argument

```
We're choosing a queue: BullMQ vs SQS. Write the tradeoff for the RFC.

Use markdown graphs — a feature matrix, then bundle size only if it matters. Don't draw SVG.
```
