import type { WindowState } from '@/os/types';

type Props = {
  win: WindowState;
  focused: boolean;
  /** Move/double-click-to-zoom handlers from the frame. */
  dragProps: React.HTMLAttributes<HTMLElement>;
  onMinimize: (id: string) => void;
  onToggleMax: (id: string) => void;
  onClose: (id: string) => void;
};

/**
 * macOS titlebar — traffic-light pills on the left, centred bold title.
 *
 * The pills go grey when the window loses focus and only reveal their glyphs on
 * hover, which is the detail that makes them read as real.
 */
export default function MacTitlebar({
  win,
  focused,
  dragProps,
  onMinimize,
  onToggleMax,
  onClose,
}: Props) {
  const pills = [
    { key: 'close', colour: '#ff5f57', glyph: '✕', label: 'Close', fn: () => onClose(win.id) },
    { key: 'min', colour: '#febc2e', glyph: '−', label: 'Minimize', fn: () => onMinimize(win.id) },
    { key: 'zoom', colour: '#28c840', glyph: '⤢', label: 'Zoom', fn: () => onToggleMax(win.id) },
  ];

  return (
    <div
      {...dragProps}
      className="group/bar flex h-[38px] shrink-0 select-none items-center"
      style={{
        ...dragProps.style,
        background: 'rgba(58, 58, 62, 0.55)',
        borderBottom: '0.5px solid rgba(255,255,255,0.10)',
        color: '#f2f2f5',
        fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}
    >
      <div className="flex items-center gap-2 pl-3.5">
        {pills.map((p) => (
          <button
            key={p.key}
            aria-label={p.label}
            onClick={p.fn}
            className="grid h-[12px] w-[12px] place-items-center rounded-full transition-[filter] hover:brightness-90 active:brightness-75"
            style={{ background: focused ? p.colour : 'rgba(255,255,255,0.22)' }}
          >
            <span className="text-[8px] font-bold leading-none text-black/55 opacity-0 transition-opacity group-hover/bar:opacity-100">
              {p.glyph}
            </span>
          </button>
        ))}
      </div>

      <span
        className="pointer-events-none min-w-0 flex-1 truncate px-3 text-center text-[13px] font-semibold tracking-[-0.01em]"
        style={{ opacity: focused ? 1 : 0.5 }}
      >
        {win.title}
      </span>

      {/* Balances the pill cluster so the title sits optically centred. */}
      <div className="w-[62px] shrink-0" />
    </div>
  );
}
