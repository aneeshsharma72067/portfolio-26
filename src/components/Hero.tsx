import { ArrowUpRight, MapPin } from 'lucide-react';
import { personal } from '@/data/content';
import Profile from '@/assets/image/profile.png';
import NowPlaying from './NowPlaying';

/**
 * Hero — the opening statement, following the bharath.codes single-column
 * layout but re-skinned in the Stdout editorial theme.
 * Portrait + name, an italic serif tagline, meta row, CTAs, and the Spotify
 * now-playing widget beneath.
 */
const Hero = () => {
  return (
    <section id="about" className="pt-10">
      {/* Portrait + identity */}
      <div className="flex items-center gap-5">
        <img
          src={Profile}
          alt={personal.name}
          className="h-16 w-16 rounded-full border border-outline-variant/60 object-cover grayscale transition-all duration-700 hover:grayscale-0"
        />
        <div>
          <p className="eyebrow mb-1">{personal.role}</p>
          <div className="flex items-center gap-2 text-outline">
            <MapPin size={13} />
            <span className="font-label text-xs uppercase tracking-wide">
              {personal.location}
            </span>
          </div>
        </div>
      </div>

      {/* Headline — two-tone: mostly on-surface, trailing accent word */}
      <h1 className="mt-8 font-headline text-4xl font-extrabold leading-[1.1] tracking-tight text-on-surface sm:text-5xl">
        Hi, I'm {personal.name.split(' ')[0]} — I build{' '}
        <span className="text-primary">thoughtful software.</span>
      </h1>

      {/* Serif lead */}
      <p className="mt-6 max-w-2xl font-body text-lg italic leading-relaxed text-on-surface-variant">
        {personal.bio[0]}
      </p>

      {/* CTAs */}
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

      {/* Now playing */}
      <div className="mt-10 max-w-sm">
        <NowPlaying />
      </div>
    </section>
  );
};

export default Hero;
