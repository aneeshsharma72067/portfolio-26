import { useEffect, useRef, useState } from 'react';
import { BsSearch } from 'react-icons/bs';
import { LogOut, Power, Volume2, Wifi, BatteryFull, ChevronUp } from 'lucide-react';
import type { SkinId, WindowState } from '@/os/types';
import { WIN_ICONS, winAppIcon } from './winIcons';
import type { LaunchableApp } from './WindowsOS';

type Props = {
  windows: WindowState[];
  activeWindowId: string | null;
  onOpenApp: (app: LaunchableApp) => void;
  onFocusWindow: (id: string) => void;
  onMinimizeWindow: (id: string) => void;
  /** Switch to the other OS (mounts a different shell entirely). */
  onSkinChange: (id: SkinId) => void;
  /** Leave /computer through the site's preloader transition. */
  onNavigate: (path: string) => void;
};

/** Apps pinned to the taskbar, left to right after Start + Search. */
const PINNED: { app: LaunchableApp; label: string }[] = [
  { app: 'files', label: 'File Explorer' },
  { app: 'settings', label: 'Settings' },
  { app: 'photos', label: 'Photos' },
  { app: 'notes', label: 'Notepad' },
];

/** Live clock. One timer, one re-render a second, scoped to the taskbar only. */
function useClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

/**
 * WinTaskbar — Windows 11's centred taskbar, its Start menu and its system tray.
 *
 * Entirely self-contained: nothing here is shared with the macOS dock, so the
 * two can be restyled independently without one breaking the other.
 */
