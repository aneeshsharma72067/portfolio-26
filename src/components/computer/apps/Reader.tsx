import { useMemo } from 'react';
import { FileText, Download } from 'lucide-react';

type Props = {
  path: string;
  name: string;
  body?: string;
  size?: string;
};

export default function Reader({ path, name, body = '', size = '0 KB' }: Props) {
  // Simple markdown renderer for headers, bold text, links, lists, code block, and horizontal rules
  const renderedContent = useMemo(() => {
    if (!body) return <p className="opacity-50 italic">No content to display.</p>;

    const lines = body.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Horizontal Rule
      if (trimmed === '---') {
        return <hr key={idx} className="my-4 border-[var(--os-border)]" />;
      }

      // Headers (H1, H2, H3)
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-xl font-bold text-white mt-4 mb-2 first:mt-0">
            {trimmed.slice(2)}
          </h1>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-lg font-bold text-white mt-3.5 mb-1.5">
            {trimmed.slice(3)}
          </h2>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-white mt-3 mb-1">
            {trimmed.slice(4)}
          </h3>
        );
      }

      // Code blocks (e.g. bashrc) or mono-spaced lines
      if (trimmed.startsWith('export ') || trimmed.startsWith('alias ') || trimmed.startsWith('# ~/.') || trimmed.startsWith('print_distro') || trimmed.startsWith('info ')) {
        return (
          <div key={idx} className="font-mono bg-black/35 p-1 px-2 rounded text-[11px] text-cyan-300 border border-white/5 my-0.5 whitespace-pre-wrap">
            {line}
          </div>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('· ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-white/80 my-1">
            {trimmed.slice(2)}
          </li>
        );
      }

      // Empty line
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }

      // Standard Paragraph
      return (
        <p key={idx} className="text-white/80 leading-relaxed my-1.5 text-xs">
          {line}
        </p>
      );
    });
  }, [body]);

  // Download raw file utility (for contact.vcf, resume, etc.)
  const handleDownload = () => {
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--os-window-bg)]" style={{ color: 'var(--os-chrome-text)' }}>
      {/* File Info Bar */}
      <div className="h-9 border-b border-[var(--os-border)] px-4 flex items-center justify-between shrink-0 bg-black/10 select-none text-[11px]">
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-sky-400" />
          <span className="font-medium text-white/95">{name}</span>
          <span className="opacity-40">({size})</span>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 hover:bg-white/5 p-1 rounded transition-colors text-[10px] text-sky-400"
          title="Download File"
        >
          <Download size={12} />
          <span>Save File</span>
        </button>
      </div>

      {/* Reader Body */}
      <div className="flex-1 overflow-y-auto p-5 select-text selection:bg-[rgba(var(--os-accent),0.3)]">
        <div className="max-w-prose mx-auto">
          {renderedContent}
        </div>
      </div>
    </div>
  );
}
