---
name: 'react-to-sveltekit'
description: 'Universal conversion pipeline for converting React / Next.js components and pages into Svelte 5 Runes and SvelteKit. Produces an artifact manifest covering destination files, route data, SSR boundaries, dependencies, motion fallbacks, and adaptive verification.'
---

# Universal React to SvelteKit Conversion Pipeline

This skill provides a systematic pipeline for taking React or Next.js UI written in
TypeScript/JSX (`.tsx` + `.ts`) and converting it into idiomatic **Svelte 5 Runes** and
**SvelteKit** (`.svelte` + `.ts` + `.sass`). Every conversion must emit the
[conversion output contract](./references/output-contract.md) before or alongside code.
Use the builder's [skill routing matrix](../agentic-svelte-builder/references/SKILL_ROUTING.md)
to compose the smallest relevant Svelte, accessibility, styling, route, template, and
motion skills after classifying the conversion.

## 0. Conversion boundary and output contract

Before translating code, classify the source as exactly one of:

| Source kind | Meaning | Required boundary |
| --- | --- | --- |
| `component` | Reusable UI with no page loader, route, or server behavior. | `dataFlow.loadFile` is `none`; do not create route files. |
| `route-component` | UI placed into an existing SvelteKit route. | Record the existing route; add route files only when requested. |
| `page` | React/Next page, loader, server action, mutation, or endpoint. | Select the SvelteKit route/data file and document why. |

Then emit a fenced JSON artifact manifest using the required shape in
[`output-contract.md`](./references/output-contract.md). The manifest must list exact
source files, target files, public props/bindings/callbacks/snippets, dependency status,
route data decisions, SSR mode, gaps, and verification commands. Do not mark the
conversion complete until the manifest contains concrete verification evidence.
The final receipt should also name the entry skill, applied required skills, and
conditional skills skipped with reasons.

Use the contract schema and fixtures for shape guidance:

- [`output-contract.schema.json`](./references/output-contract.schema.json)
- [`evals/evals.json`](./evals/evals.json)

---

## 🎯 Deterministic 4-Tier Motion & Engine Decision Matrix

When converting any React component, the agent MUST inspect the animation engine used in the source file and execute the matching conversion tier:

```
                       Source React Component Animation Engine
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  [ Tier 1: Framer Motion ]       [ Tier 2: GSAP ]         [ Tier 3: CSS / JS Timers ]
 `motion/react` / `framer-motion` `gsap` / `ScrollTrigger`   `useState` + inline styles / timers
        │                                │                                │
        ▼                                ▼                                ▼
  Map 1:1 to                      Preserve GSAP 1:1              Convert to Native Svelte
  @humanspeak/svelte-motion       inside Svelte 5 $effect        Runes + svelte/transition
  (<Motion>, <Presence>)          with proper ctx.revert()       or svelte/motion
```

### Tier 1: Framer Motion (`motion/react` or `framer-motion`)
- **Action**: Map to `@humanspeak/svelte-motion` only when the target workspace already
  provides or explicitly approves the package.
- **Rule**: Check `package.json` and record the result in the output manifest. When the
  package is present, map components and hooks directly:
  - `<motion.div>` $\rightarrow$ `<Motion>`
  - `<AnimatePresence>` $\rightarrow$ `<Presence>`
  - `useMotionValue(0)` $\rightarrow$ `useMotionValue(0)`
  - `useSpring(val, config)` $\rightarrow$ `useSpring(val, config)`
  - `useScroll()`, `useTransform(...)` $\rightarrow$ `useScroll()`, `useTransform(...)`
  - `layoutId="..."` $\rightarrow$ `layoutId="..."`
- **Fallback**: If the package is missing, convert simple mount/unmount to
  `transition:fade` or `transition:fly` from `svelte/transition`, and numeric physics to
  `spring()` from `svelte/motion`. Record the fallback. If behavior cannot be preserved,
  return `partial` or `blocked` instead of claiming a direct mapping.

