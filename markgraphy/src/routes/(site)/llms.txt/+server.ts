// llms.txt — the whole library on one page for agents.
// Self-contained by design: the docs catalog is owned by another agent, so the
// 29 component entries below are hardcoded here. The recipes section reuses
// src/site/docs/recipes.ts (same agent, single source for the recipe list).

import { recipesMarkdown } from '$site/docs/recipes';
import { SITE_URL } from '$site/lib/site';

type ComponentRow = {
	name: string;
	slug: string;
	use: string;
	not: string;
};

const COMPONENTS: ComponentRow[] = [
	{
		name: 'Activity',
		slug: 'graph-activity',
		use: 'Daily counts over months, like a contribution grid.',
		not: 'One month of marks is Calendar. Up or down days is Uptime.'
	},
	{
		name: 'Bars',
		slug: 'graph-bars',
		use: 'A before and after, or any two small histograms.',
		not: 'A ranked list is Rank.'
	},
	{
		name: 'Bullet',
		slug: 'graph-bullet',
		use: 'A number with a goal sitting on the same track.',
		not: 'A single fill from 0 to 1 is Meter.'
	},
	{
		name: 'Calendar',
		slug: 'graph-calendar',
		use: 'One month with a few days marked.',
		not: 'A year of activity is Activity.'
	},
	{
		name: 'Cells',
		slug: 'graph-cells',
		use: 'A small grid of filled and empty cells.',
		not: 'A share of a hundred cells is Waffle. A year of days is Activity.'
	},
	{
		name: 'Compare',
		slug: 'graph-compare',
		use: 'Putting two options side by side.',
		not: 'Numeric ranks are Rank.'
	},
	{
		name: 'Countdown',
		slug: 'graph-countdown',
		use: 'A freeze, a launch, or a window that closes.',
		not: 'Elapsed time since a start is Timer.'
	},
	{
		name: 'Diff',
		slug: 'graph-diff',
		use: 'What was added, removed, or kept.',
		not: 'A list of numeric before and after is Slope.'
	},
	{
		name: 'Flow',
		slug: 'graph-flow',
		use: 'A pipeline, a request path, or walking through a change.',
		not: 'A dated list is Timeline. A schedule with start and end is Gantt.'
	},
	{
		name: 'Funnel',
		slug: 'graph-funnel',
		use: 'Steps that get narrower as people drop off.',
		not: 'A ranked list is Rank. A process diagram is Flow.'
	},
	{
		name: 'Gantt',
		slug: 'graph-gantt',
		use: 'Work that overlaps on a shared calendar.',
		not: 'A dated log is Timeline.'
	},
	{
		name: 'Heatmap',
		slug: 'graph-heatmap',
		use: 'A labeled grid of intensities.',
		not: 'A contribution calendar is Activity.'
	},
	{
		name: 'Invoice',
		slug: 'graph-invoice',
		use: 'From, bill-to, line items, and totals.',
		not: 'A generic table is Table.'
	},
	{
		name: 'KPI',
		slug: 'graph-kpi',
		use: 'One number as the headline and the rest as context.',
		not: 'Several numbers with no trend is Stat.'
	},
	{
		name: 'Latency',
		slug: 'graph-latency',
		use: 'A p50/p95/p99 band chart with spike markers for outliers.',
		not: 'A single series without percentiles is Spark or Plot.'
	},
	{
		name: 'Meter',
		slug: 'graph-meter',
		use: 'One value between 0 and 1, shown as a fill.',
		not: 'Actual versus a target is Bullet. Parts of a whole is Stack.'
	},
	{
		name: 'Plot',
		slug: 'graph-plot',
		use: 'A series that needs a y-scale.',
		not: 'A handful of points with no axis is Spark.'
	},
	{
		name: 'Quota',
		slug: 'graph-quota',
		use: 'Usage against a hard limit, with a reset date and end-of-window projection.',
		not: 'An error budget over a window is SLO.'
	},
	{
		name: 'Rank',
		slug: 'graph-rank',
		use: "Traffic, coverage, or anything you'd sort highest first.",
		not: 'Two histograms side by side is Bars. A table of numbers is Table.'
	},
	{
		name: 'Slope',
		slug: 'graph-slope',
		use: 'A before and after number on each row.',
		not: 'Two bar groups is Bars. A ranked list is Rank.'
	},
	{
		name: 'SLO',
		slug: 'graph-slo',
		use: 'An error-budget burn bar over a window, with burn rate and time-to-empty.',
		not: 'A single fill from 0 to 1 is Meter.'
	},
	{
		name: 'Spark',
		slug: 'graph-spark',
		use: "A handful of numbers when you don't need an axis.",
		not: 'If you need a y-scale, use Plot.'
	},
	{
		name: 'Spec',
		slug: 'graph-spec',
		use: 'Aligned label and value rows, like a spec sheet.',
		not: 'Large headline numbers are Stat. A table with headers is Table.'
	},
	{
		name: 'Stack',
		slug: 'graph-stack',
		use: 'Parts of a whole on one track.',
		not: 'There is no pie chart. Use Waffle if you want a share of cells.'
	},
	{
		name: 'Stat',
		slug: 'graph-stat',
		use: 'Two to four large numbers, with no sparkline.',
		not: 'One number with a trend is KPI. A live clock is Timer.'
	},
	{
		name: 'Table',
		slug: 'graph-table',
		use: 'Numbers that belong in a spreadsheet.',
		not: 'Bars, rankings, and sparklines have their own components.'
	},
	{
		name: 'Timeline',
		slug: 'graph-timeline',
		use: 'Steps in order, with one marked as current.',
		not: 'A schedule with start and end dates is Gantt.'
	},
	{
		name: 'Timer',
		slug: 'graph-timer',
		use: 'Uptime, last deploy, or a clock in the corner.',
		not: 'Time left until a date is Countdown. A static number is Stat.'
	},
	{
		name: 'Tree',
		slug: 'graph-tree',
		use: 'Nested files or an org chart.',
		not: 'A timeline or a table.'
	},
	{
		name: 'Uptime',
		slug: 'graph-uptime',
		use: 'A status per day, or the blast radius of an outage.',
		not: 'A heatmap or an activity grid.'
	},
	{
		name: 'Waffle',
		slug: 'graph-waffle',
		use: 'A share shown as a grid of about a hundred cells.',
		not: 'Labeled parts of a whole is Stack.'
	},
];

