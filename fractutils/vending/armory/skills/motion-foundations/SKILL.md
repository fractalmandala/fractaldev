---
name: motion-foundations
description: Motion foundations for Svelte 5 using @humanspeak/svelte-motion — core API, MotionValues, spring presets, transition options, tree-shaking, SSR safety, and reduced-motion enforcement. Foundation layer — all other motion skills depend on this.
version: 2.0
tags: [motion, animation, performance, accessibility, svelte-motion]
category: frontend
author: jeff
---

# Motion Foundations (svelte-motion)

Foundation layer for animation in this monorepo, built on **`@humanspeak/svelte-motion`** (Svelte 5 port of Motion). Everything imports from the single package root. Reference corpus: `sites/fractaldesign/src/routes/sveltekit/svelte-motion/` (docs/ for API, examples/ for recipes).

## When to Activate

- Starting any animation work in a Svelte/SvelteKit product
- Choosing between declarative props, MotionValues, or imperative APIs
- Setting up spring/tween transitions, or tuning existing ones
- Configuring reduced-motion policy or SSR-safe entry animations

## Core API

```svelte
<script>
	import { motion, AnimatePresence } from '@humanspeak/svelte-motion'

	let isVisible = $state(true)
</script>

<AnimatePresence>
	{#if isVisible}
		<motion.div
			key="box"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		/>
	{/if}
</AnimatePresence>
```

- `motion.*` namespace (`motion.div`, `motion.button`, …) or tree-shakeable named components (`MotionDiv`, `MotionButton`, …).
- Core props: `initial`, `animate`, `exit`, `transition`, `variants`, `custom`, `key` (required inside `AnimatePresence`).
- Gesture props: `whileHover`, `whileTap`, `whileFocus`, `whileInView` (+ `viewport`), `whileDrag`, `whilePan`.
- Layout props: `layout`, `layoutId`, `layoutScroll`.
- State pairs with runes: `animate={status}` where `status` is `$state<'idle' | 'loading' | 'success'>('idle')`.
- Replay a one-shot by bumping a `{#key}` block; keyed `{#each}` by stable id so FLIP sees moves, not remounts.
- Element bindings go in as **getters** (`useInView(() => el)`, `useScroll({ container: () => el })`) — bindings are undefined at script-run time.

## MotionValues

Reactive primitives outside Svelte's render cycle. Every hook returns an augmented value with a `$state`-backed `.current` getter (preferred read path), `.get()`/`.set()`, `.jump()`, `.on('change', cb)`, and a `subscribe` shim for legacy store syntax.

```svelte
<script>
	import { useSpring, useTransform, useVelocity, useMotionTemplate } from '@humanspeak/svelte-motion'

	const x = useSpring(0)
	const velocity = useVelocity(x)
	const skew = useTransform(velocity, [-1000, 0, 1000], [-20, 0, 20])
	const filter = useMotionTemplate`drop-shadow(0 0 ${skew}px rgba(0, 0, 0, 0.4))`
</script>
```

Hook inventory (all from `@humanspeak/svelte-motion`): `useMotionValue`, `useSpring`, `useFollowValue`, `useTransform`, `useMotionValueEvent`, `useInView`, `useScroll`, `useVelocity`, `useTime`, `useAnimationFrame`, `useCycle`, `useReducedMotion`, `useReducedMotionConfig`, `usePresence`, `useIsPresent`, `usePresenceData`, `useAnimate`, `useAnimationControls`, `useMotionTemplate`. Re-exported from `motion`: `animate`, `delay`, `hover`, `inView`, `press`, `scroll`, `stagger`, `transform`, easing functions, and math helpers (`clamp`, `interpolate`, `mix`, `pipe`, `wrap`).

Style binding with MotionValues:

```svelte
<motion.div style={{ x, opacity, width: 160, '--glow-x': glowX }} />
```

Transform shortcuts (`x`, `y`, `scale`, `rotate`) compose into one `transform` string; CSS variables use `setProperty`. Plain (non-motion) elements can use `styleString()`:

```svelte
<script>
	import { styleString } from '@humanspeak/svelte-motion'
	const style = styleString(() => ({ rotate: autoRotate.current, width: sliderWidth }))
</script>

<div style:={style}>…</div>
```

### Deliberate Svelte 5 divergences (do not "fix")

- `useCycle` returns `{ current, cycle }` (not a tuple) — destructuring `$state`-backed values snapshots and loses reactivity.
- `useInView` / `useReducedMotion` / `useReducedMotionConfig` return `{ current }` objects, not booleans.
- `useAnimate` returns `[scope, animate]`; scope is a Svelte 5 attachment applied with `{@attach scope}` (replacing element refs).
- `usePresence` keeps React's tuple `[isPresent, safeToRemove]`, but is only live inside a `<PresenceChild>` (outside it returns `[true, null]`); corpus wraps it: `const presence = $derived(usePresence())`.
- Live text goes through the `children` prop: `<motion.span children={percentValue} />` (slots compile to snippets).

## Transition Options

- `type`: `'spring' | 'tween' | 'inertia' | 'keyframes'`.
- Spring: `stiffness`, `damping`, `mass`, `velocity`, `restDelta`, `restSpeed`, `duration` (default 800ms), `visualDuration`, `bounce` (0–1, default 0.3). Setting stiffness/damping/mass overrides duration/bounce.
- Tween: `duration` (seconds, e.g. `0.3`), `ease` (named string, `(t) => number`, or cubic-bezier array `[0.16, 1, 0.3, 1]`), `delay`.
- Per-property overrides: `transition={{ opacity: { duration: 0.2 }, x: { type: 'spring', stiffness: 200 }, default: { duration: 0.4 } }}`.
- Corpus convention: `transition` is a **sibling** of `initial`/`animate`/`exit` targets (symmetric in/out). Nesting a transition inside a gesture target (`whileInView`) overrides the component default and binds timing to that gesture.

