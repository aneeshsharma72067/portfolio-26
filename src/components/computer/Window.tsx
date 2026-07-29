import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Minus, Square, X, Copy } from 'lucide-react';
import type { Skin, WindowState } from '@/os/types';
import { useDrag, type Rect, type ResizeEdge } from '@/os/useDrag';

type Props = {
  win: WindowState;
  skin: Skin;
  /** True when this is the top-most window; drives chrome brightness. */
  focused: boolean;
  /** Live desktop size, used to clamp dragging and to size a maximized window. */
  desktop: { w: number; h: number };
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onToggleMax: (id: string) => void;
  onCommit: (id: string, rect: Rect) => void;
  children: React.ReactNode;
};

/** The eight resize handles, each with its cursor and edge-hugging position. */
const HANDLES: { edge: Exclude<ResizeEdge, null>; cls: string; cursor: string }[] = [
  { edge: 'n', cls: 'left-2 right-2 top-0 h-1', cursor: 'ns-resize' },
  { edge: 's', cls: 'left-2 right-2 bottom-0 h-1', cursor: 'ns-resize' },
  { edge: 'w', cls: 'top-2 bottom-2 left-0 w-1', cursor: 'ew-resize' },
  { edge: 'e', cls: 'top-2 bottom-2 right-0 w-1', cursor: 'ew-resize' },
  { edge: 'nw', cls: 'left-0 top-0 h-3 w-3', cursor: 'nwse-resize' },
  { edge: 'ne', cls: 'right-0 top-0 h-3 w-3', cursor: 'nesw-resize' },
  { edge: 'sw', cls: 'left-0 bottom-0 h-3 w-3', cursor: 'nesw-resize' },
  { edge: 'se', cls: 'right-0 bottom-0 h-3 w-3', cursor: 'nwse-resize' },
];

/**
 * Window — one draggable, resizable frame. Skin-agnostic: every visual
 * difference between the five operating systems comes from `skin` values and
 * the CSS custom properties `Computer` sets, so there is exactly one window
 * component rather than five.
 *
 * Wrapped in `memo` because the desktop re-renders whenever ANY window changes
 * (focus bumps a z-index) and reconciling an unrelated window's app content —
 * a file listing, a rendered document — for that is pure waste.
 */
