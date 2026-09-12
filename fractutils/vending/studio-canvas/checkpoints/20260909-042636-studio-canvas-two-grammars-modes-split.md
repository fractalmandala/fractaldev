---
status: in-progress
branch: none (no git repo in workspace)
timestamp: 2026-09-09T04:26:36+05:30
session_duration_s: 524
files_modified:
  - packages/studio-canvas/src/lib/studio.svelte.ts
  - packages/studio-canvas/src/lib/generate.ts
  - packages/studio-canvas/src/lib/actions.ts
  - packages/studio-canvas/src/lib/path.ts
  - packages/studio-canvas/src/lib/components/Canvas.svelte
  - packages/studio-canvas/src/lib/components/DiagramNode.svelte
  - packages/studio-canvas/src/lib/components/DiagramEdge.svelte
  - packages/studio-canvas/src/lib/components/Toolbar.svelte
  - packages/studio-canvas/src/lib/components/DocumentPanel.svelte
  - packages/studio-canvas/src/lib/components/StatsPanel.svelte
  - packages/studio-canvas/src/lib/components/CodePanel.svelte
  - packages/studio-canvas/src/App.svelte
  - packages/studio-canvas/src/main.js
  - packages/studio-canvas/package.json
  - packages/studio-canvas/vite.config.js
  - packages/studio-canvas/svelte.config.js
  - packages/studio-canvas/tsconfig.json
  - packages/studio-canvas/index.html
  - .freebuff/svelte-canvas.html
---

## Working on: studio-canvas — two grammars, one canvas

### Summary

`packages/studio-canvas` (Svelte 5 + Vite + TS, workspace package importing the real `@eraserlabs/layout`) is now a **dual-mode diagram studio**. Layout mode is a pure wireframe tree (no connectors — nesting is the structure) that compiles to real Svelte markup with geometry-inferred flex/gaps/padding. Flow mode is a flowchart graph where the corridor router routes elbow/straight edges inside a `$derived`, with ⌥-drag-to-connect, edge selection/label/color, and geometry-free Mermaid export. Rename (text + id-as-class-name), per-entity/per-connection colors, resize, roles, and the measured-JSON roundtrip all work in both modes. `svelte-check` 0 errors/0 warnings, console clean, ~30 scripted assertions passing in Preview.

### Decisions Made

