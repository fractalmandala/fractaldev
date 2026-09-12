<script lang="ts">
	// Rules: the three constraints, each with a live control on a real component.
	import { Graph, GraphBody, GraphRank, GraphRule, GraphStack } from '$lib';
	import type { GlyphSetName } from '$lib/frame/glyphs';
	import type { GraphPalette } from '$lib/frame/tone';
	import PageHeader from '$site/components/docs/page-header.svelte';
	import { SITE_NAME } from '$site/lib/site';

	const glyphSets: GlyphSetName[] = ['shade', 'ascii', 'hash', 'bar'];
	const corners = ['+', '*', '·', '⌜'];
	const palettes: GraphPalette[] = ['mono', 'duo', 'multi'];

	let glyphs = $state<GlyphSetName>('shade');
	let corner = $state('+');
	let motion = $state<'none' | 'march'>('none');
	let palette = $state<GraphPalette>('mono');

	const rankItems = [
		{ label: 'cpu', value: 72 },
		{ label: 'ram', value: 34 },
		{ label: 'ssd', value: 91 }
	];

	const stackRows = [
		{
			label: 'docs',
			segments: [
				{ label: 'js', value: 48 },
				{ label: 'css', value: 22 },
				{ label: 'images', value: 30 }
			]
		},
		{
			label: 'site',
			segments: [
				{ label: 'js', value: 36 },
				{ label: 'css', value: 34 },
				{ label: 'images', value: 30 }
			]
		},
		{
			label: 'pkg',
			segments: [
				{ label: 'js', value: 70 },
				{ label: 'css', value: 10 },
				{ label: 'images', value: 20 }
			]
		}
	];
</script>

<svelte:head>
	<title>Rules — {SITE_NAME}</title>
	<meta
		name="description"
		content="Three constraints that keep the library typeset instead of plotted: glyphs draw, the frame is the brand, one accent on purpose."
	/>
</svelte:head>

