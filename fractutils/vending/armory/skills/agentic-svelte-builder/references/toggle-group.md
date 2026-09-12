# Toggle Group (Zero-JS Native Component)

The **Toggle Group** component manages toggle option groups using `<fieldset>` and radio inputs, styled with **`fractals-styler`** primitives (`row`, `ycenter`, `pad4`, `pad6`, `padleft12`, `padright12`, `radius8`, `radius6`, `text-sm`, `bold`).

---

## Component Code (`ToggleGroup.svelte`)

```svelte
<script lang="ts">
  type ToggleOption = {
    value: string;
    label: string;
  };

  type Props = {
    name: string;
    options: ToggleOption[];
    value?: string;
  };

  let { name, options, value = $bindable('') }: Props = $props();
</script>

<fieldset class="[ toggle-group ] [ row ycenter pad4 radius8 margin0 ]">
  {#each options as opt}
    <label class="[ toggle-group__item ]">
      <input
        type="radio"
        {name}
        value={opt.value}
        bind:group={value}
        class="[ toggle-group__input ]"
      />
      <span class="[ toggle-group__btn ] [ row ycenter pad6 padleft12 padright12 radius6 text-sm bold ]">{opt.label}</span>
    </label>
  {/each}
</fieldset>

```

### External stylesheet (`toggle-group.sass`)

```sass
	.toggle-group
		border: none
		background-color: var(--background20)

		&__item
			cursor: pointer

		&__input
			position: absolute
			opacity: 0
			width: 0
			height: 0

			&:checked + .toggle-group__btn
				background-color: var(--background10)
				color: var(--foreground10)
				box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05)

		&__btn
			color: var(--foreground-muted)
			transition: background-color 0.15s ease, color 0.15s ease
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import ToggleGroup from './ToggleGroup.svelte';

  let align = $state('left');
  const alignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ];
</script>

<ToggleGroup name="text-align" options={alignOptions} bind:value={align} />
```
