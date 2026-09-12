# Markgraphy — GraphWorkflow spec

A typed-data workflow diagram with auto-layout and a play/pause step-player. Status: **implemented — pending user evaluation (2026-09-06)**.

## What it is

`GraphWorkflow` takes a JSON/TS shape — `{ nodes, edges?, path? }` — and renders it as a top-down DAG of labeled ASCII boxes connected by L-shaped dashed arrows. A built-in step-player (play / pause / prev / next / dots / speed slider) lights up nodes in the order given by `path` (or a topological pass if not given). The frame, color tokens, and animation behavior match the rest of the library.

Fills the gap between three existing neighbors:

| Component | Shape | Animation | Use when |
| --- | --- | --- | --- |
| `GraphFlow` (static) | rows of nodes on dashed arrows | none | A one-row flow with accents on the live path |
| `GraphFlowPlayer` (animated) | vertical list of `[ n ] label` markers | play/pause/prev/next | An ordered step list you want to scroll through |
| `GraphSequence` (animated) | participants on columns, activation bars | participant activation | A swim-lane sequence diagram |
| `GraphState` (animated) | state boxes, labeled transitions | state transitions | A finite-state-machine chart |
| **`GraphWorkflow`** (animated) | **nodes + edges auto-laid out as a DAG** | **play/pause token through the path** | **A typed workflow from data: CI, ETL, funnel, decision tree** |

## API

```ts
import { GraphWorkflow, type WorkflowNode, type WorkflowEdge } from 'markgraphy';

const nodes: WorkflowNode[] = [
  { id: 'commit',  label: 'commit' },
  { id: 'lint',    label: 'lint' },
  { id: 'test',    label: 'test', hint: 'unit + e2e' },
  { id: 'build',   label: 'build' },
  { id: 'publish', label: 'publish' }
];

<GraphWorkflow title="DEPLOY" autoPlay {nodes} />

// Branching/diamond:
<GraphWorkflow
  title="CI DIAMOND"
  autoPlay
  nodes={[
    { id: 'push',  label: 'push' },
    { id: 'lint',  label: 'lint' },
    { id: 'unit',  label: 'unit' },
    { id: 'e2e',   label: 'e2e' },
    { id: 'build', label: 'build' },
    { id: 'ship',  label: 'ship' }
  ]}
  edges={[
    { from: 'push',  to: 'lint' },
    { from: 'push',  to: 'unit' },
    { from: 'push',  to: 'e2e' },
    { from: 'lint',  to: 'build' },
    { from: 'unit',  to: 'build' },
    { from: 'e2e',   to: 'build' },
    { from: 'build', to: 'ship' }
  ]}
/>
```

## Types

```ts
type WorkflowTone = 'default' | 'accent' | 'muted';

interface WorkflowNode {
  id: string;             // stable id, referenced by edges and path
  label: string;          // primary text inside the box
  hint?: string;          // optional second line inside the box
  tone?: WorkflowTone;    // 'accent' always paints accent, 'muted' always paints faint
}

interface WorkflowEdge {
  from: string;           // source node id
  to: string;             // target node id
  label?: string;         // (reserved — not rendered in v1)
  tone?: WorkflowTone;
}

interface GraphWorkflowProps {
  title: string;
  nodes: WorkflowNode[];
  edges?: WorkflowEdge[]; // defaults to a linear chain in nodes[].id order
  path?: string[];        // activation order; defaults to topological pass
  animated?: boolean;     // default true
  autoPlay?: boolean;     // default false; never autoplays under reduced motion
  speedMs?: number;       // per-step, default 1200
  showControls?: boolean; // default true
  label?: string;         // short caption under the diagram
  corner?: string;        // frame corner char
  class?: string;         // passed to the outer frame
}
```

## How the layout works

1. **Edges**: if `edges` is omitted, a linear chain `n0 → n1 → … → nN` is synthesized.
2. **Ranks**: a longest-path relaxation (Kahn-style). Each node's rank is the length of the longest path from any source. Cycles don't converge, so cycle nodes stay at rank 0.
3. **Layers**: nodes are grouped by rank. Within a rank, input order is preserved.
4. **Per-layer sizing**: each node's width is `max(label.length, hint.length) + 4` (2 padding + 2 borders). Height is 3 (no hint) or 4 (with hint).
5. **Per-layer placement**: each layer is centered within the diagram's max layer width, with a 2-char gap between nodes.
6. **Stacked rows**: each layer's row is `layerHeight + 2` rows below the previous (2 rows of edge gap).

## How edges are drawn

For an edge from source `(sCx, sBot)` to target `(tCx, tTop)`:

- **Same column** (`sCx === tCx`): straight `│` from `sBot` to `tTop - 1`, then `v` arrow at `tTop - 1`.
- **Different column**: corner `└──…──┐` (or `┘──…──┌` going left) at `sBot`, then `│` down to `tTop - 1`, then `v` arrow.

