/**
 * Bundled "mate in 1" puzzles for the chess widget.
 *
 * Each puzzle is a legal position with White to move and a forced mate in one.
 * The player always plays White. `solution` is the one move that delivers
 * checkmate — but the widget does NOT hard-code it as the win condition:
 * ANY legal move the player makes is applied through the engine, and victory
 * is decided by `isCheckmate()`. The solution is used only for the "hint"
 * feature and for internal validation.
 *
 * Board / square convention matches src/lib/chessEngine.ts:
 *   row 0 = rank 8 (top), row 7 = rank 1 (bottom)
 *   col 0 = file a (left), col 7 = file h (right)
 */

import type { Move } from './chessEngine';

export interface Puzzle {
  id: string;
  /** Short human label, e.g. "Back-rank mate". */
  title: string;
  /** FEN piece-placement (only the board field is used). */
  fen: string;
  /** Side the player controls — always white for these puzzles. */
  sideToMove: 'w';
  /** The mating move (for hints / validation). */
  solution: Move;
}

export const PUZZLES: Puzzle[] = [
  {
    // Classic back-rank mate. Black king boxed by its own pawns; rook to a8.
    id: 'back-rank',
    title: 'Back-rank mate',
    fen: '6k1/5ppp/8/8/8/8/8/R5K1 w',
    sideToMove: 'w',
    solution: { from: { row: 7, col: 0 }, to: { row: 0, col: 0 } }, // Ra1-a8#
  },
  {
    // Queen sits on g7 next to the king, defended by the white king on f6.
    id: 'queen-support',
    title: 'Queen & king mate',
    fen: '7k/8/5K2/8/8/8/8/6Q1 w',
    sideToMove: 'w',
    solution: { from: { row: 7, col: 6 }, to: { row: 1, col: 6 } }, // Qg1-g7#
  },
  {
    // Smothered mate — king hemmed by own rook + pawns; knight to f7.
    id: 'smothered',
    title: 'Smothered mate',
    fen: '6rk/6pp/8/6N1/8/8/8/K7 w',
    sideToMove: 'w',
    solution: { from: { row: 3, col: 6 }, to: { row: 1, col: 5 } }, // Ng5-f7#
  },
  {
    // Ladder mate — rook on the 7th cuts the king; other rook swings to b8.
    id: 'ladder',
    title: 'Ladder mate',
    fen: '6k1/R7/8/8/8/8/8/1R2K3 w',
    sideToMove: 'w',
    solution: { from: { row: 7, col: 1 }, to: { row: 0, col: 1 } }, // Rb1-b8#
  },
  {
    // Queen back-rank — same idea as #1, queen instead of rook.
    id: 'queen-backrank',
    title: 'Queen back-rank',
    fen: '6k1/5ppp/8/8/8/8/8/3Q2K1 w',
    sideToMove: 'w',
    solution: { from: { row: 7, col: 3 }, to: { row: 0, col: 3 } }, // Qd1-d8#
  },
  {
    // Arabian mate — rook checks on the h-file, knight covers the escape.
    id: 'arabian',
    title: 'Arabian mate',
    fen: '7k/R7/5N2/8/8/8/8/7K w',
    sideToMove: 'w',
    solution: { from: { row: 1, col: 0 }, to: { row: 1, col: 7 } }, // Ra7-h7#
  },
  {
    // Scholar's mate pattern — Qxf7 with the bishop on c4 covering.
    id: 'scholars',
    title: "Scholar's mate",
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w',
    sideToMove: 'w',
    solution: { from: { row: 3, col: 7 }, to: { row: 1, col: 5 } }, // Qh5xf7#
  },
  {
    // Kill box — queen + king squeeze the lone black king.
    id: 'kill-box',
    title: 'Kill box',
    fen: '4k3/8/3Q1K2/8/8/8/8/8 w',
    sideToMove: 'w',
    solution: { from: { row: 2, col: 3 }, to: { row: 1, col: 4 } }, // Qd6-e7#
  },
  {
    // Bishop covers the long diagonal while the rook delivers on the back rank.
    id: 'bishop-rook',
    title: 'Bishop & rook',
    fen: '7k/6pp/8/8/8/8/6B1/R5K1 w',
    sideToMove: 'w',
    solution: { from: { row: 7, col: 0 }, to: { row: 0, col: 0 } }, // Ra1-a8#
  },
  {
    // Corridor mate — king trapped on the back rank by its own pawn + king.
    id: 'corridor',
    title: 'Corridor mate',
    fen: '1k6/1P6/1K6/8/8/8/8/7R w',
    sideToMove: 'w',
    solution: { from: { row: 7, col: 7 }, to: { row: 0, col: 7 } }, // Rh1-h8#
  },
];

/**
 * Pick a random puzzle. An optional `excludeId` avoids handing back the same
 * puzzle twice in a row when the user asks for a new one.
 */
export function randomPuzzle(excludeId?: string): Puzzle {
  const pool = excludeId ? PUZZLES.filter((p) => p.id !== excludeId) : PUZZLES;
  const list = pool.length ? pool : PUZZLES;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

/** Convert a {row,col} square to algebraic notation, e.g. {0,0} -> "a8". */
export function toAlgebraic(row: number, col: number): string {
  const file = String.fromCharCode('a'.charCodeAt(0) + col);
  const rank = 8 - row;
  return `${file}${rank}`;
}
