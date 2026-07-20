import { useEffect, useRef, useState } from 'react';
import darkHourBg from '@/assets/image/dark-hour.webp';
import './DarkHour.css';

type Props = {
  /** End the Dark Hour early (Esc / click / the 2-min window elapsing). */
  onDismiss: () => void;
};

/* Dark Hour signature green — a sickly Tartarus hue, not part of the dial. */
const DH_PRIMARY = '57 255 20'; // #39ff14 toxic green
const DH_BG = '2 10 4'; // near-black green

/**
 * DarkHour — the hidden Persona 3 "25th hour" takeover.
 *
 * While mounted it:
 *  - washes the whole site in sickly green by overriding the live theme
 *    channels (`--primary` / `--bg`) and adding a `dark-hour` class to <html>
 *    that hue-shifts + drains the page (see DarkHour.css). Prior channel values
 *    are captured and restored on unmount so the user's chosen theme returns.
 *  - "freezes time": pauses any playing <audio> (electronics die in the Dark
 *    Hour) and halts CSS animations via the body class.
 *  - lays a full-screen atmosphere: the green clock backdrop, a glowing moon,
 *    film grain + scanlines, coffin silhouettes, and a fading title card.
 *  - dismisses on Esc or click, or when the parent's 2-minute window ends.
 */
/** How long the opaque intro cinematic holds before dissolving to ambient. */
const INTRO_MS = 3800;

export default function DarkHour({ onDismiss }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Drives the title-card fade-out after its intro beat.
  const [titleGone, setTitleGone] = useState(false);
  // Two-phase takeover: 'intro' = opaque cinematic; 'ambient' = translucent,
  // non-blocking wash so the (green-tinted, frozen) portfolio shows through.
  const [phase, setPhase] = useState<'intro' | 'ambient'>('intro');

  /* --- Apply the green wash + freeze, restore everything on unmount. --- */
  useEffect(() => {
    const html = document.documentElement;
    const style = html.style;

    // Capture whatever the theme currently is so we can put it back.
    const prevPrimary = style.getPropertyValue('--primary');
    const prevBg = style.getPropertyValue('--bg');

    style.setProperty('--primary', DH_PRIMARY);
    style.setProperty('--bg', DH_BG);
    html.classList.add('dark-hour');

    // Pause any audio that's currently playing (the site's music player, etc.).
    const audios = Array.from(document.querySelectorAll('audio'));
    const wasPlaying = audios.filter((a) => !a.paused);
    wasPlaying.forEach((a) => a.pause());

    return () => {
      // Restore the pre-Dark-Hour theme channels (empty string clears the
      // inline prop, letting the picker's own values / :root defaults win).
      if (prevPrimary) style.setProperty('--primary', prevPrimary);
      else style.removeProperty('--primary');
      if (prevBg) style.setProperty('--bg', prevBg);
      else style.removeProperty('--bg');
      html.classList.remove('dark-hour');
      // Note: we intentionally do NOT auto-resume audio — waking from the Dark
      // Hour, the world is quiet.
    };
  }, []);

  /* --- Dismiss on Escape; run the intro → ambient beat. --- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', onKey);
    // Fade the title card, then dissolve the opaque intro into the ambient wash
    // so the portfolio becomes visible (but still green + frozen) beneath.
    const titleTimer = window.setTimeout(() => setTitleGone(true), INTRO_MS - 900);
    const phaseTimer = window.setTimeout(() => setPhase('ambient'), INTRO_MS);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(titleTimer);
      window.clearTimeout(phaseTimer);
    };
  }, [onDismiss]);

  const isAmbient = phase === 'ambient';

  return (
    <div
      ref={rootRef}
      className={`dark-hour-overlay dh-${phase}`}
      role="dialog"
      aria-label="The Dark Hour"
      // Intro is a click-to-skip cinematic. Ambient lets clicks fall through to
      // the portfolio (pointer-events:none in CSS) — dismissal moves to the HUD.
      onClick={isAmbient ? undefined : onDismiss}
      style={{ ['--dh-bg' as string]: `url(${darkHourBg})` }}
    >
      {/* Green clock backdrop (the P3 25th-hour moon-clock image) */}
      <div className="dh-backdrop" aria-hidden />

      {/* Glowing green moon, top-right */}
      <div className="dh-moon" aria-hidden />

      {/* Coffin silhouettes — ordinary people transmogrified for the hour */}
      <div className="dh-coffins" aria-hidden>
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="dh-coffin" style={{ ['--i' as string]: i }} />
        ))}
      </div>

      {/* Scanlines + film grain */}
      <div className="dh-scanlines" aria-hidden />
      <div className="dh-grain" aria-hidden />
      {/* Crimson blood-water vignette at the edges */}
      <div className="dh-vignette" aria-hidden />

      {/* Intro title card */}
      <div className={`dh-title ${titleGone ? 'is-gone' : ''}`}>
        <p className="dh-title-clock">00:00</p>
        <h2 className="dh-title-main">The Dark Hour has come.</h2>
        <p className="dh-title-sub">Memento mori. Time stands still.</p>
        <p className="dh-title-hint">— click anywhere or press Esc to return —</p>
      </div>

      {/* Ambient-phase HUD: a small persistent marker + explicit exit. This is
          the ONLY interactive element once clicks pass through to the page. */}
      {isAmbient && (
        <button
          type="button"
          className="dh-exit"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
        >
          <span className="dh-exit-clock">00:00</span>
          the dark hour · press Esc to wake
        </button>
      )}
    </div>
  );
}
