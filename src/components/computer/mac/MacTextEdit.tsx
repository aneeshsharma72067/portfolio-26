import { useMemo } from 'react';
import { Download } from 'lucide-react';

type Props = {
  name: string;
  body?: string;
  size?: string;
};

const FONT = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

/**
 * MacTextEdit — a document opened in TextEdit.
 *
 * macOS-ONLY. Windows opens the same file in `WinTextViewer` (Notepad): a flat
 * dark editor with a File/Edit/View strip and an Ln/Col status bar. TextEdit is
 * a different application and looks it — a formatting toolbar with a font
 * popup and alignment controls, and the document rendered on a PAPER SHEET
 * floating on a grey backdrop, which is TextEdit's whole visual identity.
 */
export default function MacTextEdit({ name, body = '', size = '0 KB' }: Props) {
  const rendered = useMemo(() => {
    if (!body) return <p className="italic text-black/40">No content.</p>;

    return body.split('\n').map((line, idx) => {
      const trimmed = line.trim();

      if (trimmed === '---') return <hr key={idx} className="my-5 border-black/15" />;

      if (trimmed.startsWith('# '))
        return (
          <h1 key={idx} className="mb-2 mt-5 text-[21px] font-bold text-black first:mt-0">
            {trimmed.slice(2)}
          </h1>
        );
      if (trimmed.startsWith('## '))
        return (
          <h2 key={idx} className="mb-1.5 mt-4 text-[17px] font-semibold text-black">
            {trimmed.slice(3)}
          </h2>
        );
      if (trimmed.startsWith('### '))
        return (
          <h3 key={idx} className="mb-1 mt-3 text-[14px] font-semibold text-black">
            {trimmed.slice(4)}
          </h3>
        );

      if (
        /^(export |alias |\[|#\s*~\/|info |\t)/.test(line) ||
        /^\[\d{4}-\d{2}-\d{2}/.test(trimmed)
      )
        return (
          <div
            key={idx}
            className="my-0.5 whitespace-pre-wrap rounded bg-black/[0.06] px-2 py-1 font-mono text-[11.5px] text-[#8a2f6b]"
          >
            {line}
          </div>
        );

      if (trimmed.startsWith('- ') || trimmed.startsWith('· '))
        return (
          <li key={idx} className="my-1 ml-5 list-disc text-[13px] text-black/80">
            {trimmed.slice(2)}
          </li>
        );

      if (trimmed === '') return <div key={idx} className="h-2.5" />;

      return (
        <p key={idx} className="my-1.5 text-[13px] leading-[1.55] text-black/85">
          {line}
        </p>
      );
    });
  }, [body]);

  const handleDownload = () => {
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col bg-[#2a2a2e]" style={{ fontFamily: FONT }}>
      {/* ═════════════════════════════════════════ TextEdit's format bar */}
      <div className="flex h-9 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black/25 px-3 text-[11px] text-white/75">
        <div className="flex items-center gap-2">
          {/* Font popup — decorative, but the bar is unrecognisable without it. */}
          <span className="rounded border border-white/15 bg-white/10 px-2 py-0.5">
            Helvetica ⌄
          </span>
          <span className="rounded border border-white/15 bg-white/10 px-1.5 py-0.5">
            12 ⌄
          </span>
          <span className="mx-1 h-3.5 w-px bg-white/15" />
          <span className="px-1 font-bold">B</span>
          <span className="px-1 italic">I</span>
          <span className="px-1 underline">U</span>
          <span className="mx-1 h-3.5 w-px bg-white/15" />
          {['≡', '≡', '≡'].map((glyph, i) => (
            <span key={i} className="px-1 opacity-60">
              {glyph}
            </span>
          ))}
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[#0a84ff] transition-colors hover:bg-white/10"
          title="Save a copy"
        >
          <Download size={12} />
          <span>Save…</span>
        </button>
      </div>

      {/* ═══════════════ the paper sheet — TextEdit's defining visual */}
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-[620px] select-text rounded-sm bg-[#fefefe] px-10 py-8 shadow-[0_4px_20px_rgba(0,0,0,0.4)] selection:bg-[#0a84ff]/25">
          {rendered}
        </div>
      </div>

      <div className="flex h-6 shrink-0 items-center justify-between border-t border-white/10 bg-black/25 px-4 text-[10.5px] text-white/45">
        <span>{name}</span>
        <span>{size}</span>
      </div>
    </div>
  );
}
