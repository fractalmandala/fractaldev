/**
 * The document store — Svelte 5 runes (factory pattern from the .svelte.js docs).
 *
 * TWO documents, one studio — because wires and boxes have different grammars:
 *
 *  - `layout` — a wireframe tree. Structure is *containership* (entity → containerId);
 *    there are no connectors at all. Compiles to real Svelte markup via generate.ts.
 *  - `flow` — a flowchart graph. Structure is *sequence* (connection → from/to);
 *    shapes are plain nodes, and the @eraserlabs/layout corridor router routes the
 *    edges — the thing it was actually built for. Exports to Mermaid via generate.ts.
 *
 * Both models mirror the MDP split envelope: authored properties verbatim, measured
 * boxes as floors. Routes are $derived from boxes through the production pipeline —
 * the same call the render package makes in Chromium. Mode swaps which document the
 * getters and mutations address; the two documents never bleed into each other.
 */
import {
  LayoutManager,
  routeCorridorConnectionBatch,
  straightConnectionEndpoints,
  type LayoutEntity,
  type NewConnection,
} from '@eraserlabs/layout';

export const SNAP = 4;
export const MIN_W = 48;
export const MIN_H = 28;
export const SCENE = { width: 1100, height: 520 } as const;

export type Mode = 'layout' | 'flow';

export type Primitive = 'box' | 'row' | 'col' | 'grid' | 'input' | 'button' | 'text';

/** Grid `role` may carry a column count; a shape's label overrides its base name. */
export interface RoleMeta {
  z?: number;
  label?: string;
}

/** Per-entity color overrides. Any CSS color is valid (hex, rgb(), var(--token)). */
export interface EntityStyle {
  fill?: string;
  stroke?: string;
  text?: string;
}

export const ROLE_LABELS: Record<Primitive, string> = {
  box: 'Box',
  row: 'Row',
  col: 'Column',
  grid: 'Grid',
  input: 'Input',
  button: 'Button',
  text: 'Text',
};

export function isContainerRole(role: Primitive | undefined): boolean {
  return role === 'row' || role === 'col' || role === 'grid';
}

const FACE_BY_PORT: Record<string, 'up' | 'down' | 'left' | 'right'> = {
  top: 'up',
  bottom: 'down',
  left: 'left',
  right: 'right',
};

export interface StudioEntity {
  id: string;
  tag: 'Shape' | 'Group';
  containerId: string | null;
  text: string;
  x: number;
  y: number;
  minW: number;
  minH: number;
  focal?: boolean;
  /** Wireframe primitive — layout mode only; flow nodes are plain shapes. */
  role?: Primitive;
  meta?: RoleMeta;
  style?: EntityStyle;
}

export interface StudioConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
  connectorStyle: 'elbow' | 'straight';
  fromPort?: 'top' | 'right' | 'bottom' | 'left';
  toPort?: 'top' | 'right' | 'bottom' | 'left';
  /** Flow only: styling for the routed wire itself. */
  style?: EntityStyle;
}

