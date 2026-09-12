<script lang="ts">
	// Room 03 — rules. Three constraints as rule plates, each demo driven by
	// a real library component: the glyph set on a GraphRank, the corner mark
	// on a bare Graph frame, and the palette on a GraphStack. Break any one
	// and it becomes another chart library.
	import { Graph, GraphBody, GraphRank, GraphStack } from '$lib';

	const glyphSets = ['shade', 'ascii', 'hash', 'bar'] as const;
	type GlyphSet = (typeof glyphSets)[number];
	let glyphSet = $state<GlyphSet>('shade');

	const corners = ['+', '*', '·', '⌜'];
	let corner = $state('+');

	const palettes = ['mono', 'duo', 'multi'] as const;
	type Palette = (typeof palettes)[number];
	let palette = $state<Palette>('mono');

	const rankItems = [
		{ label: 'cpu', value: 72 },
		{ label: 'ram', value: 34 },
		{ label: 'ssd', value: 91 }
	];

	const stackRows = [
		{
			label: 'docs',
			segments: [
				{ label: 'shipped', value: 8 },
				{ label: 'review', value: 4 },
				{ label: 'backlog', value: 4 }
			]
		},
		{
			label: 'site',
			segments: [
				{ label: 'shipped', value: 6 },
				{ label: 'review', value: 6 },
				{ label: 'backlog', value: 2 }
			]
		},
		{
			label: 'pkg',
			segments: [
				{ label: 'shipped', value: 12 },
				{ label: 'review', value: 2 },
				{ label: 'backlog', value: 2 }
			]
		}
	];
</script>

<svelte:head>
	<title>Rules — markgraphy</title>
	<meta name="description" content="Three constraints: glyphs do the drawing, the frame is the brand, one accent on purpose." />
</svelte:head>

<section class="rules">

	<div class="grammar">

		<article class="rule-plate">
			<div class="rule-copy">
				<p class="rule-idx">03</p>
				<h2>One accent, on purpose.</h2>
				<p>Unused rows recede. Default is <code>palette="mono"</code>.</p>
			</div>
			<div class="rule-demo">
				<div class="controls" role="group" aria-label="Palette">
					{#each palettes as id (id)}
						<button
							type="button"
							class="mark-btn"
							aria-pressed={palette === id}
							onclick={() => (palette = id)}
						>
							[ {id} ]
						</button>
					{/each}
				</div>
				<div class="demo-art">
					<GraphStack title="STACK" palette={palette} rows={stackRows} />
				</div>
			</div>
		</article>
	</div>
	
</section>

<style>
	.rules {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: calc(100svh - 3.4rem);
		padding-bottom: 2rem;
	}

	.grammar {
		display: grid;
		gap: 1.4rem;
		padding: 1.4rem 0 2rem;
		max-width: var(--site-max);
		margin: 0 auto;
		width: 100%;
	}

	.rule-plate {
		display: grid;
		grid-template-columns: minmax(16rem, 0.9fr) minmax(0, 1.2fr);
		min-height: 280px;
		background: var(--bg-raised);
	}

	.rule-copy {
		padding: 2rem 1.5rem 1.6rem;
		border-right: 1px dashed var(--border);
		background: var(--bg);
	}

	.rule-idx {
		margin: 0 0 0.8rem;
		font-family: var(--font-sans);
		font-size: clamp(3.4rem, 8vw, 6.2rem);
		letter-spacing: -0.08em;
		line-height: 0.8;
		color: var(--text-muted);
	}

	.rule-copy h2 {
		margin: 0 0 0.55rem;
		font-family: var(--font-sans);
		font-size: clamp(1.4rem, 2.4vw, 2rem);
		letter-spacing: -0.045em;
	}

	.rule-copy p {
		margin: 0;
		color: var(--text-secondary);
		max-width: 38ch;
		font-size: 0.88rem;
	}

	.rule-demo {
		padding: 1.8rem 1.3rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		justify-content: center;
		background: var(--bg-raised);
		min-width: 0;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.mark-btn {
		color: var(--text-secondary);
		padding: 0 0.7rem;
		min-height: 36px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		font-size: 0.62rem;
		border: 1px solid var(--border);
		background: transparent;
	}

	.mark-btn:hover {
		color: var(--text-primary);
		border-color: var(--text-primary);
	}

	.mark-btn[aria-pressed='true'] {
		color: var(--bg);
		background: var(--text-primary);
		border-color: var(--text-primary);
	}

	.demo-art {
		min-width: 0;
		overflow-x: auto;
	}

	.dont {
		display: grid;
		grid-template-columns: 1fr 1fr;
		border: 1px dashed var(--border);
		max-width: var(--site-max);
		margin: 0 auto;
		width: 100%;
	}

	.dont article {
		padding: 1.3rem 1.2rem;
	}

	.dont article:first-child {
		border-right: 1px dashed var(--border);
	}

	.dont h3 {
		margin: 0.35rem 0 0.4rem;
		font-family: var(--font-sans);
		font-size: 1.1rem;
		letter-spacing: -0.03em;
	}

	.dont p {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.85rem;
		max-width: 44ch;
	}

	@media (max-width: 1024px) {
		.grammar {
			gap: 1rem;
			padding: 1rem 0 1.5rem;
		}

		.rule-plate {
			grid-template-columns: 1fr;
			min-height: 0;
		}

		.rule-copy {
			padding: 1.4rem 1.1rem 1.2rem;
			border-right: 0;
			border-bottom: 1px dashed var(--border);
		}

		.rule-demo {
			padding: 1.2rem 1rem;
			gap: 0.85rem;
		}

		.dont {
			grid-template-columns: 1fr;
		}

		.dont article {
			padding: 1rem 1.1rem;
		}

		.dont article:first-child {
			border-right: 0;
			border-bottom: 1px dashed var(--border);
		}
	}
</style>
