import { useEffect, useState } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import ChessPuzzleModal from './ChessPuzzleModal';
import ChessPiecesBg from '@/assets/image/chess-pieces.svg';

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

export default function ChessProfile() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ChessStats>({ blitz: 1680, rapid: 1720, bullet: 1540 });
  const [loading, setLoading] = useState(true);
  const [puzzleOpen, setPuzzleOpen] = useState(false);

  // Fetch stats from Chess.com public API.
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
        // Fallback gracefully on rate limit.
        setLoading(false);
      });
  }, []);

  // Build the 8x8 decorative preview board.
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
              className={`text-[22px] leading-none font-bold ${
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
      <div className="relative flex items-center gap-5 overflow-hidden rounded-soft border border-[#81b64c]/20 bg-[#272522] px-5 py-3.5 transition-all duration-300 hover:border-[#81b64c]/40">
        {/*
          Background vector art: the chess-pieces SVG rendered as a CSS mask so
          it can be tinted a light shade of the card background. Using `mask`
          (rather than an <img>) lets us paint it with a solid colour, so it
          blends in as subtle background art instead of a hard black graphic.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -bottom-8 h-44 w-44 select-none bg-white/[0.05]"
          style={{
            WebkitMaskImage: `url(${ChessPiecesBg})`,
            maskImage: `url(${ChessPiecesBg})`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />

        {/* Chess Stats Profile */}
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

          {/* Ratings row */}
          <div className="mt-3 flex items-stretch divide-x divide-white/10 font-mono">
            <div className="pr-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#81b64c]">
                {t('chessBlitz')}
              </p>
              <p className="mt-1 text-lg font-bold leading-none text-white">
                {loading ? '—' : stats.blitz}
              </p>
            </div>
            <div className="px-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#81b64c]">
                {t('chessRapid')}
              </p>
              <p className="mt-1 text-lg font-bold leading-none text-white">
                {loading ? '—' : stats.rapid}
              </p>
            </div>
            <div className="pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#81b64c]">
                {t('chessBullet')}
              </p>
              <p className="mt-1 text-lg font-bold leading-none text-white">
                {loading ? '—' : stats.bullet}
              </p>
            </div>
          </div>
        </div>

        {/* Divider between profile and puzzle */}
        <div className="relative z-10 hidden h-16 w-px shrink-0 bg-white/10 sm:block" />

        {/* Clickable puzzle preview — opens the interactive puzzle window. */}
        <button
          onClick={() => setPuzzleOpen(true)}
          className="group/puzzle relative z-10 flex shrink-0 flex-col items-center outline-none"
          title={t('chessPuzzle')}
        >
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#b2b1b0] transition-colors group-hover/puzzle:text-[#81b64c]">
            <span>{t('chessPuzzle')}</span>
          </div>

          <div
            className="relative grid grid-cols-8 grid-rows-8 overflow-hidden rounded border border-[#454340] shadow-floating transition-all duration-300 group-hover/puzzle:border-[#81b64c] group-hover/puzzle:shadow-[0_0_0_2px_rgba(129,182,76,0.35)]"
            style={{ width: '152px', height: '152px' }}
          >
            {boardCells}

            {/* Hover "play" affordance overlay. */}
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover/puzzle:bg-black/45 group-hover/puzzle:opacity-100">
              <span className="rounded bg-[#81b64c] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
                {t('chessSolve')}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Interactive, rule-checked puzzle window. */}
      <ChessPuzzleModal open={puzzleOpen} onClose={() => setPuzzleOpen(false)} />
    </>
  );
}
