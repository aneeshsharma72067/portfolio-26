import { memo, useCallback, useMemo, useRef } from 'react';
import type { WindowState } from '@/os/types';
import { useDrag, type Rect, type ResizeEdge } from '@/os/useDrag';

type Props = {
  win: WindowState;
  /** True when this is the top-most window; drives chrome brightness. */
  focused: boolean;
  /** Live work-area size, used to clamp dragging and to size a maximized window. */
  desktop: { w: number; h: number };
  /** Corner radius while floating. Maximized windows are always square. */
  radius: string;
  /** Frame surface + border, supplied by the owning OS. */
  background: string;
  border: string;
  onFocus: (id: string) => void;
  onCommit: (id: string, rect: Rect) => void;
  onToggleMax: (id: string) => void;
  /**
   * The OS's own titlebar. It receives the props to spread onto its grab
   * surface, so each OS controls its chrome completely while geometry, dragging
   * and resizing stay in one place.
   */
  titlebar: (dragProps: React.HTMLAttributes<HTMLElement>) => React.ReactNode;
  children: React.ReactNode;
};

/**
 * The eight resize handles, each with its cursor and edge-hugging position.
 *
 * All offsets are POSITIVE: the frame is `overflow-hidden` (so app content can't
 * spill past the rounded corners), which would clip any handle that stuck out
 * past the edge and shrink its real hit area. The corner boxes are listed after
 * the edges so they paint on top and win the overlap.
 */
const HANDLES: { edge: Exclude<ResizeEdge, null>; cls: string; cursor: string }[] = [
  { edge: 'n', cls: 'left-0 right-0 top-0 h-1.5', cursor: 'ns-resize' },
  { edge: 's', cls: 'left-0 right-0 bottom-0 h-1.5', cursor: 'ns-resize' },
  { edge: 'w', cls: 'top-0 bottom-0 left-0 w-1.5', cursor: 'ew-resize' },
  { edge: 'e', cls: 'top-0 bottom-0 right-0 w-1.5', cursor: 'ew-resize' },
  /* The top corners stay as thin as the top edge: any taller and they would sit
     on top of the titlebar's close/zoom buttons and swallow those clicks. */
  { edge: 'nw', cls: 'left-0 top-0 h-1.5 w-3.5', cursor: 'nwse-resize' },
  { edge: 'ne', cls: 'right-0 top-0 h-1.5 w-3.5', cursor: 'nesw-resize' },
  { edge: 'sw', cls: 'left-0 bottom-0 h-3.5 w-3.5', cursor: 'nesw-resize' },
  { edge: 'se', cls: 'right-0 bottom-0 h-3.5 w-3.5', cursor: 'nwse-resize' },
];

/**
 * WindowFrame — geometry only: position, size, z-order, dragging, resizing.
 *
 * Deliberately chrome-free. Windows and macOS each render their own titlebar and
 * buttons through the `titlebar` prop, so the two look nothing alike while the
 * gesture maths (genuinely identical, and easy to get subtly wrong) exists once.
 *
 * Wrapped in `memo` because the desktop re-renders whenever ANY window changes
 * (focus bumps a z-index) and reconciling an unrelated window's app content —
 * a file listing, a rendered document — for that is pure waste.
 */
const WindowFrame = memo(function WindowFrame({
  win,
  focused,
  desktop,
  radius,
  background,
  border,
  onFocus,
  onCommit,
  onToggleMax,
  titlebar,
  children,
}: Props) {
  /* Phone-sized viewports get one full-screen app at a time; floating windows on
     a 380px-wide screen are unusable, so there dragging is off entirely. */
  const isMobile = desktop.w < 640;
  const filling = win.maximized || isMobile;

  /* A maximized window ignores its stored rect and fills the work area. The
     stored rect is untouched, so un-maximizing restores exact prior geometry. */
  const geo = filling
    ? { x: 0, y: 0, w: desktop.w, h: desktop.h }
    : { x: win.x, y: win.y, w: win.w, h: win.h };

  /**
   * The gesture layer reads geometry through a ref so `useDrag`'s callbacks stay
   * stable across renders while still seeing the latest committed rect.
   *
   * While maximized it reports the RESTORE size, so dragging the titlebar tears
   * the window off at its floating size and follows the cursor — the same
   * un-maximize-on-drag behaviour both real OSes have. `commit` then clears the
   * maximized flag.
   */
  const rectRef = useRef<Rect>(geo);
  rectRef.current = win.maximized
    ? { x: 0, y: 0, w: win.w, h: win.h }
    : geo;

  const getRect = useCallback(() => rectRef.current, []);
  const bounds = useCallback(() => desktop, [desktop]);
  const handleCommit = useCallback(
    (rect: Rect) => onCommit(win.id, rect),
    [onCommit, win.id],
  );

  const { nodeRef, dragHandlers } = useDrag({ getRect, onCommit: handleCommit, bounds });

  const style = useMemo<React.CSSProperties>(
    () => ({
      transform: `translate3d(${geo.x}px, ${geo.y}px, 0)`,
      width: geo.w,
      height: geo.h,
      zIndex: win.z,
      background,
      backdropFilter: 'blur(40px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
      borderRadius: filling ? 0 : radius,
      border: filling ? 'none' : `0.5px solid ${border}`,
      // Focused windows lift off the wallpaper; background ones sit flat.
      boxShadow: focused
        ? '0 28px 70px rgba(0, 0, 0, 0.6), 0 0 0 0.5px rgba(255, 255, 255, 0.12)'
        : '0 10px 30px rgba(0, 0, 0, 0.4)',
      /* Skip layout+paint entirely for a window the user isn't looking at.
         `contain-intrinsic-size` keeps the frame's own box stable while its
         subtree is skipped, so nothing jumps when it comes back. */
      contentVisibility: focused ? 'visible' : 'auto',
      containIntrinsicSize: `${geo.w}px ${geo.h}px`,
    }),
    [geo.x, geo.y, geo.w, geo.h, win.z, filling, focused, background, border, radius],
  );

  /* Props for the OS's grab surface. On mobile the window is locked full-screen,
     so it gets nothing but the double-tap toggle. */
  const dragProps: React.HTMLAttributes<HTMLElement> = isMobile
    ? {}
    : {
        ...dragHandlers(null),
        onDoubleClick: () => onToggleMax(win.id),
        // Stop the browser turning a titlebar drag into a page scroll on touch.
        style: { touchAction: 'none' },
      };

  return (
    <div
      ref={nodeRef as React.RefObject<HTMLDivElement>}
      role="dialog"
      aria-label={win.title}
      // `hidden` rather than unmounting: a minimized window keeps its scroll
      // position and app state, and restoring costs nothing.
      hidden={win.minimized}
      className="absolute left-0 top-0 flex flex-col overflow-hidden animate-win-pop"
      style={style}
      // Capture-phase so focusing happens before any inner control's onClick.
      onPointerDownCapture={() => onFocus(win.id)}
    >
      {titlebar(dragProps)}

      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>

      {!filling &&
        HANDLES.map((h) => (
          <div
            key={h.edge}
            {...dragHandlers(h.edge)}
            className={`absolute ${h.cls}`}
            style={{ cursor: h.cursor, touchAction: 'none' }}
          />
        ))}
    </div>
  );
});

export default WindowFrame;
