import { memo, useCallback, useMemo, useRef } from 'react';
import type { WindowState } from '@/os/types';
import { useDrag, type Rect, type ResizeEdge } from '@/os/useDrag';
import MacTitlebar from './MacTitlebar';

type Props = {
  win: WindowState;
  /** True when this is the top-most window; drives chrome brightness + shadow. */
  focused: boolean;
  /** Live work-area size, used to clamp dragging and to size a zoomed window. */
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
 * The eight resize handles. macOS lets you grab any edge of a window, same as
 * Windows; the offsets are positive for the same clipping reason described in
 * `WinWindow`, and the top corners stay thin so they can't swallow clicks on
 * the traffic lights.
 */
const HANDLES: { edge: Exclude<ResizeEdge, null>; cls: string; cursor: string }[] = [
  { edge: 'n', cls: 'left-0 right-0 top-0 h-1.5', cursor: 'ns-resize' },
  { edge: 's', cls: 'left-0 right-0 bottom-0 h-1.5', cursor: 'ns-resize' },
  { edge: 'w', cls: 'top-0 bottom-0 left-0 w-1.5', cursor: 'ew-resize' },
  { edge: 'e', cls: 'top-0 bottom-0 right-0 w-1.5', cursor: 'ew-resize' },
  { edge: 'nw', cls: 'left-0 top-0 h-1.5 w-3.5', cursor: 'nwse-resize' },
  { edge: 'ne', cls: 'right-0 top-0 h-1.5 w-3.5', cursor: 'nesw-resize' },
  { edge: 'sw', cls: 'left-0 bottom-0 h-3.5 w-3.5', cursor: 'nesw-resize' },
  { edge: 'se', cls: 'right-0 bottom-0 h-3.5 w-3.5', cursor: 'nwse-resize' },
];

/**
 * MacWindow — the macOS window: heavy vibrancy, 12px corners, a soft wide
 * shadow, and macOS's springier open/close motion.
 *
 * This is a macOS-ONLY component. Windows has its own `WinWindow` with a Mica
 * surface, tighter corners and a restrained Fluent curve. Only the geometry
 * engine (`useDrag`) is shared.
 *
 * Where it deliberately differs from Windows:
 *  · surface is far more translucent (vibrancy vs Mica)
 *  · opens with a spring that overshoots slightly, rather than a flat ease-out
 *  · the shadow is wider, softer and sits lower
 *
 * The inner "animation shell" exists for the same reason as in `WinWindow`: the
 * outer element's transform carries drag position and must not be animated.
 */
const MacWindow = memo(function MacWindow({
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
  /* Phone-sized viewports get one full-screen app at a time. */
  const isMobile = desktop.w < 640;
  const filling = win.maximized || isMobile;

  const geo = filling
    ? { x: 0, y: 0, w: desktop.w, h: desktop.h }
    : { x: win.x, y: win.y, w: win.w, h: win.h };

  /* While zoomed the ref reports the RESTORE size, so dragging the titlebar
     tears the window off at its floating size and follows the cursor. */
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
      /* macOS vibrancy: much more transparent than Windows' Mica, with a strong
         saturation boost so the wallpaper's colour bleeds through the glass. */
      background: 'rgba(30, 30, 34, 0.72)',
      backdropFilter: 'blur(60px) saturate(2)',
      WebkitBackdropFilter: 'blur(60px) saturate(2)',
      borderRadius: filling ? 0 : 12,
      border: filling ? 'none' : '0.5px solid rgba(255,255,255,0.18)',
      /* Wider, softer and lower than the Windows shadow — the single biggest
         tell between the two platforms at a glance. */
      boxShadow: focused
        ? '0 40px 90px rgba(0, 0, 0, 0.58), 0 0 0 0.5px rgba(255, 255, 255, 0.14)'
        : '0 14px 40px rgba(0, 0, 0, 0.42)',
      contentVisibility: focused ? 'visible' : 'auto',
      containIntrinsicSize: `${geo.w}px ${geo.h}px`,
    }),
    [geo.x, geo.y, geo.w, geo.h, win.z, filling, focused],
  );

  const dragProps: React.HTMLAttributes<HTMLElement> = isMobile
    ? {}
    : {
        ...dragHandlers(null),
        onDoubleClick: () => onToggleMax(win.id),
        style: { touchAction: 'none' },
      };

  const animation =
    win.phase === 'closing'
      ? 'anim-mac-close'
      : win.phase === 'opening'
        ? 'anim-mac-open'
        : '';

  return (
    <div
      ref={nodeRef as React.RefObject<HTMLDivElement>}
      role="dialog"
      aria-label={win.title}
      hidden={win.minimized}
      className="absolute left-0 top-0 overflow-hidden"
      style={style}
      onPointerDownCapture={() => onFocus(win.id)}
    >
      {/* Animation shell — never give this positioning. */}
      <div
        className={`flex h-full w-full flex-col ${animation}`}
        style={{ transformOrigin: 'center center' }}
        onAnimationEnd={() => {
          if (win.phase === 'opening') onSettled(win.id);
        }}
      >
        <MacTitlebar
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

export default MacWindow;
