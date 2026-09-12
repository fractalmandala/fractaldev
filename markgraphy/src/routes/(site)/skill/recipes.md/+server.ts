// skill/recipes.md — serves the agent skill's recipes.md as text/markdown.
// MIRROR of skills/markdown-graphs/recipes.md (the canonical file): keep the
// two in sync — the duplication is intentional so the route ships no file I/O.

export const prerender = true;

export function GET() {
	const body = `# Recipe Svelte

Load this after SKILL.md (https://markgraphy.vercel.app/skill.md) when you
are about to write a figure.

Copy a pair. Swap labels for the user's names. Keep the props. Two graphs per
section, prose between them. Do not add a third.

In a \`+page.svelte\` or any component, imports go in the script block. In an
\`.svx\` markdown file the same script block sits at the top, then the figures
sit next to the prose.

## Refactor

Walk through a change. Path first, then the weeks.

\`\`\`svelte
<script>
	import { GraphFlow } from 'markgraphy';
</script>

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
/>
\`\`\`

\`\`\`svelte
<script>
	import { GraphTimeline } from 'markgraphy';
</script>

<GraphTimeline
	title="PLAN"
	events={[
		{ date: 'w1', label: 'extract session helper', state: 'done' },
		{ date: 'w2', label: 'move checks to middleware', state: 'now' },
		{ date: 'w3', label: 'delete the old util', state: 'next' }
	]}
/>
\`\`\`

## Incident

What happened, then which days took the hit.

\`\`\`svelte
<script>
	import { GraphTimeline } from 'markgraphy';
</script>

<GraphTimeline
	title="INCIDENT"
	events={[
		{ date: '14:02', label: 'p95 crossed 800ms' },
		{ date: '14:11', label: 'rolled back the cache flag', state: 'now' },
		{ date: '14:40', label: 'write the postmortem', state: 'next' }
	]}
/>
\`\`\`

\`\`\`svelte
<script>
	import { GraphUptime } from 'markgraphy';
</script>

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
/>
\`\`\`

## Pick one

A matrix, then sizes if they matter.

\`\`\`svelte
<script>
	import { GraphCompare } from 'markgraphy';
</script>

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
/>
\`\`\`

\`\`\`svelte
<script>
	import { GraphRank } from 'markgraphy';
</script>

<GraphRank
	title="INSTALL"
	items={[
		{ label: 'bullmq', value: 48, display: '48 kb' },
		{ label: 'ioredis', value: 31, display: '31 kb' },
		{ label: 'aws sdk', value: 120, display: '120 kb' }
	]}
/>
\`\`\`

## Pull request

What moved, and what the numbers did.

\`\`\`svelte
<script>
	import { GraphDiff } from 'markgraphy';
</script>

<GraphDiff
	title="FILES"
	palette="duo"
	rows={[
		{ label: 'auth.ts', value: 'new', sign: 'add' },
		{ label: 'session.ts', value: 'moved' },
		{ label: 'legacy-auth.ts', value: 'gone', sign: 'remove' }
	]}
/>
\`\`\`

\`\`\`svelte
<script>
	import { GraphSlope } from 'markgraphy';
</script>

<GraphSlope
	title="COVERAGE"
	fromLabel="main"
	toLabel="this pr"
	items={[
		{ label: 'auth', from: 41, to: 88 },
		{ label: 'billing', from: 72, to: 74 },
		{ label: 'docs', from: 11, to: 40 }
	]}
/>
\`\`\`

## This week

Overlapping work, then the board counts.

\`\`\`svelte
<script>
	import { GraphGantt } from 'markgraphy';
</script>

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
/>
\`\`\`

\`\`\`svelte
<script>
	import { GraphStat } from 'markgraphy';
</script>

<GraphStat
	title="BOARD"
	items={[
		{ value: '4', label: 'in review' },
		{ value: '2', label: 'blocked' },
		{ value: '9', label: 'shipped', accent: true }
	]}
/>
\`\`\`

## Migration

How far the job is, and the count behind it.

\`\`\`svelte
<script>
	import { GraphMeter } from 'markgraphy';
</script>

<GraphMeter title="ROWS" value={0.67} caption="users table" />
\`\`\`

\`\`\`svelte
<script>
	import { GraphKpi } from 'markgraphy';
</script>

<GraphKpi
	title="MIGRATED"
	value="1.2M"
	label="of 1.8M rows"
	hint="67%"
	data={[2, 3, 3, 5, 8, 9, 11, 12, 14, 16, 18, 21]}
/>
\`\`\``;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8'
		}
	});
}
