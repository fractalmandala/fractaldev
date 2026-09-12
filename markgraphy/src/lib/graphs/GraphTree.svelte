<script module lang="ts">
	/** Indented file/org tree with ├─/└─ branches. */
	export interface TreeNode {
		label: string;
		meta?: string;
		accent?: boolean;
		children?: TreeNode[];
	}

	export interface GraphTreeProps {
		title: string;
		nodes: TreeNode[];
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { reveal, stagger } from '../frame/motion';

	let { title, nodes, corner, class: className = '' }: GraphTreeProps = $props();

	interface FlatRow {
		key: string;
		branch: string;
		label: string;
		meta?: string;
		accent?: boolean;
	}

	function flatten(
		nodes: TreeNode[],
		prefix = '',
		trail = 'root',
		isRoot = true
	): FlatRow[] {
		const singleRoot = isRoot && nodes.length === 1;

		return nodes.flatMap((node, index) => {
			const last = index === nodes.length - 1;
			const branch = singleRoot ? '' : prefix + (last ? '└─ ' : '├─ ');
			const key = `${trail}/${node.label}-${index}`;
			const childPrefix = singleRoot ? '' : prefix + (last ? '   ' : '│  ');
			const row: FlatRow = {
				key,
				branch,
				label: node.label,
				meta: node.meta,
				accent: node.accent
			};
			const kids = node.children ? flatten(node.children, childPrefix, key, false) : [];
			return [row, ...kids];
		});
	}

	const rows = $derived(flatten(nodes));
	const hasAccent = $derived(rows.some((row) => row.accent));
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="scroll">
			<ul class="tree" role="list">
				{#each rows as row, i (row.key)}
					<li
						class="row"
						class:dim={hasAccent && !row.accent}
						use:reveal={{ delay: stagger(i, 40), amount: 0.4 }}
					>
						<span class="entry">
							<span class="branch" aria-hidden="true">{row.branch}</span>
							<span class="label" class:c-accent={row.accent}>{row.label}</span>
						</span>
						{#if row.meta}
							<span class="meta">{row.meta}</span>
						{:else}
							<span></span>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
		<span class="sr-only">Tree with {rows.length} nodes</span>
	</GraphBody>
</Graph>

<style>
	.scroll {
		overflow-x: auto;
	}

	.tree {
		display: flex;
		min-width: max-content;
		flex-direction: column;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: baseline;
		column-gap: 1.5rem;
	}

	.entry {
		white-space: nowrap;
	}

	.branch {
		color: var(--border, oklch(0.6 0 0 / 0.5));
		user-select: none;
	}

	.label {
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.c-accent {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.meta {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.dim {
		opacity: 0.4;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border-width: 0;
	}
</style>
