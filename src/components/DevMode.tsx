import { useEffect, useRef, useState } from 'react';
import { Gauge, X } from 'lucide-react';
import { findTheme, applyTheme } from '@/lib/themes';

type Props = {
  /** Close dev mode (parent owns the on/off flag so Konami can re-toggle). */
  onClose: () => void;
};

/**
 * DevMode — a hidden HUD unlocked by the Konami Code.
 *
 * Shows a live FPS meter (rAF frame-time sampling) and a "secret" theme unlock.
 * Deliberately styled like a debug overlay: mono, corner-pinned, translucent.
 * Purely cosmetic — no real profiling, just a fun reward for the curious.
 */
export default function DevMode({ onClose }: Props) {
  const [fps, setFps] = useState(0);

  /* Sample FPS by counting rAF ticks per ~500ms window. */
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Track a moving max so the bar has a sensible ceiling on high-refresh screens.
  const peak = useRef(60);
  peak.current = Math.max(peak.current, fps);

  /** Apply the hidden "matrix" theme (green-on-black) as the unlock reward. */
  const unlockSecret = () => {
    // Reuse the shared palette; fall back to a synthesised green if absent.
    const secret =
      findTheme('lime') ??
      findTheme('forest') ?? {
        id: 'matrix',
        label: 'Matrix',
        bg: '#000000',
        bgRgb: '0 0 0',
        accent: '#00ff66',
        accentRgb: '0 255 102',
      };
    applyTheme(secret);
  };

  return (
    <div
      className="fixed bottom-4 left-4 z-[9997] w-56 rounded-soft border border-primary/40 bg-black/85 p-3 font-mono text-xs text-primary shadow-floating backdrop-blur"
      role="status"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-label">
          <Gauge size={13} /> dev mode
        </span>
        <button onClick={onClose} aria-label="Exit dev mode" className="text-primary/70 hover:text-primary">
          <X size={14} />
        </button>
      </div>

      {/* FPS meter */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-primary/60">FPS</span>
          <span className="text-white text-sm font-bold tabular-nums">{fps}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded bg-primary/15">
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${Math.min(100, (fps / peak.current) * 100)}%` }}
          />
        </div>
      </div>

      <button
        onClick={unlockSecret}
        className="mt-3 w-full rounded border border-primary/40 py-1 text-[10px] font-bold uppercase tracking-label text-primary transition-colors hover:bg-primary/10"
      >
        unlock secret theme
      </button>

      <p className="mt-2 text-[9px] leading-tight text-primary/40">
        ▲▲▼▼◀▶◀▶ B A — you found it.
      </p>
    </div>
  );
}
