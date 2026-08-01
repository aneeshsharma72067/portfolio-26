import { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import type { FileNode } from '@/os/types';
import { WIN_ICONS, winNodeIcon, winTypeLabel } from './winIcons';

type Props = {
  items: FileNode[];
  onRestore: (path: string) => void;
  onEmpty: () => void;
};

const FONT = "'Segoe UI VF', 'Segoe UI Variable', 'Segoe UI', sans-serif";

/**
 * WinRecycleBin — the Windows Recycle Bin.
 *
 * WINDOWS-ONLY. macOS's Trash is a Finder window with a "Put Back" button and
 * an "Empty" in the corner; this is Explorer's chrome with the bin's own
 * command bar and an "Original location" column, which the Trash does not show.
 *
 * Deleting is real within a session: files removed from the desktop land here
 * and restoring puts them back. Nothing is persisted, so a reload gives you a
 * clean machine — which is the honest behaviour for a portfolio, since the
 * alternative is a visitor permanently deleting content for themselves.
 */
export default function WinRecycleBin({ items, onRestore, onEmpty }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  /** "C:\Users\aneesh\Desktop\a.txt" → "C:\Users\aneesh\Desktop" */
  const originalLocation = (path: string) => path.slice(0, path.lastIndexOf('\\'));

  return (
    <div
      className="flex h-full select-none flex-col bg-[#191919] text-xs text-white/90"
      style={{ fontFamily: FONT }}
    >
      {/* ══════════════════════════════════════════════════════ command bar */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/10 bg-[#202020] px-3">
        <button
          disabled={!selected}
          onClick={() => {
            if (selected) {
              onRestore(selected);
              setSelected(null);
            }
          }}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors hover:bg-white/10 disabled:text-white/25 disabled:hover:bg-transparent"
        >
          <RotateCcw size={14} className="text-sky-400" />
          Restore the selected item
        </button>

        <span className="mx-1 h-4 w-px bg-white/15" />

        <button
          disabled={items.length === 0}
          onClick={onEmpty}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors hover:bg-white/10 disabled:text-white/25 disabled:hover:bg-transparent"
        >
          <Trash2 size={14} className="text-rose-400" />
          Empty Recycle Bin
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════ listing */}
      <div
        className="min-h-0 flex-1 overflow-y-auto bg-[#181818]"
        onClick={() => setSelected(null)}
      >
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 opacity-40">
            <img src={WIN_ICONS.bin} alt="" className="h-16 w-16 object-contain" />
            <span>This folder is empty.</span>
            <span className="text-[10.5px]">
              Right-click a desktop file and choose Delete to put it here.
            </span>
          </div>
        ) : (
          <table className="w-full text-left text-[11.5px]">
            <thead className="sticky top-0 z-10 bg-[#1f1f1f] text-[11px] text-white/55">
              <tr className="border-b border-white/10">
                <th className="px-3 py-1.5 font-normal">Name</th>
                <th className="px-3 py-1.5 font-normal">Original location</th>
                <th className="w-32 px-3 py-1.5 font-normal">Date deleted</th>
                <th className="w-28 px-3 py-1.5 font-normal">Type</th>
                <th className="w-20 px-3 py-1.5 text-right font-normal">Size</th>
              </tr>
            </thead>
            <tbody>
              {items.map((node) => (
                <tr
                  key={node.path}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(node.path);
                  }}
                  onDoubleClick={() => onRestore(node.path)}
                  className={`cursor-pointer transition-colors ${
                    selected === node.path
                      ? 'bg-[#0078d4]/35 text-white'
                      : 'text-white/85 hover:bg-white/5'
                  }`}
                >
                  <td className="flex items-center gap-2.5 truncate px-3 py-1.5">
                    <img
                      src={winNodeIcon(node)}
                      alt=""
                      className="h-4 w-4 shrink-0 object-contain"
                    />
                    <span className="truncate">{node.name}</span>
                  </td>
                  <td className="truncate px-3 py-1.5 text-white/50">
                    {originalLocation(node.path)}
                  </td>
                  <td className="px-3 py-1.5 text-white/50">Today</td>
                  <td className="truncate px-3 py-1.5 text-white/50">
                    {winTypeLabel(node)}
                  </td>
                  <td className="px-3 py-1.5 text-right text-white/50">
                    {node.kind === 'folder' ? '' : node.size}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex h-6 shrink-0 items-center border-t border-white/10 bg-[#202020] px-3 text-[10.5px] text-white/50">
        <span>{items.length} items</span>
      </div>
    </div>
  );
}
