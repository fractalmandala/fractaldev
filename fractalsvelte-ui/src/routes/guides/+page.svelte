<script lang="ts">
	import { guides } from '#lib/docs/guides.ts';
</script>

<svelte:head>
	<title>Guides — Fractalsvelte UI</title>
	<meta name="description" content="Adoption, styling, theming, accessibility, motion, and maintenance guides for Fractalsvelte UI." />
</svelte:head>

<article class="content-section narrow-full box gap-lg">
	<header class="box gap-2xs pad-bottom-xs border-bottom">
		<span class="eyebrow">Documentation</span>
		<h1 class="text-4xl weight-600">Guides</h1>
		<p class="text-muted">Adopt the Sass-first system, theme it across products, and maintain accessible components with a clear public contract.</p>
	</header>
	<div class="card-grid gap-sm">
		{#each guides as guide, index}
			<a class="card pad-md box gap-2xs hover-card xleft" href={`/guides/${guide.slug}`}>
				<span class="eyebrow">{String(index + 1).padStart(2, '0')}</span>
				<strong class="text-md weight-600">{guide.title}</strong>
				<small class="text-muted text-xs">{guide.markdown.split('\n').find((line) => line && !line.startsWith('#')) ?? ''}</small>
			</a>
		{/each}
	</div>
</article>