export const prerender = true;

export function GET() {
	const host = SITE_URL || '';

	const rows = COMPONENTS.map(
		(item) => `| ${item.name} | ${item.slug} | ${item.use} | ${item.not} |`
	).join('\n');

	const body = `# Markgraphy

Svelte components for tables, charts, and diagrams in markdown. Dashed frames,
block glyphs, one accent. No SVG, no dependencies. Install from npm and import
into any SvelteKit app.

${host}

## Rules

- Geist Mono. Dashed frame, + corners, title as [ TITLE ].
- Charts are made of characters (█ ░ - = + ├ └). Borders are dashes. Do not use SVG, Chart.js, or canvas.
- One accent: --graph-accent. palette="duo" | "multi" is opt-in.
- Motion is transform and opacity, ~220ms, no loops, no pulsing.
- Copy the example props exactly. Do not invent extra hues or chart libraries.

## Install

\`\`\`bash
pnpm add markgraphy
\`\`\`

Svelte 5 is the only peer. Import named components from \`'markgraphy'\`.

## Docs

- [Docs](${host}/docs) — every component with props and examples.
- [Installation](${host}/docs/installation) — install and theming.
- [Examples](${host}/docs/examples) — composed write-ups, two graphs each.
- [Skill](${host}/docs/skill) — a SKILL.md that picks the graph for the prose.
- [skill.md](${host}/skill.md) and [recipes.md](${host}/skill/recipes.md) — the raw skill files.

## Components

| Component | Slug | Use for | Not for |
| --- | --- | --- | --- |
${rows}

The frame primitives (\`Graph\`, \`GraphBody\`, \`GraphRule\`, \`GraphTrack\`,
\`GraphTick\`, \`GraphArrow\`) exist for assembling custom figures — skip them
unless a chart is missing.

## Diagrams

Raw ASCII/Unicode figures, animated players, and an editor. They read the same
\`--graph-*\` variables as the graphs, so one accent re-themes everything.

| Component | Slug | Use for | Not for |
| --- | --- | --- | --- |
| AsciiDiagram | ascii-diagram | Rendering hand-drawn ASCII/Unicode diagrams with tokenized titles, arrows, corners, and glyphs. | Structured data — use a graph component above. |
| DiagramEditor | diagram-editor | An embeddable playground: presets, glyph palette, auto-align, copy as text/Svelte/.svx. | Static docs pages — it is an interactive tool. |
| AmplifierDiagram | amplifier-diagram | An animated input-to-output wave with a live gain slider. | Serious charts — it is a demo piece. |
| NestedRadiiDiagram | nested-radii-diagram | Teaching nested border radius with sliders, ASCII art, and a live CSS preview. | Charts. |
| PromptLoopDiagram | prompt-loop-diagram | The prompt-and-iterate loop as an animated six-step player. | Static flow diagrams — use GraphFlow. |
| MetricsTableDiagram | metrics-table-diagram | A cost ledger as aligned ASCII with a total row. | Generic tables — use GraphTable. |

### Animated

Live glyph components. Every one respects \`animated={false}\` and
\`prefers-reduced-motion: reduce\` by freezing to a meaningful static state.

| Component | Slug | Use for | Not for |
| --- | --- | --- | --- |
| GraphTypewriter | graph-typewriter | Text that types itself with a block cursor and loops. | Long prose — it is a callout, not an article. |
| GraphTicker | graph-ticker | A one-row status marquee of [ OK ] / [ WARN ] / [ DOWN ] tokens. | Long log tails — it is a headline strip. |
| GraphScope | graph-scope | A scrolling oscilloscope window over a number series. | Static data — use GraphSpark. |
| GraphSequence | graph-sequence | An ASCII sequence diagram: participants on columns, labeled dashed arrows, and activation bars. | Generic process flows — use GraphFlow. |
| GraphStream | graph-stream | A live terminal KPI that appends and shows an updated-ago caption. | Batch reports. |
| GraphState | graph-state | An ASCII state-machine chart: state boxes with labeled transitions between them. | A pipeline of distinct steps — use GraphFlow. |
| GraphFlowPlayer | graph-flow-player | A play/pause step-player for ordered process steps. | Static flow diagrams — use GraphFlow. |
| GraphLife | graph-life | Conway's Game of Life with play, step, and reset controls. | Data — it is a toy. |
| GraphMandel | graph-mandel | A slowly zooming ASCII Mandelbrot. | Data — it is the brand piece. |
| GraphPulse | graph-pulse | A live uptime strip that appends blips with percent-up. | Historical ranges — use GraphUptime. |
| GraphSpinners | graph-spinners | A family of glyph spinners with a label. | Real progress — use GraphMeter. |
| GraphFire | graph-fire | Demoscene fire in shade glyphs. Decorative. | Anything serious. |
| GraphFlame | graph-flame | An ASCII flame graph: nested rows where each frame’s width is its share of time. | Per-call timings — use GraphLatency. |
| GraphRain | graph-rain | Matrix-style glyph rain. Decorative. | Anything serious. |
| GraphAgni | graph-agni | A breathing vedic fire in a havan kund with drifting sparks. Decorative. | Anything serious. |
| GraphAum | graph-aum | The om figure inked stroke by stroke with a traveling resonance crest. Decorative. | Anything serious. |
| GraphBoot | graph-boot | A deploy log: per-step progress bars with ✓/✗ and a total summary. | Boot or deploy status. |
| GraphSurya | graph-surya | A spoked sun rising and setting behind a horizon line. Decorative. | Anything serious. |
| GraphMandala | graph-mandala | A K-fold lotus-petal mandala blooming ring by ring from a bindu. Decorative. | Anything serious. |
| GraphDiya | graph-diya | A row of oil lamps that light left-to-right, breathe, and occasionally gutter. Decorative. | Anything serious. |
| GraphJapa | graph-japa | A 108-bead mala with a marker, tail, and corner counter. Decorative. | Anything serious. |
| GraphDamru | graph-damru | Two triangles pulsing on an 8-beat Adi tala with expanding ▒ ripples. Decorative. | Anything serious. |
| GraphGanga | graph-ganga | Three stepped flow lines cascading with a lone diya bobbing downstream. Decorative. | Anything serious. |
| GraphHash | graph-hash | Any string → its 64-bit digest as a 4-tier glyph-checkerboard fingerprint. | Showing a string's identity. |
| GraphTerminal | graph-terminal | A scripted shell session: $ prompt typed, output streamed. | Screenshots, demos, READMEs. |
| GraphCron | graph-cron | The next N runs of a 5-field cron expression on a tick timeline, with a date and HH:MM ribbon. | Static schedules — use GraphTimeline. |
| GraphDeps | graph-deps | A dependency tree from a manifest, with version tags and depth marks. | A flat list of packages. |
| GraphScatter | graph-scatter | An x/y dot plot in the glyph grid, with an optional linear-regression strip. | A line over time — use GraphPlot. |
| GraphWorkflow | graph-workflow | A typed workflow from { nodes, edges } auto-laid out as a DAG, with a play/pause step-player. | A static one-row flow — use GraphFlow. A linear step list — use GraphFlowPlayer. |

All twenty-nine animations run on one page: [${host}/docs/animations](${host}/docs/animations).

Editor playground: [${host}/docs/editor](${host}/docs/editor).

${recipesMarkdown(host)}`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8'
		}
	});
}