export interface StudioDocument {
  entities: StudioEntity[];
  connections: StudioConnection[];
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoutedEdge {
  id: string;
  pts: [number, number][];
  label?: string;
  textPlacement: { x: number; y: number; width: number; height: number } | null;
  style: 'elbow' | 'straight';
  colors?: EntityStyle;
}

let seq = 0;

/** The layout seed: a pure tree. No connections — nesting IS the structure. */
function layoutSeed(): StudioDocument {
  return {
    entities: [
      // two free boxes — drag-drop one onto the other to form a column
      { id: 'box1', tag: 'Shape', containerId: null, text: 'Box 1', x: 84, y: 80, minW: 180, minH: 88, role: 'box' },
      { id: 'box2', tag: 'Shape', containerId: null, text: 'Box 2', x: 328, y: 148, minW: 180, minH: 88, role: 'box' },
      // a wireframe card, already composed
      {
        id: 'card1', tag: 'Group', containerId: null, text: 'Card', x: 612, y: 72, minW: 388, minH: 260,
      },
      { id: 'head', tag: 'Shape', containerId: 'card1', text: 'Headline', x: 636, y: 96, minW: 340, minH: 32, role: 'text' },
      { id: 'sub', tag: 'Shape', containerId: 'card1', text: 'Supporting copy sits here', x: 636, y: 136, minW: 340, minH: 44, role: 'text' },
      { id: 'field', tag: 'Shape', containerId: 'card1', text: 'Email', x: 636, y: 188, minW: 340, minH: 40, role: 'input' },
      { id: 'cta', tag: 'Shape', containerId: 'card1', text: 'Subscribe', x: 636, y: 236, minW: 140, minH: 40, role: 'button', focal: true },
      { id: 'btn2', tag: 'Shape', containerId: 'card1', text: 'Cancel', x: 836, y: 236, minW: 140, minH: 40, role: 'button' },
    ],
    connections: [],
  };
}

/** The flow seed: a shape graph for the corridor router — its native habitat. */
function flowSeed(): StudioDocument {
  return {
    entities: [
      { id: 'start', tag: 'Shape', containerId: null, text: 'Start', x: 96, y: 232, minW: 128, minH: 56 },
      { id: 'parse', tag: 'Shape', containerId: null, text: 'Parse request', x: 312, y: 232, minW: 176, minH: 56 },
      { id: 'check', tag: 'Shape', containerId: null, text: 'Auth valid?', x: 576, y: 232, minW: 168, minH: 56 },
      { id: 'serve', tag: 'Shape', containerId: null, text: 'Serve data', x: 832, y: 112, minW: 168, minH: 56 },
      { id: 'deny', tag: 'Shape', containerId: null, text: 'Return 401', x: 832, y: 348, minW: 168, minH: 56 },
    ],
    connections: [
      { id: 'f1', from: 'start', to: 'parse', connectorStyle: 'elbow' },
      { id: 'f2', from: 'parse', to: 'check', connectorStyle: 'elbow' },
      { id: 'f3', from: 'check', to: 'serve', label: 'yes', connectorStyle: 'elbow' },
      { id: 'f4', from: 'check', to: 'deny', label: 'no', connectorStyle: 'elbow' },
      { id: 'f5', from: 'deny', to: 'start', connectorStyle: 'straight' },
    ],
  };
}

export function createStudio() {
  /** Which document is on stage. The two models coexist; nothing is destroyed on switch. */
  let mode = $state<Mode>('layout');
  let layout = $state<StudioDocument>(layoutSeed());
  let flow = $state<StudioDocument>(flowSeed());

  let measured = $state<Record<string, { w: number; h: number }>>({});
  let selection = $state<string | null>(null);
  let selectedEdge = $state<string | null>(null);
  let draft = $state<{ id: string; x: number; y: number } | null>(null);
  let resize = $state<{ id: string; w: number; h: number } | null>(null);
  /** Live ghost while ⌥-dragging a new connection in flow mode. */
  let connecting = $state<{ from: string; x: number; y: number } | null>(null);
  let history = $state<Record<Mode, string[]>>({ layout: [], flow: [] });
  let lastEditKey = '';
  let historyTimer: ReturnType<typeof setTimeout> | undefined;

  /** The active document — every getter is routed through here for reads. */
  const doc = $derived(mode === 'layout' ? layout : flow);
  const entities = $derived(doc.entities);
  const connections = $derived(doc.connections);

  /**
   * The active document as the REAL $state proxy — for structural mutations
   * (push / splice / reassign). A $derived is a readonly view: array mutations
   * through it silently fail in production builds, so every structural edit must
   * go through this function, never through `doc` / `entities` / `connections`.
   */
  function activeDoc(): StudioDocument {
    return mode === 'layout' ? layout : flow;
  }

  const nodes = $derived(entities.filter((e) => e.tag !== 'Group'));
  const groups = $derived(entities.filter((e) => e.tag === 'Group'));
  const selectedId = $derived(selection);
  const selectedEntity = $derived(entities.find((e) => e.id === selection) ?? null);
  const selectedConn = $derived(connections.find((c) => c.id === selectedEdge) ?? null);

  function snap(v: number): number {
    return Math.round(v / SNAP) * SNAP;
  }
  function snapUp(v: number): number {
    return Math.ceil(v / SNAP) * SNAP;
  }
  function eById(id: string): StudioEntity | undefined {
    return entities.find((e) => e.id === id);
  }

  /** Mint an id that collides with nothing currently in the active model. */
  function freshId(prefix: string): string {
    let id: string;
    do {
      seq += 1;
      id = `${prefix}${seq}`;
    } while (eById(id) || connections.some((c) => c.id === id));
    return id;
  }

  /** Measured box: authored minimums are floors, content can grow. */
  function boxOf(id: string): Box {
    const e = eById(id);
    if (!e) return { x: 0, y: 0, width: MIN_W, height: MIN_H };
    const floors = sizeFloors(e);
    const m = measured[id];
    const isDraft = draft !== null && draft.id === id;
    const isResize = resize !== null && resize.id === id;
    // While resizing, the role floor rules — the authored size must not ratchet
    // against shrinking. Outside a gesture, authored size stays a floor (seed intent).
    const authoredW = isResize ? floors.w : Math.max(floors.w, e.minW);
    const authoredH = isResize ? floors.h : Math.max(floors.h, e.minH);
    // Label auto-fit may grow a box the user has not explicitly sized, but never
    // beyond the authored size: an explicit resize is authoritative over measurement.
    const measureW = m ? Math.min(m.w, authoredW) : 0;
    const measureH = m ? Math.min(m.h, authoredH) : 0;
    return {
      x: isDraft && draft ? draft.x : e.x,
      y: isDraft && draft ? draft.y : e.y,
      width: Math.max(authoredW, measureW, isResize && resize ? resize.w : 0),
      height: Math.max(authoredH, measureH, isResize && resize ? resize.h : 0),
    };
  }

  /**
   * Per-primitive ergonomic floors (document units) — constants per role, never
   * derived from authored size, so a resize can always shrink back down. Flow
   * nodes are plain boxes.
   */
  function sizeFloors(e: StudioEntity): { w: number; h: number } {
    if (e.tag === 'Group') return { w: 160, h: 120 };
    if (mode === 'flow') return { w: 80, h: 32 };
    switch (e.role) {
      case 'button':
        return { w: 96, h: 36 };
      case 'input':
        return { w: 120, h: 36 };
      case 'text':
        return { w: 80, h: 20 };
      case 'grid':
      case 'row':
      case 'col':
        return { w: 120, h: 80 };
      default:
        return { w: MIN_W, h: MIN_H };
    }
  }

  /**
   * The boxes the router consumes, in its vocabulary. Layout containers that hold
   * children get router padding (their layout gutters); empty ones route edge-to-edge.
   */
  const nodeBoxes = $derived.by(() => {
    const boxes = new Map<string, Box>();
    for (const e of entities) {
      const b = boxOf(e.id);
      let width = b.width;
      let height = b.height;
      let hasKids = false;
      if (e.tag === 'Group') {
        let needW = 0;
        let needH = 0;
        for (const m of entities) {
          if (m.containerId !== e.id) continue;
          hasKids = true;
          const mb = boxOf(m.id);
          needW = Math.max(needW, mb.x + mb.width - b.x);
          needH = Math.max(needH, mb.y + mb.height - b.y);
        }
        if (hasKids) {
          width = Math.max(width, snapUp(needW + 24));
          height = Math.max(height, snapUp(needH + 24));
        }
      }
      const pad = hasKids ? 16 : 0;
      boxes.set(e.id, {
        x: b.x + pad,
        y: b.y + pad,
        width: Math.max(SNAP, width - pad * 2),
        height: Math.max(SNAP, height - pad * 2),
      });
    }
    return boxes;
  });

  /**
   * Route every connection through the production corridor pipeline. Boxes in,
   * drawable geometry out — the browser twin of the render package's routeScene.
   */
  const routed = $derived.by(() => {
    const list: RoutedEdge[] = [];
    if (connections.length === 0) {
      return { list, stats: { batch: 'batch', status: '—', ms: '<0.1 ms' } };
    }
    const graphEntities: LayoutEntity[] = [...nodeBoxes.entries()].map(([id, b]) => {
      const e = eById(id);
      const isGroup = e?.tag === 'Group';
      return {
        id,
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
        containerId: e?.containerId ?? null,
        isContainer: isGroup ? true : undefined,
        options:
          isGroup && entities.some((m) => m.containerId === id)
            ? { containerPadding: { top: 16, right: 16, bottom: 16, left: 16 } }
            : undefined,
      };
    });
    const manager = new LayoutManager({ entities: graphEntities, connections: [] });
    const elbowBatch: NewConnection[] = [];
    const straightBatch: NewConnection[] = [];
    for (const c of connections) {
      const size = c.label ? { width: c.label.length * 7.2 + 12, height: 18 } : undefined;
      const conn: NewConnection = {
        id: c.id,
        from: c.from,
        to: c.to,
        fromArrowhead: false,
        toArrowhead: true,
        ...(size
          ? { textPlacement: { x: 0, y: 0, width: size.width, height: size.height } }
          : {}),
      };
      if (c.fromPort) conn.authoredFromFace = FACE_BY_PORT[c.fromPort];
      if (c.toPort) conn.authoredToFace = FACE_BY_PORT[c.toPort];
      if (c.connectorStyle === 'straight') straightBatch.push(conn);
      else elbowBatch.push(conn);
    }
    const t0 = performance.now();
    if (elbowBatch.length > 0) {
      routeCorridorConnectionBatch({
        layoutManager: manager,
        connectionsToRoute: elbowBatch,
        options: {
          repair: true,
          labels: true,
          pinUnaffectedRoutes: true,
          repairTimeBudgetMs: Number.POSITIVE_INFINITY,
        },
      });
    }
    // Straight connections join after the batch — the router adopts incumbents into
    // its orthogonal world, and one diagonal would drop the batch to fallback.
    for (const s of straightBatch) {
      const fe = eById(s.from);
      const te = eById(s.to);
      if (!fe || !te) continue;
      const opts: { fromFace?: 'up' | 'down' | 'left' | 'right'; toFace?: 'up' | 'down' | 'left' | 'right' } = {};
      const fromFace = s.authoredFromFace;
      const toFace = s.authoredToFace;
      if (fromFace) opts.fromFace = fromFace;
      if (toFace) opts.toFace = toFace;
      const fb = nodeBoxes.get(s.from);
      const tb = nodeBoxes.get(s.to);
      if (!fb || !tb) continue;
      const [p1, p2] = straightConnectionEndpoints(
        { ...fe, ...fb },
        { ...te, ...tb },
        opts,
      );
      manager.addConnection({
        ...s,
        x: p1[0],
        y: p1[1],
        points: [
          [0, 0],
          [p2[0] - p1[0], p2[1] - p1[1]],
        ],
      });
    }
    const ms = performance.now() - t0;
    let corridor = 0;
    let fallback = 0;
    let straightN = 0;
    for (const c of connections) {
      const lc = manager.getConnectionById(c.id);
      if (!lc) continue;
      const raw: [number, number][] = [
        [lc.x, lc.y],
        ...lc.points.map((p) => [lc.x + p[0], lc.y + p[1]] as [number, number]),
      ];
      // Collapse consecutive duplicate vertices — straight addConnection repeats the origin.
      const pts = raw.filter(
        (p, i) => i === 0 || p[0] !== raw[i - 1][0] || p[1] !== raw[i - 1][1],
      );
      const diagonal = pts.length === 2 && pts[0][0] !== pts[1][0] && pts[0][1] !== pts[1][1];
      if (c.connectorStyle === 'straight') straightN += 1;
      else if (diagonal) fallback += 1;
      else corridor += 1;
      list.push({
        id: c.id,
        pts,
        label: c.label,
        textPlacement: lc.textPlacement ?? null,
        style: c.connectorStyle ?? 'elbow',
        colors: c.style,
      });
    }
    const stats = {
      batch: draft || resize ? 'draft' : 'batch',
      status: `${corridor} corridor · ${straightN > 0 ? `${straightN} straight · ` : ''}${fallback} fallback`,
      ms: ms < 0.05 ? '<0.1 ms' : `${ms.toFixed(1)} ms`,
    };
    return { list, stats };
  });

  const onGrid = $derived(entities.every((e) => e.x % SNAP === 0 && e.y % SNAP === 0));

  /** The active document as the measured-JSON envelope. */
  const documentJson = $derived.by(() => ({
    entities: entities.map((e) => {
      const b = nodeBoxes.get(e.id) ?? { width: MIN_W, height: MIN_H };
      const o: Record<string, unknown> = { tag: e.tag, id: e.id, x: e.x, y: e.y };
      if (e.containerId) o.containerId = e.containerId;
      o.width = Math.max(e.minW, b.width);
      o.height = Math.max(e.minH, b.height);
      if (e.role) o.role = e.role;
      if (e.meta?.z) o.columns = e.meta.z;
      if (e.focal) o.focal = true;
      if (e.style) o.style = e.style;
      if (e.tag === 'Group') o.title = { text: e.text };
      else o.texts = [{ text: e.meta?.label ?? e.text }];
      return o;
    }),
    connections: connections.map((c) => {
      const o: Record<string, unknown> = { id: c.id, from: c.from, to: c.to };
      if (c.label) o.label = c.label;
      if (c.connectorStyle === 'straight') o.connectorStyle = 'straight';
      if (c.fromPort) o.fromPort = c.fromPort;
      if (c.toPort) o.toPort = c.toPort;
      if (c.style) o.style = c.style;
      return o;
    }),
  }));

  /* ---------------- history ---------------- */

  function pushHistory(): void {
    history[mode].push(
      JSON.stringify({ entities: doc.entities, connections: doc.connections }),
    );
    if (history[mode].length > 50) history[mode].shift();
    lastEditKey = '';
    clearTimeout(historyTimer);
  }

  /**
   * History gate for keystroke-driven edits: one undo step per editing burst
   * (900ms of silence or a different edit key starts a new step) instead of one
   * per character.
   */
  function editBegin(key: string): void {
    if (lastEditKey !== key) pushHistory();
    lastEditKey = key;
    clearTimeout(historyTimer);
    historyTimer = setTimeout(() => {
      lastEditKey = '';
    }, 900);
  }

  /* ---------------- mutations: measures + move + resize ---------------- */

  function setMeasure(id: string, w: number, h: number): void {
    const cur = measured[id];
    if (!cur || Math.abs(cur.w - w) > 0.5 || Math.abs(cur.h - h) > 0.5) {
      measured[id] = { w, h };
    }
  }

  /** Groups are layout containers — not draggable in flow mode (nothing nests there). */
  function beginDrag(id: string): { ox: number; oy: number; blocked: boolean } {
    const e = eById(id);
    if (!e || e.tag === 'Group') return { ox: 0, oy: 0, blocked: true };
    selection = id;
    selectedEdge = null;
    return { ox: e.x, oy: e.y, blocked: false };
  }
  function moveDraft(id: string, x: number, y: number): void {
    const e = eById(id);
    if (!e || e.tag === 'Group') return;
    const b = nodeBoxes.get(id) ?? { width: MIN_W, height: MIN_H };
    draft = {
      id,
      x: Math.max(0, Math.min(SCENE.width - b.width, x)),
      y: Math.max(0, Math.min(SCENE.height - b.height, y)),
    };
  }
  /** Commit: snap to the 4px grid; layout containers grow to keep covering members. */
  function commitDrag(id: string): void {
    if (!draft || draft.id !== id) {
      draft = null;
      return;
    }
    pushHistory();
    const e = eById(id);
    if (e) {
      e.x = snap(draft.x);
      e.y = snap(draft.y);
      if (mode === 'layout') {
        dropIntoContainer(e);
      }
      growToContain(e);
    }
    draft = null;
  }
  function cancelDrag(): void {
    draft = null;
  }

  /**
   * The container (Group or row/col/grid role) whose box covers the point, smallest
   * first — so dropping into a nested container adopts the innermost one.
   */
  function containingTarget(e: StudioEntity): StudioEntity | null {
    if (mode !== 'layout') return null;
    const point = { x: e.x + 8, y: e.y + 8 };
    let best: StudioEntity | null = null;
    let bestArea = Infinity;
    for (const g of entities) {
      if (g.id === e.id) continue;
      if (!(g.tag === 'Group' || isContainerRole(g.role))) continue;
      const b = nodeBoxes.get(g.id);
      if (!b) continue;
      if (point.x >= b.x && point.y >= b.y && point.x <= b.x + b.width && point.y <= b.y + b.height) {
        const area = b.width * b.height;
        if (area < bestArea) {
          best = g;
          bestArea = area;
        }
      }
    }
    return best;
  }

  /**
   * Drop-through containment on release (layout only): the smallest container
   * covering the drop point adopts the shape. Structural membership is how
   * generate.ts nests markup — flow has no notion of any of this.
   */
  function dropIntoContainer(e: StudioEntity): void {
    if (e.tag === 'Group' || mode !== 'layout') return;
    const target = containingTarget(e);
    const next = target ? target.id : null;
    if ((e.containerId ?? null) !== next) {
      e.containerId = next;
      growToContain(e);
    }
  }

  function nudge(id: string, dx: number, dy: number): void {
    const e = eById(id);
    if (!e || e.tag === 'Group') return;
    pushHistory();
    const b = nodeBoxes.get(id) ?? { width: MIN_W, height: MIN_H };
    e.x = Math.max(0, Math.min(SCENE.width - b.width, snap(e.x + dx)));
    e.y = Math.max(0, Math.min(SCENE.height - b.height, snap(e.y + dy)));
    growToContain(e);
  }

  /* -------- resize (bottom-right handle) -------- */

  function beginResize(id: string): { w: number; h: number; blocked: boolean } {
    const e = eById(id);
    if (!e) return { w: 0, h: 0, blocked: true };
    selection = id;
    selectedEdge = null;
    const b = boxOf(id);
    return { w: b.width, h: b.height, blocked: false };
  }
  function moveResize(id: string, w: number, h: number): void {
    if (!eById(id)) return;
    resize = {
      id,
      w: Math.max(MIN_W, snap(w)),
      h: Math.max(MIN_H, snap(h)),
    };
  }
  function commitResize(id: string): void {
    if (!resize || resize.id !== id) {
      resize = null;
      return;
    }
    const e = eById(id);
    if (e) {
      pushHistory();
      const floors = sizeFloors(e);
      e.minW = Math.max(floors.w, resize.w);
      e.minH = Math.max(floors.h, resize.h);
      // Growing a container must keep covering its members; growing a member must
      // not escape its container.
      growToContain(e);
      if (e.tag === 'Group') {
        for (const m of entities) {
          if (m.containerId === e.id) growToContain(m);
        }
      }
    }
    resize = null;
  }
  function cancelResize(): void {
    resize = null;
  }

  /** Grow container so its router box still covers the (moved/grown) member. */
  function growToContain(e: StudioEntity): void {
    if (mode !== 'layout' || !e.containerId) return;
    const g = eById(e.containerId);
    const gb = g ? nodeBoxes.get(g.id) : undefined;
    const mb = nodeBoxes.get(e.id);
    if (!g || !gb || !mb) return;
    const wantLeft = Math.min(g.x, e.x - 16);
    const wantTop = Math.min(g.y, e.y - 16);
    const wantRight = Math.max(g.x + gb.width, e.x + mb.width + 16);
    const wantBottom = Math.max(g.y + gb.height, e.y + mb.height + 16);
    const nx = snap(wantLeft);
    const ny = snap(wantTop);
    g.x = nx;
    g.y = ny;
    g.minW = Math.max(sizeFloors(g).w, snapUp(wantRight - nx));
    g.minH = Math.max(sizeFloors(g).h, snapUp(wantBottom - ny));
  }

  /* -------- connecting (flow only) -------- */

  /** Begin a ⌥-drag from a node: the ghost tracks the pointer in document coords. */
  function beginConnect(id: string): boolean {
    if (mode !== 'flow') return false;
    const e = eById(id);
    if (!e) return false;
    selection = id;
    selectedEdge = null;
    const b = nodeBoxes.get(id) ?? { x: e.x, y: e.y, width: MIN_W, height: MIN_H };
    connecting = { from: id, x: b.x + b.width / 2, y: b.y + b.height / 2 };
    return true;
  }
  function moveConnect(x: number, y: number): void {
    if (!connecting) return;
    connecting = { ...connecting, x: snap(x), y: snap(y) };
  }
  /** Commit on release over a node (not the origin): toggle connect/disconnect. */
  function commitConnect(targetId: string | null): boolean {
    const from = connecting?.from;
    connecting = null;
    if (!from || mode !== 'flow' || !targetId || targetId === from) return false;
    const existing = connections.find((c) => c.from === from && c.to === targetId);
    if (existing) {
      deleteConnection(existing.id);
      return false;
    }
    pushHistory();
    const d = activeDoc();
    // Reassignment, not push: a fresh array reference is unambiguously reactive
    // through the $state → $derived proxy chain (and id-based lookups below avoid
    // ever comparing proxy identity against the raw arrays).
    d.connections = [
      ...d.connections,
      { id: freshId('c'), from, to: targetId, connectorStyle: 'elbow' },
    ];
    return true;
  }
  function cancelConnect(): void {
    connecting = null;
  }

  /* -------- selection: entities and edges -------- */

  function selectEdge(id: string): void {
    selectedEdge = id;
    selection = null;
  }

  /* -------- primitive roles, labels, styles, deletion -------- */

  /** Re-role the selected entity (layout only); grid gets a default column count. */
  function setRole(id: string, role: Primitive): void {
    const e = eById(id);
    if (!e || mode !== 'layout') return;
    pushHistory();
    e.role = role;
    if (role === 'grid' && !e.meta?.z) e.meta = { ...e.meta, z: 2 };
  }
  function setGridColumns(id: string, z: number): void {
    const e = eById(id);
    if (!e || mode !== 'layout' || e.role !== 'grid') return;
    pushHistory();
    e.meta = { ...e.meta, z: Math.max(1, Math.min(6, Math.round(z))) };
  }
  /**
   * Rename an entity's visible copy (what generate.ts emits as element text /
   * Mermaid node label). Groups rename their title; leaves override their label —
   * clearing the field reverts a leaf to its base name. `immediate` coalesces typing.
   */
  function relabel(id: string, label: string, immediate = false): void {
    const e = eById(id);
    if (!e) return;
    if (immediate) editBegin(`relabel:${mode}:${id}`);
    else pushHistory();
    const clean = label.trim();
    if (e.tag === 'Group') {
      e.text = clean || e.text;
    } else if (clean) {
      e.meta = { ...e.meta, label: clean };
    } else if (e.meta) {
      const rest = { ...e.meta };
      delete (rest as { label?: string }).label;
      e.meta = Object.keys(rest).length > 0 ? rest : undefined;
    }
  }

  /**
   * Rename an entity's id — the identifier that becomes the generated markup's
   * class name. Rewires every reference: children's containerId and connection
   * endpoints. Throws with a readable message on invalid or taken ids.
   */
  function renameId(id: string, nextId: string): void {
    const e = eById(id);
    if (!e) return;
    const clean = nextId.trim();
    if (clean === id) return;
    if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(clean)) {
      throw new Error('id must start with a letter and use letters, digits, - or _');
    }
    if (eById(clean) || connections.some((c) => c.id === clean)) {
      throw new Error(`id "${clean}" is already in use`);
    }
    pushHistory();
    e.id = clean;
    if (selection === id) selection = clean;
    for (const m of entities) {
      if (m.containerId === id) m.containerId = clean;
    }
    for (const c of connections) {
      if (c.from === id) c.from = clean;
      if (c.to === id) c.to = clean;
    }
  }

