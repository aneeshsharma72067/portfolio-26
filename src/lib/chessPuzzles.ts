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
    // 1. Classic back-rank mate. The black king is boxed in by its own pawns
    //    (f7/g7/h7); the rook swings to a8 and there is no escape.
    id: 'back-rank',
    title: 'Back-rank mate',
    fen: '6k1/5ppp/8/8/8/8/8/R5K1 w',
    sideToMove: 'w',
    solution: { from: { row: 7, col: 0 }, to: { row: 0, col: 0 } }, // Ra1-a8#
  },
  {
    // 2. Queen mate with king support. Qg1-g7 sits next to the king on h8 and
    //    is defended by the white king on f6, so it cannot be captured.
    id: 'queen-support',
    title: 'Queen & king mate',
    fen: '7k/8/5K2/8/8/8/8/6Q1 w',
    sideToMove: 'w',
    solution: { from: { row: 7, col: 6 }, to: { row: 1, col: 6 } }, // Qg1-g7#
  },
  {
    // 3. Smothered mate. The black king on h8 is hemmed in by its own rook
    //    (g8) and pawns (g7/h7); Ng5-f7 gives check that cannot be answered.
    id: 'smothered',
    title: 'Smothered mate',
    fen: '6rk/6pp/8/6N1/8/8/8/K7 w',
    sideToMove: 'w',
    solution: { from: { row: 3, col: 6 }, to: { row: 1, col: 5 } }, // Ng5-f7#
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
