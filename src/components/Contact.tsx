import { ArrowUpRight } from 'lucide-react';
import { personal, socials, links } from '@/data/content';
import { useReveal } from '@/hooks/useReveal';
import SectionHeading from './SectionHeading';
import { useTranslation } from '@/context/TranslationContext';

/**
 * Contact — a closing invitation with a large primary CTA and a list of
 * social handles rendered as editorial rows that nudge on hover.
 */
const Contact = () => {
  const { ref, visible } = useReveal();
  const { t } = useTranslation();

  return (
    <section
      id="contact"
      ref={ref}
      className={`mt-28 transition-all duration-700 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <SectionHeading eyebrow={t('contactEyebrow')} title={t('contactTitle')} accent={t('contactAccent')} />

      <p className="max-w-xl font-body text-lg italic leading-relaxed text-on-surface-variant">
        {t('contactDesc')}
      </p>

      {/* Primary CTA */}
      <a
        href={links.email}
        className="mt-8 inline-flex items-center gap-2 rounded-soft bg-gradient-to-br from-primary to-primary-container px-6 py-3 font-label text-xs font-bold uppercase tracking-label text-on-primary transition-transform duration-300 hover:scale-[0.98]"
      >
        {personal.email}
      </a>

      {/* Social rows */}
      <ul className="mt-12 divide-y divide-outline-variant/40 border-y border-outline-variant/40">
        {socials.map((s) => (
          <li key={s.label}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between py-4 transition-all duration-300 hover:translate-x-1"
            >
              <span className="font-headline text-lg font-bold text-on-surface">
                {s.label}
              </span>
              <span className="flex items-center gap-3">
                <span className="font-body text-sm italic text-outline">
                  {s.handle}
                </span>
                <ArrowUpRight
                  size={16}
                  className="text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Contact;
