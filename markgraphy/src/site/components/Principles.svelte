<script lang="ts">
	import Frame from '$lib/frame/Graph.svelte'

	const principles = [
		{
			idx: '01',
			title: 'It Starts With a Frame.',
			body: 'And the frame carries props - set animation, border type, padding, background.'
		},
		{
			idx: '02',
			title: 'Lists, Tables, ASCII.',
			body: 'The frame is a blank canvas - you decide what goes in there.'
		},
		{
			idx: '03',
			title: 'Static vs Animated.',
			body: 'Lists can be workflows, diagrams can be animations. Bring it all to life.'
		}
	];
</script>

<section class="section" id="rules">
	<div class="principles">
		{#each principles as item (item.idx)}
			<Frame title={item.idx} pad="lg" motion="pulse" dash="gap" class="surface">
			<article class="principle ta-c box gap-xs">
				<h2 class="text-lg text-secondary weight-400">{item.title}</h2>
				<p class="text-bs text-secondary">{item.body}</p>
			</article>
			</Frame>
		{/each}
	</div>
</section>

<style>
	.section {
		position: relative;
		z-index: 1;
		padding: 3.2rem var(--pad) 4rem;
	}

	.principles {
		max-width: var(--site-max);
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-sm);
	}

	@media (max-width: 1024px) {

		.section {
			padding: 2.2rem var(--pad) 2.6rem;
		}

		.principles {
			grid-template-columns: 1fr;
		}

		.principle {
			border-right: 0;
			border-bottom: 1px dashed var(--border);
		}

		.principle:last-child {
			border-bottom: 0;
		}
	}
</style>
