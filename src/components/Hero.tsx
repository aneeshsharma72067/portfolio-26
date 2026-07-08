import { useState } from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { personal } from '@/data/content';
import Profile from '@/assets/image/gallery/1.png';
import Landscape from '@/assets/image/landscape.jpeg';
import NowPlaying from './NowPlaying';
import ChessProfile from './ChessProfile';
import GitHubContributions from './GitHubContributions';
import { useTranslation } from '@/context/TranslationContext';
import GalleryOverlay from './GalleryOverlay';
import Magnetic from './Magnetic';
import { ScrambleText } from './SectionHeading';

// Phrases the hero accent cycles through on each hover (scramble effect).
// First entry matches the default heroAccent so the initial render is stable.
const ACCENT_PHRASES = [
  'thoughtful software.',
  'scalable solutions.',
  'resilient systems.',
  'elegant interfaces.',
  'performant backends.',
  'delightful products.',
  'clean architecture.',
];

/**
 * Hero — profile-page style layout inspired by bharath.codes.
 */
const Hero = () => {
  const { t } = useTranslation();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const AVATAR_SIZE = 112; // px  (increased size)
  const OVERLAP = AVATAR_SIZE / 2; // 56px

  return (
    <section id="about" className="pt-10">
      {/* ── Banner + overlapping avatar ── */}
      <div
        className="relative w-full"
        style={{ paddingBottom: OVERLAP }}
      >
        {/* Landscape banner */}
        <div className="relative h-44 w-full overflow-hidden rounded-soft sm:h-56">
          <img
            src={Landscape}
            alt="Banner"
            className="h-full w-full object-cover"
          />
          {/* Subtle dark gradient at bottom so avatar reads cleanly */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>

        {/* Avatar — half overlapping the banner bottom (clickable gallery trigger) */}
        <div
          className="absolute left-6 cursor-pointer"
          style={{ bottom: 0 }}
          onClick={() => setIsGalleryOpen(true)}
          title={t('viewGallery') || 'View Gallery'}
        >
          <img
            src={Profile}
            alt={personal.name}
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            className="rounded-full border-4 border-background object-cover shadow-floating grayscale transition-all duration-700 hover:scale-[1.03] hover:grayscale-0"
          />
        </div>
      </div>

      {/* ── Identity row ── */}
      <div className="mt-4 flex items-start justify-between gap-4">
        {/* Left: name + meta */}
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
            {personal.name.split(' ')[0]}
            <span className="text-primary">.</span>
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-outline">
            <p className="eyebrow !text-on-surface-variant">{t('role')}</p>
            <span className="meta-dot" />
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-primary" />
              <span className="font-mono text-xs text-on-surface-variant">{t('location')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Headline ── */}
      <h2 className="mt-6 font-headline text-4xl font-extrabold leading-[1.1] tracking-tight text-on-surface sm:text-5xl">
        {t('heroGreeting')}
        <span className="text-primary">
          <ScrambleText text={t('heroAccent')} cycleWords={ACCENT_PHRASES} />
        </span>
      </h2>

      {/* ── Serif lead ── */}
      <p className="mt-6 max-w-2xl font-body text-lg italic leading-relaxed text-on-surface-variant">
        {t('bio0')}
      </p>

      {/* ── CTAs ── */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Magnetic strength={0.12}>
          <a
            href="#work"
            className="inline-flex items-center gap-2 rounded-soft bg-gradient-to-br from-primary to-primary-container px-5 py-2.5 font-label text-[11px] font-bold uppercase tracking-label text-on-primary transition-transform duration-300 hover:scale-[0.98]"
          >
            {t('navWork')}
          </a>
        </Magnetic>
        <Magnetic strength={0.12}>
          <a
            href={personal.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-label text-primary"
          >
            {t('resumeButton')}
            <ArrowUpRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </Magnetic>
      </div>

      {/* ── Widgets (Spotify + Chess.com) ── */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <NowPlaying />
        <ChessProfile />
      </div>

      {/* ── GitHub contribution graph ── */}
      <GitHubContributions />

      {/* ── 3D Gallery Overlay ── */}
      <GalleryOverlay
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />
    </section>
  );
};

export default Hero;
