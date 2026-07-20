import { useEffect, useState } from 'react';

/**
 * useDarkHour — detects the "Dark Hour": the two-minute window straddling
 * midnight (00:00:00 → 00:01:59 local time). Inspired by Persona 3's hidden
 * 25th hour that only a chosen few can perceive.
 *
 * Behaviour:
 *  - Polls the wall clock once a second and flips `active` on inside the window.
 *  - Fires at most once per calendar night. A localStorage stamp of the last
 *    night it ran prevents it re-triggering if you reload during the window, and
 *    stops it firing again the same night after you dismiss it.
 *  - `dismiss()` ends it early (Esc/click) and marks tonight as spent.
 *  - `force()` triggers it on demand regardless of time or guard (used by the
 *    terminal `darkhour` command and the `#darkhour` hash) for testing/fun.
 *
 * Returns `{ active, dismiss, force }`.
 */

// Window bounds in minutes-past-midnight. 0..2 → 00:00:00 through 00:01:59.
const WINDOW_START_MIN = 0;
const WINDOW_END_MIN = 2;

const STORAGE_KEY = 'portfolio-darkhour-last';

/** A stable per-night key: YYYY-M-D of the *night that owns* this window.
 *  The 00:00–00:02 window belongs to the date it falls on. */
function nightKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** True when `d` is inside the midnight window. */
function inWindow(d: Date): boolean {
  if (d.getHours() !== 0) return false;
  const min = d.getMinutes();
  return min >= WINDOW_START_MIN && min < WINDOW_END_MIN;
}

function alreadyRanTonight(now: Date): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === nightKey(now);
  } catch {
    return false;
  }
}

function markRanTonight(now: Date) {
  try {
    localStorage.setItem(STORAGE_KEY, nightKey(now));
  } catch {
    /* storage blocked — worst case it re-triggers on reload; acceptable */
  }
}

export function useDarkHour() {
  const [active, setActive] = useState(false);
  // `forced` decouples manual triggers from the clock so the poll loop can't
  // switch it off mid-demo.
  const [forced, setForced] = useState(false);

  useEffect(() => {
    // Evaluate immediately (covers reload *during* the window) then every second.
    const tick = () => {
      if (forced) return; // manual session owns the state until dismissed
      const now = new Date();
      if (inWindow(now) && !alreadyRanTonight(now)) {
        setActive(true);
      } else if (!inWindow(now)) {
        // Left the window naturally — clear so the next dismiss/guard is clean.
        setActive((was) => {
          if (was) markRanTonight(now); // spent for tonight
          return false;
        });
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [forced]);

  const dismiss = () => {
    markRanTonight(new Date());
    setForced(false);
    setActive(false);
  };

  const force = () => {
    setForced(true);
    setActive(true);
  };

  return { active, dismiss, force };
}
