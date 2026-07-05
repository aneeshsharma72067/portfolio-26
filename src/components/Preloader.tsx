import { useEffect, useMemo, useState } from 'react';

/* ─────────────────────────────────────────────────────────────────
 * Preloader — Stdout theme · Pixelated dissolve reveal
 *
 * Content animations (staggered fade-up)
 * ───────────────────────────────────────
 *   t=50ms   → scan-line sweeps top→bottom (1.4s, one-shot)
 *   t=150ms  → eyebrow "PORTFOLIO · 2026" slides up
 *   t=300ms  → name "Aneesh." slides up (large)
 *   t=450ms  → role "Software Development Engineer" slides up
 *   t=650ms  → bracket lines draw outward left & right
 *   t=750ms  → progress bar sweeps left→right
 *   t=950ms  → three animated dots appear + pulse in sequence
 *
 * Dissolve (pixel reveal = 1 second)
 * ────────────────────────────────────
 *   t=1 900ms → content layer fades out instantly (120ms)
 *   t=1 900ms → all tiles begin fading with random delays [0–800ms]
 *               each tile transition: 200ms
 *               ∴ last pixel gone ≈ 1 900 + 800 + 200 = 2 900ms
 *   t=3 100ms → component unmounts (returns null)
 * ───────────────────────────────────────────────────────────────── */

const TILE          = 40;    // px — pixel square side length
const SPREAD        = 800;   // ms — stagger window (gives 1 s dissolve)
const TILE_DUR      = 200;   // ms — individual tile fade duration
const DISSOLVE_AT   = 1900;  // ms — when pixel reveal begins
const UNMOUNT_AT    = DISSOLVE_AT + SPREAD + TILE_DUR + 200; // ≈ 3 100 ms

/* ── Fisher-Yates in-place shuffle ─────────────────────────── */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ── Shared inline-style constants ─────────────────────────── */
const BG   = '#0e1320';
const MINT = '#55ddad';
const TEXT = '#dee2f5';
const MUTED = '#86948c';

/* ── Component ───────────────────────────────────────────────── */