  /**
   * Per-entity color overrides (fill / stroke / text). `immediate` coalesces
   * color-picker scrubbing into one undo step. Empty values clear the override.
   */
  function setStyle(id: string, patch: EntityStyle, immediate = false): void {
    const e = eById(id);
    if (!e) return;
    if (immediate) editBegin(`style:${mode}:${id}`);
    else pushHistory();
    const next: EntityStyle = { ...e.style };
    for (const k of ['fill', 'stroke', 'text'] as const) {
      const v = patch[k];
      if (v === undefined) continue;
      const clean = v.trim();
      if (clean) next[k] = clean;
      else delete next[k];
    }
    e.style = Object.keys(next).length > 0 ? next : undefined;
  }

  /** Per-connection styling (flow): the wire's stroke and its label color. */
  function setEdgeStyle(id: string, patch: EntityStyle, immediate = false): void {
    const c = connections.find((k) => k.id === id);
    if (!c || mode !== 'flow') return;
    if (immediate) editBegin(`edgeStyle:${id}`);
    else pushHistory();
    const next: EntityStyle = { ...c.style };
    for (const k of ['fill', 'stroke', 'text'] as const) {
      const v = patch[k];
      if (v === undefined) continue;
      const clean = v.trim();
      if (clean) next[k] = clean;
      else delete next[k];
    }
    // On a wire, `fill` is meaningless — only stroke (the line) and text (the label).
    delete next.fill;
    c.style = Object.keys(next).length > 0 ? next : undefined;
  }

