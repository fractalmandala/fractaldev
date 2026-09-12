<script lang="ts">
	// Home page hero: one instrument at a time in the vitrine, its dossier
	// beside it, a filmstrip of the eight instruments beneath. j/k or arrows
	// move through the strip.
	import { staticComponents, animatedComponents } from '$site/docs/catalog';
	import { instruments } from '$site/lib/instruments';
	import Logo from '$site/icons/mgbig.svelte'
	import Graph from '$lib/frame/Graph.svelte'
	import Agni from '$lib/animated/GraphAgni.svelte'

	let current = $state(0);

	const instrument = $derived(instruments[current]);
	const index = $derived(String(current + 1).padStart(2, '0'));
	const total = $derived(String(instruments.length).padStart(2, '0'));

	const components = {
		static: staticComponents.filter((c) => c.slug.startsWith('graph-')).length,
		diagram: staticComponents.filter((c) => !c.slug.startsWith('graph-')).length,
		animated: animatedComponents.length
	};

	function mount(next: number) {
		current = (next + instruments.length) % instruments.length;
	}

	function onkeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement | null;
		if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
			return;
		}
		if (event.metaKey || event.ctrlKey || event.altKey) {
			return;
		}
		if (event.key === 'j' || event.key === 'ArrowRight') {
			event.preventDefault();
			mount(current + 1);
		} else if (event.key === 'k' || event.key === 'ArrowLeft') {
			event.preventDefault();
			mount(current - 1);
		}
	}
</script>

<svelte:window {onkeydown} />

<section class="observatory pad-top-xl" id="stage">
	<Graph class="pad-xl" dash="long" motion="march">
		<div class="grid-2 gap-xl left-short">
	<Agni/>
	<div class="box xleft ta-l">
		<div class="box gap-lg">
			<p class="text-muted text-sm">[ graphs | charts | svelte 5 | mdsvex ]</p>
			<h1 class="display">
				<Logo/>
			</h1>
			<div class="box-sm">
			<p class="text-lg weight-300">
				Graphs, charts and animated diagrams for a novel render and aesthetic to markdown notes.<br>
				Block glyphs, dashed frames, one accent, thousands of iconsets.
			</p>
			<p class="text-lg text-secondary weight-300">
				{components.static} graphs, {components.animated} animations, {components.diagram} diagrams
				— same frame, same accent, same vocabulary.<br>
				inspired by the work of <a href="https://x.com/emilkowalski/status/2092979832208425085" target="_blank" rel="noreferrer">Emil Kowalski</a>
			</p>
			</div>
			<div class="row gap-sm">
				<a class="button primary" href="/docs">Read the Docs <span class="mover">→</span></a>
				<a class="button outline" href="/docs/editor">Get Started</a>
				<a class="button outline" href="/docs">Components</a>
			</div>
		</div> 
	</div>
		</div>
	</Graph>
</section>

<style>
	.observatory {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
	}

	h1 {
		margin: 0;
		font-size: clamp(2.6rem, 7.2vw, 6.4rem);
	}

	@media (max-width: 1024px) {
		h1 {
			font-size: clamp(2.3rem, 9vw, 4.2rem);
		}

		/* The hero frame and its interior grid take up too much of a narrow
		   screen — tighten both to the md/lg steps of the space scale. */
		.observatory :global(.graph.pad-xl) {
			padding: calc(var(--space-md) * var(--pad-scale, 1));
		}

		.observatory :global(.grid-2) {
			gap: calc(var(--space-md) * var(--gap-scale, 1));
		}
	}


</style>
