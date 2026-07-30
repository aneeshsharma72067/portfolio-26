import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { FileNode } from '@/os/types';

/** One icon's resting position, in work-area pixels. */
type Pos = { x: number; y: number };

type Props = {
  nodes: FileNode[];
  /** Live work-area size; the auto-layout wraps to it and drags clamp inside it. */
  desktop: { w: number; h: number };
  /** Grid cell used for the initial layout and for snapping on drop. */
  cell: { w: number; h: number };
  /** Which corner the auto-layout starts from: Windows top-left, macOS top-right. */
  origin: 'top-left' | 'top-right';
  /** Renders one icon's artwork + label; the OS owns the visuals. */
  renderIcon: (node: FileNode, selected: boolean) => React.ReactNode;
  onOpen: (node: FileNode) => void;
};

/**
 * DesktopIcons — freely draggable, absolutely positioned icon layer.
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
export default function DesktopIcons({
  nodes,
  desktop,
  cell,
  origin,
  renderIcon,
  onOpen,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  /** path → committed position. Absent until laid out or dragged. */
  const [positions, setPositions] = useState<Record<string, Pos>>({});

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
    from: Pos;
    to: Pos;
    moved: boolean;
    frame: number;
  } | null>(null);

  const handlePointerDown = useCallback(
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

  const handlePointerMove = useCallback(
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

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
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

  return (
    <div
      className="absolute inset-0"
      // Clicking bare wallpaper clears the selection.
      onPointerDown={() => setSelected(null)}
    >
      {nodes.map((node) => {
        const pos = positions[node.path];
        // Skip until laid out, so nothing flashes at (0,0) on first paint.
        if (!pos) return null;
        const isSelected = selected === node.path;

        return (
          <button
            key={node.path}
            onPointerDown={(e) => handlePointerDown(e, node)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={() => onOpen(node)}
            // Single tap opens on touch, where there is no double-click.
            onTouchEnd={(e) => {
              if (!drag.current?.moved) {
                e.preventDefault();
                onOpen(node);
              }
            }}
            className="absolute left-0 top-0 cursor-default active:cursor-grabbing"
            style={{
              width: cell.w,
              height: cell.h,
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
              touchAction: 'none',
              zIndex: isSelected ? 2 : 1,
            }}
            title={node.path}
          >
            {renderIcon(node, isSelected)}
          </button>
        );
      })}
    </div>
  );
}
