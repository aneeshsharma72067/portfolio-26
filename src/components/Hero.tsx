import { useRef, useState } from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { personal } from '@/data/content';
import Profile from '@/assets/image/gallery/1.webp';
import AltProfile from '@/assets/image/gallery/3.webp';
import Landscape from '@/assets/image/banner.jpg';
import NowPlaying from './NowPlaying';
import ChessProfile from './ChessProfile';
import GitHubContributions from './GitHubContributions';
import { useTranslation } from '@/context/TranslationContext';
import GalleryOverlay from './GalleryOverlay';
import Magnetic from './Magnetic';
import Typewriter from './Typewriter';
import { fireConfetti } from './TerminalFX';
import { trackResumeDownload } from '@/lib/analytics';

/* Rotating one-liners for the identity typewriter — half real, half playful. */
const ROLES = [
  'Software Development Engineer',
  'backend systems tinkerer',
  'future Jarvis builder',
  'Rust speed junkie',
  'chess addict ♟',
  'manhwa reader',
];

/* Clicks within this window count toward the avatar easter-egg streak. */
const STREAK_WINDOW_MS = 600;
const STREAK_TARGET = 5;

/**
 * Hero — profile-page style layout inspired by bharath.codes.
 */
const Hero = () => {
  const { t } = useTranslation();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const AVATAR_SIZE = 112; // px  (increased size)
  const OVERLAP = AVATAR_SIZE / 2; // 56px

  // Avatar click-streak easter egg: 5 fast clicks → spin + swap to alt pic.
  // A single (slow) click still just opens the gallery.
  const [eggActive, setEggActive] = useState(false);
  const streakCount = useRef(0);
  const streakTimer = useRef<number | null>(null);

  const handleAvatarClick = () => {
    streakCount.current += 1;
    if (streakTimer.current) window.clearTimeout(streakTimer.current);

    if (streakCount.current >= STREAK_TARGET) {
      // Trigger the egg: close the gallery the earlier clicks opened, then
      // spin + alt pic + confetti, auto-reset after the anim.
      streakCount.current = 0;
      setIsGalleryOpen(false);
      setEggActive(true);
      fireConfetti(80);
      window.setTimeout(() => setEggActive(false), 1200);
      return;
    }

    // Not a streak yet — open the gallery, and decay the counter shortly.
    setIsGalleryOpen(true);
    streakTimer.current = window.setTimeout(() => {
      streakCount.current = 0;
    }, STREAK_WINDOW_MS);
  };

  return (
    <section id="about" className="pt-2">
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

        {/* Avatar — half overlapping the banner bottom (clickable gallery trigger).
            5 fast clicks fire the easter egg: spins + swaps to an alt pic. */}
        <div
          className="absolute left-6 cursor-pointer"
          style={{ bottom: 0 }}
          onClick={handleAvatarClick}
          title={t('viewGallery') || 'View Gallery'}
        >
          <img
            src={eggActive ? AltProfile : Profile}
            alt={personal.name}
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            className={`rounded-full border-4 border-background object-cover shadow-floating transition-all duration-700 hover:scale-[1.03] hover:grayscale-0 ${
              eggActive ? 'grayscale-0 animate-[spin_1.2s_ease-in-out]' : 'grayscale'
            }`}
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
            {/* Role cycles through real + playful one-liners, typewriter-style */}
            <Typewriter
              words={ROLES}
              className="eyebrow !text-on-surface-variant font-mono normal-case tracking-normal"
            />
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
        <span className="text-primary">{t('heroAccent')}</span>
      </h2>

      {/* ── Serif lead ── */}
      <p className="mt-6 max-w-2xl font-body text-lg italic leading-relaxed text-on-surface-variant">
        {t('headline')}
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
            onClick={trackResumeDownload}
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
