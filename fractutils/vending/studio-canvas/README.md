# studio-canvas

**Two grammars, one canvas.** A Svelte 5 diagram studio built on the real
`@eraserlabs/layout` corridor router — where a **layout** is a tree that compiles to
Svelte markup, and a **flow** is a graph the router routes and Mermaid exports.

The insight the whole tool is built on: wires and boxes have different grammars, so
they are two different documents.

- **Layout** is a wireframe *tree*. Structure is **containership** — you nest shapes by
  dropping them into containers — and there are no connectors at all. Nesting is what
  compiles: the measured document becomes a real Svelte 5 component with flex axes,
  gaps, and padding **inferred from geometry**, not guessed.
- **Flow** is a flowchart *graph*. Structure is **sequence** — ⌥-drag from node to node
  to connect — and every edge is routed by the production corridor pipeline
  (`LayoutManager` → `routeCorridorConnectionBatch` inside a `$derived`). Export emits
  Mermaid with **zero geometry**, because routing is the renderer's job.

## Quick start

```bash
pnpm install                          # first time: pnpm install --dangerously-allow-all-builds
pnpm --filter @eraserlabs/utils build    # dependency chain, in order
pnpm --filter @eraserlabs/layout build
pnpm --filter @eraserlabs/studio-canvas check    # svelte-check: 0 errors, 0 warnings
pnpm --filter @eraserlabs/studio-canvas build     # → packages/studio-canvas/dist
```

No build needed to just look: open **`demo-standalone.html`** — a fully self-contained
build of the app (router inlined, zero network calls).

For live development:

```bash
pnpm --filter @eraserlabs/studio-canvas dev
```

## Workspace layout

A deliberate mini-monorepo, self-contained by design:

```
packages/studio-canvas   the Svelte 5 + Vite + TS app — THE product
packages/layout          vendored corridor router (@eraserlabs/layout, MIT)
packages/utils           vendored helpers (layout's dependency)
tsconfig.base.json       shared TS config (packages extend it via ../../)
tools/strip-dist-comments.mjs  post-tsc dist cleaner (imports esbuild)
```

`pnpm-workspace.yaml` carries `onlyBuiltDependencies: [esbuild]` — pnpm 11 reads that
setting here, **not** from package.json. `esbuild` is a root devDependency because the
strip tool imports it directly.

## Using the studio

**Both modes:** select a node to rename it (the `text` field is the visible copy; the
`id` field renames the entity and becomes the generated class name — references are
rewired automatically), recolor it (fill / border / text, validated CSS colors), drag to
move (4px snap, draft routes render live, commit on release), SE handle to resize
(resize is layout-only), ⌫ to delete, Esc to deselect, arrows to nudge (Shift = 16px).
The dark **document panel** is the live measured JSON — copy it, edit it, Apply your own;
invalid input is rejected without touching the canvas.

**Layout mode:** re-role shapes as `box / row / col / grid / input / button / text` in
the inspector (grid gets a column stepper), drop shapes into containers to nest
(smallest covering container wins; drop on open canvas to detach), Enter toggles
containment. The **generate** panel shows the compiled Svelte component and a live
sandboxed preview of it.

**Flow mode:** ⌥-drag between nodes to connect (release on the same pair again to
disconnect), click a wire to select it (label, wire + label colors, straight toggle,
delete), Elbow/Ports toggles switch routing modes. The **export** panel shows the
Mermaid text — paste-ready for any Mermaid renderer.

## The document

Both modes speak the same measured envelope (authored properties verbatim, measured
sizes as floors):

```json
{
  "entities": [
    { "tag": "Shape", "id": "cta", "x": 636, "y": 236, "width": 140, "height": 40,
      "role": "button", "focal": true, "texts": [{ "text": "Subscribe" }],
      "style": { "fill": "#0ea5e9" } }
  ],
  "connections": [
    { "id": "f3", "from": "check", "to": "serve", "label": "yes",
      "connectorStyle": "elbow", "style": { "stroke": "#dc2626" } }
  ]
}
```

`role`, `style`, `focal`, and `columns` are the wireframe vocabulary (layout);
`connections` with labels and styles are the flow vocabulary. The same document feeds
the canvas, the Svelte generator, and the Mermaid exporter.

## Provenance

Developed inside the `eraserlabs/eraser-diagrams` workspace; `packages/layout` and
`packages/utils` are vendored copies of those MIT-licensed packages (kept in sync
manually — they are *not* edited here). `packages/studio-canvas` exists **only** in this
repository. Session history and remaining roadmap live in
`checkpoints/20260909-042636-studio-canvas-two-grammars-modes-split.md`.
