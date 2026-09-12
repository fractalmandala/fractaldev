<script module lang="ts">
	// Exported types live in module context — a generics-bearing instance
	// script cannot carry `export interface` modifiers.
	export interface TableColumn<TRow extends Record<string, unknown>> {
		/** Row field key — also the default sort accessor. */
		key: string;
		header: string;
		/** Sort accessor override (e.g. a derived comparable value). */
		value?: (row: TRow) => string | number;
		width?: string;
		align?: 'left' | 'center' | 'right';
		/** Whether clicking the header sorts by this column. */
		sortable?: boolean;
		/** Custom cell rendering. */
		render?: Snippet<[TRow]>;
	}
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import { untrack, type Snippet } from 'svelte';
	import { Icon } from 'fractalicons';
	import { luArrowDown, luArrowUp, luArrowUpDown } from 'fractalicons/lucide';
	import CheckIndicator from './CheckIndicator.svelte';

	type SortState = { key: string; dir: 'asc' | 'desc' };

	interface Props {
		columns: TableColumn<T>[];
		rows: T[];
		/** Stable row identity for selection; defaults to the original row order. */
		rowKey?: (row: T, index: number) => string;
		/** Shows a select-all / per-row checkbox column. */
		selectable?: boolean;
		/** Controlled selected row keys. */
		selected?: string[];
		/** Uncontrolled initial selection. */
		defaultSelected?: string[];
		onSelectedChange?: (selected: string[]) => void;
		/** Controlled sort state (null = unsorted). */
		sort?: SortState | null;
		/** Uncontrolled initial sort. */
		defaultSort?: SortState | null;
		onSortChange?: (sort: SortState | null) => void;
		/** Freezes the header row over a scrolling body. */
		stickyHeader?: boolean;
		/** Max height of the scroll area; pairs with stickyHeader. */
		maxHeight?: string;
		/** Stripes alternate body rows. */
		striped?: boolean;
		/** Compact density. */
		dense?: boolean;
		emptyLabel?: string;
		/** Custom empty state. */
		children?: Snippet;
		caption?: string;
		ariaLabel?: string;
		/** Secondary pointer interaction; selection still goes through checkboxes. */
		onRowClick?: (row: T, index: number) => void;
		class?: string;
	}

	let {
		columns,
		rows,
		rowKey,
		selectable = false,
		selected,
		defaultSelected = [],
		onSelectedChange,
		sort,
		defaultSort = null,
		onSortChange,
		stickyHeader = false,
		maxHeight,
		striped = false,
		dense = false,
		emptyLabel = 'No rows',
		children,
		caption,
		ariaLabel = 'Data table',
		onRowClick,
		class: className
	}: Props = $props();

	let internalSelected = $state<string[]>(untrack(() => defaultSelected));
	const selectedControlled = $derived(selected !== undefined);
	// Narrowed inline so `selectedKeys` is string[], not string[] | undefined.
	const selectedKeys = $derived(selected === undefined ? internalSelected : selected);
	const selectedSet = $derived(new Set(selectedKeys));

	let internalSort = $state<SortState | null>(untrack(() => defaultSort));
	const sortControlled = $derived(sort !== undefined);
	const activeSort = $derived(sort === undefined ? internalSort : sort);

	// Keys are captured in ORIGINAL row order, so selection identity survives
	// sorting even with the default index keys.
	const rowKeys = $derived(rows.map((row, i) => (rowKey ? rowKey(row, i) : String(i))));
	const entries = $derived(
		rows.map((row, i) => ({ row, index: i, key: rowKeys[i] ?? String(i) }))
	);

	const sortedEntries = $derived.by(() => {
		if (!activeSort) return entries;
		const col = columns.find((c) => c.key === activeSort.key);
		if (!col) return entries;
		const accessor = (row: T): string | number => {
			if (col.value) return col.value(row);
			const v = row[col.key];
			return typeof v === 'number' ? v : String(v ?? '');
		};
		const sorted = [...entries].sort((a, b) => {
			const av = accessor(a.row);
			const bv = accessor(b.row);
			if (typeof av === 'number' && typeof bv === 'number') return av - bv;
			return String(av).localeCompare(String(bv));
		});
		return activeSort.dir === 'desc' ? sorted.reverse() : sorted;
	});

	const allSelected = $derived(rows.length > 0 && rowKeys.every((k) => selectedSet.has(k)));
	const someSelected = $derived(selectedKeys.length > 0 && !allSelected);

	function setSelected(next: string[]) {
		if (!selectedControlled) internalSelected = next;
		onSelectedChange?.(next);
	}

	function toggleRow(key: string) {
		setSelected(
			selectedSet.has(key) ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key]
		);
	}

	function toggleAll() {
		setSelected(allSelected ? [] : [...rowKeys]);
	}

	// Header click cycles asc → desc → unsorted.
	function cycleSort(col: TableColumn<T>) {
		if (!col.sortable) return;
		const next =
			!activeSort || activeSort.key !== col.key
				? { key: col.key, dir: 'asc' as const }
				: activeSort.dir === 'asc'
					? ({ key: col.key, dir: 'desc' as const } satisfies SortState)
					: null;
		if (!sortControlled) internalSort = next;
		onSortChange?.(next);
	}

	const displayValue = (row: T, col: TableColumn<T>): string => {
		const v = row[col.key];
		return v === undefined || v === null ? '' : String(v);
	};

	const sortIcon = (col: TableColumn<T>) => {
		if (!activeSort || activeSort.key !== col.key) return luArrowUpDown;
		return activeSort.dir === 'asc' ? luArrowUp : luArrowDown;
	};

	const sortAria = (col: TableColumn<T>) => {
		if (!activeSort || activeSort.key !== col.key) return undefined;
		return activeSort.dir === 'asc' ? 'ascending' : 'descending';
	};

	const rootStyle = $derived(maxHeight ? `max-height: ${maxHeight}` : undefined);
