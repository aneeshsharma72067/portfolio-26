import { useEffect } from 'react';
import { personal, links } from '@/data/content';

/**
 * useConsoleEggs — three lightweight "for the curious" easter eggs, all wired
 * from one mount-once effect:
 *
 *  1. DevTools banner — prints a styled ASCII greeting + recruiter bait to the
 *     console, and exposes a real `hire()` global that opens the mailto link.
 *  2. Tab-blur title — when the tab loses focus the document title flips to a
 *     cheeky "come back" line, restored on refocus.
 *  3. Query/hash triggers — `?matrix` or `#konami` fire the matching effect via
 *     the callbacks passed in (so the caller owns the actual visual).
 */
type Options = {
  /** Fire the matrix rain (e.g. from `?matrix`). */
  onMatrix?: () => void;
  /** Fire the Konami unlock (e.g. from `#konami`). */
  onKonami?: () => void;
  /** Summon the Dark Hour (e.g. from `#darkhour`). */
  onDarkHour?: () => void;
};

export function useConsoleEggs({ onMatrix, onKonami, onDarkHour }: Options = {}) {
  useEffect(() => {
    /* -------- 1. console banner + hire() global -------- */
    const brand = 'color:#55ddad;font-size:14px;font-weight:bold';
    const dim = 'color:#8b93a7;font-size:12px';
    // eslint-disable-next-line no-console
    console.log(
      `%c${'>'} ${personal.name} — ${personal.role}\n%cPoking around the console? You'd get along with me.\nType %chire()%c to reach out. Or run %clocation.pathname = '/cli'%c for the fun version.`,
      brand,
      dim,
      'color:#fff;font-weight:bold',
      dim,
      'color:#fff;font-weight:bold',
      dim,
    );

    // Real global — recruiters/devs who try it actually get the mailto.
    (window as unknown as Record<string, unknown>).hire = () => {
      window.location.href = links.email;
      return `Opening a line to ${personal.email} … 🤝`;
    };

    /* -------- 2. tab-blur document title -------- */
    const original = document.title;
    const AWAY = ['👀 come back!', 'aneesh misses you…', 'psst — still hiring?'];
    const onVisibility = () => {
      if (document.hidden) {
        document.title = AWAY[Math.floor(performance.now()) % AWAY.length];
      } else {
        document.title = original;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    /* -------- 3. query / hash triggers -------- */
    const params = new URLSearchParams(window.location.search);
    if (params.has('matrix')) onMatrix?.();
    if (window.location.hash === '#konami') onKonami?.();
    if (window.location.hash === '#darkhour') onDarkHour?.();

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.title = original;
      delete (window as unknown as Record<string, unknown>).hire;
    };
    // Callbacks are stable enough for a mount-once egg; intentionally no deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
