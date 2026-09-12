/**
 * `draggable` — the drag behavior layer, attached from outside the data, exactly where
 * MDP wants behavior: pointer drag with a CTM cached at gesture start (so ancestor
 * scrolling can't skew deltas), plus the keyboard map (arrows nudge, Shift ×4,
 * Enter toggles containment, Escape deselects).
 *
 * params: { id, studio } — read live via `update`, so re-renders are safe.
 */
import { SNAP, type Studio } from './studio.svelte';

interface DragParams {
  id: string;
  studio: Studio;
}

interface Gesture {
  id: string;
  ctmInv: DOMMatrix;
  ox: number;
  oy: number;
  sx: number;
  sy: number;
  moved: boolean;
}

export function draggable(node: SVGElement, params: DragParams) {
  let p = params;
  let gesture: Gesture | null = null;

  function toSvg(clientX: number, clientY: number, ctmInv: DOMMatrix) {
    const sp = new DOMPoint(clientX, clientY).matrixTransform(ctmInv);
    return { x: sp.x, y: sp.y };
  }

  function onPointerDown(ev: PointerEvent) {
    if (ev.button !== 0) return;
    // Alt is reserved for connection-drawing (`use:connectable`) — both actions sit on
    // the same element, so draggable must yield the gesture entirely or the node
    // would follow the pointer and the connect's drop-target probe would hit itself.
    if (ev.altKey) return;
    const stage = node.ownerSVGElement;
    if (!stage) return;
    const ctm = stage.getScreenCTM();
    if (!ctm) return;
    ev.preventDefault();
    try {
      node.setPointerCapture?.(ev.pointerId);
    } catch {
      // A stale/synthetic pointerId must not abort the gesture — window-level
      // move/up listeners below carry the drag regardless.
    }
    const start = toSvg(ev.clientX, ev.clientY, ctm.inverse());
    const origin = p.studio.beginDrag(p.id);
    if (origin.blocked) return;
    gesture = {
      id: p.id,
      ctmInv: ctm.inverse(),
      ox: origin.ox,
      oy: origin.oy,
      sx: start.x,
      sy: start.y,
      moved: false,
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  }

  function onPointerMove(ev: PointerEvent) {
    if (!gesture) return;
    const pt = toSvg(ev.clientX, ev.clientY, gesture.ctmInv);
    const dx = pt.x - gesture.sx;
    const dy = pt.y - gesture.sy;
    if (Math.abs(dx) + Math.abs(dy) > 1.5) gesture.moved = true;
    p.studio.moveDraft(gesture.id, gesture.ox + dx, gesture.oy + dy);
  }

  function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove);
    if (gesture) {
      if (gesture.moved) p.studio.commitDrag(gesture.id);
      else p.studio.cancelDrag();
    }
    gesture = null;
  }

  function onKeydown(ev: KeyboardEvent) {
    const step = ev.shiftKey ? 16 : SNAP;
    if (ev.key === 'ArrowLeft') p.studio.nudge(p.id, -step, 0);
    else if (ev.key === 'ArrowRight') p.studio.nudge(p.id, step, 0);
    else if (ev.key === 'ArrowUp') p.studio.nudge(p.id, 0, -step);
    else if (ev.key === 'ArrowDown') p.studio.nudge(p.id, 0, step);
    else if (ev.key === 'Enter') p.studio.toggleContain(p.id);
    else if (ev.key === 'Delete' || ev.key === 'Backspace') p.studio.deleteEntity(p.id);
    else if (ev.key === 'Escape') p.studio.deselect();
    else return;
    ev.preventDefault();
  }

  node.addEventListener('pointerdown', onPointerDown);
  node.addEventListener('keydown', onKeydown);

  return {
    update(next: DragParams) {
      p = next;
    },
    destroy() {
      node.removeEventListener('pointerdown', onPointerDown);
      node.removeEventListener('keydown', onKeydown);
      window.removeEventListener('pointermove', onPointerMove);
    },
  };
}

/**
 * `resizable` — SE-corner resize behavior, same protocol as `draggable`: CTM cached
 * at gesture start, draft via `moveResize` (min floors + 4px snap), commit to
 * authored `minW/minH` on release. The handle element carries `data-handle`.
 */
