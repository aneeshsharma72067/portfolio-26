import { useEffect, useRef } from 'react';

/** The canonical Konami Code sequence. */
const KONAMI = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

/**
 * useKonami — fires `onUnlock` when the user enters the Konami Code.
 *
 * Tracks a rolling window of the last N keydowns and compares against the
 * sequence; any wrong key simply resets progress (implicitly, since we only
 * keep the tail). Case-insensitive on the b/a keys. Ignores typing inside
 * inputs/textareas so it never interferes with the terminal or forms.
 */
export function useKonami(onUnlock: () => void) {
  // Keep the latest callback without re-binding the listener each render.
  const cb = useRef(onUnlock);
  cb.current = onUnlock;

  useEffect(() => {
    const buffer: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      // Normalise letter keys to lower-case; arrows keep their names.
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buffer.push(key);
      if (buffer.length > KONAMI.length) buffer.shift();

      if (buffer.length === KONAMI.length && KONAMI.every((k, i) => k === buffer[i])) {
        buffer.length = 0; // reset so it can retrigger
        cb.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
