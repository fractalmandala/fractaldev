<script lang="ts">
	import { components, categories } from '#lib/docs/catalogue.ts';
	import Badge from '#lib/components/Badge.svelte';
</script>

<svelte:head><title>Fractalsvelte UI — Svelte components</title></svelte:head>

<section class="hero">
	<div class="center">
		<Badge variant="accent">Svelte 5 + Sass</Badge>
		<h1>Small components. One deliberate visual language.</h1>
		<p>Fractalsvelte UI is a complete starter component library for SvelteKit. It pairs accessible primitives with a two-layer Sass token system, then documents every public component in the same app.</p>
		<div class="cluster row xcenter gap-s mt-m">
			<a class="button primary lg" href="/components/button">Explore components <span aria-hidden="true">→</span></a>
			<a class="button ghost lg" href="/guides">Read the guides <span aria-hidden="true">→</span></a>
		</div>
	</div>
</section>

<section class="stack gap-m my-l">
	<div><span class="eyebrow">Included today</span><h2>{components.length} focused primitives</h2></div>
	<div class="grid-3 gap-m">
		<article class="card pad-m raised stack gap-xs"><h3>Sass-first system</h3><p>Raw and semantic custom properties, stable spacing, typography, radii, and component recipes live in indented <code>.sass</code> files.</p></article>
		<article class="card pad-m raised stack gap-xs"><h3>Accessible by default</h3><p>Native elements underpin controls and overlays, with visible focus treatment and semantic state attributes throughout.</p></article>
		<article class="card pad-m raised stack gap-xs"><h3>Docs that run</h3><p>Every component page includes a real interactive preview, prop contract, and copy-ready Svelte usage.</p></article>
	</div>
</section>

<section class="stack gap-m my-l">
	<span class="eyebrow">Browse by purpose</span>
	<div class="card-grid gap-s">
		{#each categories as category}
			<a class="card pad-s raised row ycenter xbetween" href={`/components/${components.find((component) => component.category === category)?.slug}`}>
				<strong>{category}</strong>
				<span class="muted text-xs">{components.filter((component) => component.category === category).length} components</span>
				<span aria-hidden="true">→</span>
			</a>
		{/each}
	</div>
</section>
