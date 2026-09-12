# SvelteKit SPA Pagination

A Pagination component leveraging **SvelteKit** `goto()` for seamless client-side SPA navigation without full page reloads, powered by **Svelte 5 Runes** (`$derived`, `$props`).

---

## Component Implementation (`Pagination.svelte`)

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  type Props = {
    totalPages: number;
    paramName?: string; // Query param name e.g. "page"
  };

  let { totalPages = 10, paramName = 'page' }: Props = $props();

  // Reactive derived current page from SvelteKit page state
  let currentPage = $derived(
    Number(page.url.searchParams.get(paramName)) || 1
  );

  let pages = $derived(Array.from({ length: totalPages }, (_, i) => i + 1));

  function navigateTo(p: number) {
    const url = new URL(page.url);
    url.searchParams.set(paramName, String(p));
    goto(url.toString(), { keepFocus: true, noScroll: true });
  }
</script>

<nav class="[ pagination ]" aria-label="Pagination Navigation">
  <ul class="[ pagination__list ] [ row ycenter gap4 margin0 pad0 ]">
    <li>
      <button
        class="[ pagination__btn ] [ row ycenter xcenter width36 height36 radius6 bdr text-sm bold ]"
        disabled={currentPage === 1}
        onclick={() => navigateTo(currentPage - 1)}
        aria-label="Previous Page"
      >
        &laquo;
      </button>
    </li>

    {#each pages as p}
      <li>
        <button
          class="[ pagination__btn ] [ row ycenter xcenter width36 height36 radius6 bdr text-sm bold ]"
          aria-selected={p === currentPage}
          onclick={() => navigateTo(p)}
          aria-current={p === currentPage ? 'page' : undefined}
        >
          {p}
        </button>
      </li>
    {/each}

    <li>
      <button
        class="[ pagination__btn ] [ row ycenter xcenter width36 height36 radius6 bdr text-sm bold ]"
        disabled={currentPage === totalPages}
        onclick={() => navigateTo(currentPage + 1)}
        aria-label="Next Page"
      >
        &raquo;
      </button>
    </li>
  </ul>
</nav>

```

### External stylesheet (`pagination.sass`)

```sass
	.pagination__list
		list-style: none

	.pagination__btn
		cursor: pointer
		color: var(--foreground10)
		border-color: var(--border)
		background-color: var(--background10)
		transition: background-color 0.15s ease

		&:hover:not(:disabled)
			background-color: var(--background20)

		&[aria-selected="true"]
			background-color: var(--brand-primary) !important
			color: var(--foreground-inverse) !important
			border-color: var(--brand-primary) !important

		&:disabled
			opacity: 0.5
			cursor: not-allowed
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Pagination from './Pagination.svelte';
</script>

<Pagination totalPages={5} />
```