export default function WinTaskbar({
  windows,
  activeWindowId,
  onOpenApp,
  onFocusWindow,
  onMinimizeWindow,
  onSkinChange,
  onNavigate,
}: Props) {
  const time = useClock();
  const [startOpen, setStartOpen] = useState(false);
  const startRef = useRef<HTMLDivElement>(null);

  /* Click anywhere outside closes the Start menu, the way it behaves for real. */
  useEffect(() => {
    if (!startOpen) return;
    const onDown = (e: MouseEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) {
        setStartOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [startOpen]);

  /** Clicking a running app's button focuses it, or minimizes it if it's on top. */
  const toggleWindow = (win: WindowState) => {
    if (win.id === activeWindowId && !win.minimized) onMinimizeWindow(win.id);
    else onFocusWindow(win.id);
  };

  const launch = (app: LaunchableApp) => {
    onOpenApp(app);
    setStartOpen(false);
  };

  /* Windows already pinned get their indicator on the pinned button, so the
     overflow list only shows apps that aren't pinned. */
  const pinnedApps = new Set(PINNED.map((p) => p.app));
  const extraWindows = windows.filter((w) => !pinnedApps.has(w.app as LaunchableApp));

  const timeLabel = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateLabel = time.toLocaleDateString([], {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      {/* ═════════════════════════════════════════════════════ Start menu */}
      {startOpen && (
        <div
          ref={startRef}
          className="absolute bottom-[56px] left-1/2 z-[9999] flex w-[540px] max-w-[94vw] -translate-x-1/2 flex-col gap-4 rounded-[10px] p-5 animate-win-pop"
          style={{
            background: 'rgba(43, 43, 43, 0.86)',
            backdropFilter: 'blur(60px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(60px) saturate(1.6)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
            fontFamily: "'Segoe UI VF', 'Segoe UI Variable', 'Segoe UI', sans-serif",
          }}
        >
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search for apps, settings and documents"
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-2 pl-9 text-[12px] text-white placeholder-white/40 outline-none transition-colors focus:border-[#0078d4]"
            />
            <BsSearch className="absolute left-3.5 text-white/40" size={12} />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-[12px] font-semibold text-white">Pinned</span>
              <span className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-white/50">
                All apps
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1">
              {PINNED.map(({ app, label }) => (
                <button
                  key={app}
                  onClick={() => launch(app)}
                  className="group flex flex-col items-center gap-1.5 rounded-lg p-2.5 text-center transition-colors hover:bg-white/10"
                >
                  <img
                    src={winAppIcon(app)}
                    alt=""
                    className="h-8 w-8 object-contain transition-transform group-hover:scale-105"
                  />
                  <span className="w-full truncate text-[11px] text-white/85">{label}</span>
                </button>
              ))}

              <button
                onClick={() => {
                  window.open('https://github.com/aneeshsharma72067', '_blank', 'noopener,noreferrer');
                  setStartOpen(false);
                }}
                className="group flex flex-col items-center gap-1.5 rounded-lg p-2.5 text-center transition-colors hover:bg-white/10"
              >
                <img src={WIN_ICONS.info} alt="" className="h-8 w-8 object-contain transition-transform group-hover:scale-105" />
                <span className="w-full truncate text-[11px] text-white/85">GitHub</span>
              </button>

              <button
                onClick={() => launch('files')}
                className="group flex flex-col items-center gap-1.5 rounded-lg p-2.5 text-center transition-colors hover:bg-white/10"
              >
                <img src={WIN_ICONS.folder} alt="" className="h-8 w-8 object-contain transition-transform group-hover:scale-105" />
                <span className="w-full truncate text-[11px] text-white/85">Projects</span>
              </button>
            </div>
          </div>

          {/* Switching OS remounts the whole shell — see WindowsOS's docs. */}
          <div className="border-t border-white/10 pt-3">
            <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Switch computer
            </div>
            <button
              onClick={() => onSkinChange('mac')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/10"
            >
              <span className="text-[15px]"></span>
              <div className="flex flex-col">
                <span className="text-[12px] font-medium text-white">Boot into macOS</span>
                <span className="text-[10.5px] text-white/45">Sonoma 14.5 · closes open windows</span>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <div className="flex items-center gap-2.5 rounded-md px-2 py-1">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-[#0078d4] text-[11px] font-bold text-white">
                A
              </div>
              <span className="text-[12px] font-semibold text-white">Aneesh Sharma</span>
            </div>
            <button
              onClick={() => onNavigate('/')}
              title="Shut down"
              className="rounded-md p-2 text-white/70 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
            >
              <Power size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ Taskbar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[9998] flex h-12 select-none items-center px-2"
        style={{
          background: 'rgba(32, 32, 32, 0.82)',
          backdropFilter: 'blur(40px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.6)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          color: '#ffffff',
          fontFamily: "'Segoe UI VF', 'Segoe UI Variable', 'Segoe UI', sans-serif",
        }}
      >
        {/* Left: weather widget, hidden when there's no room for it. */}
        <div className="hidden flex-1 items-center sm:flex">
          <div className="flex items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-white/10">
            <span className="text-[15px]">⛅</span>
            <div className="flex flex-col text-[11px] leading-tight">
              <span>24°C</span>
              <span className="text-[9.5px] text-white/55">Mostly sunny</span>
            </div>
          </div>
        </div>

        {/* Centre: Start, Search, pinned apps, then anything else running. */}
        <div className="flex flex-1 items-center justify-center gap-0.5">
          <button
            onClick={() => setStartOpen((v) => !v)}
            title="Start"
            className={`grid h-10 w-10 place-items-center rounded-md transition-colors hover:bg-white/10 ${
              startOpen ? 'bg-white/10' : ''
            }`}
          >
            <img src={WIN_ICONS.home} alt="Start" className="h-6 w-6 object-contain" />
          </button>

          <button
            onClick={() => setStartOpen((v) => !v)}
            title="Search"
            className="grid h-10 w-10 place-items-center rounded-md text-white/85 transition-colors hover:bg-white/10"
          >
            <BsSearch size={15} />
          </button>

          {PINNED.map(({ app, label }) => {
            const running = windows.filter((w) => w.app === app);
            const isActive = running.some((w) => w.id === activeWindowId && !w.minimized);
            return (
              <button
                key={app}
                title={label}
                onClick={() => {
                  /* Clicking a pinned app with a window open behaves like the
                     real taskbar: focus it, or minimize if already on top. */
                  if (running.length > 0) toggleWindow(running[0]);
                  else onOpenApp(app);
                }}
                className={`relative grid h-10 w-10 place-items-center rounded-md transition-colors hover:bg-white/10 ${
                  isActive ? 'bg-white/10' : ''
                }`}
              >
                <img src={winAppIcon(app)} alt={label} className="h-6 w-6 object-contain" />
                {running.length > 0 && (
                  <span
                    className={`absolute bottom-0.5 h-[3px] rounded-full transition-all ${
                      isActive ? 'w-4 bg-[#4cc2ff]' : 'w-1.5 bg-white/55'
                    }`}
                  />
                )}
              </button>
            );
          })}

          {extraWindows.map((win) => {
            const isActive = win.id === activeWindowId && !win.minimized;
            return (
              <button
                key={win.id}
                title={win.title}
                onClick={() => toggleWindow(win)}
                className={`relative grid h-10 w-10 place-items-center rounded-md transition-colors hover:bg-white/10 ${
                  isActive ? 'bg-white/10' : ''
                }`}
              >
                <img src={winAppIcon(win.app)} alt="" className="h-6 w-6 object-contain" />
                <span
                  className={`absolute bottom-0.5 h-[3px] rounded-full transition-all ${
                    isActive ? 'w-4 bg-[#4cc2ff]' : win.minimized ? 'w-1.5 bg-white/40' : 'w-2.5 bg-white/55'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right: system tray + clock. */}
        <div className="flex flex-1 items-center justify-end gap-1 text-[11px]">
          <div className="hidden items-center gap-2 rounded px-2 py-1.5 text-white/80 transition-colors hover:bg-white/10 sm:flex">
            <ChevronUp size={12} />
            <Wifi size={14} />
            <Volume2 size={14} />
            <BatteryFull size={14} />
          </div>
          <div className="flex flex-col rounded px-2 py-1 text-right leading-tight transition-colors hover:bg-white/10">
            <span>{timeLabel}</span>
            <span className="text-[10px] text-white/70">{dateLabel}</span>
          </div>
          <button
            onClick={() => onNavigate('/')}
            title="Log out of the desktop"
            className="rounded p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </>
  );
}
