# Svelte 5 Native Data Table

A full-featured reactive Data Table component built with **Svelte 5 Runes** (`$state`, `$derived`, `$props`). Features client-side column sorting, text filtering, pagination, and multi-row selection.

---

## Component Implementation (`DataTable.svelte`)

```svelte
<script lang="ts" generics="T extends Record<string, any>">
  type Column<T> = {
    key: keyof T & string;
    header: string;
    sortable?: boolean;
  };

  type Props<T> = {
    data: T[];
    columns: Column<T>[];
    pageSize?: number;
  };

  let { data, columns, pageSize = 5 }: Props<T> = $props();

  let search = $state('');
  let sortKey = $state<string | null>(null);
  let sortAsc = $state(true);
  let currentPage = $state(1);
  let selectedRows = $state<Set<number>>(new Set());

  // 1. Reactive filtering
  let filteredData = $derived(
    data.filter(row =>
      columns.some(col => String(row[col.key]).toLowerCase().includes(search.toLowerCase()))
    )
  );

  // 2. Reactive sorting
  let sortedData = $derived(!sortKey ? filteredData : [...filteredData].sort((a, b) => {
      const valA = a[sortKey!];
      const valB = b[sortKey!];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    }));

  // 3. Reactive pagination
  let totalPages = $derived(Math.ceil(sortedData.length / pageSize) || 1);
  let paginatedData = $derived(
    sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  );

  function toggleSort(key: string) {
    if (sortKey === key) {
      sortAsc = !sortAsc;
    } else {
      sortKey = key;
      sortAsc = true;
    }
  }

  function toggleSelectAll(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
      selectedRows = new Set(paginatedData.map((_, i) => i));
    } else {
      selectedRows = new Set();
    }
  }

  function toggleSelect(index: number) {
    const next = new Set(selectedRows);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    selectedRows = next;
  }
</script>

<div class="[ data-table-container ] [ box w100 gap16 ]">
  <div class="[ row ycenter xbetween ]">
    <input
      type="text"
      bind:value={search}
      placeholder="Filter rows..."
      class="[ input ] [ maxw300 pad8 text-sm ]"
    />
    <span class="[ text-xs color-muted ]">{selectedRows.size} selected</span>
  </div>

  <div class="[ table-container ] [ w100 radius8 bdr ]">
    <table class="[ table ] [ w100 text-sm ]">
      <thead>
        <tr>
          <th><input type="checkbox" onchange={toggleSelectAll} /></th>
          {#each columns as col}
            <th data-sortable={col.sortable}>
              <button class="[ table-sort ] [ row ycenter gap4 ]" type="button" disabled={!col.sortable} onclick={() => toggleSort(col.key)}>
                {col.header}
                {#if sortKey === col.key}
                  <span aria-hidden="true">{sortAsc ? '▲' : '▼'}</span>
                {/if}
              </button>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each paginatedData as row, idx}
          <tr aria-selected={selectedRows.has(idx)}>
            <td><input type="checkbox" checked={selectedRows.has(idx)} onchange={() => toggleSelect(idx)} /></td>
            {#each columns as col}
              <td>{row[col.key]}</td>
            {/each}
          </tr>
        {:else}
          <tr><td colspan={columns.length + 1} class="text-center">No rows match filter</td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="[ row ycenter xbetween ]">
    <span class="text-xs color-muted">Page {currentPage} of {totalPages}</span>
    <div class="[ row gap4 ]">
      <button class="button" data-variant="outline" data-size="sm" disabled={currentPage === 1} onclick={() => currentPage--}>Prev</button>
      <button class="button" data-variant="outline" data-size="sm" disabled={currentPage === totalPages} onclick={() => currentPage++}>Next</button>
    </div>
  </div>
</div>

```

### External stylesheet (`data-table.sass`)

```sass
	.table
		border-collapse: collapse
		th, td
			padding: 0.75rem 1rem
			border-bottom: 1px solid var(--border-subtle)
		th[data-sortable="true"]
			cursor: pointer
			user-select: none
		tr.selected
			background-color: var(--background20)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import DataTable from './DataTable.svelte';

  const users = [
    { id: 1, name: 'Alice', role: 'Admin' },
    { id: 2, name: 'Bob', role: 'User' },
    { id: 3, name: 'Charlie', role: 'User' }
  ];

  const cols = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'role', header: 'Role' }
  ];
</script>

<DataTable data={users} columns={cols} pageSize={2} />
```
