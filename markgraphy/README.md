# Markgraphy

Svelte components for tables, charts, and diagrams in markdown. Each graph sits in a dashed frame with a `[ TITLE ]` on the top edge. Glyphs draw the chart — no SVG, no canvas, no dependencies. One accent color by default; drawing graphs can take `palette="duo"` or `palette="multi"`.

[Docs](https://markgraphy.vercel.app/docs) · [Examples](https://markgraphy.vercel.app/docs/examples) · [Install](https://markgraphy.vercel.app/docs/installation) · [Skill](https://markgraphy.vercel.app/docs/skill) · [GitHub](https://github.com/fractalmandala/markgraphy)

## Install

```bash
pnpm add markgraphy
```

Svelte 5 is the only peer. One optional CSS import (`markgraphy/themes.css`), no config — theming is CSS variables (below).

## Quickstart

In a `+page.svelte` (or any component):

```svelte
<script>
	import { GraphKpi, GraphTimeline } from 'markgraphy';
</script>

<GraphTimeline
	title="PLAN"
	events={[
		{ date: 'w1', label: 'freeze features', state: 'done' },
		{ date: 'w2', label: 'ship the rc', state: 'now' },
		{ date: 'w3', label: 'general availability', state: 'next' }
	]}
/>

<GraphKpi
	title="SIGNUPS"
	value="1.2M"
	label="this week"
	hint="+18%"
	data={[2, 3, 3, 5, 8, 9, 11, 12, 14, 16, 18, 21]}
/>
```

In `.svx` markdown files (mdsvex), the same imports go in the script block at the top, then the components sit next to the prose.

## Components

| Component | Import           | Use for                                    |
| --------- | ---------------- | ------------------------------------------ |
| Activity  | `GraphActivity`  | Daily counts over months, contribution grid |
| Bars      | `GraphBars`      | Two bar groups, side by side               |
| Bullet    | `GraphBullet`    | Actual versus target on one track          |
| Calendar  | `GraphCalendar`  | One month, marked days                     |
| Cells     | `GraphCells`     | Filled / empty grids                       |
| Compare   | `GraphCompare`   | Feature matrix (`✓` / `–`)                 |
| Countdown | `GraphCountdown` | Time left until a date                     |
| Diff      | `GraphDiff`      | Add / remove / keep rows                   |
| Flow      | `GraphFlow`      | Process diagrams on a dashed arrow         |
| Funnel    | `GraphFunnel`    | Steps that get narrower                    |
| Gantt     | `GraphGantt`     | Schedule on a character track              |
| Heatmap   | `GraphHeatmap`   | Labeled 2d intensity matrix                |
| Invoice   | `GraphInvoice`   | From, bill-to, line items, totals          |
| KPI       | `GraphKpi`       | One number with a sparkline under it       |
| Meter     | `GraphMeter`     | Progress as `=` and `-`                    |
| Plot      | `GraphPlot`      | Line or area from columns of glyphs        |
| Rank      | `GraphRank`      | A ranked list, one bar per row             |
| Slope     | `GraphSlope`     | Two figures per row, before → after        |
| Spark     | `GraphSpark`     | Sparkline from block characters            |
| Spec      | `GraphSpec`      | Label / value sheets                       |
| Stack     | `GraphStack`     | Parts of a whole, glyphs instead of colors |
| Stat      | `GraphStat`      | Large figures with labels                  |
| Table     | `GraphTable`     | Data tables with optional footer totals    |
| Timeline  | `GraphTimeline`  | Dated events, one row current              |
| Timer     | `GraphTimer`     | Elapsed time, how long ago, or the clock   |
| Tree      | `GraphTree`      | File or org trees                          |
| Uptime    | `GraphUptime`    | One glyph per day, percent up              |
| Waffle    | `GraphWaffle`    | Share of 100 cells                         |
| Waterfall | `GraphWaterfall` | Running total as floating bars             |
| Frame     | `Graph`, `GraphBody`, `GraphRule`, `GraphTrack`, `GraphTick`, `GraphArrow` | Shared dashed frame primitives |

Composed write-ups (refactor, incident, tradeoff, PR, sprint, migration) live on [Examples](https://markgraphy.vercel.app/docs/examples). Every graph has its own page under [Docs](https://markgraphy.vercel.app/docs) with the full props.

## Theming

Set CSS variables on any container — the components pick them up wherever they are scoped. The site renders dark-first, and so do the fallbacks.

| Variable             | Fallback                 | Use                                  |
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

## Design

- Geist Mono by default. Dashed frame, `+` corners (swap with `corner`), title as `[ TITLE ]`.
- One accent: `--graph-accent`. Unused rows recede with opacity. `palette="duo"` / `"multi"` opt into `--graph-accent-2` and `--graph-accent-3`.
- Glyphs do the drawing (`█ ▓ ▒ ░ · - = + | ├ └ ✓`). Tracks that represent a range (meter, stack, bullet, rank) span the frame. Spark, bars, cells, and uptime stay packed at 1ch. Pass `glyphs` — `shade`, `ascii`, `hash`, `bar`, or your own characters. No SVG.
- Numbers use `tabular-nums`. Amounts sit right-aligned.
- Motion is transform and opacity only, 220ms, no loops. `prefers-reduced-motion` sets duration to 0.

## Agent skill

A `SKILL.md` in [`skills/markdown-graphs/`](skills/markdown-graphs/SKILL.md) teaches an agent when to put a graph next to the prose, which component to pick, and how to write the usage. Drop the two files into the skills folder your agent already reads (`.claude/skills/markdown-graphs`, `.cursor/skills/markdown-graphs`, …), or fetch them from the site:

```bash
curl -fsSL https://markgraphy.vercel.app/skill.md -o <dir>/markdown-graphs/SKILL.md
curl -fsSL https://markgraphy.vercel.app/skill/recipes.md -o <dir>/markdown-graphs/recipes.md
```

- [`/skill.md`](https://markgraphy.vercel.app/skill.md) and [`/skill/recipes.md`](https://markgraphy.vercel.app/skill/recipes.md) — the raw skill files
- [`/llms.txt`](https://markgraphy.vercel.app/llms.txt) — the whole library on one page for agents
- [`/docs/skill`](https://markgraphy.vercel.app/docs/skill) — install prompts and the chooser

## Development

```bash
pnpm install
pnpm dev
```

Then check types across the package and site:

```bash
pnpm check
```

The package build (`pnpm package`) outputs to `dist/` via `svelte-package`.

### Docs development in fractalsvelte

The site (`../fractalsvelte`) imports this package through a local link while it is unpublished — its dependency is declared as `"markgraphy": "link:../markgraphy"`. To work on the library and its docs at the same time:

```bash
# terminal 1 — rebuild dist/ on every change
pnpm package:watch

# terminal 2 — the site's dev server
pnpm --dir ../fractalsvelte dev
```

Components edited here recompile into `dist/` and hot-reload in the site. Restart the site's dev server after changing the link or dependency versions. Until this package is on npm, pages that import it cannot build in the site's Vercel deploys — publish, then flip the link to a version range.

## License

[MIT](LICENSE)
