---
name: motion-patterns
description: Production-ready animation patterns for Svelte 5 with @humanspeak/svelte-motion — buttons, toggles, badges, tab indicators, presence/exit animations, staggers, page transitions, scroll progress, and in-view reveals. Built on motion-foundations tokens and springs.
version: 2.0
tags: [motion, animation, ui-patterns, svelte-motion]
category: frontend
author: jeff
---

# Motion Patterns (svelte-motion)

Production-ready recipes on `@humanspeak/svelte-motion`. Assumes motion-foundations. All springs/durations below are values proven in the reference corpus (`sites/fractaldesign/src/routes/sveltekit/svelte-motion/examples/`).

## When to Activate

- Implementing buttons, toggles, badges, tabs, modals, toasts, lists, page transitions, or scroll effects
- Adding exit animations to conditional or keyed content
- Wiring scroll-linked or in-view-reveal motion

## Buttons and Micro-interactions

Gesture props are temporary states that blend in and auto-revert — no `$state` or handlers needed:

```svelte
<motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }} />
```

Canonical button physics — tap 0.97 / hover lift, spring `400 / 25` (matches the shadcn AnimatedButton spec):

```svelte
<motion.button
	whileHover={{ y: -1 }}
	whileTap={{ scale: 0.97 }}
	transition={{ type: 'spring', stiffness: 400, damping: 25 }}
>…</motion.button>
```

Icon buttons: tap `scale: 0.9`, hover `scale: 1.08`. Link-style: tap `0.97`, hover `1.03`. Opt-out convention: an `animated={false}` prop that falls back to static behavior.

Mount tween (replay by bumping `{#key}`):

```svelte
{#key replayKey}
	<motion.button
		initial={{ opacity: 0, y: 10 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.6, ease: 'linear' }}
	>…</motion.button>
{/key}
```

## Toggles, Switches, Badges

Toggle switch from a single `layout` prop — flip `align-items` and FLIP does the rest; directional transition per state:

```svelte
<motion.div
	layout
	transition={isOn
		? { type: 'spring', stiffness: 700, damping: 30 }
		: { ease: bounceEase }}
/>
```

Multi-state badge — keyed child inside `AnimatePresence`, directional blur + scale swap (corpus: enter from above, exit below, identical magnitudes):

```svelte
<AnimatePresence>
	<motion.div key={state}
		initial={{ y: -40, scale: 0.5, filter: 'blur(6px)' }}
		animate={{ y: 0, scale: 1, filter: 'blur(0px)' }}
		exit={{ y: 40, scale: 0.5, filter: 'blur(6px)' }}
		transition={{ duration: 0.15, ease: 'easeInOut' }}
	>…</motion.div>
</AnimatePresence>
```

Cycle states with `useCycle`:

```svelte
<script>
	const variant = useCycle('idle', 'active', 'done')
</script>

<motion.div animate={variant.current} variants={states} onclick={() => variant.cycle()} />
```

## Tab Indicators (shared layoutId)

Only the active tab renders the indicator; all instances share one `layoutId`; wrap the conditional in `AnimatePresence` for a clean handoff. Spring `500 / 30` (shadcn AnimatedTabs default):

```svelte
<AnimatePresence>
	{#if selectedTab === tab}
		<motion.div layoutId="selected-indicator" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
	{/if}
</AnimatePresence>
```

- Multiple tab strips on a page: wrap each in `<LayoutGroup id="strip-a">` so registry keys don't collide (`strip-a::selected-indicator`).
- Content swap underneath: `AnimatePresence mode="wait"` keyed by the selected tab.

## Presence and Exit Animations

Svelte's `{#if}` tears nodes down instantly — `AnimatePresence` captures the last state, runs `exit` on a visual clone, then removes it.

```svelte
<AnimatePresence>
	{#if show}
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.8 }}
			transition={{ type: 'spring', stiffness: 300, damping: 25 }}
		/>
	{/if}
</AnimatePresence>
```

Rules:

- `key` prop (string) is required inside `AnimatePresence`; keyed `{#each}` needs matching `key={String(item.id)}`.
- Use the **same spring in and out** (300/25) for a symmetric feel — corpus keeps `transition` as a sibling of `exit`, never nested inside it.
- Clone vs owned: default children run exits on a visual clone; the `present={bool}` + `{#snippet child()}` form runs the exit on the **real node** (use when exit needs live element state).
- Modes: `'sync'` (default), `'wait'` (sequential swap), `'popLayout'` (exiting pops out of layout while the next enters).

