import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { FileNode } from './types';

/** One icon's resting position, in work-area pixels. */
export type IconPos = { x: number; y: number };

interface Options {
  nodes: FileNode[];
  /** Live work-area size; the auto-layout wraps to it and drags clamp inside it. */
  desktop: { w: number; h: number };
  /** Grid cell used for the initial layout and for snapping on drop. */
  cell: { w: number; h: number };
  /** Which corner the auto-layout starts from: Windows top-left, macOS top-right. */
  origin: 'top-left' | 'top-right';
}

/**
 * useIconGrid — desktop-icon positions and the drag gesture that moves them.
 *
 * ENGINE ONLY. It returns positions and handlers; it renders nothing. Windows
 * and macOS each draw their own icon markup (different cell size, different
 * selection treatment, different label style) on top of this, so the two look
 * nothing alike while the gesture maths — which is genuinely identical and easy
 * to get subtly wrong — exists once.
 *
 * Icons are *not* in a CSS grid: a grid can only reorder, and the ask is that
 * any icon can be dragged anywhere. So each one carries an (x, y) that starts
 * from an auto-layout (column-first, wrapping at the work-area height, exactly
 * like both real desktops) and is overwritten the first time you drag it.
 *
 * Dragging writes `transform` straight to the DOM through pointer capture and
 * commits to state once, on release — the same "no React work per pointermove"
 * approach `useDrag` takes for windows.
 */
export function useIconGrid({ nodes, desktop, cell, origin }: Options) {
  /** path → committed position. Absent until laid out or dragged. */
  const [positions, setPositions] = useState<Record<string, IconPos>>({});
  const [selected, setSelected] = useState<string | null>(null);

  /* Auto-layout: fill a column top-to-bottom, then start the next one. Runs only
     for icons that have no position yet, so a dragged icon is never re-flowed by
     a window resize. */
  useLayoutEffect(() => {
    if (desktop.h < cell.h) return;
    setPositions((prev) => {
      const perColumn = Math.max(1, Math.floor((desktop.h - 8) / cell.h));
      let next = prev;
      nodes.forEach((node, i) => {
        if (next[node.path]) return;
        const col = Math.floor(i / perColumn);
        const row = i % perColumn;
        const x =
          origin === 'top-left'
            ? 8 + col * cell.w
            : Math.max(8, desktop.w - cell.w - 8 - col * cell.w);
        if (next === prev) next = { ...prev };
        next[node.path] = { x, y: 8 + row * cell.h };
      });
      return next;
    });
  }, [nodes, desktop.w, desktop.h, cell.w, cell.h, origin]);

  /** Live drag state. A ref so pointermove never re-renders React. */
  const drag = useRef<{
    path: string;
    node: HTMLElement;
    startX: number;
    startY: number;
    from: IconPos;
    to: IconPos;
    moved: boolean;
    frame: number;
  } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, node: FileNode) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      setSelected(node.path);

      const el = e.currentTarget as HTMLElement;
      const from = positions[node.path] ?? { x: 0, y: 0 };
      drag.current = {
        path: node.path,
        node: el,
        startX: e.clientX,
        startY: e.clientY,
        from,
        to: from,
        moved: false,
        frame: 0,
      };
      el.setPointerCapture(e.pointerId);
    },
    [positions],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;

      /* 3px of slop so a click that wobbles still counts as a click (and so a
         double-click to open never leaves the icon nudged sideways). */
      if (!d.moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      d.moved = true;

      // Keep the whole icon inside the work area.
      d.to = {
        x: Math.min(Math.max(0, d.from.x + dx), Math.max(0, desktop.w - cell.w)),
        y: Math.min(Math.max(0, d.from.y + dy), Math.max(0, desktop.h - cell.h)),
      };

      if (d.frame) return;
      d.frame = requestAnimationFrame(() => {
        const live = drag.current;
        if (!live) return;
        live.frame = 0;
        live.node.style.transform = `translate3d(${live.to.x}px, ${live.to.y}px, 0)`;
      });
    },
    [desktop.w, desktop.h, cell.w, cell.h],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (d.frame) cancelAnimationFrame(d.frame);
    drag.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* capture may already be gone if the pointer was cancelled */
    }
    // One state update for the whole gesture; a pure click commits nothing.
    if (d.moved) setPositions((prev) => ({ ...prev, [d.path]: d.to }));
  }, []);

  /** True while a real drag is in flight — lets a tap handler skip "open". */
  const isDragging = useCallback(() => drag.current?.moved ?? false, []);

  return {
    positions,
    selected,
    setSelected,
    isDragging,
    /** Spread onto each icon button. */
    handlers: { onPointerDown, onPointerMove, onPointerUp },
  };
}