### Canonical spring presets (from the corpus)

| Use | Preset |
|---|---|
| Presence enter/exit symmetry | `{ type: 'spring', stiffness: 300, damping: 25 }` |
| Buttons (tap/hover) | spring `400 / 25` |
| Tab indicators (layoutId) | `{ type: 'spring', stiffness: 500, damping: 30 }` |
| Pill/badge width + stacked layout | spring `600 / 30` |
| Snap (toggle ON) | spring `700 / 30` |
| Crisp follower | spring `600 / 30` |
| Bouncy follower | spring `220 / 14` |
| Floaty follower | spring `stiffness: 70, damping: 12, mass: 4` |
| Content cross-fade | `{ duration: 0.3, ease: 'easeOut' }` |

Directional transitions are idiomatic: high-stiffness spring one way, custom `(t) => number` easing the other — the `toggle-switch` demo runs spring `700 / 30` turning on and a `1.2s` easeOutBounce tween turning off.

## Variants Basics

```svelte
<motion.div
	variants={{ open: { opacity: 1, scale: 1 }, closed: { opacity: 0, scale: 0.9 } }}
	animate={isOpen ? 'open' : 'closed'}
/>
```

- Parent `animate="visible"` cascades to any descendant that defines `variants` — children need no `animate` prop.
- Function-form variants `(custom) => keyframes` with `custom={i}` for per-instance values.
- Stagger: per-child `transition={{ delay: i * 0.1 }}` inside `{#each}` (corpus uses `i * 0.1` and `i * 0.04`), or `stagger(0.08)` with imperative `animate()`/`useAnimate`. `staggerChildren`/`delayChildren` keys are **not** part of this API.

## Performance Rules

1. Prefer `transform`/`opacity` (compositor-friendly); avoid animating layout properties.
2. Tree-shake with named imports (`MotionDiv`) or the Vite plugin:
   ```ts
   import { svelteMotionOptimize } from '@humanspeak/svelte-motion/vite'
   // place BEFORE sveltekit() in vite.config.ts
   ```
3. Code-split feature bundles with `LazyMotion` + `m.*`: `domMin` (mount/update), `domAnimation` (+ gestures/in-view), `domMax` (+ drag/layout). `features` can be `async () => domAnimation` — subtree renders `domMin`, upgrades on resolve.
4. Imperative `animate()` returns controls — always `stop()`/`cancel()` them in unmount cleanup; the closure keeps writing after the component is gone otherwise.
5. `useAnimationFrame` must be wrapped in `$effect` returning its cleanup.
6. Springs auto-settle via `restDelta`/`restSpeed` and carry velocity on retarget — prefer them over long tweens for interactive state.

## SSR Safety

- Server-render safe: initial state comes from `initial` (or first keyframe of `animate`); gesture props are inert on the server; motion-value hooks return static values.
- `initial={false}` skips the mount animation entirely — use it where SSR→client flicker matters.
- **Optimized appear**: when `initial` and `animate` resolve to non-empty WAAPI-friendly keyframes (opacity/transform), SSR elements get an appear id and an inline bootstrap starts the animation **before hydration**; runtime hands off at hydrate. This is automatic — don't disable it unless debugging.

## Accessibility Enforcement

```svelte
<MotionConfig reducedMotion="user">
	<!-- app subtree -->
</MotionConfig>
```

- Set `reducedMotion="user"` in products: respects OS `prefers-reduced-motion` (library default is `'never'`). `'always'` for previews.
- `'always'`/`'user'` strip transform keys (`x`, `y`, `scale`, `rotate`, `skew`) while opacity/color still animate.
- `useReducedMotion()` — live OS preference; `useReducedMotionConfig()` — policy resolved against the nearest `MotionConfig`.
- Manual gating idiom: `transition={reduced.current ? { duration: 0 } : { type: 'spring', stiffness: 200 }}`.
- Never disable an animation the user explicitly enabled (corpus rule of thumb). `whileTap` fires on Enter/Space; `whileFocus` pairs with `:focus-visible`. Reference: WCAG 2.3.3.
- Test: DevTools Rendering emulation, Playwright `reducedMotion: 'reduce'`.

## Decision Tree (foundation level)

| Need | Use |
|---|---|
| Simple state A → B | `animate={{ … }}` + `transition` |
| Reusable named states | `variants` + `animate={label}` |
| Temporary gesture overlay | `whileHover` / `whileTap` / `whileFocus` props |
| Continuous driver (clock, pointer) | MotionValue + `useTransform` |
| Element leaves the DOM | `AnimatePresence` + `exit` (see motion-patterns) |
| Position/size reflow | `layout` / `layoutId` (see motion-patterns) |
| Imperative, multi-step, selectors | `useAnimate` / `animate()` (see motion-advanced) |

## Related

- Skills: `motion-patterns` (recipes), `motion-advanced` (gestures/SVG/imperative), `motion-ui` (system layer)
- Corpus: `sites/fractaldesign/src/routes/sveltekit/svelte-motion/docs/` and `examples/`
