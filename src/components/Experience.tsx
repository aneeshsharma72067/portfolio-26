import { ArrowUpRight, ImageIcon } from 'lucide-react';
import { experiences } from '@/data/content';
import { useReveal } from '@/hooks/useReveal';
import SectionHeading from './SectionHeading';
import { useTranslation } from '@/context/TranslationContext';

/**
 * Experience — single-role "dossier" spread.
 *
 * Built for one current tenure (no timeline, no sticky/parallax). Composition:
 * a live status rail, oversized company masthead, mark, and serif lead.
 * Scene photo dropped for now (file kept on disk) — full-bleed was too heavy
 * for one-role layout.
 *
 * Multi-role filmstrip kept at `_backup/ExperienceFilmstrip.tsx` for later.
 */

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
    className={`relative flex flex-col items-center justify-center gap-2 border border-dashed border-outline-variant/50 bg-on-surface/[0.03] p-6 text-center ${className}`}
  >
    <ImageIcon size={20} className="text-on-surface-variant/45" aria-hidden />
    <span className="font-mono text-[10px] uppercase tracking-label text-primary">{label}</span>
    <p className="max-w-md font-body text-xs leading-relaxed text-on-surface-variant sm:text-sm">
      {hint}
    </p>
  </div>
);

const Experience = () => {
  const { ref, visible } = useReveal();
  const { t } = useTranslation();
  const exp = experiences[0];

  if (!exp) return null;

  return (
    <section id="experience" ref={ref} className="mt-28">
      <SectionHeading
        eyebrow={t('expEyebrow')}
        title={t('expTitle')}
        accent={t('expAccent')}
      />

      <article
        className={`relative transition-all duration-700 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
        }`}
      >
        {/* Top meta rail — period · location · live */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-outline-variant/40 py-4">
          <span className="font-mono text-xs uppercase tracking-label text-on-surface-variant">
            {exp.period}
          </span>
          <span aria-hidden className="meta-dot" />
          <span className="font-mono text-xs uppercase tracking-label text-on-surface-variant">
            {exp.location}
          </span>
          {exp.current && (
            <>
              <span aria-hidden className="meta-dot" />
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="font-label text-[10px] font-bold uppercase tracking-label text-primary">
                  Present
                </span>
              </span>
            </>
          )}
        </div>

        {/* Masthead: mark + giant company */}
        <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 font-label text-xs font-bold uppercase tracking-label text-primary">
              <ArrowUpRight size={15} />
              {exp.role}
            </p>
            <h3 className="mt-3 font-headline text-5xl font-black leading-[0.92] tracking-tight text-on-surface sm:text-6xl md:text-7xl">
              {exp.company}
              <span className="text-primary">.</span>
            </h3>
          </div>

          {/* Company mark — bare logo, modest size */}
          <div className="shrink-0 self-start sm:self-end">
            {exp.mark ? (
              <img
                src={exp.mark}
                alt={`${exp.company} mark`}
                className="h-10 w-auto object-contain sm:h-11 md:h-12"
              />
            ) : (
              <AssetSlot
                label="mark"
                hint={exp.markHint}
                className="h-20 w-32 !gap-1 !p-3"
              />
            )}
          </div>
        </div>

        {/* Serif lead — editorial column */}
        <p className="mt-10 max-w-2xl font-body text-xl italic leading-relaxed text-on-surface-variant sm:text-2xl">
          {exp.description}
        </p>
      </article>
    </section>
  );
};

export default Experience;
