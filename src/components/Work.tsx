import { ArrowUpRight } from 'lucide-react';
import { links } from '@/data/content';
import SectionHeading from './SectionHeading';
import MagicBento from './MagicBento';
import { useTranslation } from '@/context/TranslationContext';
import { trackGithubClick } from '@/lib/analytics';

/**
 * Work — the project feed, rendered as an interactive MagicBento grid.
 * Cards carry per-project preview, tags, and links, with cursor-driven
 * spotlight / border-glow / particle effects themed to the mint accent.
 */
const Work = () => {
  const { t, tArray } = useTranslation();

  return (
    <section id="work" className="mt-28">
      <SectionHeading
        eyebrow={t('workEyebrow')}
        title={t('workTitle')}
        accent={t('workAccent')}
        accentWords={tArray('workAccentWords')}
      />

      <MagicBento
        textAutoHide
        enableStars
        enableSpotlight
        enableBorderGlow
        enableMagnetism
        clickEffect
        spotlightRadius={320}
        particleCount={10}
        glowColor="var(--primary)"
      />

      <a
        href={links.githubRepos}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackGithubClick('work_more')}
        className="group mt-10 inline-flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-label text-primary"
      >
        {t('moreGithub')}
        <ArrowUpRight
          size={14}
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </a>
    </section>
  );
};

export default Work;
