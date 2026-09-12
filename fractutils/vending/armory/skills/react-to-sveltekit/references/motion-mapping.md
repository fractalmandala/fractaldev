# Framer Motion to Svelte Motion Direct Mapping Reference

This reference provides exact 1:1 code equivalences when converting React components that use Framer Motion (`motion/react` or `framer-motion`) into Svelte 5 components using `@humanspeak/svelte-motion`.

The 1:1 mapping is conditional: the target workspace must contain or explicitly approve
`@humanspeak/svelte-motion`. Otherwise, record the missing dependency and use a native
Svelte fallback where behavior permits.

## Artifact manifest

```json
{
  "contractVersion": "1.0",
  "status": "planned",
  "source": {
    "framework": "react",
    "kind": "component",
    "files": ["src/components/Modal.tsx"],
    "route": null,
    "animationTier": "framer-motion"
  },
  "target": {
    "kind": "component",
    "files": ["src/lib/components/Modal/Modal.svelte", "src/lib/components/Modal/Modal.types.ts", "src/lib/components/Modal/Modal.sass"],
    "route": null,
    "publicApi": {
      "props": ["isOpen", "children"],
      "bindings": [],
      "callbacks": [],
      "snippets": ["children"]
    }
  },
  "dependencies": {
    "present": [],
    "required": ["@humanspeak/svelte-motion"],
    "missing": ["@humanspeak/svelte-motion"],
    "fallbacks": ["Use svelte/transition for simple opacity/scale presence when approved by the implementer."]
  },
  "dataFlow": {
    "loadFile": "none",
    "reason": "Modal is a reusable component with no route data.",
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
  "gaps": ["Confirm whether the target workspace approves @humanspeak/svelte-motion before using the direct mapping."]
}
```

---

## Component Equivalences

| React Framer Motion (`.tsx`) | Svelte 5 `@humanspeak/svelte-motion` (`.svelte`) |
| :--- | :--- |
| `<motion.div animate={{ opacity: 1 }}>` | `<Motion animate={{ opacity: 1 }}>` |
| `<motion.button whileHover={{ scale: 1.05 }}>` | `<Motion whileHover={{ scale: 1.05 }}>` |
| `<AnimatePresence>` | `<Presence>` |
| `<motion.div layoutId="pill">` | `<Motion layoutId="pill">` |

---

## Hook & MotionValue Equivalences

| React Framer Motion Hook | Svelte 5 Svelte-Motion Equivalent |
| :--- | :--- |
| `const x = useMotionValue(0)` | `const x = useMotionValue(0)` |
| `const springX = useSpring(x, { stiffness: 300 })` | `const springX = useSpring(x, { stiffness: 300 })` |
| `const opacity = useTransform(x, [-100, 100], [0, 1])` | `const opacity = useTransform(x, [-100, 100], [0, 1])` |
| `const { scrollY, scrollYProgress } = useScroll()` | `const { scrollY, scrollYProgress } = useScroll()` |

---

## Code Transformation Example

**Target file plan:** `Modal.svelte` owns the component and snippet props; `Modal.types.ts`
owns shared prop/data types; `Modal.sass` owns non-JIT layout and visual rules; route data,
if needed, belongs in `+page.ts` or `+page.server.ts` according to its trust boundary.
**Motion decision:** use `@humanspeak/svelte-motion` only when it is installed and approved
by the target workspace. Otherwise use native Svelte transitions for mount/unmount and
`svelte/motion` for numeric physics. Preserve any unsupported Framer behavior as an explicit
migration decision rather than silently claiming parity.
**Reduced-motion decision:** every native or package-backed animation must honor
`prefers-reduced-motion: reduce`; disable decorative transforms and use an immediate state
change for users who request reduced motion.

### Source React Component (`.tsx`)
```tsx
import { motion, AnimatePresence } from 'framer-motion';

export function Modal({ isOpen, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Converted Svelte 5 Component (`.svelte`)
```svelte
<script lang="ts">
  import { Motion, Presence } from '@humanspeak/svelte-motion';
  import type { Snippet } from 'svelte';

  let { isOpen = false, children }: { isOpen?: boolean; children?: Snippet } = $props();
</script>

<Presence>
  {#if isOpen}
    <Motion
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", duration: 0.3 }}
    >
      {@render children?.()}
    </Motion>
  {/if}
</Presence>
```
