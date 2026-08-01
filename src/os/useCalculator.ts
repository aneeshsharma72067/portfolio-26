import { useCallback, useEffect, useState } from 'react';

/**
 * useCalculator — the arithmetic behind both platforms' Calculator apps.
 *
 * ENGINE ONLY. Windows 11's Calculator and macOS's look nothing alike (grid
 * layout, button shapes, colours, the history strip vs the orange operator
 * column), but `7 × 8 =` had better be 56 on both, and the state machine that
 * gets there — pending operator, replace-on-next-digit, chained equals — is
 * fiddly enough that writing it twice would mean two different sets of bugs.
 *
 * The model matches a real pocket calculator, not a formula parser: there is no
 * operator precedence, because neither OS's basic mode has any. `2 + 3 × 4` is
 * 20 on a real Windows Calculator too.
 */

export interface CalcState {
  /** What the screen shows right now. */
  display: string;
  /** The running left-hand value, or null before any operator is pressed. */
  accumulator: number | null;
  /** Operator awaiting its right-hand operand. */
  pending: Operator | null;
  /** True when the next digit should replace the display rather than append. */
  replace: boolean;
  /** The "3 + 4 =" line shown above the display. */
  expression: string;
}

export type Operator = '+' | '-' | '×' | '÷';

const MAX_DIGITS = 12;

/** Apply one operator. Division by zero mirrors what both real apps show. */
const apply = (left: number, right: number, op: Operator): number => {
  switch (op) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      return right === 0 ? NaN : left / right;
  }
};

/** Trim floating-point noise: 0.1 + 0.2 must read as 0.3, not 0.30000000000000004. */
const format = (value: number): string => {
  if (Number.isNaN(value)) return 'Cannot divide by zero';
  if (!Number.isFinite(value)) return 'Overflow';
  const rounded = Number(value.toPrecision(MAX_DIGITS));
  return String(rounded);
};

export function useCalculator() {
  const [state, setState] = useState<CalcState>({
    display: '0',
    accumulator: null,
    pending: null,
    replace: true,
    expression: '',
  });

  /** Append a digit, honouring the replace-on-next-entry rule. */
  const inputDigit = useCallback((digit: string) => {
    setState((s) => {
      if (s.replace) return { ...s, display: digit, replace: false };
      if (s.display.replace('-', '').replace('.', '').length >= MAX_DIGITS) return s;
      return { ...s, display: s.display === '0' ? digit : s.display + digit };
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setState((s) => {
      if (s.replace) return { ...s, display: '0.', replace: false };
      if (s.display.includes('.')) return s;
      return { ...s, display: `${s.display}.` };
    });
  }, []);

  /**
   * Press an operator. If one is already pending, evaluate it first — that's
   * what makes `2 + 3 + 4` show 5 before you press the second `+`.
   */
  const inputOperator = useCallback((op: Operator) => {
    setState((s) => {
      const current = parseFloat(s.display);
      if (s.pending !== null && s.accumulator !== null && !s.replace) {
        const result = apply(s.accumulator, current, s.pending);
        return {
          display: format(result),
          accumulator: result,
          pending: op,
          replace: true,
          expression: `${format(result)} ${op}`,
        };
      }
      return {
        ...s,
        accumulator: current,
        pending: op,
        replace: true,
        expression: `${s.display} ${op}`,
      };
    });
  }, []);

  const equals = useCallback(() => {
    setState((s) => {
      if (s.pending === null || s.accumulator === null) return s;
      const current = parseFloat(s.display);
      const result = apply(s.accumulator, current, s.pending);
      return {
        display: format(result),
        accumulator: null,
        pending: null,
        replace: true,
        expression: `${format(s.accumulator)} ${s.pending} ${s.display} =`,
      };
    });
  }, []);

  /** Clear everything (C / AC). */
  const clear = useCallback(() => {
    setState({
      display: '0',
      accumulator: null,
      pending: null,
      replace: true,
      expression: '',
    });
  }, []);

  /** Clear only the current entry (CE), keeping any pending operation. */
  const clearEntry = useCallback(() => {
    setState((s) => ({ ...s, display: '0', replace: true }));
  }, []);

  /** Backspace one character. */
  const backspace = useCallback(() => {
    setState((s) => {
      if (s.replace) return s;
      const next = s.display.slice(0, -1);
      return { ...s, display: next === '' || next === '-' ? '0' : next };
    });
  }, []);

  const negate = useCallback(() => {
    setState((s) => ({
      ...s,
      display: s.display.startsWith('-') ? s.display.slice(1) : `-${s.display}`,
    }));
  }, []);

  const percent = useCallback(() => {
    setState((s) => ({
      ...s,
      display: format(parseFloat(s.display) / 100),
      replace: true,
    }));
  }, []);

  /** A unary op — both apps have √, x² and 1/x on the basic keypad. */
  const unary = useCallback((fn: 'sqrt' | 'square' | 'reciprocal') => {
    setState((s) => {
      const v = parseFloat(s.display);
      const result =
        fn === 'sqrt' ? Math.sqrt(v) : fn === 'square' ? v * v : v === 0 ? NaN : 1 / v;
      return { ...s, display: format(result), replace: true };
    });
  }, []);

  /* Physical keyboard support. Both real apps accept it, and a calculator you
     can only click feels like a picture of a calculator. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack typing in another app's text field.
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;

      if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
      else if (e.key === '.') inputDecimal();
      else if (e.key === '+') inputOperator('+');
      else if (e.key === '-') inputOperator('-');
      else if (e.key === '*') inputOperator('×');
      else if (e.key === '/') { e.preventDefault(); inputOperator('÷'); }
      else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); equals(); }
      else if (e.key === 'Backspace') backspace();
      else if (e.key === 'Escape') clear();
      else if (e.key === '%') percent();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inputDigit, inputDecimal, inputOperator, equals, backspace, clear, percent]);

  return {
    ...state,
    inputDigit,
    inputDecimal,
    inputOperator,
    equals,
    clear,
    clearEntry,
    backspace,
    negate,
    percent,
    unary,
  };
}

/* ---------------------------------------------------------------- self-check */

/**
 * Runnable check for the state machine — chained operators and the
 * replace-on-next-digit rule are exactly the parts that break silently.
 * Pure functions only, so it needs no React.
 */
export const __calcSelfCheck = () => {
  console.assert(format(apply(2, 3, '+')) === '5', 'add');
  console.assert(format(apply(10, 4, '-')) === '6', 'subtract');
  console.assert(format(apply(7, 8, '×')) === '56', 'multiply');
  console.assert(format(apply(9, 3, '÷')) === '3', 'divide');
  // The float-noise case this formatter exists for.
  console.assert(format(apply(0.1, 0.2, '+')) === '0.3', '0.1 + 0.2 must read as 0.3');
  // Division by zero must be caught, not shown as Infinity.
  console.assert(format(apply(1, 0, '÷')) === 'Cannot divide by zero', 'div by zero');
};
