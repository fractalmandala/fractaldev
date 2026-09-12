# SvelteKit Native Navigation Menu

A header Navigation Menu component integrated with **SvelteKit** `page.url.pathname` store for automatic active link highlighting and interactive mega-menu hover delays.

---

## Component Implementation (`NavigationMenu.svelte`)

```svelte
<script lang="ts">
  import { page } from '$app/state'; // SvelteKit reactive page state rune

  type NavLink = {
    label: string;
    href: string;
    description?: string;
  };

  type NavItem = {
    title: string;
    links?: NavLink[];
    href?: string;
  };

  type Props = {
    items: NavItem[];
  };

  let { items }: Props = $props();

  let activeIndex = $state<number | null>(null);

  function isActive(path?: string): boolean {
    if (!path) return false;
    return page.url.pathname === path;
  }
</script>

<nav class="[ nav-menu ]" aria-label="Main Navigation">
  <ul class="[ nav-menu__list ] [ row ycenter gap16 margin0 pad0 ]">
    {#each items as item, idx}
      <li
        class="[ nav-menu__item ] [ position-relative ]"
        onmouseenter={() => activeIndex = idx}
        onmouseleave={() => activeIndex = null}
      >
        {#if item.links}
          <button
            class="[ nav-menu__trigger ] [ pad8 padleft12 padright12 text-sm bold ]"
            aria-selected={item.links.some(l => isActive(l.href))}
          >
            {item.title} &#9662;
          </button>

          {#if activeIndex === idx}
            <div class="[ nav-menu__dropdown ] [ pad12 radius8 bdr minw240 position-absolute ]">
              <ul class="[ nav-menu__sublist ] [ box gap8 margin0 pad0 ]">
                {#each item.links as link}
                  <li>
                    <a
                      href={link.href}
                      class="[ nav-menu__link ] [ box gap4 pad8 radius4 ]"
                      aria-selected={isActive(link.href)}
                      aria-current={isActive(link.href) ? 'page' : undefined}
                    >
                      <span class="[ nav-menu__link-title ] [ text-sm bold ]">{link.label}</span>
                      {#if link.description}
                        <span class="[ nav-menu__link-desc ] [ text-xs ]">{link.description}</span>
                      {/if}
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        {:else}
          <a
            href={item.href}
            class="[ nav-menu__trigger ] [ pad8 padleft12 padright12 text-sm bold ]"
            aria-selected={isActive(item.href)}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            {item.title}
          </a>
        {/if}
      </li>
    {/each}
  </ul>
</nav>

```

### External stylesheet (`navigation-menu.sass`)

```sass
	.nav-menu
		&__list, &__sublist
			list-style: none

		&__trigger
			color: var(--foreground10)
			background: none
			border: none
			cursor: pointer
			text-decoration: none
			&[aria-selected="true"]
				color: var(--brand-primary) !important

		&__dropdown
			top: 100%
			left: 0
			background-color: var(--background10)
			border-color: var(--border)
			box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
			z-index: 50

		&__link
			text-decoration: none
			&:hover, &[aria-selected="true"]
				background-color: var(--background20)

		&__link-title
			color: var(--foreground10)

		&__link-desc
			color: var(--foreground-muted)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import NavigationMenu from './NavigationMenu.svelte';

  const menu = [
    {
      title: 'Products',
      links: [
        { label: 'Analytics', href: '/analytics', description: 'Real-time metrics' },
        { label: 'Security', href: '/security', description: 'Access controls' }
      ]
    },
    { title: 'Pricing', href: '/pricing' }
  ];
</script>

<NavigationMenu items={menu} />
```
