import { useMemo } from 'react';
import { Download } from 'lucide-react';

type Props = {
  name: string;
  body?: string;
  size?: string;
};

const FONT = "'Segoe UI VF', 'Segoe UI Variable', 'Segoe UI', sans-serif";

/**
 * WinTextViewer — a document opened in Notepad.
 *
 * WINDOWS-ONLY. macOS opens the same file in `MacTextEdit`, which is a paper
 * sheet with a formatting bar; this is Notepad: a flat dark editor surface, a
 * File/Edit/View menu strip, and the Ln/Col/encoding status bar. Same file,
 * genuinely different application — which is the point.
 *
 * The markdown rendering is deliberately minimal (headings, rules, bullets,
 * code lines). A real Notepad renders nothing at all, but the files here are
 * markdown and showing raw `##` would read as a bug rather than as fidelity.
 */
export default function WinTextViewer({ name, body = '', size = '0 KB' }: Props) {
  const rendered = useMemo(() => {
    if (!body) return <p className="italic opacity-50">No content to display.</p>;

    return body.split('\n').map((line, idx) => {
      const trimmed = line.trim();

      if (trimmed === '---') return <hr key={idx} className="my-4 border-white/10" />;

      if (trimmed.startsWith('# '))
        return (
          <h1 key={idx} className="mb-2 mt-4 text-xl font-bold text-white first:mt-0">
            {trimmed.slice(2)}
          </h1>
        );
      if (trimmed.startsWith('## '))
        return (
          <h2 key={idx} className="mb-1.5 mt-3.5 text-lg font-bold text-white">
            {trimmed.slice(3)}
          </h2>
        );
      if (trimmed.startsWith('### '))
        return (
          <h3 key={idx} className="mb-1 mt-3 text-base font-bold text-white">
            {trimmed.slice(4)}
          </h3>
        );

      /* Config-file lines get a monospace slab, so .gitconfig and setup.log
         don't read as prose. */
      if (
        /^(export |alias |\[|#\s*~\/|info |\t)/.test(line) ||
        /^\[\d{4}-\d{2}-\d{2}/.test(trimmed)
      )
        return (
          <div
            key={idx}
            className="my-0.5 whitespace-pre-wrap rounded border border-white/5 bg-black/35 px-2 py-1 font-mono text-[11px] text-cyan-300"
          >
            {line}
          </div>
        );

      if (trimmed.startsWith('- ') || trimmed.startsWith('· '))
        return (
          <li key={idx} className="my-1 ml-4 list-disc text-white/80">
            {trimmed.slice(2)}
          </li>
        );

      if (trimmed === '') return <div key={idx} className="h-2" />;

      return (
        <p key={idx} className="my-1.5 text-xs leading-relaxed text-white/80">
          {line}
        </p>
      );
    });
  }, [body]);

  /** Saving genuinely downloads the file — the payloads here are real text. */
  const handleDownload = () => {
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Release the object URL, or every save leaks a blob for the page's life.
    URL.revokeObjectURL(url);
  };

  const lineCount = body ? body.split('\n').length : 0;

  return (
    <div
      className="flex h-full flex-col bg-[#202020] text-white"
      style={{ fontFamily: FONT }}
    >
      {/* ═══════════════════════════════════════════ Notepad's menu strip */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 bg-[#1c1c1c] px-3 text-[12px] text-white/70">
        <div className="flex items-center gap-4">
          {['File', 'Edit', 'View'].map((m) => (
            <span key={m} className="cursor-default transition-colors hover:text-white">
              {m}
            </span>
          ))}
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 rounded p-1 text-[11px] text-[#60cdff] transition-colors hover:bg-white/5"
          title="Save a copy"
        >
          <Download size={12} />
          <span>Save as…</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════ document body */}
      <div className="min-h-0 flex-1 select-text overflow-y-auto p-5 selection:bg-[#0078d4]/60">
        <div className="mx-auto max-w-prose">{rendered}</div>
      </div>

      {/* ═══════════════════════════════════════════ Notepad's status bar */}
      <div className="flex h-6 shrink-0 items-center justify-between border-t border-white/10 bg-[#1c1c1c] px-4 text-[11px] text-white/50">
        <span>
          Ln {lineCount}, Col 1 · {size}
        </span>
        <div className="flex items-center gap-6">
          <span>100%</span>
          <span>Windows (CRLF)</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}
