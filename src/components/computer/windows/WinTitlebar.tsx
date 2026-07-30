import { Minus, Square, Copy, X } from 'lucide-react';
import type { WindowState } from '@/os/types';

type Props = {
  win: WindowState;
  focused: boolean;
  /** Move/double-click-to-maximize handlers from the frame. */
  dragProps: React.HTMLAttributes<HTMLElement>;
  onMinimize: (id: string) => void;
  onToggleMax: (id: string) => void;
  onClose: (id: string) => void;
};

/**
 * Windows 11 titlebar — left-aligned title, ─ □ ✕ on the right with the
 * full-height hover fills and the red close button Windows uses.
 *
 * The whole bar is the drag handle except the buttons, which stop propagation
 * via their own pointer handlers being registered after the frame's (React
 * dispatches the button's onClick after the bar's onPointerDown, and a click
 * with no movement commits nothing — see `useDrag`).
 */
export default function WinTitlebar({
  win,
  focused,
  dragProps,
  onMinimize,
  onToggleMax,
  onClose,
}: Props) {
  return (
    <div
      {...dragProps}
      className="flex h-8 shrink-0 select-none items-center justify-between"
      style={{
        ...dragProps.style,
        background: focused ? 'rgba(43, 43, 43, 0.92)' : 'rgba(32, 32, 32, 0.92)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        color: focused ? '#ffffff' : 'rgba(255,255,255,0.55)',
        fontFamily: "'Segoe UI VF', 'Segoe UI Variable', 'Segoe UI', sans-serif",
      }}
    >
      <span className="pointer-events-none min-w-0 flex-1 truncate px-3 text-[12px] font-normal">
        {win.title}
      </span>

      <div className="flex h-full items-center">
        <button
          aria-label="Minimize"
          onClick={() => onMinimize(win.id)}
          className="grid h-full w-[46px] place-items-center transition-colors hover:bg-white/10"
        >
          <Minus size={14} strokeWidth={1.5} />
        </button>
        <button
          aria-label={win.maximized ? 'Restore' : 'Maximize'}
          onClick={() => onToggleMax(win.id)}
          className="grid h-full w-[46px] place-items-center transition-colors hover:bg-white/10"
        >
          {win.maximized ? <Copy size={11} strokeWidth={1.5} /> : <Square size={11} strokeWidth={1.5} />}
        </button>
        <button
          aria-label="Close"
          onClick={() => onClose(win.id)}
          className="grid h-full w-[46px] place-items-center transition-colors hover:bg-[#c42b1c] hover:text-white"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
