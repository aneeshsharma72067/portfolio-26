import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DESKTOP, lookup } from '@/os/fs';
import { SKINS } from '@/os/skins';
import { useWindows } from '@/os/useWindows';
import type { AppId, FileNode, SkinId } from '@/os/types';

/**
 * useOsShell — the machinery every OS shell needs, and nothing else.
 *
 * Strictly non-visual: a window manager instance, the measured work area, the
 * "what opens what" routing, and the active theme as CSS custom properties.
 * Each OS calls this once and then draws whatever chrome it likes; there is no
 * shared markup between Windows and macOS, so their layouts cannot conflict.
 *
 * Because it is called from inside each OS component, mounting a different OS
 * mounts a fresh shell — windows do not survive an OS switch, which is exactly
 * the "different OS loads on selection" behaviour we want.
 *
 * @param skinId       which theme table to read
 * @param openMaximized true → new windows fill the work area (Windows behaviour)
 */
export function useOsShell(skinId: SkinId, openMaximized: boolean) {
  const skin = SKINS[skinId];
  const { windows, open, close, focus, minimize, toggleMax, commit } =
    useWindows(openMaximized);

  /* ------------------------------------------------------- work-area bounds */

  /**
   * Windows are positioned in pixels, so the manager needs the live size of the
   * area they're allowed to occupy (the desktop minus the OS's own bars).
   * Measured with a ResizeObserver rather than a window resize listener so bar
   * height changes are picked up too.
   */
  const areaRef = useRef<HTMLDivElement | null>(null);
  const [desktop, setDesktop] = useState({ w: 1280, h: 720 });

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDesktop({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ------------------------------------------------------------- opening */

  const openNode = useCallback(
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

  /** Launch an app from a panel / dock / menu rather than from a file. */
  const openApp = useCallback(
    (app: Extract<AppId, 'files' | 'settings' | 'photos' | 'notes'>) => {
      /* Notes and Photos read no file, but the window manager keys windows by
         path, so they get their own synthetic ones. Reusing a real file's path
         here would make launching Notes merely focus an already-open README
         window instead of opening the app. */
      if (app === 'notes' || app === 'photos') {
        const title = app === 'notes' ? 'Notes' : 'Photos';
        open(
          { path: `/apps/${app}`, name: title, kind: 'file', app, icon: 'FileText' },
          desktop,
        );
        return;
      }
      const node = lookup(
        app === 'files' ? '/home/aneesh/Desktop' : '/home/aneesh/Desktop/settings',
      );
      if (node) openNode(node);
    },
    [openNode, open, desktop],
  );

  /* The theme as CSS custom properties. Memoised so an unrelated re-render (a
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

  /** The top-most non-minimized window — the one that reads as focused. */
  const activeWindowId = useMemo(() => {
    const visible = windows.filter((w) => !w.minimized);
    if (visible.length === 0) return null;
    return visible.reduce((top, w) => (w.z > top.z ? w : top), visible[0]).id;
  }, [windows]);

  return {
    skin,
    nodes: DESKTOP,
    /** Attach to the element bounding the window layer (the work area). */
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
  };
}
