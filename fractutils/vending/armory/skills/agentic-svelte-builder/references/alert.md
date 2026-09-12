# Alert (Zero-JS Native Component)

The **Alert** component presents feedback messages to the user using semantic HTML (`<aside role="alert">`) and CUBE Exception data attributes (`data-variant="info|success|warning|danger"`), styled with **`fractals-styler`** layout primitives (`row`, `gap12`, `pad16`, `radius8`).

---

## Component Code (`Alert.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLElement> & {
    variant?: 'info' | 'success' | 'warning' | 'danger';
    title?: string;
    icon?: Snippet;
    children?: Snippet;
  };

  let {
    variant = 'info',
    title,
    icon,
    children,
    ...restProps
  }: Props = $props();
</script>

<aside
  class="[ alert ] [ row xtop gap12 ] [ pad16 radius8 bdr ]"
  data-variant={variant}
  role="alert"
  {...restProps}
>
  {#if icon}
    <div class="[ alert__icon ] [ row ytop shrink-0 padtop2 ]">
      {@render icon()}
    </div>
  {/if}
  <div class="[ alert__body ] [ box gap4 grow ]">
    {#if title}
      <h5 class="[ alert__title ] [ margin0 text-sm bold ]">{title}</h5>
    {/if}
    {#if children}
      <div class="[ alert__content ] [ text-sm lh14 ]">
        {@render children()}
      </div>
    {/if}
  </div>
</aside>

```

### External stylesheet (`alert.sass`)

```sass
	/* CUBE Exception variants via data-variant attribute */
	.alert
		&[data-variant="info"]
			background-color: var(--info-bg)
			border-color: var(--info-border)
			color: var(--info-text)

		&[data-variant="success"]
			background-color: var(--success-bg)
			border-color: var(--success-border)
			color: var(--success-text)

		&[data-variant="warning"]
			background-color: var(--warning-bg)
			border-color: var(--warning-border)
			color: var(--warning-text)

		&[data-variant="danger"]
			background-color: var(--danger-bg)
			border-color: var(--danger-border)
			color: var(--danger-text)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Alert from './Alert.svelte';
</script>

<Alert variant="success" title="Settings Saved">
  Your changes have been successfully saved to your profile.
</Alert>
```
