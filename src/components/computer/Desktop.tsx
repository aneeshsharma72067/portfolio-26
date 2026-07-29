import { memo, useState } from 'react';
import { resolveIcon } from '@/os/icons';
import type { FileNode } from '@/os/types';

import macosFolderIcon from '@/assets/image/icons/macos/folder.png';
import macosSettingsFolderIcon from '@/assets/image/icons/macos/settings-folder.png';
import macosFileIcon from '@/assets/image/icons/macos/file.png';

type Props = {
  nodes: FileNode[];
  /** Open a node — a folder in Files, a file in its app, a `.url` in a new tab. */
  onOpen: (node: FileNode) => void;
};

/**
 * Desktop — the icon grid on the wallpaper.
 */
const Desktop = memo(function Desktop({ nodes, onOpen }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const getMacIconSrc = (node: FileNode) => {
    if (node.path.includes('settings')) return macosSettingsFolderIcon;
    if (node.kind === 'folder') return macosFolderIcon;
    return macosFileIcon;
  };

  return (
    <div
      className="absolute inset-0 p-3"
      // Clicking bare wallpaper clears the selection.
      onPointerDown={() => setSelected(null)}
    >
      <div
        className="grid h-full w-fit gap-1"
        style={{
          gridAutoFlow: 'column',
          // Fixed row height + a column cap so wrapping is deterministic.
          gridTemplateRows: 'repeat(auto-fill, 92px)',
          gridAutoColumns: '92px',
        }}
      >
        {nodes.map((node) => {
          const Icon = resolveIcon(node.icon);
          const isSelected = selected === node.path;
          const imgSrc = getMacIconSrc(node);

          return (
            <button
              key={node.path}
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelected(node.path);
              }}
              onDoubleClick={() => onOpen(node)}
              // Single tap opens on touch, where there is no double-click.
              onTouchEnd={(e) => {
                e.preventDefault();
                onOpen(node);
              }}
              className={`flex h-[88px] w-[88px] flex-col items-center justify-center gap-1 rounded p-1 text-center transition-colors ${
                isSelected ? 'bg-white/20 ring-1 ring-white/30' : 'hover:bg-white/10'
              }`}
              title={node.path}
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={node.name}
                  className="h-10 w-10 object-contain drop-shadow-md pointer-events-none rounded-[18%]"
                />
              ) : (
                <Icon
                  size={32}
                  strokeWidth={1.6}
                  style={{ color: 'rgb(var(--os-accent))' }}
                  className={node.kind === 'folder' ? 'drop-shadow' : ''}
                />
              )}
              <span
                className="line-clamp-2 w-full break-words px-0.5 text-[10.5px] leading-tight text-white font-medium"
                style={{ textShadow: '0 1px 3px rgb(0 0 0 / 0.9)', fontFamily: "'SF Pro', -apple-system, sans-serif" }}
              >
                {node.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default Desktop;
