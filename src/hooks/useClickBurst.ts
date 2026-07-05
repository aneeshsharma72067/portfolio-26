import { useEffect } from 'react';

/**
 * useClickBurst
 *
 * Attaches a global click listener that spawns a mini-firework at the
 * cursor position. Each burst creates 8–12 ring-shaped particles that
 * expand outward and fade to 0 within ~1 second.
 *
 * Implementation details
 * ──────────────────────
 * • Direct DOM manipulation — zero React state, zero re-renders.
 * • Each particle is a <div> with border-radius 50% and a dashed /
 *   dotted / solid border so it looks like a small ring.
 * • The Web Animations API drives the keyframed expand + fade so we
 *   get a proper "burst then drift" easing with a single API call.
 * • Elements are removed from the DOM as soon as their animation ends
 *   (onfinish callback), so there is no memory leak on rapid clicking.
 */

/* ── Tunables ─────────────────────────────────────────────────── */

/** Min / max number of particles per burst */
const COUNT_MIN = 8;
const COUNT_MAX = 12;

/** How far each particle travels from the origin (px) */
const TRAVEL_MIN = 38;
const TRAVEL_MAX = 78;

/** Particle diameter range (px) — rings need to be big enough to see */
const SIZE_MIN = 5;
const SIZE_MAX = 9;

/** Total animation duration (ms) */
const DURATION = 950;

/* ── Visual variety pools ─────────────────────────────────────── */

/**
 * Border styles — mixed so different particles look subtly distinct.
 * Dashed and dotted give the "ring" texture mentioned in the spec.
 */
const BORDER_STYLES = [
  '1.5px dashed',
  '1.5px dotted',
  '1px   solid',
  '2px   dashed',
  '1px   dotted',
] as const;

/**
 * Subtle white / light-grey colour ramp — readable on the dark Stdout
 * background but not so bright they look out of place.
 */
const COLORS = [
  'rgba(255,255,255,0.80)',
  'rgba(220,230,240,0.70)',
  'rgba(210,220,230,0.65)',
  'rgba(255,255,255,0.55)',
  'rgba(180,200,215,0.60)',
];

/* ── Hook ─────────────────────────────────────────────────────── */

export function useClickBurst() {
  useEffect(() => {
    const spawn = (e: MouseEvent) => {
      const count =
        COUNT_MIN + Math.floor(Math.random() * (COUNT_MAX - COUNT_MIN + 1));

      for (let i = 0; i < count; i++) {
        /* Spread angles evenly around 360° with a small random jitter
         * so particles aren't perfectly symmetrical (more organic look) */
        const baseAngle  = (i / count) * 2 * Math.PI;
        const jitter     = (Math.random() - 0.5) * (Math.PI / count);
        const angle      = baseAngle + jitter;

        const distance   = TRAVEL_MIN + Math.random() * (TRAVEL_MAX - TRAVEL_MIN);
        const size       = SIZE_MIN  + Math.random() * (SIZE_MAX  - SIZE_MIN);
        const borderStyle = BORDER_STYLES[Math.floor(Math.random() * BORDER_STYLES.length)];
        const color      = COLORS[Math.floor(Math.random() * COLORS.length)];
        /* Small per-particle delay for a staggered "spray" feel */
        const delay      = Math.random() * 80;

        /* Final position relative to click origin */
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        /* ── Create particle element ─────────────────────────── */
        const el = document.createElement('div');
        Object.assign(el.style, {
          position:      'fixed',
          left:          `${e.clientX}px`,
          top:           `${e.clientY}px`,
          width:         `${size}px`,
          height:        `${size}px`,
          borderRadius:  '50%',
          border:        `${borderStyle} ${color}`,
          pointerEvents: 'none',
          zIndex:        '99998',     // below preloader (9999) but above everything else
          willChange:    'transform, opacity',
        });
        document.body.appendChild(el);

        /* ── Web Animations API keyframes ────────────────────────
         * Frame 0: particle appears at cursor, tiny (scale 0.3)
         * Frame 0.25: reaches ~35% of travel, fully opaque, full size
         * Frame 1: reaches destination, faded out, slightly shrunk
         * This gives the "pop then drift + fade" firework feel.        */
        const anim = el.animate(
          [
            {
              transform: 'translate(-50%, -50%) scale(0.3)',
              opacity:   '1',
            },
            {
              transform: `translate(
                            calc(-50% + ${dx * 0.35}px),
                            calc(-50% + ${dy * 0.35}px)
                          ) scale(1.15)`,
              opacity:   '0.85',
              offset:    0.25,
            },
            {
              transform: `translate(
                            calc(-50% + ${dx}px),
                            calc(-50% + ${dy}px)
                          ) scale(0.7)`,
              opacity:   '0',
            },
          ],
          {
            duration: DURATION,
            delay,
            easing:   'cubic-bezier(0.2, 0.8, 0.25, 1)', // fast-out, gentle drift
            fill:     'forwards',
          }
        );

        /* Remove from DOM as soon as the animation is done */
        anim.onfinish = () => el.remove();
      }
    };

    document.addEventListener('click', spawn);
    return () => document.removeEventListener('click', spawn);
  }, []);
}
