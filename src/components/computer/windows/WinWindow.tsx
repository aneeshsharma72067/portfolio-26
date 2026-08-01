import { memo, useCallback, useMemo, useRef } from 'react';
import type { WindowState } from '@/os/types';
import { useDrag, type Rect, type ResizeEdge } from '@/os/useDrag';
import WinTitlebar from './WinTitlebar';

type Props = {
  win: WindowState;
  /** True when this is the top-most window; drives chrome brightness + shadow. */
  focused: boolean;
  /** Live work-area size, used to clamp dragging and to size a maximized window. */
  desktop: { w: number; h: number };
  onFocus: (id: string) => void;
  onCommit: (id: string, rect: Rect) => void;
  onToggleMax: (id: string) => void;
  onMinimize: (id: string) => void;
  onClose: (id: string) => void;
  /** Told when the open animation finishes, so it isn't replayed on re-render. */
  onSettled: (id: string) => void;
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
     on top of the titlebar's minimize/close buttons and swallow those clicks. */
  { edge: 'nw', cls: 'left-0 top-0 h-1.5 w-3.5', cursor: 'nwse-resize' },
  { edge: 'ne', cls: 'right-0 top-0 h-1.5 w-3.5', cursor: 'nesw-resize' },
  { edge: 'sw', cls: 'left-0 bottom-0 h-3.5 w-3.5', cursor: 'nesw-resize' },
  { edge: 'se', cls: 'right-0 bottom-0 h-3.5 w-3.5', cursor: 'nwse-resize' },
];

/**
 * WinWindow — the Windows 11 window: Mica surface, 8px corners, Fluent shadow,
 * and the Windows open/close/minimize motion.
 *
 * This is a WINDOWS-ONLY component. macOS has its own `MacWindow` with a
 * different surface, different radius, different animation curve and its own
 * titlebar. Only the geometry engine (`useDrag`) is shared, because pointer
 * maths is not a matter of visual taste.
 *
 * ── The animation shell ──────────────────────────────────────────────────────
 * The outer element carries an inline `transform: translate3d()` that the drag
 * layer rewrites every frame. A CSS animation on that same element beats the
 * inline style in the cascade and pins the window to the top-left corner. So an
 * INNER wrapper — which carries no positioning of its own — does the scaling.
 *
 * Wrapped in `memo` because the desktop re-renders whenever ANY window changes
 * (focus bumps a z-index) and reconciling an unrelated window's app content —
 * a file listing, a rendered document — for that is pure waste.
 */
const WinWindow = memo(function WinWindow({
  win,
  focused,
  desktop,
  onFocus,
  onCommit,
  onToggleMax,
  onMinimize,
  onClose,
  onSettled,
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
   * un-maximize-on-drag behaviour Windows has. `commit` then clears the flag.
   */
  const rectRef = useRef<Rect>(geo);
  rectRef.current = win.maximized ? { x: 0, y: 0, w: win.w, h: win.h } : geo;

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
      /* Windows 11 "Mica": a dark, mostly opaque surface that lets a hint of the
         wallpaper through. Notably LESS translucent than macOS's vibrancy. */
      background: 'rgba(32, 32, 32, 0.92)',
      backdropFilter: 'blur(50px) saturate(1.4)',
      WebkitBackdropFilter: 'blur(50px) saturate(1.4)',
      borderRadius: filling ? 0 : 8,
      border: filling ? 'none' : '1px solid rgba(255,255,255,0.09)',
      // Focused windows lift off the wallpaper; background ones sit flat.
      boxShadow: focused
        ? '0 32px 64px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.06)'
        : '0 8px 24px rgba(0, 0, 0, 0.38)',
      /* Skip layout+paint entirely for a window the user isn't looking at.
         `contain-intrinsic-size` keeps the frame's own box stable while its
         subtree is skipped, so nothing jumps when it comes back. */
      contentVisibility: focused ? 'visible' : 'auto',
      containIntrinsicSize: `${geo.w}px ${geo.h}px`,
    }),
    [geo.x, geo.y, geo.w, geo.h, win.z, filling, focused],
  );

  /* Props for the titlebar's grab surface. On mobile the window is locked
     full-screen, so it gets nothing but the double-tap toggle. */
  const dragProps: React.HTMLAttributes<HTMLElement> = isMobile
    ? {}
    : {
        ...dragHandlers(null),
        onDoubleClick: () => onToggleMax(win.id),
        // Stop the browser turning a titlebar drag into a page scroll on touch.
        style: { touchAction: 'none' },
      };

  /* Which Fluent animation the inner shell plays. Minimizing animates on the
     way out but the window stays mounted (hidden), so its scroll position and
     app state survive being restored. */
  const animation =
    win.phase === 'closing'
      ? 'anim-win-close'
      : win.phase === 'opening'
        ? 'anim-win-open'
        : '';

  return (
    <div
      ref={nodeRef as React.RefObject<HTMLDivElement>}
      role="dialog"
      aria-label={win.title}
      // `hidden` rather than unmounting: a minimized window keeps its scroll
      // position and app state, and restoring costs nothing.
      hidden={win.minimized}
      className="absolute left-0 top-0 overflow-hidden"
      style={style}
      // Capture-phase so focusing happens before any inner control's onClick.
      onPointerDownCapture={() => onFocus(win.id)}
    >
      {/* The animation shell — see the component docs. It must never carry
          positioning, or the drag layer and the animation fight over transform. */}
      <div
        className={`flex h-full w-full flex-col ${animation}`}
        style={{ transformOrigin: 'center center' }}
        onAnimationEnd={() => {
          if (win.phase === 'opening') onSettled(win.id);
        }}
      >
        <WinTitlebar
          win={win}
          focused={focused}
          dragProps={dragProps}
          onMinimize={onMinimize}
          onToggleMax={onToggleMax}
          onClose={onClose}
        />

        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>

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

export default WinWindow;
