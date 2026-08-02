import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ImageIcon } from 'lucide-react';
import { experiences, type Experience as Exp } from '@/data/content';
import SectionHeading from './SectionHeading';
import { useTranslation } from '@/context/TranslationContext';

/**
 * Experience — Diego Sevilla–inspired sticky horizontal filmstrip.
 *
 * Desktop: a tall scroll runway pins a full-bleed track; vertical scroll maps
 * to horizontal translate across career panels (one company per frame).
 * Mobile / reduced-motion: panels stack vertically — no pin, no hijack.
 *
 * Asset slots (`scene`, `mark`) render labeled placeholders until real files
 * are wired in `content.ts`. See `src/assets/image/experience/README.md`.
 */

/** Empty frame that tells you exactly what asset to drop in. */
const AssetSlot = ({
  label,
  hint,
  className = '',
}: {
  label: string;
  hint: string;
  className?: string;
}) => (
  <div
    className={`relative flex flex-col items-center justify-center gap-3 border border-dashed border-outline-variant/50 bg-on-surface/[0.03] p-6 text-center ${className}`}
  >
    <ImageIcon size={22} className="text-on-surface-variant/50" aria-hidden />
    <span className="font-mono text-[10px] uppercase tracking-label text-primary">{label}</span>
    <p className="max-w-sm font-body text-xs leading-relaxed text-on-surface-variant sm:text-sm">
      {hint}
    </p>
  </div>
);

const Panel = ({ exp, index, pinned }: { exp: Exp; index: number; pinned: boolean }) => (
  <article
    className={`relative flex flex-col justify-center py-8 md:flex-row md:items-center md:gap-14 ${
      pinned
        ? 'h-full w-screen shrink-0 px-[8vw] py-16 md:px-[10vw]'
        : 'w-full px-0'
    }`}
    aria-label={`${exp.company} — ${exp.role}`}
  >
    {/* Ghost index */}
    <span
      aria-hidden
      className="pointer-events-none absolute right-[6vw] top-8 select-none font-headline text-8xl font-black leading-none text-on-surface/[0.04] md:text-[9rem]"
    >
      {String(index + 1).padStart(2, '0')}
    </span>

    {/* Visual column — scene (dominant) + mark */}
    <div className="flex w-full max-w-xl shrink-0 flex-col gap-4 md:w-[42%]">
      {exp.scene ? (
        <img
          src={exp.scene}
          alt=""
          className="aspect-[16/10] w-full object-cover"
        />
      ) : (
        <AssetSlot
          label={`scene · ${exp.company.toLowerCase().replace(/\s+/g, '-')}`}
          hint={exp.sceneHint}
          className="aspect-[16/10] w-full"
        />
      )}

      <div className="flex items-start gap-4">
        {exp.mark ? (
          <img src={exp.mark} alt="" className="h-12 w-12 object-contain opacity-80" />
        ) : (
          <div
            title={exp.markHint}
            className="flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-1 border border-dashed border-outline-variant/50 bg-on-surface/[0.03]"
          >
            <ImageIcon size={14} className="text-on-surface-variant/50" aria-hidden />
            <span className="font-mono text-[8px] uppercase tracking-label text-primary">mark</span>
          </div>
        )}
        {(!exp.mark || exp.placeholder) && (
          <p className="max-w-xs font-mono text-[10px] leading-relaxed text-on-surface-variant/70">
            {!exp.mark && exp.markHint}
            {exp.placeholder && (
              <span className="mt-1 block uppercase tracking-label">
                Placeholder — replace in content.ts
              </span>
            )}
          </p>
        )}
      </div>
    </div>

    {/* Copy column */}
    <div className="mt-8 max-w-lg md:mt-0">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-label text-on-surface-variant">
          {exp.period}
        </span>
        {exp.current && (
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="font-label text-[10px] font-bold uppercase tracking-label text-primary">
              Present
            </span>
          </span>
        )}
      </div>

      <p className="mt-2 font-mono text-[11px] uppercase tracking-label text-on-surface-variant/80">
        {exp.location}
      </p>

      <h3 className="mt-4 font-headline text-4xl font-black leading-[0.95] tracking-tight text-on-surface sm:text-5xl md:text-6xl">
        {exp.company}
        <span className="text-primary">.</span>
      </h3>

      <p className="mt-4 inline-flex items-center gap-2 font-label text-xs font-bold uppercase tracking-label text-primary">
        <ArrowUpRight size={15} />
        {exp.role}
      </p>

      <p className="mt-5 font-body text-lg italic leading-relaxed text-on-surface-variant sm:text-xl">
        {exp.description}
      </p>
    </div>
  </article>
);

const Experience = () => {
  const { t } = useTranslation();
  const runwayRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [pinned, setPinned] = useState(true);

  /* Pin + horizontal map only when viewport is wide enough and motion is OK. */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)');
    const sync = () => setPinned(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!pinned) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = runwayRef.current;
        if (!el) return;
        const total = el.offsetHeight - window.innerHeight;
        if (total <= 0) {
          setProgress(0);
          return;
        }
        const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), total);
        setProgress(scrolled / total);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pinned]);

  const n = experiences.length;
  /* Last panel should rest flush — travel = (n - 1) panel widths. */
  const translateX = pinned ? `-${progress * (n - 1) * 100}vw` : '0';

  return (
    <section id="experience" className="mt-28">
      <SectionHeading
        eyebrow={t('expEyebrow')}
        title={t('expTitle')}
        accent={t('expAccent')}
      />

      {/* Scroll hint — horizontal affordance is easy to miss */}
      <p className="mb-6 hidden font-mono text-[10px] uppercase tracking-label text-on-surface-variant md:block">
        Scroll to move through chapters →
      </p>

      {/* Full-bleed breakout from the constrained <main> column */}
      <div
        ref={runwayRef}
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen"
        style={pinned ? { height: `${n * 100}vh` } : undefined}
      >
        <div
          className={
            pinned
              ? 'sticky top-0 h-screen overflow-hidden'
              : 'flex flex-col gap-16 px-[5vw] pb-8'
          }
        >
          <div
            className={pinned ? 'flex h-full will-change-transform' : 'contents'}
            style={
              pinned
                ? {
                    width: `${n * 100}vw`,
                    transform: `translate3d(${translateX}, 0, 0)`,
                  }
                : undefined
            }
          >
            {experiences.map((exp, i) => (
              <Panel
                key={`${exp.company}-${exp.period}`}
                exp={exp}
                index={i}
                pinned={pinned}
              />
            ))}
          </div>

          {/* Progress dots — desktop pin only */}
          {pinned && (
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2"
            >
              {experiences.map((exp, i) => {
                const active = Math.round(progress * (n - 1)) === i;
                return (
                  <span
                    key={exp.company}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      active ? 'w-6 bg-primary' : 'w-1.5 bg-on-surface/25'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Experience;
