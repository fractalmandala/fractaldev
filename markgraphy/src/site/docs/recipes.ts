// Recipes: short write-ups that pair two graphs with prose. Ported from the
// reference `ref/lib/docs/recipes.ts` — same stories, Svelte usage strings.
// Figure data is typed against the real component props from `$lib` so the
// live preview in recipe-card.svelte can render it directly.

import { SITE_URL } from '$site/lib/site';
import type {
	GraphCompareProps,
	GraphDiffProps,
	GraphFlowProps,
	GraphGanttProps,
	GraphKpiProps,
	GraphMeterProps,
	GraphRankProps,
	GraphSlopeProps,
	GraphStatProps,
	GraphTimelineProps,
	GraphUptimeProps
} from '$lib';

export type RecipeTag = 'plan' | 'debug' | 'tradeoff' | 'ship';

/** One figure in a recipe: the component, its live props, and the usage string. */
export type RecipeFigure =
	| {
			slug: 'graph-compare';
			component: 'GraphCompare';
			props: GraphCompareProps;
			code: string;
	  }
	| {
			slug: 'graph-diff';
			component: 'GraphDiff';
			props: GraphDiffProps;
			code: string;
	  }
	| {
			slug: 'graph-flow';
			component: 'GraphFlow';
			props: GraphFlowProps;
			code: string;
	  }
	| {
			slug: 'graph-gantt';
			component: 'GraphGantt';
			props: GraphGanttProps;
			code: string;
	  }
	| {
			slug: 'graph-kpi';
			component: 'GraphKpi';
			props: GraphKpiProps;
			code: string;
	  }
	| {
			slug: 'graph-meter';
			component: 'GraphMeter';
			props: GraphMeterProps;
			code: string;
	  }
	| {
			slug: 'graph-rank';
			component: 'GraphRank';
			props: GraphRankProps;
			code: string;
	  }
	| {
			slug: 'graph-slope';
			component: 'GraphSlope';
			props: GraphSlopeProps;
			code: string;
	  }
	| {
			slug: 'graph-stat';
			component: 'GraphStat';
			props: GraphStatProps;
			code: string;
	  }
	| {
			slug: 'graph-timeline';
			component: 'GraphTimeline';
			props: GraphTimelineProps;
			code: string;
	  }
	| {
			slug: 'graph-uptime';
			component: 'GraphUptime';
			props: GraphUptimeProps;
			code: string;
	  };

export type Recipe = {
	slug: string;
	title: string;
	blurb: string;
	story: string;
	tags: RecipeTag[];
	featured?: boolean;
	graphs: RecipeFigure[];
};

