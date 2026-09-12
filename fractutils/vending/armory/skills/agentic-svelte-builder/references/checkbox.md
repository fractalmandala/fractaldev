# Checkbox (Zero-JS Native Component)

The **Checkbox** component wraps native HTML `<input type="checkbox">` with Svelte 5 two-way state binding (`bind:checked`), styled with **`fractals-styler`** primitives (`row`, `ycenter`, `gap8`, `radius4`, `text-sm`).

---

## Component Code (`Checkbox.svelte`)

```svelte
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  type Props = Omit<HTMLInputAttributes, 'type'> & {
    checked?: boolean;
    label?: string;
  };

  let { checked = $bindable(false), label, ...restProps }: Props = $props();
</script>

<label class="[ checkbox ] [ row ycenter gap8 text-sm ]">
  <input
    type="checkbox"
    bind:checked={checked}
    class="[ checkbox__input ]"
    {...restProps}
  />
  <span class="[ checkbox__box ] [ row xcenter ycenter width18 height18 radius4 bdr ]">
    <svg class="[ checkbox__icon ] [ width12 height12 ]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  </span>
  {#if label}
    <span class="[ checkbox__label ] [ color-foreground ]">{label}</span>
  {/if}
</label>

```

### External stylesheet (`checkbox.sass`)

```sass
	.checkbox
		cursor: pointer
		user-select: none

		&__input
			position: absolute
			opacity: 0
			width: 0
			height: 0

			&:checked + .checkbox__box
				background-color: var(--brand-primary)
				border-color: var(--brand-primary)

				.checkbox__icon
					opacity: 1

			&:focus-visible + .checkbox__box
				box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25)

			&:disabled + .checkbox__box
				opacity: 0.5
				cursor: not-allowed

		&__box
			background-color: var(--background10)
			transition: background-color 0.15s ease, border-color 0.15s ease

		&__icon
			color: var(--foreground-inverse)
			opacity: 0
			transition: opacity 0.15s ease
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Checkbox from './Checkbox.svelte';

  let isAgreed = $state(false);
</script>

<Checkbox bind:checked={isAgreed} label="I accept the terms and conditions" />
<p>Status: {isAgreed ? 'Accepted' : 'Not accepted'}</p>
```
