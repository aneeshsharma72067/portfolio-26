import { useEffect } from 'react';
import { Menu, History } from 'lucide-react';
import { useCalculator, __calcSelfCheck, type Operator } from '@/os/useCalculator';

const FONT = "'Segoe UI VF', 'Segoe UI Variable', 'Segoe UI', sans-serif";

/**
 * WinCalculator — Windows 11 Calculator, Standard mode.
 *
 * WINDOWS-ONLY. macOS gets `MacCalculator`, which is the grey-and-orange
 * pocket-calculator layout. This one is Fluent: a flat dark grid of equal
 * rounded tiles, a hamburger + "Standard" title bar, the memory row, and a blue
 * accent on `=` alone. The two share only the arithmetic (`useCalculator`).
 */
export default function WinCalculator() {
  const calc = useCalculator();

  useEffect(() => {
    if (import.meta.env.DEV) __calcSelfCheck();
  }, []);

  /* Windows tiles are all the same size; only the fill differs by role. */
  const tile =
    'grid place-items-center rounded-[4px] text-[16px] font-normal transition-colors active:scale-[0.98]';
  const numberTile = `${tile} bg-[#3b3b3b] text-white hover:bg-[#454545]`;
  const functionTile = `${tile} bg-[#323232] text-white/90 hover:bg-[#3d3d3d] text-[14px]`;
  const equalsTile = `${tile} bg-[#0078d4] text-white hover:bg-[#0086ef] font-medium`;

  /** The keypad, row by row, exactly as Windows lays it out. */
  const rows: { label: string; cls: string; press: () => void }[][] = [
    [
      { label: '%', cls: functionTile, press: calc.percent },
      { label: 'CE', cls: functionTile, press: calc.clearEntry },
      { label: 'C', cls: functionTile, press: calc.clear },
      { label: '⌫', cls: functionTile, press: calc.backspace },
    ],
    [
      { label: '¹⁄ₓ', cls: functionTile, press: () => calc.unary('reciprocal') },
      { label: 'x²', cls: functionTile, press: () => calc.unary('square') },
      { label: '²√x', cls: functionTile, press: () => calc.unary('sqrt') },
      { label: '÷', cls: functionTile, press: () => calc.inputOperator('÷') },
    ],
    [
      { label: '7', cls: numberTile, press: () => calc.inputDigit('7') },
      { label: '8', cls: numberTile, press: () => calc.inputDigit('8') },
      { label: '9', cls: numberTile, press: () => calc.inputDigit('9') },
      { label: '×', cls: functionTile, press: () => calc.inputOperator('×') },
    ],
    [
      { label: '4', cls: numberTile, press: () => calc.inputDigit('4') },
      { label: '5', cls: numberTile, press: () => calc.inputDigit('5') },
      { label: '6', cls: numberTile, press: () => calc.inputDigit('6') },
      { label: '−', cls: functionTile, press: () => calc.inputOperator('-') },
    ],
    [
      { label: '1', cls: numberTile, press: () => calc.inputDigit('1') },
      { label: '2', cls: numberTile, press: () => calc.inputDigit('2') },
      { label: '3', cls: numberTile, press: () => calc.inputDigit('3') },
      { label: '+', cls: functionTile, press: () => calc.inputOperator('+') },
    ],
    [
      { label: '±', cls: numberTile, press: calc.negate },
      { label: '0', cls: numberTile, press: () => calc.inputDigit('0') },
      { label: '.', cls: numberTile, press: calc.inputDecimal },
      { label: '=', cls: equalsTile, press: calc.equals },
    ],
  ];

  return (
    <div
      className="flex h-full select-none flex-col bg-[#202020] text-white"
      style={{ fontFamily: FONT }}
    >
      {/* ══════════════════════════════════════════════════════════ header */}
      <div className="flex h-10 shrink-0 items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <button className="rounded p-1.5 text-white/70 transition-colors hover:bg-white/10">
            <Menu size={15} />
          </button>
          <span className="text-[15px] font-semibold">Standard</span>
        </div>
        <button className="rounded p-1.5 text-white/70 transition-colors hover:bg-white/10">
          <History size={15} />
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════ display */}
      <div className="flex shrink-0 flex-col items-end gap-1 px-4 pb-3 pt-1">
        <span className="h-4 text-[12px] text-white/45">{calc.expression}</span>
        <span className="w-full truncate text-right text-[38px] font-semibold leading-none tabular-nums">
          {calc.display}
        </span>
      </div>

      {/* Memory row — greyed out, exactly as it is before you store anything. */}
      <div className="flex shrink-0 items-center justify-between px-3 pb-2 text-[11.5px] text-white/25">
        {['MC', 'MR', 'M+', 'M−', 'MS', 'M˅'].map((m) => (
          <span key={m} className="px-2 py-1">
            {m}
          </span>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════ keypad */}
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-1 p-1.5">
        {rows.flat().map((btn, i) => (
          <button key={`${btn.label}-${i}`} onClick={btn.press} className={btn.cls}>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Re-exported so the app router can hint the type without importing the hook. */
export type { Operator };