</script>

<div
	class={className}
	data-slot="table-root"
	style={rootStyle}
	data-sticky={stickyHeader || undefined}
	data-striped={striped || undefined}
	data-dense={dense || undefined}
>
	<table data-slot="table" aria-label={ariaLabel}>
		{#if caption}<caption data-slot="table-caption">{caption}</caption>{/if}
		<thead data-slot="table-head">
			<tr>
				{#if selectable}
					<th data-slot="table-head-cell" data-check="true" scope="col">
						<button
							type="button"
							role="checkbox"
							aria-checked={allSelected ? true : someSelected ? 'mixed' : false}
							aria-label="Select all rows"
							data-slot="table-check"
							onclick={toggleAll}
						>
							<CheckIndicator
								state={allSelected ? 'checked' : someSelected ? 'indeterminate' : 'unchecked'}
							/>
						</button>
					</th>
				{/if}
				{#each columns as col (col.key)}
					<th
						data-slot="table-head-cell"
						scope="col"
						style={col.width ? `width: ${col.width}` : undefined}
						data-align={col.align || undefined}
						aria-sort={sortAria(col)}
					>
						{#if col.sortable}
							<button type="button" data-slot="table-sort" onclick={() => cycleSort(col)}>
								<span>{col.header}</span>
								<Icon icon={sortIcon(col)} size={12} aria-hidden="true" />
							</button>
						{:else}
							{col.header}
						{/if}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody data-slot="table-body">
			{#each sortedEntries as entry (entry.key)}
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<tr
					data-slot="table-row"
					data-selected={selectable && selectedSet.has(entry.key) || undefined}
					onclick={() => onRowClick?.(entry.row, entry.index)}
				>
					{#if selectable}
						<td data-slot="table-cell" data-check="true">
							<button
								type="button"
								role="checkbox"
								aria-checked={selectedSet.has(entry.key)}
								aria-label="Select row {entry.index + 1}"
								data-slot="table-check"
								onclick={(e) => {
									e.stopPropagation();
									toggleRow(entry.key);
								}}
							>
								<CheckIndicator state={selectedSet.has(entry.key) ? 'checked' : 'unchecked'} />
							</button>
						</td>
					{/if}
					{#each columns as col (col.key)}
						<td data-slot="table-cell" data-align={col.align || undefined}>
							{#if col.render}
								{@render col.render(entry.row)}
							{:else}
								{displayValue(entry.row, col)}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
	{#if entries.length === 0}
		<div data-slot="table-empty">
			{#if children}{@render children()}{:else}{emptyLabel}{/if}
		</div>
	{/if}
</div>
