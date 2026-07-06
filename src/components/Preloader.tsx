import { useEffect, useMemo, useState } from 'react';

/* ─────────────────────────────────────────────────────────────────
 * Preloader — Stdout theme · Pixelated dissolve reveal
 * Supports two modes:
 *  1. 'boot': Renders immediately covered (opaque green screen),
 *     holds for 800ms, then dissolves randomly over 550ms.
 *  2. 'transition': Intermediate transition for routing.
 *     Starts fully transparent, pixel-fades IN (covers screen),
 *     fires onMidpoint callback, then pixel-fades OUT (uncovers).
 * ───────────────────────────────────────────────────────────────── */

const TILE        = 80;   // px — pixel square side (increased for larger pixels)
const SPREAD      = 400;  // ms — stagger window (reduced for faster dissolve)
const TILE_DUR    = 150;  // ms — per-tile fade duration (reduced for snappier fade)
const DISSOLVE_AT = 800;  // ms — when reveal begins (starts slightly earlier)

interface PreloaderProps {
  mode?: 'boot' | 'transition';
  onMidpoint?: () => void;
  onComplete?: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const Preloader = ({ mode = 'boot', onMidpoint, onComplete }: PreloaderProps) => {
  // Opaque by default on boot, transparent by default on routing transition
  const [isCovered, setIsCovered] = useState(mode === 'boot');

  const { cols, rows } = useMemo(() => ({
    cols: Math.ceil(window.innerWidth  / TILE) + 1,
    rows: Math.ceil(window.innerHeight / TILE) + 1,
  }), []);

  const tileDelays = useMemo<number[]>(() => {
    const n = cols * rows;
    return shuffle(Array.from({ length: n }, (_, i) =>
      Math.round((i / n) * SPREAD)
    ));
  }, [cols, rows]);

  useEffect(() => {
    if (mode === 'boot') {
      // Boot flow: opaque -> wait -> dissolve
      const t1 = setTimeout(() => {
        setIsCovered(false);
      }, DISSOLVE_AT);

      const t2 = setTimeout(() => {
        if (onComplete) onComplete();
      }, DISSOLVE_AT + SPREAD + TILE_DUR + 100);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      // Transition flow: transparent -> cover -> midpoint -> dissolve -> complete
      // Trigger cover animation almost immediately on mount
      const t1 = setTimeout(() => {
        setIsCovered(true);
      }, 30);

      // Wait for cover animation (550ms from start) to fire midpoint and start dissolving
      const t2 = setTimeout(() => {
        if (onMidpoint) onMidpoint();
        setIsCovered(false);
      }, 30 + SPREAD + TILE_DUR + 50); // ~630ms

      // Wait for dissolve animation to complete before removing
      const t3 = setTimeout(() => {
        if (onComplete) onComplete();
      }, 30 + (SPREAD + TILE_DUR) * 2 + 150); // ~1300ms

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [mode]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden', pointerEvents: 'none' }}>

      {/* Pixel tile grid — covers or uncovers viewport dynamically */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${TILE}px)`,
          gridTemplateRows:    `repeat(${rows}, ${TILE}px)`,
        }}
      >
        {tileDelays.map((delay, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#55ddad', // primary green background
              opacity:    isCovered ? 1 : 0,
              transition: `opacity ${TILE_DUR}ms ease ${delay}ms`,
              willChange: 'opacity',
              pointerEvents: 'auto', // tiles block clicks while they exist
            }}
          />
        ))}
      </div>

      {/* Static content — only rendered during initial boot sequence */}
      {mode === 'boot' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: isCovered ? 1 : 0,
            transition: 'opacity 120ms ease',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <h1 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 900,
            color: '#0e1320', // dark text contrasting with green bg
            letterSpacing: '-0.025em',
            margin: 0,
            lineHeight: 1,
          }}>
            Aneesh<span style={{ color: '#ffffff' }}>.</span>
          </h1>

          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(14, 19, 32, 0.75)', // dark muted text contrasting with green bg
            margin: 0,
          }}>
            portfolio
          </p>
        </div>
      )}

    </div>
  );
};

export default Preloader;
