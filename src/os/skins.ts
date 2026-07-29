/**
 * The five OS skins, expressed purely as data.
 *
 * Every visual difference between Windows / macOS / Fedora / Kali / Arch is a
 * value in this table — not a separate component tree. `Computer` writes the
 * active skin onto its root element as CSS custom properties, so switching the
 * OS re-paints the chrome without re-rendering any window content.
 *
 * Wallpapers are CSS gradients on purpose: they add zero bytes to the bundle,
 * decode instantly and retint with the theme instead of fighting it.
 */
import type { Skin, SkinId } from './types';
import macosBg from '@/assets/image/macos_bg.png';

export const SKINS: Record<SkinId, Skin> = {
  /* ------------------------------------------------------------- Windows 11 */
  windows: {
    id: 'windows',
    label: 'Windows',
    version: 'Windows 11 Pro',
    panel: 'taskbar',
    controls: 'right-square',
    menubar: false,
    titleAlign: 'left',
    // Fluent-style blue bloom, brightest behind the taskbar.
    wallpaper:
      'radial-gradient(120% 90% at 50% 110%, #0a3d6b 0%, #072a4d 42%, #04162a 100%), linear-gradient(160deg, #06213d 0%, #0a1a2f 100%)',
    accentRgb: '96 165 250', // #60a5fa
    windowBg: '#1f2024',
    chromeBg: '#2b2c31',
    chromeText: '#e8eaed',
    border: 'rgb(255 255 255 / 0.09)',
    radius: '8px',
    font: '"Segoe UI Variable", "Segoe UI", system-ui, sans-serif',
    panelBg: 'rgb(28 30 36 / 0.78)',
    panelText: '#e8eaed',
  },

  /* ------------------------------------------------------------- macOS Sonoma */
  mac: {
    id: 'mac',
    label: 'macOS',
    version: 'macOS Sonoma 14.5',
    panel: 'dock',
    controls: 'left-traffic',
    menubar: true,
    titleAlign: 'center',
    // Use the real macOS wallpaper image.
    wallpaper: `url(${macosBg})`,
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

  /* ------------------------------------------------------------ Fedora / GNOME */
  fedora: {
    id: 'fedora',
    label: 'Fedora',
    version: 'Fedora Workstation 40',
    panel: 'topbar',
    controls: 'right-round',
    menubar: false,
    titleAlign: 'center',
    // Fedora's flat "blue slate" default, warmed slightly toward the bottom.
    wallpaper:
      'linear-gradient(180deg, #2a5b8c 0%, #1c4269 45%, #16324f 100%), radial-gradient(60% 40% at 50% 0%, #3d78ad 0%, transparent 70%)',
    accentRgb: '81 162 255', // Fedora blue #51a2ff
    windowBg: '#242424',
    chromeBg: '#303030',
    chromeText: '#ffffff',
    border: 'rgb(0 0 0 / 0.5)',
    radius: '12px',
    font: 'Cantarell, "Adwaita Sans", system-ui, sans-serif',
    panelBg: 'rgb(0 0 0 / 0.82)',
    panelText: '#ffffff',
  },

  /* -------------------------------------------------------------- Kali / XFCE */
  kali: {
    id: 'kali',
    label: 'Kali',
    version: 'Kali Linux 2025.2',
    panel: 'panel',
    controls: 'right-xfce',
    menubar: false,
    titleAlign: 'center',
    // The signature near-black dragon backdrop, faked with a cyan core glow.
    wallpaper:
      'radial-gradient(70% 55% at 50% 45%, #0d3d4a 0%, transparent 65%), linear-gradient(170deg, #05161c 0%, #02090d 100%)',
    accentRgb: '54 211 233', // #36d3e9
    windowBg: '#1c1f24',
    chromeBg: '#14171b',
    chromeText: '#c8f4ff',
    border: 'rgb(56 189 248 / 0.22)',
    radius: '3px',
    font: '"Ubuntu", "DejaVu Sans", system-ui, sans-serif',
    panelBg: 'rgb(10 13 16 / 0.9)',
    panelText: '#9fe8ff',
  },

  /* ----------------------------------------------------------- Arch / i3-gaps */
  arch: {
    id: 'arch',
    label: 'Arch',
    version: 'Arch Linux (i3-gaps)',
    panel: 'bar',
    controls: 'none',
    menubar: false,
    titleAlign: 'left',
    // Flat, ricer-minimal: Arch cyan on a near-black canvas, no bloom.
    wallpaper: 'linear-gradient(135deg, #0b1118 0%, #0d1721 55%, #0a1016 100%)',
    accentRgb: '23 147 209', // Arch blue #1793d1
    windowBg: '#12161c',
    chromeBg: '#12161c',
    chromeText: '#8fb6cf',
    border: '#1793d1',
    radius: '0px',
    font: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
    panelBg: '#0a0e13',
    panelText: '#7fb3cc',
  },
};

/** Stable render order for the OS switcher UI. */
export const SKIN_ORDER: SkinId[] = ['windows', 'mac', 'fedora', 'kali', 'arch'];

/** Where the chosen OS is remembered between visits. */
const STORAGE_KEY = 'portfolio-os-skin';

/** Last chosen skin if still valid, else Windows (the most familiar default). */
export const loadSkin = (): SkinId => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in SKINS) return saved as SkinId;
  } catch {
    /* storage blocked (private mode) — fall through to the default */
  }
  return 'windows';
};

/** Persist the chosen skin; failure is silent since the live UI already switched. */
export const saveSkin = (id: SkinId) => {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
};
