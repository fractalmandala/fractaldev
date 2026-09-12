---
name: motion-advanced
description: Advanced motion patterns for Svelte 5 with @humanspeak/svelte-motion — drag & pan physics, swipe gestures, live text readouts, SVG path drawing and morphing, imperative sequences (useAnimate), animation controls, and loaders. Requires motion-foundations.
version: 2.0
tags: [motion, animation, advanced, gestures, svg, svelte-motion]
category: frontend
author: jeff
---

# Motion Advanced (svelte-motion)

Advanced recipes on `@humanspeak/svelte-motion` — gestures, physics-driven interactions, SVG, and imperative orchestration. Assumes motion-foundations; proven values from `sites/fractaldesign/src/routes/sveltekit/svelte-motion/examples/`.

## When to Activate

- Drag & drop, swipe-to-dismiss, or pan-driven interactions
- Live numeric/text readouts driven by animation
- SVG path drawing, motion paths, or path morphing
- Multi-step imperative sequences across many elements (`useAnimate`, `animate()`, `useAnimationControls`)

## Drag

```svelte
<motion.div
	drag
	dragConstraints={{ top: -50, left: -50, right: 50, bottom: 50 }}
	dragElastic={0.2}
	whileDrag={{ scale: 1.05 }}
/>
```

- `drag`: `true | 'x' | 'y'`; `dragConstraints` accepts a bounds object **or** an element via `bind:this`.
- `dragElastic` default `0.35` (`0` = hard stop, `1` = full stretch); `dragMomentum` default `true`; `dragSnapToOrigin` to return on release.
- `dragDirectionLock` locks the axis after a 4px threshold (`onDirectionLock(axis)`); `dragListener={false}` + `dragControls` (`createDragControls()`, `controls.start(event, { snapToCursor: true })`) for custom drag handles.
- `DragTransition` tuning: `bounceStiffness` (200), `bounceDamping` (40), `power` (0.8), `timeConstant` (700).
- Callbacks receive `(event: PointerEvent, info: DragInfo)` — `info.point`, `info.delta`, `info.offset`, `info.velocity` (each `{x, y}`).

## Pan and Swipe Physics

Pan is the lower-level primitive (no constraints/momentum). Dismiss decisions are always **distance OR velocity** — corpus-proven thresholds:

| Interaction | Commit when |
|---|---|
| Bottom sheet dismiss | `info.offset.y > 120 \|\| info.velocity.y > 700` (downward-only, no `Math.abs`) |
| Swipe card fly-off | `Math.abs(info.offset.x) > 140 \|\| Math.abs(info.velocity.x) > 650` |

Swipe card recipe — one source MotionValue feeds all derived visuals so they can't desync:

```svelte
<script>
	const x = useMotionValue(0)
	const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18])
	const likeOpacity = useTransform(x, [40, 140], [0, 1])
	const dislikeOpacity = useTransform(x, [-140, -40], [1, 0])

	function onPanEnd(_, info) {
		const passDistance = Math.abs(info.offset.x) > 140
		const passVelocity = Math.abs(info.velocity.x) > 650
		// velocity decides direction first; offset is the fallback
		const direction = passVelocity
			? Math.sign(info.velocity.x)
			: Math.sign(info.offset.x || info.velocity.x)
		if (direction !== 0 && (passDistance || passVelocity)) {
			animate(x, direction * 600, { type: 'spring', stiffness: 200, damping: 26 })
				.then(() => (deck = deck.slice(1)))
		} else {
			animate(x, 0, { type: 'spring', stiffness: 360, damping: 30 })
		}
	}
</script>

<motion.div style={{ x, rotate }} onpan={onPan} onpanend={onPanEnd}>
	<motion.span style={{ opacity: likeOpacity }}>LIKE</motion.span>
</motion.div>
```

Bottom sheet release — clamp while panning (`y.set(Math.max(0, info.offset.y))`), then commit or snap back:

```ts
function onPanEnd(_, info) {
	const dismiss = info.offset.y > 120 || info.velocity.y > 700
	if (dismiss) {
		animate(sheetY, 400, { type: 'spring', stiffness: 300, damping: 30 })
			.then(() => (open = false))
	} else {
		animate(sheetY, 0, { type: 'spring', stiffness: 400, damping: 32 })
	}
}
```

Pan callbacks: `onPanSessionStart` (pointerdown), `onPanStart` (after 3px threshold), `onPan` (per frame), `onPanEnd` (only if start fired). Velocity is smoothed over 100ms. `whilePan` applies keyframes while panning.

## Live Text and Counters

Live readout — MotionValue as `children` writes straight to `textContent`:

```svelte
<script>
	const formatted = useTransform(progress, (v) => `${Math.round(v * 100)}%`)
</script>

Score <motion.span children={formatted} />
```

