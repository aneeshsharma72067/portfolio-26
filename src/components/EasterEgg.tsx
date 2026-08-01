import { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Sparkles } from 'lucide-react';

type Props = {
  onNavigate: (path: string) => void;
};

/**
 * EasterEgg — Bottom-right corner trigger for /cli interactive terminal mode.
 *
 * Sits EXACTLY in the bottom-right corner.
 * Multi-stage mouse proximity:
 *  - Approach (< 220px): Peeks slightly out from the corner with green glow.
 *  - Close proximity (< 80px / Hover): Fully pops up into a glowing terminal launcher.
 */
export default function EasterEgg({ onNavigate }: Props) {
  const [proximity, setProximity] = useState<'far' | 'peek' | 'popup'>('far');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Target point is exact bottom-right corner (x: window.innerWidth, y: window.innerHeight)
      const targetX = rect.right;
      const targetY = rect.bottom;
      const dist = Math.hypot(e.clientX - targetX, e.clientY - targetY);

      if (dist < 80) {
        setProximity('popup');
      } else if (dist < 220) {
        setProximity('peek');
      } else {
        setProximity('far');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isPeek = proximity === 'peek';
  const isPopup = proximity === 'popup';

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 right-0 z-50 p-3 pointer-events-auto"
      onMouseEnter={() => setProximity('popup')}
      onMouseLeave={() => setProximity('far')}
    >
      <div className="relative flex items-center justify-end">
        {/* Full Pop-up Button */}
        <button
          onClick={() => onNavigate('/cli')}
          className={`group relative flex items-center gap-2.5 rounded-l-full rounded-tr-xl border border-emerald-500/40 bg-surface-container-highest/90 px-4 py-2.5 backdrop-blur-md shadow-2xl transition-all duration-300 ease-out ${
            isPopup
              ? 'translate-x-0 translate-y-0 opacity-100 scale-100 pointer-events-auto shadow-emerald-500/20 ring-2 ring-emerald-500/40'
              : isPeek
                ? 'translate-x-2 translate-y-1 opacity-70 scale-95 pointer-events-none'
                : 'translate-x-12 translate-y-6 opacity-0 scale-90 pointer-events-none'
          }`}
          title="Enter terminal mode"
        >
          {/* Ambient Glow Pill */}
          <div className="absolute -inset-0.5 rounded-l-full rounded-tr-xl bg-gradient-to-r from-emerald-500/30 to-teal-500/30 opacity-0 blur transition duration-300 group-hover:opacity-100" />

          <div className="relative flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-surface-container-lowest">
              <TerminalIcon size={15} />
              <Sparkles size={8} className="absolute -top-1 -right-1 text-emerald-300 animate-pulse" />
            </div>

            <div className="flex flex-col text-right">
              <span className="font-label text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                Terminal Mode
              </span>
              <span className="text-[9px] font-medium text-on-surface-variant/80">
                /cli
              </span>
            </div>
          </div>
        </button>

        {/* Minimal Corner Peek Notch (Visible when far or peeking) */}
        {!isPopup && (
          <div
            className={`absolute bottom-0 right-0 flex items-center gap-1.5 rounded-tl-lg bg-emerald-500/20 px-2 py-1.5 backdrop-blur-sm border-t border-l border-emerald-500/30 transition-all duration-300 ${
              isPeek
                ? '-translate-x-1 -translate-y-1 opacity-100 scale-110 bg-emerald-500/30 border-emerald-500/60 shadow-lg shadow-emerald-500/20'
                : 'translate-x-0 translate-y-0 opacity-40 scale-100 hover:opacity-80'
            }`}
          >
            {isPeek && (
              <span className="font-label text-[9px] font-bold text-emerald-400 tracking-wide">
                CLI
              </span>
            )}
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        )}
      </div>
    </div>
  );
}