Directional exits — forward live data into the exiting child's dynamic variants:

```svelte
<AnimatePresence custom={direction} mode="popLayout">
	<motion.div key={slide}
		variants={{
			enter: (dir) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
			exit: (dir) => ({ x: dir > 0 ? -100 : 100, opacity: 0 })
		}}
	/>
</AnimatePresence>
<!-- deep child can read it: const direction = $derived(usePresenceData<1 | -1>() ?? 1) -->
```

Fully custom exits (CSS transitions, third-party teardown): `<PresenceChild present={bool}>` + `$derived(usePresence())` → `[isPresent, safeToRemove]`; call `safeToRemove()` when done (e.g. on `transitionend`). Inside `PresenceChild`, descendant `exit` props are ignored — pick one approach per element.

## Page Transitions

```svelte
<AnimatePresence>
	{#key $page.url.pathname}
		<motion.main
			key={$page.url.pathname}
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
		>
			{@render children()}
		</motion.main>
	{/key}
</AnimatePresence>
```

## Lists and Stagger

Named-variant cascade with per-index delay (corpus: `i * 0.04` tight stacks, `i * 0.1` standard):

```svelte
<motion.div animate={isOpen ? 'open' : 'closed'} variants={container}>
	{#each notifications as n, i}
		<motion.li variants={item(i)} transition={{ delay: i * 0.04 }} />
	{/each}
</motion.div>
```

FLIP reorder — `layout` on each item, keyed `{#each}` by stable identity (corpus spring `300 / 20`):

```svelte
{#each items as item (item.id)}
	<motion.li layout>{item.label}</motion.li>
{/each}
```

Drag-reorder uses the dedicated `Reorder` API instead:

```svelte
<Reorder.Group axis="y" values={items} onReorder={(v) => (items = v)}>
	{#each items as item (item)}
		<Reorder.Item value={item} whileDrag={{ scale: 1.03 }}>{item.label}</Reorder.Item>
	{/each}
</Reorder.Group>
```

## Scroll and In-View

Scroll-linked progress bar — `useScroll` → spring-smoothed → `scaleX`:

```svelte
<script>
	const { scrollYProgress } = useScroll({ container: () => containerEl })
	const smoothed = useSpring(scrollYProgress)
</script>

<motion.div style={{ scaleX: smoothed }} />
```

In-view reveal — put the transition **inside** the `whileInView` target so it binds to the gesture:

```svelte
<motion.div
	initial={{ opacity: 0, y: 40 }}
	whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
	viewport={{ once: true, amount: 0.4 }}
/>
```

`viewport` options: `once` (latch), `amount` (`'some' | 'all' | 0..1`), `margin` (rootMargin string), `root`. For non-motion logic use `const inView = useInView(() => el, { once: true })` and read `inView.current`.

## Keyframes and Ambient Loops

```svelte
<motion.div
	animate={{ scale: [1, 2, 2, 1, 1], rotate: [0, 0, 180, 180, 0] }}
	transition={{ duration: 4, times: [0, 0.2, 0.5, 0.8, 1], repeat: Infinity, repeatDelay: 1 }}
/>
```

Spinner: `animate={{ rotate: 360 }}` + `transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}`.

## Per-Key Transition Timing (particles, bursts)

```svelte
<motion.span
	initial={{ x: 0, y: 0, opacity: 1 }}
	animate={{ x: randX, y: randY, opacity: 0 }}
	transition={{ x: { duration: 0.5 }, y: { duration: 0.9 }, opacity: { duration: 1.2 } }}
/>
```

## Prefab Components (shadcn registry)

- `AnimatedButton`: `npx shadcn-svelte@latest add https://motion.svelte.page/r/animated-button.json` — full shadcn Button API plus `animated` opt-out, `href` renders `motion.a`.
- `AnimatedTabs`: `…/r/animated-tabs.json` — bits-ui ARIA (roving tabindex, arrows/Home/End), layoutId indicator 500/30, content entrance `{ opacity: 0, y: 8 } → { opacity: 1, y: 0 }` at `duration: 0.3, ease: 'easeOut'`.

## Related

- Skills: `motion-foundations` (tokens/presets/a11y), `motion-advanced` (drag, SVG, imperative), `motion-ui` (system policy)
- Corpus: `sites/fractaldesign/src/routes/sveltekit/svelte-motion/examples/`