export const recipes: Recipe[] = [
	{
		slug: 'refactor',
		title: 'Refactor',
		blurb: 'Old path, new path, then the weeks.',
		story:
			"You're moving auth checks out of handlers. Show the request path first, then the work in order, with the current week marked.",
		tags: ['plan'],
		featured: true,
		graphs: [
			{
				slug: 'graph-flow',
				component: 'GraphFlow',
				props: {
					title: 'AUTH',
					rows: [
						{
							nodes: [
								{ label: 'request' },
								{ label: 'handler' },
								{ label: 'session util', tone: 'muted' }
							]
						},
						{
							nodes: [
								{ label: 'request' },
								{ label: 'middleware', tone: 'accent' },
								{ label: 'handler' }
							]
						}
					]
				},
				code: `import { GraphFlow } from 'markgraphy'

<GraphFlow
	title="AUTH"
	rows={[
		{
			nodes: [
				{ label: 'request' },
				{ label: 'handler' },
				{ label: 'session util', tone: 'muted' }
			]
		},
		{
			nodes: [
				{ label: 'request' },
				{ label: 'middleware', tone: 'accent' },
				{ label: 'handler' }
			]
		}
	]}
/>`
			},
			{
				slug: 'graph-timeline',
				component: 'GraphTimeline',
				props: {
					title: 'PLAN',
					events: [
						{ date: 'w1', label: 'extract session helper', state: 'done' },
						{ date: 'w2', label: 'move checks to middleware', state: 'now' },
						{ date: 'w3', label: 'delete the old util', state: 'next' }
					]
				},
				code: `import { GraphTimeline } from 'markgraphy'

<GraphTimeline
	title="PLAN"
	events={[
		{ date: 'w1', label: 'extract session helper', state: 'done' },
		{ date: 'w2', label: 'move checks to middleware', state: 'now' },
		{ date: 'w3', label: 'delete the old util', state: 'next' }
	]}
/>`
			}
		]
	},
	{
		slug: 'incident',
		title: 'Incident',
		blurb: 'What happened, and which days took the hit.',
		story:
			'p95 crossed the line, you rolled back a flag, and the postmortem is still open. The strip is the two days people felt it.',
		tags: ['debug'],
		featured: true,
		graphs: [
			{
				slug: 'graph-timeline',
				component: 'GraphTimeline',
				props: {
					title: 'INCIDENT',
					events: [
						{ date: '14:02', label: 'p95 crossed 800ms' },
						{ date: '14:11', label: 'rolled back the cache flag', state: 'now' },
						{ date: '14:40', label: 'write the postmortem', state: 'next' }
					]
				},
				code: `import { GraphTimeline } from 'markgraphy'

<GraphTimeline
	title="INCIDENT"
	events={[
		{ date: '14:02', label: 'p95 crossed 800ms' },
		{ date: '14:11', label: 'rolled back the cache flag', state: 'now' },
		{ date: '14:40', label: 'write the postmortem', state: 'next' }
	]}
/>`
			},
			{
				slug: 'graph-uptime',
				component: 'GraphUptime',
				props: {
					title: 'API',
					from: 'Aug 14',
					to: 'Aug 27',
					days: [
						'ok',
						'ok',
						'ok',
						'ok',
						'ok',
						'degraded',
						'ok',
						'ok',
						'down',
						'down',
						'ok',
						'ok',
						'ok',
						'ok'
					]
				},
				code: `import { GraphUptime } from 'markgraphy'

<GraphUptime
	title="API"
	from="Aug 14"
	to="Aug 27"
	days={[
		'ok',
		'ok',
		'ok',
		'ok',
		'ok',
		'degraded',
		'ok',
		'ok',
		'down',
		'down',
		'ok',
		'ok',
		'ok',
		'ok'
	]}
/>`
			}
		]
	},
	{
		slug: 'pick',
		title: 'Pick one',
		blurb: 'A matrix, then the sizes if they matter.',
		story:
			"You're choosing a queue. Checks and dashes first. Bundle size only if that's part of the argument.",
		tags: ['tradeoff'],
		graphs: [
			{
				slug: 'graph-compare',
				component: 'GraphCompare',
				props: {
					title: 'QUEUE',
					columns: ['BullMQ', 'SQS'],
					accent: 'BullMQ',
					rows: [
						{ label: 'in-process', values: [true, false] },
						{ label: 'retries', values: [true, true] },
						{ label: 'ops', values: ['redis', 'aws'] },
						{ label: 'local', values: [true, false] }
					]
				},
				code: `import { GraphCompare } from 'markgraphy'

<GraphCompare
	title="QUEUE"
	columns={['BullMQ', 'SQS']}
	accent="BullMQ"
	rows={[
		{ label: 'in-process', values: [true, false] },
		{ label: 'retries', values: [true, true] },
		{ label: 'ops', values: ['redis', 'aws'] },
		{ label: 'local', values: [true, false] }
	]}
/>`
			},
			{
				slug: 'graph-rank',
				component: 'GraphRank',
				props: {
					title: 'INSTALL',
					items: [
						{ label: 'bullmq', value: 48, display: '48 kb' },
						{ label: 'ioredis', value: 31, display: '31 kb' },
						{ label: 'aws sdk', value: 120, display: '120 kb' }
					]
				},
				code: `import { GraphRank } from 'markgraphy'

<GraphRank
	title="INSTALL"
	items={[
		{ label: 'bullmq', value: 48, display: '48 kb' },
		{ label: 'ioredis', value: 31, display: '31 kb' },
		{ label: 'aws sdk', value: 120, display: '120 kb' }
	]}
/>`
			}
		]
	},
	{
		slug: 'review',
		title: 'Pull request',
		blurb: 'What moved, and what the numbers did.',
		story:
			"A review comment with a file list and a coverage slope. The reader shouldn't have to open the diff to get the shape.",
		tags: ['ship'],
		graphs: [
			{
				slug: 'graph-diff',
				component: 'GraphDiff',
				props: {
					title: 'FILES',
					palette: 'duo',
					rows: [
						{ label: 'auth.ts', value: 'new', sign: 'add' },
						{ label: 'session.ts', value: 'moved' },
						{ label: 'legacy-auth.ts', value: 'gone', sign: 'remove' }
					]
				},
				code: `import { GraphDiff } from 'markgraphy'

<GraphDiff
	title="FILES"
	palette="duo"
	rows={[
		{ label: 'auth.ts', value: 'new', sign: 'add' },
		{ label: 'session.ts', value: 'moved' },
		{ label: 'legacy-auth.ts', value: 'gone', sign: 'remove' }
	]}
/>`
			},
			{
				slug: 'graph-slope',
				component: 'GraphSlope',
				props: {
					title: 'COVERAGE',
					fromLabel: 'main',
					toLabel: 'this pr',
					items: [
						{ label: 'auth', from: 41, to: 88 },
						{ label: 'billing', from: 72, to: 74 },
						{ label: 'docs', from: 11, to: 40 }
					]
				},
				code: `import { GraphSlope } from 'markgraphy'

<GraphSlope
	title="COVERAGE"
	fromLabel="main"
	toLabel="this pr"
	items={[
		{ label: 'auth', from: 41, to: 88 },
		{ label: 'billing', from: 72, to: 74 },
		{ label: 'docs', from: 11, to: 40 }
	]}
/>`
			}
		]
	},
	{
		slug: 'sprint',
		title: 'This week',
		blurb: 'Overlapping work, then the board counts.',
		story:
			"Monday stand-up. The track is the calendar. The numbers are what's in review, blocked, and already shipped.",
		tags: ['plan'],
		graphs: [
			{
				slug: 'graph-gantt',
				component: 'GraphGantt',
				props: {
					title: 'THIS WEEK',
					columns: 20,
					ticks: ['mon', 'wed', 'fri'],
					stage: 'patch',
					items: [
						{ label: 'rfc', start: 0, end: 0.4, complete: 1 },
						{ label: 'patch', start: 0.35, end: 0.8, complete: 0.55 },
						{ label: 'review', start: 0.7, end: 1, complete: 0 }
					]
				},
				code: `import { GraphGantt } from 'markgraphy'

<GraphGantt
	title="THIS WEEK"
	columns={20}
	ticks={['mon', 'wed', 'fri']}
	stage="patch"
	items={[
		{ label: 'rfc', start: 0, end: 0.4, complete: 1 },
		{ label: 'patch', start: 0.35, end: 0.8, complete: 0.55 },
		{ label: 'review', start: 0.7, end: 1, complete: 0 }
	]}
/>`
			},
			{
				slug: 'graph-stat',
				component: 'GraphStat',
				props: {
					title: 'BOARD',
					items: [
						{ value: '4', label: 'in review' },
						{ value: '2', label: 'blocked' },
						{ value: '9', label: 'shipped', accent: true }
					]
				},
				code: `import { GraphStat } from 'markgraphy'

<GraphStat
	title="BOARD"
	items={[
		{ value: '4', label: 'in review' },
		{ value: '2', label: 'blocked' },
		{ value: '9', label: 'shipped', accent: true }
	]}
/>`
			}
		]
	},
	{
		slug: 'migrate',
		title: 'Migration',
		blurb: 'How far the job is, and the count behind it.',
		story:
			"A backfill that's still running. The fill is the share. The figure is the row count, with the last points of the job underneath.",
		tags: ['ship'],
		graphs: [
			{
				slug: 'graph-meter',
				component: 'GraphMeter',
				props: {
					title: 'ROWS',
					value: 0.67,
					caption: 'users table'
				},
				code: `import { GraphMeter } from 'markgraphy'

<GraphMeter title="ROWS" value={0.67} caption="users table" />`
			},
			{
				slug: 'graph-kpi',
				component: 'GraphKpi',
				props: {
					title: 'MIGRATED',
					value: '1.2M',
					label: 'of 1.8M rows',
					hint: '67%',
					data: [2, 3, 3, 5, 8, 9, 11, 12, 14, 16, 18, 21]
				},
				code: `import { GraphKpi } from 'markgraphy'

<GraphKpi
	title="MIGRATED"
	value="1.2M"
	label="of 1.8M rows"
	hint="67%"
	data={[2, 3, 3, 5, 8, 9, 11, 12, 14, 16, 18, 21]}
/>`
			}
		]
	}
];

