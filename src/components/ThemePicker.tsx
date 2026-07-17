import { useEffect, useRef, useState } from 'react';
import { Palette } from 'lucide-react';
import './ThemePicker.css';

/**
 * A single selectable theme swatch.
 * `bg` paints the whole-screen background; `dot` is the swatch shown in the dial
 * (usually === bg, but kept separate so gradients/patterns are possible later).
 */
interface Theme {
  id: string;
  label: string;
  bg: string;
  dot: string;
}

/* Palette — the site's default navy first, then a fanned arc of moods. */
const PALETTE: Theme[] = [
  { id: 'stdout', label: 'Stdout', bg: '#0e1320', dot: '#0e1320' },
  { id: 'blue', label: 'Deep Blue', bg: '#0b2545', dot: '#1d6fd6' },
  { id: 'plum', label: 'Plum', bg: '#2a1230', dot: '#9d4edd' },
  { id: 'ember', label: 'Ember', bg: '#2b0f0f', dot: '#e0553b' },
  { id: 'forest', label: 'Forest', bg: '#0c1f16', dot: '#2ebf91' },
];

/**
 * ThemePicker — a fixed top-right control that fans open a radial colour dial,
 * then paints the whole viewport with a top-right circular-reveal ripple.
 *
 * Render this ONCE near the root, as a sibling of page content. It manages its
 * own committed background layer (`.theme-base`) behind everything.
 */
const ThemePicker = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // `activeColor` is what's committed behind the page right now.
  const [activeColor, setActiveColor] = useState<string>(PALETTE[0].bg);

  // The ripple is a transient top layer: colour + a toggled "expanding" flag.
  const [rippleColor, setRippleColor] = useState<string | null>(null);
  const [rippleOn, setRippleOn] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);

  /* Close the dial on any outside click. */
  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  /**
   * Handle a colour choice:
   * 1. collapse the dial (dots shrink back into the toggle),
   * 2. plant a ripple circle of the chosen colour at the corner (scale 0),
   * 3. on the next frame, expand it — the 1s sweep paints the new colour
   *    IN FROM THE CORNER, beneath the content, over the static old base.
   * The commit happens later, in onRevealEnd (fired by onTransitionEnd), so the
   * page background state never changes mid-sweep -> no flash.
   */
  const pickColor = (bg: string) => {
    if (bg === activeColor) {
      setIsMenuOpen(false);
      return;
    }

    setIsMenuOpen(false);
    setRippleColor(bg);
    setRippleOn(false);

    // Next frame: flip the flag so the CSS transition actually animates.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setRippleOn(true));
    });
  };

  /**
   * Fired when the ripple's transform transition fully finishes.
   * The circle has now covered the whole viewport, so:
   *   - commit the new colour to the static base layer, THEN
   *   - silently reset the circle to scale(0).
   * Base === ripple colour at this instant, so the reset is invisible.
   */
  const onRevealEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    // Only react to the transform sweep, not stray property transitions.
    if (e.propertyName !== 'transform' || !rippleColor) return;
    setActiveColor(rippleColor); // base now holds the new colour...
    setRippleOn(false);          // ...reset the circle (no transition on the way back)
    setRippleColor(null);        // ...and drop it; identical surface underneath
  };

  const dotCount = PALETTE.length;

  return (
    <>
      {/* 1. Committed background — behind all page content */}
      <div className="theme-base" style={{ backgroundColor: activeColor }} aria-hidden />

      {/* 2. Transient ripple sweep */}
      {rippleColor && (
        <div className="theme-reveal-wrap" aria-hidden>
          <div
            className={`theme-reveal ${rippleOn ? 'is-expanding' : ''}`}
            style={{ backgroundColor: rippleColor }}
            onTransitionEnd={onRevealEnd}
          />
        </div>
      )}

      {/* 3. Picker chrome */}
      <div
        ref={rootRef}
        className={`theme-picker ${isMenuOpen ? 'is-open' : ''}`}
      >
        {/* Fanned colour dots — spread across a ~150° arc opening down-left. */}
        {PALETTE.map((theme, i) => {
          // Distribute dots along an arc. Angle 90°=down, 180°=left.
          const startAngle = 100; // degrees
          const endAngle = 200;
          const t = dotCount === 1 ? 0 : i / (dotCount - 1);
          const angle = (startAngle + (endAngle - startAngle) * t) * (Math.PI / 180);
          const radius = 74; // px from the toggle centre
          const tx = Math.cos(angle) * radius;
          const ty = Math.sin(angle) * radius;

          return (
            <button
              key={theme.id}
              className={`theme-dot ${activeColor === theme.bg ? 'is-active' : ''}`}
              style={{
                backgroundColor: theme.dot,
                color: theme.dot, // drives the hover glow (currentColor)
                // Stagger the fan for a "dealing cards" feel.
                transitionDelay: isMenuOpen ? `${i * 45}ms` : '0ms',
                ['--tx' as string]: `${tx}px`,
                ['--ty' as string]: `${ty}px`,
              }}
              onClick={() => pickColor(theme.bg)}
              aria-label={`Switch theme to ${theme.label}`}
              title={theme.label}
            />
          );
        })}

        {/* Central toggle */}
        <button
          className="theme-toggle"
          onClick={() => setIsMenuOpen((o) => !o)}
          aria-label={isMenuOpen ? 'Close theme picker' : 'Open theme picker'}
          aria-expanded={isMenuOpen}
        >
          <Palette size={18} />
        </button>
      </div>
    </>
  );
};

export default ThemePicker;
