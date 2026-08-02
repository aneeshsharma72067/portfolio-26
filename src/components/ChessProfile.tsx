import { useEffect, useState } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import ChessPuzzleModal from './ChessPuzzleModal';

interface ChessStats {
  blitz: number;
  rapid: number;
  bullet: number;
}

// A small, static "teaser" position shown on the card. It is decorative only —
// the real, rule-checked puzzle lives in ChessPuzzleModal, opened on click.
interface PreviewPiece {
  glyph: string;
  color: 'w' | 'b';
  col: number;
  row: number;
}

const PREVIEW_PIECES: PreviewPiece[] = [
  { glyph: '♚', color: 'b', col: 6, row: 0 }, // black king
  { glyph: '♜', color: 'w', col: 0, row: 1 }, // white rook
  { glyph: '♛', color: 'w', col: 6, row: 3 }, // white queen
];

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Each time control gets a clock whose hand actually ticks at a speed
// proportional to how fast that format is played — bullet fastest, rapid
// slowest. The animation isn't decoration, it encodes the stat's category.
type Speed = 'bullet' | 'blitz' | 'rapid';
const TICK_DURATION: Record<Speed, string> = {
  bullet: '1.2s',
  blitz: '2.6s',
  rapid: '5s',
};

function ClockFace({ speed }: { speed: Speed }) {
  return (
    <svg viewBox="0 0 32 32" className="h-4 w-4 shrink-0" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="#4a4842" strokeWidth="2" />
      <circle cx="16" cy="16" r="1.4" fill="#81b64c" />
      <line x1="16" y1="16" x2="16" y2="16" stroke="#81b64c" strokeWidth="0" />
      <g
        className="motion-safe:origin-center motion-safe:[transform-box:fill-box]"
        style={{
          animation: `tick-${speed} ${TICK_DURATION[speed]} linear infinite`,
        }}
      >
        <line x1="16" y1="16" x2="16" y2="6" stroke="#81b64c" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function RatingReadout({
  speed,
  label,
  value,
  loading,
}: {
  speed: Speed;
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex items-center gap-1.5">
        <ClockFace speed={speed} />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-[#8a8880]">
          {label}
        </span>
      </div>
      <div className="rounded-[3px] bg-[#141310] px-2 py-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
        <span
          className="font-mono text-base font-bold tabular-nums tracking-wide text-[#8FCB53]"
          style={{ textShadow: '0 0 6px rgba(143,203,83,0.55)' }}
        >
          {loading ? '----' : value}
        </span>
      </div>
    </div>
  );
}

export default function ChessProfile() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ChessStats>({ blitz: 640, rapid: 690, bullet: 455 });
  const [loading, setLoading] = useState(true);
  const [puzzleOpen, setPuzzleOpen] = useState(false);

  useEffect(() => {
    fetch('https://api.chess.com/pub/player/aneesh1024/stats')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then((data) => {
        setStats({
          blitz: data.chess_blitz?.last?.rating || 640,
          rapid: data.chess_rapid?.last?.rating || 690,
          bullet: data.chess_bullet?.last?.rating || 455,
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const boardCells = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isDark = (row + col) % 2 === 1;
      const piece = PREVIEW_PIECES.find((p) => p.col === col && p.row === row);
      boardCells.push(
        <div
          key={`${col}-${row}`}
          className="relative flex items-center justify-center"
          style={{ backgroundColor: isDark ? '#769656' : '#eeeed2' }}
        >
          {piece && (
            <span
              className={`text-[20px] leading-none font-bold ${
                piece.color === 'w'
                  ? 'text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.85)]'
                  : 'text-[#1e1e1e] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]'
              }`}
            >
              {piece.glyph}
            </span>
          )}
        </div>
      );
    }
  }

  return (
    <>
      <div className="relative flex items-center gap-5 overflow-hidden rounded-soft border border-[#81b64c]/20 bg-[#211F1C] px-5 py-4 transition-all duration-300 hover:border-[#81b64c]/40">
        {/* Profile + three clock readouts */}
        <div className="relative z-10 min-w-0 flex-1">
          <a
            href="https://www.chess.com/member/aneesh1024"
            target="_blank"
            rel="noopener noreferrer"
            className="group/chess inline-flex items-center gap-2"
          >
            <svg className="h-5 w-5 shrink-0 fill-[#81b64c]" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-3.4 15.3c-.6.3-1.3.4-1.9.4-.8 0-1.5-.2-2.1-.6-.6-.4-1-1-1.2-1.7-.2-.7-.1-1.5.3-2.1.4-.6.9-1.1 1.6-1.3.7-.2 1.5-.1 2.1.3.6.4 1 1 1.2 1.7.2.7.1 1.5-.3 2.1-.4.6-1 1-1.7 1.2M12 9.7l-2.8-2.8 1.4-1.4L12 6.9l1.4-1.4 1.4 1.4L12 9.7z" />
            </svg>
            <span className="font-headline text-base font-bold text-white transition-colors group-hover/chess:text-[#81b64c]">
              aneesh1024
            </span>
          </a>

          <div className="mt-3.5 flex items-start gap-5">
            <RatingReadout speed="bullet" label={t('chessBullet') || 'Bullet'} value={stats.bullet} loading={loading} />
            <RatingReadout speed="blitz" label={t('chessBlitz') || 'Blitz'} value={stats.blitz} loading={loading} />
            <RatingReadout speed="rapid" label={t('chessRapid') || 'Rapid'} value={stats.rapid} loading={loading} />
          </div>
        </div>

        {/* Divider between profile and puzzle */}
        <div className="relative z-10 hidden h-20 w-px shrink-0 bg-white/10 sm:block" />

        {/* Clickable puzzle preview — opens the interactive puzzle window. */}
        <button
          onClick={() => setPuzzleOpen(true)}
          className="group/puzzle relative z-10 flex shrink-0 flex-col items-center outline-none"
          title={t('chessPuzzle')}
        >
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#b2b1b0] transition-colors group-hover/puzzle:text-[#81b64c]">
            {t('chessPuzzle')}
          </div>

          <div
            className="relative grid grid-cols-8 grid-rows-8 overflow-hidden rounded border border-[#454340] shadow-floating transition-all duration-300 group-hover/puzzle:border-[#81b64c] group-hover/puzzle:shadow-[0_0_0_2px_rgba(129,182,76,0.35)]"
            style={{ width: '148px', height: '148px' }}
          >
            {boardCells}

            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover/puzzle:bg-black/45 group-hover/puzzle:opacity-100">
              <span className="rounded bg-[#81b64c] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
                {t('chessSolve')}
              </span>
            </div>
          </div>

          {/* File coordinates, like the edge of a real board */}
          <div className="mt-1 grid grid-cols-8" style={{ width: '148px' }}>
            {FILES.map((f) => (
              <span key={f} className="text-center text-[7px] font-mono text-[#5c5a54]">
                {f}
              </span>
            ))}
          </div>
        </button>
      </div>

      <ChessPuzzleModal open={puzzleOpen} onClose={() => setPuzzleOpen(false)} />

      <style>{`
        @keyframes tick-bullet { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes tick-blitz  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes tick-rapid  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          [style*="tick-"] { animation: none !important; }
        }
      `}</style>
    </>
  );
}