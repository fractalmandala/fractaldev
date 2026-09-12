# Field / Fieldset (Zero-JS Native Component)

The **Field** component structures form inputs, labels, and validation feedback using semantic HTML (`<fieldset>`, `<legend>`), styled with **`fractals-styler`** primitives (`box`, `gap6`, `marginbot20`, `text-sm`, `text-xs`, `bold`).

---

## Component Code (`Field.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLFieldSetElement> & {
    label?: string;
    description?: string;
    error?: string;
    children?: Snippet;
  };

  let { label, description, error, children, ...restProps }: Props = $props();
</script>

<fieldset class="[ field ] [ box gap6 margin0 marginbot20 pad0 ]" {...restProps}>
  {#if label}
    <legend class="[ field__legend ] [ pad0 text-sm bold ]">{label}</legend>
  {/if}

  {#if children}
    <div class="[ field__control ] [ box ]">
      {@render children()}
    </div>
  {/if}

  {#if description && !error}
    <p class="[ field__description ] [ margin0 text-xs ]">{description}</p>
  {/if}

  {#if error}
    <p class="[ field__error ] [ margin0 text-xs bold ]" role="alert">{error}</p>
  {/if}
</fieldset>

```

### External stylesheet (`field.sass`)

```sass
	.field
		border: none

		&__legend
			color: var(--foreground10)

		&__description
			color: var(--foreground-muted)

		&__error
			color: var(--danger-text)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Field from './Field.svelte';
  import Input from './Input.svelte';

  let email = $state('');
</script>

<Field label="Email Address" description="We'll never share your email with anyone else.">
  <Input type="email" bind:value={email} placeholder="you@example.com" />
</Field>
```