export const featuredRecipes = recipes.filter((item) => item.featured);

export function getRecipe(slug: string) {
	return recipes.find((item) => item.slug === slug);
}

/** Label for a docs slug, e.g. `graph-flow` → "Flow". */
export function figureLabel(slug: string) {
	const name = slug.replace('graph-', '');
	if (name === 'kpi') {
		return 'KPI';
	}
	return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Merge the per-figure usage strings into one copyable snippet. */
export function recipeCopy(recipe: Recipe) {
	const imports = new Set<string>();
	const bodies: string[] = [];

	for (const graph of recipe.graphs) {
		const lines = graph.code.trim().split('\n');
		const rest: string[] = [];

		for (const line of lines) {
			if (line.startsWith('import ')) {
				imports.add(line);
			} else {
				rest.push(line);
			}
		}

		bodies.push(rest.join('\n').trim());
	}

	return `${[...imports].join('\n')}\n\n${bodies.join('\n\n')}`;
}

export function recipesMarkdown(origin = SITE_URL) {
	const host = origin || SITE_URL;
	const lines = recipes.map((item) => {
		const names = item.graphs
			.map((graph) => figureLabel(graph.slug))
			.join(' + ');
		return `- ${item.title}: ${item.blurb} Use ${names}. ${host}/docs/examples#${item.slug}`;
	});

	return `## Recipes

Two graphs per write-up is enough. Prose between them. Copy the Svelte from the examples.

${lines.join('\n')}

Skill: ${host}/docs/skill
`;
}
