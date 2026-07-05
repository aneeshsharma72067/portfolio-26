import { ArrowUpRight, MapPin } from 'lucide-react';
import { personal } from '@/data/content';
import Profile from '@/assets/image/profile.png';
import Landscape from '@/assets/image/landscape.jpeg';
import NowPlaying from './NowPlaying';
import GitHubContributions from './GitHubContributions';

/**
 * Hero — profile-page style layout inspired by bharath.codes.
 *
 * Structure:
 *  ┌──────────────────────────────────────────────────────────┐
 *  │  landscape banner (full container width, ~200px tall)    │
 *  └──────────────────────────────────────────────────────────┘
 *      ◉ ← avatar, absolutely positioned so it straddles
 *           the banner bottom edge (50% inside / 50% outside)
 *
 *  Name · role · location             ← below avatar with push-down
 *  Headline · bio · CTAs
 *  NowPlaying widget
 */
const Hero = () => {
  /* Avatar radius in px — half of this is the overlap amount */
  const AVATAR_SIZE = 96; // px  (h-24 w-24)
  const OVERLAP = AVATAR_SIZE / 2; // 48px

  return (
    <section id="about" className="pt-10">
      {/* ── Banner + overlapping avatar ── */}
      <div
        className="relative w-full"
        style={{ paddingBottom: OVERLAP }}
      >
        {/* Landscape banner */}
        <div className="relative h-48 w-full overflow-hidden rounded-soft sm:h-56">
          <img
            src={Landscape}
            alt="Banner"
            className="h-full w-full object-cover"
          />
          {/* Subtle dark gradient at bottom so avatar reads cleanly */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>

        {/* Avatar — half overlapping the banner bottom */}
        <div
          className="absolute left-6"
          style={{ bottom: 0 }}
        >
          <img
            src={Profile}
            alt={personal.name}
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            className="rounded-full border-4 border-background object-cover shadow-floating grayscale transition-all duration-700 hover:grayscale-0"
          />
        </div>
      </div>

      {/* ── Identity row ── */}
      {/*
        Push content down enough to clear the avatar fully.
        avatar half = OVERLAP (48px) already consumed by padding-bottom above,
        so we add a small gap from the container bottom to the text.
      */}
      <div className="mt-4 flex items-start justify-between gap-4">
        {/* Left: name + meta */}
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
            {personal.name.split(' ')[0]}
            <span className="text-primary">.</span>
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-outline">
            <p className="eyebrow !text-on-surface-variant">{personal.role}</p>
            <span className="meta-dot" />
            <MapPin size={12} className="text-outline" />
            <span className="font-label text-[11px] uppercase tracking-wide text-outline">
              {personal.location}
            </span>
          </div>
        </div>
      </div>

      {/* ── Headline ── */}
      <h2 className="mt-6 font-headline text-4xl font-extrabold leading-[1.1] tracking-tight text-on-surface sm:text-5xl">
        Hi, I'm {personal.name.split(' ')[0]} — I build{' '}
        <span className="text-primary">thoughtful software.</span>
      </h2>

      {/* ── Serif lead ── */}
      <p className="mt-6 max-w-2xl font-body text-lg italic leading-relaxed text-on-surface-variant">
        {personal.bio[0]}
      </p>

      {/* ── CTAs ── */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <a
          href="#work"
          className="inline-flex items-center gap-2 rounded-soft bg-gradient-to-br from-primary to-primary-container px-5 py-2.5 font-label text-[11px] font-bold uppercase tracking-label text-on-primary transition-transform duration-300 hover:scale-[0.98]"
        >
          View Work
        </a>
        <a
          href={personal.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-label text-primary"
        >
          Résumé
          <ArrowUpRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      </div>

      {/* ── Now playing ── */}
      <div className="mt-10 max-w-sm">
        <NowPlaying />
      </div>

      {/* ── GitHub contribution graph ── */}
      <GitHubContributions />
    </section>
  );
};

export default Hero;