- **Connectors removed from layout entirely** (user critique: wires belong to flowcharts). Two `$state` documents (`layout` tree / `flow` graph) in one store, mode-switched; per-mode history, undo, reset, JSON, Apply. Groups are layout-only; resize handles are layout-only.
- **Export symmetry by design**: layout → Svelte (geometry *is* the meaning), flow → Mermaid with **zero geometry** (routing is the renderer's job). Mermaid exporter: nodes, quoted labels, per-node fill classDefs, isolated-node warnings.
- **⌥-drag to connect**; `use:draggable` yields `altKey` gestures to `use:connectable` (both actions sit on the same element — without the guard the node follows the pointer and corrupts the drop).
- **Drop target is geometric**, not `elementFromPoint`: point-in-box against live router boxes, smallest first. Hit-testing proved flaky exactly at commit time (once returned a rect with no node ancestor during reactive flushes).
- **Structural mutations are array reassignments through `activeDoc()`** (the `$state` root), never `push`/`splice` through `$derived` views (silently fail in prod builds), and removals are id-keyed `filter`/`flatMap` (never `indexOf` — proxy identity comparisons against raw arrays fail).
- **Rename**: visible text via `meta.label` (empty reverts to base name); id via `renameId` with full reference rewiring (children's containerId, connection endpoints, selection) + validation; ids become generated markup class names. Typing bursts coalesce into single undo steps (900ms gate).
- **Colors**: `EntityStyle {fill, stroke, text}` per entity + per connection (stroke/text only; fill meaningless on a wire). Flows through SVG canvas → JSON → generated CSS (appended last, overrides win the cascade) → sandboxed preview iframe. `applyDocument` validates color syntax (hex/rgb/hsl/var-token) and never materializes empty style objects.
- **CodePanel tab resets on mode change** (`mermaid` default in flow, `svelte` in layout); stale-tab fallback bug fixed with a mode-keyed `$effect`.
- `window.__studio` debug hook set in App.svelte `$effect` — the scripted gauntlet asserts against model truth, not just DOM.

### Remaining Work

1. **Mermaid import** — paste `flowchart TD` text → editable flow document; completes the roundtrip.
2. **Connection drawing from faces/ports** (drop near a face picks that face) instead of node centers; wire-color support in the Mermaid exporter (edge classDefs).
3. **Double-click-to-edit text on canvas**; multi-select/marquee; NW/N/E/S resize handles (SE only today).
4. **Token Studio integration** — palette dropdown replacing native color pickers + live WCAG AA checks (plumbing already exists end-to-end).
5. **Export + LLM prompt button** — download generated component with a ready-to-paste interaction-wiring prompt.
6. **Fold the mode system into the flagship MDP Studio plan** — one project file, schema-driven inspector, both grammars as views.
7. **Promote the scripted gauntlet to Playwright CI.**

### Notes

- **Rebuild/preview pipeline**: `pnpm --filter @eraserlabs/studio-canvas check && pnpm --filter @eraserlabs/studio-canvas build`, then the node inliner (script in session history; replaces `<script src>`/`<link href>` with inline content using **function replacers** — `$&` in the minified bundle corrupts string replacements) → `.freebuff/svelte-canvas.html` (~357KB, self-contained). Preview serves the thread workspace only: `register_preview` with `htmlPath: /Users/amrit/fractalmandala/vendors/eraser-diagrams-main/.freebuff/svelte-canvas.html`.
- **Project root**: `/Users/amrit/fractalmandala/vendors/eraser-diagrams-main`. **The workspace has no git repo** — all work lives on disk only.
- **Router contract**: `new LayoutManager({entities, connections: []})` → `routeCorridorConnectionBatch({repair:true, labels:true, pinUnaffectedRoutes:true, repairTimeBudgetMs:Infinity})`; straight connections join AFTER the batch via `straightConnectionEndpoints` + `manager.addConnection`; collapse consecutive duplicate output vertices.
- **Synthetic-event gotchas**: `setPointerCapture` throws for synthetic pointerIds (try/catch, window-level listeners carry the gesture); `altKey:true` must be passed on EVERY event of a connect gesture; dispatch pointerdown at the inner `<rect>`, move/up on `window`; `getScreenCTM` cached at gesture start (ancestor scroll skews deltas otherwise).
- gstack companion binaries (`gstack-config`, `gstack-slug`, `gstack-paths`) are NOT installed on this machine (`~/.claude/skills/gstack/` doesn't exist) — config/state fell back to defaults; `routing_declined` could not be persisted, so the routing question may re-ask.
- Generated CSS is scoped under `.wireframe`; preview iframe uses `sandbox="allow-same-origin"` + `srcdoc`; seeds are wireframe-realistic (auth-flow for flow, subscribe-card for layout).

### Relocation (2026-09-09)

Moved to `/Users/amrit/fractalmandala/fractutils/vending/studio-canvas/` as a self-contained mini-monorepo: `packages/studio-canvas` (the moved Svelte app), vendored `packages/layout` + `packages/utils` (dependency chain), root `tsconfig.base.json` + `tools/strip-dist-comments.mjs` (referenced via `../../`), `pnpm-workspace.yaml` (with `onlyBuiltDependencies: [esbuild]` — pnpm 11 reads it from here, NOT package.json), root `package.json` (typescript, vitest, esbuild for the strip tool), `demo-standalone.html` (runnable artifact), and this checkpoint. `pnpm install --dangerously-allow-all-builds` was needed once for esbuild's postinstall. Verified from the new home: `tsc -b` for utils/layout, full layout build incl. strip tool, `svelte-check` 0/0, vite build. The old eraser repo retains its own copies of layout/utils; `packages/studio-canvas` now exists ONLY in the vending.
