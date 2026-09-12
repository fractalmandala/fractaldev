<script lang="ts">
	import type { DocsNavSection } from './types.js';
	import { nodeContainsPath, sectionShouldOpen } from './nav.js';
	import { normalizePath } from './nav-path.js';
	import DocsNavTree from './DocsNavTree.svelte';

	// Top-level collapsible section of the sidebar. Shares the nav-group visual
	// language with DocsNavTree so sections and nested groups read as one tree.
	type Props = {
		section: DocsNavSection;
		pathname: string;
		openMap: Record<string, boolean>;
		onToggle: (id: string, open: boolean) => void;
		/** Force open (e.g. while filtering) */
		forceOpen?: boolean;
	};

	let { section, pathname, openMap, onToggle, forceOpen = false }: Props = $props();

	const hasActive = $derived(
		Boolean(section.href && normalizePath(section.href) === normalizePath(pathname)) ||
			section.items.some((i) => nodeContainsPath(i, pathname))
	);

	const isOpen = $derived(
		forceOpen
			? true
			: openMap[section.id] !== undefined
				? openMap[section.id]!
				: sectionShouldOpen(section, pathname)
	);

	const titleActive = $derived(
		Boolean(section.href) && normalizePath(section.href!) === normalizePath(pathname)
	);

	function handleToggle(e: Event) {
		const el = e.currentTarget as HTMLDetailsElement;
		onToggle(section.id, el.open);
	}
</script>

<details
	class="acrolls-docs-nav-group"
	class:is-active-branch={hasActive}
	open={isOpen}
	ontoggle={handleToggle}
>
	<summary class="acrolls-docs-nav-summary">
		{#if section.href}
			<a
				class="acrolls-docs-nav-group-title"
				class:is-active={titleActive}
				href={section.href}
				aria-current={titleActive ? 'page' : undefined}
				onclick={(event) => event.stopPropagation()}
			>
				{section.title}
			</a>
		{:else}
			<span class="acrolls-docs-nav-group-title">{section.title}</span>
		{/if}
		{#if section.badge}
			<span class="acrolls-docs-nav-badge">{section.badge}</span>
		{/if}
		<span class="acrolls-docs-nav-chevron" aria-hidden="true"></span>
	</summary>
	<div class="acrolls-docs-nav-body">
		<DocsNavTree nodes={section.items} {pathname} {openMap} {onToggle} {forceOpen} />
	</div>
</details>
