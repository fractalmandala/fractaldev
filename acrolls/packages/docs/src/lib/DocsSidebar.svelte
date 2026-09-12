<script lang="ts">
	import type { DocsNav, DocsNavNode, DocsNavSection } from './types.js';
	import DocsAccordion from './DocsAccordion.svelte';
	import { navStorageKey, withNavIds } from './nav.js';
	import { readOpenState, writeOpenState } from './storage.js';
	import { browser } from './browser.js';
	import { onMount } from 'svelte';

	type Props = {
		nav: DocsNav;
		pathname: string;
		filterable?: boolean;
		/** Persist accordion open state in localStorage (default true) */
		persistOpen?: boolean;
		class?: string;
	};

	let {
		nav: navIn,
		pathname,
		filterable = false,
		persistOpen = true,
		class: className = ''
	}: Props = $props();

	const nav = $derived(withNavIds(navIn));
	const storageKey = $derived(navStorageKey(nav));

	let query = $state('');
	let openMap = $state<Record<string, boolean>>({});
	let hydrated = $state(false);

	onMount(() => {
		if (persistOpen) {
			openMap = readOpenState(storageKey);
		}
		hydrated = true;
	});

	// re-read if storage key changes (nav switch user ↔ developer)
	$effect(() => {
		const key = storageKey;
		if (!browser || !persistOpen || !hydrated) return;
		openMap = readOpenState(key);
	});

	const q = $derived(query.trim().toLowerCase());

	function filterNodes(nodes: DocsNavNode[]): DocsNavNode[] {
		if (!q) return nodes;
		const out: DocsNavNode[] = [];
		for (const n of nodes) {
			const selfMatch =
				n.title.toLowerCase().includes(q) ||
				(n.description?.toLowerCase().includes(q) ?? false);
			const kids = n.children ? filterNodes(n.children) : [];
			if (selfMatch || kids.length) {
				out.push({
					...n,
					children: kids.length ? kids : n.children,
					// expand groups that matched while filtering
					defaultOpen: true
				});
			}
		}
		return out;
	}

	const visibleSections = $derived.by((): DocsNavSection[] => {
		return nav.sections
			.map((section) => {
				if (!q) return section;
				const items = filterNodes(section.items);
				if (!items.length && !section.title.toLowerCase().includes(q)) return null;
				return {
					...section,
					items: items.length ? items : section.items,
					defaultOpen: true
				};
			})
			.filter((s): s is DocsNavSection => s != null);
	});

	function onToggle(id: string, open: boolean) {
		if (persistOpen) {
			openMap = writeOpenState(storageKey, id, open);
		} else {
			openMap = { ...openMap, [id]: open };
		}
	}
</script>

<div class={['acrolls-docs-sidebar', className].filter(Boolean).join(' ')}>
	<div class="acrolls-docs-sidebar-brand">
		<a class="acrolls-docs-sidebar-title" href={nav.baseHref}>{nav.title}</a>
		{#if nav.subtitle}
			<p class="acrolls-docs-sidebar-subtitle">{nav.subtitle}</p>
		{/if}
	</div>

	{#if filterable}
		<label class="acrolls-docs-sidebar-filter">
			<span class="visually-hidden">Filter navigation</span>
			<input type="search" placeholder="Filter pages…" bind:value={query} autocomplete="off" />
		</label>
	{/if}

	<nav class="acrolls-docs-sidebar-nav" aria-label="{nav.title} sections">
		{#each visibleSections as section (section.id)}
			<DocsAccordion
				{section}
				{pathname}
				{openMap}
				{onToggle}
				forceOpen={Boolean(q)}
			/>
		{:else}
			<p class="acrolls-docs-sidebar-empty">No matching pages.</p>
		{/each}
	</nav>
</div>
