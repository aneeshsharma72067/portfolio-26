import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getDisk, lookup, __selfCheck } from './fs';
import { SKINS } from './skins';
import { useWindows } from './useWindows';
import type { AppId, FileNode, LaunchableApp, SkinId } from './types';

/**
 * useOsShell — the machinery every OS shell needs, and nothing else.
 *
 * Strictly non-visual: a window manager instance, the platform's filesystem, the
 * measured work area, "what opens what" routing, the recycle bin, and the active
 * theme as CSS custom properties. Each OS calls this once and then draws
 * whatever chrome it likes; there is no shared markup between Windows and macOS,
 * so their layouts cannot conflict.
 *
 * Because it is called from inside each OS component, mounting a different OS
 * mounts a fresh shell — windows and deleted files do not survive an OS switch,
 * which is exactly the "different computer boots" behaviour we want.
 *
 * @param skinId        which platform (theme table + which disk to mount)
 * @param openMaximized true → new windows fill the work area (Windows behaviour)
 */
export function useOsShell(skinId: SkinId, openMaximized: boolean) {
  const skin = SKINS[skinId];
  const disk = getDisk(skinId);

  const {
    windows,
    open,
    close,
    settle,
    focus,
    minimize,
    toggleMax,
    commit,
  } = useWindows(openMaximized);

  /* The filesystem is generated, so a bad edit to `content.ts` or the builder
     shows up as a broken tree. Assert it once at boot, in dev only. */
  useEffect(() => {
    if (import.meta.env.DEV) __selfCheck();
  }, []);

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

  /* ------------------------------------------------------------ recycle bin */

  /**
   * Paths the user has "deleted" this session, and the nodes themselves so the
   * bin can list and restore them.
   *
   * Deletion is per-session and never touches the generated tree — the disk is
   * built at module scope and shared, so mutating it would leak across an OS
   * switch and, worse, across a page's lifetime in dev with HMR.
   */
  const [trashed, setTrashed] = useState<FileNode[]>([]);
  const trashedPaths = useMemo(() => new Set(trashed.map((n) => n.path)), [trashed]);

  /** Move a node to the bin. System files refuse, exactly like the real thing. */
  const moveToTrash = useCallback((node: FileNode) => {
    if (node.system) return false;
    setTrashed((prev) => (prev.some((n) => n.path === node.path) ? prev : [...prev, node]));
    return true;
  }, []);

  const restoreFromTrash = useCallback((path: string) => {
    setTrashed((prev) => prev.filter((n) => n.path !== path));
  }, []);

  const emptyTrash = useCallback(() => setTrashed([]), []);

  /* ------------------------------------------------------------- filtering */

  /** Hide trashed nodes from any listing without touching the source tree. */
  const visibleChildren = useCallback(
    (node: FileNode | undefined): FileNode[] =>
      (node?.children ?? []).filter((c) => !trashedPaths.has(c.path)),
    [trashedPaths],
  );

  /** The desktop's icons: its folder's children, minus anything binned. */
  const desktopNodes = useMemo(
    () => visibleChildren(lookup(skinId, disk.paths.desktop)),
    [visibleChildren, skinId, disk.paths.desktop],
  );

  /* --------------------------------------------------------------- opening */

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

  /**
   * Launch an app from a panel / dock / menu rather than from a file.
   *
   * Apps that read no file (Terminal, Calculator, Task Manager, the bin, Notes,
   * Photos) get a synthetic path. The window manager keys windows by path, so
   * reusing a real file's path here would make launching Notes merely focus an
   * already-open README window instead of opening the app.
   */
  const openApp = useCallback(
    (app: LaunchableApp, title?: string) => {
      if (app === 'files') {
        const node = lookup(skinId, disk.paths.home);
        if (node) open(node, desktop);
        return;
      }
      open(
        {
          path: `/apps/${app}`,
          name: title ?? app,
          kind: 'file',
          app,
        },
        desktop,
        title,
      );
    },
    [open, desktop, skinId, disk.paths.home],
  );

  /** Open the file manager at a specific folder — used by dock/taskbar shortcuts. */
  const openFolder = useCallback(
    (path: string) => {
      const node = lookup(skinId, path);
      if (node) open(node, desktop);
    },
    [open, desktop, skinId],
  );

  /* ----------------------------------------------------------------- theme */

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
    const visible = windows.filter((w) => !w.minimized && w.phase !== 'closing');
    if (visible.length === 0) return null;
    return visible.reduce((top, w) => (w.z > top.z ? w : top), visible[0]).id;
  }, [windows]);

  /** Resolve the node a window was opened on. */
  const nodeFor = useCallback(
    (path: string): FileNode | undefined => lookup(skinId, path),
    [skinId],
  );

  return {
    skin,
    platform: skinId,
    disk,
    /** Desktop icons for this platform, minus anything in the bin. */
    nodes: desktopNodes,
    /** Attach to the element bounding the window layer (the work area). */
    areaRef,
    desktop,
    skinVars,
    windows,
    activeWindowId,
    /* filesystem */
    nodeFor,
    visibleChildren,
    /* opening */
    openNode,
    openApp,
    openFolder,
    /* window control */
    close,
    settle,
    focus,
    minimize,
    toggleMax,
    commit,
    /* recycle bin */
    trashed,
    moveToTrash,
    restoreFromTrash,
    emptyTrash,
  };
}

/** Narrowed app-routing helper both shells use in their `switch`. */
export type { AppId, LaunchableApp };
