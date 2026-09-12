# Svelte 5 Native Combobox / Command Palette

A search-filterable Combobox / Command Palette component powered by **Svelte 5 Runes** (`$state`, `$derived`, `$props`). Features fuzzy query filtering via `$derived()`, keyboard arrow traversal, and dynamic option selection.

---

## Component Implementation (`Combobox.svelte`)

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

  let { options, value = $bindable(''), placeholder = 'Search...', onselect }: Props = $props();

  let search = $state('');
  let open = $state(false);
  let highlightedIndex = $state(0);

  // Derived filtered options based on search query
  let filteredOptions = $derived(
    options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
  );

  let selectedOption = $derived(options.find(o => o.value === value));

  function select(val: string) {
    value = val;
    onselect?.(val);
    open = false;
    search = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') open = true;
      return;
    }

    if (e.key === 'ArrowDown') {
      highlightedIndex = (highlightedIndex + 1) % filteredOptions.length;
    } else if (e.key === 'ArrowUp') {
      highlightedIndex = (highlightedIndex - 1 + filteredOptions.length) % filteredOptions.length;
    } else if (e.key === 'Enter' && filteredOptions[highlightedIndex]) {
      select(filteredOptions[highlightedIndex].value);
    } else if (e.key === 'Escape') {
      open = false;
    }
  }
</script>

<div class="[ combobox ] [ box w100 position-relative ]">
  <button
    class="[ input ] [ row ycenter xbetween w100 pad8 padleft12 padright12 radius6 bdr text-sm ]"
    onclick={() => open = !open}
    onkeydown={handleKeydown}
    aria-expanded={open}
  >
    <span>{selectedOption ? selectedOption.label : placeholder}</span>
    <span aria-hidden="true">&#9662;</span>
  </button>

  {#if open}
    <div class="[ combobox__dropdown ] [ box w100 pad8 radius8 bdr position-absolute ]">
      <input
        type="text"
        bind:value={search}
        onkeydown={handleKeydown}
        placeholder="Type to filter..."
        class="[ input ] [ w100 pad6 marginbot8 text-sm ]"
        autofocus
      />

      <div class="[ combobox__list ] [ box maxh200 ]" role="listbox">
        {#each filteredOptions as opt, idx}
          <button
            class="[ combobox__item ] [ row ycenter w100 pad8 radius4 text-sm ]"
            data-state={idx === highlightedIndex ? 'active' : 'inactive'}
            onclick={() => select(opt.value)}
            role="option"
            aria-selected={opt.value === value}
          >
            {opt.label}
          </button>
        {:else}
          <div class="[ pad8 text-xs color-muted text-center ]">No matches found</div>
        {/each}
      </div>
    </div>
  {/if}
</div>

```

### External stylesheet (`combobox.sass`)

```sass
	.combobox__dropdown
		top: 100%
		left: 0
		margin-top: 0.25rem
		background-color: var(--background10)
		border-color: var(--border)
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
		z-index: 50

	.combobox__list
		overflow-y: auto

	.combobox__item
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
  import Combobox from './Combobox.svelte';

  let selectedFramework = $state('svelte');
  const frameworks = [
    { value: 'svelte', label: 'Svelte 5' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue.js' }
  ];
</script>

<Combobox options={frameworks} bind:value={selectedFramework} />
```
