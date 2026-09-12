<script lang="ts">
	import { SITE_NAME } from '$site/lib/site';
	import { components, animatedComponents } from '$site/docs/catalog';

	const graphs = components.filter((c) => c.slug.startsWith('graph-') && !animatedComponents.some((a) => a.slug === c.slug)).length;
	const animations = animatedComponents.length;
	const diagrams = components.filter((c) => !c.slug.startsWith('graph-')).length;
</script>

<svelte:head>
	<title>Docs — {SITE_NAME}</title>
	<meta name="description" content="Live documentation for every graph, animation, and diagram in the library." />
</svelte:head>

<div class="intro">
	<h1>Docs</h1>
	<p class="lead">
		{graphs} graphs, {animations} animations, {diagrams} diagrams.
		Every page imports the real component and renders it live —
		the docs are the test suite.
	</p>
	<p class="hint">
		Pick a component from the sidebar to see its props, examples, and a working preview.
	</p>
</div>

<style>
	.intro {
		max-width: 36rem;
	}

	.intro h1 {
		margin: 0 0 1rem;
		font-family: var(--font-sans);
		font-size: 2.2rem;
		font-weight: 700;
		letter-spacing: -0.04em;
	}

	.lead {
		margin: 0 0 0.8rem;
		font-size: 1.05rem;
		line-height: 1.6;
		color: var(--text-primary);
	}

	.hint {
		margin: 0;
		font-size: 0.88rem;
		color: var(--text-muted);
	}
</style>
