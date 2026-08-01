import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { search } from '@/os/fs';
import type { FileNode, LaunchableApp } from '@/os/types';
import { macNodeIcon, macKindLabel } from './macIcons';

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenNode: (node: FileNode) => void;
  onOpenApp: (app: LaunchableApp, title?: string) => void;
};

const FONT = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

/** Apps Spotlight can launch by name, checked before the filesystem. */
const APPS: { name: string; app: LaunchableApp; hint: string }[] = [
  { name: 'Finder', app: 'files', hint: 'Application' },
  { name: 'Terminal', app: 'terminal', hint: 'Application' },
  { name: 'System Settings', app: 'settings', hint: 'Application' },
  { name: 'Photos', app: 'photos', hint: 'Application' },
  { name: 'Notes', app: 'notes', hint: 'Application' },
  { name: 'Activity Monitor', app: 'taskmgr', hint: 'Application' },
  { name: 'Calculator', app: 'calc', hint: 'Application' },
  { name: 'Trash', app: 'trash', hint: 'System' },
];

/**
 * MacSpotlight — ⌘-Space search.
 *
 * macOS-ONLY. Windows' equivalent lives inside the Start menu, laid out as a
 * flyout above the taskbar with a grid of pinned apps; Spotlight is a centred
 * floating panel that dims the desktop behind it, and that difference is the
 * whole reason these aren't one component.
 *
 * Behaviour that matches the real thing:
 *  · ⌘-Space (or ⌘-K) opens it; Escape closes; ↑/↓ move; Enter opens
 *  · applications rank above documents, which is what makes it usable as a
 *    launcher rather than a file search
 *  · the selected row shows a small preview panel on the right
 */
export default function MacSpotlight({ open, onClose, onOpenNode, onOpenApp }: Props) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Reset every time it opens — Spotlight never remembers your last query. */
  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      // Focus after paint, or the panel's own animation eats the focus.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  /** Apps first, then files — a launcher that buries apps is useless. */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const apps = APPS.filter((a) => a.name.toLowerCase().includes(q)).map((a) => ({
      kind: 'app' as const,
      key: a.app,
      title: a.name,
      subtitle: a.hint,
      app: a.app,
    }));
    const files = search('mac', q, 12).map((node) => ({
      kind: 'file' as const,
      key: node.path,
      title: node.name,
      subtitle: macKindLabel(node),
      node,
    }));
    return [...apps, ...files].slice(0, 12);
  }, [query]);

  /* Clamp the cursor when the result list shrinks under it. */
  useEffect(() => {
    if (index >= results.length) setIndex(0);
  }, [results.length, index]);

  if (!open) return null;

  const activate = (result: (typeof results)[number]) => {
    if (result.kind === 'app') onOpenApp(result.app, result.title);
    else onOpenNode(result.node);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => Math.min(results.length - 1, i + 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === 'Enter' && results[index]) {
      e.preventDefault();
      activate(results[index]);
    }
  };

  const selected = results[index];

  return (
    /* The dimming backdrop — clicking it dismisses, as it does on a real Mac. */
    <div
      className="fixed inset-0 z-[10001] flex items-start justify-center bg-black/25 pt-[18vh] backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-[600px] max-w-[92vw] overflow-hidden rounded-[14px] anim-mac-spotlight"
        style={{
          background: 'rgba(44, 44, 48, 0.82)',
          backdropFilter: 'blur(70px) saturate(1.9)',
          WebkitBackdropFilter: 'blur(70px) saturate(1.9)',
          border: '0.5px solid rgba(255,255,255,0.20)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
          fontFamily: FONT,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─────────────────────────────────────────────────── search field */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <Search size={20} className="shrink-0 text-white/45" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Spotlight Search"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 border-none bg-transparent p-0 text-[21px] font-light text-white outline-none placeholder:text-white/30"
          />
        </div>

        {results.length > 0 && (
          <div className="flex border-t border-white/10">
            {/* ──────────────────────────────────────────────── result list */}
            <div className="max-h-[320px] flex-1 overflow-y-auto p-1.5">
              {results.map((result, i) => (
                <button
                  key={result.key}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => activate(result)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-left transition-colors ${
                    i === index ? 'bg-[#0a84ff] text-white' : 'text-white/85 hover:bg-white/10'
                  }`}
                >
                  {result.kind === 'file' ? (
                    <img
                      src={macNodeIcon(result.node)}
                      alt=""
                      className="h-5 w-5 shrink-0 object-contain"
                    />
                  ) : (
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[5px] bg-white/20 text-[10px]">
                      ▣
                    </span>
                  )}
                  <span className="flex-1 truncate text-[13px]">{result.title}</span>
                  <span
                    className={`shrink-0 text-[10.5px] ${i === index ? 'text-white/70' : 'text-white/35'}`}
                  >
                    {result.subtitle}
                  </span>
                </button>
              ))}
            </div>

            {/* ───────────────────────────────────── preview pane, as macOS has */}
            {selected && (
              <div className="hidden w-[196px] shrink-0 flex-col items-center gap-2.5 border-l border-white/10 p-4 text-center sm:flex">
                {selected.kind === 'file' && selected.node.ext === 'image' && selected.node.src ? (
                  <img
                    src={selected.node.src}
                    alt=""
                    className="w-full rounded-lg object-cover shadow-lg"
                  />
                ) : (
                  <span className="grid h-16 w-16 place-items-center rounded-[18%] bg-white/10 text-[28px]">
                    {selected.kind === 'app' ? '▣' : '📄'}
                  </span>
                )}
                <div className="text-[12px] font-semibold text-white">{selected.title}</div>
                <div className="text-[10.5px] text-white/45">{selected.subtitle}</div>
                {selected.kind === 'file' && (
                  <div className="w-full space-y-1 text-left text-[10px] text-white/40">
                    <div className="flex justify-between">
                      <span>Size</span>
                      <span className="text-white/70">{selected.node.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Modified</span>
                      <span className="text-white/70">{selected.node.modified}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <div className="border-t border-white/10 px-5 py-4 text-center text-[12px] text-white/40">
            No results for “{query}”
          </div>
        )}
      </div>
    </div>
  );
}
