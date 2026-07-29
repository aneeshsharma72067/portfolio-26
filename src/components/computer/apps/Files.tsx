import type { SkinId, FileNode } from '@/os/types';
import MacFinder from './MacFinder';
import WinExplorer from './WinExplorer';

type Props = {
  initialPath: string;
  skinId?: SkinId;
  onOpenNode: (node: FileNode) => void;
};

export default function Files({ initialPath, skinId = 'mac', onOpenNode }: Props) {
  if (skinId === 'windows') {
    return <WinExplorer initialPath={initialPath} onOpenNode={onOpenNode} />;
  }
  return <MacFinder initialPath={initialPath} onOpenNode={onOpenNode} />;
}