const Preloader = () => {
  const [dissolving, setDissolving] = useState(false);
  const [gone,       setGone]       = useState(false);

  /* Compute grid once — window available in Vite SPA */
  const { cols, rows } = useMemo(() => ({
    cols: Math.ceil(window.innerWidth  / TILE) + 1,
    rows: Math.ceil(window.innerHeight / TILE) + 1,
  }), []);

  /* Random exit delay per tile — evenly distributed then shuffled */
  const tileDelays = useMemo<number[]>(() => {
    const n = cols * rows;
    return shuffle(
      Array.from({ length: n }, (_, i) => Math.round((i / n) * SPREAD))
    );
  }, [cols, rows]);

  useEffect(() => {
    const t1 = setTimeout(() => setDissolving(true), DISSOLVE_AT);
    const t2 = setTimeout(() => setGone(true),       UNMOUNT_AT);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (gone) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden' }}>

      {/* ── Subtle dot-grid backdrop texture ──────────────────────
       *  Very faint dot matrix gives a "tech canvas" feel.          */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: BG,
          backgroundImage: `radial-gradient(${MINT} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          opacity: 0.045,
        }}
      />

      {/* ── Scan-line — thin mint beam sweeps once top → bottom ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${MINT}, transparent)`,
          boxShadow: `0 0 18px 4px ${MINT}55`,
          opacity: 0,
          animation: `pl-scan 1.4s ease-in 50ms forwards`,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* ── Pixel tile grid ───────────────────────────────────────
       *  Tiles are same colour as BG so invisible during load.
       *  When dissolving=true all tiles fade with individual delays.  */}
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
              backgroundColor: BG,
              opacity:   dissolving ? 0 : 1,
              transition: `opacity ${TILE_DUR}ms ease ${delay}ms`,
              willChange: dissolving ? 'opacity' : 'auto',
            }}
          />
        ))}
      </div>

      {/* ── Content layer — above tiles ───────────────────────────
       *  Fades out in 120 ms when dissolve starts so the pixel grid
       *  is the only thing on screen during the reveal.              */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          opacity: dissolving ? 0 : 1,
          transition: 'opacity 120ms ease',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {/* Eyebrow — "PORTFOLIO · 2026" */}
        <p style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: '0.55rem',
          fontWeight: 700,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: MINT,
          margin: '0 0 20px 0',
          opacity: 0,
          animation: 'pl-up 0.5s cubic-bezier(0.22,1,0.36,1) 150ms forwards',
        }}>
          Portfolio &nbsp;·&nbsp; 2026
        </p>

        {/* Name */}
        <h1 style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
          fontWeight: 900,
          color: TEXT,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          margin: 0,
          opacity: 0,
          animation: 'pl-up 0.65s cubic-bezier(0.22,1,0.36,1) 300ms forwards',
        }}>
          Aneesh<span style={{ color: MINT }}>.</span>
        </h1>

        {/* Role */}
        <p style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: MUTED,
          letterSpacing: '0.04em',
          margin: '10px 0 0 0',
          opacity: 0,
          animation: 'pl-up 0.55s cubic-bezier(0.22,1,0.36,1) 450ms forwards',
        }}>
          Software Development Engineer
        </p>

        {/* Bracket lines — draw outward from center */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          margin: '28px 0 0 0',
          opacity: 0,
          animation: 'pl-up 0.4s ease 650ms forwards',
        }}>
          {/* Left line */}
          <div style={{
            height: 1,
            width: 0,
            backgroundColor: `${MINT}55`,
            animation: 'pl-line 0.6s ease 700ms forwards',
            transformOrigin: 'right center',
          }} />

          {/* Centre dot */}
          <div style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            backgroundColor: MINT,
            boxShadow: `0 0 8px ${MINT}`,
            flexShrink: 0,
          }} />

          {/* Right line */}
          <div style={{
            height: 1,
            width: 0,
            backgroundColor: `${MINT}55`,
            animation: 'pl-line 0.6s ease 700ms forwards',
            transformOrigin: 'left center',
          }} />
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: 20,
          width: 120,
          height: 2,
          borderRadius: 999,
          backgroundColor: '#1a1f2d',
          overflow: 'hidden',
          opacity: 0,
          animation: 'pl-up 0.3s ease 750ms forwards',
        }}>
          <div style={{
            height: '100%',
            width: '100%',
            backgroundColor: MINT,
            borderRadius: 999,
            transformOrigin: 'left center',
            transform: 'scaleX(0)',
            animation: 'pl-bar 1.0s cubic-bezier(0.4,0,0.2,1) 800ms forwards',
            boxShadow: `0 0 12px ${MINT}88`,
          }} />
        </div>

        {/* Three pulsing dots — loading indicator */}
        <div style={{
          display: 'flex',
          gap: 6,
          marginTop: 24,
          opacity: 0,
          animation: 'pl-up 0.3s ease 950ms forwards',
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: MINT,
                opacity: 0.3,
                animation: `pl-dot 1.2s ease ${950 + i * 200}ms infinite`,
              }}
            />
          ))}
        </div>

      </div>{/* /content layer */}

      {/* ── All scoped keyframes ────────────────────────────────── */}
      <style>{`
        /* Fade + slide up — used by every content element */
        @keyframes pl-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);   }
        }

        /* Progress bar fill (scaleX 0 → 1, GPU-composited) */
        @keyframes pl-bar {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        /* Bracket lines grow from 0 → 80px */
        @keyframes pl-line {
          from { width: 0px; }
          to   { width: 80px; }
        }

        /* Scan-line sweeps from top to bottom of the screen */
        @keyframes pl-scan {
          0%   { opacity: 0; transform: translateY(0);    }
          5%   { opacity: 1;                              }
          95%  { opacity: 0.7;                            }
          100% { opacity: 0; transform: translateY(100vh);}
        }

        /* Three-dot sequential pulse */
        @keyframes pl-dot {
          0%, 100% { opacity: 0.25; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.3); }
        }
      `}</style>

    </div>
  );
};

export default Preloader;
