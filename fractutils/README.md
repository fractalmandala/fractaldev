# sveltekit-utils

The things you rebuild in every project. Svelte 5 runes, no dependencies, SSR-safe.

Nothing here is wired into markgraphy — this is a standalone kit, kept separate until you want it.

## Why these seven

Picked from what actually recurs in your code, not from a wishlist. In markgraphy alone:

| Utility | Evidence |
|---|---|
| `reducedMotion` | `matchMedia('(prefers-reduced-motion: reduce)')` hand-rolled in **~20 files** |
| `loop` | `setInterval` + cleanup + play/pause in **27** components under `animated/` |
| `transition` | view transitions hand-rolled **3×** — mode swipe, accent wipe, nav wipe |
| `clipboard` | copy + transient "copied" + timer cleanup in **5 files** |
| `persisted` | `accents.ts` — localStorage with try/catch and a change broadcast |
| `mode` | the toggle, plus the no-flash script in `app.html` |
| `isCompact` | asked for; nothing responsive existed yet |

## 1. Transition engine

Three independent choices — **kind × direction × easing** — through one code path.

```ts
import { transition } from '$lib/utils';
import '$lib/utils/transition/transition.css'; // once, app-wide

await transition(() => (theme = 'dark'), { kind: 'wipe', direction: 'up' });
```

**Kinds**: `wipe` (new page grows from an edge), `slide` (both pages move), `fade`, `circle` (opens from a point), `none`.
**Directions**: `up` `down` `left` `right`.
**Easings**: `linear` `out-quad` `out-cubic` `out-expo` `out-back` `in-out` `in-cubic` `stepped`, or any raw CSS timing function.

Open from the click that triggered it:

```ts
onclick={(e) => transition(apply, { kind: 'circle', origin: { x: e.clientX, y: e.clientY } })}
```

### Page transitions

```ts
// +layout.svelte
import { navTransition } from '$lib/utils';

navTransition({ kind: 'wipe', direction: 'up' });
```

Or choose per navigation — forward goes left, back goes right:

```ts
navTransition(({ from, to }) => ({
  kind: 'slide',
  direction: depth(to) > depth(from) ? 'left' : 'right'
}));
```

`transition.css` is required: it disables the browser's default cross-fade, which otherwise fights the wipe and washes it out.

Falls back to an instant swap when view transitions are unsupported, reduced motion is on, or `kind: 'none'` — callers never branch. Aborted transitions (a second navigation mid-wipe, or a hidden tab — browsers skip transitions on hidden documents) resolve silently with the DOM update still applied.

## 2. Mode toggle

Three states, not two: `dark`, `light`, and `system` — following the OS until the user chooses.

```svelte
<script>
  import { mode } from '$lib/utils';
  const m = mode();
</script>

<button onclick={() => m.toggle()}>{m.isDark ? '☾' : '☀'}</button>
```

`toggle()` defaults to the swipe: down when going dark, up when going light, so it reads as the sun setting and rising. Pass a spec to override.

The flash-of-wrong-theme problem needs code that runs before first paint, which nothing in your bundle does:

```svelte
<svelte:head>
  {@html `<script>${modeScript()}<\/script>`}
</svelte:head>
```

Persists the choice, follows the OS while on `system`, and syncs across tabs.

## 3. Responsivity

```svelte
<script>
  import { isCompact } from '$lib/utils';
  const compact = isCompact();
</script>

{#if compact.current}<MobileNav />{:else}<DeskNav />{/if}
```

True **below 1025px**. Also `isWide()`, `below(px)`, `above(px)`, `isTouch()` (coarse pointer — a better touch test than a width guess).

Queries are cached per string, so a layout, a header and a sidebar all calling `isCompact()` share **one** listener and there is nothing to clean up. On the server it reports the fallback (default `false`, desktop-first) and corrects on mount.

## 4. Collapsibles

```svelte
<script>
  import { collapsible, collapse } from '$lib/utils';
  const faq = collapsible();
</script>

<button {...faq.trigger}>Details</button>
<div {...faq.panel} use:collapse={{ open: faq.open }}>…</div>
```

`collapsible()` carries the state *and* the ARIA wiring — `aria-expanded`, `aria-controls`, and a generated id — so the pair is correct by default instead of by memory. Use `collapse` alone if you already own the state.

The `grid-template-rows: 0fr → 1fr` trick is the tidiest CSS-only answer but needs a specific wrapper/panel DOM shape. This animates height directly, so it works on any element, and covers the four things hand-rolled versions miss:

- `height: auto` is not animatable, so the natural size is measured first
- a toggle **mid-animation** resumes from the current size, never snapping to 0
- once open it returns to `auto`, so content that grows later is not clipped at a stale pixel height
- closed content leaves the tab order and the accessibility tree

Takes `axis: 'width'` for horizontal collapse, plus `duration`, `easing`, `fade`.

## 5. Resizable sidebars

```svelte
<script>
  const sidebar = resizable({ initial: 280, min: 200, max: 520, storageKey: 'nav-w' });
</script>

<div class="shell" style={sidebar.cssVar} class:dragging={sidebar.dragging}>
  <aside>…</aside>
  <div class="grip" use:resizeHandle={sidebar} {...sidebar.separator}></div>
  <main>…</main>
</div>
```
```css
.shell { grid-template-columns: var(--sidebar-width) minmax(0, 1fr); }
```

Pairs with the grid layout you already write — the store owns a number and `cssVar` hands it to the column.

Pointer Events with capture, not document-level `mousemove`: the drag keeps tracking past the window edge and works for touch and pen. Drag to resize, **arrow keys** to nudge (Shift for ×4), Home/End for min/max, double-click to reset, Enter to collapse — keyboard operation that drag handles almost never have, which is why `separator` ships the `role`/`aria-valuenow` set too.

`collapseBelow` lets a hard drag tuck the panel away; `side: 'right'` flips which direction means wider.

## 6. The rest

**`reducedMotion()`** — reactive, so it updates if the user changes the setting mid-session, unlike the one-shot read. `prefersReducedMotion()` stays available for module scope and event handlers.

**`loop(tick, { interval })`** — play/pause animation loop. Two things the hand-rolled version keeps missing: it pauses in a background tab instead of burning battery on work nobody sees, and it treats reduced motion as *start paused* rather than *never run*, so an explicit press still works. `interval` omitted means one tick per animation frame. Has `toggle()`, `step()`, and `setInterval()` that re-paces without losing running state.

**`persisted(key, initial)`** — localStorage-backed reactive state. Every hand-rolled one forgets at least one of: the try/catch (private mode throws on write), the JSON parse guard (a stale value takes the app down), cross-tab sync. Optional `validate` rejects values that no longer fit the shape.

**`clipboard()`** — copy with the transient `copied` flag, plus `failed` for insecure origins and denied permission. Owns its timer, so the reset cannot leak when a component unmounts mid-flash.

## Status

Type-checks clean under `--strict`, and under `svelte-check` inside a real SvelteKit project.

Verified by execution in a previous session: the bezier solver (out-cubic → 0.6 / 0.875 / 0.976 at t = .25/.5/.75, monotonic, `out-back` overshoots) and the wipe keyframes (`inset(100% 0 0 0)` → `inset(0 0 0 0)` on `::view-transition-new(root)`).

Not yet exercised in a browser: `slide` and `circle` kinds, `mode`, `persisted`, `loop`, `clipboard`, `collapse`, `resizable`. They are typed and reviewed, not run. Worth a smoke test in the first project that adopts this — `collapse` especially, since measure-and-interrupt is the part most likely to have a rough edge.