  /** Rename a connection's label (flow); empty clears it. */
  function setEdgeLabel(id: string, label: string, immediate = false): void {
    const c = connections.find((k) => k.id === id);
    if (!c || mode !== 'flow') return;
    if (immediate) editBegin(`edgeLabel:${id}`);
    else pushHistory();
    const clean = label.trim();
    if (clean) c.label = clean;
    else delete c.label;
  }

  /** Delete the entity; its children are freed, its connections rewired away. */
  function deleteEntity(id: string): void {
    const e = eById(id);
    if (!e) return;
    pushHistory();
    const d = activeDoc();
    for (const m of entities) {
      if (m.containerId === id) {
        m.containerId = e.containerId;
        growToContain(m);
      }
    }
    // Rewire or drop connections; id-keyed removal (never indexOf — proxy identity
    // comparisons against the raw arrays silently fail).
    d.connections = d.connections.flatMap((c) => {
      if (c.from !== id && c.to !== id) return [c];
      if (mode === 'layout' && c.from === id && c.to !== id && e.containerId) {
        const rewired = { ...c, from: e.containerId };
        if (!d.connections.some((k) => k.from === rewired.from && k.to === rewired.to && k.id !== c.id)) {
          return [rewired];
        }
      }
      return [];
    });
    d.entities = d.entities.filter((m) => m.id !== id);
    if (selection === id) selection = null;
    if (selectedEdge && !d.connections.some((c) => c.id === selectedEdge)) selectedEdge = null;
  }

