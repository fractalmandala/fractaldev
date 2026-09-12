<script lang="ts">
	import type { PropRow } from '$site/docs/catalog';

	let { rows }: { rows: PropRow[] } = $props();
</script>

<section class="props">
	<div class="head">
		<h2>Props</h2>
		<p class="eyebrow">{rows.length} props</p>
	</div>
	<div class="scroll">
		<table>
			<thead>
				<tr>
					<th scope="col">prop</th>
					<th scope="col">type</th>
					<th scope="col">default</th>
					<th scope="col">description</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row (row.name)}
					<tr>
						<td class="name">{row.name}</td>
						<td class="type">{row.type}</td>
						<td class="default">{row.default ?? '—'}</td>
						<td class="desc">{row.description}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<style>
	.props {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
	}

	.eyebrow {
		margin: 0;
	}

	.scroll {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.82rem;
	}

	th {
		padding: 0.5rem 0.6rem;
		border-bottom: 1px dashed var(--border);
		font-weight: 400;
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		text-align: left;
		color: var(--text-secondary);
		white-space: nowrap;
	}

	td {
		padding: 0.6rem;
		border-bottom: 1px dotted #2a2a2a;
		color: var(--text-secondary);
		vertical-align: top;
	}

	.name {
		color: var(--text-primary);
		white-space: nowrap;
	}

	.type {
		color: var(--graph-accent);
		white-space: nowrap;
	}

	.default {
		white-space: nowrap;
	}

	.desc {
		min-width: 24rem;
		text-wrap: pretty;
	}
</style>