Edges that span more than one rank get a longer L-shape; the vertical segment passes through the intermediate ranks' rows (where it may visually cross intermediate nodes — those nodes' box characters stamp on top, so the edge appears to "jump over" the intermediate node).

Edges whose source's bottom is at or below the target's top (same row, or a cycle) are skipped.

## How activation works

- `pathIndex` maps each `id` to its index in `topologicalPath` (or `-1` if not in the path).
- The player keeps a `step` integer (default `0`), with `activeStep = step mod count`.
- A node is `active` when its path index equals `activeStep`; `done` when less; `pending` when greater or not in the path.
- An edge is `done` when both endpoints are done; `active` when the target is the active node and the source is done; otherwise `pending`.
- `tone: 'accent'` overrides the state color (always accent); `tone: 'muted'` overrides to faint.

## Controls (reused from GraphFlowPlayer)

- `▶ play` / `❚❚ pause`
- `◀` / `▶` (prev / next — wraps)
- dots per step (click to jump)
- speed slider 0.4s–2.5s

All controls pause the player when used (so the user can study a frame). Under `prefers-reduced-motion: reduce`, `autoPlay` is a no-op and the active-step pulse animation is suppressed (the player still works manually, but the state just snaps to each step).

## Integration inventory (8 surfaces)

| Surface | File | What changed |
| --- | --- | --- |
| Component | `src/lib/animated/GraphWorkflow.svelte` | **NEW** — 384 lines, Grid + drawBox + drawEdge + art $derived |
| Library exports | `src/lib/index.ts` | `GraphWorkflow` default + `WorkflowTone, WorkflowNode, WorkflowEdge, GraphWorkflowProps` types |
| Catalog | `src/site/docs/catalog.ts` | 1 entry under slugs (with 11 props); added `'graph-workflow'` to `ANIMATED_SLUGS` set |
| Preview data | `src/site/docs/previews.ts` | 1 import + 2 demo entries (DEPLOY linear, CI DIAMOND branching) with copyable code |
| LLM surface | `src/routes/(site)/llms.txt/+server.ts` | 1 row in the Animated table; count 28 → 29 |
| Sitemap | `src/routes/(site)/sitemap.xml/+server.ts` | `'graph-workflow'` in `DOC_SLUGS` |
| Animations page | `src/routes/(site)/docs/animations/+page.svelte` | 1 demo + import; header count 28 → 29; description 28 → 29 |
| Spec doc | `docs/specs/specs-markgraphy-workflow.md` | **THIS FILE** |

## Verification evidence

| Check | Result |
| --- | --- |
| `pnpm check` errors in `GraphWorkflow.svelte` | 0 |
| `pnpm build` | succeeded (5.3s, then 1.5s incremental) |
| `GET /docs/graph-workflow` | 200 |
| `GET /docs/animations` | 200 |
| `GET /llms.txt` includes `GraphWorkflow \| graph-workflow` row | yes |
| `llms.txt` count line | "All twenty-nine animations run on one page" |
| Animations page header | "Twenty-nine live glyph components" |
| Sidebar | "Workflow" listed (alphabetical) |
| Slug page render | two diagrams render with correct boxes, `v` arrows, and play controls |
| Reduced-motion screenshot | 0 in current step dot, frame at first node |

Screenshots:
- [workflow-deploy.png](file:///Users/amrit/fractalmandala/markgraphy/qa-screenshots/workflow-deploy.png) — both demo diagrams on the [slug] page.

## How to evaluate

- Live: [http://127.0.0.1:4173/docs/graph-workflow](http://127.0.0.1:4173/docs/graph-workflow) (preview server, `pnpm preview --port 4173`).
- Live: [http://127.0.0.1:4173/docs/animations](http://127.0.0.1:4173/docs/animations) — the new tile appears at the end of the grid (last in `ANIMATED_SLUGS`).
- Press ▶ to play, ◀/▶ to step, click a dot to jump. Watch the path light up top-to-bottom.
- Try the second example (CI DIAMOND) — three parallel branches fan out from `push` and merge at `build`. The path goes push → lint → build → ship by default (one valid topological order).

## Known limitations

- **Same-row edges** (within the same rank) are skipped — a cycle in the graph will leave cycle edges invisible.
- **Long-rank edges** (rank diff > 1) render as an L-shape that visually crosses intermediate ranks' nodes. The nodes' box chars stamp on top, so the edge appears interrupted; this is the documented "jump over" behavior.
- **Edge labels** are accepted on the type but not rendered in v1. The `label` field is reserved.
- **Single-column overflow**: nodes whose label + hint is longer than the available rank width will render in a wider box, which may push the rank width past the diagram and cause the parent to scroll. Hosts that need constrained width should keep labels short or use `corner` and a tighter frame.
