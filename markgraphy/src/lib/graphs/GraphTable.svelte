<script module lang="ts">
	import type { Snippet } from 'svelte';

	/** Framed data table with an optional footer row for totals. */
	export type Cell = Snippet | string | number;

	export interface GraphTableProps {
		title: string;
		headers: string[];
		rows: Cell[][];
		footer?: Cell[];
		align?: ('left' | 'right')[];
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import GraphRule from '../frame/GraphRule.svelte';
	import { reveal, stagger } from '../frame/motion';

	let {
		title,
		headers,
		rows,
		footer,
		align,
		corner,
		class: className = ''
	}: GraphTableProps = $props();

	function isSnippet(cell: Cell): cell is Snippet {
		return typeof cell === 'function';
	}

	function alignOf(index: number): 'left' | 'right' {
		return align?.[index] ?? (index === 0 ? 'left' : 'right');
	}
</script>

<Graph {title} {corner} class={className}>
	<GraphBody tight>
		<div class="scroll">
			<table class="table">
				<thead>
					<tr>
						{#each headers as header, i (header)}
							<th scope="col" class="cell head" class:right={alignOf(i) === 'right'}>
								{header}
							</th>
						{/each}
					</tr>
					<tr>
						<th class="rulecell" colspan={headers.length}>
							<GraphRule />
						</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as row, r (r)}
						<tr use:reveal={{ delay: stagger(r, 40), amount: 0.4 }}>
							{#each row as cell, c}
								<td class="cell" class:right={alignOf(c) === 'right'}>
									{#if isSnippet(cell)}{@render cell()}{:else}{cell}{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
				{#if footer}
					<tfoot>
						<tr>
							<td class="rulecell pad" colspan={headers.length}>
								<GraphRule />
							</td>
						</tr>
						<tr>
							{#each footer as cell, c}
								<td class="cell foot" class:right={alignOf(c) === 'right'}>
									{#if isSnippet(cell)}{@render cell()}{:else}{cell}{/if}
								</td>
							{/each}
						</tr>
						</tfoot>
					{/if}
			</table>
		</div>
	</GraphBody>
</Graph>

<style>
	.scroll {
		overflow-x: auto;
	}

	.table {
		font-size: 0.875rem;
		width: 100%;
		min-width: 32rem;
		border-collapse: separate;
		border-spacing: 0;
	}

	.cell {
		padding: 0.625rem 0.75rem;
		white-space: nowrap;
		text-align: left;
	}

	.cell.right {
		text-align: right;
	}

	.cell.head {
		padding-bottom: 0.75rem;
		font-weight: 400;
	}

	.cell.foot {
		padding-top: 0.25rem;
	}

	.rulecell {
		padding: 0;
	}

	.rulecell.pad {
		padding-top: 0.5rem;
		padding-bottom: 0.75rem;
	}
</style>
