import { Music2 } from 'lucide-react';
import { nowPlaying } from '@/data/content';
import { useTranslation } from '@/context/TranslationContext';

/**
 * YouTube Music themed "now playing" card.
 * Styled to look like an embedded dark plugin:
 * - Curved borders (rounded-2xl).
 * - Background pure black (#030303) with clean border outline.
 * - Rotating album vinyl disc animation when active.
 * - Branded red YouTube Music accents.
 * - Tight padding to solve vertical spacing stretch.
 */
const NowPlaying = () => {
  const { t } = useTranslation();

  return (
    <a
      href={nowPlaying.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#030303] px-3.5 py-2.5 shadow-floating transition-all duration-300 hover:border-red-600/40 hover:bg-[#0c0c0c] w-full"
      style={{ fontFamily: 'sans-serif' }} // force neutral sans-serif
    >
      {/* Vinyl Disc Album Thumbnail */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#121212] border border-white/5 flex items-center justify-center">
        {nowPlaying.isPlaying ? (
          // Rotating record vinyl
          <div className="relative h-10 w-10 rounded-full bg-[#181818] border-2 border-[#ff0000]/30 flex items-center justify-center animate-[spin_4s_linear_infinite] shadow-inner">
            {/* Center label */}
            <div className="h-3.5 w-3.5 rounded-full bg-[#ff0000] flex items-center justify-center">
              <div className="h-1 w-1 rounded-full bg-white" />
            </div>
            {/* Grooves */}
            <div className="absolute inset-1 rounded-full border border-white/5" />
            <div className="absolute inset-2.5 rounded-full border border-white/5" />
          </div>
        ) : (
          <span className="text-[#ff0000]">
            <Music2 size={20} />
          </span>
        )}
      </div>

      {/* Track info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {/* YT Music Badge */}
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff0000] animate-pulse" />
          <p className="text-[9px] font-bold uppercase tracking-wider text-red-500 font-mono">
            YouTube Music
          </p>
        </div>
        <p className="truncate text-[13px] font-bold text-white mt-0.5 leading-snug">
          {nowPlaying.track}
        </p>
        <p className="truncate text-xs text-[#aaaaaa] mt-0.5">
          {nowPlaying.artist}
        </p>
      </div>

      {/* Red equalizer bars */}
      {nowPlaying.isPlaying && (
        <span className="flex h-5 items-end gap-[3px] pr-1.5" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-[#ff0000]"
              style={{
                animation: `eq 900ms ease-in-out ${i * 150}ms infinite`,
                height: '40%',
              }}
            />
          ))}
        </span>
      )}

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
