import { useEffect, useMemo, useState } from 'react';
import { SKINS, loadSkin, saveSkin } from '@/os/skins';
import type { SkinId } from '@/os/types';

type Props = {
  /** Route change through App's preloader transition (used by "log out"). */
  onNavigate: (path: string) => void;
};

/**
 * Computer — root of the /computer virtual desktop.
 *
 * Owns exactly three things: the active OS skin, the wallpaper layer, and the
 * CSS custom properties every child reads. Window management, the filesystem
 * and the apps live in their own modules so this file stays a thin shell.
 *
 * Perf note: the skin is applied as inline custom properties on a single root
 * div rather than on `document.documentElement`. That keeps the main site's
 * theme vars untouched, and means switching OS invalidates style on one
 * subtree instead of the whole document.
 */
export default function Computer({ onNavigate }: Props) {
  const [skinId, setSkinId] = useState<SkinId>(loadSkin);
  const skin = SKINS[skinId];

  /* Persist the OS choice whenever it changes. */
  useEffect(() => {
    saveSkin(skinId);
  }, [skinId]);

  /* The skin as CSS custom properties. Memoised so an unrelated re-render does
     not hand React a fresh style object and force a style recalc. */
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

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{ ...skinVars, background: skin.wallpaper }}
    >
      {/* Desktop, panel and window layers land here in the next phases. */}

      {/* Temporary escape hatch so the route is navigable before the panel
          exists. Replaced by the skin's real start menu / dock in phase 4. */}
      <button
        onClick={() => onNavigate('/')}
        className="absolute bottom-3 right-3 rounded border px-3 py-1.5 text-xs"
        style={{
          borderColor: 'var(--os-border)',
          background: 'var(--os-panel-bg)',
          color: 'var(--os-panel-text)',
        }}
      >
        exit to site
      </button>

      {/* Temporary skin cycler — same deal, moves into the panel in phase 4. */}
      <button
        onClick={() => {
          const order = Object.keys(SKINS) as SkinId[];
          setSkinId(order[(order.indexOf(skinId) + 1) % order.length]);
        }}
        className="absolute bottom-3 left-3 rounded border px-3 py-1.5 text-xs"
        style={{
          borderColor: 'var(--os-border)',
          background: 'var(--os-panel-bg)',
          color: 'var(--os-panel-text)',
        }}
      >
        {skin.version}
      </button>
    </div>
  );
}
