import { useEffect, useMemo, useState } from 'react';

/* ─────────────────────────────────────────────────────────────────
 * Preloader — Stdout theme · Pixelated dissolve reveal
 *
 * Lifecycle
 * ─────────
 *   0 ms    → mount; tile grid (same colour as bg) covers the screen
 *   100 ms  → "Aneesh." fades + slides up
 *   300 ms  → "portfolio" label fades up
 *   500 ms  → progress bar sweeps left → right
 *   1 200 ms → dissolve phase starts:
 *                · loading content fades out (150 ms)
 *                · all tiles begin fading independently
 *                  with random delays spread 0 → 1 700 ms
 *                  each tile transition: 280 ms
 *                  ∴ last tile gone ≈ 1 200 + 1 700 + 280 = 3 180 ms
 *   3 300 ms → component unmounts (returns null)
 *
 * The main app behind has no opacity transition — the dissolving
 * squares directly reveal it, which is the whole pixel-reveal effect.
 * ───────────────────────────────────────────────────────────────── */

/** Side length of one "pixel" square (CSS px) */
const TILE = 40;

/** Total time spread across which tile delays are distributed (ms) */
const SPREAD = 1700;

/** Duration of each individual tile's fade (ms) */
const TILE_DUR = 280;

/** When the loading content fades out (ms after mount) */
const DISSOLVE_START = 1200;

/** When the whole component unmounts (ms after mount) */
const UNMOUNT_AT = DISSOLVE_START + SPREAD + TILE_DUR + 300; // ≈ 3 480 ms

/* ── Fisher-Yates shuffle (in-place) ─────────────────────────── */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ── Component ───────────────────────────────────────────────── */

const Preloader = () => {
  const [dissolving, setDissolving] = useState(false);
  const [gone,       setGone]       = useState(false);

  /* Compute grid dimensions once — window is available in Vite SPA */
  const { cols, rows } = useMemo(() => ({
    cols: Math.ceil(window.innerWidth  / TILE) + 1,
    rows: Math.ceil(window.innerHeight / TILE) + 1,
  }), []);

  /**
   * Randomly ordered exit delays for every tile.
   * We build an evenly-spaced array [0, 1, …, n-1] scaled to SPREAD,
   * then shuffle it so the spatial order is completely random.
   */
  const tileDelays = useMemo<number[]>(() => {
    const n = cols * rows;
    const delays = Array.from({ length: n }, (_, i) =>
      Math.round((i / n) * SPREAD)
    );
    return shuffle(delays);
  }, [cols, rows]);

  useEffect(() => {
    const t1 = setTimeout(() => setDissolving(true), DISSOLVE_START);
    const t2 = setTimeout(() => setGone(true),       UNMOUNT_AT);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  /* Fully out of the DOM once the dissolve is complete */
  if (gone) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        overflow: 'hidden',
        /* No background on the container — tiles provide the fill */
      }}
    >
      {/* ── Pixel tile grid ────────────────────────────────────────
       *  Each tile is the same colour as the site background.
       *  When dissolving=true, tiles fade out with individual delays.
       *  The result: pixels "turn off" randomly, revealing the
       *  main app underneath.
       * ─────────────────────────────────────────────────────────── */}
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
              /* Tile colour matches the preloader / site background */
              backgroundColor: '#0e1320',
              opacity:   dissolving ? 0 : 1,
              /* GPU-composited property only → no layout thrash */
              transition: `opacity ${TILE_DUR}ms ease ${delay}ms`,
              willChange: dissolving ? 'opacity' : 'auto',
            }}
          />
        ))}
      </div>

      {/* ── Loading content — above tiles ──────────────────────────
       *  Fades out quickly when the dissolve starts, so the pixel
       *  grid is the only thing left on screen during the reveal.
       * ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          /* Fast exit so the pixel dissolve is the star */
          opacity: dissolving ? 0 : 1,
          transition: 'opacity 150ms ease',
          pointerEvents: 'none',
        }}
      >
        {/* Name */}
        <h1
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 900,
            color: '#dee2f5',
            letterSpacing: '-0.025em',
            margin: 0,
            lineHeight: 1,
            opacity: 0,
            animation: 'pl-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.1s forwards',
          }}
        >
          Aneesh<span style={{ color: '#55ddad' }}>.</span>
        </h1>

        {/* Eyebrow label */}
        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '0.625rem',
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#55ddad',
            margin: 0,
            opacity: 0,
            animation: 'pl-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.3s forwards',
          }}
        >
          portfolio
        </p>

        {/* Progress bar */}
        <div
          style={{
            marginTop: '0.75rem',
            width: 96,
            height: 2,
            borderRadius: 999,
            backgroundColor: '#1a1f2d',
            overflow: 'hidden',
            opacity: 0,
            animation: 'pl-up 0.3s ease 0.5s forwards',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '100%',
              backgroundColor: '#55ddad',
              borderRadius: 999,
              transformOrigin: 'left center',
              transform: 'scaleX(0)',
              animation: 'pl-bar 0.85s cubic-bezier(0.4,0,0.2,1) 0.55s forwards',
              boxShadow: '0 0 10px rgba(85,221,173,0.6)',
            }}
          />
        </div>
      </div>

      {/* Scoped keyframes */}
      <style>{`
        @keyframes pl-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes pl-bar {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

export default Preloader;
