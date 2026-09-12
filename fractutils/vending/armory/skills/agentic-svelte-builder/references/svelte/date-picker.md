# Svelte 5 Native Date Picker

A Date Picker component combining input parsing, popover popup toggle, and calendar grid calculation using **Svelte 5 Runes** (`$state`, `$derived`, `$props`).

---

## Component Implementation (`DatePicker.svelte`)

```svelte
<script lang="ts">
  import Calendar from './Calendar.svelte';

  type Props = {
    value?: Date;
    placeholder?: string;
    onselect?: (date: Date) => void;
  };

  let { value = $bindable(new Date()), placeholder = 'Select date...', onselect }: Props = $props();

  let open = $state(false);

  let formattedDate = $derived(
    value ? value.toLocaleDateString() : ''
  );

  function handleDateSelect(selected: Date) {
    value = selected;
    onselect?.(selected);
    open = false;
  }
</script>

<div class="[ date-picker ] [ box position-relative ]">
  <button
    class="[ input ] [ row ycenter xbetween pad8 padleft12 padright12 radius6 bdr text-sm ]"
    onclick={() => open = !open}
    aria-expanded={open}
  >
    <span>{formattedDate || placeholder}</span>
    <span>📅</span>
  </button>

  {#if open}
    <div class="[ date-picker__popover ] [ position-absolute margintop4 ]">
      <Calendar {value} onselect={handleDateSelect} />
    </div>
  {/if}
</div>

```

### External stylesheet (`date-picker.sass`)

```sass
	.date-picker__popover
		top: 100%
		left: 0
		z-index: 50
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import DatePicker from './DatePicker.svelte';

  let selected = $state(new Date());
</script>

<DatePicker bind:value={selected} />
```
