import { useEffect, useState } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { Trophy, RefreshCw } from 'lucide-react';

interface ChessStats {
  blitz: number;
  rapid: number;
  bullet: number;
}

// Coordinate mappings for 8x8 grid: col 0-7 (a-h), row 0-7 (8-1)
interface Piece {
  type: 'K' | 'Q' | 'R'; // King, Queen, Rook
  color: 'w' | 'b';      // White, Black
  col: number;
  row: number;
}

const INITIAL_PIECES: Piece[] = [
  { type: 'K', color: 'b', col: 7, row: 0 }, // Black King on h8
  { type: 'R', color: 'w', col: 5, row: 1 }, // White Rook on f7 (defends g7)
  { type: 'Q', color: 'w', col: 6, row: 2 }, // White Queen on g6
];

export default function ChessProfile() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ChessStats>({ blitz: 1680, rapid: 1720, bullet: 1540 });
  const [pieces, setPieces] = useState<Piece[]>(INITIAL_PIECES);
  const [selectedPieceIdx, setSelectedPieceIdx] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch stats from Chess.com public API
  useEffect(() => {
    fetch('https://api.chess.com/pub/player/aneesh1024/stats')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then((data) => {
        setStats({
          blitz: data.chess_blitz?.last?.rating || 1680,
          rapid: data.chess_rapid?.last?.rating || 1720,
          bullet: data.chess_bullet?.last?.rating || 1540,
        });
        setLoading(false);
      })
      .catch(() => {
        // Fallback gracefully on rate limit
        setLoading(false);
      });
  }, []);

  const handleCellClick = (col: number, row: number) => {
    if (solved) return;

    // Find if there is a piece on clicked cell
    const clickedPieceIdx = pieces.findIndex((p) => p.col === col && p.row === row);

    if (selectedPieceIdx === null) {
      // Select White Queen
      if (clickedPieceIdx !== -1 && pieces[clickedPieceIdx].color === 'w' && pieces[clickedPieceIdx].type === 'Q') {
        setSelectedPieceIdx(clickedPieceIdx);
      }
    } else {
      const selectedPiece = pieces[selectedPieceIdx];

      // If clicked another white piece, switch selection
      if (clickedPieceIdx !== -1 && pieces[clickedPieceIdx].color === 'w') {
        if (pieces[clickedPieceIdx].type === 'Q') {
          setSelectedPieceIdx(clickedPieceIdx);
        } else {
          setSelectedPieceIdx(null);
        }
        return;
      }

      // Check if moving Queen to g7 (col 6, row 1) -> Solution!
      if (selectedPiece.type === 'Q' && col === 6 && row === 1) {
        // Move piece
        const updated = [...pieces];
        updated[selectedPieceIdx] = { ...selectedPiece, col, row };
        setPieces(updated);
        setSelectedPieceIdx(null);
        setSolved(true);

        // Sound effect (optional audio synthesis, standard browser beep is fun and zero-dependency!)
        try {
          const actx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = actx.createOscillator();
          const gain = actx.createGain();
          osc.connect(gain);
          gain.connect(actx.destination);
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, actx.currentTime); // C5 check sound
          gain.gain.setValueAtTime(0.08, actx.currentTime);
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.35);
          osc.stop(actx.currentTime + 0.35);
        } catch {}
      } else {
        // Invalid move or non-solution, reset selection
        setSelectedPieceIdx(null);
      }
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setPieces(INITIAL_PIECES);
    setSelectedPieceIdx(null);
    setSolved(false);
  };

  const getPieceSymbol = (p: Piece) => {
    if (p.color === 'w') {
      return p.type === 'Q' ? '♛' : '♜';
    }
    return '♚';
  };

  // Render 8x8 Board
  const boardCells = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isDark = (row + col) % 2 === 1;
      const piece = pieces.find((p) => p.col === col && p.row === row);
      const isSelected = selectedPieceIdx !== null && pieces[selectedPieceIdx].col === col && pieces[selectedPieceIdx].row === row;

      // Show move helper dots if Queen is selected
      const isLegalTarget = selectedPieceIdx !== null && pieces[selectedPieceIdx].type === 'Q' && col === 6 && (row === 1 || row === 2);

      boardCells.push(
        <div
          key={`${col}-${row}`}
          onClick={() => handleCellClick(col, row)}
          className="relative flex items-center justify-center transition-colors cursor-pointer select-none"
          style={{
            backgroundColor: isSelected
              ? '#baca44' // selected chess.com yellow highlight
              : isDark
              ? '#769656' // chess.com dark green
              : '#eeeed2', // chess.com light cream
          }}
        >
          {/* Piece */}
          {piece && (
            <span
              className={`text-[20px] font-bold z-10 transition-all duration-300 ${
                piece.color === 'w'
                  ? 'text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.85)]'
                  : 'text-[#1e1e1e] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]'
              }`}
            >
              {getPieceSymbol(piece)}
            </span>
          )}

          {/* Valid move indicator dot */}
          {isLegalTarget && !piece && (
            <div className="absolute w-3 h-3 rounded-full bg-black/15 z-20 hover:bg-black/25" />
          )}
        </div>
      );
    }
  }

  return (
    <div
      className="flex items-center gap-4 rounded-soft border border-[#81b64c]/20 bg-[#272522] p-4 transition-all duration-300 hover:border-[#81b64c]/40"
      style={{ minHeight: '80px' }}
    >
      {/* Chess Stats Profile */}
      <div className="min-w-0 flex-1">
        <a
          href="https://www.chess.com/member/aneesh1024"
          target="_blank"
          rel="noopener noreferrer"
          className="group/chess flex items-center gap-2"
        >
          <svg className="w-5 h-5 fill-[#81b64c] shrink-0" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-3.4 15.3c-.6.3-1.3.4-1.9.4-.8 0-1.5-.2-2.1-.6-.6-.4-1-1-1.2-1.7-.2-.7-.1-1.5.3-2.1.4-.6.9-1.1 1.6-1.3.7-.2 1.5-.1 2.1.3.6.4 1 1 1.2 1.7.2.7.1 1.5-.3 2.1-.4.6-1 1-1.7 1.2M12 9.7l-2.8-2.8 1.4-1.4L12 6.9l1.4-1.4 1.4 1.4L12 9.7z" />
          </svg>
          <span className="font-headline text-sm font-bold text-white group-hover/chess:text-[#81b64c] transition-colors">
            aneesh1024
          </span>
        </a>

        {/* Ratings grid */}
        <div className="mt-2.5 grid grid-cols-3 gap-2 font-mono text-[10px] uppercase text-[#b2b1b0]">
          <div>
            <p className="font-semibold text-[#81b64c]">{t('chessBlitz')}</p>
            <p className="mt-0.5 text-xs font-bold text-white">
              {loading ? '...' : stats.blitz}
            </p>
          </div>
          <div>
            <p className="font-semibold text-[#81b64c]">{t('chessRapid')}</p>
            <p className="mt-0.5 text-xs font-bold text-white">
              {loading ? '...' : stats.rapid}
            </p>
          </div>
          <div>
            <p className="font-semibold text-[#81b64c]">{t('chessBullet')}</p>
            <p className="mt-0.5 text-xs font-bold text-white">
              {loading ? '...' : stats.bullet}
            </p>
          </div>
        </div>
      </div>

      {/* Mini Interactive Puzzle Grid */}
      <div className="relative flex flex-col items-center shrink-0">
        <div className="text-[9px] uppercase font-bold tracking-wider text-[#b2b1b0] mb-1 flex items-center gap-1.5">
          <span>{t('chessPuzzle')}</span>
          {solved && (
            <button
              onClick={handleReset}
              className="text-[#81b64c] hover:text-white transition-colors"
              title={t('chessReset')}
            >
              <RefreshCw size={10} className="animate-spin-once" />
            </button>
          )}
        </div>

        {/* 8x8 grid layout */}
        <div
          className="relative grid grid-cols-8 grid-rows-8 border border-[#454340] rounded overflow-hidden shadow-floating"
          style={{ width: '136px', height: '136px' }}
        >
          {boardCells}

          {/* Solved overlay banner */}
          {solved && (
            <div className="absolute inset-0 bg-[#000000]/80 z-30 flex flex-col items-center justify-center p-1 animate-in fade-in zoom-in-95 duration-200">
              <Trophy className="w-5 h-5 text-[#81b64c] mb-1 animate-bounce" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#81b64c]">
                {t('chessCheckmate')}
              </span>
              <button
                onClick={handleReset}
                className="mt-1.5 rounded bg-[#81b64c] hover:bg-[#95ca5c] text-[8px] font-bold uppercase tracking-wide text-white px-2 py-0.5 transition-colors"
              >
                {t('chessReset')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
