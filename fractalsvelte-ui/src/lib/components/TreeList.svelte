<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luChevronRight } from 'fractalicons/lucide';

	export interface TreeNode {
		id: string;
		label: string;
		children?: TreeNode[];
		leading?: import('svelte').Snippet;
		defaultOpen?: boolean;
	}

	interface Props {
		items: TreeNode[];
		/** Selected node id (single select). */
		selectedId?: string;
		onSelectedChange?: (id: string) => void;
		label?: string;
		class?: string;
	}

	let {
		items,
		selectedId = $bindable(''),
		onSelectedChange,
		label = 'Tree',
		class: className = ''
	}: Props = $props();

	const rootClass = $derived(['k-tree', className].filter(Boolean).join(' '));

	function collectDefault(node: TreeNode): string[] {
		const out: string[] = [];
		if (node.defaultOpen) out.push(node.id);
		for (const child of node.children ?? []) out.push(...collectDefault(child));
		return out;
	}

	// svelte-ignore state_referenced_locally — default-open state is intentionally captured once on mount
	let openIds = $state<Set<string>>(new Set(items.flatMap((n) => collectDefault(n))));

	function isOpen(id: string) {
		return openIds.has(id);
	}

	function toggle(id: string) {
		openIds = new Set(openIds);
		if (openIds.has(id)) openIds.delete(id);
		else openIds.add(id);
	}

	function select(id: string) {
		selectedId = id;
		onSelectedChange?.(id);
	}

	// Flatten visible nodes for arrow-key navigation
	const flat = $derived.by(() => {
		const out: string[] = [];
		const walk = (nodes: TreeNode[]) => {
			for (const n of nodes) {
				out.push(n.id);
				if (n.children && isOpen(n.id)) walk(n.children);
			}
		};
		walk(items);
		return out;
	});

	function findNode(nodes: TreeNode[], id: string): TreeNode | undefined {
		for (const n of nodes) {
			if (n.id === id) return n;
			const found = n.children ? findNode(n.children, id) : undefined;
			if (found) return found;
		}
		return undefined;
	}

	function onKeydown(e: KeyboardEvent) {
		const idx = flat.indexOf(selectedId);
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const next = flat[Math.min(flat.length - 1, idx + 1)];
			if (next) select(next);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const next = flat[Math.max(0, idx - 1)];
			if (next) select(next);
		} else if (e.key === 'ArrowRight') {
			const node = findNode(items, selectedId);
			if (node?.children?.length && !isOpen(selectedId)) {
				e.preventDefault();
				toggle(selectedId);
			}
		} else if (e.key === 'ArrowLeft') {
			const node = findNode(items, selectedId);
			if (node?.children?.length && isOpen(selectedId)) {
				e.preventDefault();
				toggle(selectedId);
			}
		}
	}
</script>

{#snippet renderNode(node: TreeNode, depth: number)}
	<div class="k-tree-item">
		<div
			class="k-tree-row"
			style={`--k-tree-depth:${depth}`}
			role="treeitem"
			aria-expanded={node.children?.length ? isOpen(node.id) : undefined}
			aria-selected={selectedId === node.id}
			tabindex="0"
			onclick={() => select(node.id)}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					if (node.children?.length) toggle(node.id);
					else select(node.id);
				}
			}}
		>
			{#if node.children?.length}
				<button
					type="button"
					class="k-tree-chevron"
					data-state={isOpen(node.id) ? 'open' : undefined}
					aria-label={isOpen(node.id) ? `Collapse ${node.label}` : `Expand ${node.label}`}
					onclick={(e) => {
						e.stopPropagation();
						toggle(node.id);
					}}
				>
					<Icon icon={luChevronRight} size={14} />
				</button>
			{:else}
				<span class="k-tree-chevron"></span>
			{/if}
			{#if node.leading}{@render node.leading?.()}{/if}
			<span>{node.label}</span>
		</div>
		{#if node.children?.length && isOpen(node.id)}
			<div class="k-tree-group" role="group">
				{#each node.children as child (child.id)}
					{@render renderNode(child, depth + 1)}
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

<div class={rootClass} role="tree" aria-label={label} tabindex="0" onkeydown={onKeydown}>
	{#each items as node (node.id)}
		{@render renderNode(node, 0)}
	{/each}
</div>

<style lang="sass">
.k-tree
	display: flex
	flex-direction: column
	gap: 2px
	font-size: var(--text-md)

	.k-tree-item
		display: flex
		flex-direction: column

	.k-tree-row
		display: flex
		align-items: center
		gap: 6px
		padding: 6px 8px
		padding-inline-start: calc(8px + var(--k-tree-depth, 0) * 14px)
		border: none
		border-radius: var(--radius-xs)
		background: transparent
		color: var(--text-primary)
		cursor: pointer
		text-align: left
		&:hover
			background: var(--state-hover)
		&:focus-visible
			outline: 2px solid var(--ring)
			outline-offset: -2px
		&[aria-selected='true']
			background: color-mix(in srgb, var(--theme-color) 10%, var(--bg-surface))

	.k-tree-chevron
		display: inline-flex
		align-items: center
		justify-content: center
		width: 18px
		height: 18px
		flex-shrink: 0
		color: var(--text-muted)
		background: transparent
		border: none
		cursor: pointer
		padding: 0
		transition: transform var(--motion-fast) ease
		&[data-state='open']
			transform: rotate(90deg)

	.k-tree-group
		display: flex
		flex-direction: column
		gap: 2px
		margin-inline-start: 14px
		padding-inline-start: 10px
		border-left: 1px solid var(--border)
</style>

