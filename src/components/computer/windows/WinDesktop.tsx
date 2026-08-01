import { useEffect, useState } from 'react';
import type { FileNode } from '@/os/types';
import { useIconGrid } from '@/os/useIconGrid';
import { winNodeIcon } from './winIcons';

type Props = {
  nodes: FileNode[];
  desktop: { w: number; h: number };
  onOpen: (node: FileNode) => void;
  /** Right-click → Delete. Returns false for system files, which refuse. */
  onDelete: (node: FileNode) => boolean;
  /** Right-click on bare wallpaper offers these. */
  onOpenTerminal: () => void;
  onOpenSettings: () => void;
};

/** Windows' desktop grid is tighter and squarer than macOS's. */
const CELL = { w: 80, h: 90 };

const FONT = "'Segoe UI VF', 'Segoe UI Variable', 'Segoe UI', sans-serif";

/**
 * WinDesktop — the Windows 11 icon layer and its context menu.
 *
 * WINDOWS-ONLY. macOS has `MacDesktop`, which uses larger squircle icons, a
 * right-origin layout, a blue label chip when selected, and a completely
 * different context menu. Only the drag/positioning engine (`useIconGrid`) is
 * shared, because "where did the icon land" is maths, not style.
 *
 * Windows details that make it read as real:
 *  · small 40px icons with a hard drop shadow, labels in Segoe UI
 *  · selection is a translucent blue fill with a 1px accent ring
 *  · double-click opens; the icon dips briefly, the way pressed tiles do
 */
export default function WinDesktop({
  nodes,
  desktop,
  onOpen,
  onDelete,
  onOpenTerminal,
  onOpenSettings,
}: Props) {
  const { positions, selected, setSelected, isDragging, handlers } = useIconGrid({
    nodes,
    desktop,
    cell: CELL,
    origin: 'top-left',
  });

  /** Path of the icon currently playing its open-press animation. */
  const [pressed, setPressed] = useState<string | null>(null);

  /** Right-click menu: either on an icon, or on bare wallpaper. */
  const [menu, setMenu] = useState<{ x: number; y: number; node: FileNode | null } | null>(
    null,
  );

  /* Any click anywhere dismisses the context menu, matching the real shell. */
  useEffect(() => {
    if (!menu) return;
    const dismiss = () => setMenu(null);
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [menu]);

  const handleOpen = (node: FileNode) => {
    setPressed(node.path);
    // Matches the .anim-icon-open duration; the icon settles before the window
    // finishes its own open animation, which is what makes the two feel linked.
    setTimeout(() => setPressed(null), 300);
    onOpen(node);
  };

  const openMenu = (e: React.MouseEvent, node: FileNode | null) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY, node });
    setSelected(node?.path ?? null);
  };

  const menuItem =
    'flex w-full items-center gap-2.5 rounded-[4px] px-3 py-[7px] text-left text-[12px] text-white/90 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/25 disabled:hover:bg-transparent';

  return (
    <div
      className="absolute inset-0"
      // Clicking bare wallpaper clears the selection.
      onPointerDown={() => setSelected(null)}
      onContextMenu={(e) => openMenu(e, null)}
    >
      {nodes.map((node) => {
        const pos = positions[node.path];
        // Skip until laid out, so nothing flashes at (0,0) on first paint.
        if (!pos) return null;
        const isSelected = selected === node.path;

        return (
          <button
            key={node.path}
            {...handlers}
            onPointerDown={(e) => handlers.onPointerDown(e, node)}
            onDoubleClick={() => handleOpen(node)}
            onContextMenu={(e) => openMenu(e, node)}
            // Single tap opens on touch, where there is no double-click.
            onTouchEnd={(e) => {
              if (!isDragging()) {
                e.preventDefault();
                handleOpen(node);
              }
            }}
            className="absolute left-0 top-0 cursor-default active:cursor-grabbing"
            style={{
              width: CELL.w,
              height: CELL.h,
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
              touchAction: 'none',
              zIndex: isSelected ? 2 : 1,
            }}
            title={node.path}
          >
            <div
              className={`flex h-full w-full flex-col items-center justify-start gap-1 rounded-[3px] p-1 pt-2 text-center transition-colors ${
                isSelected
                  ? 'bg-[#0078d4]/40 ring-1 ring-[#0078d4]/70'
                  : 'hover:bg-white/10 hover:ring-1 hover:ring-white/10'
              } ${pressed === node.path ? 'anim-icon-open' : ''}`}
            >
              <img
                src={winNodeIcon(node)}
                alt=""
                className="pointer-events-none h-10 w-10 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
              />
              <span
                className="pointer-events-none line-clamp-2 w-full break-words px-0.5 text-[11px] leading-tight text-white"
                style={{ textShadow: '0 1px 3px rgb(0 0 0 / 0.9)', fontFamily: FONT }}
              >
                {node.name}
              </span>
            </div>
          </button>
        );
      })}

      {/* ══════════════════════════════════════════════ Windows context menu */}
      {menu && (
        <div
          className="fixed z-[10000] w-[220px] rounded-lg p-1 anim-win-fade"
          style={{
            // Clamp inside the viewport so a right-click near an edge stays visible.
            left: Math.min(menu.x, window.innerWidth - 236),
            top: Math.min(menu.y, window.innerHeight - 260),
            background: 'rgba(43, 43, 43, 0.92)',
            backdropFilter: 'blur(60px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(60px) saturate(1.6)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            fontFamily: FONT,
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {menu.node ? (
            <>
              <button className={menuItem} onClick={() => handleOpen(menu.node!)}>
                Open
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                className={menuItem}
                disabled={menu.node.system}
                title={menu.node.system ? 'This file is protected by the system' : undefined}
                onClick={() => {
                  onDelete(menu.node!);
                  setMenu(null);
                }}
              >
                Delete
              </button>
              <button className={menuItem} disabled>
                Rename
              </button>
              <div className="my-1 border-t border-white/10" />
              <button className={menuItem} disabled>
                Properties
              </button>
            </>
          ) : (
            <>
              <button
                className={menuItem}
                onClick={() => {
                  onOpenTerminal();
                  setMenu(null);
                }}
              >
                Open in Terminal
              </button>
              <div className="my-1 border-t border-white/10" />
              <button className={menuItem} disabled>
                New folder
              </button>
              <button className={menuItem} disabled>
                Refresh
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                className={menuItem}
                onClick={() => {
                  onOpenSettings();
                  setMenu(null);
                }}
              >
                Display settings
              </button>
              <button
                className={menuItem}
                onClick={() => {
                  onOpenSettings();
                  setMenu(null);
                }}
              >
                Personalise
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
