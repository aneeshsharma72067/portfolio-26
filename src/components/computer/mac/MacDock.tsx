import { Fragment, useCallback, useRef, useState } from 'react';
import type { LaunchableApp, WindowState } from '@/os/types';
import { MAC_ICONS, macAppIcon, macHasArtwork } from './macIcons';

type Props = {
  windows: WindowState[];
  activeWindowId: string | null;
  onOpenApp: (app: LaunchableApp, title?: string) => void;
  onFocusWindow: (id: string) => void;
  onMinimizeWindow: (id: string) => void;
  /** Trash tile: how many items are in it, and how to open it. */
  trashCount: number;
};

type DockItem = {
  key: string;
  name: string;
  /** Set for app launchers; absent for a plain link. */
  app?: LaunchableApp;
  href?: string;
  /** A CSS tile for apps with no PNG artwork — see `tile` below. */
  tile?: { glyph: string; from: string; to: string };
};

/**
 * The dock's contents. Apps with real artwork use it; the rest get a gradient
 * tile with a glyph, which reads far better than a wrong-looking stock PNG.
 */
const PINNED: DockItem[] = [
  { key: 'finder', name: 'Finder', app: 'files' },
  { key: 'terminal', name: 'Terminal', app: 'terminal' },
  { key: 'notes', name: 'Notes', app: 'notes' },
  { key: 'photos', name: 'Photos', app: 'photos' },
  { key: 'calc', name: 'Calculator', app: 'calc' },
  {
    key: 'taskmgr',
    name: 'Activity Monitor',
    app: 'taskmgr',
  },
  { key: 'settings', name: 'System Settings', app: 'settings' },
  {
    key: 'github',
    name: 'GitHub',
    href: 'https://github.com/jiffyaneesh',
  },
];

const BASE = 52; // px — resting icon size
const PEAK = 76; // px — size directly under the cursor
const FALLOFF = 0.16; // how fast magnification decays with distance

/**
 * MacDock — the floating magnifying dock.
 *
 * macOS-ONLY. Windows' taskbar is a completely separate component: a flat
 * centred strip with no magnification, underline indicators instead of dots,
 * and a Start flyout. Nothing here is shared with it.
 *
 * macOS details that matter:
 *  · MAGNIFICATION — written straight to the DOM in a rAF from `pointermove`,
 *    because at 120 Hz a state-driven version would be ~120 React renders a
 *    second for a purely visual effect
 *  · a launch BOUNCE on the icon when an app opens
 *  · the running dot under each open app
 *  · Trash pinned at the far right behind a separator, showing full or empty
 */
