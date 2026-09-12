# Reference Conversion: Command Palette (React .tsx → Svelte 5 .svelte)

- **Source File**: `vendors/ui-components-main/components/motion/command-palette.tsx`
- **Target Component**: `CommandPalette.svelte`
- **Target Files**: `CommandPalette.svelte`, `CommandPalette.types.ts`, `CommandPalette.sass`; route data belongs in `+page.ts` for public data or `+page.server.ts` for secrets.
- **Motion Dependency**: Use the named package only when it is present in the target `package.json`; otherwise use the documented native Svelte fallback.
- **Migration Decision**: Any React/Next behavior not represented below remains an explicit decision for the implementer; do not silently mark it complete.
- **Accessibility Decision**: Keep the keyboard behavior shown here. The target implementation
  must disable decorative transitions under `prefers-reduced-motion: reduce`.

## Artifact manifest

```json
{
  "contractVersion": "1.0",
  "status": "planned",
  "source": {
    "framework": "react",
    "kind": "component",
    "files": ["vendors/ui-components-main/components/motion/command-palette.tsx"],
    "route": null,
    "animationTier": "css-timer"
  },
  "target": {
    "kind": "component",
    "files": ["CommandPalette.svelte", "CommandPalette.types.ts", "CommandPalette.sass"],
    "route": null,
    "publicApi": {
      "props": ["open", "options"],
      "bindings": ["open"],
      "callbacks": ["options[].action"],
      "snippets": []
    }
  },
  "dependencies": {
    "present": ["svelte/transition"],
    "required": [],
    "missing": [],
    "fallbacks": []
  },
  "dataFlow": {
    "loadFile": "none",
    "reason": "Command options are supplied by the parent component.",
    "serverData": [],
    "actions": [],
    "invalidations": [],
    "serialization": "not-applicable"
  },
  "ssr": {
    "mode": "safe",
    "browserOnlyApis": [],
    "guards": [],
    "disabledReason": null
  },
  "verification": [],
  "gaps": []
}
```

---

## 1. Converted Svelte 5 Component (`CommandPalette.svelte`)

```svelte
<script lang="ts">
  import { fade, scale } from 'svelte/transition';

  type CommandOption = {
    id: string;
    label: string;
    category?: string;
    action: () => void;
  };

  type Props = {
    open?: boolean;
    options: CommandOption[];
  };

  let { open = $bindable(false), options }: Props = $props();

  let search = $state('');
  let highlightedIndex = $state(0);

  let filtered = $derived(
    options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
  );

  function execute(opt: CommandOption) {
    opt.action();
    open = false;
    search = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      highlightedIndex = (highlightedIndex + 1) % (filtered.length || 1);
    } else if (e.key === 'ArrowUp') {
      highlightedIndex = (highlightedIndex - 1 + filtered.length) % (filtered.length || 1);
    } else if (e.key === 'Enter' && filtered[highlightedIndex]) {
      execute(filtered[highlightedIndex]);
    } else if (e.key === 'Escape') {
      open = false;
    }
  }
</script>

{#if open}
  <div class="[ backdrop ] [ row ycenter xcenter position-fixed ]" transition:fade={{ duration: 150 }} onclick={() => open = false} role="presentation">
    <div
      class="[ palette ] [ box maxw500 w100 pad16 radius12 bdr ]"
      transition:scale={{ duration: 150, start: 0.95 }}
      onclick={(e) => e.stopPropagation()}
      onkeydown={handleKeydown}
       role="dialog"
       aria-modal="true"
       aria-label="Command palette"
    >
      <input
        type="text"
        bind:value={search}
        placeholder="Type a command or search..."
         class="[ input ] [ w100 pad12 marginbot12 radius6 text-sm ]"
         autofocus
         role="combobox"
         aria-expanded={open}
         aria-controls="command-palette-options"
         aria-activedescendant={filtered[highlightedIndex] ? `command-${filtered[highlightedIndex].id}` : undefined}
      />

       <div
         class="[ list ] [ box maxh300 ]"
         id="command-palette-options"
         role="listbox"
       >
        {#each filtered as opt, idx (opt.id)}
          <button
            class="[ item ] [ row ycenter xbetween w100 pad10 radius6 text-sm ]"
            onclick={() => execute(opt)}
             role="option"
             id={`command-${opt.id}`}
            aria-selected={idx === highlightedIndex}
          >
            <span>{opt.label}</span>
            {#if opt.category}
              <span class="[ text-xs color-muted ]">{opt.category}</span>
            {/if}
          </button>
        {:else}
          <div class="[ pad16 text-center text-sm color-muted ]">No commands found</div>
        {/each}
      </div>
    </div>
  </div>
{/if}

```

### External stylesheet (`command-palette.sass`)

```sass
	.backdrop
		inset: 0
		background-color: rgba(15, 23, 42, 0.5)
		backdrop-filter: blur(4px)
		z-index: 100

	.palette
		background-color: var(--background10)
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)

	.list
		overflow-y: auto

	.item
		background: none
		border: none
		cursor: pointer
		color: var(--foreground10)
		text-align: left
		&:hover, &[aria-selected="true"]
			background-color: var(--background20)
```
