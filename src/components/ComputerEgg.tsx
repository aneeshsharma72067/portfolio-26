import { useEffect, useRef, useState } from 'react';
import { Monitor, Sparkles } from 'lucide-react';

type Props = {
  onNavigate: (path: string) => void;
};

/**
 * ComputerEgg — Bottom-left corner trigger for /computer desktop mode.
 *
 * Sits EXACTLY in the bottom-left corner.
 * Multi-stage mouse proximity:
 *  - Approach (< 180px): Peeks slightly out from the corner with an accent glow.
 *  - Close proximity (< 70px / Hover): Fully pops up into a glowing glassmorphism pill.
 */
export default function ComputerEgg({ onNavigate }: Props) {
  const [proximity, setProximity] = useState<'far' | 'peek' | 'popup'>('far');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Target point is exact bottom-left corner (x: 0, y: window.innerHeight)
      const targetX = rect.left;
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
      className="fixed bottom-0 left-0 z-50 p-3 pointer-events-auto"
      onMouseEnter={() => setProximity('popup')}
      onMouseLeave={() => setProximity('far')}
    >
      <div className="relative flex items-center justify-start">
        {/* Full Pop-up Button */}
        <button
          onClick={() => onNavigate('/computer')}
          className={`group relative flex items-center gap-2.5 rounded-r-full rounded-tl-xl border border-primary/40 bg-surface-container-highest/90 px-4 py-2.5 backdrop-blur-md shadow-2xl transition-all duration-300 ease-out ${
            isPopup
              ? 'translate-x-0 translate-y-0 opacity-100 scale-100 pointer-events-auto shadow-primary/20 ring-2 ring-primary/40'
              : isPeek
                ? '-translate-x-2 translate-y-1 opacity-70 scale-95 pointer-events-none'
                : '-translate-x-12 translate-y-6 opacity-0 scale-90 pointer-events-none'
          }`}
          title="Boot virtual desktop"
        >
          {/* Ambient Glow Pill */}
          <div className="absolute -inset-0.5 rounded-r-full rounded-tl-xl bg-gradient-to-r from-primary/30 to-purple-500/30 opacity-0 blur transition duration-300 group-hover:opacity-100" />

          <div className="relative flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-surface-container-lowest">
              <Monitor size={15} />
              <Sparkles size={8} className="absolute -top-1 -right-1 text-amber-400 animate-pulse" />
            </div>

            <div className="flex flex-col text-left">
              <span className="font-label text-[11px] font-extrabold uppercase tracking-wider text-primary">
                Desktop Mode
              </span>
              <span className="text-[9px] font-medium text-on-surface-variant/80">
                /computer
              </span>
            </div>
          </div>
        </button>

        {/* Minimal Corner Peek Notch (Visible when far or peeking) */}
        {!isPopup && (
          <div
            className={`absolute bottom-0 left-0 flex items-center gap-1.5 rounded-tr-lg bg-primary/20 px-2 py-1.5 backdrop-blur-sm border-t border-r border-primary/30 transition-all duration-300 ${
              isPeek
                ? 'translate-x-1 -translate-y-1 opacity-100 scale-110 bg-primary/30 border-primary/60 shadow-lg shadow-primary/20'
                : 'translate-x-0 translate-y-0 opacity-40 scale-100 hover:opacity-80'
            }`}
          >
            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            {isPeek && (
              <span className="font-label text-[9px] font-bold text-primary tracking-wide">
                OS
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
