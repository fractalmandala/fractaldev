// Docs previews: live component + props and the copyable usage snippet for
// every catalog entry that has one. Data + component refs only — no markup.
// The [slug] page renders the live side; its +page.server.ts highlights the
// `code` strings with shiki and returns the HTML alongside.
// Frame (graph-frame) is assembled in the page; its snippet is FRAME_CODE.

import type { Component } from 'svelte';
import {
	GraphActivity,
	GraphBars,
	GraphBullet,
	GraphCalendar,
	GraphCells,
	GraphCompare,
	GraphCountdown,
	GraphDiff,
	GraphFlow,
	GraphFunnel,
	GraphGantt,
	GraphHeatmap,
	GraphInvoice,
	GraphKpi,
	GraphLatency,
	GraphMeter,
	GraphPlot,
	GraphQuota,
	GraphRank,
	GraphSlope,
	GraphSlo,
	GraphSpark,
	GraphSpec,
	GraphStack,
	GraphStat,
	GraphTable,
	GraphTimeline,
	GraphTimer,
	GraphTree,
	GraphUptime,
	GraphWaffle,
	GraphWaterfall,
	AmplifierDiagram,
	AsciiDiagram,
	DiagramEditor,
	GraphAgni,
	GraphAum,
	GraphBoot,
	GraphCron,
	GraphDamru,
	GraphDeps,
	GraphDiya,
	GraphFire,
	GraphFlame,
	GraphFlowPlayer,
	GraphGanga,
	GraphHash,
	GraphJapa,
	GraphLife,
	GraphMandel,
	GraphMandala,
	GraphPulse,
	GraphRain,
	GraphScatter,
	GraphScope,
	GraphSequence,
	GraphSpinners,
	GraphState,
	GraphStream,
	GraphSurya,
	GraphTerminal,
	GraphTicker,
	GraphTypewriter,
	GraphWorkflow,
	MetricsTableDiagram,
	NestedRadiiDiagram,
	PromptLoopDiagram,
	ShuffleText
} from '$lib';

export type PreviewEntry = {
	// Component with heterogeneous props — validated against the map below.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Comp: Component<any>;
	props: Record<string, unknown>;
	code: string;
};

function activityDays(start: string, length: number) {
	const [year, month, day] = start.split('-').map(Number);
	const origin = Date.UTC(year, month - 1, day);
	return Array.from({ length }, (_, index) => {
		const time = origin + index * 86_400_000;
		const date = new Date(time).toISOString().slice(0, 10);
		const dow = new Date(time).getUTCDay();
		const week = Math.floor(index / 7);
		let count = 0;
		if (dow > 0 && dow < 6) {
			const pulse = (week + dow) % 9;
			count =
				pulse === 0 ? 12 : pulse === 4 ? 7 : pulse % 3 === 0 ? 3 : index % 5 === 0 ? 1 : 0;
		} else if (index % 13 === 0) {
			count = 2;
		}
		return { date, count };
	});
}

const yearActivity = activityDays('2025-09-01', 371);
const quarterActivity = activityDays('2026-06-01', 91);

const uptimeDays = Array.from({ length: 90 }, (_, index) =>
	index === 41 || index === 42
		? 'down'
		: index === 18 || index === 60 || index === 61
			? 'degraded'
			: 'ok'
);

export const FRAME_CODE = `import { Graph, GraphBody, GraphRule } from 'markgraphy';

<Graph title="USAGE">
  <GraphBody>
    <p>Content goes inside the frame.</p>
    <GraphRule />
  </GraphBody>
</Graph>`;

