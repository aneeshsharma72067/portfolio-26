import { ArrowUpRight } from 'lucide-react';
import { experiences } from '@/data/content';
import { useReveal } from '@/hooks/useReveal';
import SectionHeading from './SectionHeading';
import { useTranslation } from '@/context/TranslationContext';

/**
 * Experience — editorial, box-free layout in the spirit of a print masthead.
 * Each role is a full-bleed row: an oversized ghost index numeral, a large
 * period + status eyebrow, a huge company headline, and a wide serif-lead
 * description. Rows are separated by hairline rules only. Everything fades /
 * slides in with a light stagger on scroll (CSS-only, via useReveal).
 */
const Experience = () => {
  const { ref, visible } = useReveal();
  const { t } = useTranslation();

  return (
    <section id="experience" ref={ref} className="mt-28">
      <SectionHeading
        eyebrow={t('expEyebrow')}
        title={t('expTitle')}
        accent={t('expAccent')}
      />

      <div>
        {experiences.map((exp, i) => (
          <article
            key={`${exp.company}-${exp.period}`}
            className={`group relative border-t border-outline-variant/40 py-10 transition-all duration-700 first:border-t-0 ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
            style={{ transitionDelay: `${i * 140}ms` }}
          >
            {/* Ghost index numeral — oversized, sits behind the content */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-2 right-0 select-none font-headline text-7xl font-black leading-none text-on-surface/[0.04] sm:text-8xl"
            >
              {String(i + 1).padStart(2, '0')}
            </span>

            {/* Meta row: period + live status */}
            <div className="flex items-center gap-3">
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

            {/* Company — the headline moment. Oversized, slides right on hover. */}
            <h3 className="mt-3 font-headline text-5xl font-black leading-[0.95] tracking-tight text-on-surface transition-transform duration-500 group-hover:translate-x-2 sm:text-6xl">
              {exp.company}
              <span className="text-primary">.</span>
            </h3>

            {/* Role eyebrow */}
            <p className="mt-4 inline-flex items-center gap-2 font-label text-xs font-bold uppercase tracking-label text-primary">
              <ArrowUpRight size={15} />
              {exp.role}
            </p>

            {/* Description — wide serif lead, offset for an editorial column feel */}
            <p className="mt-5 max-w-2xl font-body text-xl italic leading-relaxed text-on-surface-variant sm:text-2xl">
              {exp.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Experience;
