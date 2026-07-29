import { useCallback, useRef } from 'react';

/** Committed geometry, in CSS pixels relative to the desktop's top-left. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Which resize handle is being pulled. `null` means the drag moves the window. */
export type ResizeEdge = 'e' | 's' | 'se' | 'w' | 'n' | 'nw' | 'ne' | 'sw' | null;

interface Options {
  /** Read the window's current committed rect at gesture start. */
  getRect: () => Rect;
  /** Called ONCE on pointerup with the final rect. This is the only setState. */
  onCommit: (rect: Rect) => void;
  /** Smallest allowed size while resizing. */
  minW?: number;
  minH?: number;
  /** Desktop bounds so a window can't be dragged fully off-screen. */
  bounds: () => { w: number; h: number };
}

/**
 * useDrag — pointer-driven move/resize that does not re-render React.
 *
 * The expensive naive version of this stores x/y in state and calls setState on
 * every pointermove: at 120 Hz that is ~120 React renders per second, each one
 * reconciling the window's entire subtree (a Files listing, a rendered
 * document) for a two-pixel change.
 *
 * Instead:
 *  - `setPointerCapture` routes every move to the handle even when the cursor
 *    outruns it or leaves the viewport, so no document-level listeners and no
 *    lost pointerup.
 *  - moves are coalesced into ONE `requestAnimationFrame` callback, so a burst
 *    of events between frames paints once.
 *  - the frame writes `transform: translate3d()` (and width/height when
 *    resizing) straight to the DOM node. Transform is compositor-only, so a
 *    move costs no layout and no paint.
 *  - `will-change: transform` is set at gesture start and REMOVED at the end.
 *    Leaving it on permanently pins a compositor layer per window and burns GPU
 *    memory, which is the usual way this optimisation backfires.
 *  - React state is updated exactly once, on release.
 */
export function useDrag({ getRect, onCommit, bounds, minW = 320, minH = 200 }: Options) {
  /** The element being transformed — set by the caller through `bind`. */
  const nodeRef = useRef<HTMLElement | null>(null);

  /** Live gesture state. A ref, not state: touching it must never re-render. */
  const gesture = useRef<{
    edge: ResizeEdge;
    startX: number;
    startY: number;
    start: Rect;
    /** Latest computed rect; read by the rAF callback and by pointerup. */
    current: Rect;
    frame: number;
  } | null>(null);

  /** Apply a rect to the DOM without touching React. */
  const paint = useCallback((r: Rect) => {
    const node = nodeRef.current;
    if (!node) return;
    node.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`;
    node.style.width = `${r.w}px`;
    node.style.height = `${r.h}px`;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const g = gesture.current;
      if (!g) return;

      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      const b = bounds();
      const s = g.start;

      if (!g.edge) {
        /* Move. Clamp so at least a strip of titlebar stays grabbable: the
           window may hang off the right/bottom but never fully escape. */
        g.current = {
          ...s,
          x: Math.min(Math.max(dx + s.x, -s.w + 80), b.w - 80),
          y: Math.min(Math.max(dy + s.y, 0), b.h - 40),
        };
      } else {
        /* Resize. Dragging a north/west edge moves the origin as well as the
           size, and the min-size clamp has to hold the opposite edge still —
           hence deriving x from (right - w) rather than clamping x directly. */
        let { x, y, w, h } = s;
        if (g.edge.includes('e')) w = Math.max(minW, s.w + dx);
        if (g.edge.includes('s')) h = Math.max(minH, s.h + dy);
        if (g.edge.includes('w')) {
          w = Math.max(minW, s.w - dx);
          x = s.x + s.w - w;
        }
        if (g.edge.includes('n')) {
          h = Math.max(minH, s.h - dy);
          y = s.y + s.h - h;
        }
        g.current = { x, y, w, h };
      }

      /* Coalesce: if a frame is already queued, the newest rect replaces the
         pending one instead of queueing a second paint. */
      if (g.frame) return;
      g.frame = requestAnimationFrame(() => {
        const live = gesture.current;
        if (!live) return;
        live.frame = 0;
        paint(live.current);
      });
    },
    [bounds, minW, minH, paint],
  );

  const end = useCallback(
    (e: React.PointerEvent) => {
      const g = gesture.current;
      if (!g) return;
      if (g.frame) cancelAnimationFrame(g.frame);
      gesture.current = null;

      const node = nodeRef.current;
      if (node) {
        // Drop the compositor hint so the layer can be reclaimed.
        node.style.willChange = '';
      }
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        /* capture may already be gone if the pointer was cancelled */
      }

      // The single React update for the whole gesture.
      onCommit(g.current);
    },
    [onCommit],
  );

  /**
   * Start a gesture. Pass `null` for a move, or an edge for a resize.
   * Spread the result onto the titlebar / resize handle.
   */
  const start = useCallback(
    (edge: ResizeEdge) => (e: React.PointerEvent) => {
      // Ignore secondary buttons and clicks on real controls inside the bar.
      if (e.button !== 0) return;
      const rect = getRect();
      gesture.current = {
        edge,
        startX: e.clientX,
        startY: e.clientY,
        start: rect,
        current: rect,
        frame: 0,
      };
      if (nodeRef.current) nodeRef.current.style.willChange = 'transform';
      (e.target as Element).setPointerCapture(e.pointerId);
      e.stopPropagation();
    },
    [getRect],
  );

  return {
    /** Attach to the window element being moved. */
    nodeRef,
    /** Handlers for a drag surface: `{...dragHandlers(null)}` on the titlebar. */
    dragHandlers: (edge: ResizeEdge) => ({
      onPointerDown: start(edge),
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
    }),
    /** Imperatively repaint — used when maximize/restore changes geometry. */
    paint,
  };
}
