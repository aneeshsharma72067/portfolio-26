import { Fragment, useCallback, useRef, useState } from 'react';
import type { WindowState } from '@/os/types';
import { MAC_ICONS, macAppIcon } from './macIcons';
import type { LaunchableApp } from './MacOS';

type Props = {
  windows: WindowState[];
  activeWindowId: string | null;
  onOpenApp: (app: LaunchableApp) => void;
  onFocusWindow: (id: string) => void;
  onMinimizeWindow: (id: string) => void;
};

type DockItem = {
  key: string;
  name: string;
  icon: string;
  /** Set for app launchers; absent for a plain link. */
  app?: LaunchableApp;
  href?: string;
};

const PINNED: DockItem[] = [
  { key: 'finder', name: 'Finder', icon: MAC_ICONS.finder, app: 'files' },
  { key: 'settings', name: 'System Settings', icon: MAC_ICONS.settings, app: 'settings' },
  { key: 'photos', name: 'Photos', icon: MAC_ICONS.photos, app: 'photos' },
  { key: 'notes', name: 'Notes', icon: MAC_ICONS.notes, app: 'notes' },
  { key: 'github', name: 'GitHub', icon: MAC_ICONS.github, href: 'https://github.com/aneeshsharma72067' },
];

const BASE = 52; // px — resting icon size
const PEAK = 74; // px — size directly under the cursor
const FALLOFF = 0.16; // how fast magnification decays with distance

/**
 * MacDock — the floating magnifying dock.
 *
 * Magnification is written straight to the DOM in a rAF from `pointermove`: at
 * 120 Hz a state-driven version would be ~120 React renders a second for a
 * purely visual effect. `will-change` is only set while the cursor is inside.
 */
export default function MacDock({
  windows,
  activeWindowId,
  onOpenApp,
  onFocusWindow,
  onMinimizeWindow,
}: Props) {
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frame = useRef(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [bouncing, setBouncing] = useState<string | null>(null);

  /* Any window whose app isn't pinned gets its own dock tile, like real macOS. */
  const pinnedApps = new Set(PINNED.map((p) => p.app).filter(Boolean));
  const extras: DockItem[] = windows
    .filter((w) => !pinnedApps.has(w.app as LaunchableApp))
    .map((w) => ({ key: w.id, name: w.title, icon: macAppIcon(w.app) }));

  const items = [...PINNED, ...extras];

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
    setBouncing(item.key);
    setTimeout(() => setBouncing(null), 700);

    if (item.href) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      return;
    }

    if (item.app) {
      /* An already-open app is focused (or hidden if it's frontmost) rather than
         opened twice — matching how clicking a dock icon behaves. */
      const running = windows.filter((w) => w.app === item.app);
      if (running.length === 0) {
        onOpenApp(item.app);
        return;
      }
      const front = running.find((w) => w.id === activeWindowId && !w.minimized);
      if (front) onMinimizeWindow(front.id);
      else onFocusWindow(running[0].id);
      return;
    }

    // Extra (unpinned) tile: it maps directly to one window.
    const win = windows.find((w) => w.id === item.key);
    if (!win) return;
    if (win.id === activeWindowId && !win.minimized) onMinimizeWindow(win.id);
    else onFocusWindow(win.id);
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
          const separator = i > 0 && !item.app && !item.href && (items[i - 1].app || items[i - 1].href);
          const running = item.app
            ? windows.some((w) => w.app === item.app)
            : windows.some((w) => w.id === item.key);
          const isFront = item.app
            ? windows.some((w) => w.app === item.app && w.id === activeWindowId && !w.minimized)
            : item.key === activeWindowId;

          return (
            <Fragment key={item.key}>
              {separator && <div className="mx-1 h-10 w-px self-center rounded-full bg-white/25" />}

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
                  className={bouncing === item.key ? 'animate-dock-bounce' : ''}
                >
                  <div
                    ref={(el) => {
                      iconRefs.current[i] = el;
                    }}
                    className="grid origin-bottom place-items-center"
                    style={{ width: BASE, height: BASE, willChange: 'width, height' }}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      className="pointer-events-none h-full w-full rounded-[22%] object-contain drop-shadow-lg"
                    />
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
