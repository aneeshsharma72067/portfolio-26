import { useEffect, useRef, useState } from 'react';
import { FaApple } from 'react-icons/fa6';
import { BsWifi, BsSearch, BsSliders } from 'react-icons/bs';
import type { SkinId } from '@/os/types';
import type { LaunchableApp } from './MacOS';

type Props = {
  /** Name of the frontmost app, shown in bold next to the Apple menu. */
  activeApp: string;
  onOpenApp: (app: LaunchableApp) => void;
  onSkinChange: (id: SkinId) => void;
  onNavigate: (path: string) => void;
};

const MENUS = ['File', 'Edit', 'View', 'Go', 'Window', 'Help'];

/** Live clock. One timer, one re-render a second, scoped to the menubar only. */
function useClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

/**
 * MacMenuBar — the 26px translucent bar across the top, plus the Apple menu.
 *
 * macOS-only; the Windows taskbar is a completely separate component.
 */
export default function MacMenuBar({
  activeApp,
  onOpenApp,
  onSkinChange,
  onNavigate,
}: Props) {
  const time = useClock();
  const [appleOpen, setAppleOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!appleOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAppleOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [appleOpen]);

  const item =
    'w-full rounded-[5px] px-3 py-[5px] text-left text-[13px] text-white/90 transition-colors hover:bg-[#0058d0] hover:text-white';

  return (
    <div
      className="absolute inset-x-0 top-0 z-[9998] flex h-[26px] select-none items-center justify-between px-2"
      style={{
        background: 'rgba(36, 36, 40, 0.66)',
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        color: '#f0f0f5',
        fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
        fontSize: 13,
        letterSpacing: '-0.003em',
      }}
    >
      {/* Left: Apple menu, frontmost app name, then its menus. */}
      <div className="flex items-center">
        <button
          onClick={() => setAppleOpen((v) => !v)}
          aria-label="Apple menu"
          className={`grid h-[22px] w-[28px] place-items-center rounded-[4px] transition-colors hover:bg-white/[0.14] ${
            appleOpen ? 'bg-white/[0.18]' : ''
          }`}
        >
          <FaApple className="h-[15px] w-[15px] opacity-95" />
        </button>

        <span className="rounded-[4px] px-2.5 py-[2px] font-semibold tracking-[-0.01em]">
          {activeApp}
        </span>

        {MENUS.map((m) => (
          <span
            key={m}
            className="hidden rounded-[4px] px-2.5 py-[2px] opacity-90 transition-colors hover:bg-white/[0.10] md:inline-block"
          >
            {m}
          </span>
        ))}
      </div>

      {/* Right: status icons + clock. */}
      <div className="flex items-center gap-0.5">
        <span className="rounded-[4px] px-1.5 py-[3px] hover:bg-white/[0.10]">
          <BsWifi className="h-[14px] w-[14px] opacity-90" />
        </span>
        <span className="rounded-[4px] px-1.5 py-[3px] hover:bg-white/[0.10]">
          <BsSearch className="h-[13px] w-[13px] opacity-90" />
        </span>
        <span className="rounded-[4px] px-1.5 py-[3px] hover:bg-white/[0.10]">
          <BsSliders className="h-[13px] w-[13px] opacity-90" />
        </span>
        <span className="rounded-[4px] px-2 py-[2px] hover:bg-white/[0.10]">
          <span className="hidden sm:inline">
            {time.toLocaleDateString('en-US', { weekday: 'short' })}{' '}
            {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
          </span>
          {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>

      {/* Apple dropdown */}
      {appleOpen && (
        <div
          ref={menuRef}
          className="absolute left-[2px] top-[28px] z-[9999] flex w-[262px] flex-col rounded-[10px] p-[5px]"
          style={{
            background: 'rgba(40, 40, 44, 0.86)',
            backdropFilter: 'blur(60px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(60px) saturate(1.8)',
            border: '0.5px solid rgba(255,255,255,0.16)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <button className={item} onClick={() => setAppleOpen(false)}>
            About This Mac
          </button>

          <div className="mx-3 my-[4px] border-t border-white/[0.12]" />

          <button
            className={item}
            onClick={() => {
              onOpenApp('settings');
              setAppleOpen(false);
            }}
          >
            System Settings…
          </button>
          <button
            className={item}
            onClick={() => {
              onOpenApp('files');
              setAppleOpen(false);
            }}
          >
            Open Finder
          </button>

          <div className="mx-3 my-[4px] border-t border-white/[0.12]" />

          {/* Switching OS remounts the whole shell — see MacOS's docs. */}
          <button
            className={item}
            onClick={() => {
              onSkinChange('windows');
              setAppleOpen(false);
            }}
          >
            Restart into Windows 11…
          </button>

          <div className="mx-3 my-[4px] border-t border-white/[0.12]" />

          <button className={item} onClick={() => setAppleOpen(false)}>
            Sleep
          </button>
          <button className={item} onClick={() => onNavigate('/')}>
            Shut Down…
          </button>
          <button className={item} onClick={() => onNavigate('/')}>
            Log Out Aneesh…
          </button>
        </div>
      )}
    </div>
  );
}
