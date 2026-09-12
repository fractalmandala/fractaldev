<script lang="ts">
	// Room 02 — set. The cabinet: family tabs and a find field on the index
	// rail, one live specimen plate on the right. Hover or arrow through the
	// list; the plate mounts the real component from the docs previews.
	// "Open page" leads to the component detail at /set/[slug].
	import CopyCode from '$site/components/docs/copy-code.svelte';
	import {
		animatedComponents,
		components,
		type ComponentDoc
	} from '$site/docs/catalog';
	import { previews } from '$site/docs/previews';
	import { colorize } from '../lib/colorize';

	type Family = 'all' | 'graphs' | 'animated' | 'diagrams' | 'frame';

	const families: Family[] = ['all', 'graphs', 'animated', 'diagrams', 'frame'];

	const animatedSlugs = new Set(animatedComponents.map((entry) => entry.slug));

	function familyOf(entry: ComponentDoc): Exclude<Family, 'all'> {
		if (entry.slug === 'graph-frame') return 'frame';
		if (animatedSlugs.has(entry.slug)) return 'animated';
		if (entry.name.endsWith('Diagram')) return 'diagrams';
		return 'graphs';
	}

	let fam = $state<Family>('all');
	let query = $state('');
	let index = $state(0);

	const visible = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return components.filter(
			(entry) =>
				(fam === 'all' || familyOf(entry) === fam) &&
				(!q || `${entry.title} ${entry.name} ${entry.description}`.toLowerCase().includes(q))
		);
	});

	const active = $derived(visible[Math.min(index, Math.max(visible.length - 1, 0))]);
	const activePreview = $derived(active ? (previews[active.slug]?.[0] ?? undefined) : undefined);
	const meta = $derived(active ? `${familyOf(active)} · ${active.name}` : '');
	const usage = $derived.by(() => {
		if (!active) return '';
		const code =
			activePreview?.code ??
			`import { ${active.name} } from 'markgraphy';\n\n<${active.name} title="${active.title.toUpperCase()}" />`;
		return colorize(code);
	});

	function setFamily(next: Family) {
		fam = next;
		query = '';
		index = 0;
	}

	function onfind(event: Event & { currentTarget: HTMLInputElement }) {
		query = event.currentTarget.value;
		index = 0;
	}

	function onkeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement | null;
		if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
			return;
		}
		if (event.metaKey || event.ctrlKey || event.altKey) {
			return;
		}
		if (event.key === 'j' || event.key === 'ArrowDown') {
			event.preventDefault();
			if (visible.length) index = (index + 1) % visible.length;
		} else if (event.key === 'k' || event.key === 'ArrowUp') {
			event.preventDefault();
			if (visible.length) index = (index - 1 + visible.length) % visible.length;
		}
	}
</script>

<svelte:window {onkeydown} />

<svelte:head>
	<title>The set — markgraphy</title>
	<meta name="description" content="A cabinet of instruments: every graph, animation, and diagram in the library." />
</svelte:head>

<section class="set">
	<div class="page-head">
		<div>
			<p class="kicker">[ the set ]</p>
			<h1>A cabinet<br />of instruments.</h1>
		</div>
		<p class="lede">
			Hover a name. <strong>Open page</strong> for the Svelte component. The plate is the specimen.
		</p>
	</div>

	<div class="cabinet">
		<aside class="index">
			<div class="index-tools">
				<input
					class="find"
					type="search"
					placeholder="find a graph…"
					aria-label="Find a graph"
					value={query}
					oninput={onfind}
				/>
				<div class="tabs" role="group" aria-label="Family">
					{#each families as id (id)}
						<button
							type="button"
							class="tab"
							aria-pressed={fam === id}
							onclick={() => setFamily(id)}
						>
							[ {id} ]
						</button>
					{/each}
				</div>
			</div>
			<div class="index-list" role="listbox" aria-label="Specimens">
				{#each visible as entry, i (entry.slug)}
					<button
						type="button"
						role="option"
						class="spec-btn"
						aria-selected={i === index}
						onmouseenter={() => (index = i)}
						onclick={() => (index = i)}
					>
						<span>{entry.title.toLowerCase()}</span>
						<span class="fam">{familyOf(entry)}</span>
					</button>
				{:else}
					<p class="dim empty">No match.</p>
				{/each}
			</div>
		</aside>

		<div class="plate-wrap">
			<article class="plate">
				{#if active && activePreview}
					{@const Comp = activePreview.Comp}
					<div class="art">
						<Comp {...activePreview.props} />
					</div>
				{:else if active}
					<p class="dim">No live preview — copy the usage below.</p>
				{/if}
			</article>
			<div class="import-box">
				<header>
					<span>{meta}</span>
					{#if active}
						<a class="ghost" href={`/set/${active.slug}`}>Open page</a>
					{/if}
				</header>
				<pre>{@html usage}</pre>
			</div>
		</div>
	</div>
</section>

<style>
	.set {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: calc(100svh - 3.4rem);
		padding-bottom: 1.4rem;
	}

	.cabinet {
		flex: 1;
		display: grid;
		grid-template-columns: 17rem minmax(0, 1fr);
		min-height: 0;
	}

	.index {
		border-right: 1px dashed var(--border);
		padding: 0.9rem 0.85rem 1.2rem;
		overflow: auto;
		max-height: calc(100svh - 14rem);
	}

	.index-tools {
		display: grid;
		gap: 0.7rem;
		margin-bottom: 0.9rem;
	}

	.find {
		width: 100%;
		background: transparent;
		border: 0;
		border-bottom: 1px dashed var(--border);
		padding: 0.55rem 0;
		color: var(--text-primary);
		min-height: 44px;
	}

	.find::placeholder {
		color: var(--text-muted);
	}

	.tabs {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}

	.tab {
		color: var(--text-secondary);
		padding: 0 0.7rem;
		min-height: 36px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		font-size: 0.62rem;
		border: 1px solid var(--border);
		background: transparent;
	}

	.tab:hover {
		color: var(--text-primary);
		border-color: var(--text-primary);
	}

	.tab[aria-pressed='true'] {
		color: var(--bg);
		background: var(--text-primary);
		border-color: var(--text-primary);
	}

	.index-list {
		display: grid;
	}

	.spec-btn {
		width: 100%;
		text-align: left;
		background: transparent;
		border: 0;
		border-bottom: 1px dotted #2a2a2a;
		padding: 0.42rem 0.35rem;
		color: var(--text-secondary);
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.6rem;
		min-height: 36px;
	}

	.spec-btn:hover {
		color: var(--text-primary);
	}

	.spec-btn[aria-selected='true'] {
		color: var(--graph-accent);
	}

	.spec-btn .fam {
		color: var(--text-muted);
		font-size: 0.62rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.empty {
		margin: 0;
		padding: 0.6rem 0.35rem;
	}

	.plate-wrap {
		padding: 1.6rem 1.3rem 1.3rem;
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

	@media (max-width: 1024px) {
		.cabinet {
			grid-template-columns: 1fr;
		}

		.index {
			max-height: 14rem;
			padding: 0.7rem 0.75rem 0.9rem;
			border-right: 0;
			border-bottom: 1px dashed var(--border);
		}

		.plate-wrap {
			padding: 1.1rem 0.9rem 1rem;
			gap: 0.8rem;
		}

		.plate {
			min-height: 240px;
			padding: 1.2rem 0.9rem 1rem;
		}
	}
</style>
