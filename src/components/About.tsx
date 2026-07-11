import { Fragment, type ReactNode } from 'react';
import { Quote } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';
import { useReveal } from '@/hooks/useReveal';
import SectionHeading from './SectionHeading';

/**
 * Impactful phrases pulled out of the bio prose and rendered with a mint
 * accent + medium weight so they catch the eye while skimming. Ordered
 * longest-first so multi-word phrases win over their sub-words when matched.
 */
const HIGHLIGHTS = [
  'smooth animated frontends',
  'crazy fast performance',
  'backend systems',
  'RAG systems',
  'CLI tools',
  'React Native',
  'Next.js',
  'Node.js',
  'PostgreSQL',
  'JS family',
  'Engineering',
  'hardware',
  'software',
  'Python',
  'Rust',
  'React',
  'Jarvis',
  'chess',
  'manhwas',
  'drawing',
  'explore the world',
  'AI',
].sort((a, b) => b.length - a.length);

// Single regex of all phrases (escaped), used to split prose while keeping
// the delimiters so matches can be re-wrapped in an accent span.
const HIGHLIGHT_RE = new RegExp(
  `(${HIGHLIGHTS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
  'g',
);

/** Split a bio paragraph and wrap any matched keyword in an accent span. */
const highlight = (text: string): ReactNode =>
  text.split(HIGHLIGHT_RE).map((part, i) =>
    HIGHLIGHTS.includes(part) ? (
      <span key={i} className="font-medium text-primary">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );

/**
 * About — long-form serif prose (the "writing" voice) plus a small set of
 * value pills. Generous whitespace signals slow reading.
 */
const About = () => {
  const { ref, visible } = useReveal();
  const { t, tArray } = useTranslation();

  return (
    <section
      ref={ref}
      className={`mt-28 transition-all duration-700 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <SectionHeading
        eyebrow={t('aboutEyebrow')}
        title={t('aboutTitle')}
        accent={t('aboutAccent')}
        accentWords={tArray('aboutAccentWords')}
      />

      <div className="space-y-6">
        <p className="font-body text-lg leading-[1.8] text-on-surface-variant">
          {highlight(t('bio0'))}
        </p>
        <p className="font-body text-lg leading-[1.8] text-on-surface-variant">
          {highlight(t('bio1'))}
        </p>
        <p className="font-body text-lg leading-[1.8] text-on-surface-variant">
          {highlight(t('bio2'))}
        </p>
      </div>

      {/* Signature quote — replaces the old value pills */}
      <figure className="relative mt-10 overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.06] p-6 pl-14 shadow-floating">
        {/* Accent bar on the left edge */}
        <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-primary-container" />
        {/* Oversized decorative quote glyph */}
        <Quote
          size={28}
          className="absolute left-5 top-5 text-primary/50"
          fill="currentColor"
        />
        <blockquote className="font-body text-lg italic leading-relaxed text-on-surface sm:text-xl">
          Corruption is just legacy code nobody wants to refactor.
        </blockquote>
        <figcaption className="mt-3 font-label text-[11px] font-bold uppercase tracking-label text-primary">
          ~ Me
        </figcaption>
      </figure>
    </section>
  );
};

export default About;