### Tier 2: GSAP (`gsap`, `ScrollTrigger`, `SplitText`)
- **Action**: **Preserve GSAP 1:1 inside Svelte 5 `$effect`**.
- **Rule**: Keep GSAP timeline and trigger logic, but wrap inside Svelte 5 `$effect`:
  ```svelte
  <script lang="ts">
    import { gsap } from 'gsap';

    let containerEl = $state<HTMLElement | null>(null);

    $effect(() => {
      if (!containerEl) return;
      const ctx = gsap.context(() => {
        gsap.to('.card', { opacity: 1, duration: 0.5 });
      }, containerEl);

      return () => ctx.revert(); // Essential cleanup on unmount
    });
  </script>

  <div bind:this={containerEl}>...</div>
  ```

### Tier 3: CSS Transitions / Native JS Timers
- **Action**: **Convert to Native Svelte 5 Runes & `svelte/transition`**.
- **Rule**:
  - `{isOpen && <div className="fade" />}` $\rightarrow$ `{#if isOpen}<div transition:fade></div>{/if}`
  - `useState(0)` $\rightarrow$ `let count = $state(0)`
  - `useMemo(() => a + b, [a, b])` $\rightarrow$ `let sum = $derived(a + b)`

### Tier 4: Canvas / WebGL (`Three.js`, `OGL`)
- **Action**: **Bind Canvas & Lifecycle in `$effect`**.
- **Rule**: Bind `<canvas bind:this={canvasEl}>`. Initialize WebGL renderer inside `$effect` and attach a `ResizeObserver` for responsive scaling, destroying the renderer on unmount teardown.

---

## 1. Core Paradigm Translation Rules

### Rule 1: Props & Bindings
- **React**: `interface Props` + `export function Component({ value, onChange }: Props)`
- **Svelte 5**:
  ```svelte
  <script lang="ts">
    import type { ComponentProps } from './Component.types';

    let { value = $bindable(''), open = $bindable(false), onchange }: ComponentProps = $props();
  </script>
  ```
- Two-way props (e.g. `value`, `open`, `active`) use `$bindable()`.
- Children slots use `import type { Snippet } from 'svelte'` and `{@render children?.()}`.

---

## 2. State, Memoization & Effects

| React Hook (`.tsx`) | Svelte 5 Rune (`.svelte`) | Conversion Rule |
| :--- | :--- | :--- |
| `useState(initial)` | `let val = $state(initial)` | Reactive mutable state variable |
| `useRef(null)` | `let el = $state<HTMLElement \| null>(null)` | DOM node binding via `bind:this={el}` |
| `useMemo(() => fn, [deps])` | `let calc = $derived(fn)` | Auto-tracked computed values |
| `useCallback(fn, [deps])` | `function fn() { ... }` | Plain TS functions (Svelte 5 auto-tracks) |
| `useEffect(() => { ... }, [deps])` | `$effect(() => { ... })` | Reactive effect run after DOM mount |
| `useLayoutEffect(...)` | `$effect.pre(() => { ... })` | Runs before DOM mutation update |

> ⚠️ **Svelte2tsx Safety Guard**: Never name a local variable `state`, `derived`, `effect`, or `props` inside a component script block. Svelte2tsx treats those declarations as store getter shims, causing false `TS2448` scope collision errors.

---

## 3. JSX Template to Svelte HTML Syntax

- **Attributes**: `className="..."` $\rightarrow$ `class="..."`
- **Conditionals**: `{isOpen && <div>...</div>}` $\rightarrow$ `{#if isOpen}<div>...</div>{/if}`
- **Ternaries**: `{isEditing ? <Edit /> : <View />}` $\rightarrow$ `{#if isEditing}<Edit />{:else}<View />{/if}`
- **Lists / Mapping**: `{items.map(item => <div key={item.id}>...</div>)}` $\rightarrow$ `{#each items as item (item.id)}<div>...</div>{/each}`
- **Event Listeners**: `onClick={handleClick}` $\rightarrow$ `onclick={handleClick}`
- **DOM Insertion**: `dangerouslySetInnerHTML={{ __html: code }}` $\rightarrow$ `{@html code}`

---

