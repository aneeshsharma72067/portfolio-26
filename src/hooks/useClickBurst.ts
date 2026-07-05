import { useEffect } from 'react';

/**
 * useClickBurst — firework ray edition
 *
 * On every click, spawns:
 *   1. A small central flash (white circle that pops and fades, 300 ms)
 *   2. 8–12 thin ray lines that shoot outward in all directions
 *
 * Each ray is a narrow rectangle rotated to face its travel direction,
 * so it reads as a streak/spark rather than a blob. The direction the
 * element points and the direction it travels are always aligned.
 *
 * All DOM elements are created and removed imperatively — zero React
 * state, zero re-renders. Web Animations API drives the keyframes.
 */

/* ── Tunables ─────────────────────────────────────────────────── */
const COUNT_MIN   = 8;
const COUNT_MAX   = 12;
const TRAVEL_MIN  = 35;   // px — minimum travel distance
const TRAVEL_MAX  = 72;   // px — maximum travel distance
const RAY_LEN_MIN = 7;    // px — shortest ray
const RAY_LEN_MAX = 15;   // px — longest ray
const RAY_W       = 1.5;  // px — ray stroke width
const DURATION    = 850;  // ms — total ray animation

/* ── Colour pool — subtle whites / light greys on dark bg ──── */
const COLORS = [
  'rgba(255,255,255,0.92)',
  'rgba(230,238,248,0.82)',
  'rgba(210,225,240,0.75)',
  'rgba(255,255,255,0.68)',
  'rgba(200,218,232,0.60)',
];

/* ── Hook ─────────────────────────────────────────────────────── */

export function useClickBurst() {
  useEffect(() => {

    const spawn = (e: MouseEvent) => {
      const cx = e.clientX;
      const cy = e.clientY;

      /* ── 1. Central flash — tiny circle that pops and fades ── */
      const flash = document.createElement('div');
      Object.assign(flash.style, {
        position:      'fixed',
        left:          `${cx}px`,
        top:           `${cy}px`,
        width:         '5px',
        height:        '5px',
        borderRadius:  '50%',
        backgroundColor: 'rgba(255,255,255,0.95)',
        boxShadow:     '0 0 6px 2px rgba(255,255,255,0.6)',
        pointerEvents: 'none',
        zIndex:        '99999',
      });
      document.body.appendChild(flash);

      const fa = flash.animate(
        [
          { transform: 'translate(-50%,-50%) scale(0.4)', opacity: '1' },
          { transform: 'translate(-50%,-50%) scale(2.5)', opacity: '0' },
        ],
        { duration: 320, easing: 'ease-out', fill: 'forwards' }
      );
      fa.onfinish = () => flash.remove();

      /* ── 2. Ray particles ─────────────────────────────────── */
      const count =
        COUNT_MIN + Math.floor(Math.random() * (COUNT_MAX - COUNT_MIN + 1));

      for (let i = 0; i < count; i++) {
        /* Evenly spread angles with a small jitter so it looks organic */
        const baseAngleDeg = (i / count) * 360;
        const jitter       = (Math.random() - 0.5) * (360 / count) * 0.55;
        const angleDeg     = baseAngleDeg + jitter;
        const angleRad     = angleDeg * (Math.PI / 180);

        const travel  = TRAVEL_MIN + Math.random() * (TRAVEL_MAX - TRAVEL_MIN);
        const rayLen  = RAY_LEN_MIN + Math.random() * (RAY_LEN_MAX - RAY_LEN_MIN);
        const color   = COLORS[Math.floor(Math.random() * COLORS.length)];
        /* Tiny per-particle delay for a staggered spray feel */
        const delay   = Math.random() * 55;

        /*
         * Direction math — CSS rotate convention:
         *   0°   = up   → (sin 0°,  -cos 0°)  = (0,  -1)
         *   90°  = right → (sin 90°, -cos 90°) = (1,   0)
         *   180° = down  → (sin 180°,-cos 180°)= (0,   1)
         * This keeps the element's visual axis aligned with its velocity.
         */
        const dx = Math.sin(angleRad) * travel;
        const dy = -Math.cos(angleRad) * travel;

        /* Create the ray element — thin vertical rectangle, rotated */
        const el = document.createElement('div');
        Object.assign(el.style, {
          position:        'fixed',
          left:            `${cx}px`,
          top:             `${cy}px`,
          width:           `${RAY_W}px`,
          height:          `${rayLen}px`,
          borderRadius:    `${RAY_W}px`,
          backgroundColor: color,
          pointerEvents:   'none',
          zIndex:          '99998',
          willChange:      'transform, opacity',
        });
        document.body.appendChild(el);

        /*
         * 3-keyframe burst:
         *   0   → at origin, ray pointing in travel direction, opacity 1
         *   20% → burst to 30% of travel, still fully opaque (fast initial pop)
         *   100%→ reached full distance, faded out
         *
         * translate(-50%,-50%) centres the ray on the click point.
         * rotate(angleDeg) points it in the travel direction.
         * calc(-50% + Δpx) then displaces it along that direction.
         */
        const anim = el.animate(
          [
            {
              transform: `translate(-50%, -50%) rotate(${angleDeg}deg)`,
              opacity:   '1',
            },
            {
              transform: `translate(
                            calc(-50% + ${dx * 0.28}px),
                            calc(-50% + ${dy * 0.28}px)
                          ) rotate(${angleDeg}deg)`,
              opacity:   '1',
              offset:    0.2,
            },
            {
              transform: `translate(
                            calc(-50% + ${dx}px),
                            calc(-50% + ${dy}px)
                          ) rotate(${angleDeg}deg)`,
              opacity:   '0',
            },
          ],
          {
            duration: DURATION,
            delay,
            /* Fast launch → gentle deceleration tail, like a real spark */
            easing:   'cubic-bezier(0.15, 0.85, 0.2, 1)',
            fill:     'forwards',
          }
        );

        anim.onfinish = () => el.remove();
      }
    };

    document.addEventListener('click', spawn);
    return () => document.removeEventListener('click', spawn);

  }, []);
}