  /** Delete a connection (flow). */
  function deleteConnection(id: string): void {
    const c = connections.find((k) => k.id === id);
    if (!c) return;
    pushHistory();
    const d = activeDoc();
    d.connections = d.connections.filter((k) => k.id !== id);
    if (selectedEdge === id) selectedEdge = null;
  }

  function toggleContain(id: string): boolean {
    const e = eById(id);
    if (!e || e.tag === 'Group' || mode !== 'layout') return false;
    pushHistory();
    if (e.containerId) {
      e.containerId = null;
    } else {
      const target = containingTarget(e);
      e.containerId = target ? target.id : null;
    }
    growToContain(e);
    return e.containerId !== null;
  }
  function select(id: string): void {
    selection = id;
    selectedEdge = null;
  }
  function deselect(): void {
    selection = null;
    selectedEdge = null;
  }
  function toggleElbow(): boolean {
    if (mode !== 'flow') return true;
    pushHistory();
    const anyElbow = connections.some((c) => c.connectorStyle !== 'straight');
    for (const c of connections) c.connectorStyle = anyElbow ? 'straight' : 'elbow';
    return !anyElbow;
  }
  /** Toggle pinned faces; returns whether faces are PINNED after the toggle. */
  function togglePorts(): boolean {
    if (mode !== 'flow') return false;
    pushHistory();
    const pinned = connections.every((c) => c.fromPort === 'right');
    for (const c of connections) {
      if (pinned) {
        delete c.fromPort;
        delete c.toPort;
      } else {
        c.fromPort = 'right';
        c.toPort = 'left';
      }
    }
    return !pinned;
  }

