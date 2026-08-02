import { useCallback, useEffect, useState } from 'react';
import { loadSkin, saveSkin } from '@/os/skins';
import type { SkinId } from '@/os/types';
import Preloader from '@/components/Preloader';
import WindowsOS from './windows/WindowsOS';
import MacOS from './mac/MacOS';
import NothingOS from './android/NothingOS';

type Props = {
  /** Route change through App's preloader transition (used by "log out"). */
  onNavigate: (path: string) => void;
};

/**
 * Computer — the /computer route's only job is choosing which OS to boot.
 *
 * For mobile viewports (< 768px), it mounts NothingOS (Android) to deliver
 * a tailored, uncluttered, dot-matrix mobile experience.
 */
export default function Computer({ onNavigate }: Props) {
  const [skinId, setSkinId] = useState<SkinId>(loadSkin);
  const [pendingSkinId, setPendingSkinId] = useState<SkinId | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  if (isMobile) {
    return <NothingOS onNavigate={onNavigate} />;
  }

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
