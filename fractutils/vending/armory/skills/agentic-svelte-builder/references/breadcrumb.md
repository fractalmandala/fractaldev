# Breadcrumb (Zero-JS Native Component)

The **Breadcrumb** component renders navigation paths using semantic HTML (`<nav aria-label="Breadcrumb"><ol>`) and **`fractals-styler`** primitives (`row`, `ycenter`, `gap8`, `text-sm`).

---

## Component Code (`Breadcrumb.svelte`)

```svelte
<script lang="ts">
  type BreadcrumbItem = {
    label: string;
    href?: string;
  };

  type Props = {
    items: BreadcrumbItem[];
    separator?: string;
  };

  let { items, separator = '/' }: Props = $props();
</script>

<nav class="[ breadcrumb ]" aria-label="Breadcrumb">
  <ol class="[ breadcrumb__list ] [ row ycenter gap8 margin0 pad0 text-sm ]">
    {#each items as item, index}
      <li class="[ breadcrumb__item ] [ row ycenter gap8 ]">
        {#if item.href && index < items.length - 1}
          <a href={item.href} class="[ breadcrumb__link ] [ color-muted ]">{item.label}</a>
        {:else}
          <span class="[ breadcrumb__current ] [ bold ]" aria-current="page">{item.label}</span>
        {/if}

        {#if index < items.length - 1}
          <span class="[ breadcrumb__separator ] [ color-muted ]" aria-hidden="true">{separator}</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

```

### External stylesheet (`breadcrumb.sass`)

```sass
	.breadcrumb__list
		list-style: none

	.breadcrumb__link
		text-decoration: none
		color: var(--foreground-muted)
		&:hover
			color: var(--foreground10)
			text-decoration: underline

	.breadcrumb__current
		color: var(--foreground10)

	.breadcrumb__separator
		user-select: none
		color: var(--foreground-subtle)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Breadcrumb from './Breadcrumb.svelte';

  const paths = [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Breadcrumb' }
  ];
</script>

<Breadcrumb items={paths} />
```
