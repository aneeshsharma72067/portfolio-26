import { useCallback } from 'react';
import type { FileNode, SkinId, WindowState } from '@/os/types';
import { useOsShell } from '@/os/useOsShell';
import WinDesktop from './WinDesktop';
import WinWindow from './WinWindow';
import WinTaskbar from './WinTaskbar';

import WinExplorer from './WinExplorer';
import WinTerminal from './WinTerminal';
import WinTaskManager from './WinTaskManager';
import WinCalculator from './WinCalculator';
import WinRecycleBin from './WinRecycleBin';
import WinSettings from './WinSettings';
import WinPhotos from './WinPhotos';
import WinNotepad from './WinNotepad';
import WinTextViewer from './WinTextViewer';
import WinImageViewer from './WinImageViewer';

type Props = {
  onSkinChange: (id: SkinId) => void;
  onNavigate: (path: string) => void;
};

/**
 * WindowsOS — the complete Windows 11 desktop, mounted only while Windows is
 * the selected OS.
 *
 * Nothing in here is shared with `MacOS` at the component level. Every pixel —
 * taskbar, window frame, titlebar, icon layer, Explorer, Terminal, Task
 * Manager, Calculator, Recycle Bin — is a Windows-only component. What the two
 * shells DO share lives in `src/os/` and is strictly non-visual: the window
 * manager, the drag/resize maths, the filesystem, the shell interpreter, the
 * process sampler and the calculator's arithmetic. Duplicating those would mean
 * two copies of every future geometry bug, and no visual benefit at all.
 *
 * Windows-specific behaviour:
 *  · apps open MAXIMIZED (`useOsShell(_, true)`), filling the work area above
 *    the taskbar, matching how Windows 11 launches apps
 *  · windows animate in with the restrained Fluent curve (see index.css)
 *  · the work area stops at the 48px taskbar, so a maximized window ends
 *    exactly where the taskbar starts and nothing hides behind it
 */
export default function WindowsOS({ onSkinChange, onNavigate }: Props) {
  const shell = useOsShell('windows', true);
  const {
    skin,
    disk,
    nodes,
    areaRef,
    desktop,
    skinVars,
    windows,
    activeWindowId,
    nodeFor,
    visibleChildren,
    openNode,
    openApp,
    close,
    settle,
    focus,
    minimize,
    toggleMax,
    commit,
    trashed,
    moveToTrash,
    restoreFromTrash,
    emptyTrash,
  } = shell;

  /** The terminal's `open <path>` bridges back into the GUI. */
  const openByPath = useCallback(
    (path: string) => {
      const node = nodeFor(path);
      if (node) openNode(node);
    },
    [nodeFor, openNode],
  );

  /**
   * Routes a window to its Windows app.
   *
   * Declared inside the component so each app gets the shell's callbacks
   * without a props-drilling layer; it re-creates cheaply because every child
   * that matters is memoised on its own inputs.
   */
  const renderApp = (win: WindowState) => {
    const file = nodeFor(win.path);

    switch (win.app) {
      case 'files':
        return (
          <WinExplorer
            initialPath={win.path}
            onOpenNode={openNode}
            visibleChildren={visibleChildren}
            onDelete={moveToTrash}
          />
        );
      case 'terminal':
        return (
          <WinTerminal
            initialCwd={disk.paths.home}
            onOpenPath={openByPath}
            onExit={() => close(win.id)}
          />
        );
      case 'taskmgr':
        return <WinTaskManager windows={windows} onEndTask={close} />;
      case 'calc':
        return <WinCalculator />;
      case 'trash':
        return (
          <WinRecycleBin
            items={trashed}
            onRestore={restoreFromTrash}
            onEmpty={emptyTrash}
          />
        );
      case 'settings':
        return <WinSettings activeSkinId="windows" onSkinChange={onSkinChange} />;
      case 'photos':
        return <WinPhotos />;
      case 'notes':
        return <WinNotepad />;
      case 'reader':
        return <WinTextViewer name={win.title} body={file?.body} size={file?.size} />;
      case 'image':
        return <WinImageViewer name={win.title} src={file?.src} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 cursor-default select-none overflow-hidden"
      style={{ ...skinVars, background: skin.wallpaper }}
    >
      {/**
       * The work area: everything above the 48px taskbar. Windows and icons live
       * inside it, so a maximized window ends exactly where the taskbar starts.
       */}
      <div ref={areaRef} className="absolute inset-x-0 bottom-12 top-0">
        <WinDesktop
          nodes={nodes}
          desktop={desktop}
          onOpen={openNode}
          onDelete={moveToTrash}
          onOpenTerminal={() => openApp('terminal', 'Terminal')}
          onOpenSettings={() => openApp('settings', 'Settings')}
        />

        {windows.map((win) => (
          <WinWindow
            key={win.id}
            win={win}
            focused={win.id === activeWindowId}
            desktop={desktop}
            onFocus={focus}
            onCommit={commit}
            onToggleMax={toggleMax}
            onMinimize={minimize}
            onClose={close}
            onSettled={settle}
          >
            {renderApp(win)}
          </WinWindow>
        ))}
      </div>

      <WinTaskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onOpenApp={openApp}
        onOpenNode={openNode}
        onFocusWindow={focus}
        onMinimizeWindow={minimize}
        onSkinChange={onSkinChange}
        onNavigate={onNavigate}
      />
    </div>
  );
}
