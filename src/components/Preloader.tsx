import { useEffect, useMemo, useState } from 'react';

/* ─────────────────────────────────────────────────────────────────
 * Preloader — Stdout theme · Pixelated dissolve reveal
 *
 * Lifecycle
 * ─────────
 *   0 ms    → mount; content shows immediately (no entry animation)
 *   1 000 ms → dissolve starts: all tiles fade with random delays
 *              spread over 800 ms, each tile 200 ms → ~1 s total
 *   2 200 ms → component unmounts
 * ───────────────────────────────────────────────────────────────── */

const TILE        = 40;   // px — pixel square side
const SPREAD      = 800;  // ms — stagger window  ┐ together ≈ 1 s dissolve
const TILE_DUR    = 200;  // ms — per-tile fade   ┘
const DISSOLVE_AT = 1000; // ms — when reveal begins
const UNMOUNT_AT  = DISSOLVE_AT + SPREAD + TILE_DUR + 200; // ≈ 2 200 ms

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const Preloader = () => {
  const [dissolving, setDissolving] = useState(false);
  const [gone,       setGone]       = useState(false);

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
    const t1 = setTimeout(() => setDissolving(true), DISSOLVE_AT);
    const t2 = setTimeout(() => setGone(true),       UNMOUNT_AT);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (gone) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden' }}>

      {/* Pixel tile grid — same colour as BG, dissolves to reveal the app */}
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
              opacity:    dissolving ? 0 : 1,
              transition: `opacity ${TILE_DUR}ms ease ${delay}ms`,
              willChange: dissolving ? 'opacity' : 'auto',
            }}
          />
        ))}
      </div>

      {/* Static content — no entry animation, just centred text */}
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
          opacity: dissolving ? 0 : 1,
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

    </div>
  );
};

export default Preloader;
