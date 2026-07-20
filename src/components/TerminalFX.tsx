import { useEffect, useRef } from 'react';
import './TerminalFX.css';

/**
 * The set of fullscreen effects the terminal can fire. Each is a short,
 * self-contained cinematic played over the whole viewport.
 *
 *  - `blast`    : the `sudo rm -rf --no-preserve-root` deletion — a fake wipe
 *                 progress bar, CRT glitch/melt, white flash, then onDone
 *                 (caller navigates home).
 *  - `matrix`   : green digital rain (cmatrix). Runs until the user presses a
 *                 key or clicks — then onDone.
 *  - `train`    : an ASCII steam locomotive (`sl`) chugs across the screen once.
 *  - `forkbomb` : the `:(){ :|:& };:` fork bomb — text floods and multiplies,
 *                 the screen "freezes", then recovers.
 *
 * Confetti is handled separately (see fireConfetti) because it layers over the
 * live terminal rather than taking the screen over.
 */
export type FxEffect = 'blast' | 'matrix' | 'train' | 'forkbomb';

type Props = {
  effect: FxEffect;
  /** Called once the effect has run its course (or the user dismissed it). */
  onDone: () => void;
};

/** How long each self-terminating effect runs before auto-calling onDone (ms). */
const DURATIONS: Record<FxEffect, number> = {
  blast: 2600,
  matrix: 0, // dismiss-driven, not timed
  train: 4200,
  forkbomb: 3200,
};

export default function TerminalFX({ effect, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* Timed effects auto-finish; matrix waits for a key/click to dismiss. */
  useEffect(() => {
    if (effect === 'matrix') {
      const dismiss = () => onDone();
      window.addEventListener('keydown', dismiss);
      window.addEventListener('click', dismiss);
      return () => {
        window.removeEventListener('keydown', dismiss);
        window.removeEventListener('click', dismiss);
      };
    }
    const t = window.setTimeout(onDone, DURATIONS[effect]);
    return () => window.clearTimeout(t);
  }, [effect, onDone]);

  /* Matrix rain — a classic falling-glyph canvas animation. */
  useEffect(() => {
    if (effect !== 'matrix') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const glyphs = 'アイウエオカキクケコサシスセソ0123456789ABCDEF<>[]{}/*-+';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    // y-offset (in rows) of the leading glyph for each column
    const drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * -50));

    let raf = 0;
    const draw = () => {
      // translucent black fill leaves fading trails behind each glyph
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff66';
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const char = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        // reset column to top at random once it falls past the bottom
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [effect]);

  if (effect === 'matrix') {
    return (
      <div className="fx-root fx-matrix" role="presentation">
        <canvas ref={canvasRef} className="fx-matrix-canvas" />
        <p className="fx-matrix-hint">press any key to wake up…</p>
      </div>
    );
  }

  if (effect === 'blast') {
    return (
      <div className="fx-root fx-blast" role="alert">
        <div className="fx-blast-glitch">
          <p className="fx-blast-line">rm: descending into '/' …</p>
          <p className="fx-blast-line fx-blast-line-2">removing /bin /boot /dev /etc /home /lib …</p>
          <div className="fx-blast-bar" aria-hidden>
            <span className="fx-blast-bar-fill" />
          </div>
          <p className="fx-blast-line fx-blast-line-3">FILESYSTEM ANNIHILATED</p>
        </div>
        <div className="fx-blast-flash" aria-hidden />
      </div>
    );
  }

  if (effect === 'train') {
    return (
      <div className="fx-root fx-train" role="presentation">
        <pre className="fx-train-art">{STEAM_TRAIN}</pre>
      </div>
    );
  }

  // forkbomb
  return (
    <div className="fx-root fx-forkbomb" role="presentation">
      <div className="fx-forkbomb-flood">
        {Array.from({ length: 220 }).map((_, i) => (
          <span key={i} style={{ animationDelay: `${(i % 40) * 18}ms` }}>
            {':(){ :|:& };:'}
          </span>
        ))}
      </div>
      <p className="fx-forkbomb-msg">nice try 😏 &nbsp;— process table recovered.</p>
    </div>
  );
}

/**
 * Fire a one-shot confetti burst that layers over the current UI (does not take
 * the screen over). Spawns N absolutely-positioned pieces into a throwaway
 * container appended to <body>, then removes it when the animation ends. Kept
 * imperative so it can be triggered from a command handler without wiring extra
 * React state.
 */
export function fireConfetti(pieces = 120) {
  const layer = document.createElement('div');
  layer.className = 'fx-confetti-layer';
  const colors = ['#55ddad', '#37aaff', '#ffe500', '#ff2233', '#c084fc', '#fb923c', '#ffffff'];
  for (let i = 0; i < pieces; i++) {
    const bit = document.createElement('span');
    bit.className = 'fx-confetti-bit';
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = colors[Math.floor(Math.random() * colors.length)];
    bit.style.animationDelay = `${Math.random() * 0.6}s`;
    bit.style.animationDuration = `${2.4 + Math.random() * 1.8}s`;
    bit.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(bit);
  }
  document.body.appendChild(layer);
  window.setTimeout(() => layer.remove(), 5000);
}

/* ASCII steam locomotive — the payload of the `sl` gag command. */
const STEAM_TRAIN = String.raw`
      ====        ________                ___________
  _D _|  |_______/        \__I_I_____===__|_________|
   |(_)---  |   H\________/ |   |        =|___ ___|
   /     |  |   H  |  |     |   |         ||_| |_||
  |      |  |   H  |__--------------------| [___] |
  | ________|___H__/__|_____/[][]~\_______|       |
  |/ |   |-----------I_____I [][] []  D   |=======|__
__/ =| o |=-~~\  /~~\  /~~\  /~~\ ____Y___________|__
 |/-=|___|=    ||    ||    ||    |_____/~\___/
  \_/      \O=====O=====O=====O_/      \_/
`;
