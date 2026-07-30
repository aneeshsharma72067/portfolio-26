import { useCallback, useEffect, useReducer } from 'react';
import type { AppId, FileNode, WindowState } from './types';
import type { Rect } from './useDrag';

/**
 * useWindows — the window manager.
 *
 * A reducer rather than a pile of useStates because almost every action touches
 * two fields at once (focusing bumps `z` AND clears `minimized`; opening
 * appends AND focuses). One transition function keeps those invariants in a
 * single readable place.
 *
 * Each OS shell (Windows / macOS) instantiates its OWN manager, so their window
 * stacks are completely independent — switching OS starts from a clean desktop
 * and no geometry or z-order leaks across.
 *
 * Geometry committed here is the resting position only. While a drag is in
 * flight `useDrag` writes transforms directly to the DOM and dispatches nothing,
 * so a 3-second drag produces exactly one dispatch.
 */

type Action =
  | { type: 'open'; node: FileNode; desktop: { w: number; h: number } }
  | { type: 'close'; id: string }
  | { type: 'focus'; id: string }
  | { type: 'minimize'; id: string }
  | { type: 'toggleMax'; id: string }
  | { type: 'commit'; id: string; rect: Rect }
  | { type: 'closeAll' };

interface State {
  windows: WindowState[];
  /** Monotonic z counter; also the "next window" cascade seed. */
  topZ: number;
  /** How many windows have been opened this session, for cascade offsets. */
  opened: number;
  /**
   * Whether a freshly opened window starts maximized. Windows 11 opens apps
   * filling the work area; macOS opens them as floating, cascaded windows.
   */
  openMaximized: boolean;
}

/** Default size per app — a file listing wants width, a document wants height. */
const DEFAULT_SIZE: Record<AppId, { w: number; h: number }> = {
  files: { w: 760, h: 480 },
  reader: { w: 620, h: 560 },
  image: { w: 720, h: 520 },
  settings: { w: 560, h: 440 },
  photos: { w: 780, h: 520 },
  notes: { w: 740, h: 500 },
};

/** Cap so a window opened on a small desktop is never born off-screen. */
const fitToDesktop = (
  size: { w: number; h: number } | undefined,
  desktop: { w: number; h: number },
) => {
  const fallback = size ?? { w: 680, h: 480 };
  return {
    w: Math.min(fallback.w, Math.max(320, desktop.w - 80)),
    h: Math.min(fallback.h, Math.max(200, desktop.h - 120)),
  };
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open': {
      const { node, desktop } = action;

      /* Re-open semantics: if this exact path is already open, focus it rather
         than stacking a duplicate. Matches every real file manager. */
      const existing = state.windows.find((w) => w.path === node.path);
      if (existing) return reducer(state, { type: 'focus', id: existing.id });

      const size = fitToDesktop(DEFAULT_SIZE[node.app], desktop);
      // Cascade each new window down-right, wrapping every 6 so they stay visible.
      const step = (state.opened % 6) * 28;
      const z = state.topZ + 1;

      return {
        ...state,
        windows: [
          ...state.windows,
          {
            // Path alone isn't unique enough long-term (Settings can be opened
            // from two places), so pair it with the z counter.
            id: `${node.path}#${z}`,
            app: node.app,
            title: node.name,
            path: node.path,
            // The stored rect is what un-maximizing restores to, so it is filled
            // in even when the window is born maximized.
            x: Math.max(0, Math.round((desktop.w - size.w) / 2 - 60) + step),
            y: Math.max(0, Math.round((desktop.h - size.h) / 2 - 40) + step),
            ...size,
            z,
            minimized: false,
            maximized: state.openMaximized,
          },
        ],
        topZ: z,
        opened: state.opened + 1,
      };
    }

    case 'close':
      return { ...state, windows: state.windows.filter((w) => w.id !== action.id) };

    case 'closeAll':
      return { ...state, windows: [] };

    case 'focus': {
      const target = state.windows.find((w) => w.id === action.id);
      // Already on top and visible → no-op, so clicking a focused window's body
      // doesn't churn state on every click.
      if (!target || (target.z === state.topZ && !target.minimized)) return state;
      const z = state.topZ + 1;
      return {
        ...state,
        topZ: z,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, z, minimized: false } : w,
        ),
      };
    }

    case 'minimize':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, minimized: true } : w,
        ),
      };

    case 'toggleMax':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, maximized: !w.maximized } : w,
        ),
      };

    case 'commit':
      return {
        ...state,
        windows: state.windows.map((w) =>
          // Committing geometry always means the window is floating: a drag or
          // resize can only happen once it has left the maximized state.
          w.id === action.id ? { ...w, ...action.rect, maximized: false } : w,
        ),
      };

    default:
      return state;
  }
}

/**
 * @param openMaximized true on Windows (apps fill the work area), false on macOS.
 */
export function useWindows(openMaximized = false) {
  const [state, dispatch] = useReducer(reducer, {
    windows: [],
    topZ: 10,
    opened: 0,
    openMaximized,
  });

  /* Stable action creators so children memoised with React.memo don't re-render
     just because the parent re-rendered. `dispatch` is already stable. */
  const open = useCallback(
    (node: FileNode, desktop: { w: number; h: number }) =>
      dispatch({ type: 'open', node, desktop }),
    [],
  );
  const close = useCallback((id: string) => dispatch({ type: 'close', id }), []);
  const focus = useCallback((id: string) => dispatch({ type: 'focus', id }), []);
  const minimize = useCallback((id: string) => dispatch({ type: 'minimize', id }), []);
  const toggleMax = useCallback((id: string) => dispatch({ type: 'toggleMax', id }), []);
  const commit = useCallback(
    (id: string, rect: Rect) => dispatch({ type: 'commit', id, rect }),
    [],
  );
  const closeAll = useCallback(() => dispatch({ type: 'closeAll' }), []);

  /* Esc closes the focused window — the one keyboard affordance worth having
     before a full shortcut layer. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || state.windows.length === 0) return;
      const top = state.windows.reduce((a, b) => (a.z > b.z ? a : b));
      close(top.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.windows, close]);

  return {
    windows: state.windows,
    topZ: state.topZ,
    open,
    close,
    focus,
    minimize,
    toggleMax,
    commit,
    closeAll,
  };
}
