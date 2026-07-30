import { lookup } from '@/os/fs';
import type { AppId, FileNode, SkinId, WindowState } from '@/os/types';
import { useOsShell } from '../shared/useOsShell';
import DesktopIcons from '../shared/DesktopIcons';
import WindowFrame from '../shared/WindowFrame';
import MacTitlebar from './MacTitlebar';
import MacMenuBar from './MacMenuBar';
import MacDock from './MacDock';
import { macNodeIcon } from './macIcons';

import MacFinder from '../apps/MacFinder';
import MacSettings from '../apps/MacSettings';
import Reader from '../apps/Reader';
import ImageViewer from '../apps/ImageViewer';
import Photos from '../apps/Photos';
import Notes from '../apps/Notes';

/** Apps that can be launched from the dock / Apple menu (not from a file). */
export type LaunchableApp = Extract<AppId, 'files' | 'settings' | 'photos' | 'notes'>;

type Props = {
  onSkinChange: (id: SkinId) => void;
  onNavigate: (path: string) => void;
};

/** Desktop icon cell. macOS labels are wider and the rows taller than Windows'. */
const CELL = { w: 92, h: 96 };

/** The name macOS shows in the menubar for each app. */
const APP_NAMES: Record<AppId, string> = {
  files: 'Finder',
  settings: 'System Settings',
  photos: 'Photos',
  notes: 'Notes',
  reader: 'TextEdit',
  image: 'Preview',
};

/** Routes a window to its macOS-flavoured app. Finder and Settings are
 *  macOS-only components; the document viewers are chrome-light enough to be
 *  shared without either OS's look leaking into the other. */
function MacAppContent({
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
      return <MacFinder initialPath={win.path} onOpenNode={onOpenNode} />;
    case 'settings':
      return <MacSettings activeSkinId="mac" onSkinChange={onSkinChange} />;
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
 * MacOS — the complete macOS Sonoma desktop, mounted only while macOS is the
 * selected OS.
 *
 * Nothing in here is shared with `WindowsOS` beyond three deliberately
 * non-visual pieces: `useOsShell` (window manager + work-area measurement),
 * `WindowFrame` (drag/resize geometry) and `DesktopIcons` (drag positioning).
 * Every pixel — menubar, dock, titlebar, icon treatment, Finder, Settings — is
 * macOS-only.
 *
 * macOS-specific behaviour: apps open **floating and cascaded**, never
 * maximized (`useOsShell(_, false)`), matching how macOS launches apps.
 */
export default function MacOS({ onSkinChange, onNavigate }: Props) {
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
  } = useOsShell('mac', false);

  /* The menubar names the frontmost app; with nothing open, macOS shows Finder. */
  const front = windows.find((w) => w.id === activeWindowId);
  const activeApp = front ? APP_NAMES[front.app] : 'Finder';

  return (
    <div
      className="fixed inset-0 cursor-default select-none overflow-hidden"
      style={{ ...skinVars, background: skin.wallpaper }}
    >
      {/**
       * The work area: below the 26px menubar and above the dock's footprint.
       * Zooming a window fills exactly this, so the dock is never covered and a
       * titlebar can never hide under the menubar.
       */}
      <div ref={areaRef} className="absolute inset-x-0 bottom-[84px] top-[26px]">
        <DesktopIcons
          nodes={nodes}
          desktop={desktop}
          cell={CELL}
          origin="top-right"
          onOpen={openNode}
          renderIcon={(node, selected) => (
            <div
              className={`flex h-full w-full flex-col items-center justify-start gap-1.5 rounded-lg p-1.5 pt-1.5 text-center transition-colors ${
                selected ? 'bg-white/25' : 'hover:bg-white/10'
              }`}
            >
              <img
                src={macNodeIcon(node)}
                alt=""
                className="pointer-events-none h-[46px] w-[46px] rounded-[22%] object-contain drop-shadow-md"
              />
              <span
                className={`pointer-events-none line-clamp-2 w-full break-words rounded px-1 text-[11.5px] font-medium leading-tight text-white ${
                  selected ? 'bg-[#0a84ff]' : ''
                }`}
                style={{
                  textShadow: selected ? 'none' : '0 1px 3px rgb(0 0 0 / 0.85)',
                  fontFamily: "'SF Pro', -apple-system, sans-serif",
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
            radius="12px"
            background="rgba(30, 30, 34, 0.80)"
            border="rgba(255,255,255,0.16)"
            onFocus={focus}
            onCommit={commit}
            onToggleMax={toggleMax}
            titlebar={(dragProps) => (
              <MacTitlebar
                win={win}
                focused={win.id === activeWindowId}
                dragProps={dragProps}
                onMinimize={minimize}
                onToggleMax={toggleMax}
                onClose={close}
              />
            )}
          >
            <MacAppContent win={win} onOpenNode={openNode} onSkinChange={onSkinChange} />
          </WindowFrame>
        ))}
      </div>

      <MacMenuBar
        activeApp={activeApp}
        onOpenApp={openApp}
        onSkinChange={onSkinChange}
        onNavigate={onNavigate}
      />

      <MacDock
        windows={windows}
        activeWindowId={activeWindowId}
        onOpenApp={openApp}
        onFocusWindow={focus}
        onMinimizeWindow={minimize}
      />
    </div>
  );
}
