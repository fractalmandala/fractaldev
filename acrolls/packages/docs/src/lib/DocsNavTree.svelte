<script lang="ts">
	import type { DocsNavNode } from './types.js';
	import { nodeContainsPath, nodeShouldOpen } from './nav.js';
	import { normalizePath } from './nav-path.js';
	import DocsNavTree from './DocsNavTree.svelte';

	type Props = {
		nodes: DocsNavNode[];
		pathname: string;
		depth?: number;
		/** Map of id → open override (from storage + user toggles) */
		openMap: Record<string, boolean>;
		onToggle: (id: string, open: boolean) => void;
		/** Force all groups open (e.g. while filtering) */
		forceOpen?: boolean;
	};

	let { nodes, pathname, depth = 0, openMap, onToggle, forceOpen = false }: Props = $props();

	function isActive(node: DocsNavNode): boolean {
		return Boolean(node.href && normalizePath(node.href) === normalizePath(pathname));
	}

	function isOpen(node: DocsNavNode): boolean {
		if (forceOpen) return true;
		const id = node.id ?? '';
		if (id && openMap[id] !== undefined) return openMap[id]!;
		return nodeShouldOpen(node, pathname);
	}

	function handleToggle(e: Event, id: string) {
		const el = e.currentTarget as HTMLDetailsElement;
		onToggle(id, el.open);
	}
</script>

<ul class="acrolls-docs-nav-list" class:is-nested={depth > 0} role="list" data-depth={depth}>
	{#each nodes as node (node.id ?? node.href ?? node.title)}
		<li class="acrolls-docs-nav-item">
			{#if node.children?.length}
				<details
					class="acrolls-docs-nav-group"
					class:is-active-branch={nodeContainsPath(node, pathname)}
					open={isOpen(node)}
					ontoggle={(e) => node.id && handleToggle(e, node.id)}
				>
					<summary class="acrolls-docs-nav-summary">
						{#if node.href}
							<a
								class="acrolls-docs-nav-group-title"
								class:is-active={isActive(node)}
								href={node.href}
								aria-current={isActive(node) ? 'page' : undefined}
								onclick={(e) => e.stopPropagation()}
							>
								{node.title}
							</a>
						{:else}
							<span class="acrolls-docs-nav-group-title">{node.title}</span>
						{/if}
						{#if node.badge}
							<span class="acrolls-docs-nav-badge">{node.badge}</span>
						{/if}
						<span class="acrolls-docs-nav-chevron" aria-hidden="true"></span>
					</summary>
					<div class="acrolls-docs-nav-body">
						<DocsNavTree
							nodes={node.children}
							{pathname}
							depth={depth + 1}
							{openMap}
							{onToggle}
							{forceOpen}
						/>
					</div>
				</details>
			{:else if node.href}
				<a
					class="acrolls-docs-nav-link"
					class:is-active={isActive(node)}
					href={node.href}
					aria-current={isActive(node) ? 'page' : undefined}
				>
					<span class="acrolls-docs-nav-link-text">{node.title}</span>
					{#if node.badge}
						<span class="acrolls-docs-nav-badge">{node.badge}</span>
					{/if}
				</a>
			{:else}
				<span class="acrolls-docs-nav-label">{node.title}</span>
			{/if}
		</li>
	{/each}
</ul>
