---
name: motion-ui
description: 'Production-ready UI motion system for Svelte 5 / SvelteKit on @humanspeak/svelte-motion. Use when implementing animations, transitions, or motion patterns — supplies presets, tiers, conventions, and the release checklist.'
metadata:
  origin: ECC
---

# Motion System (svelte-motion)

The system layer that turns motion-foundations / motion-patterns / motion-advanced into a consistent product language for this monorepo. Engine: `@humanspeak/svelte-motion` (Svelte 5 port of Motion). Reference corpus: `sites/fractaldesign/src/routes/sveltekit/svelte-motion/`.

## When to Activate

- Implementing any animation, transition, or motion pattern in a product app
- Reviewing motion for consistency, cost, and accessibility
- Adding motion to a new component library entry

## System Tiers

Every animation belongs to exactly one tier; tiers set the physics budget:

| Tier | Purpose | Budget | Default physics |
|---|---|---|---|
| **Feedback** | Tap, hover, focus response | ≤ 150ms feel | spring `400 / 25`; tap `scale: 0.97`, hover lift `y: -1` |
| **Presence** | Mount/unmount of modals, toasts, panels | ≤ 300ms | spring `300 / 25`, same in and out; exit ≤ `duration: 0.2` tween when snappier |
| **Layout** | Reorder, resize, shared-element (tabs, indicators) | ≤ 350ms | spring `500 / 30` for indicators; `layout` FLIP for reflow |
| **Narrative** | Page transitions, onboarding, reveals | ≤ 600ms | tween `0.3–0.6s`, `ease: 'easeOut'` or cubic-bezier `[0.16, 1, 0.3, 1]` |
| **Ambient** | Loaders, loops, decorative | any, but loop-safe | keyframes + `repeat: Infinity`; must pause off-screen and under reduced motion |

Rules:

- Never mix tiers in one element (a button is Feedback; its mount is Presence).
- Exit animations are never longer than their enter.
- Stagger is tight: `delay: i * 0.04` for stacks, `i * 0.1` for lists; cap total stagger so the last item starts within ~400ms.

## App Setup (once per app)

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	import { MotionConfig } from '@humanspeak/svelte-motion'
</script>

<MotionConfig reducedMotion="user">
	{@render children()}
</MotionConfig>
```

- `reducedMotion="user"` is mandatory in products (WCAG 2.3.3).
- Tree-shaking: named imports (`MotionDiv`) or `svelteMotionOptimize` from `@humanspeak/svelte-motion/vite` placed **before** `sveltekit()`; heavy-route features via `LazyMotion` (`domAnimation` default, `domMax` only where drag/layout live).

## Canonical Presets

Centralize, don't hand-tune per component (house style: tokens drive everything):

```ts
// lib/motion/presets.ts
import type { MotionTransition } from '@humanspeak/svelte-motion'

export const springFeedback: MotionTransition = { type: 'spring', stiffness: 400, damping: 25 }
export const springPresence: MotionTransition = { type: 'spring', stiffness: 300, damping: 25 }
export const springIndicator: MotionTransition = { type: 'spring', stiffness: 500, damping: 30 }
export const tweenContent: MotionTransition = { duration: 0.3, ease: 'easeOut' }
export const tweenNarrative: MotionTransition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] }

export const fadeUp = {
	initial: { opacity: 0, y: 8 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 8 }
}
```

## Conventions

1. **Presence**: every `{#if}`-mounted surface with an enter animation gets `AnimatePresence` + `exit` (or `initial={false}` if mount motion is unwanted). No silent disappearances after animated entries.
2. **Keys**: `key` prop on all `AnimatePresence` children; keyed `{#each}` by stable id (never index) wherever `layout` or exits are involved.
3. **One sibling `transition` per component** (corpus convention, symmetric in/out); nest a transition inside a gesture target (`whileInView={{ …, transition }}`) only when that gesture needs its own timing.
4. **One MotionValue source, many transforms** for pointer/physics-driven visuals — derived values must not desync.
5. **Imperative cleanup**: every `animate()` / `useAnimationControls` / `useAnimationFrame` has matching cleanup (`stop`/`cancel`/`$effect` return).
6. **Layout scroll containers** get `layoutScroll` when descendants use `layout`.
7. **Prefabs before custom**: use registry `AnimatedButton` / `AnimatedTabs` specs (spring 400/25, 500/30, `animated={false}` opt-out) before inventing new button/tab motion.
8. **SSR**: entry animations rely on optimized appear automatically; use `initial={false}` where hydration flicker appears.
9. Quiet-UI rule still applies: motion is weight and timing, not spectacle — one animated focal point per view.

## Review Checklist

| Check | Pass when |
|---|---|
| Tier assignment | Every animation maps to one tier; physics within budget |
| Reduced motion | `MotionConfig reducedMotion="user"` at layout root; transform keys drop automatically; ambient loops gated |
| Cleanup | No un-cancelled imperative animations; `$effect` returns cleanups |
| Presence | All animated `{#if}` surfaces have exits or explicit `initial={false}` |
| Keys | `AnimatePresence` children keyed; lists keyed by stable id |
| Perf | `transform`/`opacity` only for continuous motion; ≤ 3 simultaneous blur/backdrop layers; LazyMotion on heavy routes |
| Keyboard | `whileTap` fires on Enter/Space (native controls); focus states via `whileFocus` |
| Consistency | Presets imported from `lib/motion/presets.ts`, not inline magic numbers |

## Skill Map

| Layer | Skill |
|---|---|
| Tokens, springs, a11y, SSR | `motion-foundations` |
| Buttons, tabs, presence, stagger, scroll recipes | `motion-patterns` |
| Drag, pan physics, SVG, imperative sequences | `motion-advanced` |
| Policy, tiers, checklist (this file) | `motion-ui` |
