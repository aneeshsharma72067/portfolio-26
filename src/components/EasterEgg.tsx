import { Terminal } from 'lucide-react';
import CornerEgg from './CornerEgg';

type Props = {
  onNavigate: (path: string) => void;
};

/** Bottom-right hidden CLI egg — terminal icon only. */
export default function EasterEgg({ onNavigate }: Props) {
  return (
    <CornerEgg
      corner="br"
      icon={Terminal}
      label="Enter terminal mode"
      onActivate={() => onNavigate('/cli')}
    />
  );
}
