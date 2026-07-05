import { useTranslation } from '@/context/TranslationContext';
import { useReveal } from '@/hooks/useReveal';
import SectionHeading from './SectionHeading';

/** Value pills shown alongside the bio. */
const values = ['Clean Code', 'Problem Solver', 'Performance', 'Team Player'];

/**
 * About — long-form serif prose (the "writing" voice) plus a small set of
 * value pills. Generous whitespace signals slow reading.
 */
const About = () => {
  const { ref, visible } = useReveal();
  const { t } = useTranslation();

  return (
    <section
      ref={ref}
      className={`mt-28 transition-all duration-700 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <SectionHeading eyebrow={t('aboutEyebrow')} title={t('aboutTitle')} accent={t('aboutAccent')} />

      <div className="space-y-6">
        <p className="font-body text-lg leading-[1.8] text-on-surface-variant">
          {t('bio0')}
        </p>
        <p className="font-body text-lg leading-[1.8] text-on-surface-variant">
          {t('bio1')}
        </p>
        <p className="font-body text-lg leading-[1.8] text-on-surface-variant">
          {t('bio2')}
        </p>
      </div>

      {/* Value pills */}
      <div className="mt-8 flex flex-wrap gap-2.5">
        {values.map((v) => (
          <span
            key={v}
            className="rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 font-label text-[11px] font-bold uppercase tracking-label text-primary"
          >
            {v}
          </span>
        ))}
      </div>
    </section>
  );
};

export default About;
