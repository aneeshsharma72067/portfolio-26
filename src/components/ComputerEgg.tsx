import { useState } from 'react';
import { MonitorSmartphone } from 'lucide-react';

type Props = {
  onNavigate: (path: string) => void;
};

/**
 * ComputerEgg — the bottom-LEFT twin of EasterEgg (which sits bottom-right and
 * leads to /cli). Hovering the 2px dot slides a button in from the left that
 * opens the virtual desktop at /computer.
 *
 * z-index sits below DevMode's 9997 so the Konami-unlocked HUD, which also
 * anchors bottom-left, always wins when both happen to be visible.
 */
export default function ComputerEgg({ onNavigate }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="fixed bottom-4 left-4 z-50 flex items-center justify-start"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="relative flex h-12 items-center justify-start">
        {/* The popup button */}
        <button
          onClick={() => onNavigate('/computer')}
          className={`flex items-center gap-2 rounded-soft border border-primary/30 bg-surface-container-high px-3.5 py-2 font-label text-[11px] font-bold uppercase tracking-label text-primary shadow-floating transition-all duration-300 ${
            hovered
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none -translate-x-4 opacity-0'
          }`}
          title="Boot the virtual desktop"
        >
          <MonitorSmartphone size={13} className="animate-pulse text-primary" />
          /computer
        </button>

        {/* Tiny always-on pixel so the egg is findable at all */}
        {!hovered && (
          <div className="h-2 w-2 rounded-full bg-primary/20 transition-all duration-300 hover:scale-150 hover:bg-primary/50" />
        )}
      </div>
    </div>
  );
}