## 4. Styling Conversion (Tailwind / `cn(...)` $\rightarrow$ CUBE CSS + JIT + SASS)

- **Bracket Grouping**: Convert Tailwind string lists into CUBE CSS layer groups:
  ```svelte
  class="[ block-name ] [ row ycenter gap12 ] [ pad16 radius8 bdr ]"
  ```
- **State Exceptions**: Replace dynamic class conditionals (`isOpen ? "bg-blue-500" : ""`) with HTML `data-*` attributes:
  ```svelte
  data-state={isOpen ? 'open' : 'closed'}
  data-variant={variant}
  ```
- **Custom SASS**: Put non-JIT styles in the adjacent external `Component.sass` example with single-tab indentation, no braces, and no semicolons. Do not embed component `<style>` blocks in conversion output.

---

## 5. SvelteKit route, data-flow, and SSR rules

Use the narrowest SvelteKit boundary that preserves behavior:

- Public, serializable page data → `+page.ts`.
- Database access, secrets, private environment variables, auth data, or
  `getServerSideProps` → `+page.server.ts`.
- Forms and mutations → `+page.server.ts` actions or `+server.ts` for endpoint behavior.
- Shared route data → `+layout.ts` or `+layout.server.ts`.
- Server load/action output must not contain functions, component constructors, DOM nodes,
  browser objects, class instances, or unresolved promises.

Never access `window`, `document`, `localStorage`, `ResizeObserver`, canvas, or GSAP DOM
targets at module top level. Put browser-only work in `$effect`/`onMount` with teardown or
behind an explicit `browser` guard. Set `ssr.mode` to `safe`, `browser-effect`,
`browser-guard`, or exceptional `disabled` and list every browser-only API in the
manifest.

## 6. Destination-file and dependency rules

List exact target paths in the manifest before editing:

- Component: `Component.svelte`, non-trivial `Component.types.ts`, and adjacent
  `Component.sass` when custom styling is needed.
- Page: `src/routes/<route>/+page.svelte` plus the selected load/action/endpoint files.
- Reusable page UI belongs under `src/lib/components/`.

Inspect the target `package.json` first. Do not install dependencies or mutate package
manifests automatically. Record installed, required, missing, and fallback dependencies.

## 7. Adaptive verification

Select checks from the destination workspace:

1. Detect package manager from `packageManager` and lockfiles.
2. Inspect available package scripts.
3. Prefer the workspace `check` script.
4. Run targeted tests when behavior, routing, actions, data flow, or SSR behavior changes.
5. Run `build` for route/SSR changes when available.
6. Use direct `svelte-check` only when no workspace check exists.

Record each command, `cwd`, purpose, status, and evidence in the manifest. Missing scripts
are `skipped` with a reason; they must not disappear from the receipt.

## 8. Execution Checklist for Agents

When requested to convert any React `.tsx` file:

1. **Classify source**: Set `component`, `route-component`, or `page` in the manifest.
2. **Plan destination files**: List exact `.svelte`, `.types.ts`, `.sass`, route, load,
   action, and endpoint files before editing.
3. **Check dependencies**: Identify workspace packages and select honest motion fallbacks.
4. **Inspect source engine**: Classify Tier 1 (Framer Motion), Tier 2 (GSAP), Tier 3
   (CSS/JS), or Tier 4 (Canvas/WebGL).
5. **Map data and SSR**: Select the SvelteKit data file, serialization boundary, and
   browser guard/effect before translating logic.
6. **Extract types**: Create `Component.types.ts` when public props/data types are
   non-trivial.
7. **Translate logic and template**: Convert hooks to Runes and JSX to Svelte directives.
8. **Apply styling**: Convert Tailwind/styled-components to CUBE CSS and adjacent
   indented SASS; do not embed component `<style>` blocks.
9. **Verify adaptively**: Run the workspace checks, targeted tests, and build as scoped;
   record evidence in the manifest.
10. **Return the receipt**: Include the final manifest, changed paths, gaps, residual risk,
    and one verdict: `ship`, `fix-first`, or `rethink`.