export function resizable(node: SVGElement, params: DragParams) {
  let p = params;
  let gesture: {
    ctmInv: DOMMatrix;
    ow: number;
    oh: number;
    sx: number;
    sy: number;
  } | null = null;

  function toSvg(clientX: number, clientY: number, ctmInv: DOMMatrix) {
    const sp = new DOMPoint(clientX, clientY).matrixTransform(ctmInv);
    return { x: sp.x, y: sp.y };
  }

  function onPointerDown(ev: PointerEvent) {
    if (ev.button !== 0) return;
    const stage = node.ownerSVGElement;
    if (!stage) return;
    const ctm = stage.getScreenCTM();
    if (!ctm) return;
    ev.preventDefault();
    ev.stopPropagation();
    try {
      node.setPointerCapture?.(ev.pointerId);
    } catch {
      // A stale/synthetic pointerId must not abort the gesture — window-level
      // move/up listeners below carry the gesture regardless.
    }
    const start = toSvg(ev.clientX, ev.clientY, ctm.inverse());
    const origin = p.studio.beginResize(p.id);
    if (origin.blocked) return;
    gesture = {
      ctmInv: ctm.inverse(),
      ow: origin.w,
      oh: origin.h,
      sx: start.x,
      sy: start.y,
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  }

  function onPointerMove(ev: PointerEvent) {
    if (!gesture) return;
    const pt = toSvg(ev.clientX, ev.clientY, gesture.ctmInv);
    p.studio.moveResize(p.id, gesture.ow + (pt.x - gesture.sx), gesture.oh + (pt.y - gesture.sy));
  }

  function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove);
    if (gesture) p.studio.commitResize(p.id);
    gesture = null;
  }

  node.addEventListener('pointerdown', onPointerDown);

  return {
    update(next: DragParams) {
      p = next;
    },
    destroy() {
      node.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
    },
  };
}

/**
 * `connectable` — flow-mode connection drawing, attached from outside the data like
 * every other behavior: ⌥/Alt-drag from a node mints a connection. The ghost is
 * stored in the studio (so Canvas can render it through normal reactivity) while the
 * gesture converts screen→SVG with the CTM cached at pointerdown. On release the
 * document element under the pointer picks the target node — `elementFromPoint`, then
 * climb to the nearest `g[data-id]` — and the store toggles connect/disconnect.
 */
interface ConnectParams {
  id: string;
  studio: Studio;
}

export function connectable(node: SVGElement, params: ConnectParams) {
  let p = params;
  let gesture: { ctmInv: DOMMatrix } | null = null;

  function toSvg(clientX: number, clientY: number, ctmInv: DOMMatrix) {
    const sp = new DOMPoint(clientX, clientY).matrixTransform(ctmInv);
    return { x: sp.x, y: sp.y };
  }

  let lastClient = { x: 0, y: 0 };

  /**
   * Drop target = the node whose router box contains the pointer, smallest first.
   * Geometric, not hit-test based: elementFromPoint depends on paint state and
   * pointer-events layers (the ghost, hit-paths, label chrome), which makes it
   * flaky exactly at commit time; a point-in-box test against the live router
   * boxes is deterministic and more forgiving UX-wise anyway.
   */
  function nodeUnderPointer(): string | null {
    if (!gesture) return null;
    const sp = new DOMPoint(lastClient.x, lastClient.y).matrixTransform(gesture.ctmInv);
    let best: string | null = null;
    let bestArea = Infinity;
    for (const [id, b] of p.studio.nodeBoxes) {
      if (sp.x >= b.x && sp.y >= b.y && sp.x <= b.x + b.width && sp.y <= b.y + b.height) {
        const area = b.width * b.height;
        if (area < bestArea) {
          best = id;
          bestArea = area;
        }
      }
    }
    return best;
  }

  function onPointerDown(ev: PointerEvent) {
    if (ev.button !== 0 || !ev.altKey) return;
    // Claim the gesture only when a connection can actually start here — in layout
    // mode this returns false and the event falls through to `draggable` untouched.
    if (!p.studio.beginConnect(p.id)) return;
    const stage = node.ownerSVGElement;
    if (!stage) return;
    const ctm = stage.getScreenCTM();
    if (!ctm) return;
    ev.preventDefault();
    ev.stopPropagation();
    const inv = ctm.inverse();
    const start = toSvg(ev.clientX, ev.clientY, inv);
    lastClient = { x: ev.clientX, y: ev.clientY };
    gesture = { ctmInv: inv };
    p.studio.moveConnect(start.x, start.y);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  }

  function onPointerMove(ev: PointerEvent) {
    if (!gesture) return;
    lastClient = { x: ev.clientX, y: ev.clientY };
    const pt = toSvg(ev.clientX, ev.clientY, gesture.ctmInv);
    p.studio.moveConnect(pt.x, pt.y);
  }

  function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove);
    if (gesture) {
      // resolve the target BEFORE dropping the gesture — the CTM lives on it
      const target = nodeUnderPointer();
      p.studio.commitConnect(target);
    }
    gesture = null;
  }

  node.addEventListener('pointerdown', onPointerDown);

  return {
    update(next: ConnectParams) {
      p = next;
    },
    destroy() {
      node.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
    },
  };
}
