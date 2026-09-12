<script module lang="ts">
	/** Invoice document: from / bill-to blocks, meta, line items, totals. */
	export interface InvoiceParty {
		name: string;
		lines?: string[];
	}

	export interface InvoiceMeta {
		label: string;
		value: string;
	}

	export interface InvoiceItem {
		description: string;
		qty?: string;
		rate?: string;
		amount: string;
	}

	export interface InvoiceTotal {
		label: string;
		value: string;
		accent?: boolean;
	}

	export interface GraphInvoiceProps {
		title: string;
		from?: InvoiceParty;
		to?: InvoiceParty;
		meta?: InvoiceMeta[];
		items: InvoiceItem[];
		totals?: InvoiceTotal[];
		note?: string;
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
		from,
		to,
		meta,
		items,
		totals,
		note,
		corner,
		class: className = ''
	}: GraphInvoiceProps = $props();

	const showQty = $derived(items.some((row) => row.qty != null));
	const showRate = $derived(items.some((row) => row.rate != null));
	const columns = $derived(1 + Number(showQty) + Number(showRate) + 1);
</script>

<Graph {title} {corner} class={className}>
	<GraphBody tight>
		<div class="inv">
			{#if from || to}
				<div class="parties">
					{#if from}
						<div class="party">
							<p class="kicker">From</p>
							<p class="name">{from.name}</p>
							{#each from.lines ?? [] as line}
								<p class="muted">{line}</p>
							{/each}
						</div>
					{/if}
					{#if to}
						<div class="party">
							<p class="kicker">Bill to</p>
							<p class="name">{to.name}</p>
							{#each to.lines ?? [] as line}
								<p class="muted">{line}</p>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			{#if meta && meta.length > 0}
				<dl class="meta">
					{#each meta as entry (entry.label)}
						<div class="party">
							<dt class="kicker">{entry.label}</dt>
							<dd class="name">{entry.value}</dd>
						</div>
					{/each}
				</dl>
			{/if}

			<div class="scroll">
				<table class="table">
					<thead>
						<tr>
							<th scope="col" class="cell head">Description</th>
							{#if showQty}
								<th scope="col" class="cell head pad">Qty</th>
							{/if}
							{#if showRate}
								<th scope="col" class="cell head pad">Rate</th>
							{/if}
							<th scope="col" class="cell head right">Amount</th>
						</tr>
						<tr>
							<th class="rulecell" colspan={columns}>
								<GraphRule />
							</th>
						</tr>
					</thead>
					<tbody>
						{#each items as row, i (row.description)}
							<tr use:reveal={{ delay: stagger(i, 40), amount: 0.4 }}>
								<td class="cell">{row.description}</td>
								{#if showQty}
									<td class="cell pad right">{row.qty ?? ''}</td>
								{/if}
								{#if showRate}
									<td class="cell pad right">{row.rate ?? ''}</td>
								{/if}
								<td class="cell right">{row.amount}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if totals && totals.length > 0}
				<div class="totals">
					<GraphRule />
					<dl class="total-list">
						{#each totals as entry, i (entry.label)}
							<div class="total-row" use:reveal={{ delay: stagger(i, 40) }}>
								<dt class="total-label" class:c-fg={entry.accent} class:c-muted={!entry.accent}>
									{entry.label}
								</dt>
								<dd class="total-value" class:c-accent={entry.accent} class:c-fg={!entry.accent}>
									{entry.value}
								</dd>
							</div>
						{/each}
					</dl>
				</div>
			{/if}

			{#if note}
				<p class="note">{note}</p>
			{/if}
		</div>
	</GraphBody>
</Graph>

<style>
	.inv {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.parties {
		display: grid;
		gap: 1.5rem;
	}

	@media (min-width: 640px) {
		.parties {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.party {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.kicker {
		margin: 0;
		letter-spacing: 0.025em;
		text-transform: uppercase;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.name {
		margin: 0;
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.muted {
		margin: 0;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.meta {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		column-gap: 2rem;
		row-gap: 0.75rem;
	}

	.scroll {
		overflow-x: auto;
	}

	.table {
		width: 100%;
		min-width: 32rem;
		border-collapse: separate;
		border-spacing: 0;
	}

	.cell {
		padding: 0.625rem 0;
		text-align: left;
	}

	.cell.pad {
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}

	.cell.right {
		text-align: right;
	}

	.cell.head {
		padding-top: 0;
		padding-bottom: 0.75rem;
		font-weight: 400;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.rulecell {
		padding: 0;
	}

	.totals {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.total-list {
		margin: 0 0 0 auto;
		display: flex;
		width: 100%;
		max-width: 22rem;
		flex-direction: column;
		gap: 0.5rem;
	}

	.total-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 8rem;
		align-items: baseline;
		column-gap: 1rem;
	}

	.total-label {
		margin: 0;
	}

	.total-value {
		margin: 0;
		text-align: right;
	}

	.note {
		margin: 0;
		max-width: 48ch;
		text-wrap: pretty;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.c-accent {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.c-fg {
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.c-muted {
		color: var(--text-secondary, oklch(0.62 0 0));
	}
</style>
