---
title: Markgraphy porting conventions
description: How every graph in src/lib/graphs/ is ported from the React reference — allowed frame APIs, exemplars, naming and per-component rules.
type: markgraphy
---

# Markgraphy porting conventions

How every graph in `src/lib/graphs/` is ported from the React reference in `ref/registry/default/`. Follow this exactly so all 30 components feel like one library.

## Source of truth

- Reference: `ref/registry/default/graph-<name>/graph-<name>.tsx` (React 19 + `motion/react` + Tailwind v4).
- Target: `src/lib/graphs/Graph<Name>.svelte` (Svelte 5 runes + scoped CSS).
- Frame APIs you may import (only these): `src/lib/frame/Graph.svelte`, `GraphBody.svelte`, `GraphRule.svelte`, `GraphTrack.svelte`, `GraphTick.svelte`, `GraphArrow.svelte`, `glyphs.ts`, `tone.ts`, `motion.ts`, `clock.ts`.
- Exemplars to imitate: `src/lib/graphs/GraphStat.svelte`, `GraphTable.svelte`, `GraphTimer.svelte`, `GraphCountdown.svelte`.
- Reference design rules: `ref/AGENTS.md` and `ref/registry/default/AGENTS.md`.

Read the exemplars and the ref file BEFORE writing anything.

## Component file anatomy

```svelte
<script module lang="ts">
	// Public types ONLY. These become importable named exports.
	export interface Graph<Name>Props { ... }
	export interface SomeItemType { ... }
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	// ... other frame imports, relative paths only

	let { title, corner, class: className = '', ...rest }: Graph<Name>Props = $props();
	// $derived for anything computed from props (never capture props in plain consts)
</script>

<Graph {title} {corner} class={className}>
	<GraphBody> ... </GraphBody>
</Graph>

<style>
	/* scoped CSS only */
</style>
```

Rules:
- Every graph forwards `corner?: string` to `Graph` and `class?: string` (destructured as `className`) to the outer `Graph`.
- Drawing graphs also take `glyphs?: Glyphs` and `palette?: GraphPalette` (from `../frame/glyphs` / `../frame/tone`), default mono. Non-drawing graphs (Table, Invoice, Spec, Stat, Tree, Frame) take NO palette/glyphs.
- Props must match the ref exactly: same names, same types, same defaults, same behavior.
- Types are exported from `<script module>`; the component itself stays the implicit default export.

## Runes

- Props: `let { ... }: XProps = $props();` with defaults in the destructuring.
- Any value derived from props or the `$time` store → `$derived` / `$derived.by`. Plain `const x = f(prop)` triggers `state_referenced_locally` warnings — do not ship those.
- Timers: `const time = graphNow();` then read `$time` (null during SSR). Never `setInterval` yourself.

## Scoped CSS contract

No Tailwind. No utility imports. No global styles. No `class={someDynamicString}`.

1. **Class names**: static tokens in `class="..."`; conditional styling ONLY via `class:name={bool}` directives. Interpolated class names break Svelte's CSS scoping (selectors get pruned as unused).
2. **CSS variables** (with these exact fallbacks) replace the ref's color utilities:

   | Ref class | Use |
   | --- | --- |
   | `text-foreground` | `color: var(--graph-foreground, oklch(0.93 0 0))` |
   | `text-muted-foreground` / `text-graph-muted` | `color: var(--text-secondary, oklch(0.62 0 0))` |
   | `text-graph-accent` | `color: var(--graph-accent, oklch(0.78 0.17 155))` |
   | `text-graph-accent-2` | `color: var(--graph-accent-2, oklch(0.78 0.12 70))` |
   | `text-graph-accent-3` | `color: var(--graph-accent-3, oklch(0.75 0.1 200))` |
   | `text-graph-frame` | `color: var(--border, oklch(0.6 0 0 / 0.5))` |
   | `text-graph-faint` | `color: var(--text-muted, oklch(0.3 0 0))` |
   | `opacity-40` / dim rows | `.dim { opacity: 0.4; }` + `class:dim` (or `isDim()` from tone.ts) |

