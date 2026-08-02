import { useEffect, useState, type ComponentType } from 'react';

type Props = {
  /** Which corner the egg lives in. */
  corner: 'bl' | 'br';
  /** Lucide (or compatible) icon component. */
  icon: ComponentType<{ size?: number; className?: string }>;
  /** Accessible name — shown only to screen readers. */
  label: string;
  onActivate: () => void;
};

/**
 * CornerEgg — fully hidden corner trigger.
 *
 * Invisible until the cursor enters a proximity radius of the corner, then
 * the icon springs in (elastic overshoot). No peek notch, no label chrome,
 * no idle animation. Touch / coarse pointers: stays hidden (easter-egg only).
 */
export default function CornerEgg({ corner, icon: Icon, label, onActivate }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    /* Skip proximity tracking on touch-primary devices — nothing to hover. */
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!fine.matches) return;

    const THRESHOLD = 110;
    const onMove = (e: MouseEvent) => {
      const x = corner === 'bl' ? 0 : window.innerWidth;
      const y = window.innerHeight;
      const dist = Math.hypot(e.clientX - x, e.clientY - y);
      setVisible(dist < THRESHOLD);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [corner]);

  const side = corner === 'bl' ? 'left-0' : 'right-0';
  /* Hide into the corner: BL slides down-left, BR down-right. */
  const hide =
    corner === 'bl'
      ? 'translate-x-[-40%] translate-y-[40%] scale-50'
      : 'translate-x-[40%] translate-y-[40%] scale-50';

  return (
    <div className={`pointer-events-none fixed bottom-0 ${side} z-50 p-3`}>
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={onActivate}
        className={`flex h-11 w-11 items-center justify-center text-on-surface-variant transition-[opacity,transform] duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:text-primary focus-visible:text-primary focus-visible:outline-none motion-reduce:duration-200 motion-reduce:[transition-timing-function:ease] ${
          visible
            ? 'pointer-events-auto translate-x-0 translate-y-0 scale-100 opacity-100'
            : `pointer-events-none opacity-0 ${hide}`
        }`}
      >
        <Icon size={22} />
      </button>
    </div>
  );
}
