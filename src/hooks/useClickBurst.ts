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
const SPEED_MIN  = 3.5;   // px / frame at 60 fps (slightly slower for text legibility)
const SPEED_MAX  = 5.5;
const FRICTION   = 0.92;  // velocity multiplier per frame
const GRAVITY    = 0.055; // px / frame² added to vy
const LIFESPAN   = 750;   // ms — total particle lifetime
const RADIUS_MIN = 1.2;   // scale factor
const RADIUS_MAX = 2.0;   // scale factor

const SPARKS = ['{', '}', '(', ')', '<', '>', ';', '++', '0', '1', '=>', '&&', '||', '[', ']', '+='];

/* ── Types ────────────────────────────────────────────────────── */
interface Particle {
  x:    number;  // current x
  y:    number;  // current y
  vx:   number;  // velocity x (px/frame)
  vy:   number;  // velocity y (px/frame)
  life: number;  // 1.0 → 0.0 remaining lifespan fraction
  r:    number;  // draw scale factor
  char: string;  // coding syntax character
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
      const dt = Math.min(ts - lastTs, 50);
      lastTs   = ts;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        /* ── Physics ──────────────────────────────────────────── */
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.vy += GRAVITY;
        p.x  += p.vx;
        p.y  += p.vy;
        p.life -= dt / LIFESPAN;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        /* ── Draw — code character, opacity from life ─────────── */
        ctx.font = `bold ${Math.round(p.r * 5 + 6)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255, 255, 255, ${(p.life * p.life).toFixed(3)})`;
        ctx.fillText(p.char, p.x, p.y);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame((ts) => {
      lastTs = ts;
      rafId  = requestAnimationFrame(loop);
    });

    /* ── Spawn handler ────────────────────────────────────────── */
    const onPointerDown = (e: PointerEvent) => {
      // Don't spawn sparks if clicking form inputs or textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const count =
        COUNT_MIN + Math.floor(Math.random() * (COUNT_MAX - COUNT_MIN + 1));

      for (let i = 0; i < count; i++) {
        const baseAngle = (i / count) * Math.PI * 2;
        const jitter    = (Math.random() - 0.5) * (Math.PI / count);
        const angle     = baseAngle + jitter;

        const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
        const char  = SPARKS[Math.floor(Math.random() * SPARKS.length)];

        particles.push({
          x:    e.clientX,
          y:    e.clientY,
          vx:   Math.cos(angle) * speed,
          vy:   Math.sin(angle) * speed,
          life: 1.0,
          r:    RADIUS_MIN + Math.random() * (RADIUS_MAX - RADIUS_MIN),
          char,
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
