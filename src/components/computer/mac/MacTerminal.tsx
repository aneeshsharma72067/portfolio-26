import { useEffect, useRef, useState } from 'react';
import { getDisk } from '@/os/fs';
import { runCommand, complete, prettyPath, type ShellState } from '@/os/shell';

type Props = {
  initialCwd?: string;
  onOpenPath: (path: string) => void;
  onExit: () => void;
};

type Line = { text: string; kind: 'input' | 'output' };

const BANNER = [
  'Last login: today on ttys000',
  '',
  "Type 'help' for a list of commands. Tab completes paths.",
  '',
];

/**
 * MacTerminal — zsh in Terminal.app.
 *
 * macOS-ONLY. Windows has `WinTerminal` (PowerShell, a `PS C:\…>` prompt, a tab
 * strip and acrylic). The command engine (`os/shell.ts`) is shared; everything
 * you can see is not.
 *
 * macOS tells this gets right:
 *  · the two-tone zsh prompt — green `user@host`, blue path, then `%`
 *  · Terminal.app's near-black-but-not-black background with a soft tint
 *  · SF Mono, and a title strip rather than tabs
 */
export default function MacTerminal({ initialCwd, onOpenPath, onExit }: Props) {
  const disk = getDisk('mac');
  const [cwd, setCwd] = useState(initialCwd ?? disk.paths.home);
  const [lines, setLines] = useState<Line[]>(
    BANNER.map((text) => ({ text, kind: 'output' as const })),
  );
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  /** zsh's prompt is built from parts, each its own colour — hence no string. */
  const shortCwd = prettyPath('mac', cwd);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = input;
    setInput('');
    setHistoryIndex(null);
    if (entered.trim()) setHistory((prev) => [...prev, entered]);

    const state: ShellState = { platform: 'mac', cwd };
    const result = runCommand(state, entered);

    if (result.clear) {
      setLines([]);
    } else {
      setLines((prev) => [
        ...prev,
        { text: `aneesh@aneeshs-macbook-pro ${shortCwd} % ${entered}`, kind: 'input' },
        ...result.output.map((text) => ({ text, kind: 'output' as const })),
      ]);
    }

    if (result.cwd) setCwd(result.cwd);
    if (result.openPath) onOpenPath(result.openPath);
    if (result.exit) onExit();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const completed = complete({ platform: 'mac', cwd }, input);
      if (completed) setInput(completed);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(history[next]);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(null);
        setInput('');
      } else {
        setHistoryIndex(next);
        setInput(history[next]);
      }
    }
  };

  return (
    <div
      className="flex h-full flex-col text-[12.5px]"
      style={{
        // Terminal.app's default is a very dark warm grey, not pure black.
        background: 'rgba(24, 22, 26, 0.94)',
        fontFamily: "'SF Mono', 'Menlo', ui-monospace, monospace",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="min-h-0 flex-1 select-text overflow-y-auto px-3.5 py-2.5 leading-[1.5]">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap break-words ${
              line.kind === 'input' ? 'text-white/75' : 'text-[#e6e6e6]'
            }`}
          >
            {line.text}
          </div>
        ))}

        {/* ───────────────────────────── the live prompt, in zsh's own colours */}
        <form onSubmit={submit} className="flex items-baseline gap-1.5 pt-0.5">
          <span className="shrink-0 whitespace-pre">
            <span className="text-[#5af78e]">aneesh@aneeshs-macbook-pro</span>{' '}
            <span className="text-[#57c7ff]">{shortCwd}</span>{' '}
            <span className="text-white/80">%</span>
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="m-0 min-w-0 flex-1 border-none bg-transparent p-0 text-[#e6e6e6] caret-[#e6e6e6] outline-none"
          />
        </form>

        <div ref={endRef} />
      </div>
    </div>
  );
}