Numeric counter via imperative `animate(from, to, options)`:

```ts
const controls = animate(0, 100, { duration: 5, onUpdate: (v) => (count = Math.round(v)) })
onMount(() => () => controls.stop()) // always clean up
```

Value-reactive bounce (characters-remaining idiom): map color with `transform([2, 6], [pink, grey])` and drive a settle-to-1 spring from `$effect`, feeding remaining characters in as `velocity`:

```ts
$effect(() => {
	animate(counterEl, { scale: 1 }, {
		type: 'spring',
		stiffness: 700,
		damping: 80,
		velocity: transform([0, 5], [50, 0])(charactersRemaining)
	})
})
```

## SVG: Path Drawing, Motion Paths, Morphing

Draw-on with `pathLength`:

```svelte
<motion.path d={pathD} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
```

Motion path — one path drives drawing and an element riding it:

```svelte
<motion.path d={pathD} animate={{ pathLength: [0, 1] }} transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }} />
<motion.div
	style="offset-path: path('M …')"
	animate={{ offsetDistance: ['0%', '100%'] }}
	transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
/>
```

Path morphing — precompute interpolators once (e.g. flubber), drive a single progress value:

```ts
const interpolators = paths.map((p, i) => flubber.interpolate(p, paths[(i + 1) % paths.length]))
const d = useTransform(progress, (v) => interpolators[Math.floor(v)](v % 1))
animate(progress, pathIndex + 1, { onComplete: () => (pathIndex += 1) })
```

## Imperative Orchestration

### `useAnimate` — scoped, selector-based sequences

```svelte
<script>
	const [scope, animate] = useAnimate()

	function play() {
		animate([
			['li', { opacity: 1, x: 0 }, { delay: stagger(0.08) }],
			['button', { scale: [1, 1.1, 1] }, { at: '-0.2' }]
		])
	}
</script>

<ul {@attach scope}>…</ul>
```

- Scope is a Svelte 5 attachment: `{@attach scope}`; selectors resolve against `scope.current`.
- Sequence timing: `at: 0` parallel, `at: '-0.2'` overlap 200ms, `at: 1.5` absolute.
- Returns awaitable controls (`play`, `pause`, `stop`, `cancel`, `complete`, `time`, `speed`, `finished`); auto-cleans up on detach.

### `animate()` — standalone imperative

`animate(targetOrValue, keyframes, options)` for elements, MotionValues, or raw numbers. **Always capture and cancel on unmount** — the closure keeps writing otherwise:

```ts
const controls = animate(el, { backgroundColor: ['#ff0088', '#0d63f8'] }, { duration: 2 })
onDestroy(() => controls.cancel())
```

### `useAnimationControls` — shared across components

```ts
const controls = useAnimationControls()
await controls.start('launch')  // resolves when all subscribers finish
controls.set('verified')        // synchronous jump
controls.stop()
```

```svelte
<motion.div animate={controls} variants={{ launch: {…}, verified: {…} }} />
```

Throws if `start`/`set` is called before mount.

## Frame-Loop Animation

```ts
$effect(() => {
	return useAnimationFrame((time, delta) => {
		el.style.transform = `rotateX(${Math.sin(time / 1000) * 45}deg)`
	})
})
```

Write directly to `element.style` to bypass Svelte reactivity. Shared timelines: `useTime('key')` returns the same clock for every caller with that key; pass a shared `id` to phase-lock multiple `useTime()` components.

## Loaders and Ambient Motion

- Spinner: `animate={{ rotate: 360 }}`, `repeat: Infinity`, `ease: 'linear'`.
- Breathing loop: keyframe arrays + `times`, `repeat: Infinity`, `repeatDelay` for pauses.
- Orbit/Lissajous: one `useTime()` → derived `x`/`y` with different periods stay phase-locked.
- Respect reduced motion for all ambient loops (motion-foundations §Accessibility) — ambient motion is the first thing to disable.

## Decision Tree

| Situation | Reach for |
|---|---|
| Gesture overlay on one element | `whileHover` / `whileTap` / `whileFocus` props |
| Draggable with bounds/momentum | `drag` + `dragConstraints` |
| Custom swipe logic with velocity | `onPan*` + `useMotionValue` + `useTransform` |
| Many DOM children, no motion wrappers | `useAnimate` + `{@attach scope}` |
| One-off element/value animation | standalone `animate()` with cleanup |
| Coordinated state across components | `useAnimationControls` |
| Per-frame custom math | `useAnimationFrame` in `$effect` |
| SVG draw/morph | `pathLength` / `offset-path` / interpolator + progress value |

## Related

- Skills: `motion-foundations`, `motion-patterns`, `motion-ui`
- Corpus: `sites/fractaldesign/src/routes/sveltekit/svelte-motion/examples/` (pan, use-animate, path-morphing, motion-path, use-time, …)
