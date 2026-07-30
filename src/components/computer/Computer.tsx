import { useCallback, useEffect, useState } from 'react';
import { loadSkin, saveSkin } from '@/os/skins';
import type { SkinId } from '@/os/types';
import Preloader from '@/components/Preloader';
import WindowsOS from './windows/WindowsOS';
import MacOS from './mac/MacOS';

type Props = {
  /** Route change through App's preloader transition (used by "log out"). */
  onNavigate: (path: string) => void;
};

/**
 * Computer — the /computer route's only job is choosing which OS to boot.
 *
 * There is no shared chrome here on purpose. `WindowsOS` and `MacOS` are two
 * self-contained desktops; exactly one is mounted at a time, so their taskbars,
 * window frames, icon layouts and file managers can never collide. Switching OS
 * unmounts one shell and mounts the other, which also means each boot starts
 * from a clean desktop — the "different OS loads on selection" behaviour, rather
 * than one desktop wearing a different coat of paint.
 *
 * The switch is hidden behind the site's pixel-dissolve `Preloader`: the swap
 * happens at its midpoint, so the remount is never visible as a flash.
 */
export default function Computer({ onNavigate }: Props) {
  const [skinId, setSkinId] = useState<SkinId>(loadSkin);
  const [pendingSkinId, setPendingSkinId] = useState<SkinId | null>(null);

  /* Persist the OS choice whenever it changes. */
  useEffect(() => {
    saveSkin(skinId);
  }, [skinId]);

  const handleSkinChange = useCallback(
    (next: SkinId) => {
      if (next === skinId) return;
      setPendingSkinId(next);
    },
    [skinId],
  );

  /* Swap shells while the screen is fully covered. */
  const handleMidpoint = useCallback(() => {
    if (pendingSkinId) setSkinId(pendingSkinId);
  }, [pendingSkinId]);

  const handleComplete = useCallback(() => setPendingSkinId(null), []);

  return (
    <>
      {skinId === 'windows' ? (
        <WindowsOS onSkinChange={handleSkinChange} onNavigate={onNavigate} />
      ) : (
        <MacOS onSkinChange={handleSkinChange} onNavigate={onNavigate} />
      )}

      {pendingSkinId && (
        <Preloader
          mode="transition"
          onMidpoint={handleMidpoint}
          onComplete={handleComplete}
        />
      )}
    </>
  );
}