  /** New shape. Layout mints a wireframe box; flow mints a plain graph node. */
  function addNode(): string {
    pushHistory();
    const n = nodes.length + 1;
    const id = freshId('node');
    const isLayout = mode === 'layout';
    const d = activeDoc();
    d.entities = [
      ...d.entities,
      {
        id,
        tag: 'Shape' as const,
        containerId: null,
        text: isLayout ? `Box ${n}` : `Step ${n}`,
        x: snap(84 + ((n * 24) % 96)),
        y: snap(isLayout ? 320 + ((n * 40) % 120) : 320),
        minW: isLayout ? 180 : 128,
        minH: isLayout ? 88 : 56,
        role: isLayout ? ('box' as const) : undefined,
      },
    ];
    selection = id;
    return id;
  }

  /** Switch documents. Selections and gestures are per-mode; clear them on the way out. */
  function setMode(next: Mode): void {
    if (next === mode) return;
    draft = null;
    resize = null;
    connecting = null;
    selection = null;
    selectedEdge = null;
    mode = next;
  }

  function undo(): boolean {
    const snapshot = history[mode].pop();
    if (!snapshot) return false;
    const restored = JSON.parse(snapshot) as StudioDocument;
    const d = activeDoc();
    d.entities = restored.entities;
    d.connections = restored.connections;
    selection = null;
    selectedEdge = null;
    draft = null;
    resize = null;
    return true;
  }
  function reset(): void {
    pushHistory();
    if (mode === 'layout') layout = layoutSeed();
    else flow = flowSeed();
    selection = null;
    selectedEdge = null;
    draft = null;
    resize = null;
  }

