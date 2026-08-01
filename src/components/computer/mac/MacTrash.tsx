import { useState } from 'react';
import type { FileNode } from '@/os/types';
import { macNodeIcon, macKindLabel } from './macIcons';

type Props = {
  items: FileNode[];
  onRestore: (path: string) => void;
  onEmpty: () => void;
};

const FONT = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

/**
 * MacTrash — the macOS Trash.
 *
 * macOS-ONLY. Windows gets `WinRecycleBin`, which is Explorer chrome with a
 * command bar and an "Original location" column. The Trash is a Finder window
 * instead: an icon grid, an "Empty" text button tucked in the top-RIGHT corner,
 * and "Put Back" only in the context of a selection. No table, no ribbon.
 *
 * Deleting is session-scoped — see the note in `WinRecycleBin`.
 */
export default function MacTrash({ items, onRestore, onEmpty }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedNode = items.find((n) => n.path === selected);

  return (
    <div
      className="flex h-full select-none flex-col bg-black/10 text-xs text-white/90"
      style={{ fontFamily: FONT }}
    >
      {/* ═══════════════════════════════════════════ Finder-style toolbar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/10 bg-black/20 px-4">
        <span className="font-semibold text-white/95">Trash</span>

        <div className="flex items-center gap-2">
          {selectedNode && (
            <button
              onClick={() => {
                onRestore(selectedNode.path);
                setSelected(null);
              }}
              className="rounded-md border border-white/15 bg-white/10 px-3 py-1 text-[11px] transition-colors hover:bg-white/20"
            >
              Put Back
            </button>
          )}
          <button
            disabled={items.length === 0}
            onClick={onEmpty}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-1 text-[11px] transition-colors hover:bg-white/15 disabled:text-white/25 disabled:hover:bg-white/5"
          >
            Empty
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════ icon grid */}
      <div
        className="min-h-0 flex-1 overflow-y-auto p-5"
        onClick={() => setSelected(null)}
      >
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 opacity-40">
            <span className="text-[40px]">🗑</span>
            <span>Trash is empty</span>
            <span className="text-[10.5px]">
              Right-click a desktop item and choose Move to Trash.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-5">
            {items.map((node) => {
              const isSelected = selected === node.path;
              return (
                <div
                  key={node.path}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(node.path);
                  }}
                  onDoubleClick={() => onRestore(node.path)}
                  title={`${node.name} — ${macKindLabel(node)}`}
                  className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg p-2 text-center"
                >
                  {node.ext === 'image' && node.src ? (
                    <img
                      src={node.src}
                      alt=""
                      className={`h-12 w-12 rounded-[18%] object-cover shadow-md ${
                        isSelected ? 'ring-2 ring-[#0a84ff]' : ''
                      }`}
                    />
                  ) : (
                    <img
                      src={macNodeIcon(node)}
                      alt=""
                      className={`h-12 w-12 rounded-[22%] object-contain shadow-md ${
                        isSelected ? 'bg-white/25' : ''
                      }`}
                    />
                  )}
                  <span
                    className={`line-clamp-2 w-full break-words rounded px-1 text-[11px] font-medium leading-tight ${
                      isSelected ? 'bg-[#0a84ff] text-white' : 'text-white/90'
                    }`}
                  >
                    {node.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex h-6 shrink-0 items-center justify-center border-t border-white/10 bg-black/25 px-3 text-[10.5px] opacity-55">
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </div>
    </div>
  );
}
