import { personal, socials, links } from '@/data/content';
import { useReveal } from '@/hooks/useReveal';
import SectionHeading from './SectionHeading';
import { useTranslation } from '@/context/TranslationContext';
import FlowingMenu from './FlowingMenu';

import Magnetic from './Magnetic';

/**
 * Contact — a closing invitation with a large primary CTA and a list of
 * social handles rendered as interactive flowing menus.
 */
const Contact = () => {
  const { ref, visible } = useReveal();
  const { t } = useTranslation();

  const flowingItems = socials.map((s) => {
    return {
      link: s.href,
      text: s.label,
      handle: s.handle,
    };
  });

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
      <div className="mt-8">
        <Magnetic strength={0.12}>
          <a
            href={links.email}
            className="inline-flex items-center gap-2 rounded-soft bg-gradient-to-br from-primary to-primary-container px-6 py-3 font-label text-xs font-bold uppercase tracking-label text-on-primary transition-transform duration-300 hover:scale-[0.98]"
          >
            {personal.email}
          </a>
        </Magnetic>
      </div>

      {/* Social rows using interactive FlowingMenu */}
      <div className="mt-12 border-y border-outline-variant/40 overflow-hidden" style={{ height: '260px', position: 'relative' }}>
        <FlowingMenu
          items={flowingItems}
          textColor="#dee2f5"
          bgColor="transparent"
          marqueeBgColor="#55ddad"
          marqueeTextColor="#0e1320"
          borderColor="rgba(222, 226, 245, 0.12)"
          speed={12}
        />
      </div>
    </section>
  );
};

export default Contact;
