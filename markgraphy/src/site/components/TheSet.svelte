<script lang="ts">
	// "The set": seven real components on one wall, each linking to its docs.
	import { GraphActivity, reveal, stagger } from '$lib';
	import { animatedComponents, staticComponents } from '$site/docs/catalog';
	import { previews } from '$site/docs/previews';
	import { commits } from '$site/lib/wall';

	const graphs = staticComponents.filter((item) => item.slug.startsWith('graph-')).length;
	const diagrams = staticComponents.length - graphs;
	const animated = animatedComponents.length;

	const tiles = [
		{ slug: 'graph-invoice', entry: previews['graph-invoice'][0] },
		{ slug: 'graph-table', entry: previews['graph-table'][1] },
		{ slug: 'graph-flow', entry: previews['graph-flow'][0] },
		{ slug: 'graph-tree', entry: previews['graph-tree'][0] },
		{ slug: 'graph-bars', entry: previews['graph-bars'][0] },
		{ slug: 'graph-kpi', entry: previews['graph-kpi'][0] }
	];

	// Tiles rise in on scroll, one after the next. The cap is raised past the
	// 280ms default so all seven cascade instead of the last few landing together.
	const rise = (index: number) => ({
		delay: stagger(index, 60, 400),
		from: 'below' as const,
		distance: 20,
		duration: 420,
		easing: 'out-expo' as const,
		// Tiles are tall; wait for a quarter of one and it reveals too late.
		amount: 0.15
	});
</script>

<section class="section box gap-lg" id="set">
	<div class="section-head ta-c box xcenter">
		<h2 class="weight-500 text-2xl">Examples</h2>
	</div>
	<div class="wall wfull">
		{#each tiles as tile, i (tile.slug)}
			<article class="tile t{i}" use:reveal={rise(i)}>
				<tile.entry.Comp {...tile.entry.props} />
			</article>
		{/each}
		<article class="tile span" use:reveal={rise(tiles.length)}>
			<div class="scroll">
				<GraphActivity title="COMMITS" palette="multi" days={commits} />
			</div>
		</article>
	</div>
</section>

<style>
	.section {
		position: relative;
		z-index: 1;
		padding: 3.2rem var(--pad) 4rem;
	}

	.wall {
		max-width: var(--site-max);
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: var(--space-lg)
	}

	.tile {
		position: relative;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.t1, .t4 { background: var(--bg-surface); }
	.t0, .t3 { background: var(--bg-dialog); }
	.t2, .t5 { background: none }

	.tile :global(.graph) {
		flex: 1;
	}

	.tile.span {
		grid-column: 1 / -1;
	}

	@media (max-width: 1024px) {
		.section {
			padding: 2.2rem var(--pad) 2.6rem;
		}

		.section-head {
			flex-direction: column;
		}

		.wall {
			grid-template-columns: 1fr;
			gap: var(--space-md);
		}

		.tile {
			overflow-x: auto;
			scrollbar-width: thin;
		}
	}
</style>
