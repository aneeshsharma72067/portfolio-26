import { useEffect, useState } from 'react';

/**
 * Preloader — Stdout editorial theme.
 *
 * Sequence:
 *   0 ms   → mount, dark canvas
 *   100 ms → name fades + slides up  (0.6 s)
 *   300 ms → "portfolio" label fades up  (0.5 s)
 *   500 ms → progress bar appears + sweeps left→right  (0.9 s)
 *   1 350 ms → exit fade begins  (500 ms)
 *   1 450 ms → onDone() called so the main app starts cross-fading in
 *
 * Props:
 *   onDone — called mid-exit so the main app cross-fades in simultaneously.
 */
type Props = { onDone: () => void };

const Preloader = ({ onDone }: Props) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    /* Start exit fade after ~1.35 s of animation */
    const t1 = setTimeout(() => setExiting(true), 1350);
    /* Notify parent at the midpoint of the exit fade for a clean cross-fade */
    const t2 = setTimeout(onDone, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      /* Fixed overlay, above everything */
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#0e1320',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        /* CSS transition drives the exit fade */
        opacity: exiting ? 0 : 1,
        transition: 'opacity 500ms ease',
        /* Block pointer events only while visible */
        pointerEvents: exiting ? 'none' : 'all',
      }}
    >
      {/* ── Name ── */}
      <h1
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 'clamp(2rem, 5vw, 2.75rem)',
          fontWeight: 900,
          color: '#dee2f5',
          letterSpacing: '-0.025em',
          margin: 0,
          lineHeight: 1,
          /* Enter animation: fade up */
          opacity: 0,
          animation: 'pl-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.1s forwards',
        }}
      >
        Aneesh<span style={{ color: '#55ddad' }}>.</span>
      </h1>

      {/* ── Label ── */}
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

      {/* ── Progress bar ── */}
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
        {/* The fill bar sweeps left → right via scaleX (GPU-composited) */}
        <div
          style={{
            height: '100%',
            width: '100%',
            backgroundColor: '#55ddad',
            borderRadius: 999,
            transformOrigin: 'left center',
            transform: 'scaleX(0)',
            animation: 'pl-bar 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.55s forwards',
            /* Subtle glow on the bar */
            boxShadow: '0 0 8px rgba(85,221,173,0.55)',
          }}
        />
      </div>

      {/* Component-scoped keyframes — no Tailwind dependency */}
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
