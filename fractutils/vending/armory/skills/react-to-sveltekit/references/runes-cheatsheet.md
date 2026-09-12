# React Hooks to Svelte 5 Runes Cheatsheet

This reference details state, effect, ref, and prop conversions from React hooks into Svelte 5 runes.

**Target file plan:** place the converted component in `Component.svelte`, shared interfaces
in `Component.types.ts`, custom styling in `Component.sass`, and route data in `+page.ts`
or `+page.server.ts` when the example is used by a route. Browser-only work belongs in
`$effect`; unresolved React behavior must be recorded as a migration decision.

## Artifact manifest

For a hook-only component conversion, emit a component manifest before translating the
examples. The route boundary is intentionally `none` unless the source is a page or
receives route data.

```json
{
  "contractVersion": "1.0",
  "status": "planned",
  "source": {
    "framework": "react",
    "kind": "component",
    "files": ["src/components/Counter.tsx"],
    "route": null,
    "animationTier": "none"
  },
  "target": {
    "kind": "component",
    "files": ["src/lib/components/Counter/Counter.svelte", "src/lib/components/Counter/Counter.types.ts"],
    "route": null,
    "publicApi": {
      "props": ["initialValue"],
      "bindings": [],
      "callbacks": [],
      "snippets": []
    }
  },
  "dependencies": { "present": [], "required": [], "missing": [], "fallbacks": [] },
  "dataFlow": {
    "loadFile": "none",
    "reason": "Hook-only component has no route data.",
    "serverData": [],
    "actions": [],
    "invalidations": [],
    "serialization": "not-applicable"
  },
  "ssr": { "mode": "safe", "browserOnlyApis": [], "guards": [], "disabledReason": null },
  "verification": [],
  "gaps": []
}
```

---

## State Conversion (`useState` $\rightarrow$ `$state`)

```tsx
// React (.tsx)
const [count, setCount] = useState(0);
const [user, setUser] = useState<{ id: string; name: string } | null>(null);

// Update
setCount(count + 1);
```

$$\Downarrow$$

```svelte
<!-- Svelte 5 (.svelte) -->
<script lang="ts">
  let count = $state(0);
  let user = $state<{ id: string; name: string } | null>(null);

  // Direct mutation
  count += 1;
</script>
```

---

## Computed Values (`useMemo` $\rightarrow$ `$derived`)

```tsx
// React (.tsx)
const doubleCount = useMemo(() => count * 2, [count]);
```

$$\Downarrow$$

```svelte
<!-- Svelte 5 (.svelte) -->
<script lang="ts">
  let doubleCount = $derived(count * 2);
</script>
```

---

## Side Effects (`useEffect` $\rightarrow$ `$effect`)

```tsx
// React (.tsx)
useEffect(() => {
  console.log("Count changed:", count);
  return () => console.log("Cleanup");
}, [count]);
```

$$\Downarrow$$

```svelte
<!-- Svelte 5 (.svelte) -->
<script lang="ts">
  $effect(() => {
    console.log("Count changed:", count);
    return () => console.log("Cleanup");
  });
</script>
```

---

## Component Props (`props` $\rightarrow$ `$props`)

```tsx
// React (.tsx)
interface Props {
  title: string;
  value?: string;
  onChange?: (val: string) => void;
}

export function Header({ title, value = '', onChange }: Props) { ... }
```

$$\Downarrow$$

```svelte
<!-- Svelte 5 (.svelte) -->
<script lang="ts">
  interface Props {
    title: string;
    value?: string;
    onchange?: (val: string) => void;
  }

  let { title, value = $bindable(''), onchange }: Props = $props();
</script>
```
