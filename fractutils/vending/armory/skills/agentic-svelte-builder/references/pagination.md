# Pagination (Tier 2 Native Component)

The **Pagination** component renders page selection controls natively using HTML `<a>` links (`?page=N`), styled with **`fractals-styler`** primitives (`row`, `ycenter`, `gap4`, `width36`, `height36`, `radius6`, `bdr`, `text-sm`, `bold`).

---

## Component Code (`Pagination.svelte`)

```svelte
<script lang="ts">
  type Props = {
    currentPage: number;
    totalPages: number;
    baseUrl?: string; // e.g. "/items"
  };

  let { currentPage = 1, totalPages = 10, baseUrl = '' }: Props = $props();

  let pages = $derived(Array.from({ length: totalPages }, (_, i) => i + 1));
</script>

<nav class="[ pagination ]" aria-label="Pagination Navigation">
  <ul class="[ pagination__list ] [ row ycenter gap4 margin0 pad0 ]">
    <li>
      <a
        href="{baseUrl}?page={Math.max(1, currentPage - 1)}"
        class="[ pagination__link ] [ row ycenter xcenter width36 height36 radius6 bdr text-sm bold ]"
        aria-disabled={currentPage === 1}
        aria-label="Previous Page"
      >
        &laquo;
      </a>
    </li>

    {#each pages as page}
      <li>
        <a
          href="{baseUrl}?page={page}"
          class="[ pagination__link ] [ row ycenter xcenter width36 height36 radius6 bdr text-sm bold ]"
          aria-selected={page === currentPage}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </a>
      </li>
    {/each}

    <li>
      <a
        href="{baseUrl}?page={Math.min(totalPages, currentPage + 1)}"
        class="[ pagination__link ] [ row ycenter xcenter width36 height36 radius6 bdr text-sm bold ]"
        aria-disabled={currentPage === totalPages}
        aria-label="Next Page"
      >
        &raquo;
      </a>
    </li>
  </ul>
</nav>

```

### External stylesheet (`pagination.sass`)

```sass
	.pagination
		&__list
			list-style: none

		&__link
			color: var(--foreground10)
			text-decoration: none
			border-color: var(--border)
			background-color: var(--background10)
			transition: background-color 0.15s ease

			&:hover:not(&[aria-disabled="true"])
				background-color: var(--background20)

			&[aria-selected="true"]
				background-color: var(--brand-primary)
				color: var(--foreground-inverse)
				border-color: var(--brand-primary)

			&[aria-disabled="true"]
				opacity: 0.5
				pointer-events: none
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Pagination from './Pagination.svelte';
</script>

<Pagination currentPage={2} totalPages={5} baseUrl="/products" />
```
