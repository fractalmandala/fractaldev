# Svelte 5 Controlled Tabs

A controlled Tabs component powered by **Svelte 5 Runes** (`$state`, `$bindable`, `$props`). Tracks active tab selection with `$bindable(value)` and renders active panel content dynamically.

---

## Component Implementation (`Tabs.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type TabItem = {
    id: string;
    label: string;
    content: Snippet;
  };

  type Props = {
    items: TabItem[];
    value?: string;
  };

  let { items, value = $bindable(items[0]?.id || '') }: Props = $props();
</script>

<div class="[ tabs ] [ box ]">
  <div class="[ tabs__list ] [ row gap8 ]" role="tablist">
    {#each items as item}
      <button
        class="[ tabs__btn ] [ pad8 pad16 text-sm bold ]"
        onclick={() => value = item.id}
        role="tab"
        aria-selected={item.id === value}
      >
        {item.label}
      </button>
    {/each}
  </div>

  <div class="[ tabs__panel ] [ padtop16 ]" role="tabpanel">
    {#each items as item}
      {#if item.id === value}
        {@render item.content()}
      {/if}
    {/each}
  </div>
</div>

```

### External stylesheet (`tabs.sass`)

```sass
	.tabs
		&__list
			border-bottom: 1px solid var(--border)

		&__btn
			background: none
			border: none
			cursor: pointer
			color: var(--foreground-muted)
			border-bottom: 2px solid transparent
			margin-bottom: -1px
			transition: color 0.15s ease, border-color 0.15s ease
			&:hover
				color: var(--foreground10)

			&[aria-selected="true"]
				color: var(--brand-primary) !important
				border-bottom-color: var(--brand-primary) !important
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Tabs from './Tabs.svelte';

  let activeTab = $state('account');
</script>

{#snippet accountTab()}
  <p>Account Tab Panel</p>
{/snippet}

{#snippet passwordTab()}
  <p>Password Tab Panel</p>
{/snippet}

<Tabs
  bind:value={activeTab}
  items={[
    { id: 'account', label: 'Account', content: accountTab },
    { id: 'password', label: 'Password', content: passwordTab }
  ]}
/>
```
