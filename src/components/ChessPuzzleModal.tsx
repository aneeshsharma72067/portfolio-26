import { useEffect, useMemo, useState } from 'react';
import { X, RefreshCw, Lightbulb, Trophy } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';
import {
  parseFen,
  applyMove,
  legalMovesFrom,
  isCheckmate,
  isInCheck,
  type Board,
  type Square,
} from '@/lib/chessEngine';
import { PUZZLES, randomPuzzle, toAlgebraic, type Puzzle } from '@/lib/chessPuzzles';

// Unicode glyphs for each piece type, keyed by colour.
const GLYPHS: Record<string, string> = {
  wk: '♚', wq: '♛', wr: '♜', wb: '♝', wn: '♞', wp: '♟',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Full-size interactive chess puzzle window.
 *
 * Renders a random "mate in 1" puzzle on an 8x8 board. The player (White)
 * clicks a piece to select it, sees its legal destinations as dots, then clicks
 * a destination to move. Legality and the win condition are decided entirely by
 * the engine (src/lib/chessEngine.ts) — the puzzle's stored solution is used
 * only for the optional hint, so any legal mating move counts as a solve.
 *
 * The window mounts/unmounts around a CSS transition so it animates smoothly
 * both in and out.
 */
export default function ChessPuzzleModal({ open, onClose }: Props) {
  const { t } = useTranslation();

  // `mounted` keeps the node in the DOM during the exit animation; `visible`
  // drives the enter/exit CSS transition one tick after mount.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const [puzzle, setPuzzle] = useState<Puzzle>(() => randomPuzzle());
  const [board, setBoard] = useState<Board>(() => parseFen(puzzle.fen));
  const [selected, setSelected] = useState<Square | null>(null);
  const [status, setStatus] = useState<'playing' | 'solved' | 'wrong'>('playing');
  const [showHint, setShowHint] = useState(false);

  // Legal destinations for the currently selected piece.
  const targets = useMemo(
    () => (selected ? legalMovesFrom(board, selected.row, selected.col) : []),
    [board, selected]
  );

  // Load a fresh puzzle into local state.
  const loadPuzzle = (pz: Puzzle) => {
    setPuzzle(pz);
    setBoard(parseFen(pz.fen));
    setSelected(null);
    setStatus('playing');
    setShowHint(false);
  };

  // Drive the enter/exit animation off the `open` prop.
  useEffect(() => {
    if (open) {
      setMounted(true);
      loadPuzzle(randomPuzzle()); // fresh puzzle every time it opens
      // Next frame: flip to visible so the transition runs.
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const id = setTimeout(() => setMounted(false), 300); // match transition duration
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on Escape for accessibility.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Short celebratory tone on solve (zero-dependency Web Audio).
  const playCheckSound = () => {
    try {
      const actx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, actx.currentTime); // E5
      gain.gain.setValueAtTime(0.08, actx.currentTime);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.4);
      osc.stop(actx.currentTime + 0.4);
    } catch {
      /* audio is best-effort */
    }
  };

  const handleSquareClick = (row: number, col: number) => {
    if (status === 'solved') return;

    const piece = board[row][col];

    // No selection yet: pick up one of the player's own (white) pieces.
    if (!selected) {
      if (piece && piece.color === 'w') setSelected({ row, col });
      return;
    }

    // Re-clicking the selected square, or another white piece, re-selects.
    if (piece && piece.color === 'w') {
      setSelected(row === selected.row && col === selected.col ? null : { row, col });
      return;
    }

    // Is the clicked square a legal destination for the selected piece?
    const isTarget = targets.some((sq) => sq.row === row && sq.col === col);
    if (!isTarget) {
      setSelected(null);
      return;
    }

    // Apply the move through the engine and judge the result.
    const next = applyMove(board, { from: selected, to: { row, col } });
    setBoard(next);
    setSelected(null);

    if (isCheckmate(next, 'b')) {
      setStatus('solved');
      playCheckSound();
    } else {
      // Legal but not mate — flash "not mate" and reset the position shortly.
      setStatus('wrong');
      setTimeout(() => {
        setBoard(parseFen(puzzle.fen));
        setStatus('playing');
      }, 900);
    }
  };

  const [particles, setParticles] = useState<{ id: number; char: string; left: number; delay: number; scale: number }[]>([]);

  // Generate ASCII chess confetti particles when solved
  useEffect(() => {
    if (status === 'solved') {
      const chars = ['♞', '♝', '♜', '♟', '♛', '♚'];
      const pArr = Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        char: chars[Math.floor(Math.random() * chars.length)],
        left: Math.random() * 92, // pad horizontal bounds
        delay: Math.random() * 1.5,
        scale: 0.6 + Math.random() * 0.8,
      }));
      setParticles(pArr);
    } else {
      setParticles([]);
    }
  }, [status]);

  if (!mounted) return null;

  const blackInCheck = isInCheck(board, 'b');

  return (
    <div
      // Backdrop
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Window */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full max-w-sm rounded-soft border border-[#81b64c]/30 bg-[#272522] p-5 shadow-floating transition-all duration-300 ${
          visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-headline text-base font-bold text-white">{t('chessPuzzle')}</h3>
            <p className="mt-0.5 text-[11px] font-medium text-[#b2b1b0]">{puzzle.title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#b2b1b0] transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Board */}
        <div className="relative overflow-hidden rounded border border-[#454340] shadow-floating">
          <div className="grid aspect-square w-full grid-cols-8 grid-rows-8">
            {board.map((rowArr, row) =>
              rowArr.map((piece, col) => {
                const isDark = (row + col) % 2 === 1;
                const isSel = selected?.row === row && selected?.col === col;
                const isTarget = targets.some((sq) => sq.row === row && sq.col === col);
                return (
                  <div
                    key={`${row}-${col}`}
                    onClick={() => handleSquareClick(row, col)}
                    className="relative flex cursor-pointer select-none items-center justify-center transition-colors"
                    style={{
                      backgroundColor: isSel
                        ? '#baca44'
                        : isDark
                        ? '#769656'
                        : '#eeeed2',
                    }}
                  >
                    {piece && (
                      <span
                        className={`z-10 text-[clamp(18px,6vw,30px)] leading-none font-bold ${
                          piece.color === 'w'
                            ? 'text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.85)]'
                            : 'text-[#1e1e1e] drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]'
                        }`}
                      >
                        {GLYPHS[`${piece.color}${piece.type}`]}
                      </span>
                    )}
                    {/* Legal-move indicator: ring on captures, dot on empties. */}
                    {isTarget &&
                      (piece ? (
                        <div className="absolute inset-1 rounded-full border-[3px] border-black/25" />
                      ) : (
                        <div className="absolute h-1/4 w-1/4 rounded-full bg-black/20" />
                      ))}
                  </div>
                );
              })
            )}
          </div>

          {/* Solved overlay with floating ASCII chess confetti */}
          {status === 'solved' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 animate-pop-in overflow-hidden">
              {particles.map((p) => (
                <span
                  key={p.id}
                  className="absolute pointer-events-none select-none text-[#81b64c]/20"
                  style={{
                    left: `${p.left}%`,
                    bottom: '-20px',
                    fontSize: `${Math.round(p.scale * 20)}px`,
                    animation: `chessFloatUp 2.5s ease-in-out ${p.delay}s infinite`,
                    willChange: 'transform',
                  }}
                >
                  {p.char}
                </span>
              ))}

              <Trophy className="mb-2 h-9 w-9 animate-bounce text-[#81b64c] z-10" />
              <span className="text-sm font-bold uppercase tracking-wider text-[#81b64c] z-10">
                {t('chessCheckmate')}
              </span>
              <button
                onClick={() => loadPuzzle(randomPuzzle(puzzle.id))}
                className="mt-3 rounded bg-[#81b64c] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#95ca5c] z-10"
              >
                {t('chessNext')}
              </button>
            </div>
          )}
        </div>

        {/* CSS Confetti keyframes */}
        <style>{`
          @keyframes chessFloatUp {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            15% { opacity: 0.8; }
            85% { opacity: 0.8; }
            100% { transform: translateY(-380px) rotate(360deg); opacity: 0; }
          }
        `}</style>

        {/* Status line */}
        <p className="mt-3 h-4 text-center text-[11px] font-medium">
          {status === 'wrong' ? (
            <span className="text-[#e0796f]">{t('chessNotMate')}</span>
          ) : blackInCheck && status === 'playing' ? (
            <span className="text-[#81b64c]">{t('chessCheck')}</span>
          ) : (
            <span className="text-[#b2b1b0]">{t('chessFindMate')}</span>
          )}
        </p>

        {/* Controls */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={() => setShowHint((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-[#b2b1b0] transition-colors hover:border-[#81b64c]/40 hover:text-white"
          >
            <Lightbulb size={13} />
            {t('chessHint')}
          </button>
          <button
            onClick={() => loadPuzzle(randomPuzzle(puzzle.id))}
            className="inline-flex items-center gap-1.5 rounded border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-[#b2b1b0] transition-colors hover:border-[#81b64c]/40 hover:text-white"
          >
            <RefreshCw size={13} />
            {t('chessNext')}
          </button>
        </div>

        {/* Hint text */}
        {showHint && status !== 'solved' && (
          <p className="mt-2 text-center text-[11px] text-[#81b64c] animate-pop-in">
            {toAlgebraic(puzzle.solution.from.row, puzzle.solution.from.col)} →{' '}
            {toAlgebraic(puzzle.solution.to.row, puzzle.solution.to.col)}
          </p>
        )}
      </div>
    </div>
  );
}
