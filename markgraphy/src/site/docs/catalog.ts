// Docs catalog: metadata for every graph in the library plus the frame.
// Data only — no component imports. Live examples live in the [slug] page,
// which maps slugs to components and sample props.

export type NavLink = {
	href: string;
	label: string;
};

export type PropRow = {
	name: string;
	type: string;
	default?: string;
	description: string;
};

export type ComponentDoc = {
	slug: string;
	title: string;
	/** Exported component name, e.g. GraphStat. */
	name: string;
	description: string;
	props: PropRow[];
};

export const getStarted: NavLink[] = [
	{ href: '/docs', label: 'Introduction' },
	{ href: '/docs/installation', label: 'Installation' },
	{ href: '/docs/rules', label: 'Rules' },
	{ href: '/docs/examples', label: 'Examples' },
	{ href: '/docs/editor', label: 'Editor' },
	{ href: '/docs/skill', label: 'Skill' }
];

/** The rooms — the four-page site front at src/routes/(rooms)/. */
export const rooms: NavLink[] = [
	{ href: '/stage', label: 'Stage' },
	{ href: '/set', label: 'Set' },
	{ href: '/rules', label: 'Rules' },
	{ href: '/install', label: 'Install' }
];

const TITLE: PropRow = {
	name: 'title',
	type: 'string',
	description: 'Caption drawn on the top edge of the frame.'
};

const CORNER: PropRow = {
	name: 'corner',
	type: 'string',
	default: '"+"',
	description: 'Character at each corner of the frame.'
};

const CLASS: PropRow = {
	name: 'class',
	type: 'string',
	description: 'Passed to the outer frame.'
};

const GLYPHS: PropRow = {
	name: 'glyphs',
	type: '"shade" | "ascii" | "hash" | "bar" | string[]',
	default: '"shade"',
	description:
		'Character set. shade is ·░▒▓█. ascii is .- =#@. Pass a preset or your own characters.'
};

const SPARK_GLYPHS: PropRow = {
	name: 'glyphs',
	type: '"shade" | "ascii" | "hash" | "bar" | string[]',
	default: '▁▂▃▄▅▆▇█',
	description:
		'Defaults to spark bars. Pass shade, ascii, hash, bar, or your own characters.'
};

const STACK_GLYPHS: PropRow = {
	name: 'glyphs',
	type: '"shade" | "ascii" | "hash" | "bar" | string[]',
	description: 'One character per segment, or a preset. Defaults to █▓▒░#=+-.'
};

const PALETTE: PropRow = {
	name: 'palette',
	type: '"mono" | "duo" | "multi"',
	default: '"mono"',
	description:
		'mono is one accent plus muted. duo paints the second series with --graph-accent-2. multi cycles three accents.'
};