const Window = memo(function Window({
  win,
  skin,
  focused,
  desktop,
  onFocus,
  onClose,
  onMinimize,
  onToggleMax,
  onCommit,
  children,
}: Props) {
  /* The gesture layer reads geometry through a ref so `useDrag`'s callbacks stay
     stable across renders while still seeing the latest committed rect. */
  const rectRef = useRef<Rect>({ x: win.x, y: win.y, w: win.w, h: win.h });
  rectRef.current = { x: win.x, y: win.y, w: win.w, h: win.h };

  const getRect = useCallback(() => rectRef.current, []);
  const bounds = useCallback(() => desktop, [desktop]);
  const handleCommit = useCallback(
    (rect: Rect) => onCommit(win.id, rect),
    [onCommit, win.id],
  );

  const { nodeRef, dragHandlers } = useDrag({ getRect, onCommit: handleCommit, bounds });

  const isMobile = desktop.w < 640;

  /* A maximized window ignores its stored rect and fills the desktop. The stored
     rect is untouched, so un-maximizing restores the exact previous geometry. */
  const geo = (win.maximized || isMobile)
    ? { x: 0, y: 0, w: desktop.w, h: desktop.h }
    : { x: win.x, y: win.y, w: win.w, h: win.h };

  const style = useMemo<React.CSSProperties>(
    () => ({
      transform: `translate3d(${geo.x}px, ${geo.y}px, 0)`,
      width: geo.w,
      height: geo.h,
      zIndex: win.z,
      background: 'var(--os-window-bg)',
      backdropFilter: 'blur(40px) saturate(2.0)',
      WebkitBackdropFilter: 'blur(40px) saturate(2.0)',
      borderRadius: (win.maximized || isMobile) ? 0 : 'var(--os-radius)',
      border: `0.5px solid var(--os-border)`,
      // Focused windows lift off the wallpaper; background ones sit flat.
      boxShadow: focused
        ? '0 28px 70px rgba(0, 0, 0, 0.6), 0 0 0 0.5px rgba(255, 255, 255, 0.15), inset 0 0.5px 0.5px rgba(255, 255, 255, 0.25)'
        : '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 0.5px 0.5px rgba(255, 255, 255, 0.15)',
      /* Skip layout+paint entirely for a window the user isn't looking at.
         `contain-intrinsic-size` keeps the frame's own box stable while its
         subtree is skipped, so nothing jumps when it comes back. */
      contentVisibility: focused ? 'visible' : 'auto',
      containIntrinsicSize: `${geo.w}px ${geo.h}px`,
    }),
    [geo.x, geo.y, geo.w, geo.h, win.z, win.maximized, isMobile, focused],
  );

  const [isClosing, setIsClosing] = useState(false);

  const handleAnimatedClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(win.id);
    }, 180);
  }, [onClose, win.id]);

  /* macOS puts its pills on the left; everyone else puts glyphs on the right.
     i3 ('none') draws no buttons at all — closing is Esc or the taskbar. */
  const controls = skin.controls;

  const buttons =
    controls === 'left-traffic' ? (
      <div className="flex items-center gap-[7px] px-[14px] group/traffic">
        {[
          { c: '#ff5f57', hc: '#e33e41', fn: handleAnimatedClose, label: 'Close', glyph: '×' },
          { c: '#febc2e', hc: '#d4a118', fn: () => onMinimize(win.id), label: 'Minimize', glyph: '−' },
          { c: '#28c840', hc: '#1aab29', fn: () => onToggleMax(win.id), label: 'Zoom', glyph: '+' },
        ].map((b) => (
          <button
            key={b.label}
            aria-label={b.label}
            onClick={b.fn}
            className="h-[12px] w-[12px] rounded-full flex items-center justify-center transition-all hover:brightness-90 active:brightness-75"
            style={{ background: focused ? b.c : '#555558' }}
          >
            <span
              className="text-[9px] font-bold leading-none opacity-0 group-hover/traffic:opacity-100 transition-opacity text-black/60"
              style={{ marginTop: b.glyph === '−' ? '-1px' : b.glyph === '+' ? '-0.5px' : '0' }}
            >
              {b.glyph}
            </span>
          </button>
        ))}
      </div>
    ) : controls === 'none' ? null : (
      <div className="flex items-center">
        {controls !== 'right-round' && (
          <>
            <button
              aria-label="Minimize"
              onClick={() => onMinimize(win.id)}
              className="grid h-8 w-10 place-items-center hover:bg-white/10"
            >
              <Minus size={13} />
            </button>
            <button
              aria-label="Maximize"
              onClick={() => onToggleMax(win.id)}
              className="grid h-8 w-10 place-items-center hover:bg-white/10"
            >
              {win.maximized ? <Copy size={11} /> : <Square size={10} />}
            </button>
          </>
        )}
        <button
          aria-label="Close"
          onClick={handleAnimatedClose}
          className={`grid h-8 place-items-center hover:bg-[#e81123] hover:text-white ${
            controls === 'right-round' ? 'mr-1 w-8 rounded-full hover:bg-white/15' : 'w-11'
          }`}
        >
          <X size={13} />
        </button>
      </div>
    );

  return (
    <div
      ref={nodeRef as React.RefObject<HTMLDivElement>}
      role="dialog"
      aria-label={win.title}
      // `hidden` rather than unmounting: a minimized window keeps its scroll
      // position and app state, and restoring costs nothing.
      hidden={win.minimized}
      className={`absolute left-0 top-0 flex flex-col overflow-hidden ${
        isClosing ? 'animate-win-pop-out' : 'animate-win-pop'
      }`}
      style={style}
      // Capture-phase so focusing happens before any inner control's onClick.
      onPointerDownCapture={() => onFocus(win.id)}
    >
      {/* ------------------------------------------------------- titlebar */}
      <div
        {...dragHandlers(null)}
        onDoubleClick={() => onToggleMax(win.id)}
        className="flex h-9 shrink-0 cursor-grab items-center justify-between active:cursor-grabbing"
        style={{
          // Stop the browser turning a titlebar drag into a page scroll on touch.
          touchAction: 'none',
          background: 'var(--os-chrome-bg)',
          color: 'var(--os-chrome-text)',
          opacity: focused ? 1 : 0.75,
          borderBottom: `0.5px solid var(--os-border)`,
          fontFamily: "'SF Pro', -apple-system, sans-serif"
        }}
      >
        {controls === 'left-traffic' && buttons}

        <span
          className={`pointer-events-none min-w-0 flex-1 truncate px-3 text-[13px] font-semibold tracking-[-0.01em] ${
            skin.titleAlign === 'center' ? 'text-center' : 'text-left'
          }`}
        >
          {win.title}
        </span>

        {controls !== 'left-traffic' && buttons}
      </div>

      {/* --------------------------------------------------------- content */}
      <div className="min-h-0 flex-1 overflow-auto bg-transparent" style={{ color: 'var(--os-chrome-text)', fontFamily: "'SF Pro', -apple-system, sans-serif" }}>
        {children}
      </div>

      {!win.maximized && !isMobile &&
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

export default Window;
