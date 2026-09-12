<script lang="ts">
	import {
		GraphCompare,
		GraphDiff,
		GraphFlow,
		GraphGantt,
		GraphKpi,
		GraphMeter,
		GraphRank,
		GraphSlope,
		GraphStat,
		GraphTimeline,
		GraphUptime
	} from '$lib';
	import { figureLabel, recipeCopy, type Recipe } from '$site/docs/recipes';
	import CopyCode from './copy-code.svelte';

	let {
		recipe,
		titleLevel = 2,
		showCode = true,
		usageHtml
	}: {
		recipe: Recipe;
		/** Heading level for the recipe title: 2 on the examples page, 3 elsewhere. */
		titleLevel?: 2 | 3;
		/** Show the copyable usage block. */
		showCode?: boolean;
		/** Shiki HTML for the usage block, highlighted on the server; plain text when absent. */
		usageHtml?: string;
	} = $props();

	const headingTag = $derived(titleLevel === 3 ? 'h3' : 'h2');
</script>

<section class="card" id={recipe.slug}>
	<div class="head">
		<div class="lede">
			<svelte:element this={headingTag} class="title">{recipe.title}</svelte:element>
			<p class="story">{recipe.story}</p>
		</div>
		<p class="tags">
			{#each recipe.tags as tag (tag)}
				<span>[ {tag} ]</span>
			{/each}
		</p>
	</div>

	<div class="figures">
		{#each recipe.graphs as figure (figure.slug)}
			<div class="figure">
				<div class="plate">
					{#if figure.component === 'GraphCompare'}
						<GraphCompare {...figure.props} />
					{:else if figure.component === 'GraphDiff'}
						<GraphDiff {...figure.props} />
					{:else if figure.component === 'GraphFlow'}
						<GraphFlow {...figure.props} />
					{:else if figure.component === 'GraphGantt'}
						<GraphGantt {...figure.props} />
					{:else if figure.component === 'GraphKpi'}
						<GraphKpi {...figure.props} />
					{:else if figure.component === 'GraphMeter'}
						<GraphMeter {...figure.props} />
					{:else if figure.component === 'GraphRank'}
						<GraphRank {...figure.props} />
					{:else if figure.component === 'GraphSlope'}
						<GraphSlope {...figure.props} />
					{:else if figure.component === 'GraphStat'}
						<GraphStat {...figure.props} />
					{:else if figure.component === 'GraphTimeline'}
						<GraphTimeline {...figure.props} />
					{:else if figure.component === 'GraphUptime'}
						<GraphUptime {...figure.props} />
					{/if}
				</div>
				<a class="fig-link" href="/docs/{figure.slug}">[ {figureLabel(figure.slug)} ]</a>
			</div>
		{/each}
	</div>

	{#if showCode}
		<div class="import-box">
			<header>
				<span>usage</span>
				<CopyCode text={recipeCopy(recipe)} label="copy svelte" />
			</header>
			<div class="usage">
				{#if usageHtml}
					{@html usageHtml}
				{:else}
					<pre>{recipeCopy(recipe)}</pre>
				{/if}
			</div>
		</div>
	{/if}
</section>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
		scroll-margin-top: 4.5rem;
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding-bottom: 0.9rem;
		border-bottom: 1px dashed var(--border);
	}

	@media (min-width: 640px) {
		.head {
			flex-direction: row;
			align-items: flex-end;
			justify-content: space-between;
		}
	}

	.lede {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		min-width: 0;
	}

	.title {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 1.45rem;
		font-weight: 600;
		letter-spacing: -0.04em;
		color: var(--text-primary);
	}

	.story {
		max-width: 56ch;
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.85rem;
		text-wrap: pretty;
	}

	.tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin: 0;
		color: var(--text-muted);
		font-size: 0.62rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.figures {
		display: grid;
		gap: 1.1rem;
	}

	@media (min-width: 900px) {
		.figures {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.figure {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
	}

	.plate {
		flex: 1;
		padding: 1.8rem 1.3rem 1.2rem;
		background: var(--bg-raised);
		overflow-x: auto;
	}

	@media (max-width: 1024px) {
		.plate {
			padding: 1.2rem 1rem 1rem;
		}

		.import-box {
			padding: 0.75rem 0.8rem 0.85rem;
		}
	}

	.fig-link {
		align-self: flex-end;
		color: var(--text-secondary);
		font-size: 0.62rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		text-decoration: none;
	}

	.fig-link:hover {
		color: var(--graph-accent);
	}

	.import-box {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		min-width: 0;
		padding: 0.85rem 0.9rem 0.95rem;
		border: 1px solid var(--border);
		background: var(--bg-terminal, #0c0c0c);
	}

	.import-box header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: var(--text-secondary);
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.usage {
		min-width: 0;
		overflow-x: auto;
	}

	.usage :global(pre) {
		margin: 0;
		background: transparent !important;
		font-size: 0.8rem;
		line-height: 1.55;
		color: var(--text-secondary);
		white-space: pre;
	}
</style>