const catalog: ComponentDoc[] = [
	{
		slug: 'graph-table',
		title: 'Table',
		name: 'GraphTable',
		description: 'Framed data table with an optional footer row for totals.',
		props: [
			TITLE,
			{ name: 'headers', type: 'string[]', description: 'Column headings. Sentence case.' },
			{
				name: 'rows',
				type: '(string | number | Snippet)[][]',
				description:
					'Body cells, one array per row. Strings and numbers, or a snippet for custom cells.'
			},
			{
				name: 'footer',
				type: '(string | number | Snippet)[]',
				description: 'Optional totals row under a rule.'
			},
			{
				name: 'align',
				type: "('left' | 'right')[]",
				default: 'left, then right',
				description: 'Per-column alignment. Defaults to left on the first column.'
			},
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-flow',
		title: 'Flow',
		name: 'GraphFlow',
		description:
			'Process diagram with nodes on a dashed arrow. Accent a node to highlight a path.',
		props: [
			TITLE,
			{
				name: 'rows',
				type: 'FlowRow[]',
				description:
					'Each row is a sequence of nodes. Nodes take label, tone: accent or muted, and stretch.'
			},
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-bars',
		title: 'Bars',
		name: 'GraphBars',
		description:
			'Two bar groups side by side, drawn with glyphs. The right group is usually the larger one.',
		props: [
			TITLE,
			{
				name: 'from',
				type: 'BarSeries',
				description: 'Left series. values is an array of relative heights.'
			},
			{
				name: 'to',
				type: 'BarSeries',
				description: 'Right series. Set size to lg for the larger group.'
			},
			{ name: 'processor', type: 'string', description: 'Optional label between the two groups.' },
			GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-rank',
		title: 'Rank',
		name: 'GraphRank',
		description: 'A list of labels with a bar of characters and a number on the right.',
		props: [
			TITLE,
			{
				name: 'items',
				type: 'RankItem[]',
				description:
					'Each row is a label, a value, and an optional display string for the right column.'
			},
			{ name: 'max', type: 'number', description: 'Scale for the bars. Defaults to the largest value.' },
			{ name: 'ticks', type: 'number', default: '20', description: 'How many character slots each bar uses.' },
			GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-cells',
		title: 'Cells',
		name: 'GraphCells',
		description:
			'Grid of filled and empty cells, drawn with glyphs. Useful for density or comparing two sets.',
		props: [
			TITLE,
			{ name: 'items', type: 'CellGrid[]', description: 'Each item is a labeled 0/1 matrix.' },
			GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-meter',
		title: 'Meter',
		name: 'GraphMeter',
		description: 'Progress bar drawn with = characters. Empty slots stay as dashes.',
		props: [
			TITLE,
			{ name: 'value', type: 'number', description: '0 to 1.' },
			{ name: 'ticks', type: 'number', default: '14', description: 'Number of character slots.' },
			{ name: 'caption', type: 'string', description: 'Muted line under the meter.' },
			GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-spark',
		title: 'Spark',
		name: 'GraphSpark',
		description: 'Sparkline from block characters. Values scale to the highest point.',
		props: [
			TITLE,
			{ name: 'data', type: 'number[]', description: 'Relative values. Scaled to the max.' },
			{ name: 'caption', type: 'string', description: 'Muted line under the sparkline.' },
			SPARK_GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-tree',
		title: 'Tree',
		name: 'GraphTree',
		description: 'Nested tree with branch glyphs. Accent a node to highlight it.',
		props: [
			TITLE,
			{
				name: 'nodes',
				type: 'TreeNode[]',
				description: 'Nested nodes. Each may have label, meta, accent, and children.'
			},
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-timeline',
		title: 'Timeline',
		name: 'GraphTimeline',
		description: 'Vertical list of dates. Mark one row as current with the accent color.',
		props: [
			TITLE,
			{
				name: 'events',
				type: 'TimelineEvent[]',
				description: 'date, label, and optional state: done, now, or next.'
			},
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-stack',
		title: 'Stack',
		name: 'GraphStack',
		description:
			'Stacked bar for parts of a whole. Different glyphs per segment instead of colors.',
		props: [
			TITLE,
			{
				name: 'rows',
				type: 'StackRow[]',
				description: 'Each row has a label and labeled numeric segments.'
			},
			{
				name: 'accent',
				type: 'string',
				description: 'Segment label to paint with the accent. Defaults to the first.'
			},
			{ name: 'ticks', type: 'number', default: '24', description: 'Bar width in characters.' },
			STACK_GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-funnel',
		title: 'Funnel',
		name: 'GraphFunnel',
		description: 'Steps get narrower as values drop. Percentages compare to the first step.',
		props: [
			TITLE,
			{
				name: 'steps',
				type: 'FunnelStep[]',
				description: 'label, value, and optional display string for the count.'
			},
			{
				name: 'ticks',
				type: 'number',
				default: '20',
				description: 'Width of the first bar, in characters.'
			},
			{ name: 'stage', type: 'string', description: 'Step label to focus. Other rows recede.' },
			GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-gantt',
		title: 'Gantt',
		name: 'GraphGantt',
		description: 'Schedule chart. start and end are fractions from 0 to 1 along the track.',
		props: [
			TITLE,
			{
				name: 'items',
				type: 'GanttItem[]',
				description:
					'label, start, end, optional complete (0–1 fill inside the bar), and optional accent.'
			},
			{
				name: 'ticks',
				type: 'string[]',
				description: 'Labels under the track, spaced at the ends.'
			},
			{ name: 'columns', type: 'number', default: '24', description: 'Track width in characters.' },
			{ name: 'stage', type: 'string', description: 'Row label to focus. Other rows recede.' },
			{ name: 'progress', type: 'number', description: '0–1 playhead. Draws ▾ on the track.' },
			GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-plot',
		title: 'Plot',
		name: 'GraphPlot',
		description: 'Line or area chart built from columns of block characters.',
		props: [
			TITLE,
			{ name: 'data', type: 'number[]', description: 'One value per column, left to right.' },
			{ name: 'labels', type: 'string[]', description: 'First and last labels under the axis.' },
			{ name: 'height', type: 'number', default: '7', description: 'Rows in the plot.' },
			{
				name: 'variant',
				type: '"line" | "area"',
				default: '"area"',
				description: 'Area fills down from the cap with ░.'
			},
			{
				name: 'progress',
				type: 'number',
				default: '1',
				description: '0–1. How many columns are revealed.'
			},
			GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-waffle',
		title: 'Waffle',
		name: 'GraphWaffle',
		description: 'Grid of 100 cells. The value sets how many are filled in.',
		props: [
			TITLE,
			{ name: 'value', type: 'number', description: 'Share from 0 to 1.' },
			{ name: 'cells', type: 'number', default: '100', description: 'Total cells in the grid.' },
			{ name: 'columns', type: 'number', default: '10', description: 'Cells per row.' },
			{ name: 'caption', type: 'string', description: 'Muted line under the percent.' },
			GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-diff',
		title: 'Diff',
		name: 'GraphDiff',
		description:
			'List with add, remove, and unchanged rows. Works for changelogs or bundle sizes.',
		props: [
			TITLE,
			{
				name: 'rows',
				type: 'DiffRow[]',
				description: 'label, value, and optional sign: add, remove, or keep.'
			},
			{ name: 'footer', type: 'DiffRow', description: 'Total row under a rule.' },
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-invoice',
		title: 'Invoice',
		name: 'GraphInvoice',
		description:
			'Document table for invoices and quotes. From, bill-to, line items, and a totals block.',
		props: [
			TITLE,
			{
				name: 'from',
				type: 'InvoiceParty',
				description: 'Issuer name and optional address lines.'
			},
			{ name: 'to', type: 'InvoiceParty', description: 'Recipient name and optional address lines.' },
			{ name: 'meta', type: 'InvoiceMeta[]', description: 'Fields like number, issued, due.' },
			{
				name: 'items',
				type: 'InvoiceItem[]',
				description: 'Line items. qty and rate are optional; columns hide when unused.'
			},
			{
				name: 'totals',
				type: 'InvoiceTotal[]',
				description: 'Rows under the items. Set accent on the amount due.'
			},
			{ name: 'note', type: 'string', description: 'Muted line under the totals. Payment terms, etc.' },
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-compare',
		title: 'Compare',
		name: 'GraphCompare',
		description: 'Feature matrix. Cells are text or true/false, drawn as ✓ and –.',
		props: [
			TITLE,
			{ name: 'columns', type: 'string[]', description: 'Option names across the top.' },
			{
				name: 'rows',
				type: 'CompareRow[]',
				description: 'label plus one value per column. Booleans become ✓ or –.'
			},
			{
				name: 'accent',
				type: 'string',
				description: 'Column name to highlight. Other columns recede.'
			},
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-stat',
		title: 'Stat',
		name: 'GraphStat',
		description: 'A row of large numbers with labels.',
		props: [
			TITLE,
			{
				name: 'items',
				type: 'StatItem[]',
				description: 'value, label, optional hint, optional accent.'
			},
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-kpi',
		title: 'KPI',
		name: 'GraphKpi',
		description: 'One large number with a sparkline under it.',
		props: [
			TITLE,
			{ name: 'value', type: 'string', description: 'The large number, already formatted.' },
			{ name: 'label', type: 'string', description: 'Line under the number.' },
			{
				name: 'hint',
				type: 'string',
				description: 'Optional extra next to the label, like a delta.'
			},
			{ name: 'data', type: 'number[]', description: 'Sparkline values. Scaled to the highest point.' },
			SPARK_GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-spec',
		title: 'Spec',
		name: 'GraphSpec',
		description: 'Aligned label and value rows. Spec sheets, shipping labels, type samples.',
		props: [
			TITLE,
			{ name: 'rows', type: 'SpecRow[]', description: 'label, value, and optional accent.' },
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-activity',
		title: 'Activity',
		name: 'GraphActivity',
		description:
			'GitHub-style contribution grid. Pass dated counts; weeks, months, and intensity are derived.',
		props: [
			TITLE,
			{ name: 'days', type: 'ActivityDay[]', description: 'ISO date plus count. Gaps fill as empty days.' },
			{
				name: 'weekStartsOn',
				type: '0 | 1',
				default: '0',
				description: '0 is Sunday, like GitHub. 1 is Monday.'
			},
			{ name: 'max', type: 'number', description: 'Lock the intensity scale. Defaults to the highest count.' },
			{ name: 'legend', type: 'boolean', default: 'true', description: 'Less / more glyph key under the grid.' },
			{
				name: 'caption',
				type: 'string | false',
				description: 'Replaces the computed contribution total. Pass false to hide it.'
			},
			GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-heatmap',
		title: 'Heatmap',
		name: 'GraphHeatmap',
		description:
			'Labeled rows and columns with the same intensity glyphs as activity. Punchcards, hours, anything 2d.',
		props: [
			TITLE,
			{ name: 'columns', type: 'string[]', description: 'Column headers, left to right.' },
			{ name: 'rows', type: 'HeatRow[]', description: 'label plus a value per column.' },
			{ name: 'max', type: 'number', description: 'Lock the intensity scale across charts.' },
			{ name: 'legend', type: 'boolean', default: 'true', description: 'Less / more glyph key.' },
			{ name: 'caption', type: 'string', description: 'Optional note under the matrix.' },
			GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-calendar',
		title: 'Calendar',
		name: 'GraphCalendar',
		description:
			'One month as a seven-column grid. Marked days use the accent. today is wrapped in brackets.',
		props: [
			{ ...TITLE, description: 'Caption. Defaults to the month name.' },
			{ name: 'year', type: 'number', description: 'Full year.' },
			{ name: 'month', type: 'number', description: '1–12.' },
			{
				name: 'weekStartsOn',
				type: '0 | 1',
				default: '1',
				description: '0 is Sunday. 1 is Monday.'
			},
			{
				name: 'marks',
				type: 'number[] | CalendarMark[]',
				description: 'Days to accent. Pass numbers, or { day, accent }.'
			},
			{
				name: 'today',
				type: 'number',
				description: 'Day of the month to wrap in brackets. Pass it in.'
			},
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-waterfall',
		title: 'Waterfall',
		name: 'GraphWaterfall',
		description:
			'Running total as floating bars. First row is the start, last is the end, signed values in between.',
		props: [
			TITLE,
			{
				name: 'items',
				type: 'WaterfallItem[]',
				description:
					'label, value, optional display, and optional kind: start, in, out, or end. Kind is inferred if omitted.'
			},
			{ name: 'ticks', type: 'number', default: '24', description: 'Bar width in characters.' },
			GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-uptime',
		title: 'Uptime',
		name: 'GraphUptime',
		description: 'One glyph per day. ok, degraded, down, or empty. Wraps every 30 days.',
		props: [
			TITLE,
			{
				name: 'days',
				type: 'UptimeStatus[]',
				description: "'ok' | 'degraded' | 'down' | 'empty' — one per day."
			},
			{ name: 'from', type: 'string', description: 'Label at the start of the range.' },
			{ name: 'to', type: 'string', description: 'Label at the end of the range.' },
			{
				name: 'columns',
				type: 'number',
				default: '30',
				description: 'Days per row. Short series are not padded to this width.'
			},
			GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-latency',
		title: 'Latency',
		name: 'GraphLatency',
		description:
			'Percentile band chart. Each column stacks p50 (█) at the bottom, p50→p95 (▓), and p95→p99 (▒). Mark a point spike: true to draw a ^ above it.',
		props: [
			TITLE,
			{
				name: 'data',
				type: 'LatencyPoint[]',
				description: 'p50, p95, p99 in the same unit. Optional spike: true per point.'
			},
			{
				name: 'unit',
				type: 'string',
				default: '"ms"',
				description: 'Suffix for the percentile numbers and the y-axis.'
			},
			{
				name: 'height',
				type: 'number',
				default: '8',
				description: 'Rows in the plot. Clamped between 3 and 15.'
			},
			{
				name: 'labels',
				type: '[string, string]',
				description: 'First and last axis labels under the chart.'
			},
			{
				name: 'max',
				type: 'number',
				description: 'Lock the y-scale. Defaults to max(p99) across the data.'
			},
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-slo',
		title: 'SLO',
		name: 'GraphSlo',
		description:
			'Error-budget burn bar over a window. Spent fills the bar, remaining is the dim trail. Burn rate, time-to-empty, target, and actual follow below.',
		props: [
			TITLE,
			{
				name: 'budget',
				type: 'number',
				description: 'Fraction of the error budget consumed, 0–1.'
			},
			{ name: 'window', type: 'number', default: '30', description: 'Window length in the chosen unit.' },
			{ name: 'unit', type: '"h" | "d" | "w" | "mo"', default: '"d"', description: 'Window unit.' },
			{ name: 'target', type: 'number', description: 'Allowed error rate as a fraction, e.g. 0.001 for 99.9%.' },
			{ name: 'actual', type: 'number', description: 'Actual error rate as a fraction.' },
			{ name: 'burnRate', type: 'number', description: 'Burn rate multiplier (1 = on pace). Overrides elapsed.' },
			{ name: 'elapsed', type: 'number', description: 'Time elapsed so far in the window, in units.' },
			{ name: 'daily', type: 'number[]', description: 'Optional daily-burn samples, 0–1, drawn as a sparkline above the bar.' },
			{ name: 'caption', type: 'string', description: 'Muted line under the panel.' },
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-quota',
		title: 'Quota',
		name: 'GraphQuota',
		description:
			'Usage against a hard limit, with a reset date and end-of-window projection. Billing-style: the headline figure, the "X of Y" copy, and pace are surfaced together.',
		props: [
			TITLE,
			{ name: 'used', type: 'number', description: 'Amount consumed so far.' },
			{ name: 'limit', type: 'number', description: 'Hard limit for the window.' },
			{ name: 'unit', type: 'string', description: 'Unit label, e.g. "API calls" or "GB".' },
			{ name: 'resets', type: 'string', description: 'Reset label, e.g. "Oct 1" or "in 4 days".' },
			{ name: 'daysInto', type: 'number', description: 'Days elapsed in the window. Enables the projection.' },
			{ name: 'daysTotal', type: 'number', description: 'Window length in days.' },
			{ name: 'format', type: '(n: number) => string', description: 'Custom number formatter. Defaults to thousands-grouped.' },
			{ name: 'caption', type: 'string', description: 'Muted line under the panel.' },
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-slope',
		title: 'Slope',
		name: 'GraphSlope',
		description: 'Two figures per row with an arrow between. Up uses the accent, down recedes.',
		props: [
			TITLE,
			{ name: 'fromLabel', type: 'string', description: 'Header over the first column.' },
			{ name: 'toLabel', type: 'string', description: 'Header over the second column.' },
			{ name: 'items', type: 'SlopeItem[]', description: 'label, from, and to.' },
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-bullet',
		title: 'Bullet',
		name: 'GraphBullet',
		description: 'Actual versus target on a shared track. The marker is the target.',
		props: [
			TITLE,
			{
				name: 'items',
				type: 'BulletItem[]',
				description: 'label, value, optional target, max, and display.'
			},
			{
				name: 'ticks',
				type: 'number',
				default: '20',
				description: 'Track width in characters, not counting the brackets.'
			},
			GLYPHS,
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-timer',
		title: 'Timer',
		name: 'GraphTimer',
		description:
			'Elapsed time, how long ago, or the time of day. The numbers update every second.',
		props: [
			TITLE,
			{
				name: 'kind',
				type: '"elapsed" | "ago" | "clock"',
				default: '"elapsed"',
				description: 'elapsed counts up from at. ago is relative. clock is the time of day.'
			},
			{
				name: 'at',
				type: 'Date | number | string',
				description: 'Start time for elapsed and ago. A date, timestamp, or ISO string.'
			},
			{ name: 'caption', type: 'string', description: 'Line under the number.' },
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-countdown',
		title: 'Countdown',
		name: 'GraphCountdown',
		description: 'Time left until a date. After that it shows a short label you pass in.',
		props: [
			TITLE,
			{
				name: 'to',
				type: 'Date | number | string',
				description: 'The deadline. A date, timestamp, or ISO string.'
			},
			{ name: 'done', type: 'string', default: '"done"', description: 'What to show after the deadline.' },
			{ name: 'caption', type: 'string', description: 'Line under the number.' },
			PALETTE,
			CORNER,
			CLASS
		]
	},
	{
		slug: 'graph-frame',
		title: 'Frame',
		name: 'Graph',
		description:
			'Dashed frame wrapper used by every graph. Compose with GraphBody, GraphRule, GraphTrack, and GraphTick. corner picks the character at each corner.',
		props: [
			{ ...TITLE, description: 'Optional caption. Renders as [ TITLE ] on the top edge.' },
			{ ...CORNER, description: 'Character at each corner. Default +.' },
			{ ...CLASS, description: 'Passed to the figure.' },
			{ name: 'children', type: 'Snippet', description: 'Usually GraphBody.' }
		]
	},
	{
		slug: 'ascii-diagram',
		title: 'Ascii Diagram',
		name: 'AsciiDiagram',
		description:
			'Renders raw ASCII or Unicode diagrams with live tokens: titles, arrows, corners, and glyph blocks pick up the accent automatically.',
		props: [
			{
				name: 'content',
				type: 'string',
				description: 'The raw diagram text. It is HTML-escaped before tokenizing.'
			},
			{
				name: 'title',
				type: 'string',
				description: 'Optional label above the diagram.'
			},
			{
				name: 'showCopy',
				type: 'boolean',
				default: 'true',
				description: 'Show a copy-to-clipboard button for the raw text.'
			},
			{
				name: 'bordered',
				type: 'boolean',
				default: 'true',
				description: 'Dashed border around the diagram.'
			},
			{
				name: 'glow',
				type: 'boolean',
				default: 'false',
				description: 'Phosphor glow on accent tokens.'
			},
			{
				name: 'fontSize',
				type: 'string',
				default: '"0.85rem"',
				description: 'Font size of the diagram text.'
			},
			{
				name: 'lineHeight',
				type: 'string',
				default: '"1.35"',
				description: 'Line height of the diagram text.'
			},
			{
				name: 'align',
				type: '"left" | "center"',
				default: '"left"',
				description: 'Text alignment inside the viewport.'
			},
			{
				name: 'children',
				type: 'Snippet',
				description: 'Custom content instead of text.'
			},
			CLASS
		]
	},
	{
		slug: 'diagram-editor',
		title: 'Diagram Editor',
		name: 'DiagramEditor',
		description:
			'An embeddable playground: presets, a glyph palette, auto-align, and copy-as-Svelte or .svx. Takes no props.',
		props: []
	},
	{
		slug: 'amplifier-diagram',
		title: 'Amplifier',
		name: 'AmplifierDiagram',
		description:
			'A small taste wave runs through an AI stage and comes out amplified. The gain slider scales the output wave live.',
		props: [
			{
				name: 'gain',
				type: 'number',
				default: '3.5',
				description: 'Starting gain multiplier, 1 to 5.'
			},
			{
				name: 'interactive',
				type: 'boolean',
				default: 'true',
				description: 'Show the gain slider and dB readout.'
			},
			{
				name: 'animated',
				type: 'boolean',
				default: 'true',
				description: 'Animate the waves. Reduced motion freezes them.'
			},
			CLASS
		]
	},
	{
		slug: 'nested-radii-diagram',
		title: 'Nested Radii',
		name: 'NestedRadiiDiagram',
		description:
			'Interactive explainer for nested border radius: two sliders update the ASCII art, the formula, and a real CSS preview together.',
		props: [
			{
				name: 'initialOuter',
				type: 'number',
				default: '16',
				description: 'Starting outer radius in px.'
			},
			{
				name: 'initialInset',
				type: 'number',
				default: '4',
				description: 'Starting inset in px.'
			},
			{
				name: 'interactive',
				type: 'boolean',
				default: 'true',
				description: 'Show the sliders and the live CSS preview.'
			},
			CLASS
		]
	},
	{
		slug: 'prompt-loop-diagram',
		title: 'Prompt Loop',
		name: 'PromptLoopDiagram',
		description:
			'The prompt-and-iterate loop as a six-step player. Steps light up in turn, with play, pause, seek dots, and a speed slider.',
		props: [
			{
				name: 'autoPlay',
				type: 'boolean',
				default: 'true',
				description: 'Start playing on mount.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '1200',
				description: 'Milliseconds per step.'
			},
			{
				name: 'showControls',
				type: 'boolean',
				default: 'true',
				description: 'Show the playback controls.'
			},
			CLASS
		]
	},
	{
		slug: 'metrics-table-diagram',
		title: 'Metrics Table',
		name: 'MetricsTableDiagram',
		description:
			'A cost ledger as ASCII: label, tool calls, and time per row, with a total row. Static by design.',
		props: [
			{
				name: 'title',
				type: 'string',
				default: '"COST"',
				description: 'Caption on the top edge, uppercased.'
			},
			{
				name: 'rows',
				type: 'MetricRow[]',
				description: 'label, calls, and time per row.'
			},
			{
				name: 'totalCalls',
				type: 'number | string',
				description: 'Total for the calls column.'
			},
			{
				name: 'totalTime',
				type: 'string',
				description: 'Total for the time column.'
			},
			{
				name: 'showTotal',
				type: 'boolean',
				default: 'true',
				description: 'Show the total row.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-agni',
		title: 'Agni',
		name: 'GraphAgni',
		description:
			'A vedic fire in a havan kund: heat rises from the pit mouth in a breathing column while sparks drift and fade. Decorative, and frozen under reduced motion.',
		props: [
			{
				name: 'cols',
				type: 'number',
				default: '56',
				description: 'Scene width in characters.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '16',
				description: 'Scene height in rows.'
			},
			{
				name: 'cooling',
				type: 'number',
				default: '0.6',
				description: 'Random decay strength; higher burns out sooner.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-aum',
		title: 'Aum',
		name: 'GraphAum',
		description:
			'The om figure inked stroke by stroke, then held by a resonance crest that travels the stroke order and rests. Frozen settled under reduced motion.',
		props: [
			{
				name: 'cols',
				type: 'number',
				default: '56',
				description: 'Scene width in characters; at least 46 so the figure fits.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '22',
				description: 'Scene height in rows; the figure fills the height.'
			},
			{
				name: 'seedNum',
				type: 'number',
				default: '7',
				description: 'Offsets the resonance wave along the stroke.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-boot',
		title: 'Boot',
		name: 'GraphBoot',
		description:
			'A deploy log: per-step progress bars (▰▱), ✓ on pass and ✗ on fail, plus a total `N/M passed 4.2s/6.0s` summary row. Frozen mid-run under reduced motion.',
		props: [
			{
				name: 'steps',
				type: 'GraphBootStep[]',
				default: '—',
				description: 'Ordered list of { label, eta?, fail? } steps to run.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '90',
				description: 'Milliseconds per tick of the boot animation.'
			},
			{
				name: 'stepTicks',
				type: 'number',
				default: '14',
				description: 'Base ticks each step takes before flipping to ✓/✗.'
			},
			{
				name: 'seedNum',
				type: 'number',
				default: '5',
				description: 'Seed for per-step timing jitter; same seed = same run.'
			},
			{
				name: 'label',
				type: 'string',
				default: 'from cold to live',
				description: 'Short caption under the art.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-cron',
		title: 'Cron',
		name: 'GraphCron',
		description:
			'A zero-dep cron parser. The next N runs of any standard 5-field expression laid out on a tick timeline, with a date and HH:MM ribbon under each marker. Frozen on the first run under reduced motion.',
		props: [
			{
				name: 'expr',
				type: 'string',
				description: 'Standard 5-field cron expression: `min hour dom mon dow`.'
			},
			{
				name: 'count',
				type: 'number',
				default: '8',
				description: 'Number of next runs to render on the timeline.'
			},
			{
				name: 'baseTime',
				type: 'number',
				description: 'ms since epoch. Defaults to Date.now() at mount.'
			},
			{
				name: 'cols',
				type: 'number',
				default: '60',
				description: 'Timeline width in characters.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '12',
				description: 'Scene height in rows.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '220',
				description: 'Milliseconds per tick when the timeline advances.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-damru',
		title: 'Damru',
		name: 'GraphDamru',
		description:
			'Two triangles meet at a point and pulse on every beat of an 8-beat Adi tala, with a \u2592 ripple expanding and fading each time. Frozen on a clap beat under reduced motion.',
		props: [
			{
				name: 'cols',
				type: 'number',
				default: '60',
				description: 'Scene width in characters.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '16',
				description: 'Scene height in rows.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '220',
				description: 'Milliseconds per beat of the tala.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-deps',
		title: 'Deps',
		name: 'GraphDeps',
		description:
			'A dependency tree from a manifest, with version tags on every row and a depth-mark column on the left. Rows cascade in from the root, then a brief rest. Frozen fully-revealed under reduced motion.',
		props: [
			{
				name: 'deps',
				type: 'DepNode[]',
				description: 'Root-level packages. Each has name, version, optional children, and optional accent.'
			},
			{
				name: 'depth',
				type: 'number',
				default: '6',
				description: 'Max depth to render, clamped 1..16.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '80',
				description: 'Milliseconds between cascading row reveals.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-diya',
		title: 'Diya',
		name: 'GraphDiya',
		description:
			'A row of oil lamps lights left-to-right one by one, then breathes together, occasionally one gutters and relights. Frozen lit under reduced motion.',
		props: [
			{
				name: 'cols',
				type: 'number',
				default: '60',
				description: 'Scene width in characters.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '14',
				description: 'Scene height in rows.'
			},
			{
				name: 'lamps',
				type: 'number',
				default: '5',
				description: 'Number of diyas across the row.'
			},
			{
				name: 'seedNum',
				type: 'number',
				default: '13',
				description: 'Seed for per-lamp phase and gutter schedule.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-fire',
		title: 'Fire',
		name: 'GraphFire',
		description:
			'Demoscene fire in shade glyphs: heat rises from a hot base and cools as it climbs. Decorative, and frozen under reduced motion.',
		props: [
			{
				name: 'cols',
				type: 'number',
				default: '60',
				description: 'Fire width in characters.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '14',
				description: 'Fire height in rows.'
			},
			{
				name: 'cooling',
				type: 'number',
				default: '0.6',
				description: 'Random decay strength; higher burns out sooner.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-flame',
		title: 'Flame',
		name: 'GraphFlame',
		description:
			'ASCII flame graph: nested rows of frames where each frame’s width is its share of time. Cycles through hot leaves and lights the ancestor chain. Frozen on the first leaf under reduced motion.',
		props: [
			{
				name: 'speedMs',
				type: 'number',
				default: '600',
				description: 'Milliseconds per leaf cycle step.'
			},
			{
				name: 'label',
				type: 'string',
				description: 'Optional caption drawn under the art.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-flow-player',
		title: 'Flow Player',
		name: 'GraphFlowPlayer',
		description:
			'A play/pause step-player for ordered process steps. The active step lights up and its detail unfolds beneath it.',
		props: [
			{
				name: 'steps',
				type: 'FlowStep[]',
				description: 'Ordered steps; detail is revealed under the active one.'
			},
			{
				name: 'autoPlay',
				type: 'boolean',
				default: 'false',
				description: 'Start playing on mount; never under reduced motion.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '1600',
				description: 'Milliseconds per step; loops after the last.'
			},
			{
				name: 'showControls',
				type: 'boolean',
				default: 'true',
				description: 'Prev, play/pause, next, seek dots, speed slider.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-ganga',
		title: 'Ganga',
		name: 'GraphGanga',
		description:
			'Three meandering flow lines cascade in steps, with a lone diya flame bobbing downstream. A calmer GraphStream. Frozen mid-flow under reduced motion.',
		props: [
			{
				name: 'cols',
				type: 'number',
				default: '60',
				description: 'Scene width in characters.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '18',
				description: 'Scene height in rows.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '110',
				description: 'Milliseconds per tick.'
			},
			{
				name: 'seedNum',
				type: 'number',
				default: '17',
				description: 'Seed for the flow pattern and the diya bob.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-hash',
		title: 'Hash',
		name: 'GraphHash',
		description:
			'Any string → its 64-bit FNV-1a digest as a 4-tier glyph-checkerboard fingerprint (· ░ ▒ ▓) with a scan line that sweeps the grid and a hex readout underneath. Same input always yields the same fingerprint.',
		props: [
			{
				name: 'input',
				type: 'string',
				default: "'markgraphy'",
				description: 'Any string. Its 64-bit digest is the seed — same input = same fingerprint.'
			},
			{
				name: 'cols',
				type: 'number',
				default: '16',
				description: 'Grid width in cells (2 bits per cell, 64-bit digest total).'
			},
			{
				name: 'rows',
				type: 'number',
				default: '6',
				description: 'Grid height in cells.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '60',
				description: 'Milliseconds per tick of the scan-line sweep.'
			},
			{
				name: 'label',
				type: 'string',
				default: 'any string → a glyph fingerprint',
				description: 'Short caption under the art.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-japa',
		title: 'Japa',
		name: 'GraphJapa',
		description:
			'A 108-bead mala with a marker advancing clockwise, a soft tail behind, and a corner counter; the whole ring shimmers on every revolution. Frozen mid-mala under reduced motion.',
		props: [
			{
				name: 'cols',
				type: 'number',
				default: '60',
				description: 'Scene width in characters.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '22',
				description: 'Scene height in rows; the mala fills the height minus the counter row.'
			},
			{
				name: 'beads',
				type: 'number',
				default: '108',
				description: 'Total beads per mala; the counter shows current/total.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '110',
				description: 'Milliseconds per bead.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-life',
		title: 'Life',
		name: 'GraphLife',
		description:
			"Conway's Game of Life in block glyphs with faint death trails, toroidal edges, and a gen/pop readout. Play, step, or reset.",
		props: [
			{
				name: 'cols',
				type: 'number',
				default: '44',
				description: 'Board width in cells.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '14',
				description: 'Board height in cells.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '220',
				description: 'Milliseconds per generation.'
			},
			{
				name: 'seedNum',
				type: 'number',
				default: '7',
				description: 'PRNG seed; same value, same board, every reset.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-mandel',
		title: 'Mandelbrot',
		name: 'GraphMandel',
		description:
			'A slowly zooming ASCII Mandelbrot drifting into seahorse valley, its dense core tinted accent. The brand piece.',
		props: [
			{
				name: 'cols',
				type: 'number',
				default: '66',
				description: 'Grid width in cells.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '20',
				description: 'Grid height in cells.'
			},
			{
				name: 'zoomPerTick',
				type: 'number',
				default: '1.06',
				description: 'Window shrink factor per tick.'
			},
			{
				name: 'maxIter',
				type: 'number',
				default: '90',
				description: 'Starting iteration budget; grows while zooming.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-mandala',
		title: 'Mandala',
		name: 'GraphMandala',
		description:
			'Lotus-petal rings bloom ring by ring from a bindu, with K-fold rotational symmetry; one canonical petal is rotated K times. Every seed is a different mandala. Frozen fully bloomed under reduced motion.',
		props: [
			{
				name: 'cols',
				type: 'number',
				default: '48',
				description: 'Scene width in characters; at least 38 so the outermost ring fits.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '24',
				description: 'Scene height in rows; at least 20 so the circle fits the cell aspect.'
			},
			{
				name: 'folds',
				type: 'number',
				default: '8',
				description: 'Rotational folds (K); one cell of the canonical petal is rotated K times.'
			},
			{
				name: 'rings',
				type: 'number',
				default: '5',
				description: 'Number of concentric lotus-petal rings.'
			},
			{
				name: 'seedNum',
				type: 'number',
				default: '11',
				description: 'Seed for per-ring radius and phase perturbation.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-pulse',
		title: 'Pulse',
		name: 'GraphPulse',
		description:
			'A live uptime strip that appends one blip per tick, with a legend, percent-up, and a last-check caption.',
		props: [
			{
				name: 'length',
				type: 'number',
				default: '60',
				description: 'Window size in blips.'
			},
			{
				name: 'intervalMs',
				type: 'number',
				default: '1000',
				description: 'Milliseconds between appends.'
			},
			{
				name: 'okRate',
				type: 'number',
				default: '0.94',
				description: 'Probability an appended blip is ok.'
			},
			{
				name: 'feed',
				type: 'function',
				description: 'Custom status generator: ok, degraded, or down.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-rain',
		title: 'Rain',
		name: 'GraphRain',
		description:
			'Matrix-style glyph rain: columns fall at their own speeds behind a bright head, trails fading to faint. Decorative.',
		props: [
			{
				name: 'cols',
				type: 'number',
				default: '56',
				description: 'Width in character columns.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '16',
				description: 'Height in rows.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '110',
				description: 'Milliseconds per tick.'
			},
			{
				name: 'trail',
				type: 'number',
				default: '8',
				description: 'Trail length behind each head.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-scatter',
		title: 'Scatter',
		name: 'GraphScatter',
		description:
			'An x/y dot plot in the glyph grid, with a 4-char y-axis gutter and an x-axis ribbon under the plot. Pass trend={true} to add a single-row linear-regression strip below. Reveals left-to-right, then a brief rest. Frozen fully-revealed under reduced motion.',
		props: [
			{
				name: 'data',
				type: 'ScatterPoint[]',
				description: 'Points to plot. x and y are real numbers; the chart scales them.'
			},
			{
				name: 'cols',
				type: 'number',
				default: '60',
				description: 'Scene width (excluding the y-axis gutter).'
			},
			{
				name: 'rows',
				type: 'number',
				default: '14',
				description: 'Scene height (excluding the x-axis row and trend row).'
			},
			{
				name: 'trend',
				type: 'boolean',
				default: 'false',
				description: 'Render a single-row linear-regression strip below the plot.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '60',
				description: 'Milliseconds between reveals of new points.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-surya',
		title: 'Surya',
		name: 'GraphSurya',
		description:
			'A spoked sun that rises from behind the horizon line, turns one spoke at a time, and sets again. Frozen mid-morning under reduced motion.',
		props: [
			{
				name: 'cols',
				type: 'number',
				default: '60',
				description: 'Scene width in characters.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '18',
				description: 'Scene height in rows.'
			},
			{
				name: 'rays',
				type: 'number',
				default: '12',
				description: 'Spokes on the wheel.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-scope',
		title: 'Scope',
		name: 'GraphScope',
		description:
			'A scrolling oscilloscope window over any number series, drawn in block glyphs; the newest column glows accent.',
		props: [
			{
				name: 'data',
				type: 'number[]',
				description: 'Series to scroll through; the window loops over it.'
			},
			{
				name: 'window',
				type: 'number',
				default: '44',
				description: 'Visible columns.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '6',
				description: 'Grid height in rows.'
			},
			{
				name: 'mode',
				type: '"line" | "area"',
				default: '"line"',
				description: 'Line trace or filled area under it.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-sequence',
		title: 'Sequence',
		name: 'GraphSequence',
		description:
			'ASCII sequence diagram: participants on columns, labeled dashed arrows between them, and activation bars on each lifeline. The current message and its endpoints light up. Frozen on the first message under reduced motion.',
		props: [
			{
				name: 'cols',
				type: 'number',
				default: '68',
				description: 'Scene width in characters; at least 40 so four participants fit.'
			},
			{
				name: 'rows',
				type: 'number',
				default: '12',
				description: 'Scene height in rows; at least 10 so header + 6 messages fit.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '600',
				description: 'Milliseconds per message step.'
			},
			{
				name: 'label',
				type: 'string',
				description: 'Optional caption drawn under the art.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-spinners',
		title: 'Spinners',
		name: 'GraphSpinners',
		description:
			'A family of glyph spinners — slash, dots, bounce, bar — with a muted label. Holds frame one under reduced motion.',
		props: [
			{
				name: 'kind',
				type: 'SpinnerKind',
				default: '"dots"',
				description: 'Which built-in frame set to show.'
			},
			{
				name: 'label',
				type: 'string',
				default: '"loading"',
				description: 'Muted text after the spinner glyphs.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '120',
				description: 'Milliseconds per frame.'
			},
			{
				name: 'frames',
				type: 'string[]',
				description: 'Custom frame set; overrides kind.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-state',
		title: 'State',
		name: 'GraphState',
		description:
			'ASCII state-machine chart: state boxes in a 2×2 grid with labeled transitions on the arrows. The current state and its outgoing transition light up. Frozen on the first state under reduced motion.',
		props: [
			{
				name: 'speedMs',
				type: 'number',
				default: '700',
				description: 'Milliseconds per state step.'
			},
			{
				name: 'label',
				type: 'string',
				description: 'Optional caption drawn under the art.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-stream',
		title: 'Stream',
		name: 'GraphStream',
		description:
			'A live terminal KPI: big current value, a one-row glyph sparkline that appends, and an updated-Ns-ago caption.',
		props: [
			{
				name: 'length',
				type: 'number',
				default: '40',
				description: 'Points kept in the rolling history.'
			},
			{
				name: 'intervalMs',
				type: 'number',
				default: '900',
				description: 'Milliseconds between appends.'
			},
			{
				name: 'generate',
				type: 'function',
				description: 'Next-value generator; defaults to a random walk.'
			},
			{
				name: 'unit',
				type: 'string',
				default: '""',
				description: 'Suffix after the value, rendered muted.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-terminal',
		title: 'Terminal',
		name: 'GraphTerminal',
		description:
			'A scripted shell session: a `$ ` prompt gets typed character-by-character, output blocks stream right after, the whole script loops. Combines a typewriter (prompt) and a stream (output) into one frame.',
		props: [
			{
				name: 'lines',
				type: 'TerminalLine[]',
				default: '—',
				description: "Scripted session: { kind: 'prompt' | 'output', text: string } entries."
			},
			{
				name: 'typeMs',
				type: 'number',
				default: '28',
				description: 'Milliseconds per character when typing a prompt line.'
			},
			{
				name: 'streamMs',
				type: 'number',
				default: '14',
				description: 'Milliseconds per character when streaming an output line.'
			},
			{
				name: 'holdMs',
				type: 'number',
				default: '1600',
				description: 'Hold time at the end of the script before looping.'
			},
			{
				name: 'label',
				type: 'string',
				default: 'a session, scripted',
				description: 'Short caption under the art.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-ticker',
		title: 'Ticker',
		name: 'GraphTicker',
		description:
			'A one-row status marquee that rotates whole [ OK ] / [ WARN ] / [ DOWN ] tokens, colors staying attached.',
		props: [
			{
				name: 'items',
				type: 'TickerItem[]',
				description: 'Tokens rotated through the row.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '140',
				description: 'Milliseconds per rotation step.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-typewriter',
		title: 'Typewriter',
		name: 'GraphTypewriter',
		description:
			'Text that types itself with a blinking block cursor, holds, and loops. Reduced motion shows the full text.',
		props: [
			{
				name: 'lines',
				type: 'string[]',
				description: 'Lines typed one character at a time, in order.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '55',
				description: 'Milliseconds per character.'
			},
			{
				name: 'holdMs',
				type: 'number',
				default: '1400',
				description: 'Pause after full text before restarting.'
			},
			{
				name: 'loop',
				type: 'boolean',
				default: 'true',
				description: 'Retype after the hold; false leaves the text and a solid cursor.'
			},
			CLASS
		]
	},
	{
		slug: 'graph-workflow',
		title: 'Workflow',
		name: 'GraphWorkflow',
		description:
			'A typed workflow diagram: nodes and edges as data, auto-laid out as a top-down DAG, with a play/pause step-player that lights up the path.',
		props: [
			TITLE,
			{
				name: 'nodes',
				type: 'WorkflowNode[]',
				description: 'Nodes in input order. Within a rank, input order is preserved.'
			},
			{
				name: 'edges',
				type: 'WorkflowEdge[]',
				description:
					'Directed edges. If omitted, a linear chain in nodes[].id order is used.'
			},
			{
				name: 'path',
				type: 'string[]',
				description: 'Activation order. Defaults to a topological pass over the graph.'
			},
			{
				name: 'animated',
				type: 'boolean',
				default: 'true',
				description:
					'Animate the active-step pulse and color transitions. Off under reduced motion.'
			},
			{
				name: 'autoPlay',
				type: 'boolean',
				default: 'false',
				description: 'Start playing on mount. Never autoplays under reduced motion.'
			},
			{
				name: 'speedMs',
				type: 'number',
				default: '1200',
				description: 'Milliseconds per step. Adjustable on the controls.'
			},
			{
				name: 'showControls',
				type: 'boolean',
				default: 'true',
				description: 'Show the play / pause / step / speed controls.'
			},
			{
				name: 'label',
				type: 'string',
				description: 'Short caption rendered under the diagram.'
			},
			CORNER,
			CLASS
		]
	},
	{
		slug: 'shuffle-text',
		title: 'Shuffle Text',
		name: 'ShuffleText',
		description:
			'Per-character shuffle animation with intersection-observer trigger, easing, colour interpolation, and loop support. Frozen as plain text under reduced motion.',
		props: [
			{
				name: 'text',
				type: 'string',
				description: 'The text to animate, one character at a time.'
			},
			{
				name: 'shuffleDirection',
				type: '"left" | "right" | "up" | "down"',
				default: '"right"',
				description: 'Direction the characters slide in from.'
			},
			{
				name: 'duration',
				type: 'number',
				default: '0.35',
				description: 'Seconds per character tween.'
			},
			{
				name: 'maxDelay',
				type: 'number',
				default: '0',
				description: 'Maximum random delay per character in random mode.'
			},
			{
				name: 'ease',
				type: 'string | EasingFunction',
				default: '"power3.out"',
				description: 'Easing curve. Named preset or custom function.'
			},
			{
				name: 'shuffleTimes',
				type: 'number',
				default: '1',
				description: 'Number of scramble clones before the real character lands.'
			},
			{
				name: 'animationMode',
				type: '"evenodd" | "random"',
				default: '"evenodd"',
				description: 'Stagger pattern across characters.'
			},
			{
				name: 'stagger',
				type: 'number',
				default: '0.03',
				description: 'Seconds between character starts in evenodd mode.'
			},
			{
				name: 'loop',
				type: 'boolean',
				default: 'false',
				description: 'Re-play the animation after it finishes.'
			},
			{
				name: 'loopDelay',
				type: 'number',
				default: '0',
				description: 'Seconds to wait between loops.'
			},
			{
				name: 'tag',
				type: 'TagName',
				default: '"p"',
				description: 'HTML element to render.'
			},
			{
				name: 'scrambleCharset',
				type: 'string',
				default: '""',
				description: 'Characters used for scramble clones. Empty uses the original text.'
			},
			{
				name: 'colorFrom',
				type: 'string',
				description: 'Start colour for the interpolation.'
			},
			{
				name: 'colorTo',
				type: 'string',
				description: 'End colour for the interpolation.'
			},
			{
				name: 'triggerOnce',
				type: 'boolean',
				default: 'true',
				description: 'Disconnect the observer after the first reveal.'
			},
			{
				name: 'respectReducedMotion',
				type: 'boolean',
				default: 'true',
				description: 'Show plain text immediately under prefers-reduced-motion.'
			},
			{
				name: 'triggerOnHover',
				type: 'boolean',
				default: 'true',
				description: 'Re-play the animation on mouseenter.'
			},
			CLASS
		]
	}
];

export const components: ComponentDoc[] = catalog;

// Categories. `components` stays the flat union for existing callers;
// the docs surfaces group with these instead.
const ANIMATED_SLUGS = new Set([
	'graph-typewriter',
	'graph-ticker',
	'graph-scope',
	'graph-stream',
	'graph-flow-player',
	'graph-life',
	'graph-mandel',
	'graph-pulse',
	'graph-spinners',
	'graph-fire',
	'graph-rain',
	'graph-agni',
	'graph-aum',
	'graph-boot',
	'graph-cron',
	'graph-damru',
	'graph-deps',
	'graph-diya',
	'graph-ganga',
	'graph-hash',
	'graph-japa',
	'graph-mandala',
	'graph-scatter',
	'graph-surya',
	'graph-terminal',
	'graph-flame',
	'graph-sequence',
	'graph-state',
	'graph-workflow',
	'shuffle-text'
]);

export const staticComponents: ComponentDoc[] = components.filter(
	(item) => !ANIMATED_SLUGS.has(item.slug)
);

export const animatedComponents: ComponentDoc[] = components.filter((item) =>
	ANIMATED_SLUGS.has(item.slug)
);

export function getComponent(slug: string): ComponentDoc | undefined {
	return components.find((item) => item.slug === slug);
}
