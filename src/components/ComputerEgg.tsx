import { Monitor } from 'lucide-react';
import CornerEgg from './CornerEgg';

type Props = {
  onNavigate: (path: string) => void;
};

/** Bottom-left hidden desktop egg — "My Computer" monitor icon only. */
export default function ComputerEgg({ onNavigate }: Props) {
  return (
    <CornerEgg
      corner="bl"
      icon={Monitor}
      label="Boot virtual desktop"
      onActivate={() => onNavigate('/computer')}
    />
  );
}