export default function MacDock({
  windows,
  activeWindowId,
  onOpenApp,
  onFocusWindow,
  onMinimizeWindow,
  trashCount,
}: Props) {
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frame = useRef(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [bouncing, setBouncing] = useState<string | null>(null);

  /* The Trash tile always sits last, after a separator — as it does for real. */
  const trashItem: DockItem = {
    key: 'trash',
    name: trashCount > 0 ? `Trash — ${trashCount} items` : 'Trash',
    app: 'trash',
    tile: {
      glyph: trashCount > 0 ? '🗑' : '🗑',
      from: trashCount > 0 ? '#5a5a5e' : '#3a3a3c',
      to: '#2c2c2e',
    },
  };

  const items = [...PINNED, trashItem];

  const handleMove = useCallback((e: React.PointerEvent) => {
    const x = e.clientX;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      iconRefs.current.forEach((el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const distance = Math.abs(x - (r.left + r.width / 2));
        const size = Math.max(BASE, PEAK - distance * FALLOFF);
        el.style.transition = 'none';
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
      });
    });
  }, []);

  const handleLeave = useCallback(() => {
    setHovered(null);
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = 0;
    iconRefs.current.forEach((el) => {
      if (!el) return;
      el.style.transition = 'width 0.18s ease-out, height 0.18s ease-out';
      el.style.width = `${BASE}px`;
      el.style.height = `${BASE}px`;
    });
  }, []);

  const handleClick = (item: DockItem) => {
    if (item.href) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!item.app) return;

    /* An already-open app is focused (or hidden if it's frontmost) rather than
       opened twice — matching how clicking a dock icon behaves. */
    const running = windows.filter((w) => w.app === item.app && w.phase !== 'closing');
    if (running.length === 0) {
      // The bounce belongs to a LAUNCH only; focusing an open app doesn't bounce.
      setBouncing(item.key);
      setTimeout(() => setBouncing(null), 700);
      onOpenApp(item.app, item.name);
      return;
    }
    const front = running.find((w) => w.id === activeWindowId && !w.minimized);
    if (front) onMinimizeWindow(front.id);
    else onFocusWindow(running[0].id);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-[9998] flex justify-center">
      <div
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="pointer-events-auto flex items-end gap-1.5 rounded-[22px] px-2.5 py-2.5"
        style={{
          background: 'rgba(255, 255, 255, 0.18)',
          backdropFilter: 'blur(40px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          border: '0.5px solid rgba(255,255,255,0.25)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        }}
      >
        {items.map((item, i) => {
          // The Trash and any plain link sit behind a separator, as on a real dock.
          const separator = item.key === 'trash' || item.key === 'github';
          const running = item.app
            ? windows.some((w) => w.app === item.app && w.phase !== 'closing')
            : false;
          const isFront = item.app
            ? windows.some(
                (w) => w.app === item.app && w.id === activeWindowId && !w.minimized,
              )
            : false;

          return (
            <Fragment key={item.key}>
              {separator && (
                <div className="mx-1 h-10 w-px self-center rounded-full bg-white/25" />
              )}

              <div
                className="relative flex flex-col items-center"
                onPointerEnter={() => setHovered(i)}
              >
                {/* Tooltip */}
                <div
                  className={`pointer-events-none absolute -top-11 whitespace-nowrap rounded-md px-3 py-1 text-[11.5px] font-medium text-white transition-all duration-150 ${
                    hovered === i ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0'
                  }`}
                  style={{
                    background: 'rgba(20, 20, 25, 0.78)',
                    backdropFilter: 'blur(16px)',
                    border: '0.5px solid rgba(255,255,255,0.12)',
                    fontFamily: "'SF Pro', -apple-system, sans-serif",
                  }}
                >
                  {item.name}
                </div>

                <button
                  aria-label={item.name}
                  onClick={() => handleClick(item)}
                  className={bouncing === item.key ? 'anim-dock-bounce' : ''}
                >
                  <div
                    ref={(el) => {
                      iconRefs.current[i] = el;
                    }}
                    className="grid origin-bottom place-items-center"
                    style={{ width: BASE, height: BASE, willChange: 'width, height' }}
                  >
                    {item.tile ? (
                      /* CSS tile for apps with no artwork — a squircle with a
                         glyph, which sits far better next to real macOS icons
                         than a mismatched stock PNG would. */
                      <div
                        className="grid h-full w-full place-items-center rounded-[22%] text-white shadow-lg"
                        style={{
                          background: `linear-gradient(160deg, ${item.tile.from}, ${item.tile.to})`,
                          border: '0.5px solid rgba(255,255,255,0.18)',
                          fontSize: '55%',
                          fontFamily: "'SF Mono', ui-monospace, monospace",
                        }}
                      >
                        {item.tile.glyph}
                      </div>
                    ) : (
                      <img
                        src={
                          item.key === 'github'
                            ? MAC_ICONS.github
                            : item.app && macHasArtwork(item.app)
                              ? macAppIcon(item.app)
                              : MAC_ICONS.file
                        }
                        alt=""
                        className="pointer-events-none h-full w-full rounded-[22%] object-contain drop-shadow-lg"
                      />
                    )}
                  </div>
                </button>

                {/* Running indicator */}
                <span
                  className={`absolute -bottom-1.5 h-[3px] w-[3px] rounded-full transition-opacity ${
                    running ? 'opacity-100' : 'opacity-0'
                  } ${isFront ? 'bg-white' : 'bg-white/55'}`}
                />
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
