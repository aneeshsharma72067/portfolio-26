/**
 * Shared types for the /computer virtual desktop.
 *
 * Kept in one small module so the filesystem, the window manager and the OS
 * skins can reference each other's shapes without a circular import.
 */

/* ------------------------------------------------------------------ skins */

/**
 * The selectable operating systems.
 *
 * Each one is a SEPARATE shell component (`computer/windows/WindowsOS`,
 * `computer/mac/MacOS`) — not a skinned copy of a shared chrome. Only one is
 * mounted at a time, so their layouts, panels and window frames can never
 * conflict with each other. The Linux distros that used to live here were
 * removed rather than left half-finished.
 */
export type SkinId = 'windows' | 'mac';

/**
 * The per-OS *theme* values. Purely the paint: surfaces, radius, fonts. Layout
 * and chrome structure live in each OS's own components, so nothing here
 * describes "where the panel goes" any more.
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

/* ---------------------------------------------------------------- filesystem */

/** Which app opens a given file. Folders are handled by `files` itself. */
export type AppId = 'files' | 'reader' | 'image' | 'settings' | 'photos' | 'notes';

/**
 * One entry in the virtual filesystem. A folder carries `children`; a file
 * carries whatever payload its viewer needs (`body` for text, `src` for an
 * image, `href` for an external link).
 */
export interface FileNode {
  /** Absolute POSIX-ish path — also the React key and window identity. */
  path: string;
  /** Basename as shown under the icon, e.g. "about.md". */
  name: string;
  kind: 'folder' | 'file';
  /** App to launch on open. Folders always open `files`. */
  app: AppId;
  /** Lucide icon name resolved by `Desktop`/`Files` to a component. */
  icon: string;
  children?: FileNode[];
  /** Markdown-ish text payload for the Reader. */
  body?: string;
  /** Imported image URL for the Image Viewer. */
  src?: string;
  /** External URL — opens in a new tab instead of a window. */
  href?: string;
  /** Fake size string for the Files list view, e.g. "4.2 KB". */
  size?: string;
  /** Fake mtime for the Files list view. */
  modified?: string;
}

/* ------------------------------------------------------------------ windows */

/**
 * Live state for one open window. Geometry is the *committed* position: while a
 * drag is in flight the DOM is mutated directly and this object is only updated
 * once, on pointerup, so dragging never re-renders React.
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
}
