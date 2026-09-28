<script lang="ts">
	import { components, categories, categoryToSlug } from '#lib/docs/catalogue.ts';
	import Badge from '#lib/components/Badge.svelte';
</script>

<svelte:head>
	<title>Components — Fractalsvelte UI</title>
	<meta name="description" content="Explore the full component library: accessible UI primitives and high-value motion components." />
</svelte:head>

<article class="content-section narrow-full box gap-xl">
	<header class="page-header box gap-sm mb-bs">
		<h1 class="text-4xl weight-700">Catalogue</h1>
		<p class="text-secondary text-lg">Explore {components.length} accessible UI primitives, motion surfaces, and layout components with copy-ready code.</p>
	</header>

	{#each categories as category}
		{@const categoryComponents = components.filter((c) => c.category === category)}
		{#if categoryComponents.length > 0}
			<section class="box gap-sm">
					<h2>
						<a class="text-2xl weight-600" href={`/components/${categoryToSlug(category)}`}>{category}</a>
					</h2>
				<div class="card-grid gap-sm">
					{#each categoryComponents as component}
						<a class="box gap-xs card sunken border-subtle radius-sm pad-bs xleft" href={`/components/${categoryToSlug(category)}/${component.slug}`}>
							<header class="box gap-sm">
								<p class="text-lg weight-600 lh12">{component.name}</p>
								<span class="text-muted text-md">{component.description}</span>
							</header>
				<footer class="mt-sm">
					<div aria-hidden="true" class="text-theme text-xl">→</div>
				</footer>
						</a>
					{/each}
				</div>
			</section>
		{/if}
	{/each}
</article>
