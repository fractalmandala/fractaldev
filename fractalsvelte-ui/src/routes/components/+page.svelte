<script lang="ts">
	import { components, categories } from '#lib/docs/catalogue.ts';
	import Badge from '#lib/components/Badge.svelte';
</script>

<svelte:head>
	<title>Components — Fractalsvelte UI</title>
	<meta name="description" content="Explore the full component library: accessible UI primitives and high-value motion components." />
</svelte:head>

<article class="component-doc stack gap-l">
	<header class="component-doc__header stack gap-2xs">
		<span class="eyebrow">Catalogue</span>
		<h1>Components</h1>
		<p class="muted">Explore {components.length} accessible UI primitives, motion surfaces, and layout components with real-time interactive playgrounds.</p>
	</header>

	{#each categories as category}
		{@const categoryComponents = components.filter((c) => c.category === category)}
		{#if categoryComponents.length > 0}
			<section class="doc-section stack gap-s">
				<h2 class="text-xl weight-600">{category}</h2>
				<div class="card-grid gap-s">
					{#each categoryComponents as component}
						<a class="card pad-m stack gap-2xs hover-card" href={`/components/${component.slug}`}>
							<div class="row ycenter xbetween">
								<strong class="text-md weight-600">{component.name}</strong>
								<Badge variant="accent">{component.slug}</Badge>
							</div>
							<p class="muted text-sm">{component.description}</p>
						</a>
					{/each}
				</div>
			</section>
		{/if}
	{/each}
</article>
