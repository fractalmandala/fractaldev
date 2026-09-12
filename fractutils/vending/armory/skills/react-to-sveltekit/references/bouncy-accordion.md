# Reference Conversion: Bouncy Accordion (React .tsx → Svelte 5 .svelte)

- **Source File**: `vendors/ui-components-main/components/motion/bouncy-accordion.tsx`
- **Target Component**: `BouncyAccordion.svelte`
- **Accessibility Decision**: Preserve native button keyboard behavior. The target implementation
  must disable the slide transition under `prefers-reduced-motion: reduce`.
- **Target Files**: `BouncyAccordion.svelte`, `BouncyAccordion.types.ts`, `BouncyAccordion.sass`; route data belongs in `+page.ts` for public data or `+page.server.ts` for secrets.
- **Motion Dependency**: Use the named package only when it is present in the target `package.json`; otherwise use the documented native Svelte fallback.
- **Migration Decision**: Any React/Next behavior not represented below remains an explicit decision for the implementer; do not silently mark it complete.

## Artifact manifest

```json
{
  "contractVersion": "1.0",
  "status": "planned",
  "source": {
    "framework": "react",
    "kind": "component",
    "files": ["vendors/ui-components-main/components/motion/bouncy-accordion.tsx"],
    "route": null,
    "animationTier": "css-timer"
  },
  "target": {
    "kind": "component",
    "files": ["BouncyAccordion.svelte", "BouncyAccordion.types.ts", "BouncyAccordion.sass"],
    "route": null,
    "publicApi": {
      "props": ["items", "value", "collapsible"],
      "bindings": ["value"],
      "callbacks": [],
      "snippets": []
    }
  },
  "dependencies": {
    "present": ["svelte/transition", "svelte/easing"],
    "required": [],
    "missing": [],
    "fallbacks": []
  },
  "dataFlow": {
    "loadFile": "none",
    "reason": "Reusable component has no route data.",
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

## 1. Converted Svelte 5 Component (`BouncyAccordion.svelte`)

```svelte
<script lang="ts">
  import { slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  export type BouncyAccordionItem = {
    id: string;
    title: string;
    description?: string;
    disabled?: boolean;
  };

  type Props = {
    items: BouncyAccordionItem[];
    value?: string | null;
    collapsible?: boolean;
  };

  let { items, value = $bindable(null), collapsible = true }: Props = $props();

  function toggle(id: string) {
    if (value === id && collapsible) {
      value = null;
    } else {
      value = id;
    }
  }
</script>

<div class="[ bouncy-accordion ] [ box w100 gap12 ]">
  {#each items as item (item.id)}
    <div
      class="[ accordion-item ] [ radius12 bdr ]"
      data-state={value === item.id ? 'open' : 'closed'}
    >
      <button
        class="[ trigger ] [ row ycenter xbetween w100 pad16 text-sm bold ]"
        disabled={item.disabled}
        onclick={() => toggle(item.id)}
        aria-expanded={value === item.id}
        aria-controls={`accordion-panel-${item.id}`}
      >
        <span>{item.title}</span>
        <span class="[ chevron ] [ text-xs ]" data-state={value === item.id ? 'open' : 'closed'} aria-hidden="true">&#9660;</span>
      </button>

      {#if value === item.id}
        <div
          id={`accordion-panel-${item.id}`}
          class="[ content ] [ pad16 padtop0 text-sm color-muted ]"
          transition:slide={{ duration: 250, easing: cubicOut }}
        >
          {item.description}
        </div>
      {/if}
    </div>
  {/each}
</div>

```

### External stylesheet (`bouncy-accordion.sass`)

```sass
	.accordion-item
		background-color: var(--background10)
		border-color: var(--border)
		transition: box-shadow 0.2s ease

	.trigger
		background: none
		border: none
		cursor: pointer
		color: var(--foreground10)

	.chevron
		transition: transform 0.2s ease
		&[data-state="open"]
			transform: rotate(180deg)
```
