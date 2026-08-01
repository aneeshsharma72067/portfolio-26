/**
 * Shared types for the /computer virtual desktop.
 *
 * Kept in one small module so the filesystem, the window manager and the two OS
 * shells can reference each other's shapes without a circular import.
 *
 * IMPORTANT: everything in `src/os/` is the *engine* — geometry, filesystem,
 * window bookkeeping. It is deliberately free of anything visual. All chrome
 * (taskbars, docks, titlebars, app UI) lives under `components/computer/windows`
 * or `components/computer/mac` and is never shared between them.
 */

/* ---------------------------------------------------------------- platforms */

/**
 * The selectable operating systems.
 *
 * Each one is a SEPARATE shell component (`computer/windows/WindowsOS`,
 * `computer/mac/MacOS`) with its own window frame, its own desktop layer, its
 * own file manager and its own app set. Only one is mounted at a time, so their
 * layouts can never conflict.
 */
export type SkinId = 'windows' | 'mac';

/** Alias used by the filesystem, where "skin" would read oddly. */
export type Platform = SkinId;

/**
 * The per-OS *theme* values. Purely the paint: surfaces, radius, fonts. Layout
 * and chrome structure live in each OS's own components, so nothing here
 * describes "where the panel goes".
 */
export interface Skin {
  id: SkinId;
  label: string;
  /** Shown in Settings / the about dialog, e.g. "Windows 11". */
  version: string;
  /** Full CSS `background` shorthand for the wallpaper. */
  wallpaper: string;
  /** Accent as "R G B" channels so it can drive the existing --primary var. */
  accentRgb: string;
  /** Window body + titlebar surfaces (any valid CSS colour). */
  windowBg: string;
  chromeBg: string;
  chromeText: string;
  border: string;
  /** Corner radius applied to windows and menus. */
  radius: string;
  /** Font stack that reads as native for this OS. */
  font: string;
  /** Bar background — usually translucent, paired with a backdrop blur. */
  panelBg: string;
  /** Text/icon colour on the bar. */
  panelText: string;
}

/* --------------------------------------------------------------- filesystem */

/**
 * Which app opens a given node.
 *
 * `files` is the platform's file manager (Explorer / Finder); folders always
 * use it. The rest map to one window each.
 */
export type AppId =
  | 'files'
  | 'reader'
  | 'image'
  | 'settings'
  | 'photos'
  | 'notes'
  | 'terminal'
  | 'taskmgr'
  | 'trash'
  | 'calc';

/** Apps launchable from a dock / taskbar / menu rather than from a file. */
export type LaunchableApp = Exclude<AppId, 'reader' | 'image'>;

/**
 * One entry in the virtual filesystem.
 *
 * A folder carries `children`; a file carries whatever payload its viewer needs
 * (`body` for text, `src` for an image, `href` for an external link).
 */
export interface FileNode {
  /** Absolute path in the platform's own syntax — also the React key. */
  path: string;
  /** Basename as shown under the icon, e.g. "about.md". */
  name: string;
  kind: 'folder' | 'file';
  /** App to launch on open. Folders always open `files`. */
  app: AppId;
  children?: FileNode[];
  /** Markdown-ish text payload for the reader. */
  body?: string;
  /** Imported image URL for the image viewer. */
  src?: string;
  /** External URL — opens in a new tab instead of a window. */
  href?: string;
  /** Human-readable size for the file manager's detail column. */
  size?: string;
  /** Byte count, so the file manager can sort and total properly. */
  bytes?: number;
  /** Display date for the "Date modified" column. */
  modified?: string;
  /**
   * Coarse type used purely to pick an icon and a "Type" column label —
   * e.g. 'doc', 'image', 'exe', 'dll', 'archive'. The OS-specific icon
   * resolvers switch on this, so adding a file type is a one-line change.
   */
  ext?: string;
  /**
   * System files (`C:\Windows`, `/System`) are shown but refuse to be deleted,
   * exactly like the real thing.
   */
  system?: boolean;
}

/* ------------------------------------------------------------------ windows */

/**
 * Live state for one open window.
 *
 * Geometry is the *committed* position: while a drag is in flight the DOM is
 * mutated directly and this object is only updated once, on pointerup, so
 * dragging never re-renders React.
 */
export interface WindowState {
  /** Unique per window instance (a path can be opened twice). */
  id: string;
  app: AppId;
  title: string;
  /** Node the window was opened on — the app's input. */
  path: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Paint order; the focused window holds the highest value. */
  z: number;
  minimized: boolean;
  maximized: boolean;
  /**
   * Animation phase, driven by the window manager and read by each OS's frame
   * to pick a CSS animation.
   *
   * `opening` flips to `open` on the frame's animationend, and `closing`
   * windows are removed by a timer — so an OS can play a real close animation
   * instead of the window vanishing mid-frame.
   */
  phase: 'opening' | 'open' | 'closing';
}
