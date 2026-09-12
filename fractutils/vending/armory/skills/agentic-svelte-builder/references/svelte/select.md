# Svelte 5 Custom Select Listbox

A custom styled Select component powered by **Svelte 5 Runes** (`$state`, `$derived`, `$props`). Features full ARIA listbox keyboard traversal and custom option rendering.

---

## Component Implementation (`Select.svelte`)

```svelte
<script lang="ts">
  type Option = {
    value: string;
    label: string;
  };

  type Props = {
    options: Option[];
    value?: string;
    placeholder?: string;
    onselect?: (value: string) => void;
  };

  let { options, value = $bindable(''), placeholder = 'Select option...', onselect }: Props = $props();

  let open = $state(false);
  let activeIndex = $state(0);

  let selectedOption = $derived(options.find(o => o.value === value));

  function select(val: string) {
    value = val;
    onselect?.(val);
    open = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') open = true;
      return;
    }

    if (e.key === 'ArrowDown') {
      activeIndex = (activeIndex + 1) % options.length;
    } else if (e.key === 'ArrowUp') {
      activeIndex = (activeIndex - 1 + options.length) % options.length;
    } else if (e.key === 'Enter') {
      select(options[activeIndex].value);
    } else if (e.key === 'Escape') {
      open = false;
    }
  }
</script>

<div class="[ custom-select ] [ box w100 position-relative ]" onkeydown={handleKeydown}>
  <button
    class="[ input ] [ row ycenter xbetween w100 pad8 padleft12 padright12 radius6 bdr text-sm ]"
    onclick={() => open = !open}
    aria-expanded={open}
  >
    <span>{selectedOption ? selectedOption.label : placeholder}</span>
    <span aria-hidden="true">&#9662;</span>
  </button>

  {#if open}
    <div class="[ custom-select__dropdown ] [ box w100 pad6 radius8 bdr position-absolute ]" role="listbox">
      {#each options as opt, idx}
        <button
          class="[ custom-select__item ] [ row ycenter w100 pad8 radius4 text-sm ]"
          aria-selected={idx === activeIndex}
          onclick={() => select(opt.value)}
          role="option"
          aria-selected={opt.value === value}
        >
          {opt.label}
        </button>
      {/each}
    </div>
  {/if}
</div>

```

### External stylesheet (`select.sass`)

```sass
	.custom-select__dropdown
		top: 100%
		left: 0
		margin-top: 0.25rem
		background-color: var(--background10)
		border-color: var(--border)
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
		z-index: 50

	.custom-select__item
		background: none
		border: none
		cursor: pointer
		color: var(--foreground10)
		text-align: left
		&:hover, &[aria-selected="true"]
			background-color: var(--background20)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Select from './Select.svelte';

  let selected = $state('v1');
  const opts = [
    { value: 'v1', label: 'Option 1' },
    { value: 'v2', label: 'Option 2' }
  ];
</script>

<Select options={opts} bind:value={selected} />
```
