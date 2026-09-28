<script lang="ts">
	import { components, categories, categoryToSlug } from '#lib/docs/catalogue.ts';
	import Heart from '#lib/icons/heart.svelte';
</script>

<svelte:head><title>Fractalsvelte UI — Svelte components</title></svelte:head>

<section class="content-section solo">
<section class="box mb-xl py-xl gap-lg">
		<h1 class="text-6xl weight-600 ls-tight-2xl">Diverse Components.<br>Common Types.<br>One Visual Language.</h1>
		<p class="text-3xl text-secondary ls-tight-xl">Fractalsvelte UI is a complete component library.<br>From UI primitives to motion components and layout blocks, typography, and more...</p>
		<div class="row ycenter gap-xs">
			<span class="text-bs weight-600 ls-tight-xl">made with</span><Heart/><span class="ls-tight-xl weight-600 text-bs">for Sveltekit</span>
		</div>
</section>
	<div class="grid-5 stay2 gap-md">
		{#each categories as category}
			<a class="box gap-xs card sunken border-subtle radius-sm pad-bs xleft" href={`/components/${categoryToSlug(category)}`}>
				<header class="box">
				<p class="text-lg weight-600">{category}</p>
				<span class="text-muted text-md">{components.filter((component) => component.category === category).length} components</span>
				</header>
				<footer class="mt-sm">
					<div aria-hidden="true" class="text-theme">→</div>
				</footer>
			</a>
		{/each}
	</div>
</section>
