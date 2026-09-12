<script lang="ts">
	import { page } from '$app/state';
	import {
		animatedComponents,
		components,
		getStarted,
		rooms,
		staticComponents
	} from '$site/docs/catalog';

	/**
	 * rail   — the cabinet index for ≥1024px (sticky, scrolls internally).
	 * mobile — a horizontal strip of [ chips ] for small screens.
	 */
	let { variant = 'rail' }: { variant?: 'rail' | 'mobile' } = $props();

	const path = $derived(page.url.pathname);

	let query = $state('');

	const graphs = staticComponents.filter((item) => item.slug.startsWith('graph-'));
	const diagrams = staticComponents.filter((item) => !item.slug.startsWith('graph-'));

	const groups = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const match = (title: string, slug: string) =>
			!q || title.toLowerCase().includes(q) || slug.includes(q);
		return [
			{
				label: 'get started',
				items: getStarted
					.filter((item) => match(item.label, item.href))
					.map((item) => ({ href: item.href, label: item.label, fam: '' }))
					.sort((a, b) => a.label.localeCompare(b.label))
			},
			{
				label: 'rooms',
				items: rooms
					.filter((item) => match(item.label, item.href))
					.map((item) => ({ href: item.href, label: item.label, fam: 'room' }))
					.sort((a, b) => a.label.localeCompare(b.label))
			},
			{
				label: 'graphs',
				items: graphs
					.filter((item) => match(item.title, item.slug))
					.map((item) => ({ href: `/docs/${item.slug}`, label: item.title, fam: 'graph' }))
					.sort((a, b) => a.label.localeCompare(b.label))
			},
			{
				label: 'animated',
				items: [
					{ href: '/docs/animations', label: 'All animations', fam: 'page' },
					...animatedComponents
						.filter((item) => match(item.title, item.slug))
						.map((item) => ({ href: `/docs/${item.slug}`, label: item.title, fam: 'anim' }))
				]
					.sort((a, b) => a.label.localeCompare(b.label))
			},
			{
				label: 'diagrams',
				items: diagrams
					.filter((item) => match(item.title, item.slug))
					.map((item) => ({ href: `/docs/${item.slug}`, label: item.title, fam: 'diagram' }))
					.sort((a, b) => a.label.localeCompare(b.label))
			}
		].filter((group) => group.items.length > 0);
	});

	const stripLinks = $derived([
		...getStarted.map((item) => ({ href: item.href, label: item.label })),
		...rooms.map((item) => ({ href: item.href, label: item.label })),
		{ href: '/docs/animations', label: 'Animations' },
		...components.map((item) => ({ href: `/docs/${item.slug}`, label: item.title }))
	]);
</script>

{#if variant === 'rail'}
	<aside class="index">
		<div class="scroll">
			<input
				class="find"
				type="search"
				placeholder="find a graph…"
				aria-label="Find a graph"
				bind:value={query}
			/>
			<nav class="nav" aria-label="Docs">
				{#each groups as group (group.label)}
					<div class="group">
						<p class="eyebrow">[ {group.label} ]</p>
						<ul role="list">
							{#each group.items as item (item.href)}
								<li>
									<a
										class="spec"
										class:active={path === item.href}
										aria-current={path === item.href ? 'page' : undefined}
										href={item.href}
									>
										<span class="trim">{item.label}</span>
										{#if item.fam}<span class="fam">{item.fam}</span>{/if}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</nav>
		</div>
	</aside>
{:else}
	<nav class="strip" aria-label="Docs">
		<div class="row">
			{#each stripLinks as item (item.href)}
				<a
					class="chip"
					class:active={path === item.href}
					aria-current={path === item.href ? 'page' : undefined}
					href={item.href}
				>
					[ {item.label} ]
				</a>
			{/each}
		</div>
	</nav>
{/if}

<style>
	/* --- Cabinet index (desktop) --- */

	.index {
		display: none;
	}

	@media (min-width: 1024px) {
		.index {
			display: block;
			position: sticky;
			top: 3.6rem;
			align-self: start;
			border-right: 1px dashed var(--border);
		}
	}

	.scroll {
		max-height: calc(100dvh - 3.6rem);
		overflow-y: auto;
		padding: 0.9rem 0.85rem 1.2rem;
		scrollbar-width: thin;
		scrollbar-color: var(--border) transparent;
	}

	.find {
		width: 100%;
		min-height: 40px;
		padding: 0.45rem 0;
		background: transparent;
		border: 0;
		border-bottom: 1px dashed var(--border);
		color: var(--text-primary);
		font: inherit;
	}

	.find::placeholder {
		color: var(--text-muted);
	}

	.find:focus-visible {
		outline: none;
		border-bottom-color: var(--graph-accent);
	}

	.nav {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		padding-top: 0.9rem;
	}

	.group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.group .eyebrow {
		margin: 0 0 0.25rem 0.35rem;
		color: var(--graph-accent);
	}

	.group ul {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.spec {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.6rem;
		min-height: 34px;
		align-items: center;
		padding: 0.3rem 0.35rem;
		border-bottom: 1px dotted #2a2a2a;
		font-size: 0.82rem;
		color: var(--text-secondary);
		text-decoration: none;
	}

	.spec:hover {
		color: var(--text-primary);
	}

	.spec.active {
		color: var(--graph-accent);
	}

	.trim {
		min-width: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.fam {
		color: var(--text-muted);
		font-size: 0.62rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.spec.active .fam {
		color: var(--text-secondary);
	}

	/* --- Mobile strip --- */

	.strip {
		position: relative;
		border-bottom: 1px dashed var(--border);
	}

	@media (min-width: 1024px) {
		.strip {
			display: none;
		}
	}

	.row {
		display: flex;
		gap: 0.15rem;
		padding-block: 0.55rem;
		overflow-x: auto;
		white-space: nowrap;
		scrollbar-width: thin;
		scrollbar-color: var(--border) transparent;
	}

	.chip {
		flex-shrink: 0;
		padding: 0.35rem 0.5rem;
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-secondary);
		text-decoration: none;
	}

	.chip:hover {
		color: var(--text-primary);
	}

	.chip.active {
		color: var(--graph-accent);
	}
</style>
