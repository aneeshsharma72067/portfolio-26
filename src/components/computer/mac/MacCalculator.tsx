import { useCalculator } from '@/os/useCalculator';

const FONT = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

/**
 * MacCalculator — the macOS Calculator, Basic mode.
 *
 * macOS-ONLY. Windows gets `WinCalculator`, a flat Fluent grid with a blue
 * `=` and a memory row. This is the pocket-calculator layout instead: round
 * keys, a light-grey top row, ORANGE operators down the right-hand column, a
 * double-width zero, and a display that is just a big right-aligned number with
 * no expression line above it.
 *
 * Only the arithmetic (`useCalculator`) is shared.
 */
export default function MacCalculator() {
  const calc = useCalculator();

  /* macOS keys are circles. Three fills: grey functions, dark digits, orange
     operators — the arrangement people recognise without being told. */
  const key =
    'grid aspect-square place-items-center rounded-full text-[17px] transition-all active:brightness-125';
  const digitKey = `${key} bg-[#4b4b4b] text-white hover:bg-[#5a5a5a]`;
  const functionKey = `${key} bg-[#6f6f6f] text-black hover:bg-[#7d7d7d]`;
  const operatorKey = `${key} bg-[#ff9f0a] text-white hover:bg-[#ffb340] text-[20px]`;

  return (
    <div
      className="flex h-full select-none flex-col bg-[#1c1c1e]/85 p-3 text-white"
      style={{ fontFamily: FONT }}
    >
      {/* ═════════════════════════════════════════════════════════ display */}
      <div className="flex min-h-[72px] shrink-0 items-end justify-end px-2 pb-3">
        <span
          className="w-full truncate text-right font-light leading-none tabular-nums"
          // macOS shrinks the type as the number grows; two steps is plenty.
          style={{ fontSize: calc.display.length > 9 ? 32 : 46 }}
        >
          {calc.display}
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════ keypad */}
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-2">
        <button onClick={calc.clear} className={functionKey}>
          {/* AC before any entry, C once something is typed — as macOS does. */}
          {calc.display === '0' && calc.pending === null ? 'AC' : 'C'}
        </button>
        <button onClick={calc.negate} className={functionKey}>
          ⁺∕₋
        </button>
        <button onClick={calc.percent} className={functionKey}>
          %
        </button>
        <button onClick={() => calc.inputOperator('÷')} className={operatorKey}>
          ÷
        </button>

        {['7', '8', '9'].map((d) => (
          <button key={d} onClick={() => calc.inputDigit(d)} className={digitKey}>
            {d}
          </button>
        ))}
        <button onClick={() => calc.inputOperator('×')} className={operatorKey}>
          ×
        </button>

        {['4', '5', '6'].map((d) => (
          <button key={d} onClick={() => calc.inputDigit(d)} className={digitKey}>
            {d}
          </button>
        ))}
        <button onClick={() => calc.inputOperator('-')} className={operatorKey}>
          −
        </button>

        {['1', '2', '3'].map((d) => (
          <button key={d} onClick={() => calc.inputDigit(d)} className={digitKey}>
            {d}
          </button>
        ))}
        <button onClick={() => calc.inputOperator('+')} className={operatorKey}>
          +
        </button>

        {/* The double-width zero — the detail that makes it read as macOS. */}
        <button
          onClick={() => calc.inputDigit('0')}
          className={`${digitKey} col-span-2 aspect-auto justify-self-stretch rounded-full`}
        >
          0
        </button>
        <button onClick={calc.inputDecimal} className={digitKey}>
          .
        </button>
        <button onClick={calc.equals} className={operatorKey}>
          =
        </button>
      </div>
    </div>
  );
}
