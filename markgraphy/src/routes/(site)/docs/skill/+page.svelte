<script lang="ts">
	import PageHeader from '$site/components/docs/page-header.svelte';
	import {
		skillAgents,
		skillCopyFromRepo,
		skillCurl,
		skillExamples,
		skillPrompt,
		skillSource,
		type SkillAgent
	} from '$site/docs/skill';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const description =
		'A SKILL.md that picks a markdown graph when a write-up would scan faster with a figure. Same files in Cursor, Claude Code, Codex, OpenCode, or any agent that loads Agent Skills.';

	type SkillGraph = { name: string; slug: string };

	const skillChooser: Array<{ writing: string; graphs: SkillGraph[] }> = [
		{
			writing: 'A path or a refactor',
			graphs: [
				{ name: 'GraphFlow', slug: 'graph-flow' },
				{ name: 'GraphTimeline', slug: 'graph-timeline' }
			]
		},
		{
			writing: 'An incident',
			graphs: [
				{ name: 'GraphTimeline', slug: 'graph-timeline' },
				{ name: 'GraphUptime', slug: 'graph-uptime' }
			]
		},
		{
			writing: 'Pick A vs B',
			graphs: [
				{ name: 'GraphCompare', slug: 'graph-compare' },
				{ name: 'GraphRank', slug: 'graph-rank' }
			]
		},
		{
			writing: 'What a PR changed',
			graphs: [
				{ name: 'GraphDiff', slug: 'graph-diff' },
				{ name: 'GraphSlope', slug: 'graph-slope' }
			]
		},
		{
			writing: 'Overlapping work',
			graphs: [
				{ name: 'GraphGantt', slug: 'graph-gantt' },
				{ name: 'GraphStat', slug: 'graph-stat' }
			]
		},
		{
			writing: 'A migration in flight',
			graphs: [
				{ name: 'GraphMeter', slug: 'graph-meter' },
				{ name: 'GraphKpi', slug: 'graph-kpi' }
			]
		},
		{
			writing: 'One headline number',
			graphs: [
				{ name: 'GraphKpi', slug: 'graph-kpi' },
				{ name: 'GraphStat', slug: 'graph-stat' }
			]
		},
		{
			writing: 'Nested files',
			graphs: [{ name: 'GraphTree', slug: 'graph-tree' }]
		}
	];

	const skillRules = [
		'At most two graphs in a section. Prose between them.',
		'Titles: short uppercase, drawn as [ TITLE ].',
		'Labels: lowercase, plain (auth middleware, not AuthMiddleware Layer).',
		'Copy props from docs or recipes. Do not invent APIs, extra hues, or chart libraries.',
		'palette="duo" / "multi" only when a second or third series needs it.',
		'Motion is already in the components. Do not add loops or pulses.'
	];

	let agent = $state<SkillAgent>(skillAgents[0]);
	let copiedKey = $state<string | null>(null);
	let timeout: ReturnType<typeof setTimeout> | undefined;

	const agentInstall = $derived(data.install[agent.id]);

	async function copy(key: string, text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copiedKey = key;
			clearTimeout(timeout);
			timeout = setTimeout(() => (copiedKey = null), 1600);
		} catch {
			/* clipboard unavailable — the pre stays selectable */
		}
	}
</script>

<svelte:head>
	<title>Skill — Markgraphy</title>
	<meta name="description" content={description} />
</svelte:head>

