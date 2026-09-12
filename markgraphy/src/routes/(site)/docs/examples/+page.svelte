<script lang="ts">
	import PageHeader from '$site/components/docs/page-header.svelte';
	import RecipeCard from '$site/components/docs/recipe-card.svelte';
	import { recipes } from '$site/docs/recipes';
	import { SITE_NAME } from '$site/lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const description =
		'Short write-ups with two graphs each. A refactor, an incident, a tradeoff, a pull request.';
</script>

<svelte:head>
	<title>Examples — {SITE_NAME}</title>
	<meta name="description" content={description} />
</svelte:head>

<div class="page">
	<PageHeader
		title="Next to the writing."
		kicker="examples"
		lead="{description} Copy the Svelte and swap the labels for yours. Each graph has its own page if you want the props."
	/>

	<ul class="chips" role="list">
		{#each recipes as item (item.slug)}
			<li>
				<a href="#{item.slug}">[ {item.title} ]</a>
			</li>
		{/each}
	</ul>

	<div class="list">
		{#each recipes as item (item.slug)}
			<RecipeCard recipe={item} usageHtml={data.usageHtml[item.slug]} />
		{/each}
	</div>

	<p class="outro">
		Give this to an agent: <a href="/docs/skill">Skill</a>. Every graph in one file:
		<a href="/llms.txt">/llms.txt</a>.
	</p>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 2.4rem;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.15rem 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.chips a {
		display: inline-block;
		padding: 0.3rem 0.2rem;
		color: var(--text-secondary);
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
	}

	.chips a:hover {
		color: var(--graph-accent);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 3.2rem;
	}

	.outro {
		max-width: 56ch;
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.85rem;
	}

	.outro a {
		color: var(--text-primary);
		text-decoration: none;
		border-bottom: 1px dotted var(--text-muted);
	}
</style>
