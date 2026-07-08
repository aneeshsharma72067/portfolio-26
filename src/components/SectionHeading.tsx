import { useState, useEffect, useRef } from 'react';

/**
 * Reusable text-scrambling component.
 * Decrypts text using binary/ASCII noise characters when hovered.
 * Supports cycling through a list of alternative words on successive hovers.
 */
export const ScrambleText = ({ text, cycleWords }: { text: string; cycleWords?: string[] }) => {
  const [displayText, setDisplayText] = useState(text);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayText(text);
    setCurrentIndex(0);
  }, [text]);

  const startScramble = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    let targetText = text;
    if (cycleWords && cycleWords.length > 0) {
      const nextIdx = (currentIndex + 1) % cycleWords.length;
      setCurrentIndex(nextIdx);
      targetText = cycleWords[nextIdx];
    }

    let iteration = 0;
    const maxIterations = targetText.length;
    const chars = '01$#_[]{}<>/\\+*!%@&';

    intervalRef.current = window.setInterval(() => {
      setDisplayText(() =>
        targetText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return targetText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= maxIterations) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      iteration += 1 / 3;
    }, 25);
  };

  const resetScramble = () => {
    if (!cycleWords || cycleWords.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayText(text);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Worst-case width reserver. During scrambling every character is replaced by
  // a symbol from `chars` (@ # % & …) which renders WIDER than the average
  // letter — so reserving the longest *phrase* width is not enough: the
  // scrambled state overflows it and the line wraps, then snaps back on
  // unscramble (the toggling flicker). Instead reserve the longest phrase's
  // length filled with the widest glyph the scramble can emit ('@' from the
  // char set), so the box always fits even the fully-scrambled state → line
  // count never changes, without over-reserving space for short headings.
  const maxLen = [text, ...(cycleWords ?? [])].reduce(
    (max, w) => Math.max(max, w.length),
    0
  );
  const sizer = '@'.repeat(maxLen);

  return (
    <span
      onMouseEnter={startScramble}
      onMouseLeave={resetScramble}
      className="cursor-default"
      style={{ display: 'inline-grid' }}
    >
      {/* Invisible worst-case width-reserver — overlaid, not laid out inline */}
      <span aria-hidden className="invisible whitespace-nowrap" style={{ gridArea: '1 / 1' }}>
        {sizer}
      </span>
      {/* Visible scrambling text sits on top of the reserved box */}
      <span className="whitespace-nowrap" style={{ gridArea: '1 / 1' }}>{displayText}</span>
    </span>
  );
};

type Props = {
  eyebrow: string;
  title: string;
  accent?: string;
  accentWords?: string[];
};

/**
 * Reusable section heading — a green eyebrow label above a bold serif-framed
 * title, per the Stdout house style. Keeps every section visually consistent.
 * Incorporates text scramble microinteractions on hover of headings.
 */
const SectionHeading = ({ eyebrow, title, accent, accentWords }: Props) => (
  <div className="mb-10 select-none">
    <p className="eyebrow mb-3">{eyebrow}</p>
    <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
      <ScrambleText text={title} />{' '}
      {accent && (
        <span className="text-primary">
          <ScrambleText text={accent} cycleWords={accentWords} />
        </span>
      )}
    </h2>
  </div>
);

export default SectionHeading;
