<script lang="ts">
	// Installation: the bench. Three stations, a live row, the token bay.
	import { GraphStat } from '$lib';
	import CodeBlock from '$site/components/docs/code-block.svelte';
	import Install from '$site/components/docs/install.svelte';
	import PageHeader from '$site/components/docs/page-header.svelte';
	import { ACCENT_CODE, LAYOUT_CODE, PAGE_CODE, SVX_CODE } from '$site/docs/install-code';
	import { SITE_NAME } from '$site/lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const tokens = [
		['--graph-accent', 'The one highlight. Default Svelte orange.'],
		['--graph-accent-2', 'Second series when palette is duo or multi.'],
		['--graph-accent-3', 'Third cycle. Leave it alone unless earned.'],
		['--border', 'Dashed edge color. Keep it quieter than ink.'],
		['--graph-framer', 'The dash pattern itself: on-length, off-length.'],
		['--text-primary', 'Primary ink inside the frame.'],
		['--bg', 'What the title and corners knock out of the edge.'],
		['--text-secondary', 'Unused rows, captions, the receding path.'],
		['--text-muted', 'Empty cells and the quietest glyphs.']
	];
</script>

<svelte:head>
	<title>Installation — {SITE_NAME}</title>
	<meta
		name="description"
		content="Install markgraphy: add the package, import the theme once, drop a graph in a page or .svx file, and override the accent with CSS variables."
	/>
</svelte:head>

<div class="page">
	<PageHeader
		title="Put a graph next to the prose."
		kicker="install"
		lead="One npm package: the graphs, the shared frame, and one optional stylesheet. Svelte 5 is the only peer. Theming is nine CSS variables."
	/>

	<div class="bench">
		<article class="station on">
			<p class="st-num">[ station 01 ]</p>
			<h2>Add the package.</h2>
			<p>Graphs, frame, and theme in one install. No extra chart runtime.</p>
			<Install />
		</article>
		<article class="station">
			<p class="st-num">[ station 02 ]</p>
			<h2>Import the theme once.</h2>
			<p>
				In the root <code>+layout.svelte</code>. Dark by default, one accent. The header dots on
				this site do the same override at runtime.
			</p>
			<CodeBlock code={LAYOUT_CODE} html={data.layout} heading="+layout.svelte" />
		</article>
		<article class="station">
			<p class="st-num">[ station 03 ]</p>
			<h2>Drop a graph.</h2>
			<p>
				Import any graph from <code>markgraphy</code> and pass data as props. The frame, the
				title, and the drawing come with it.
			</p>
			<CodeBlock code={PAGE_CODE} html={data.page} heading="+page.svelte" label="copy" />
		</article>
	</div>

	<div class="live-row">
		<div class="plate">
			<GraphStat
				title="THIS WEEK"
				items={[
					{ value: '12,400', label: 'docs' },
					{ value: '4,100', label: 'copies' },
					{ value: '860', label: 'shipped', accent: true }
				]}
			/>
		</div>
		<div class="svx">
			<p class="eyebrow">[ markdown ]</p>
			<h3>Use in a .svx file</h3>
			<p class="ghost-p">
				Add a script importing the component, then place it between paragraphs. The frame spans
				the text column.
			</p>
			<CodeBlock code={SVX_CODE} html={data.svx} heading="post.svx" />
		</div>
	</div>

	<section class="tokens">
		<p class="eyebrow">[ tokens ]</p>
		<div class="token-bay">
			{#each tokens as [name, note] (name)}
				<div class="token">
					<code>{name}</code>
					<p>{note}</p>
				</div>
			{/each}
		</div>
		<CodeBlock code={ACCENT_CODE} html={data.accent} heading="app.css" />
	</section>

	<section class="block">
		<h2>Palette and glyphs</h2>
		<p>
			Drawing graphs take a <code>palette</code>: <code>mono</code> (the default),
			<code>duo</code>, or <code>multi</code>, mapped onto the accent variables above. Most also take
			<code>glyphs</code>: a preset (<code>shade</code>, <code>ascii</code>, <code>hash</code>,
			<code>bar</code>) or an array of characters, one per step. Table, Invoice, Spec, Stat, Tree, and
			the Frame stay plain. <a href="/docs/rules">Operate the grammar →</a>
		</p>
	</section>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 1.4rem;
	}

	.bench {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border-left: 1px dashed var(--border);
		border-right: 1px dashed var(--border);
	}

	.station {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		min-width: 0;
		min-height: 280px;
		padding: 1.5rem 1.2rem 1.4rem;
		border-right: 1px dashed var(--border);
	}

	.station:last-child {
		border-right: 0;
	}

	.station.on {
		background: color-mix(in oklab, var(--graph-accent) 6%, var(--bg));
	}

	.st-num {
		margin: 0;
		color: var(--text-muted);
		letter-spacing: 0.16em;
		font-size: 0.66rem;
		text-transform: uppercase;
	}

	.station h2 {
		font-size: 1.45rem;
	}

	.station p:not(.st-num) {
		max-width: 36ch;
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.85rem;
	}

	.station code,
	.block code {
		color: var(--text-primary);
	}

	.live-row {
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: 1rem;
	}

	.plate {
		display: grid;
		align-items: center;
		min-width: 0;
		padding: 1.8rem 1.3rem 1.2rem;
		background: var(--bg-raised);
	}

	.svx {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
		padding: 1.3rem 1.2rem;
		border: 1px dashed var(--border);
	}

	.svx .eyebrow {
		margin: 0;
	}

	.svx h3 {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 1.2rem;
		font-weight: 600;
		letter-spacing: -0.03em;
	}

	.ghost-p {
		margin: 0 0 0.5rem;
		color: var(--text-secondary);
		font-size: 0.85rem;
	}

	.tokens {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		padding-top: 0.6rem;
	}

	.tokens .eyebrow {
		margin: 0;
	}

	.token-bay {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border: 1px dashed var(--border);
	}

	.token {
		padding: 0.9rem 1rem;
		border-right: 1px dashed var(--border);
		border-bottom: 1px dashed var(--border);
	}

	.token:nth-child(3n) {
		border-right: 0;
	}

	.token:nth-last-child(-n + 3) {
		border-bottom: 0;
	}

	.token code {
		color: var(--text-primary);
		font-size: 0.78rem;
	}

	.token p {
		margin: 0.3rem 0 0;
		color: var(--text-secondary);
		font-size: 0.75rem;
	}

	.block {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		padding-top: 0.6rem;
	}

	.block p {
		max-width: 62ch;
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.88rem;
	}

	.block a {
		color: var(--text-primary);
		text-decoration: none;
		border-bottom: 1px dotted var(--text-muted);
	}

	@media (max-width: 1024px) {
		.bench,
		.live-row {
			grid-template-columns: 1fr;
		}

		.station {
			border-right: 0;
			border-bottom: 1px dashed var(--border);
			min-height: 0;
			padding: 1.2rem 1rem 1.1rem;
			gap: 0.7rem;
		}

		.station h2 {
			font-size: 1.3rem;
		}

		.station:last-child {
			border-bottom: 0;
		}

		.plate {
			padding: 1.3rem 1rem 1.1rem;
		}

		.svx {
			padding: 1rem;
		}

		.token-bay {
			grid-template-columns: 1fr 1fr;
		}

		.token {
			padding: 0.75rem 0.85rem;
		}

		.token:nth-child(3n) {
			border-right: 1px dashed var(--border);
		}

		.token:nth-child(2n) {
			border-right: 0;
		}

		.token:nth-last-child(-n + 3) {
			border-bottom: 1px dashed var(--border);
		}
	}
</style>
