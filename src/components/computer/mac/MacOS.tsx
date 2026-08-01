import { useCallback, useEffect, useState } from 'react';
import type { AppId, SkinId, WindowState } from '@/os/types';
import { useOsShell } from '@/os/useOsShell';
import MacDesktop from './MacDesktop';
import MacWindow from './MacWindow';
import MacMenuBar from './MacMenuBar';
import MacDock from './MacDock';
import MacSpotlight from './MacSpotlight';

import MacFinder from './MacFinder';
import MacTerminal from './MacTerminal';
import MacActivityMonitor from './MacActivityMonitor';
import MacCalculator from './MacCalculator';
import MacTrash from './MacTrash';
import MacSettings from './MacSettings';
import MacPhotos from './MacPhotos';
import MacNotes from './MacNotes';
import MacTextEdit from './MacTextEdit';
import MacPreview from './MacPreview';

type Props = {
  onSkinChange: (id: SkinId) => void;
  onNavigate: (path: string) => void;
};

/** The name macOS shows in the menubar for each app. */
const APP_NAMES: Record<AppId, string> = {
  files: 'Finder',
  settings: 'System Settings',
  photos: 'Photos',
  notes: 'Notes',
  reader: 'TextEdit',
  image: 'Preview',
  terminal: 'Terminal',
  taskmgr: 'Activity Monitor',
  trash: 'Finder',
  calc: 'Calculator',
};

/**
 * MacOS — the complete macOS Sonoma desktop, mounted only while macOS is the
 * selected OS.
 *
 * Nothing in here is shared with `WindowsOS` at the component level. Menubar,
 * dock, Spotlight, window frame, titlebar, icon layer, Finder, Terminal,
 * Activity Monitor, Calculator, Trash — all macOS-only. The shared code lives
 * in `src/os/` and is strictly non-visual (window manager, drag maths,
 * filesystem, shell interpreter, process sampler, calculator arithmetic).
 *
 * macOS-specific behaviour:
 *  · apps open FLOATING and CASCADED, never maximized (`useOsShell(_, false)`)
 *  · windows spring in with a slight overshoot rather than Windows' flat curve
 *  · ⌘-Space opens Spotlight — a centred panel that dims the desktop, which is
 *    structurally nothing like Windows' Start flyout
 *  · the work area sits below the 26px menubar and above the dock's footprint,
 *    so zooming never covers either
 */
export default function MacOS({ onSkinChange, onNavigate }: Props) {
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
  } = useOsShell('mac', false);

  const [spotlightOpen, setSpotlightOpen] = useState(false);

  /* ⌘-Space opens Spotlight; ⌘-K is offered too, because a browser may well
     have swallowed ⌘-Space before it reaches us. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.code === 'Space' || e.key === 'k')) {
        e.preventDefault();
        setSpotlightOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openByPath = useCallback(
    (path: string) => {
      const node = nodeFor(path);
      if (node) openNode(node);
    },
    [nodeFor, openNode],
  );

  /* The menubar names the frontmost app; with nothing open, macOS shows Finder. */
  const front = windows.find((w) => w.id === activeWindowId);
  const activeApp = front ? APP_NAMES[front.app] : 'Finder';

  /** Routes a window to its macOS app. */
  const renderApp = (win: WindowState) => {
    const file = nodeFor(win.path);

    switch (win.app) {
      case 'files':
        return (
          <MacFinder
            initialPath={win.path}
            onOpenNode={openNode}
            visibleChildren={visibleChildren}
            onDelete={moveToTrash}
          />
        );
      case 'terminal':
        return (
          <MacTerminal
            initialCwd={disk.paths.home}
            onOpenPath={openByPath}
            onExit={() => close(win.id)}
          />
        );
      case 'taskmgr':
        return <MacActivityMonitor windows={windows} onEndTask={close} />;
      case 'calc':
        return <MacCalculator />;
      case 'trash':
        return (
          <MacTrash items={trashed} onRestore={restoreFromTrash} onEmpty={emptyTrash} />
        );
      case 'settings':
        return <MacSettings activeSkinId="mac" onSkinChange={onSkinChange} />;
      case 'photos':
        return <MacPhotos />;
      case 'notes':
        return <MacNotes />;
      case 'reader':
        return <MacTextEdit name={win.title} body={file?.body} size={file?.size} />;
      case 'image':
        return <MacPreview name={win.title} src={file?.src} />;
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
       * The work area: below the 26px menubar and above the dock's footprint.
       * Zooming a window fills exactly this, so the dock is never covered and a
       * titlebar can never hide under the menubar.
       */}
      <div ref={areaRef} className="absolute inset-x-0 bottom-[84px] top-[26px]">
        <MacDesktop
          nodes={nodes}
          desktop={desktop}
          onOpen={openNode}
          onDelete={moveToTrash}
          onOpenTerminal={() => openApp('terminal', 'Terminal')}
          onOpenSettings={() => openApp('settings', 'System Settings')}
        />

        {windows.map((win) => (
          <MacWindow
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
          </MacWindow>
        ))}
      </div>

      <MacMenuBar
        activeApp={activeApp}
        onOpenApp={openApp}
        onSkinChange={onSkinChange}
        onNavigate={onNavigate}
        onOpenSpotlight={() => setSpotlightOpen(true)}
      />

      <MacDock
        windows={windows}
        activeWindowId={activeWindowId}
        onOpenApp={openApp}
        onFocusWindow={focus}
        onMinimizeWindow={minimize}
        trashCount={trashed.length}
      />

      <MacSpotlight
        open={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        onOpenNode={openNode}
        onOpenApp={openApp}
      />
    </div>
  );
}