export const previews: Record<string, PreviewEntry[]> = {
	'graph-table': [
		{
			Comp: GraphTable,
			props: {
				title: 'WHAT THE RESEARCH COST',
				headers: ['Agent', 'Tokens', 'Tool calls', 'Time'],
				align: ['left', 'right', 'right', 'right'],
				rows: [
					['Inks and paper', '115,207', '120', '16m'],
					['Overprint and drift', '135,218', '164', '16m'],
					['Naming the patterns', '186,716', '112', '18m']
				],
				footer: ['Total', '437,141', '396', '~50m']
			},
			code: `import { GraphTable } from 'markgraphy';

<GraphTable
  title="WHAT THE RESEARCH COST"
  headers={['Agent', 'Tokens', 'Tool calls', 'Time']}
  align={['left', 'right', 'right', 'right']}
  rows={[
    ['Inks and paper', '115,207', '120', '16m'],
    ['Overprint and drift', '135,218', '164', '16m'],
    ['Naming the patterns', '186,716', '112', '18m']
  ]}
  footer={['Total', '437,141', '396', '~50m']}
/>`
		},
		{
			Comp: GraphTable,
			props: {
				title: 'TASTE, EXPLAINED',
				headers: ['Decision', 'Reason'],
				align: ['left', 'left'],
				rows: [
					['ease-out on enter', 'feels snappier'],
					['180ms, not 400ms', 'feels faster, more responsive'],
					['springs for gestures', 'they carry your momentum'],
					['scale 0.97 on press', 'it makes the UI feel alive'],
					['no animation at all', 'you open it hundreds of times']
				]
			},
			code: `import { GraphTable } from 'markgraphy';

<GraphTable
  title="TASTE, EXPLAINED"
  headers={['Decision', 'Reason']}
  rows={[
    ['ease-out on enter', 'feels snappier'],
    ['180ms, not 400ms', 'feels faster, more responsive'],
    ['springs for gestures', 'they carry your momentum'],
    ['scale 0.97 on press', 'it makes the UI feel alive'],
    ['no animation at all', 'you open it hundreds of times']
  ]}
/>`
		}
	],
	'graph-flow': [
		{
			Comp: GraphFlow,
			props: {
				title: 'OPTIMISTIC UI',
				rows: [
					{ nodes: [{ label: 'tap' }, { label: 'server' }, { label: 'update' }] },
					{
						nodes: [
							{ label: 'tap' },
							{ label: 'update', tone: 'accent' },
							{ label: 'server syncs', stretch: true, tone: 'muted' }
						]
					}
				]
			},
			code: `import { GraphFlow, type FlowRow } from 'markgraphy';

const rows: FlowRow[] = [
  { nodes: [{ label: 'tap' }, { label: 'server' }, { label: 'update' }] },
  {
    nodes: [
      { label: 'tap' },
      { label: 'update', tone: 'accent' },
      { label: 'server syncs', stretch: true, tone: 'muted' }
    ]
  }
];

<GraphFlow title="OPTIMISTIC UI" {rows} />`
		}
	],
	'graph-bars': [
		{
			Comp: GraphBars,
			props: {
				title: 'DRAFT TO SHIPPED',
				from: { label: 'draft', values: [1, 2, 2, 3, 1] },
				processor: 'edit',
				to: { label: 'shipped', size: 'lg', values: [3, 5, 4, 6, 5] }
			},
			code: `import { GraphBars, type BarSeries } from 'markgraphy';

const from: BarSeries = { label: 'draft', values: [1, 2, 2, 3, 1] };
const to: BarSeries = { label: 'shipped', size: 'lg', values: [3, 5, 4, 6, 5] };

<GraphBars title="DRAFT TO SHIPPED" processor="edit" {from} {to} />`
		}
	],
	'graph-rank': [
		{
			Comp: GraphRank,
			props: {
				title: 'ROUTES',
				items: [
					{ label: '/docs', value: 12400 },
					{ label: '/install', value: 4100 },
					{ label: '/plot', value: 860 },
					{ label: '/rank', value: 420 }
				]
			},
			code: `import { GraphRank } from 'markgraphy';

<GraphRank
  title="ROUTES"
  items={[
    { label: '/docs', value: 12400 },
    { label: '/install', value: 4100 },
    { label: '/plot', value: 860 },
    { label: '/rank', value: 420 }
  ]}
/>`
		}
	],
	'graph-cells': [
		{
			Comp: GraphCells,
			props: {
				title: 'TWO WAYS TO LEARN',
				items: [
					{
						label: 'fragments',
						cells: [
							[1, 0, 1, 0, 0],
							[0, 1, 0, 1, 0],
							[1, 0, 0, 0, 1]
						]
					},
					{
						label: 'a system',
						cells: [
							[1, 1, 1, 1, 1],
							[1, 1, 1, 1, 1],
							[1, 1, 1, 1, 1]
						]
					}
				]
			},
			code: `import { GraphCells } from 'markgraphy';

<GraphCells
  title="TWO WAYS TO LEARN"
  items={[
    {
      label: 'fragments',
      cells: [
        [1, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1]
      ]
    },
    {
      label: 'a system',
      cells: [
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1]
      ]
    }
  ]}
/>`
		}
	],
	'graph-meter': [
		{
			Comp: GraphMeter,
			props: { title: 'SHIPPED', value: 0.67, caption: 'characters, not a progress bar' },
			code: `import { GraphMeter } from 'markgraphy';

<GraphMeter title="SHIPPED" value={0.67} caption="characters, not a progress bar" />`
		}
	],
	'graph-spark': [
		{
			Comp: GraphSpark,
			props: {
				title: 'LATENCY',
				data: [2, 3, 4, 3, 6, 5, 8, 7, 9, 6, 10, 8],
				caption: 'last point is the accent'
			},
			code: `import { GraphSpark } from 'markgraphy';

<GraphSpark
  title="LATENCY"
  data={[2, 3, 4, 3, 6, 5, 8, 7, 9, 6, 10, 8]}
  caption="last point is the accent"
/>`
		}
	],
	'graph-tree': [
		{
			Comp: GraphTree,
			props: {
				title: 'REGISTRY',
				nodes: [
					{
						label: 'src/lib',
						children: [
							{
								label: 'graphs',
								children: [
									{ label: 'GraphStat.svelte', meta: 'graph' },
									{ label: 'GraphTable.svelte', meta: 'graph' }
								]
							},
							{
								label: 'frame',
								children: [{ label: 'Graph.svelte', meta: 'frame', accent: true }]
							}
						]
					}
				]
			},
			code: `import { GraphTree } from 'markgraphy';

<GraphTree
  title="REGISTRY"
  nodes={[
    {
      label: 'src/lib',
      children: [
        {
          label: 'graphs',
          children: [
            { label: 'GraphStat.svelte', meta: 'graph' },
            { label: 'GraphTable.svelte', meta: 'graph' }
          ]
        },
        {
          label: 'frame',
          children: [{ label: 'Graph.svelte', meta: 'frame', accent: true }]
        }
      ]
    }
  ]}
/>`
		}
	],
	'graph-timeline': [
		{
			Comp: GraphTimeline,
			props: {
				title: 'SHIPPED',
				events: [
					{ date: 'Mar 12', label: 'npm publish' },
					{ date: 'Mar 18', label: 'docs, live previews', state: 'now' },
					{ date: 'Apr 02', label: '1.0', state: 'next' }
				]
			},
			code: `import { GraphTimeline } from 'markgraphy';

<GraphTimeline
  title="SHIPPED"
  events={[
    { date: 'Mar 12', label: 'npm publish' },
    { date: 'Mar 18', label: 'docs, live previews', state: 'now' },
    { date: 'Apr 02', label: '1.0', state: 'next' }
  ]}
/>`
		}
	],
	'graph-stack': [
		{
			Comp: GraphStack,
			props: {
				title: 'BUNDLE',
				palette: 'multi',
				rows: [
					{
						label: 'marketing',
						segments: [
							{ label: 'js', value: 48 },
							{ label: 'css', value: 22 },
							{ label: 'images', value: 30 }
						]
					},
					{
						label: 'docs',
						segments: [
							{ label: 'js', value: 28 },
							{ label: 'css', value: 18 },
							{ label: 'images', value: 54 }
						]
					}
				]
			},
			code: `import { GraphStack } from 'markgraphy';

<GraphStack
  title="BUNDLE"
  palette="multi"
  rows={[
    {
      label: 'marketing',
      segments: [
        { label: 'js', value: 48 },
        { label: 'css', value: 22 },
        { label: 'images', value: 30 }
      ]
    },
    {
      label: 'docs',
      segments: [
        { label: 'js', value: 28 },
        { label: 'css', value: 18 },
        { label: 'images', value: 54 }
      ]
    }
  ]}
/>`
		}
	],
	'graph-funnel': [
		{
			Comp: GraphFunnel,
			props: {
				title: 'INSTALL',
				stage: 'ship',
				steps: [
					{ label: 'docs', value: 12400, display: '12,400' },
					{ label: 'copy', value: 4100, display: '4,100' },
					{ label: 'ship', value: 860, display: '860' }
				]
			},
			code: `import { GraphFunnel } from 'markgraphy';

<GraphFunnel
  title="INSTALL"
  stage="ship"
  steps={[
    { label: 'docs', value: 12400, display: '12,400' },
    { label: 'copy', value: 4100, display: '4,100' },
    { label: 'ship', value: 860, display: '860' }
  ]}
/>`
		}
	],
	'graph-gantt': [
		{
			Comp: GraphGantt,
			props: {
				title: 'LAUNCH',
				stage: 'build',
				progress: 0.58,
				ticks: ['q1', 'q2', 'q3', 'q4'],
				items: [
					{ label: 'design', start: 0, end: 0.35, complete: 1 },
					{ label: 'build', start: 0.2, end: 0.75, complete: 0.55 },
					{ label: 'docs', start: 0.55, end: 0.9, complete: 0.2 },
					{ label: 'ship', start: 0.85, end: 1, complete: 0 }
				]
			},
			code: `import { GraphGantt } from 'markgraphy';

<GraphGantt
  title="LAUNCH"
  stage="build"
  progress={0.58}
  ticks={['q1', 'q2', 'q3', 'q4']}
  items={[
    { label: 'design', start: 0, end: 0.35, complete: 1 },
    { label: 'build', start: 0.2, end: 0.75, complete: 0.55 },
    { label: 'docs', start: 0.55, end: 0.9, complete: 0.2 },
    { label: 'ship', start: 0.85, end: 1, complete: 0 }
  ]}
/>`
		}
	],
	'graph-plot': [
		{
			Comp: GraphPlot,
			props: {
				title: 'P95',
				data: [2, 3, 3, 5, 4, 7, 6, 8, 5, 9, 7, 6],
				labels: ['jan', 'dec']
			},
			code: `import { GraphPlot } from 'markgraphy';

<GraphPlot
  title="P95"
  data={[2, 3, 3, 5, 4, 7, 6, 8, 5, 9, 7, 6]}
  labels={['jan', 'dec']}
/>`
		},
		{
			Comp: GraphPlot,
			props: {
				title: 'ERRORS',
				variant: 'line',
				height: 5,
				progress: 0.7,
				data: [1, 1, 4, 2, 8, 3, 2, 1, 5, 2],
				labels: ['mon', 'fri']
			},
			code: `import { GraphPlot } from 'markgraphy';

<GraphPlot
  title="ERRORS"
  variant="line"
  height={5}
  progress={0.7}
  data={[1, 1, 4, 2, 8, 3, 2, 1, 5, 2]}
  labels={['mon', 'fri']}
/>`
		}
	],
	'graph-waffle': [
		{
			Comp: GraphWaffle,
			props: { title: 'COVERAGE', value: 0.73, caption: '73 of 100 tests green' },
			code: `import { GraphWaffle } from 'markgraphy';

<GraphWaffle title="COVERAGE" value={0.73} caption="73 of 100 tests green" />`
		}
	],
	'graph-diff': [
		{
			Comp: GraphDiff,
			props: {
				title: 'BUNDLE',
				palette: 'duo',
				rows: [
					{ label: 'vendor', value: '84 kb' },
					{ label: 'app', value: '31 kb', sign: 'add' },
					{ label: 'sourcemaps', value: '12 kb', sign: 'remove' }
				],
				footer: { label: 'shipped', value: '103 kb' }
			},
			code: `import { GraphDiff } from 'markgraphy';

<GraphDiff
  title="BUNDLE"
  palette="duo"
  rows={[
    { label: 'vendor', value: '84 kb' },
    { label: 'app', value: '31 kb', sign: 'add' },
    { label: 'sourcemaps', value: '12 kb', sign: 'remove' }
  ]}
  footer={{ label: 'shipped', value: '103 kb' }}
/>`
		}
	],
	'graph-invoice': [
		{
			Comp: GraphInvoice,
			props: {
				title: 'INVOICE 0041',
				from: { name: 'markgraphy', lines: ['hello@markgraphy.dev'] },
				to: { name: 'Acme Studio', lines: ['14 Market Street', 'San Francisco, CA'] },
				meta: [
					{ label: 'No.', value: '0041' },
					{ label: 'Issued', value: 'Mar 12, 2026' },
					{ label: 'Due', value: 'Apr 11, 2026' }
				],
				items: [
					{ description: 'Design system', qty: '1', rate: '4,200', amount: '4,200' },
					{ description: 'Motion pass', qty: '1', rate: '1,800', amount: '1,800' },
					{ description: 'Docs rewrite', qty: '8h', rate: '180', amount: '1,440' }
				],
				totals: [
					{ label: 'Subtotal', value: '7,440' },
					{ label: 'Tax', value: '0' },
					{ label: 'Amount due', value: '7,440', accent: true }
				],
				note: 'Net 30. Wire to the account on file.'
			},
			code: `import { GraphInvoice, type InvoiceItem } from 'markgraphy';

const items: InvoiceItem[] = [
  { description: 'Design system', qty: '1', rate: '4,200', amount: '4,200' },
  { description: 'Motion pass', qty: '1', rate: '1,800', amount: '1,800' },
  { description: 'Docs rewrite', qty: '8h', rate: '180', amount: '1,440' }
];

<GraphInvoice
  title="INVOICE 0041"
  from={{ name: 'markgraphy', lines: ['hello@markgraphy.dev'] }}
  to={{ name: 'Acme Studio', lines: ['14 Market Street', 'San Francisco, CA'] }}
  meta={[
    { label: 'No.', value: '0041' },
    { label: 'Issued', value: 'Mar 12, 2026' },
    { label: 'Due', value: 'Apr 11, 2026' }
  ]}
  {items}
  totals={[
    { label: 'Subtotal', value: '7,440' },
    { label: 'Tax', value: '0' },
    { label: 'Amount due', value: '7,440', accent: true }
  ]}
  note="Net 30. Wire to the account on file."
/>`
		}
	],
	'graph-compare': [
		{
			Comp: GraphCompare,
			props: {
				title: 'PLANS',
				columns: ['Solo', 'Studio'],
				accent: 'Studio',
				rows: [
					{ label: 'Registry', values: [true, true] },
					{ label: 'Accent picker', values: [true, true] },
					{ label: 'Private source', values: [false, true] },
					{ label: 'Price', values: ['$0', '$24'] }
				]
			},
			code: `import { GraphCompare } from 'markgraphy';

<GraphCompare
  title="PLANS"
  columns={['Solo', 'Studio']}
  accent="Studio"
  rows={[
    { label: 'Registry', values: [true, true] },
    { label: 'Accent picker', values: [true, true] },
    { label: 'Private source', values: [false, true] },
    { label: 'Price', values: ['$0', '$24'] }
  ]}
/>`
		}
	],
	'graph-stat': [
		{
			Comp: GraphStat,
			props: {
				title: 'THIS WEEK',
				items: [
					{ value: '12,400', label: 'docs' },
					{ value: '4,100', label: 'copies' },
					{ value: '860', label: 'shipped', accent: true }
				]
			},
			code: `import { GraphStat } from 'markgraphy';

<GraphStat
  title="THIS WEEK"
  items={[
    { value: '12,400', label: 'docs' },
    { value: '4,100', label: 'copies' },
    { value: '860', label: 'shipped', accent: true }
  ]}
/>`
		}
	],
	'graph-kpi': [
		{
			Comp: GraphKpi,
			props: {
				title: 'READS',
				value: '12,400',
				label: 'this week',
				hint: '+18%',
				data: [4, 5, 5, 6, 8, 7, 9, 8, 11, 10, 12, 14]
			},
			code: `import { GraphKpi } from 'markgraphy';

<GraphKpi
  title="READS"
  value="12,400"
  label="this week"
  hint="+18%"
  data={[4, 5, 5, 6, 8, 7, 9, 8, 11, 10, 12, 14]}
/>`
		}
	],
	'graph-spec': [
		{
			Comp: GraphSpec,
			props: {
				title: 'TYPE',
				rows: [
					{ label: 'Family', value: 'Geist Mono' },
					{ label: 'Size', value: '14 / 21' },
					{ label: 'Tracking', value: '+0.02em' },
					{ label: 'Figures', value: 'tabular' },
					{ label: 'Accent', value: '--graph-accent', accent: true },
					{ label: 'Duo', value: '--graph-accent-2' },
					{ label: 'Tri', value: '--graph-accent-3' }
				]
			},
			code: `import { GraphSpec } from 'markgraphy';

<GraphSpec
  title="TYPE"
  rows={[
    { label: 'Family', value: 'Geist Mono' },
    { label: 'Size', value: '14 / 21' },
    { label: 'Tracking', value: '+0.02em' },
    { label: 'Figures', value: 'tabular' },
    { label: 'Accent', value: '--graph-accent', accent: true },
    { label: 'Duo', value: '--graph-accent-2' },
    { label: 'Tri', value: '--graph-accent-3' }
  ]}
/>`
		}
	],
	'graph-activity': [
		{
			Comp: GraphActivity,
			props: { title: 'COMMITS', palette: 'multi', days: yearActivity },
			code: `import { GraphActivity } from 'markgraphy';

// Pass dated counts; weeks, months, and intensity are derived.
<GraphActivity
  title="COMMITS"
  palette="multi"
  days={[
    { date: '2025-09-01', count: 3 },
    { date: '2025-09-02', count: 12 }
    // ...one per day, gaps fill as empty
  ]}
/>`
		},
		{
			Comp: GraphActivity,
			props: {
				title: 'SHIPPED',
				weekStartsOn: 1,
				glyphs: 'ascii',
				days: quarterActivity,
				caption: 'Jun – Aug'
			},
			code: `import { GraphActivity } from 'markgraphy';

<GraphActivity
  title="SHIPPED"
  weekStartsOn={1}
  glyphs="ascii"
  days={activityDays('2026-06-01', 91)}
  caption="Jun – Aug"
/>`
		}
	],
	'graph-heatmap': [
		{
			Comp: GraphHeatmap,
			props: {
				title: 'DEPLOYS',
				palette: 'duo',
				columns: ['0', '4', '8', '12', '16', '20'],
				rows: [
					{ label: 'Mon', values: [0, 1, 4, 8, 6, 1] },
					{ label: 'Tue', values: [0, 0, 5, 9, 4, 2] },
					{ label: 'Wed', values: [1, 0, 6, 12, 5, 1] },
					{ label: 'Thu', values: [0, 2, 4, 7, 8, 3] },
					{ label: 'Fri', values: [0, 1, 3, 5, 2, 0] }
				]
			},
			code: `import { GraphHeatmap } from 'markgraphy';

<GraphHeatmap
  title="DEPLOYS"
  palette="duo"
  columns={['0', '4', '8', '12', '16', '20']}
  rows={[
    { label: 'Mon', values: [0, 1, 4, 8, 6, 1] },
    { label: 'Tue', values: [0, 0, 5, 9, 4, 2] },
    { label: 'Wed', values: [1, 0, 6, 12, 5, 1] },
    { label: 'Thu', values: [0, 2, 4, 7, 8, 3] },
    { label: 'Fri', values: [0, 1, 3, 5, 2, 0] }
  ]}
/>`
		}
	],
	'graph-calendar': [
		{
			Comp: GraphCalendar,
			props: { year: 2026, month: 8, today: 27, marks: [12, 18, 27] },
			code: `import { GraphCalendar } from 'markgraphy';

<GraphCalendar year={2026} month={8} today={27} marks={[12, 18, 27]} />`
		}
	],
	'graph-waterfall': [
		{
			Comp: GraphWaterfall,
			props: {
				title: 'MARGIN',
				palette: 'duo',
				ticks: 18,
				items: [
					{ label: 'Revenue', value: 48 },
					{ label: 'Refunds', value: -6 },
					{ label: 'Hosting', value: -4 },
					{ label: 'Profit', value: 38 }
				]
			},
			code: `import { GraphWaterfall } from 'markgraphy';

<GraphWaterfall
  title="MARGIN"
  palette="duo"
  ticks={18}
  items={[
    { label: 'Revenue', value: 48 },
    { label: 'Refunds', value: -6 },
    { label: 'Hosting', value: -4 },
    { label: 'Profit', value: 38 }
  ]}
/>`
		}
	],
	'graph-uptime': [
		{
			Comp: GraphUptime,
			props: { title: 'API', from: 'Jun 1', to: 'Aug 29', days: uptimeDays },
			code: `import { GraphUptime } from 'markgraphy';

<GraphUptime
  title="API"
  from="Jun 1"
  to="Aug 29"
  days={Array.from({ length: 90 }, (_, i) =>
    i === 41 || i === 42 ? 'down' : i === 18 || i === 60 ? 'degraded' : 'ok'
  )}
/>`
		}
	],
	'graph-latency': [
		{
			Comp: GraphLatency,
			props: {
				title: 'CHECKOUT',
				unit: 'ms',
				labels: ['09:00', '09:30'],
				data: Array.from({ length: 30 }, (_, i) => {
					const baseline = 90 + Math.sin(i / 3) * 20;
					const drift = 220 + Math.cos(i / 4) * 60 + i * 6;
					const tail = 480 + Math.sin(i / 2) * 140 + i * 4;
					const spike = i === 12 || i === 22;
					return {
						p50: Math.round(baseline),
						p95: Math.round(drift + 80),
						p99: Math.round(tail + 120 + (spike ? 600 : 0)),
						spike
					};
				})
			},
			code: `import { GraphLatency } from 'markgraphy';

<GraphLatency
  title="CHECKOUT"
  unit="ms"
  labels={['09:00', '09:30']}
  data={Array.from({ length: 30 }, (_, i) => ({
    p50: 100 + Math.round(Math.sin(i / 3) * 20),
    p95: 280 + Math.round(Math.cos(i / 4) * 50) + i * 4,
    p99: 480 + Math.round(Math.sin(i / 2) * 100) + i * 6,
    spike: i === 12 || i === 22
  }))}
/>`
		}
	],
	'graph-slo': [
		{
			Comp: GraphSlo,
			props: {
				title: 'CHECKOUT 99.9%',
				budget: 0.62,
				window: 30,
				unit: 'd',
				elapsed: 18,
				target: 0.001,
				actual: 0.0014,
				daily: [0.02, 0.03, 0.04, 0.025, 0.05, 0.06, 0.04, 0.07, 0.05, 0.045, 0.06, 0.08, 0.05, 0.09, 0.07, 0.06, 0.08, 0.1]
			},
			code: `import { GraphSlo } from 'markgraphy';

<GraphSlo
  title="CHECKOUT 99.9%"
  budget={0.62}
  window={30}
  unit="d"
  elapsed={18}
  target={0.001}
  actual={0.0014}
  daily={Array.from({ length: 18 }, () => Math.random() * 0.08 + 0.02)}
/>`
		}
	],
	'graph-quota': [
		{
			Comp: GraphQuota,
			props: {
				title: 'API QUOTA — OPENAI',
				used: 124_500,
				limit: 200_000,
				unit: 'API calls',
				resets: 'Oct 1',
				daysInto: 18,
				daysTotal: 30
			},
			code: `import { GraphQuota } from 'markgraphy';

<GraphQuota
  title="API QUOTA — OPENAI"
  used={124500}
  limit={200000}
  unit="API calls"
  resets="Oct 1"
  daysInto={18}
  daysTotal={30}
/>`
		}
	],
	'graph-slope': [
		{
			Comp: GraphSlope,
			props: {
				title: 'TRAFFIC',
				palette: 'duo',
				fromLabel: '2025',
				toLabel: '2026',
				items: [
					{ label: 'docs', from: 8200, to: 12400 },
					{ label: 'copy', from: 5100, to: 4100 },
					{ label: 'ship', from: 640, to: 860 }
				]
			},
			code: `import { GraphSlope } from 'markgraphy';

<GraphSlope
  title="TRAFFIC"
  palette="duo"
  fromLabel="2025"
  toLabel="2026"
  items={[
    { label: 'docs', from: 8200, to: 12400 },
    { label: 'copy', from: 5100, to: 4100 },
    { label: 'ship', from: 640, to: 860 }
  ]}
/>`
		}
	],
	'graph-bullet': [
		{
			Comp: GraphBullet,
			props: {
				title: 'LOAD',
				palette: 'duo',
				items: [
					{ label: 'CPU', value: 72, target: 80, max: 100 },
					{ label: 'RAM', value: 34, target: 64, max: 100 },
					{ label: 'SSD', value: 91, target: 90, max: 100 }
				]
			},
			code: `import { GraphBullet } from 'markgraphy';

<GraphBullet
  title="LOAD"
  palette="duo"
  items={[
    { label: 'CPU', value: 72, target: 80, max: 100 },
    { label: 'RAM', value: 34, target: 64, max: 100 },
    { label: 'SSD', value: 91, target: 90, max: 100 }
  ]}
/>`
		}
	],
	'graph-timer': [
		{
			Comp: GraphTimer,
			props: { title: 'UPTIME', kind: 'elapsed', at: '2026-08-01T00:00:00Z', caption: 'api' },
			code: `import { GraphTimer } from 'markgraphy';

<GraphTimer title="UPTIME" kind="elapsed" at="2026-08-01T00:00:00Z" caption="api" />`
		}
	],
	'graph-countdown': [
		{
			Comp: GraphCountdown,
			props: {
				title: 'FREEZE',
				to: '2027-01-01T00:00:00Z',
				done: 'open',
				caption: 'until launch'
			},
			code: `import { GraphCountdown } from 'markgraphy';

<GraphCountdown
  title="FREEZE"
  to="2027-01-01T00:00:00Z"
  done="open"
  caption="until launch"
/>`
		}
	],
	'ascii-diagram': [
		{
			Comp: AsciiDiagram,
			props: {
				title: 'Signal path',
				content: `+ - - - - - - [ SIGNAL PATH ] - - - - - - +
|                                         |
|   source ──> filter ──> gain ──> out    |
|                    ^                    |
|                    └─── feedback        |
|                                         |
+ - - - - - - - - - - - - - - - - - - - - +`
			},
			code: `import { AsciiDiagram } from 'markgraphy';

<AsciiDiagram title="Signal path">
  {\`
+ - - - - - - [ SIGNAL PATH ] - - - - - - +
|                                         |
|   source ──> filter ──> gain ──> out    |
|                    ^                    |
|                    └─── feedback        |
|                                         |
+ - - - - - - - - - - - - - - - - - - - - +
  \`}
</AsciiDiagram>`
		}
	],
	'diagram-editor': [
		{
			Comp: DiagramEditor,
			props: {},
			code: `import { DiagramEditor } from 'markgraphy';

<DiagramEditor />`
		}
	],
	'amplifier-diagram': [
		{
			Comp: AmplifierDiagram,
			props: { gain: 3.5 },
			code: `import { AmplifierDiagram } from 'markgraphy';

<AmplifierDiagram gain={3.5} />`
		}
	],
	'nested-radii-diagram': [
		{
			Comp: NestedRadiiDiagram,
			props: { initialOuter: 16, initialInset: 4 },
			code: `import { NestedRadiiDiagram } from 'markgraphy';

<NestedRadiiDiagram initialOuter={16} initialInset={4} />`
		}
	],
	'prompt-loop-diagram': [
		{
			Comp: PromptLoopDiagram,
			props: { autoPlay: true, speedMs: 1200 },
			code: `import { PromptLoopDiagram } from 'markgraphy';

<PromptLoopDiagram autoPlay speedMs={1200} />`
		}
	],
	'metrics-table-diagram': [
		{
			Comp: MetricsTableDiagram,
			props: {
				title: 'COST',
				rows: [
					{ label: 'AST parse', calls: 120, time: '16m' },
					{ label: 'MDsveX compile', calls: 164, time: '16m' },
					{ label: 'Rune optimization', calls: 112, time: '18m' }
				],
				totalCalls: 396,
				totalTime: '~50m'
			},
			code: `import { MetricsTableDiagram } from 'markgraphy';

<MetricsTableDiagram
  title="COST"
  rows={[
    { label: 'AST parse', calls: 120, time: '16m' },
    { label: 'MDsveX compile', calls: 164, time: '16m' },
    { label: 'Rune optimization', calls: 112, time: '18m' }
  ]}
  totalCalls={396}
  totalTime="~50m"
/>`
		}
	],
	'graph-agni': [
		{
			Comp: GraphAgni,
			props: { title: 'HAVAN', cols: 48, rows: 12 },
			code: `import { GraphAgni } from 'markgraphy';

<GraphAgni title="HAVAN" cols={48} rows={12} />`
		}
	],
	'graph-aum': [
		{
			Comp: GraphAum,
			props: { title: 'AUM' },
			code: `import { GraphAum } from 'markgraphy';

<GraphAum title="AUM" />`
		}
	],
	'graph-boot': [
		{
			Comp: GraphBoot,
			props: {
				title: 'DEPLOY',
				steps: [
					{ label: 'compose up', eta: '~1.2s' },
					{ label: 'migrate', eta: '~0.6s' },
					{ label: 'seed', eta: '~0.4s' },
					{ label: 'healthcheck' },
					{ label: 'release', eta: '~0.8s' }
				]
			},
			code: `import { GraphBoot } from 'markgraphy';

<GraphBoot
  title="DEPLOY"
  steps={[
    { label: 'compose up', eta: '~1.2s' },
    { label: 'migrate', eta: '~0.6s' },
    { label: 'seed' },
    { label: 'healthcheck' }
  ]}
/>`
		}
	],
	'graph-damru': [
		{
			Comp: GraphDamru,
			props: { title: 'BEAT', cols: 60, rows: 16 },
			code: `import { GraphDamru } from 'markgraphy';

<GraphDamru title="BEAT" />`
		}
	],
	'graph-diya': [
		{
			Comp: GraphDiya,
			props: { title: 'DIWALI', cols: 60, rows: 14, lamps: 5 },
			code: `import { GraphDiya } from 'markgraphy';

<GraphDiya title="DIWALI" lamps={5} />`
		}
	],
	'graph-fire': [
		{
			Comp: GraphFire,
			props: { title: 'FURNACE', cols: 48, rows: 10, cooling: 0.55 },
			code: `import { GraphFire } from 'markgraphy';

<GraphFire title="FURNACE" cols={48} rows={10} />`
		}
	],
	'graph-flame': [
		{
			Comp: GraphFlame,
			props: { title: 'PROFILE', speedMs: 600 },
			code: `import { GraphFlame } from 'markgraphy';

<GraphFlame title="PROFILE" />`
		}
	],
	'graph-flow-player': [
		{
			Comp: GraphFlowPlayer,
			props: {
				title: 'PIPELINE',
				autoPlay: true,
				speedMs: 1400,
				steps: [
					{ label: 'scaffold the parser', detail: 'reads the grammar file' },
					{ label: 'emit tokens', detail: 'one pass, no backtracking' },
					{ label: 'render frames', detail: 'dashed borders, four corners' },
					{ label: 'publish', detail: 'npm and done' }
				]
			},
			code: `import { GraphFlowPlayer } from 'markgraphy';

<GraphFlowPlayer
  title="PIPELINE"
  autoPlay
  speedMs={1400}
  steps={[
    { label: 'scaffold the parser', detail: 'reads the grammar file' },
    { label: 'emit tokens', detail: 'one pass, no backtracking' },
    { label: 'render frames' },
    { label: 'publish' }
  ]}
/>`
		}
	],
	'graph-ganga': [
		{
			Comp: GraphGanga,
			props: { title: 'GANGES', cols: 60, rows: 18 },
			code: `import { GraphGanga } from 'markgraphy';

<GraphGanga title="GANGES" />`
		}
	],
	'graph-hash': [
		{
			Comp: GraphHash,
			props: { title: 'FINGERPRINT', input: 'markgraphy', cols: 16, rows: 6 },
			code: `import { GraphHash } from 'markgraphy';

<GraphHash title="FINGERPRINT" input="markgraphy" />`
		}
	],
	'graph-japa': [
		{
			Comp: GraphJapa,
			props: { title: 'MALA', cols: 60, rows: 22 },
			code: `import { GraphJapa } from 'markgraphy';

<GraphJapa title="MALA" />`
		}
	],
	'graph-life': [
		{
			Comp: GraphLife,
			props: { title: 'LIFE' },
			code: `import { GraphLife } from 'markgraphy';

<GraphLife title="LIFE" />`
		}
	],
	'graph-mandel': [
		{
			Comp: GraphMandel,
			props: { title: 'SEAHORSE' },
			code: `import { GraphMandel } from 'markgraphy';

<GraphMandel title="SEAHORSE" />`
		}
	],
	'graph-mandala': [
		{
			Comp: GraphMandala,
			props: { title: 'YANTRA', cols: 48, rows: 24, folds: 8, rings: 5 },
			code: `import { GraphMandala } from 'markgraphy';

<GraphMandala title="YANTRA" folds={8} rings={5} />`
		}
	],
	'graph-pulse': [
		{
			Comp: GraphPulse,
			props: { title: 'API', length: 60, intervalMs: 900 },
			code: `import { GraphPulse } from 'markgraphy';

<GraphPulse title="API" length={60} intervalMs={900} />`
		}
	],
	'graph-rain': [
		{
			Comp: GraphRain,
			props: { title: 'RAIN', cols: 48, rows: 12 },
			code: `import { GraphRain } from 'markgraphy';

<GraphRain title="RAIN" cols={48} rows={12} />`
		}
	],
	'graph-surya': [
		{
			Comp: GraphSurya,
			props: { title: 'DAWN', cols: 52, rows: 14 },
			code: `import { GraphSurya } from 'markgraphy';

<GraphSurya title="DAWN" cols={52} rows={14} />`
		}
	],
	'graph-scope': [
		{
			Comp: GraphScope,
			props: {
				title: 'RPM',
				mode: 'area',
				data: [12, 18, 31, 27, 44, 39, 52, 48, 61, 55, 40, 33, 25, 29, 37, 46, 58, 50, 42, 35]
			},
			code: `import { GraphScope } from 'markgraphy';

<GraphScope
  title="RPM"
  mode="area"
  data={[12, 18, 31, 27, 44, 39, 52, 48, 61, 55, 40, 33, 25, 29, 37]}
/>`
		}
	],
	'graph-sequence': [
		{
			Comp: GraphSequence,
			props: { title: 'REQUEST', speedMs: 600 },
			code: `import { GraphSequence } from 'markgraphy';

<GraphSequence title="REQUEST" />`
		}
	],
	'graph-spinners': [
		{
			Comp: GraphSpinners,
			props: { title: 'FETCH', kind: 'bounce', label: 'loading tiles', speedMs: 90 },
			code: `import { GraphSpinners } from 'markgraphy';

<GraphSpinners title="FETCH" kind="bounce" label="loading tiles" speedMs={90} />`
		}
	],
	'graph-state': [
		{
			Comp: GraphState,
			props: { title: 'AGENT', speedMs: 700 },
			code: `import { GraphState } from 'markgraphy';

<GraphState title="AGENT" />`
		}
	],
	'graph-stream': [
		{
			Comp: GraphStream,
			props: { title: 'THROUGHPUT', unit: 'req/s', length: 44, intervalMs: 750 },
			code: `import { GraphStream } from 'markgraphy';

<GraphStream title="THROUGHPUT" unit="req/s" length={44} intervalMs={750} />`
		}
	],
	'graph-ticker': [
		{
			Comp: GraphTicker,
			props: {
				title: 'FLEET',
				items: [
					{ label: 'api', status: 'ok' },
					{ label: 'db-lag 2.1s', status: 'warn' },
					{ label: 'edge-eu', status: 'down' },
					{ label: 'cdn', status: 'ok' }
				]
			},
			code: `import { GraphTicker } from 'markgraphy';

<GraphTicker
  title="FLEET"
  items={[
    { label: 'api', status: 'ok' },
    { label: 'db-lag 2.1s', status: 'warn' },
    { label: 'edge-eu', status: 'down' }
  ]}
/>`
		}
	],
	'graph-terminal': [
		{
			Comp: GraphTerminal,
			props: {
				title: 'SHELL',
				lines: [
					{ kind: 'prompt', text: 'cd ~/projects/markgraphy' },
					{ kind: 'output', text: '' },
					{ kind: 'prompt', text: 'pnpm dev' },
					{ kind: 'output', text: '  VITE v5 ready in 312ms' },
					{ kind: 'output', text: '  ➜  Local:   http://localhost:5173/' },
					{ kind: 'output', text: '  ➜  Network: http://192.168.1.10:5173/' }
				]
			},
			code: `import { GraphTerminal } from 'markgraphy';

<GraphTerminal
  title="SHELL"
  lines={[
    { kind: 'prompt', text: 'pnpm dev' },
    { kind: 'output', text: '  VITE v5 ready in 312ms' },
    { kind: 'output', text: '  ➜  Local:   http://localhost:5173/' }
  ]}
/>`
		}
	],
	'graph-typewriter': [
		{
			Comp: GraphTypewriter,
			props: {
				title: 'BOOT',
				speedMs: 45,
				lines: ['> boot markgraphy', '> mounting frames... ok', '> ready']
			},
			code: `import { GraphTypewriter } from 'markgraphy';

<GraphTypewriter
  title="BOOT"
  speedMs={45}
  lines={['> boot markgraphy', '> mounting frames... ok', '> ready']}
/>`
		}
	],
	'graph-cron': [
		{
			Comp: GraphCron,
			props: {
				title: 'EVERY 15',
				expr: '*/15 * * * *',
				count: 8,
				baseTime: Date.UTC(2026, 8, 6, 11, 53)
			},
			code: `import { GraphCron } from 'markgraphy';

<GraphCron title="EVERY 15" expr="*/15 * * * *" count={8} />`
		}
	],
	'graph-deps': [
		{
			Comp: GraphDeps,
			props: {
				title: 'DEPS',
				deps: [
					{
						name: 'markgraphy',
						version: '0.9.0',
						accent: true,
						children: [
							{ name: 'svelte', version: '^5.0.0' },
							{ name: 'shiki', version: '^4.0.0' }
						]
					},
					{
						name: 'docs',
						version: '0.9.0',
						children: [
							{ name: 'mdsvex', version: '^0.12.0' },
							{ name: 'vite', version: '^5.0.0' }
						]
					}
				]
			},
			code: `import { GraphDeps, type DepNode } from 'markgraphy';

const deps: DepNode[] = [
  { name: 'markgraphy', version: '0.9.0', accent: true, children: [
    { name: 'svelte', version: '^5.0.0' },
    { name: 'shiki', version: '^4.0.0' }
  ]}
];

<GraphDeps title="DEPS" {deps} />`
		}
	],
	'graph-scatter': [
		{
			Comp: GraphScatter,
			props: {
				title: 'CORRELATION',
				trend: true,
				data: [
					{ x: 1.2, y: 0.8 },
					{ x: 2.0, y: 1.4 },
					{ x: 2.5, y: 1.6 },
					{ x: 3.1, y: 2.1 },
					{ x: 3.6, y: 2.4 },
					{ x: 4.0, y: 2.7 },
					{ x: 4.5, y: 2.9 },
					{ x: 5.0, y: 3.3 },
					{ x: 5.4, y: 3.4, accent: true },
					{ x: 5.9, y: 3.7 },
					{ x: 6.3, y: 4.0 },
					{ x: 6.8, y: 4.1 }
				]
			},
			code: `import { GraphScatter, type ScatterPoint } from 'markgraphy';

const data: ScatterPoint[] = [
  { x: 1.2, y: 0.8 },
  { x: 3.6, y: 2.4, accent: true },
  { x: 6.8, y: 4.1 }
];

<GraphScatter title="CORRELATION" trend {data} />`
		}
	],
	'graph-workflow': [
		{
			Comp: GraphWorkflow,
			props: {
				title: 'DEPLOY',
				autoPlay: true,
				speedMs: 1100,
				label: 'a CI pipeline, top-to-bottom',
				nodes: [
					{ id: 'commit', label: 'commit' },
					{ id: 'lint', label: 'lint' },
					{ id: 'test', label: 'test', hint: 'unit + e2e' },
					{ id: 'build', label: 'build' },
					{ id: 'publish', label: 'publish' }
				]
			},
			code: `import { GraphWorkflow, type WorkflowNode } from 'markgraphy';

const nodes: WorkflowNode[] = [
  { id: 'commit',  label: 'commit' },
  { id: 'lint',    label: 'lint' },
  { id: 'test',    label: 'test', hint: 'unit + e2e' },
  { id: 'build',   label: 'build' },
  { id: 'publish', label: 'publish' }
];

<GraphWorkflow title="DEPLOY" autoPlay {nodes} />`
		},
		{
			Comp: GraphWorkflow,
			props: {
				title: 'CI DIAMOND',
				autoPlay: true,
				speedMs: 1100,
				nodes: [
					{ id: 'push', label: 'push' },
					{ id: 'lint', label: 'lint' },
					{ id: 'unit', label: 'unit' },
					{ id: 'e2e', label: 'e2e' },
					{ id: 'build', label: 'build' },
					{ id: 'ship', label: 'ship' }
				],
				edges: [
					{ from: 'push', to: 'lint' },
					{ from: 'push', to: 'unit' },
					{ from: 'push', to: 'e2e' },
					{ from: 'lint', to: 'build' },
					{ from: 'unit', to: 'build' },
					{ from: 'e2e', to: 'build' },
					{ from: 'build', to: 'ship' }
				]
			},
			code: `import { GraphWorkflow, type WorkflowNode, type WorkflowEdge } from 'markgraphy';

const nodes: WorkflowNode[] = [
  { id: 'push',  label: 'push' },
  { id: 'lint',  label: 'lint' },
  { id: 'unit',  label: 'unit' },
  { id: 'e2e',   label: 'e2e' },
  { id: 'build', label: 'build' },
  { id: 'ship',  label: 'ship' }
];

const edges: WorkflowEdge[] = [
  { from: 'push',  to: 'lint' },
  { from: 'push',  to: 'unit' },
  { from: 'push',  to: 'e2e' },
  { from: 'lint',  to: 'build' },
  { from: 'unit',  to: 'build' },
  { from: 'e2e',   to: 'build' },
  { from: 'build', to: 'ship' }
];

<GraphWorkflow title="CI DIAMOND" autoPlay {nodes} {edges} />`
		}
	],
	'shuffle-text': [
		{
			Comp: ShuffleText,
			props: {
				text: 'MARKGRAPHY',
				shuffleDirection: 'right',
				duration: 0.4,
				stagger: 0.03,
				tag: 'h2',
				textAlign: 'center'
			},
			code: `import { ShuffleText } from 'markgraphy';

<ShuffleText text="MARKGRAPHY" tag="h2" />`
		}
	]
};
