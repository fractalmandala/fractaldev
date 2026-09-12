<script lang="ts">
	// Room 01 — stage. The observatory: one instrument at a time in the
	// vitrine (real library component, marching frame), its dossier beside it,
	// the filmstrip beneath. Then the wall of live tiles, three principles,
	// and the close. j / k or arrows move through the strip.
	import { GraphActivity } from '$lib';
	import CopyCode from '$site/components/docs/copy-code.svelte';
	import { animatedComponents, staticComponents } from '$site/docs/catalog';
	import { previews } from '$site/docs/previews';
	import { instrumentPreview, instruments } from '$site/lib/instruments';
	import { GITHUB_URL } from '$site/lib/site';
	import { commits } from '$site/lib/wall';
	import { colorize } from '../lib/colorize';

	let current = $state(0);

	const instrument = $derived(instruments[current]);
	const preview = $derived(instrumentPreview(instrument));
	const usage = $derived(colorize(preview.code));
	const index = $derived(String(current + 1).padStart(2, '0'));
	const total = $derived(String(instruments.length).padStart(2, '0'));

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

<svelte:head>
	<title>markgraphy — charts drawn with characters</title>
	<meta
		name="description"
		content="Svelte components for tables, charts, and diagrams drawn with glyphs. Dashed frames, one accent, no SVG."
	/>
</svelte:head>

