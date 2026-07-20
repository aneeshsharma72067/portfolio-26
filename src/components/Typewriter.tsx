import { useEffect, useState } from 'react';

type Props = {
  /** Phrases to cycle through, typed then deleted in order. */
  words: string[];
  /** ms per character while typing. */
  typeSpeed?: number;
  /** ms per character while deleting (usually faster). */
  deleteSpeed?: number;
  /** ms to hold a fully-typed word before deleting it. */
  holdMs?: number;
  className?: string;
};

/**
 * Typewriter — types each phrase out char-by-char, holds, deletes, advances to
 * the next, and loops. A blinking block caret trails the text. Timings are
 * derived from a single state machine (`deleting` flag + char index) so it's
 * self-correcting and dependency-free.
 */
export default function Typewriter({
  words,
  typeSpeed = 70,
  deleteSpeed = 40,
  holdMs = 1400,
  className = '',
}: Props) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];

    // Fully typed → hold, then start deleting.
    if (!deleting && text === current) {
      const t = window.setTimeout(() => setDeleting(true), holdMs);
      return () => window.clearTimeout(t);
    }

    // Fully deleted → advance to the next word and type again.
    if (deleting && text === '') {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
      return;
    }

    // Otherwise step one character in the active direction.
    const step = window.setTimeout(
      () => {
        setText((prev) =>
          deleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1),
        );
      },
      deleting ? deleteSpeed : typeSpeed,
    );
    return () => window.clearTimeout(step);
  }, [text, deleting, wordIndex, words, typeSpeed, deleteSpeed, holdMs]);

  return (
    <span className={className}>
      {text}
      {/* Blinking block caret */}
      <span className="ml-0.5 inline-block w-[0.6ch] animate-pulse text-primary">▍</span>
    </span>
  );
}