{#snippet block(label: string, value: string, key: string, wrap: boolean, html?: string)}
	<div class="block">
		<div class="block-head">
			<span class="block-label">{label}</span>
			<button
				class="copy"
				class:done={copiedKey === key}
				type="button"
				onclick={() => copy(key, value)}
			>
				{copiedKey === key ? 'copied' : 'copy'}
			</button>
		</div>
		<div class="block-pre" class:wrap>
			{#if html}
				{@html html}
			{:else}
				{value}
			{/if}
		</div>
	</div>
{/snippet}

<div class="page">
	<PageHeader title="Give it to an agent." kicker="skill" lead={description}>
		<p class="note">
			The graphs themselves still need to be in the project.
			<a href="/docs/installation">Install the package</a> first if it is missing.
		</p>
	</PageHeader>

	<section class="section">
		<h2>Install</h2>
		<p>
			Project copy travels with the repo. Personal copy is this machine only.
			The agent picks it up from the description when the writing would scan
			faster with a figure. If yours watches some other folder, drop the same
			two files there.
		</p>
		<div class="agents" role="tablist" aria-label="Agent">
			{#each skillAgents as item (item.id)}
				<button
					class="agent"
					class:selected={agent.id === item.id}
					role="tab"
					aria-selected={agent.id === item.id}
					type="button"
					onclick={() => (agent = item)}
				>
					<span class="agent-name">{item.name}</span>
					<span class="agent-dir">{item.project}</span>
				</button>
			{/each}
		</div>
		{@render block('Project', skillCurl(agent.project), 'project', false, agentInstall?.project)}
		{@render block('Personal', skillCurl(agent.personal), 'personal', false, agentInstall?.personal)}
		{@render block('From the repo', skillCopyFromRepo(agent.project), 'repo', false, agentInstall?.repo)}
		{@render block('Prompt', skillPrompt(agent.project), 'prompt', true, agentInstall?.prompt)}
	</section>

	<section class="section">
		<h2>Try it</h2>
		<p>
			Paste one of these after install. Each should pick two graphs from the
			chooser and put prose between them.
		</p>
		<div class="stack">
			{#each skillExamples as item, index (item.label)}
				{@render block(
					`${item.label} · ${item.hint}`,
					item.prompt,
					`try-${item.label}`,
					true,
					data.examples[index]
				)}
			{/each}
		</div>
	</section>

	<section class="section">
		<h2>When to use</h2>
		<p>
			Before a wall of bullets, the skill asks if a framed figure would scan
			faster. Skip it if the whole point is one sentence.
		</p>
		<div class="table-wrap">
			<table class="table">
				<thead>
					<tr>
						<th scope="col">The writing is</th>
						<th scope="col">Use</th>
					</tr>
				</thead>
				<tbody>
					{#each skillChooser as row (row.writing)}
						<tr>
							<td>{row.writing}</td>
							<td>
								{#each row.graphs as graph, index (graph.slug)}{#if index > 0}, then {/if}<a
										href="/docs/{graph.slug}">{graph.name}</a
									>{/each}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p>
			Worked write-ups with Svelte:
			<a href="/docs/examples">Examples</a>.
		</p>
	</section>

	<section class="section">
		<h2>Rules</h2>
		<ul role="list">
			{#each skillRules as rule (rule)}
				<li>{rule}</li>
			{/each}
		</ul>
		<p>
			Do not draw the chart in SVG or Markdown ASCII art if the component
			exists. Do not restyle the frame. Do not dump every graph into one reply.
		</p>
	</section>

	<section class="section">
		<h2>The file</h2>
		<p>
			This is what the agent loads. <a href="/skill.md">/skill.md</a> and
			<a href="/skill/recipes.md">/skill/recipes.md</a> stay in sync with the
			repo. <a href="/llms.txt">/llms.txt</a> is the full chooser if the skill
			is not installed.
		</p>
		{@render block('SKILL.md', skillSource, 'skill-source', false, data.source)}
	</section>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	.note {
		max-width: 56ch;
		margin: 0;
		color: var(--text-secondary);
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.section > p {
		max-width: 56ch;
		margin: 0;
		color: var(--text-secondary);
		text-wrap: pretty;
	}

	.section a {
		color: var(--text-primary);
		text-decoration: underline;
		text-decoration-color: var(--border);
		text-underline-offset: 4px;
	}

	.section a:hover {
		text-decoration-color: var(--text-primary);
	}

	.agents {
		display: grid;
		border-block: 1px dashed var(--border);
	}

	@media (min-width: 640px) {
		.agents {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.agent {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 1rem 1rem;
		border: 0;
		border-top: 1px dashed var(--border);
		background: transparent;
		color: var(--text-secondary);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	@media (min-width: 640px) {
		.agent:nth-child(n + 3) {
			border-top: 1px dashed var(--border);
		}

		.agent:nth-child(2n) {
			border-left: 1px dashed var(--border);
		}
	}

	.agent:hover {
		color: var(--text-primary);
		background: var(--text-muted);
	}

	.agent.selected {
		background: var(--text-muted);
		color: var(--text-primary);
	}

	.agent-name {
		font-weight: 500;
	}

	.agent-dir {
		font-size: 0.875rem;
	}

	.block {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		background: var(--bg-terminal, #0c0c0c);
	}

	.block-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.5rem 1rem;
		border-bottom: 1px dotted #2a2a2a;
	}

	.block-label {
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.copy {
		padding: 0.125rem 0.5rem;
		border: 1px dashed transparent;
		background: transparent;
		color: var(--text-secondary);
		font: inherit;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.copy:hover {
		color: var(--text-primary);
	}

	.copy.done {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.block-pre {
		margin: 0;
		padding: 1rem;
		overflow-x: auto;
		font-size: 0.8rem;
		line-height: 1.6;
		color: var(--text-secondary);
		white-space: pre;
	}

	.block-pre.wrap {
		white-space: pre-wrap;
	}

	.block-pre :global(pre) {
		margin: 0;
		padding: 0;
		overflow-x: visible;
		font: inherit;
		color: inherit;
		white-space: inherit;
	}

	.stack {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.table-wrap {
		overflow-x: auto;
	}

	.table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	.table th {
		padding: 0.75rem;
		border-bottom: 1px dashed var(--border);
		font-weight: 500;
		color: var(--text-primary);
	}

	.table td {
		padding: 0.75rem;
		border-bottom: 1px dashed var(--border);
		color: var(--text-secondary);
	}

	.table td:last-child {
		font-size: 0.875rem;
	}

	.table a {
		color: var(--text-primary);
		text-decoration: none;
	}

	.table a:hover {
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	ul {
		max-width: 56ch;
		margin: 0;
		padding: 0;
		padding-left: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		color: var(--text-secondary);
	}
</style>
