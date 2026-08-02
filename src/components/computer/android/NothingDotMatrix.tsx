/**
 * NothingDotMatrix — renders a string as a dot-matrix LED grid display.
 *
 * Each character is drawn on a 3×5 grid of circular dots, reproducing the
 * signature Nothing OS clock aesthetic. Inactive dots render at low opacity
 * to simulate unlit LED matrix cells, exactly like the Ndot typeface on a
 * real Nothing Phone lock screen.
 *
 * Supports: digits 0–9, colon, space, hyphen, period.
 */

/* ── 3×5 glyph bitmaps ────────────────────────────────────────── */

const GLYPHS: Record<string, number[][]> = {
  '0': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  '1': [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2': [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
  '3': [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
  '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
  '5': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
  '6': [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
  '7': [[1,1,1],[0,0,1],[0,0,1],[0,1,0],[0,1,0]],
  '8': [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
  '9': [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
  ':': [[0],[1],[0],[1],[0]],
  ' ': [[0],[0],[0],[0],[0]],
  '-': [[0,0,0],[0,0,0],[1,1,1],[0,0,0],[0,0,0]],
  '.': [[0],[0],[0],[0],[1]],
};

type Props = {
  /** The string to render (digits, colons, spaces, hyphens, periods). */
  text: string;
  /** Diameter of each dot in pixels. Default 6. */
  dotSize?: number;
  /** Gap between dots in pixels. Default 3. */
  gap?: number;
  /** CSS colour for lit dots. Default '#FFFFFF'. */
  color?: string;
  /** CSS colour for unlit dots. Default 'rgba(255,255,255,0.06)'. */
  dimColor?: string;
};

export default function NothingDotMatrix({
  text,
  dotSize = 6,
  gap = 3,
  color = '#FFFFFF',
  dimColor = 'rgba(255,255,255,0.06)',
}: Props) {
  const step = dotSize + gap;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: `${dotSize}px` }}>
      {text.split('').map((ch, ci) => {
        const glyph = GLYPHS[ch];
        if (!glyph) return null;

        const cols = glyph[0].length;
        const rows = glyph.length;
        const w = cols * dotSize + Math.max(0, cols - 1) * gap;
        const h = rows * dotSize + Math.max(0, rows - 1) * gap;

        return (
          <svg key={ci} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {glyph.map((row, ry) =>
              row.map((on, cx) => (
                <circle
                  key={`${ry}-${cx}`}
                  cx={cx * step + dotSize / 2}
                  cy={ry * step + dotSize / 2}
                  r={dotSize / 2}
                  fill={on ? color : dimColor}
                />
              ))
            )}
          </svg>
        );
      })}
    </div>
  );
}
