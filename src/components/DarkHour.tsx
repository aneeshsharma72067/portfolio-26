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
export default function DarkHour({ onDismiss }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Drives the title-card fade-out after its intro beat.
  const [titleGone, setTitleGone] = useState(false);

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

  /* --- Dismiss on Escape; fade the title card after its beat. --- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', onKey);
    const titleTimer = window.setTimeout(() => setTitleGone(true), 4200);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(titleTimer);
    };
  }, [onDismiss]);

  return (
    <div
      ref={rootRef}
      className="dark-hour-overlay"
      role="dialog"
      aria-label="The Dark Hour"
      onClick={onDismiss}
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

      {/* Title card */}
      <div className={`dh-title ${titleGone ? 'is-gone' : ''}`}>
        <p className="dh-title-clock">00:00</p>
        <h2 className="dh-title-main">The Dark Hour has come.</h2>
        <p className="dh-title-sub">Memento mori. Time stands still.</p>
        <p className="dh-title-hint">— click anywhere or press Esc to return —</p>
      </div>
    </div>
  );
}
