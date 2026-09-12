<script lang="ts">
	import { guides } from '#lib/docs/guides.ts';
</script>

<svelte:head>
	<title>Guides — Fractalsvelte UI</title>
	<meta name="description" content="Adoption, styling, theming, accessibility, motion, and maintenance guides for Fractalsvelte UI." />
</svelte:head>

<article class="guide-index stack gap-l">
	<header class="component-doc__header stack gap-2xs">
		<span class="eyebrow">Documentation</span>
		<h1>Guides</h1>
		<p class="muted">Adopt the Sass-first system, theme it across products, and maintain accessible components with a clear public contract.</p>
	</header>
	<div class="guide-index__grid card-grid gap-s">
		{#each guides as guide, index}
			<a class="card pad-m stack gap-2xs" href={`/guides/${guide.slug}`}>
				<span class="eyebrow">{String(index + 1).padStart(2, '0')}</span>
				<strong class="text-md weight-600">{guide.title}</strong>
				<small class="muted text-xs">{guide.markdown.split('\n').find((line) => line && !line.startsWith('#')) ?? ''}</small>
			</a>
		{/each}
	</div>
</article>
