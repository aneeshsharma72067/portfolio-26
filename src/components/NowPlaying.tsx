import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Music2 } from 'lucide-react';
import { nowPlaying } from '@/data/content';
import { useTranslation } from '@/context/TranslationContext';
// Local audio track bundled by Vite. Special characters (spaces, parens,
// apostrophe) are fine inside the import specifier string.
import trackSrc from "@/assets/audio/Charlie Puth - We Don't Talk Anymore (Lyrics) feat. Selena Gomez (2).mp3";

/**
 * YouTube Music themed "now playing" card — now fully functional.
 * Wraps a real <audio> element and drives it from the UI controls.
 * Features:
 * - Curved borders (rounded-2xl) and pure black (#030303) background.
 * - Left side: Large rotating vinyl record disc (animated spin while playing).
 * - Right side: Live playback info, red seek bar, real time counters,
 *   and control buttons (play/pause, seek, restart, mute, like).
 * - Starts paused; audio only begins on user interaction.
 */
const NowPlaying = () => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playing, setPlaying] = useState(nowPlaying.isPlaying);
  const [liked, setLiked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isScratching, setIsScratching] = useState(false);

  const [currentTime, setCurrentTime] = useState(0); // seconds
  const [duration, setDuration] = useState(0); // seconds

  // Percentage played — guards against divide-by-zero before metadata loads.
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Wire native <audio> events to component state.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setDuration(audio.duration || 0);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Keep the audio element's play/pause in sync with `playing` state.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      // play() returns a promise that rejects if autoplay is blocked.
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing]);

  // Reflect mute state onto the element.
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  // Format seconds as m:ss.
  const fmtTime = (secs: number) => {
    if (!isFinite(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPlaying((p) => !p);
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((l) => !l);
  };

  // Seek to a click position on the progress bar.
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = pct * duration;
    setCurrentTime(audio.currentTime);
  };

  // Restart the track from the beginning.
  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
  };

  // Jump forward 10s (acts as "next" within a single track).
  const handleForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio || duration <= 0) return;
    audio.currentTime = Math.min(audio.currentTime + 10, duration);
    setCurrentTime(audio.currentTime);
  };

  return (
    <div
      className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#030303] p-4 shadow-floating transition-all duration-300 hover:border-red-600/40 w-full h-full select-none"
      style={{ fontFamily: 'sans-serif', minHeight: '186px' }}
    >
      {/* Hidden native audio element driving the whole card */}
      <audio ref={audioRef} src={trackSrc} preload="metadata" />

      {/* Top Section: Vinyl + Track Details */}
      <div className="flex gap-4 items-start">
        {/* Large Vinyl Record Disc Container */}
        <div
          onMouseDown={() => setIsScratching(true)}
          onMouseUp={() => setIsScratching(false)}
          onMouseLeave={() => setIsScratching(false)}
          onTouchStart={() => setIsScratching(true)}
          onTouchEnd={() => setIsScratching(false)}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#121212] border border-white/5 flex items-center justify-center shadow-inner cursor-grab active:cursor-grabbing"
          title="Click and hold to scratch!"
        >
          {playing ? (
            // Spinning vinyl record
            <div
              className={`relative h-18 w-18 rounded-full bg-[#181818] border-2 flex items-center justify-center shadow-floating transition-all duration-300
                ${isScratching ? 'rotate-[45deg] skew-x-3 scale-[0.92] border-red-500' : 'border-[#ff0000]/40 animate-[spin_6s_linear_infinite]'}
              `}
            >
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
            // Paused state — static disc icon
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
              {playing ? t('nowPlaying') : t('paused')}
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
        {/* Seek Bar — click to scrub */}
        <div
          onClick={handleSeek}
          className="relative w-full h-1 bg-[#282828] rounded-full overflow-hidden cursor-pointer"
        >
          <div
            className="absolute left-0 top-0 h-full bg-[#ff0000] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time stamps */}
        <div className="flex justify-between items-center text-[9px] font-mono text-[#888888] mt-1.5">
          <span>{fmtTime(currentTime)}</span>
          <span>{fmtTime(duration)}</span>
        </div>
      </div>

      {/* Bottom Section: Media Controls */}
      <div className="flex items-center justify-between mt-3 pt-1 border-t border-white/5">
        {/* Left Side: Mute toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
          className="text-[#aaaaaa] hover:text-white transition-colors"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleRestart}
            className="text-[#aaaaaa] hover:text-white transition-colors"
            title="Restart"
          >
            <SkipBack size={15} />
          </button>

          <button
            onClick={handlePlayToggle}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-black hover:bg-[#ff0000] hover:text-white transition-all transform active:scale-95 shadow"
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" className="ml-0.5" />}
          </button>

          <button
            onClick={handleForward}
            className="text-[#aaaaaa] hover:text-white transition-colors"
            title="Forward 10s"
          >
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
