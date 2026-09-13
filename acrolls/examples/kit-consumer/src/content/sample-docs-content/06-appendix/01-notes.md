---
title: Notes
description: not final yet these notes
type: docs
id: 20
---

# Layout & design learnings — the Sassy header refactor

Written after building the **Sassy** surface (CSS ↔ SASS converter) in FractalDesk
and then reshaping its chrome over several rounds of feedback. This captures what
the exercise taught about laying out an app with a shared, state-aware header —
and, honestly, about the process failure of learning it one button at a time.

---

## 1. The two-zone header pattern (global + conditional)

FractalDesk's header ([`src/App.svelte`](../src/App.svelte)) is split into two
zones, and that split is the whole game:

- **Global zone** — chrome that belongs to the *app*: the title, the surface
  switcher (driven by the [`STATES`](../src/lib/states.js) registry), and any
  app-wide control. It never changes with the active surface.
- **Conditional zone** — controls and info for the *active surface only*, gated
  by `{#if app.view === '<id>'}`. It mirrors the body's surface switch.

```
┌ header ─────────────────────────────────────────────────────────────┐
│ [GLOBAL: title · surface switcher]      status · [CONDITIONAL: this   │
│                                                    surface's controls] │
└──────────────────────────────────────────────────────────────────────┘
┌ body ────────────────────────────────────────────────────────────────┐
│  the active surface's content only (no chrome of its own)              │
└──────────────────────────────────────────────────────────────────────┘
```

**Why it works:** there is exactly one bar of chrome. A surface is *content*, not
a mini-app with its own title bar. Every surface's controls appear in the same
place, at the same height, styled the same way — so the app reads as one thing,
and vertical space goes to the work, not to stacked bars.

**The load-bearing rule:** the body's `{#if app.view === …}` chain and the
header's conditional `{#if app.view === …}` branches are **two views of one
registry**. Add a surface → add its body branch *and* its header branch. They
are siblings, not a component and its toolbar.

---

## 2. The refactor: delete the per-surface sub-header

The Sassy surface first shipped with its **own** bar inside the surface —
direction toggle + method tabs — sitting directly under the app header. Two bars.
The fix was to **delete that bar and move its controls into the header's
conditional zone.**

What that required, and this is the reusable part:

- **State had to move up.** The controls lived in the surface because their state
  (`direction`, `method`, later `input`/`output`) lived there. To host the
  controls in the header (a *different* component), that state had to become
  shared. The move was to a tiny **runes module**,
  [`src/lib/sass/state.svelte.ts`](../src/lib/sass/state.svelte.ts):

  ```ts
  export const sassy = $state<{ direction: Direction; input: string; /* … */ }>({ … })
  ```

  Both the header (`App.svelte`) and the surface (`ConvertSurface.svelte`) import
  and mutate the same object. The header *drives*; the surface *reacts*.

- **Actions had to move up too.** A button in the header can't call a function
  defined in the surface. So each action became a standalone function in a plain
  module that operates on the shared state:
  [`paste.ts`](../src/lib/sass/paste.ts) (`runPaste`, `copyOutput`),
  [`disk.ts`](../src/lib/sass/disk.ts) (`runOnDisk`). The header imports and
  wires them; the surface no longer owns them.

- **The surface got simpler.** It became pure presentation: two editor panes
  bound to shared state, plus a results strip. No toolbar, no action logic.

**Result:** one header, no orphaned controls, ~40px of height reclaimed, and the
surface is now a dumb view. The generalizable shape:

> **Controls live where the chrome lives (the header). State and actions live in
> a shared module. The surface is the view.**

---

## 3. The honest part: I learned this one button at a time

The two-zone pattern was *documented in the codebase* before I started —
`states.js` and `App.svelte` both carry comments spelling out "add a header
branch when a surface needs a toolbar," and there was even a comment reading
"a mode toggle will live here later." I still built a separate in-surface bar,
and then moved things into the header **one control per round of feedback**:

1. First moved the direction toggle + method tabs (only when prompted).
2. Then removed the "Paste" concept and made "On disk" a header action (prompted).
3. Then moved the **Convert** button (prompted — "doesn't it deserve a place with
   its buddies?").
4. Then moved the **Copy** button (prompted again).

Each move was individually correct and individually *reactive*. The failure was
not seeing, at step 1, that **"where do this surface's controls live?" is one
decision that applies to all of them at once.** Convert and Copy are controls; a
control's home is the header's conditional zone; therefore they belonged there
from the moment the pattern was chosen. Splitting a single design decision across
four prompts is churn — extra diffs, extra rebuilds, and a UI that looked
half-migrated in between.

**Meta-lesson:** when you adopt a placement rule, apply it to *every element in
the same category in the same pass*. "Move this button" is a request; the
principle behind it ("controls belong in the header") is the actual instruction.
Execute the principle, not just the literal ask. And when a codebase already
states the pattern in comments, treat that as the spec — don't re-derive a worse
layout and get corrected into the documented one.

---

## Crisp checklist — patterns & anti-patterns

### Patterns (do)

- **One chrome bar.** Give the app a single header with a **global** zone
  (app-wide) and a **conditional** zone (per-active-surface). Nothing else draws
  a toolbar.
- **Registry-driven, mirrored branches.** Keep surfaces in one list; the body and
  the header's conditional zone are two switches over that same list. Add both
  together.
- **Lift control state to a shared module** (`*.svelte.ts` with `$state`) the
  moment a control needs to live outside the component that uses its value.
- **Actions as free functions over shared state** (`runPaste`, `runOnDisk`) so any
  component — header or surface — can invoke them.
- **Surface = view.** Push all controls to the header; let the surface render
  content and results only.
- **Group controls by the object they act on**, in reading order
  (mode → primary action → secondary actions): `direction · Convert · Copy · On disk`.
- **Primary action is visually primary** (one filled/accent button); everything
  else is quiet. Disable actions when their precondition is unmet
  (`Convert` off when input is empty; `Copy` off when there's no output).
- **Reclaim vertical space for the work.** Chrome is a tax; collapse duplicate
  bars.

### Anti-patterns (avoid)

- **A surface with its own title/tool bar** stacked under the app header. That's a
  second chrome bar; fold it in.
- **Orphan controls** — a button floating in the content area (the Convert button
  marooned between the two panes) instead of grouped with its peers.
- **Migrating a category one element at a time.** If direction moved to the
  header, Convert/Copy/On-disk are the same category and move in the same pass.
- **Component-local state that blocks the right layout.** If "the button can't go
  in the header because its state is in the surface," that's a signal to lift the
  state, not to leave the button misplaced.
- **Re-deriving a layout the codebase already documents.** Read the registry/
  header comments first; the pattern is usually already written down.
- **Treating a literal request as the whole instruction.** "Move this button"
  almost always means "apply the placement rule" — generalize it.

### A one-line test to catch it earlier

> For every interactive control, ask: *"What does it act on, and where do the
> other controls in that category live?"* If the answer is "the header's
> conditional zone," it goes there — **now, with all its siblings**, not next
> prompt.
