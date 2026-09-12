# Table (Zero-JS Native Component)

The **Table** component wraps native HTML `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` elements, styled with **`fractals-styler`** primitives (`w100`, `radius8`, `bdr`, `pad12`, `pad16`, `text-sm`, `bold`).

---

## Component Code (`Table.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLTableAttributes } from 'svelte/elements';

  type Props = HTMLTableAttributes & {
    head?: Snippet;
    children?: Snippet;
  };

  let { head, children, ...restProps }: Props = $props();
</script>

<div class="[ table-container ] [ w100 radius8 bdr ]">
  <table class="[ table ] [ w100 text-sm ]" {...restProps}>
    {#if head}
      <thead class="[ table__head ]">
        {@render head()}
      </thead>
    {/if}
    <tbody class="[ table__body ]">
      {@render children?.()}
    </tbody>
  </table>
</div>

```

### External stylesheet (`table.sass`)

```sass
	.table-container
		overflow-x: auto
		border-color: var(--border)

	.table
		border-collapse: collapse
		text-align: left

		:global(th)
			padding: var(--px12) var(--px16)
			font-weight: 600
			color: var(--foreground-muted)
			background-color: var(--background20)
			border-bottom: 1px solid var(--border)

		:global(td)
			padding: var(--px12) var(--px16)
			color: var(--foreground10)
			border-bottom: 1px solid var(--border-subtle)

		:global(tr:last-child td)
			border-bottom: none

		:global(tbody tr:hover)
			background-color: var(--background20)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Table from './Table.svelte';

  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ];
</script>

<Table>
  {#snippet head()}
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Email</th>
    </tr>
  {#snippet}

  {#each users as u}
    <tr>
      <td>{u.id}</td>
      <td>{u.name}</td>
      <td>{u.email}</td>
    </tr>
  {/each}
</Table>
```
