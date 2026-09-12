# Radio Group (Zero-JS Native Component)

The **Radio Group** component structures mutually exclusive option choices using `<fieldset>` and `<input type="radio">`, styled with **`fractals-styler`** primitives (`box`, `row`, `ycenter`, `gap8`, `text-sm`, `bold`, `radiusfull`).

---

## Component Code (`RadioGroup.svelte`)

```svelte
<script lang="ts">
  type RadioOption = {
    value: string | number;
    label: string;
  };

  type Props = {
    name: string;
    options: RadioOption[];
    value?: string | number;
    label?: string;
  };

  let { name, options, value = $bindable(''), label }: Props = $props();
</script>

<fieldset class="[ radio-group ] [ box margin0 pad0 ]">
  {#if label}
    <legend class="[ radio-group__legend ] [ marginbot8 text-sm bold ]">{label}</legend>
  {/if}

  <div class="[ radio-group__options ] [ box gap8 ]">
    {#each options as option}
      <label class="[ radio-option ] [ row ycenter gap8 text-sm ]">
        <input
          type="radio"
          {name}
          value={option.value}
          bind:group={value}
          class="[ radio-option__input ]"
        />
        <span class="[ radio-option__circle ] [ width18 height18 radiusfull bdr ]"></span>
        <span class="[ radio-option__label ]">{option.label}</span>
      </label>
    {/each}
  </div>
</fieldset>

```

### External stylesheet (`radio-group.sass`)

```sass
	.radio-group
		border: none

		&__legend
			color: var(--foreground10)

	.radio-option
		cursor: pointer

		&__input
			position: absolute
			opacity: 0
			width: 0
			height: 0

			&:checked + .radio-option__circle
				border-color: var(--brand-primary)
				border-width: 5px

		&__circle
			border-color: var(--border)
			background-color: var(--background10)
			transition: border 0.15s ease

		&__label
			color: var(--foreground10)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import RadioGroup from './RadioGroup.svelte';

  let selectedPlan = $state('monthly');
  const plans = [
    { value: 'monthly', label: 'Monthly Subscription' },
    { value: 'yearly', label: 'Yearly Subscription' }
  ];
</script>

<RadioGroup name="billing-plan" options={plans} bind:value={selectedPlan} label="Billing Interval" />
```
