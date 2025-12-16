import React, { useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export const BackgroundRippleEffect = ({
  rows = 8,
  cols = 27,
  cellSize = 56,
}: {
  rows?: number;
  cols?: number;
  cellSize?: number;
}) => {
  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={cn(
        'absolute inset-0 h-full w-full overflow-hidden',
        '[--cell-border-color:#18535e] [--cell-fill-color:#20283c] [--cell-shadow-color:var(--color-neutral-700)]',
        'dark:[--cell-border-color:var(--color-neutral-800)] dark:[--cell-fill-color:var(--color-neutral-900)] dark:[--cell-shadow-color:var(--color-neutral-950)]'
      )}
    >
      <div className='relative h-auto w-auto overflow-hidden'>
        <div className='pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden' />
        <DivGrid
          key={`base-${rippleKey}`}
          className='mask-radial-from-20% mask-radial-at-top opacity-60'
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          borderColor='var(--cell-border-color)'
          fillColor='var(--cell-fill-color)'
          clickedCell={clickedCell}
          onCellClick={(row, col) => {
            setClickedCell({ row, col });
            setRippleKey((k) => k + 1);
          }}
          interactive
        />
        {/* Gradient fade overlay for edges, especially bottom */}
        {/* <div
          className='pointer-events-none absolute inset-0 z-[4] h-full w-full'
          style={{
            background: `radial-gradient(ellipse 90% 120% at 50% 100%, transparent 0%, transparent 30%, hsl(var(--background) / 0.3) 50%, hsl(var(--background) / 0.7) 70%, hsl(var(--background)) 100%)`,
          }}
        /> */}
        {/* Side edge fades */}
        {/* <div
          className='pointer-events-none absolute inset-0 z-[4] h-full w-full'
          style={{
            background: `linear-gradient(to right, hsl(var(--background)) 0%, transparent 0%, transparent 0%, hsl(var(--background)) 100%)`,
          }}
        /> */}
        {/* Top fade for smooth transition */}
        <div
          className='pointer-events-none absolute inset-0 z-[4] h-full w-full'
          style={{
            background: `radial-gradient(ellipse 100% 60% at 50% 40%, transparent 0%, transparent 10%, hsl(var(--background) / 0.5) 80%, hsl(var(--background)) 100%)`,
          }}
        />
      </div>
    </div>
  );
};

type DivGridProps = {
  className?: string;
  rows: number;
  cols: number;
  cellSize: number; // in pixels
  borderColor: string;
  fillColor: string;
  clickedCell: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
};

type CellStyle = React.CSSProperties & {
  ['--delay']?: string;
  ['--duration']?: string;
};

const DivGrid = ({
  className,
  rows = 7,
  cols = 30,
  cellSize = 56,
  borderColor = '#3f3f46',
  fillColor = 'rgba(14,165,233,0.3)',
  clickedCell = null,
  onCellClick = () => {},
  interactive = true,
}: DivGridProps) => {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols]
  );

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, minmax(0, ${cellSize}px))`,
    gridTemplateRows: `repeat(${rows}, minmax(0, ${cellSize}px))`,
    width: '100%',
    maxWidth: cols * cellSize,
    height: rows * cellSize,
    marginInline: 'auto',
  };

  return (
    <div className={cn('relative z-[3]', className)} style={gridStyle}>
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols);
        const colIdx = idx % cols;
        const distance = clickedCell
          ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
          : 0;
        const delay = clickedCell ? Math.max(0, distance * 55) : 0; // ms
        const duration = 200 + distance * 80; // ms

        const style: CellStyle = clickedCell
          ? {
              '--delay': `${delay}ms`,
              '--duration': `${duration}ms`,
            }
          : {};

        return (
          <div
            key={idx}
            className={cn(
              'cell relative border-[0.5px] opacity-40 transition-opacity duration-150 will-change-transform hover:opacity-80 dark:shadow-[0px_0px_40px_1px_var(--cell-shadow-color)_inset]',
              clickedCell && 'animate-cell-ripple [animation-fill-mode:none]',
              !interactive && 'pointer-events-none'
            )}
            style={{
              backgroundColor: fillColor,
              borderColor: borderColor,
              ...style,
            }}
            onClick={
              interactive ? () => onCellClick?.(rowIdx, colIdx) : undefined
            }
          />
        );
      })}
    </div>
  );
};
