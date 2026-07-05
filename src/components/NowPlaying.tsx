import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Music2 } from 'lucide-react';
import { nowPlaying } from '@/data/content';
import { useTranslation } from '@/context/TranslationContext';

/**
 * YouTube Music themed "now playing" card.
 * Designed as a full-height plugin matching the Chess board size.
 * Features:
 * - Curved borders (rounded-2xl) and pure black (#030303) background.
 * - Left side: Large rotating vinyl record disc (animated spin).
 * - Right side: Detailed playback info, red seek bar, time counters,
 *   and control buttons (play/pause toggle, skip, volume, like).
 * - Fully responsive, stretching to fill height cleanly.
 */
const NowPlaying = () => {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(nowPlaying.isPlaying);
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(38); // percentage

  // Simulate progress bar movement when playing
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.2));
    }, 1000);
    return () => clearInterval(interval);
  }, [playing]);

  // Format time based on progress percentage (mocking a 3:45 song length)
  const getFmtTime = (pct: number) => {
    const totalSecs = 225; // 3 mins 45 secs
    const currentSecs = Math.floor((pct / 100) * totalSecs);
    const mins = Math.floor(currentSecs / 60);
    const secs = currentSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPlaying(!playing);
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
  };

  return (
    <div
      className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#030303] p-4 shadow-floating transition-all duration-300 hover:border-red-600/40 w-full h-full select-none"
      style={{ fontFamily: 'sans-serif', minHeight: '186px' }}
    >
      {/* Top Section: Vinyl + Track Details */}
      <div className="flex gap-4 items-start">
        {/* Large Vinyl Record Disc Container */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#121212] border border-white/5 flex items-center justify-center shadow-inner">
          {playing ? (
            // Spinning vinyl record
            <div className="relative h-18 w-18 rounded-full bg-[#181818] border-2 border-[#ff0000]/40 flex items-center justify-center animate-[spin_6s_linear_infinite] shadow-floating">
              {/* Center label */}
              <div className="h-6 w-6 rounded-full bg-[#ff0000] flex items-center justify-center border border-black/20">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
              {/* Sound grooves */}
              <div className="absolute inset-1.5 rounded-full border border-white/5" />
              <div className="absolute inset-3 rounded-full border border-white/5" />
              <div className="absolute inset-5 rounded-full border border-white/5" />
            </div>
          ) : (
            // Offline/Paused state
            <span className="text-[#ff0000]/70">
              <Music2 size={32} />
            </span>
          )}
        </div>

        {/* Track Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full bg-[#ff0000] ${playing ? 'animate-pulse' : 'opacity-40'}`} />
            <p className="text-[9px] font-bold uppercase tracking-wider text-red-500 font-mono">
              {playing ? t('nowPlaying') : t('offline')}
            </p>
          </div>
          <h4 className="truncate text-base font-extrabold text-white mt-1 leading-tight">
            {nowPlaying.track}
          </h4>
          <p className="truncate text-sm text-[#aaaaaa] mt-0.5">
            {nowPlaying.artist}
          </p>
        </div>
      </div>

      {/* Middle Section: Progress Slider */}
      <div className="mt-4 w-full">
        {/* Seek Bar */}
        <div className="relative w-full h-1 bg-[#282828] rounded-full overflow-hidden cursor-pointer">
          <div
            className="absolute left-0 top-0 h-full bg-[#ff0000] rounded-full"
            style={{ width: `${progress}%`, transition: playing ? 'width 1s linear' : 'none' }}
          />
        </div>
        
        {/* Time stamps */}
        <div className="flex justify-between items-center text-[9px] font-mono text-[#888888] mt-1.5">
          <span>{getFmtTime(progress)}</span>
          <span>3:45</span>
        </div>
      </div>

      {/* Bottom Section: Media Controls */}
      <div className="flex items-center justify-between mt-3 pt-1 border-t border-white/5">
        {/* Left Side: Volume details */}
        <button className="text-[#aaaaaa] hover:text-white transition-colors" title="Volume">
          <Volume2 size={15} />
        </button>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-4">
          <button className="text-[#aaaaaa] hover:text-white transition-colors" title="Previous">
            <SkipBack size={15} />
          </button>
          
          <button
            onClick={handlePlayToggle}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-black hover:bg-[#ff0000] hover:text-white transition-all transform active:scale-95 shadow"
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" className="ml-0.5" />}
          </button>

          <button className="text-[#aaaaaa] hover:text-white transition-colors" title="Next">
            <SkipForward size={15} />
          </button>
        </div>

        {/* Right Side: Favorite Like */}
        <button
          onClick={handleLikeToggle}
          className={`transition-colors ${liked ? 'text-[#ff0000]' : 'text-[#aaaaaa] hover:text-white'}`}
          title="Like"
        >
          <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
};

export default NowPlaying;
