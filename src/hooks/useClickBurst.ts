import { useEffect } from 'react';

/**
 * useClickBurst — canvas-based firework effect
 *
 * Architecture
 * ────────────
 * A single full-screen <canvas> (pointer-events: none) is mounted once.
 * A requestAnimationFrame loop runs continuously; it only draws when the
 * particle array is non-empty, otherwise it simply clears and idles.
 *
 * Physics per frame (60 fps target, dt-corrected)
 * ────────────────────────────────────────────────
 *   velocity  × FRICTION   → natural deceleration
 *   vy        + GRAVITY    → subtle downward arc at end of life
 *   life      - dt/LIFESPAN → smooth opacity decay; splice when ≤ 0
 *
 * Particle appearance
 * ───────────────────
 * Each particle is a filled white arc (dot), radius 1.5–2.2 px.
 * Angles are evenly distributed across 360° with a small random jitter
 * so the ring looks organic but not chaotic.
 */

/* ── Tunables ─────────────────────────────────────────────────── */
const COUNT_MIN  = 10;
const COUNT_MAX  = 14;
const SPEED_MIN  = 4.5;   // px / frame at 60 fps
const SPEED_MAX  = 7.0;
const FRICTION   = 0.91;  // velocity multiplier per frame
const GRAVITY    = 0.045; // px / frame² added to vy
const LIFESPAN   = 720;   // ms — total particle lifetime
const RADIUS_MIN = 1.5;   // px
const RADIUS_MAX = 2.2;   // px

/* ── Types ────────────────────────────────────────────────────── */
interface Particle {
  x:    number;  // current x
  y:    number;  // current y
  vx:   number;  // velocity x (px/frame)
  vy:   number;  // velocity y (px/frame)
  life: number;  // 1.0 → 0.0 remaining lifespan fraction
  r:    number;  // draw radius
}

/* ── Hook ─────────────────────────────────────────────────────── */
export function useClickBurst() {
  useEffect(() => {
    /* ── Canvas setup ─────────────────────────────────────────── */
    const canvas = document.createElement('canvas');
    const ctx    = canvas.getContext('2d')!;

    Object.assign(canvas.style, {
      position:      'fixed',
      inset:         '0',
      width:         '100%',
      height:        '100%',
      pointerEvents: 'none',      // ← never blocks underlying clicks
      zIndex:        '99998',
    });

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    document.body.appendChild(canvas);
    window.addEventListener('resize', resize);

    /* ── Particle pool ────────────────────────────────────────── */
    const particles: Particle[] = [];

    /* ── rAF loop ─────────────────────────────────────────────── */
    let rafId   = 0;
    let lastTs  = 0;

    const loop = (ts: number) => {
      /* dt capped at 50 ms so a tab-switch spike doesn't teleport dots */
      const dt = Math.min(ts - lastTs, 50);
      lastTs   = ts;

      /* Always clear — even when idle, avoids ghost pixels on resize */
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* Walk backwards so splice() doesn't skip elements */
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        /* ── Physics ──────────────────────────────────────────── */
        /* Friction: multiply per-frame, so fast→slow naturally      */
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        /* Gravity: tiny constant downward pull                       */
        p.vy += GRAVITY;
        /* Integrate position                                         */
        p.x  += p.vx;
        p.y  += p.vy;
        /* Time-based life decay (frame-rate independent)             */
        p.life -= dt / LIFESPAN;

        /* ── Garbage-collect dead particles immediately ───────────  */
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        /* ── Draw — filled white circle, opacity from life ─────── */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        /* Ease-out the opacity so the fade is graceful, not linear  */
        ctx.fillStyle = `rgba(255,255,255,${(p.life * p.life).toFixed(3)})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(loop);
    };

    /* Kick off loop — first frame primes lastTs with no visible dt */
    rafId = requestAnimationFrame((ts) => {
      lastTs = ts;
      rafId  = requestAnimationFrame(loop);
    });

    /* ── Spawn handler ────────────────────────────────────────── */
    const onPointerDown = (e: PointerEvent) => {
      const count =
        COUNT_MIN + Math.floor(Math.random() * (COUNT_MAX - COUNT_MIN + 1));

      for (let i = 0; i < count; i++) {
        /*
         * Evenly divide 360° then add a small random jitter (± half-slice)
         * so the ring feels organic rather than perfectly mechanical.
         */
        const baseAngle = (i / count) * Math.PI * 2;
        const jitter    = (Math.random() - 0.5) * (Math.PI / count);
        const angle     = baseAngle + jitter;

        const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);

        particles.push({
          x:    e.clientX,
          y:    e.clientY,
          vx:   Math.cos(angle) * speed,
          vy:   Math.sin(angle) * speed,
          life: 1.0,
          r:    RADIUS_MIN + Math.random() * (RADIUS_MAX - RADIUS_MIN),
        });
      }
    };

    window.addEventListener('pointerdown', onPointerDown);

    /* ── Cleanup ──────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize',      resize);
      window.removeEventListener('pointerdown', onPointerDown);
      canvas.remove();
    };
  }, []);
}
