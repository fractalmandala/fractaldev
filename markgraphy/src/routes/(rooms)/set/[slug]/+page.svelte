<script lang="ts">
	// Component detail — /set/[slug]. Plate and source path on the left,
	// usage, props, and the way back to the set on the right. Mirrors the
	// docs [slug] logic (family, source path) in the rooms' comp layout.
	import { page } from '$app/state';
	import CopyCode from '$site/components/docs/copy-code.svelte';
	import PropsTable from '$site/components/docs/props-table.svelte';
	import { animatedComponents, getComponent } from '$site/docs/catalog';
	import { previews } from '$site/docs/previews';
	import { colorize } from '../../lib/colorize';

	const animatedSlugs = new Set(animatedComponents.map((entry) => entry.slug));

	const slug = $derived(page.params.slug ?? '');
	const entry = $derived(getComponent(slug));
	const entryPreview = $derived(entry ? (previews[entry.slug]?.[0] ?? undefined) : undefined);
	const usage = $derived(entryPreview ? colorize(entryPreview.code) : '');

	const family = $derived.by(() => {
		if (!entry) return '';
		if (entry.slug === 'graph-frame') return 'frame';
		if (animatedSlugs.has(entry.slug)) return 'animated';
		if (entry.slug.startsWith('graph-')) return 'graphs';
		return 'diagrams';
	});

	const sourcePath = $derived.by(() => {
		if (!entry) return '';
		if (entry.slug === 'graph-frame') return 'src/lib/frame/Graph.svelte';
		if (family === 'animated') return `src/lib/animated/${entry.name}.svelte`;
		if (family === 'diagrams') return `src/lib/diagram/${entry.name}.svelte`;
		return `src/lib/graphs/${entry.name}.svelte`;
	});
</script>

<svelte:head>
	<title>{entry ? `${entry.title} — markgraphy` : 'No such instrument — markgraphy'}</title>
	<meta name="description" content={entry?.description ?? 'Component detail.'} />
</svelte:head>

{#if entry}
	<section class="detail">
		<div class="page-head">
			<div>
				<p class="kicker">[ {family} · {entry.name} ]</p>
				<h1>{entry.title.toLowerCase()}</h1>
			</div>
			<p class="lede">{entry.description}</p>
		</div>

		<div class="comp-layout">
			<div class="comp-stage">
				<article class="plate">
					{#if entryPreview}
						{@const Comp = entryPreview.Comp}
						<div class="art">
							<Comp {...entryPreview.props} />
						</div>
					{:else}
						<p class="dim">No live preview — copy the usage.</p>
					{/if}
				</article>
				<p class="file-path">source <code>{sourcePath}</code></p>
			</div>

			<aside class="comp-side">
				{#if entryPreview}
					<div class="import-box">
						<header>
							<span>+page.svelte</span>
							<CopyCode text={entryPreview.code} label="copy" />
						</header>
						<pre>{@html usage}</pre>
					</div>
				{/if}
				<div>
					<p class="eyebrow props-label">[ props ]</p>
					<PropsTable rows={entry.props} />
				</div>
				<div class="cta-row">
					<a class="ghost" href="/set">Back to set</a>
				</div>
			</aside>
		</div>
	</section>
{:else}
	<section class="detail">
		<div class="page-head">
			<div>
				<p class="kicker">[ missing ]</p>
				<h1>No such instrument.</h1>
			</div>
			<p class="lede">The cabinet has no plate at this address.</p>
		</div>
		<div class="cta-row missing">
			<a class="ghost" href="/set">Back to set</a>
		</div>
	</section>
{/if}

<style>
	.detail {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: calc(100svh - 3.4rem);
		padding-bottom: 1.4rem;
	}

	.comp-layout {
		flex: 1;
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.85fr);
		border-left: 1px dashed var(--border);
		border-right: 1px dashed var(--border);
		min-height: 0;
	}

	.comp-stage {
		padding: 1.6rem 1.3rem 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	.plate {
		min-height: 320px;
		padding: 1.8rem 1.3rem 1.2rem;
		background: var(--bg-raised);
		display: grid;
		align-items: center;
	}

	.art {
		min-width: 0;
		width: min(100%, 52rem);
		margin: 0 auto;
		overflow-x: auto;
	}

	.file-path {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.75rem;
	}

	.file-path code {
		color: var(--text-primary);
	}

	.comp-side {
		border-left: 1px dashed var(--border);
		padding: 1.6rem 1.3rem 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		min-width: 0;
		background: #141414;
	}

	.props-label {
		margin: 0 0 0.55rem;
	}

	.missing {
		padding: 2rem 0 0;
	}

	@media (max-width: 1024px) {
		.comp-layout {
			grid-template-columns: 1fr;
		}

		.comp-stage {
			padding: 1.1rem 0.9rem 1rem;
			gap: 0.8rem;
		}

		.plate {
			min-height: 240px;
			padding: 1.2rem 0.9rem 1rem;
		}

		.comp-side {
			border-left: 0;
			border-top: 1px dashed var(--border);
			background: none;
			padding: 1.1rem 0.9rem 1rem;
			gap: 0.9rem;
		}
	}
</style>
