import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SKINS, loadSkin, saveSkin } from '@/os/skins';
import { DESKTOP, lookup } from '@/os/fs';
import { useWindows } from '@/os/useWindows';
import type { FileNode, SkinId } from '@/os/types';
import Desktop from './Desktop';
import Window from './Window';
import Panel from './Panel';
import { MacOSDock } from './MacOSDock';

// Lazy load app components to keep the initial chunk size minimal
import Files from './apps/Files';
import Reader from './apps/Reader';
import ImageViewer from './apps/ImageViewer';
import Settings from './apps/Settings';

type Props = {
  /** Route change through App's preloader transition (used by "log out"). */
  onNavigate: (path: string) => void;
};

/**
 * Computer — root of the /computer virtual desktop.
 *
 * Owns the active OS skin, the desktop size, and the window manager. Everything
 * visual about the five operating systems is data (`os/skins.ts`) written here
 * as CSS custom properties on ONE root div — not on `document.documentElement`,
 * so the main site's theme vars are untouched and switching OS invalidates
 * style on a single subtree.
 */
export default function Computer({ onNavigate }: Props) {
  const [skinId, setSkinId] = useState<SkinId>(loadSkin);
  const skin = SKINS[skinId];

  const { windows, topZ, open, close, focus, minimize, toggleMax, commit } = useWindows();

  /* Persist the OS choice whenever it changes. */
  useEffect(() => {
    saveSkin(skinId);
  }, [skinId]);

  /* ------------------------------------------------------- desktop bounds */

  /**
   * Windows are positioned in pixels, so the manager needs the live desktop
   * size. Measured with a ResizeObserver rather than a window resize listener
   * so panel/menubar height changes (which happen when the skin switches) are
   * picked up too.
   */
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [desktop, setDesktop] = useState({ w: 1280, h: 720 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDesktop({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ------------------------------------------------------------ opening */

  const handleOpen = useCallback(
    (node: FileNode) => {
      /* External shortcuts (`.url`, resume.pdf) are real links — open a tab
         instead of faking a browser we don't have. */
      if (node.href) {
        window.open(node.href, '_blank', 'noopener,noreferrer');
        return;
      }
      open(node, desktop);
    },
    [open, desktop],
  );

  const handleOpenApp = useCallback(
    (app: 'files' | 'settings') => {
      const path = app === 'files' ? '/home/aneesh/Desktop' : '/home/aneesh/Desktop/settings';
      const node = lookup(path);
      if (node) {
        handleOpen(node);
      }
    },
    [handleOpen],
  );

  /* The skin as CSS custom properties. Memoised so an unrelated re-render (a
     window gaining focus) doesn't hand React a fresh style object and force a
     style recalculation on the whole subtree. */
  const skinVars = useMemo(
    () =>
      ({
        '--os-accent': skin.accentRgb,
        '--os-window-bg': skin.windowBg,
        '--os-chrome-bg': skin.chromeBg,
        '--os-chrome-text': skin.chromeText,
        '--os-border': skin.border,
        '--os-radius': skin.radius,
        '--os-panel-bg': skin.panelBg,
        '--os-panel-text': skin.panelText,
        fontFamily: skin.font,
      }) as React.CSSProperties,
      [skin],
  );

  // Determine active focused window's ID
  const activeWindowId = useMemo(() => {
    const active = windows.filter(w => !w.minimized);
    if (active.length === 0) return null;
    return active.reduce((top, w) => (w.z > top.z ? w : top), active[0]).id;
  }, [windows]);

  return (
    <div
      className="fixed inset-0 select-none overflow-hidden cursor-default"
      style={{ ...skinVars, background: skin.wallpaper, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Desktop layer — the icon grid sits directly on the wallpaper. The
          window layer is a sibling above it, so icons never intercept a drag. */}
      <div
        ref={rootRef}
        className={`absolute inset-0 ${
          skin.panel === 'dock' ? 'top-[25px]' :
          skin.panel === 'topbar' || skin.panel === 'panel' ? 'top-8' : ''
        } ${
          skin.panel === 'taskbar' ? 'bottom-12' :
          skin.panel === 'dock' ? 'pb-[76px]' :
          skin.panel === 'bar' ? 'bottom-6' : ''
        }`}
      >
        <Desktop nodes={DESKTOP} onOpen={handleOpen} />

        {windows.map((win) => {
          const file = lookup(win.path);
          return (
            <Window
              key={win.id}
              win={win}
              skin={skin}
              focused={win.id === activeWindowId}
              desktop={desktop}
              onFocus={focus}
              onClose={close}
              onMinimize={minimize}
              onToggleMax={toggleMax}
              onCommit={commit}
            >
              {/* Dynamically render application inside window frame */}
              {win.app === 'files' && (
                <Files initialPath={win.path} onOpenNode={handleOpen} />
              )}
              {win.app === 'reader' && (
                <Reader
                  path={win.path}
                  name={win.title}
                  body={file?.body}
                  size={file?.size}
                />
              )}
              {win.app === 'image' && (
                <ImageViewer name={win.title} src={file?.src} />
              )}
              {win.app === 'settings' && (
                <Settings activeSkinId={skinId} onSkinChange={setSkinId} />
              )}
            </Window>
          );
        })}
      </div>

      {/* System Panel (dock/taskbar/topbar) */}
      <Panel
        skin={skin}
        skinId={skinId}
        onSkinChange={setSkinId}
        onNavigate={onNavigate}
        windows={windows}
        activeWindowId={activeWindowId}
        onFocusWindow={focus}
        onMinimizeWindow={minimize}
        onOpenApp={handleOpenApp}
      />

      {/* macOS gets its own dedicated animated dock */}
      {skin.panel === 'dock' && (
        <MacOSDock
          onOpenApp={handleOpenApp}
          windows={windows}
          activeWindowId={activeWindowId}
          onFocusWindow={focus}
          onMinimizeWindow={minimize}
        />
      )}
    </div>
  );
}