3. **Inline styles**: none. The ONLY permitted runtime styling is a data-driven geometry custom property consumed by scoped CSS, e.g. `style:--offset="{pct}%"` then `margin-left: var(--offset)` (needed by Waterfall/Plot-style layout math). Nothing else.
4. **Tone helpers** (`../frame/tone`) return role strings (`'accent' | 'accent2' | 'accent3' | 'muted' | 'faint' | 'frame' | 'foreground' | 'empty'`). Map roles to scoped classes:
   ```css
   .c-accent  { color: var(--graph-accent, oklch(0.78 0.17 155)); }
   .c-accent2 { color: var(--graph-accent-2, oklch(0.78 0.12 70)); }
   .c-accent3 { color: var(--graph-accent-3, oklch(0.75 0.1 200)); }
   .c-muted   { color: var(--text-secondary, oklch(0.62 0 0)); }
   .c-frame   { color: var(--border, oklch(0.6 0 0 / 0.5)); }
   .c-fg      { color: var(--graph-foreground, oklch(0.93 0 0)); }
   .dim       { opacity: 0.4; }
   .sr-only   { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border-width: 0; }
   ```
   Copy the subset you need into each component's `<style>` (scoped CSS can't share).
5. **Tailwind→CSS cheat sheet**: `p-5`=1.25rem, `px-8`/`py-8`=2rem, `py-7`=1.75rem, `p-3`=0.75rem, `py-2.5`=0.625rem, `gap-1..8`=0.25/0.5/0.75/1/1.25/1.5/2rem, `pt-2`=0.5rem, `pb-3`=0.75rem, `min-w-6`=1.5rem, `min-w-10`=2.5rem, `size-4`=1rem, `text-sm`=0.875rem, `text-base`=1rem, `text-lg`=1.125rem, `text-xl`=1.25rem, `text-2xl`=1.5rem, `text-3xl`=1.875rem, `text-4xl`=2.25rem, `tracking-tight`=-0.025em, `sm:`=`@media (min-width: 640px)`, `whitespace-nowrap`=`white-space: nowrap`, `tabular-nums` — already inherited from `Graph`. Zero margins on `p`/`ul`/`h*` you render (the ref relies on Tailwind preflight — set `margin: 0` explicitly).
6. **Font sizes**: frame body is 0.875rem (set by Graph). Match ref's size jumps exactly.

## Layout rules (from ref/registry/default/AGENTS.md — keep them)

- Horizontal tracks that represent a range (meter, stack, activity, bullet, rank) MUST span the frame: `GraphTrack` + `GraphTick` (flex), never 1ch ticks with empty space.
- Packed graphs (spark, bars, cells, uptime) stay at 1ch per glyph, centered, small gap — never stretched edge to edge. Don't pad short uptime rows out to `columns`.
- No SVG. No canvas. No external deps. Glyphs draw the chart (`█ ▓ ▒ ░ · - = + | ├ └ ✓ ▶ ▸`).
- Numbers right-aligned via text-align; `tabular-nums` is inherited from `Graph`.

## Motion

- Replace `motion/react` variants with the `reveal` action: `use:reveal={{ delay: stagger(i, 40), amount: N }}` where `N` matches the ref's `viewport.amount` (0.4/0.5 typical).
- Stagger rows, weeks, or list items — NEVER hundreds of individual cells (activity grids stagger weeks; heatmaps stagger rows). `fillDelay`-style caps: use `stagger(i, step)` (capped 280ms).
- Single elements (Timer value, Meter track): `use:reveal={{ amount: 0.5 }}`.
- `prefers-reduced-motion` is handled inside the action. Do not add CSS animations, loops, or pulses anywhere.

## A11y

- Glyph runs / tracks are decorative: `GraphTrack` is already `aria-hidden`. Mark packed glyph rows `aria-hidden="true"` too.
- Provide ONE `<span class="sr-only">{spoken}</span>` sentence that states the figure ("elapsed 04:12", "7 of 30 cells filled"). Do not sprinkle extra sr-only nodes into tracks.
- `ul`/`ol` lists: `role="list"`. Tables: `scope="col"` on header cells. Titles: `Graph` handles `aria-labelledby`.

## Self-check before reporting

1. `pnpm check 2>&1 | tail -20` → 0 errors, 0 warnings in YOUR files (fix yours; ignore others').
2. Props API identical to ref (names/types/defaults).
3. No `style:` attributes except sanctioned geometry vars. No dynamic class strings. No new deps. No SVG.
4. Every component compiles standalone with only `../frame/*` imports.

## Report format

For each component: file path, exported props/types, any deviation from the ref and why. Plus the final `pnpm check` status.
