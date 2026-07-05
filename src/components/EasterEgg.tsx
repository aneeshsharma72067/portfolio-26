import { useState } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

type Props = {
  onNavigate: (path: string) => void;
};

/**
 * EasterEgg — Interactive trigger in the bottom right corner.
 *
 * It is a invisible 48x48px hover target at the bottom right.
 * When hovered, a styled button fades and slides in. Clicking it
 * navigates the user to the interactive terminal (/cli).
 */
export default function EasterEgg({ onNavigate }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center justify-end"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Target Area Wrapper */}
      <div className="relative flex h-12 items-center justify-end">
        {/* The popup button */}
        <button
          onClick={() => onNavigate('/cli')}
          className={`flex items-center gap-2 rounded-soft border border-primary/30 bg-surface-container-high px-3.5 py-2 font-label text-[11px] font-bold uppercase tracking-label text-primary shadow-floating transition-all duration-300 ${
            hovered
              ? 'translate-x-0 opacity-100'
              : 'translate-x-4 pointer-events-none opacity-0'
          }`}
          title="Enter terminal mode"
        >
          <TerminalIcon size={13} className="animate-pulse text-primary" />
          /cli
        </button>

        {/* Tiny invisible pixel activator so user can find it */}
        {!hovered && (
          <div className="h-2 w-2 rounded-full bg-primary/20 transition-all duration-300 hover:scale-150 hover:bg-primary/50" />
        )}
      </div>
    </div>
  );
}
