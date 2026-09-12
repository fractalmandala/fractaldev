# Native Select (Zero-JS Native Component)

The **Native Select** component wraps HTML `<select>` with Svelte 5 state binding (`bind:value`), styled with **`fractals-styler`** primitives (`row`, `ycenter`, `w100`, `pad8`, `padleft12`, `padright36`, `radius6`, `bdr`, `text-sm`).

---

## Component Code (`NativeSelect.svelte`)

```svelte
<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';

  type SelectOption = {
    value: string | number;
    label: string;
    disabled?: boolean;
  };

  type Props = HTMLSelectAttributes & {
    options: SelectOption[];
    value?: string | number;
    placeholder?: string;
  };

  let { options, value = $bindable(''), placeholder, ...restProps }: Props = $props();
</script>

<div class="[ select-wrapper ] [ row ycenter w100 position-relative ]">
  <select bind:value={value} class="[ select-wrapper__native ] [ w100 pad8 padleft12 padright36 radius6 bdr text-sm ]" {...restProps}>
    {#if placeholder}
      <option value="" disabled selected hidden>{placeholder}</option>
    {/if}
    {#each options as opt}
      <option value={opt.value} disabled={opt.disabled}>{opt.label}</option>
    {/each}
  </select>
  <svg class="[ select-wrapper__chevron ] [ width16 height16 ]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M6 9l6 6 6-6"/>
  </svg>
</div>

```

### External stylesheet (`native-select.sass`)

```sass
	.select-wrapper
		&__native
			color: var(--foreground10)
			background-color: var(--background10)
			border-color: var(--border)
			appearance: none
			cursor: pointer

			&:focus
				outline: none
				border-color: var(--brand-primary)
				box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15)

		&__chevron
			position: absolute
			right: 0.75rem
			pointer-events: none
			color: var(--foreground-muted)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import NativeSelect from './NativeSelect.svelte';

  let role = $state('user');
  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'Standard User' }
  ];
</script>

<NativeSelect options={roles} bind:value={role} />
```
