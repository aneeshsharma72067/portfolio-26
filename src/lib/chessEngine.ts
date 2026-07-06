/**
 * Minimal chess engine — just enough to power the "mate in 1" puzzle widget.
 *
 * Board representation:
 *   - An 8x8 grid stored as `Board = (Piece | null)[8][8]`.
 *   - `board[row][col]` where row 0 = rank 8 (top) and row 7 = rank 1 (bottom),
 *     col 0 = file a (left) and col 7 = file h (right). This matches how the
 *     board is rendered on screen (top-left origin).
 *
 * The engine implements standard movement rules for all six piece types
 * (pawn, knight, bishop, rook, queen, king), including:
 *   - Sliding-piece blocking (rook/bishop/queen stop at the first occupied square)
 *   - Captures (can land on an enemy piece, cannot land on a friendly one)
 *   - Check detection (is a given colour's king attacked?)
 *   - Legal-move filtering (a move is illegal if it leaves your own king in check)
 *   - Checkmate detection (side to move is in check and has no legal moves)
 *
 * It deliberately omits castling, en passant, and promotion — none of the
 * bundled puzzles require them, and keeping the engine small keeps the widget
 * dependency-free.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: Color;
}

export type Board = (Piece | null)[][];

export interface Square {
  row: number;
  col: number;
}

export interface Move {
  from: Square;
  to: Square;
}

// ---------------------------------------------------------------------------
// FEN parsing
// ---------------------------------------------------------------------------

/**
 * Parse the piece-placement field of a FEN string into a Board.
 * Only the board layout is consumed; side-to-move etc. are handled separately
 * in the puzzle definition.
 */
export function parseFen(fen: string): Board {
  const placement = fen.trim().split(' ')[0];
  const rows = placement.split('/');
  const board: Board = [];

  for (const rowStr of rows) {
    const row: (Piece | null)[] = [];
    for (const ch of rowStr) {
      if (/\d/.test(ch)) {
        // Digit = that many consecutive empty squares.
        for (let i = 0; i < parseInt(ch, 10); i++) row.push(null);
      } else {
        const color: Color = ch === ch.toUpperCase() ? 'w' : 'b';
        const type = ch.toLowerCase() as PieceType;
        row.push({ type, color });
      }
    }
    board.push(row);
  }
  return board;
}

// ---------------------------------------------------------------------------
// Board helpers
// ---------------------------------------------------------------------------

const inBounds = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

/** Deep-clone a board so moves can be simulated without mutating the original. */
export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

/** Apply a move to a copy of the board and return the new board. */
export function applyMove(board: Board, move: Move): Board {
  const next = cloneBoard(board);
  const piece = next[move.from.row][move.from.col];
  next[move.to.row][move.to.col] = piece;
  next[move.from.row][move.from.col] = null;
  return next;
}

const opposite = (color: Color): Color => (color === 'w' ? 'b' : 'w');

// ---------------------------------------------------------------------------
// Pseudo-legal move generation (ignores king safety)
// ---------------------------------------------------------------------------

// Direction vectors reused by sliding pieces and the king/knight.
const ROOK_DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];
const BISHOP_DIRS = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];
const KNIGHT_DELTAS = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
];

/**
 * Generate all pseudo-legal destination squares for the piece on (row, col).
 * "Pseudo-legal" = follows the piece's movement rules but does NOT check
 * whether the move leaves the mover's king in check.
 */
export function pseudoLegalMoves(board: Board, row: number, col: number): Square[] {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: Square[] = [];
  const { type, color } = piece;

  const canLand = (r: number, c: number) => {
    // Empty square or enemy piece is a valid landing square.
    const target = board[r][c];
    return !target || target.color !== color;
  };

  const slide = (dirs: number[][]) => {
    for (const [dr, dc] of dirs) {
      let r = row + dr;
      let c = col + dc;
      while (inBounds(r, c)) {
        const target = board[r][c];
        if (!target) {
          moves.push({ row: r, col: c });
        } else {
          if (target.color !== color) moves.push({ row: r, col: c }); // capture
          break; // blocked either way
        }
        r += dr;
        c += dc;
      }
    }
  };

  switch (type) {
    case 'p': {
      // White pawns move up the board (toward row 0), black pawns move down.
      const dir = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      const oneR = row + dir;

      // Forward one (must be empty).
      if (inBounds(oneR, col) && !board[oneR][col]) {
        moves.push({ row: oneR, col });
        // Forward two from the starting rank (both squares empty).
        const twoR = row + dir * 2;
        if (row === startRow && !board[twoR][col]) {
          moves.push({ row: twoR, col });
        }
      }
      // Diagonal captures.
      for (const dc of [-1, 1]) {
        const cr = row + dir;
        const cc = col + dc;
        if (inBounds(cr, cc)) {
          const target = board[cr][cc];
          if (target && target.color !== color) moves.push({ row: cr, col: cc });
        }
      }
      break;
    }
    case 'n': {
      for (const [dr, dc] of KNIGHT_DELTAS) {
        const r = row + dr;
        const c = col + dc;
        if (inBounds(r, c) && canLand(r, c)) moves.push({ row: r, col: c });
      }
      break;
    }
    case 'b':
      slide(BISHOP_DIRS);
      break;
    case 'r':
      slide(ROOK_DIRS);
      break;
    case 'q':
      slide([...ROOK_DIRS, ...BISHOP_DIRS]);
      break;
    case 'k': {
      for (const [dr, dc] of [...ROOK_DIRS, ...BISHOP_DIRS]) {
        const r = row + dr;
        const c = col + dc;
        if (inBounds(r, c) && canLand(r, c)) moves.push({ row: r, col: c });
      }
      break;
    }
  }

  return moves;
}

// ---------------------------------------------------------------------------
// Check / checkmate detection
// ---------------------------------------------------------------------------

/** Locate a colour's king on the board. */
function findKing(board: Board, color: Color): Square | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === color) return { row: r, col: c };
    }
  }
  return null;
}

/** Is `square` attacked by any piece of `byColor`? */
export function isSquareAttacked(board: Board, square: Square, byColor: Color): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== byColor) continue;
      const targets = pseudoLegalMoves(board, r, c);
      if (targets.some((t) => t.row === square.row && t.col === square.col)) return true;
    }
  }
  return false;
}

/** Is `color`'s king currently in check? */
export function isInCheck(board: Board, color: Color): boolean {
  const king = findKing(board, color);
  if (!king) return false;
  return isSquareAttacked(board, king, opposite(color));
}

/**
 * Generate all fully legal moves for `color` — pseudo-legal moves filtered so
 * that none leave the mover's own king in check.
 */
export function legalMoves(board: Board, color: Color): Move[] {
  const result: Move[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== color) continue;
      for (const to of pseudoLegalMoves(board, r, c)) {
        const move: Move = { from: { row: r, col: c }, to };
        const next = applyMove(board, move);
        if (!isInCheck(next, color)) result.push(move);
      }
    }
  }
  return result;
}

/** Legal destination squares for the single piece on (row, col). */
export function legalMovesFrom(board: Board, row: number, col: number): Square[] {
  const p = board[row][col];
  if (!p) return [];
  return pseudoLegalMoves(board, row, col)
    .filter((to) => {
      const next = applyMove(board, { from: { row, col }, to });
      return !isInCheck(next, p.color);
    });
}

/** Is `color` checkmated? (In check, and no legal move escapes it.) */
export function isCheckmate(board: Board, color: Color): boolean {
  return isInCheck(board, color) && legalMoves(board, color).length === 0;
}
