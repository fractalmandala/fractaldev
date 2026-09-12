# Navigation Menu (Tier 2 Native Component)

The **Navigation Menu** component builds top header navigation bars with nested mega-menu dropdowns natively using CSS `:hover` / `:focus-within`, styled with **`fractals-styler`** primitives (`row`, `box`, `gap16`, `gap8`, `gap4`, `pad8`, `pad12`, `radius8`, `radius4`, `minw240`, `text-sm`, `text-xs`, `bold`).

---

## Component Code (`NavigationMenu.svelte`)

```svelte
<script lang="ts">
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
</script>

<nav class="[ nav-menu ]" aria-label="Main Navigation">
  <ul class="[ nav-menu__list ] [ row ycenter gap16 margin0 pad0 ]">
    {#each items as item}
      <li class="[ nav-menu__item ] [ position-relative ]">
        {#if item.links}
          <button class="[ nav-menu__trigger ] [ pad8 padleft12 padright12 text-sm bold ]">{item.title} &#9662;</button>
          <div class="[ nav-menu__dropdown ] [ pad12 radius8 bdr minw240 ]">
            <ul class="[ nav-menu__sublist ] [ box gap8 margin0 pad0 ]">
              {#each item.links as link}
                <li>
                  <a href={link.href} class="[ nav-menu__link ] [ box gap4 pad8 radius4 ]">
                    <span class="[ nav-menu__link-title ] [ text-sm bold ]">{link.label}</span>
                    {#if link.description}
                      <span class="[ nav-menu__link-desc ] [ text-xs ]">{link.description}</span>
                    {/if}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {:else}
          <a href={item.href} class="[ nav-menu__trigger ] [ pad8 padleft12 padright12 text-sm bold ]">{item.title}</a>
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

		&__item
			&:hover .nav-menu__dropdown, &:focus-within .nav-menu__dropdown
				opacity: 1
				visibility: visible
				transform: translateY(0)

		&__trigger
			color: var(--foreground10)
			background: none
			border: none
			cursor: pointer
			text-decoration: none
			&:hover
				color: var(--brand-primary)

		&__dropdown
			position: absolute
			top: 100%
			left: 0
			background-color: var(--background10)
			border-color: var(--border)
			box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
			opacity: 0
			visibility: hidden
			transform: translateY(4px)
			transition: opacity 0.2s ease, transform 0.2s ease
			z-index: 50

		&__link
			text-decoration: none
			&:hover
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
        { label: 'Analytics', href: '/analytics', description: 'Real-time performance metrics' },
        { label: 'Security', href: '/security', description: 'Enterprise access controls' }
      ]
    },
    { title: 'Pricing', href: '/pricing' }
  ];
</script>

<NavigationMenu items={menu} />
```
