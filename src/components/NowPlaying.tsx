import { Music2 } from 'lucide-react';
import { nowPlaying } from '@/data/content';

/**
 * Spotify "now playing" card, styled in the Stdout theme.
 * Static/mock data (no live API) — renders an equalizer animation when
 * `isPlaying` is true. The animated bars are pure CSS via inline keyframes.
 */
const NowPlaying = () => {
  return (
    <a
      href={nowPlaying.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-soft border border-primary/20 bg-primary/[0.06] px-4 py-3 transition-colors duration-300 hover:bg-primary/10"
    >
      {/* Album / spotify glyph */}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-soft bg-primary/15 text-primary">
        <Music2 size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-label text-[10px] font-bold uppercase tracking-label text-outline">
          {nowPlaying.isPlaying ? 'Now Playing' : 'Last Played'}
        </p>
        <p className="truncate font-headline text-sm font-bold text-on-surface">
          {nowPlaying.track}
        </p>
        <p className="truncate font-body text-xs italic text-on-surface-variant">
          {nowPlaying.artist}
        </p>
      </div>

      {/* Equalizer bars */}
      {nowPlaying.isPlaying && (
        <span className="flex h-5 items-end gap-[3px]" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-primary"
              style={{
                animation: `eq 900ms ease-in-out ${i * 150}ms infinite`,
                height: '40%',
              }}
            />
          ))}
        </span>
      )}

      {/* Component-scoped keyframes for the equalizer */}
      <style>{`
        @keyframes eq {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
      `}</style>
    </a>
  );
};

export default NowPlaying;
