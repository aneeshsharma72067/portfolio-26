import { Briefcase } from 'lucide-react';
import { experiences } from '@/data/content';
import { useReveal } from '@/hooks/useReveal';
import SectionHeading from './SectionHeading';
import { useTranslation } from '@/context/TranslationContext';

/**
 * Experience — career history rendered as a vertical timeline.
 * A single mint spine runs down the left; each role is a node that fades /
 * slides in with a small stagger as the section scrolls into view (light,
 * CSS-only animation — no runtime animation library).
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

      {/* Timeline — vertical spine + role nodes */}
      <div className="relative pl-10">
        {/* Mint gradient spine */}
        <span
          aria-hidden
          className="absolute left-[13px] top-1 bottom-1 w-px bg-gradient-to-b from-primary via-primary/40 to-transparent"
        />

        <ol className="space-y-8">
          {experiences.map((exp, i) => (
            <li
              key={`${exp.company}-${exp.period}`}
              className={`relative transition-all duration-700 ${
                visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              // Stagger each node slightly after the previous for a cascading reveal.
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Node marker on the spine */}
              <span className="absolute -left-10 top-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 bg-surface-container-high shadow-floating">
                <Briefcase size={13} className="text-primary" />
                {exp.current && (
                  // Pulsing "currently here" ring.
                  <span className="absolute inset-0 animate-ping rounded-full border border-primary/50" />
                )}
              </span>

              {/* Role card */}
              <div className="group rounded-2xl border border-outline-variant/40 bg-surface-container-low/40 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-surface-container-low/70">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-headline text-xl font-extrabold tracking-tight text-on-surface">
                    {exp.company}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-label ${
                      exp.current
                        ? 'bg-primary/15 text-primary'
                        : 'bg-white/5 text-on-surface-variant'
                    }`}
                  >
                    {exp.period}
                  </span>
                </div>

                <p className="mt-1 font-label text-[11px] font-bold uppercase tracking-label text-primary">
                  {exp.role}
                </p>

                <p className="mt-3 font-body text-[15px] leading-relaxed text-on-surface-variant">
                  {exp.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Experience;
