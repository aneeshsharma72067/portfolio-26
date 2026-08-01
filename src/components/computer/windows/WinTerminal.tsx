import { useEffect, useRef, useState } from 'react';
import { getDisk } from '@/os/fs';
import {
  runCommand,
  complete,
  prettyPath,
  __shellSelfCheck,
  type ShellState,
} from '@/os/shell';

type Props = {
  /** Where the shell starts — the folder a "Open in Terminal" click came from. */
  initialCwd?: string;
  /** `open <path>` bridges back to the GUI. */
  onOpenPath: (path: string) => void;
  /** `exit` closes the window. */
  onExit: () => void;
};

type Line = { text: string; kind: 'input' | 'output' };

const BANNER = [
  'PowerShell 7.4.1',
  'Copyright (c) Microsoft Corporation. Some rights imagined.',
  '',
  "Type 'help' for a list of commands. Tab completes paths.",
  '',
];

/**
 * WinTerminal — Windows Terminal running PowerShell.
 *
 * WINDOWS-ONLY. macOS has `MacTerminal`, which is zsh in Terminal.app: a
 * different prompt shape, different colours, a different banner and a tab bar
 * instead of PowerShell's chrome. The command *engine* (`os/shell.ts`) is
 * shared, because `cd ..` means the same thing on both machines.
 *
 * Windows tells this gets right:
 *  · the `PS C:\Users\aneesh>` prompt, in Cascadia's colours
 *  · a tab strip with a "+" that does nothing, exactly like a fresh install
 *  · the acrylic background Windows Terminal uses by default
 */
export default function WinTerminal({ initialCwd, onOpenPath, onExit }: Props) {
  const disk = getDisk('windows');
  const [cwd, setCwd] = useState(initialCwd ?? disk.paths.home);
  const [lines, setLines] = useState<Line[]>(
    BANNER.map((text) => ({ text, kind: 'output' as const })),
  );
  const [input, setInput] = useState('');
  /** Command history, newest last; `historyIndex` walks it with the arrows. */
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  /* The path resolver has real edge cases (`..` past the root, mixed
     separators); assert them once at boot in dev rather than discovering a
     broken `cd` by hand. */
  useEffect(() => {
    if (import.meta.env.DEV) __shellSelfCheck();
  }, []);

  /* Keep the newest line in view as output arrives. */
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  const prompt = `PS ${cwd}>`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = input;
    setInput('');
    setHistoryIndex(null);
    if (entered.trim()) setHistory((prev) => [...prev, entered]);

    const state: ShellState = { platform: 'windows', cwd };
    const result = runCommand(state, entered);

    if (result.clear) {
      setLines([]);
    } else {
      setLines((prev) => [
        ...prev,
        { text: `${prompt} ${entered}`, kind: 'input' },
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
      const completed = complete({ platform: 'windows', cwd }, input);
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
      className="flex h-full flex-col bg-[#0c0c0c]/95 text-[12.5px]"
      style={{ fontFamily: "'Cascadia Code', 'Consolas', ui-monospace, monospace" }}
      // Clicking anywhere in the body focuses the prompt, like a real terminal.
      onClick={() => inputRef.current?.focus()}
    >
      {/* ═══════════════════════════════════════════ Windows Terminal tab strip */}
      <div className="flex h-8 shrink-0 items-center gap-1 border-b border-white/10 bg-[#1f1f1f] px-2 text-[11px] text-white/70">
        <div className="flex h-6 items-center gap-2 rounded-t-md border-x border-t border-white/10 bg-[#0c0c0c] px-3 text-white">
          <span className="text-[#4cc2ff]">▸</span>
          <span>Windows PowerShell</span>
        </div>
        <button className="rounded px-1.5 py-0.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white">
          ＋
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════ scrollback */}
      <div className="min-h-0 flex-1 select-text overflow-y-auto px-3 py-2 leading-[1.45]">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap break-words ${
              line.kind === 'input' ? 'text-[#cccccc]' : 'text-[#e8e8e8]'
            }`}
          >
            {line.text}
          </div>
        ))}

        {/* ─────────────────────────────────────────────── the live prompt */}
        <form onSubmit={submit} className="flex items-baseline gap-1.5 pt-0.5">
          <span className="shrink-0 whitespace-pre text-[#ffff00]">{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="m-0 min-w-0 flex-1 border-none bg-transparent p-0 text-[#e8e8e8] caret-[#e8e8e8] outline-none"
          />
        </form>

        <div ref={endRef} />
      </div>

      {/* ══════════════════════════════════════════════════════ status bar */}
      <div className="flex h-5 shrink-0 items-center justify-between border-t border-white/10 bg-[#1f1f1f] px-3 text-[10px] text-white/40">
        <span>{prettyPath('windows', cwd)}</span>
        <span>PowerShell · UTF-8 · CRLF</span>
      </div>
    </div>
  );
}
