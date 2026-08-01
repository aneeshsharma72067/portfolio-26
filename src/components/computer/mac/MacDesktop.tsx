import { useEffect, useState } from 'react';
import type { FileNode } from '@/os/types';
import { useIconGrid } from '@/os/useIconGrid';
import { macNodeIcon } from './macIcons';

type Props = {
  nodes: FileNode[];
  desktop: { w: number; h: number };
  onOpen: (node: FileNode) => void;
  /** Right-click → Move to Trash. Returns false for system files, which refuse. */
  onDelete: (node: FileNode) => boolean;
  onOpenTerminal: () => void;
  onOpenSettings: () => void;
};

/** macOS labels are wider and its rows taller than Windows'. */
const CELL = { w: 92, h: 98 };

const FONT = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

/**
 * MacDesktop — the macOS icon layer and its context menu.
 *
 * macOS-ONLY. Windows has `WinDesktop` with smaller icons, a left-origin
 * layout, a blue-fill selection and a different menu. Only the drag engine
 * (`useIconGrid`) is shared.
 *
 * macOS details that make it read as real:
 *  · icons lay out from the TOP RIGHT and fill downward
 *  · large 48px squircle icons with a soft shadow
 *  · a selected icon gets a translucent square behind the art and a SOLID BLUE
 *    chip behind its label — the detail people recognise without naming
 *  · the context menu is a rounded vibrancy panel with a blue hover row
 */
export default function MacDesktop({
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
    origin: 'top-right',
  });

  const [pressed, setPressed] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; node: FileNode | null } | null>(
    null,
  );

  useEffect(() => {
    if (!menu) return;
    const dismiss = () => setMenu(null);
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [menu]);

  const handleOpen = (node: FileNode) => {
    setPressed(node.path);
    setTimeout(() => setPressed(null), 300);
    onOpen(node);
  };

  const openMenu = (e: React.MouseEvent, node: FileNode | null) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY, node });
    setSelected(node?.path ?? null);
  };

  /* macOS menu rows fill with the accent blue on hover, unlike Windows' grey. */
  const menuItem =
    'w-full rounded-[5px] px-3 py-[5px] text-left text-[13px] text-white/90 transition-colors hover:bg-[#0058d0] hover:text-white disabled:cursor-not-allowed disabled:text-white/25 disabled:hover:bg-transparent';

  return (
    <div
      className="absolute inset-0"
      onPointerDown={() => setSelected(null)}
      onContextMenu={(e) => openMenu(e, null)}
    >
      {nodes.map((node) => {
        const pos = positions[node.path];
        if (!pos) return null;
        const isSelected = selected === node.path;

        return (
          <button
            key={node.path}
            {...handlers}
            onPointerDown={(e) => handlers.onPointerDown(e, node)}
            onDoubleClick={() => handleOpen(node)}
            onContextMenu={(e) => openMenu(e, node)}
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
              className={`flex h-full w-full flex-col items-center justify-start gap-1.5 rounded-lg p-1.5 text-center ${
                pressed === node.path ? 'anim-icon-open' : ''
              }`}
            >
              <img
                src={macNodeIcon(node)}
                alt=""
                className={`pointer-events-none h-12 w-12 rounded-[22%] object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)] transition-[background] ${
                  isSelected ? 'bg-white/25' : ''
                }`}
              />
              {/* The label chip: solid blue when selected — the macOS tell. */}
              <span
                className={`pointer-events-none line-clamp-2 w-full break-words rounded-[4px] px-1 text-[11.5px] font-medium leading-tight text-white ${
                  isSelected ? 'bg-[#0a84ff]' : ''
                }`}
                style={{
                  textShadow: isSelected ? 'none' : '0 1px 3px rgb(0 0 0 / 0.85)',
                  fontFamily: FONT,
                }}
              >
                {node.name}
              </span>
            </div>
          </button>
        );
      })}

      {/* ════════════════════════════════════════════════ macOS context menu */}
      {menu && (
        <div
          className="fixed z-[10000] w-[210px] rounded-[10px] p-[5px] anim-mac-menu"
          style={{
            left: Math.min(menu.x, window.innerWidth - 226),
            top: Math.min(menu.y, window.innerHeight - 240),
            background: 'rgba(40, 40, 44, 0.86)',
            backdropFilter: 'blur(60px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(60px) saturate(1.8)',
            border: '0.5px solid rgba(255,255,255,0.16)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            fontFamily: FONT,
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {menu.node ? (
            <>
              <button className={menuItem} onClick={() => handleOpen(menu.node!)}>
                Open
              </button>
              <button className={menuItem} disabled>
                Get Info
              </button>
              <div className="mx-3 my-[4px] border-t border-white/[0.12]" />
              <button
                className={menuItem}
                disabled={menu.node.system}
                title={menu.node.system ? 'This item is required by macOS' : undefined}
                onClick={() => {
                  onDelete(menu.node!);
                  setMenu(null);
                }}
              >
                Move to Trash
              </button>
              <button className={menuItem} disabled>
                Rename
              </button>
              <div className="mx-3 my-[4px] border-t border-white/[0.12]" />
              <button className={menuItem} disabled>
                Quick Look
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
                New Terminal Here
              </button>
              <button className={menuItem} disabled>
                New Folder
              </button>
              <div className="mx-3 my-[4px] border-t border-white/[0.12]" />
              <button className={menuItem} disabled>
                Clean Up
              </button>
              <button className={menuItem} disabled>
                Show View Options
              </button>
              <div className="mx-3 my-[4px] border-t border-white/[0.12]" />
              <button
                className={menuItem}
                onClick={() => {
                  onOpenSettings();
                  setMenu(null);
                }}
              >
                Change Desktop Background…
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
