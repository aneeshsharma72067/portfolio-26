import { useState, useEffect, useRef } from 'react';

/**
 * Reusable text-scrambling component.
 * Decrypts text using binary/ASCII noise characters when hovered.
 */
export const ScrambleText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  const startScramble = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    let iteration = 0;
    const maxIterations = text.length;
    const chars = '01$#_[]{}<>/\\+*!%@&';

    intervalRef.current = window.setInterval(() => {
      setDisplayText(() =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
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
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayText(text);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <span
      onMouseEnter={startScramble}
      onMouseLeave={resetScramble}
      className="inline-block cursor-default"
    >
      {displayText}
    </span>
  );
};

type Props = {
  eyebrow: string;
  title: string;
  accent?: string;
};

/**
 * Reusable section heading — a green eyebrow label above a bold serif-framed
 * title, per the Stdout house style. Keeps every section visually consistent.
 * Incorporates text scramble microinteractions on hover of headings.
 */
const SectionHeading = ({ eyebrow, title, accent }: Props) => (
  <div className="mb-10 select-none">
    <p className="eyebrow mb-3">{eyebrow}</p>
    <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
      <ScrambleText text={title} />{' '}
      {accent && (
        <span className="text-primary">
          <ScrambleText text={accent} />
        </span>
      )}
    </h2>
  </div>
);

export default SectionHeading;
