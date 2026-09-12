# Tabs (Zero-JS Native Component)

The **Tabs** component provides tabbed content switching natively using hidden radio inputs and CSS `:checked` / `:has()` selectors, styled with **`fractals-styler`** primitives (`box`, `row`, `gap8`, `pad8`, `pad16`, `text-sm`, `bold`).

---

## Component Code (`Tabs.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type TabItem = {
    id: string;
    label: string;
    content: Snippet;
  };

  type Props = {
    name?: string;
    items: TabItem[];
    defaultTab?: string;
  };

  let { name = 'tabs-group', items, defaultTab }: Props = $props();
  let initialTab = defaultTab || items[0]?.id;
</script>

<div class="[ tabs ] [ box ]">
  <div class="[ tabs__list ] [ row gap8 ]">
    {#each items as item}
      <input
        type="radio"
        {name}
        id="tab-{item.id}"
        class="[ tabs__radio ]"
        checked={item.id === initialTab}
      />
      <label for="tab-{item.id}" class="[ tabs__label ] [ pad8 pad16 text-sm bold ]">{item.label}</label>
    {/each}
  </div>

  <div class="[ tabs__panels ] [ padtop16 ]">
    {#each items as item}
      <div class="[ tabs__panel ]" id="panel-{item.id}">
        {@render item.content()}
      </div>
    {/each}
  </div>
</div>

```

### External stylesheet (`tabs.sass`)

```sass
	.tabs
		&__list
			border-bottom: 1px solid var(--border)

		&__radio
			position: absolute
			opacity: 0
			width: 0
			height: 0

			/* CSS selectors switch panel visibility purely natively */
			&#tab-account:checked ~ .tabs__panels #panel-account,
			&#tab-password:checked ~ .tabs__panels #panel-password,
			&#tab-settings:checked ~ .tabs__panels #panel-settings
				display: block

		&__label
			color: var(--foreground-muted)
			cursor: pointer
			border-bottom: 2px solid transparent
			margin-bottom: -1px
			transition: color 0.15s ease, border-color 0.15s ease
			&:hover
				color: var(--foreground10)

		&__radio:checked + &__label
			color: var(--brand-primary)
			border-bottom-color: var(--brand-primary)

		&__panel
			display: none
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Tabs from './Tabs.svelte';
</script>

{#snippet accountTab()}
  <p>Account settings panel</p>
{/snippet}

{#snippet passwordTab()}
  <p>Password change panel</p>
{/snippet}

<Tabs items={[
  { id: 'account', label: 'Account', content: accountTab },
  { id: 'password', label: 'Password', content: passwordTab }
]} />
```