  /** Apply an external document to the ACTIVE mode; throws with a readable message. */
  function applyDocument(input: unknown): void {
    if (!input || typeof input !== 'object') throw new Error('document must be an object');
    const raw = input as Record<string, unknown>;
    if (!Array.isArray(raw.entities) || !Array.isArray(raw.connections)) {
      throw new Error('need "entities" and "connections" arrays');
    }
    const validColor = (v: unknown): string | undefined =>
      typeof v === 'string' && /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|var\(--[A-Za-z0-9-]+\)|[a-zA-Z]+)$/.test(v.trim())
        ? v.trim()
        : undefined;
    const parseStyle = (s: unknown): EntityStyle | undefined => {
      const st = s as Record<string, unknown> | null | undefined;
      if (!st || typeof st !== 'object') return undefined;
      const out = Object.fromEntries(
        Object.entries({
          fill: validColor(st.fill),
          stroke: validColor(st.stroke),
          text: validColor(st.text),
        }).filter(([, v]) => v !== undefined),
      );
      return Object.keys(out).length > 0 ? (out as EntityStyle) : undefined;
    };
    const isLayout = mode === 'layout';
    const parsed = raw.entities.map((en: Record<string, unknown>) => {
      if (!en || typeof en.id !== 'string' || !en.id) throw new Error('entity needs an id');
      const isGroup = en.tag === 'Group' || en.isContainer === true;
      const title = en.title as Record<string, unknown> | undefined;
      const texts = en.texts as Record<string, unknown>[] | undefined;
      const text = isGroup
        ? ((title?.text as string | undefined) ?? (texts?.[0]?.text as string | undefined) ?? en.id)
        : ((texts?.[0]?.text as string | undefined) ?? en.id);
      // Flow nodes have no roles — a stray role in a flow document is layout data.
      const role =
        isLayout && typeof en.role === 'string' && en.role in ROLE_LABELS
          ? (en.role as Primitive)
          : undefined;
      const columns = Number.isFinite(en.columns as number) ? (en.columns as number) : undefined;
      return {
        id: en.id,
        tag: isGroup ? ('Group' as const) : ('Shape' as const),
        containerId: typeof en.containerId === 'string' ? en.containerId : null,
        text: String(text),
        x: Number.isFinite(en.x as number) ? snap(en.x as number) : 40,
        y: Number.isFinite(en.y as number) ? snap(en.y as number) : 40,
        minW: Number.isFinite(en.width as number) ? (en.width as number) : MIN_W,
        minH: Number.isFinite(en.height as number) ? (en.height as number) : MIN_H,
        focal: isLayout && en.focal === true,
        role,
        style: parseStyle(en.style),
        meta:
          role || columns !== undefined
            ? {
                z: columns,
                label: role === 'text' || role === 'button' || role === 'input' ? String(text) : undefined,
              }
            : undefined,
      };
    });
    const seen = new Set<string>();
    for (const e of parsed) {
      if (seen.has(e.id)) throw new Error(`duplicate entity id "${e.id}"`);
      seen.add(e.id);
    }
    for (const e of parsed) {
      if (e.containerId && !seen.has(e.containerId)) e.containerId = null;
    }
    const connIds = new Set<string>();
    const parsedConns: StudioConnection[] = raw.connections.map((c: Record<string, unknown>) => {
      if (!c || typeof c.from !== 'string' || typeof c.to !== 'string') {
        throw new Error('connection needs "from" and "to"');
      }
      if (!seen.has(c.from) || !seen.has(c.to)) {
        throw new Error(`connection references a missing entity (${String(c.from)} → ${String(c.to)})`);
      }
      return {
        id:
          typeof c.id === 'string' && c.id && !connIds.has(c.id)
            ? (connIds.add(c.id), c.id)
            : freshId('c'),
        from: c.from,
        to: c.to,
        label: typeof c.label === 'string' ? c.label : undefined,
        connectorStyle: c.connectorStyle === 'straight' ? 'straight' : 'elbow',
        fromPort: (['top', 'right', 'bottom', 'left'] as const).includes(c.fromPort as never)
          ? (c.fromPort as StudioConnection['fromPort'])
          : undefined,
        toPort: (['top', 'right', 'bottom', 'left'] as const).includes(c.toPort as never)
          ? (c.toPort as StudioConnection['toPort'])
          : undefined,
        style: parseStyle(c.style),
      };
    });
    pushHistory();
    const d = activeDoc();
    d.entities = parsed;
    d.connections = parsedConns;
    selection = null;
    selectedEdge = null;
    draft = null;
    resize = null;
  }

  return {
    get mode(): Mode {
      return mode;
    },
    setMode,
    get nodes(): StudioEntity[] {
      return nodes;
    },
    get groups(): StudioEntity[] {
      return groups;
    },
    get connections(): StudioConnection[] {
      return connections;
    },
    get nodeBoxes(): Map<string, Box> {
      return nodeBoxes;
    },
    get routes(): RoutedEdge[] {
      return routed.list;
    },
    get routerStats(): { batch: string; status: string; ms: string } {
      return routed.stats;
    },
    get selectedId(): string | null {
      return selectedId;
    },
    get selectedEntity(): StudioEntity | null {
      return selectedEntity;
    },
    get selectedEdgeId(): string | null {
      return selectedEdge;
    },
    get selectedConnection(): StudioConnection | null {
      return selectedConn;
    },
    get connecting(): { from: string; x: number; y: number } | null {
      return connecting;
    },
    get documentJson(): { entities: Record<string, unknown>[]; connections: Record<string, unknown>[] } {
      return documentJson;
    },
    get onGrid(): boolean {
      return onGrid;
    },
    get draft(): { id: string; x: number; y: number } | null {
      return draft;
    },
    get resizing(): { id: string; w: number; h: number } | null {
      return resize;
    },
    get canUndo(): boolean {
      return history[mode].length > 0;
    },
    boxOf,
    eById,
    snap,
    snapUp,
    setMeasure,
    beginDrag,
    moveDraft,
    commitDrag,
    cancelDrag,
    beginResize,
    moveResize,
    commitResize,
    cancelResize,
    nudge,
    growToContain,
    beginConnect,
    moveConnect,
    commitConnect,
    cancelConnect,
    selectEdge,
    setRole,
    setGridColumns,
    relabel,
    renameId,
    setStyle,
    setEdgeStyle,
    setEdgeLabel,
    deleteEntity,
    deleteConnection,
    toggleContain,
    select,
    deselect,
    toggleElbow,
    togglePorts,
    addNode,
    undo,
    reset,
    applyDocument,
    pushHistory,
    SCENE,
  };
}

export type Studio = ReturnType<typeof createStudio>;