<div class="page">
	<PageHeader
		title="A taste system disguised as charts."
		kicker="rules"
		lead="Three constraints. Break any one and it becomes another chart library. Keep them and the page looks typeset, not plotted."
	/>

	<div class="grammar">
		<article class="rule-plate">
			<div class="copy">
				<p class="idx">01</p>
				<h2>Glyphs do the drawing.</h2>
				<p>
					Borders are dashes and plus signs. Bars and cells are characters. To animate, change a
					color or swap a glyph. Anything monospace will host it: markdown, a README, a terminal.
				</p>
			</div>
			<div class="demo">
				<div class="controls" role="group" aria-label="Glyph set">
					{#each glyphSets as set (set)}
						<button type="button" class="mark" aria-pressed={glyphs === set} onclick={() => (glyphs = set)}>
							[ {set} ]
						</button>
					{/each}
				</div>
				{#key glyphs}
					<GraphRank title="LOAD" items={rankItems} max={100} {glyphs} />
				{/key}
			</div>
		</article>

		<article class="rule-plate">
			<div class="copy">
				<p class="idx">02</p>
				<h2>The frame is the brand.</h2>
				<p>
					Every graph sits in a dashed edge with a <span class="tok">[ TITLE ]</span> and corner
					marks. Swap the mark. Keep the discipline. The wrapper is Graph; compose with Body, Rule,
					Track, Tick.
				</p>
			</div>
			<div class="demo">
				<div class="controls" role="group" aria-label="Corner mark">
					{#each corners as mark (mark)}
						<button type="button" class="mark" aria-pressed={corner === mark} onclick={() => (corner = mark)}>
							[ {mark} ]
						</button>
					{/each}
					<span class="sep"></span>
					<button type="button" class="mark" aria-pressed={motion === 'march'} onclick={() => (motion = motion === 'march' ? 'none' : 'march')}>
						[ march ]
					</button>
				</div>
				<Graph title="FRAME" {corner} {motion}>
					<GraphBody>
						<p class="line">Graph · GraphBody · GraphRule · GraphTrack</p>
						<GraphRule />
						<p class="line dim">Dashed edge. [ TITLE ]. Corner marks. This is Graph.</p>
					</GraphBody>
				</Graph>
			</div>
		</article>

		<article class="rule-plate">
			<div class="copy">
				<p class="idx">03</p>
				<h2>One accent, on purpose.</h2>
				<p>
					Unused rows recede. Color is a decision. Default is <code>palette="mono"</code>. Pass
					<code>duo</code> or <code>multi</code> only when a second series earns its keep. Entrances
					stay under 220ms.
				</p>
			</div>
			<div class="demo">
				<div class="controls" role="group" aria-label="Palette">
					{#each palettes as p (p)}
						<button type="button" class="mark" aria-pressed={palette === p} onclick={() => (palette = p)}>
							[ {p} ]
						</button>
					{/each}
				</div>
				{#key palette}
					<GraphStack title="BUNDLE" rows={stackRows} {palette} />
				{/key}
			</div>
		</article>
	</div>

	<div class="dont">
		<article>
			<p class="eyebrow">[ do ]</p>
			<h3>Let unused rows go quiet.</h3>
			<p>
				Accent the current step, the amount due, the series that changed. Everything else stays
				muted ink on the dashed rail.
			</p>
		</article>
		<article>
			<p class="eyebrow">[ don't ]</p>
			<h3>Do not plot in SVG.</h3>
			<p>
				No canvas, no chart config object, no rainbow series. If it cannot be typed, it does not
				belong in the frame.
			</p>
		</article>
	</div>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 1.4rem;
	}

	.grammar {
		display: grid;
		gap: 1.4rem;
		padding-top: 0.4rem;
	}

	.rule-plate {
		display: grid;
		grid-template-columns: minmax(16rem, 0.9fr) minmax(0, 1.2fr);
		min-height: 280px;
		background-image:
			repeating-linear-gradient(to right, var(--graph-framer)),
			repeating-linear-gradient(to bottom, var(--graph-framer)),
			repeating-linear-gradient(to right, var(--graph-framer)),
			repeating-linear-gradient(to bottom, var(--graph-framer));
		background-repeat: repeat-x, repeat-y, repeat-x, repeat-y;
		background-position:
			0 0,
			100% 0,
			0 100%,
			0 0;
		background-size:
			100% 1px,
			1px 100%,
			100% 1px,
			1px 100%;
	}

	.copy {
		padding: 2rem 1.5rem 1.6rem;
		border-right: 1px dashed var(--border);
	}

	.idx {
		margin: 0 0 0.8rem;
		font-family: var(--font-sans);
		font-size: clamp(3.4rem, 8vw, 6.2rem);
		font-weight: 600;
		letter-spacing: -0.06em;
		line-height: 0.8;
		color: var(--text-muted);
	}

	.copy h2 {
		margin: 0 0 0.55rem;
		font-size: clamp(1.4rem, 2.4vw, 2rem);
	}

	.copy p:not(.idx) {
		max-width: 38ch;
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.88rem;
	}

	.copy code {
		color: var(--text-primary);
	}

	.tok {
		color: var(--graph-accent);
	}

	.demo {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1.2rem;
		min-width: 0;
		padding: 1.8rem 1.3rem;
		background: var(--bg-raised);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
	}

	.sep {
		width: 1px;
		height: 20px;
		margin-inline: 0.3rem;
		background: var(--border);
	}

	.mark {
		min-height: 32px;
		padding: 0 0.7rem;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		font: inherit;
		font-size: 0.62rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.mark:hover {
		color: var(--text-primary);
		border-color: var(--text-primary);
	}

	.mark[aria-pressed='true'] {
		color: var(--bg);
		background: var(--text-primary);
		border-color: var(--text-primary);
	}

	.line {
		margin: 0;
	}

	.line:first-child {
		margin-bottom: 0.75rem;
	}

	.dim {
		color: var(--text-secondary);
	}

	.dont {
		display: grid;
		grid-template-columns: 1fr 1fr;
		border: 1px dashed var(--border);
	}

	.dont article {
		padding: 1.3rem 1.2rem;
	}

	.dont article:first-child {
		border-right: 1px dashed var(--border);
	}

	.dont .eyebrow {
		margin: 0;
	}

	.dont h3 {
		margin: 0.35rem 0 0.4rem;
		font-family: var(--font-sans);
		font-size: 1.1rem;
		font-weight: 600;
		letter-spacing: -0.03em;
	}

	.dont p:not(.eyebrow) {
		max-width: 44ch;
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.85rem;
	}

	@media (max-width: 1024px) {
		.grammar {
			gap: 1rem;
		}

		.rule-plate,
		.dont {
			grid-template-columns: 1fr;
		}

		.rule-plate {
			min-height: 0;
		}

		.copy {
			padding: 1.4rem 1.1rem 1.2rem;
			border-right: 0;
			border-bottom: 1px dashed var(--border);
		}

		.demo {
			padding: 1.2rem 1rem;
			gap: 0.9rem;
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
