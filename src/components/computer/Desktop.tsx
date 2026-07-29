import { memo, useState, useRef } from 'react';
import { resolveIcon } from '@/os/icons';
import type { FileNode, SkinId } from '@/os/types';

import macosFolderIcon from '@/assets/image/icons/macos/folder.png';
import macosSettingsFolderIcon from '@/assets/image/icons/macos/settings-folder.png';
import macosFileIcon from '@/assets/image/icons/macos/file.png';

import winFolderIcon from '@/assets/image/icons/windows/folder.png';
import winDocsIcon from '@/assets/image/icons/windows/docs.png';
import winHomeIcon from '@/assets/image/icons/windows/home.png';
import winBinIcon from '@/assets/image/icons/windows/bin0.png';

type Props = {
  nodes: FileNode[];
  skinId?: SkinId;
  /** Open a node — a folder in Files, a file in its app, a `.url` in a new tab. */
  onOpen: (node: FileNode) => void;
};

/**
 * Desktop — the icon grid on the wallpaper.
 */
const Desktop = memo(function Desktop({ nodes, skinId = 'mac', onOpen }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [offsets, setOffsets] = useState<Record<string, { x: number; y: number }>>({});

  const draggingRef = useRef<{ path: string; startX: number; startY: number; initX: number; initY: number; moved: boolean } | null>(null);

  const getDesktopIconSrc = (node: FileNode) => {
    if (skinId === 'windows') {
      if (node.path.includes('settings')) return winDocsIcon;
      if (node.kind === 'folder') return winFolderIcon;
      if (node.name.includes('bin') || node.name.includes('trash')) return winBinIcon;
      return winDocsIcon;
    }

    if (node.path.includes('settings')) return macosSettingsFolderIcon;
    if (node.kind === 'folder') return macosFolderIcon;
    return macosFileIcon;
  };

  const handlePointerDown = (e: React.PointerEvent, path: string) => {
    e.stopPropagation();
    setSelected(path);

    const currentOffset = offsets[path] || { x: 0, y: 0 };
    draggingRef.current = {
      path,
      startX: e.clientX,
      startY: e.clientY,
      initX: currentOffset.x,
      initY: currentOffset.y,
      moved: false,
    };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const { path, startX, startY, initX, initY } = draggingRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      draggingRef.current.moved = true;
    }

    setOffsets((prev) => ({
      ...prev,
      [path]: { x: initX + dx, y: initY + dy },
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback if capture already released
      }
      draggingRef.current = null;
    }
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
          const imgSrc = getDesktopIconSrc(node);
          const offset = offsets[node.path] || { x: 0, y: 0 };

          return (
            <button
              key={node.path}
              onPointerDown={(e) => handlePointerDown(e, node.path)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onDoubleClick={() => onOpen(node)}
              // Single tap opens on touch, where there is no double-click.
              onTouchEnd={(e) => {
                if (!draggingRef.current?.moved) {
                  e.preventDefault();
                  onOpen(node);
                }
              }}
              className={`flex h-[88px] w-[88px] flex-col items-center justify-center gap-1 rounded p-1 text-center transition-colors relative cursor-grab active:cursor-grabbing ${
                isSelected ? 'bg-white/20 ring-1 ring-white/30' : 'hover:bg-white/10'
              }`}
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
                zIndex: isSelected ? 10 : 1,
              }}
              title={node.path}
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={node.name}
                  className={`h-10 w-10 object-contain drop-shadow-md pointer-events-none ${
                    skinId === 'windows' ? 'rounded-none' : 'rounded-[22%] overflow-hidden'
                  }`}
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
                style={{
                  textShadow: '0 1px 3px rgb(0 0 0 / 0.9)',
                  fontFamily: skinId === 'windows' ? "'Segoe UI VF', 'Segoe UI', sans-serif" : "'SF Pro', -apple-system, sans-serif"
                }}
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
