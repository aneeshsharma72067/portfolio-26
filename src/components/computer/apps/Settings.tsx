import type { SkinId } from '@/os/types';
import MacSettings from './MacSettings';
import WinSettings from './WinSettings';

type Props = {
  activeSkinId: SkinId;
  onSkinChange: (id: SkinId) => void;
};

export default function Settings({ activeSkinId, onSkinChange }: Props) {
  if (activeSkinId === 'windows') {
    return <WinSettings activeSkinId={activeSkinId} onSkinChange={onSkinChange} />;
  }
  return <MacSettings activeSkinId={activeSkinId} onSkinChange={onSkinChange} />;
}
