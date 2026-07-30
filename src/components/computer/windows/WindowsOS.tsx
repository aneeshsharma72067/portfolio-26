import { lookup } from '@/os/fs';
import type { AppId, FileNode, SkinId, WindowState } from '@/os/types';
import { useOsShell } from '../shared/useOsShell';
import DesktopIcons from '../shared/DesktopIcons';
import WindowFrame from '../shared/WindowFrame';
import WinTitlebar from './WinTitlebar';
import WinTaskbar from './WinTaskbar';
import { winNodeIcon } from './winIcons';

import WinExplorer from '../apps/WinExplorer';
import WinSettings from '../apps/WinSettings';
import Reader from '../apps/Reader';
import ImageViewer from '../apps/ImageViewer';
import Photos from '../apps/Photos';
import Notes from '../apps/Notes';

/** Apps that can be launched from the taskbar / Start menu (not from a file). */
export type LaunchableApp = Extract<AppId, 'files' | 'settings' | 'photos' | 'notes'>;

type Props = {
  onSkinChange: (id: SkinId) => void;
  onNavigate: (path: string) => void;
};

/** Desktop icon cell. Windows' grid is tighter and squarer than macOS's. */
const CELL = { w: 80, h: 88 };

/** Routes a window to its Windows-flavoured app. Explorer and Settings are
 *  Windows-only components; the document viewers are chrome-light enough to be
 *  shared without either OS's look leaking into the other. */
function WinAppContent({
  win,
  onOpenNode,
  onSkinChange,
}: {
  win: WindowState;
  onOpenNode: (node: FileNode) => void;
  onSkinChange: (id: SkinId) => void;
}) {
  const file = lookup(win.path);

  switch (win.app) {
    case 'files':
      return <WinExplorer initialPath={win.path} onOpenNode={onOpenNode} />;
    case 'settings':
      return <WinSettings activeSkinId="windows" onSkinChange={onSkinChange} />;
    case 'reader':
      return <Reader path={win.path} name={win.title} body={file?.body} size={file?.size} />;
    case 'image':
      return <ImageViewer name={win.title} src={file?.src} />;
    case 'photos':
      return <Photos />;
    case 'notes':
      return <Notes />;
    default:
      return null;
  }
}

/**
 * WindowsOS — the complete Windows 11 desktop, mounted only while Windows is the
 * selected OS.
 *
 * Nothing in here is shared with `MacOS` beyond three deliberately non-visual
 * pieces: `useOsShell` (window manager + work-area measurement), `WindowFrame`
 * (drag/resize geometry) and `DesktopIcons` (drag positioning). Every pixel —
 * taskbar, titlebar, icon treatment, Explorer, Settings — is Windows-only, so
 * changing one OS's look can't disturb the other.
 *
 * Windows-specific behaviour: apps open **maximized** (`useOsShell(_, true)`),
 * filling the work area above the taskbar, matching how Windows 11 launches apps.
 */
export default function WindowsOS({ onSkinChange, onNavigate }: Props) {
  const {
    skin,
    nodes,
    areaRef,
    desktop,
    skinVars,
    windows,
    activeWindowId,
    openNode,
    openApp,
    close,
    focus,
    minimize,
    toggleMax,
    commit,
  } = useOsShell('windows', true);

  return (
    <div
      className="fixed inset-0 cursor-default select-none overflow-hidden"
      style={{ ...skinVars, background: skin.wallpaper }}
    >
      {/**
       * The work area: everything above the 48px taskbar. Windows and icons live
       * inside it, so a maximized window ends exactly where the taskbar starts
       * and nothing is ever hidden behind it.
       */}
      <div ref={areaRef} className="absolute inset-x-0 bottom-12 top-0">
        <DesktopIcons
          nodes={nodes}
          desktop={desktop}
          cell={CELL}
          origin="top-left"
          onOpen={openNode}
          renderIcon={(node, selected) => (
            <div
              className={`flex h-full w-full flex-col items-center justify-start gap-1 rounded-[3px] p-1 pt-2 text-center transition-colors ${
                selected ? 'bg-[#0078d4]/40 ring-1 ring-[#0078d4]/70' : 'hover:bg-white/10'
              }`}
            >
              <img
                src={winNodeIcon(node)}
                alt=""
                className="pointer-events-none h-9 w-9 object-contain drop-shadow"
              />
              <span
                className="pointer-events-none line-clamp-2 w-full break-words px-0.5 text-[11px] leading-tight text-white"
                style={{
                  textShadow: '0 1px 3px rgb(0 0 0 / 0.9)',
                  fontFamily: "'Segoe UI VF', 'Segoe UI Variable', 'Segoe UI', sans-serif",
                }}
              >
                {node.name}
              </span>
            </div>
          )}
        />

        {windows.map((win) => (
          <WindowFrame
            key={win.id}
            win={win}
            focused={win.id === activeWindowId}
            desktop={desktop}
            radius="8px"
            background="rgba(31, 31, 31, 0.94)"
            border="rgba(255,255,255,0.10)"
            onFocus={focus}
            onCommit={commit}
            onToggleMax={toggleMax}
            titlebar={(dragProps) => (
              <WinTitlebar
                win={win}
                focused={win.id === activeWindowId}
                dragProps={dragProps}
                onMinimize={minimize}
                onToggleMax={toggleMax}
                onClose={close}
              />
            )}
          >
            <WinAppContent win={win} onOpenNode={openNode} onSkinChange={onSkinChange} />
          </WindowFrame>
        ))}
      </div>

      <WinTaskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onOpenApp={openApp}
        onFocusWindow={focus}
        onMinimizeWindow={minimize}
        onSkinChange={onSkinChange}
        onNavigate={onNavigate}
      />
    </div>
  );
}
