import { useState, useRef, ReactNode } from 'react';

interface MagneticProps {
  children: ReactNode;
  strength?: number; // scale multiplier, default 0.15
}

/**
 * Reusable Magnetic wrapper component.
 * Attracts the element toward the user's cursor when hovered,
 * snapping back smoothly when the cursor leaves.
 */
export default function Magnetic({ children, strength = 0.15 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    // Limit displacement to keep it within safe UI boundaries
    setPosition({ x: distanceX * strength, y: distanceY * strength });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: position.x === 0 && position.y === 0 
          ? 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' // elastic snap back
          : 'transform 0.1s ease-out', // immediate sticky follow
      }}
      className="inline-block"
    >
      {children}
    </div>
  );
};
