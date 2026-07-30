/**
 * Theme values for the two supported operating systems.
 *
 * This table is ONLY the paint — surfaces, radius, accent, native font stack,
 * wallpaper. Layout and chrome structure (taskbar vs dock, titlebar button
 * order, window frame) belong to each OS's own component tree under
 * `components/computer/windows` and `components/computer/mac`, so the two never
 * share a code path and can't break each other.
 *
 * The active theme is written as CSS custom properties onto one root element by
 * the OS shell, so switching OS re-paints the chrome without touching the main
 * site's theme vars.
 */
import type { Skin, SkinId } from './types';
import macosBg from '@/assets/image/macos_bg.png';
import winBg from '@/assets/image/windows-bg.jpg';

export const SKINS: Record<SkinId, Skin> = {
  /* ------------------------------------------------------------- Windows 11 */
  windows: {
    id: 'windows',
    label: 'Windows',
    version: 'Windows 11 Pro',
    wallpaper: `url(${winBg}) center / cover no-repeat`,
    accentRgb: '0 120 212', // Windows 11 Fluent Blue #0078d4
    windowBg: 'rgba(32, 34, 42, 0.85)',
    chromeBg: 'rgba(24, 26, 32, 0.80)',
    chromeText: '#ffffff',
    border: 'rgba(255, 255, 255, 0.12)',
    radius: '8px',
    font: "'Segoe UI VF', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
    panelBg: 'rgba(28, 30, 38, 0.75)',
    panelText: '#ffffff',
  },

  /* ------------------------------------------------------------- macOS Sonoma */
  mac: {
    id: 'mac',
    label: 'macOS',
    version: 'macOS Sonoma 14.5',
    wallpaper: `url(${macosBg}) center / cover no-repeat`,
    accentRgb: '10 132 255', // #0a84ff
    windowBg: 'rgba(32, 33, 38, 0.72)',
    chromeBg: 'rgba(42, 43, 50, 0.65)',
    chromeText: '#f0f0f5',
    border: 'rgba(255, 255, 255, 0.16)',
    radius: '14px',
    font: "'SF Pro', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
    panelBg: 'rgb(40 40 46 / 0.62)',
    panelText: '#f2f2f5',
  },
};

/** Stable render order for the OS switcher UI. */
export const SKIN_ORDER: SkinId[] = ['windows', 'mac'];

/** Where the chosen OS is remembered between visits. */
const STORAGE_KEY = 'portfolio-os-skin';

/** Last chosen OS if still valid, else Windows (the most familiar default). */
export const loadSkin = (): SkinId => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in SKINS) return saved as SkinId;
  } catch {
    /* storage blocked (private mode) — fall through to the default */
  }
  return 'windows';
};

/** Persist the chosen OS; failure is silent since the live UI already switched. */
export const saveSkin = (id: SkinId) => {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
};