<section class="observatory">

	<div class="stage">
		<div class="vitrine">
			{#key current}
				<div class="live">
					<preview.Comp {...preview.props} />
				</div>
				<p class="caption">{instrument.caption}</p>
			{/key}
		</div>

		<aside class="dossier">
			<div class="meta-row">
				<span>Instrument <b>{index}</b> / {total}</span>
				<span>{instrument.kind}</span>
			</div>
			<dl class="spec-list">
				<div><dt>import</dt><dd>{instrument.component}</dd></div>
				<div><dt>draws</dt><dd>{instrument.draws}</dd></div>
				<div><dt>peer</dt><dd>Svelte 5 only</dd></div>
				<div><dt>engine</dt><dd>characters · no SVG</dd></div>
			</dl>
			<div class="import-box">
				<header>
					<span>usage</span>
					<CopyCode text={preview.code} label="copy code" />
				</header>
				<pre>{@html usage}</pre>
			</div>
		</aside>
	</div>

	<div class="film">
		<div class="film-label">select instrument · j / k</div>
		<div class="clips" role="listbox" aria-label="Instruments">
			{#each instruments as item, i (item.slug)}
				<button
					type="button"
					role="option"
					class="clip"
					class:active={i === current}
					aria-selected={i === current}
					onclick={() => mount(i)}
				>
					<pre class="mini">{item.thumb}</pre>
					<div class="name">[ {item.title} ]</div>
				</button>
			{/each}
		</div>
	</div>
</section>

<style>
	.observatory {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.stage {
		flex: 1;
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(18rem, 0.7fr);
		min-height: 0;
		border-left: 1px dashed var(--border);
		border-right: 1px dashed var(--border);
	}

	.vitrine {
		position: relative;
		min-width: 0;
		min-height: 420px;
		padding: 2.2rem 1.4rem 1.6rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.live {
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: thin;
	}

	/* The active instrument marches its frame. Reduced motion leaves it still. */
	@media (prefers-reduced-motion: no-preference) {
		.live :global(.graph) {
			animation: march 0.7s linear infinite;
		}
	}

	@keyframes march {
		to {
			background-position:
				8px 0,
				100% 8px,
				-8px 100%,
				0 -8px;
		}
	}

	.dossier {
		min-width: 0;
		border-left: 1px dashed var(--border);
		padding: 1.6rem 1.3rem 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 1.15rem;
		background: linear-gradient(180deg, #141414 0%, var(--bg) 100%);
	}

	.dossier :global(.import-box) {
		margin-top: auto;
	}

	.meta-row {
		display: flex;
		justify-content: space-between;
		color: var(--text-secondary);
		font-size: 0.68rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.meta-row b {
		color: var(--text-primary);
		font-weight: 500;
	}

	.spec-list {
		display: grid;
		gap: 0.55rem;
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.8rem;
	}

	.spec-list div {
		display: grid;
		grid-template-columns: 9ch 1fr;
		gap: 0.8rem;
		border-bottom: 1px dotted #2a2a2a;
		padding-bottom: 0.45rem;
	}

	dt {
		color: var(--text-muted);
	}

	dd {
		margin: 0;
		color: var(--text-primary);
	}

	.film {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.8rem;
		align-items: stretch;
		padding-top: 0.9rem;
	}

	.film-label {
		writing-mode: vertical-rl;
		transform: rotate(180deg);
		color: var(--text-secondary);
		letter-spacing: 0.18em;
		font-size: 0.62rem;
		text-transform: uppercase;
		display: grid;
		place-items: center;
		padding: 0.4rem 0;
	}

	.clips {
		display: flex;
		gap: 0.65rem;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		padding: 0.55rem 0.15rem 0.75rem;
		scrollbar-width: thin;
		scrollbar-color: var(--border) transparent;
	}

	.clip {
		position: relative;
		flex: 0 0 11.5rem;
		scroll-snap-align: start;
		text-align: left;
		border: 0;
		background-color: transparent;
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
		padding: 0.85rem 0.7rem 0.7rem;
		min-height: 96px;
		color: var(--text-secondary);
		font-family: var(--font-mono);
	}

	.clip:hover {
		color: var(--text-primary);
	}

	.clip.active,
	.clip[aria-selected='true'] {
		color: var(--graph-accent);
	}

	@media (prefers-reduced-motion: no-preference) {
		.clip.active {
			animation: march 0.7s linear infinite;
		}
	}

	.mini {
		height: 48px;
		margin: 0 0 0.55rem;
		overflow: hidden;
		font-size: 9px;
		line-height: 1.15;
		letter-spacing: 0.02em;
		white-space: pre;
		color: var(--text-secondary);
	}

	.clip.active .mini {
		color: var(--graph-accent);
	}

	.name {
		letter-spacing: 0.14em;
		font-size: 0.62rem;
		text-transform: uppercase;
	}

	.section {
		padding: 3.2rem 0 4rem;
		border-top: 1px dashed var(--border);
	}

	.section-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		max-width: var(--site-max);
		margin: 0 auto 1.6rem;
	}

	.section-head h2 {
		margin: 0;
		font-family: var(--font-sans);
		font-size: clamp(1.6rem, 3vw, 2.4rem);
		letter-spacing: -0.05em;
		font-weight: 600;
	}

	.section-head p {
		max-width: 42ch;
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.85rem;
	}

	.section-head a {
		color: var(--text-primary);
		border-bottom: 1px dotted var(--text-muted);
		text-decoration: none;
	}

	.section-head a:hover {
		color: var(--graph-accent);
		border-bottom-color: var(--graph-accent);
	}

	.wall {
		max-width: var(--site-max);
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: 1.1rem;
	}

	.tile {
		position: relative;
		min-width: 0;
		display: flex;
		flex-direction: column;
		background: var(--bg-raised);
		text-decoration: none;
		color: inherit;
	}

	.tile :global(.graph) {
		flex: 1;
	}

	.tile.span {
		grid-column: 1 / -1;
	}

	.scroll {
		min-width: 0;
		overflow-x: auto;
	}

	.open {
		position: absolute;
		right: 0.9rem;
		bottom: 0.45rem;
		z-index: 11;
		padding: 0 0.4rem;
		background: var(--bg-raised);
		color: var(--text-muted);
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		text-decoration: none;
	}

	.tile:hover .open {
		color: var(--graph-accent);
	}

	.principles {
		max-width: var(--site-max);
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border: 1px dashed var(--border);
	}

	.principle {
		padding: 1.6rem 1.3rem 1.5rem;
		border-right: 1px dashed var(--border);
	}

	.principle:last-child {
		border-right: 0;
	}

	.principle .idx {
		margin: 0 0 0.8rem;
		color: var(--graph-accent);
		letter-spacing: 0.16em;
		font-size: 0.66rem;
	}

	.principle h3 {
		margin: 0 0 0.55rem;
		font-family: var(--font-sans);
		font-size: 1.35rem;
		letter-spacing: -0.04em;
	}

	.principle p {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.85rem;
		max-width: 34ch;
	}

	.close {
		max-width: var(--site-max);
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1.3fr 0.7fr;
		gap: 2rem;
		align-items: end;
	}

	.close h2 {
		margin: 0.4rem 0 1rem;
		font-family: var(--font-sans);
		font-size: clamp(2rem, 5vw, 4.2rem);
		letter-spacing: -0.07em;
		line-height: 0.9;
	}

	.close-meta {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.8rem;
	}

	@media (max-width: 1024px) {
		.stage {
			grid-template-columns: 1fr;
		}

		.vitrine {
			min-height: 320px;
			padding: 1.5rem 1.1rem 1.2rem;
		}

		.dossier {
			border-left: 0;
			border-top: 1px dashed var(--border);
			padding: 1.2rem 1.1rem 1.1rem;
			gap: 0.9rem;
		}

		.section {
			padding: 2.2rem 0 2.6rem;
		}

		.section-head {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.55rem;
		}

		.wall {
			grid-template-columns: 1fr;
			gap: 0.9rem;
		}

		.tile {
			overflow-x: auto;
			scrollbar-width: thin;
		}

		.principles {
			grid-template-columns: 1fr;
		}

		.principle {
			padding: 1.2rem 1.1rem 1.1rem;
			border-right: 0;
			border-bottom: 1px dashed var(--border);
		}

		.principle:last-child {
			border-bottom: 0;
		}

		.close {
			grid-template-columns: 1fr;
			gap: 1.2rem;
		}
	}

	@media (max-width: 560px) {
		.vitrine {
			min-height: 260px;
		}

		.film {
			grid-template-columns: 1fr;
			gap: 0.4rem;
		}

		.film-label {
			writing-mode: horizontal-tb;
			transform: none;
			padding: 0;
		}
	}
</style>
