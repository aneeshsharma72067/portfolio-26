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
  bg: string;             // whole-screen background colour
  accent: string;         // paired accent hue (Tailwind `primary`)
  accentRgb: string;      // same accent as space-separated RGB channels for --primary
}

/*
 * Palette — each theme is a matched (background, accent) PAIR. The dot shown in
 * the dial is the accent, so you preview the accent you're switching to.
 * `accentRgb` must be the channel form of `accent` (Tailwind needs bare RGB).
 * Default first = the site's navy + mint.
 */
const PALETTE: Theme[] = [
  { id: 'stdout', label: 'Stdout', bg: '#0e1320', accent: '#55ddad', accentRgb: '85 221 173' },
  { id: 'blue', label: 'Deep Blue', bg: '#0b1f3a', accent: '#4da3ff', accentRgb: '77 163 255' },
  { id: 'plum', label: 'Plum', bg: '#241030', accent: '#c084fc', accentRgb: '192 132 252' },
  { id: 'ember', label: 'Ember', bg: '#2b1310', accent: '#ff8a5c', accentRgb: '255 138 92' },
  { id: 'rose', label: 'Rose', bg: '#2b1020', accent: '#ff6fae', accentRgb: '255 111 174' },
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

  // `activeTheme` is the (bg + accent) pair committed behind the page right now.
  const [activeTheme, setActiveTheme] = useState<Theme>(PALETTE[0]);

  // The ripple is a transient top layer: the incoming theme + an "expanding" flag.
  const [rippleTheme, setRippleTheme] = useState<Theme | null>(null);
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

  /* Keep the live `--primary` accent channel in sync with the committed theme. */
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', activeTheme.accentRgb);
  }, [activeTheme]);

  /**
   * Handle a theme choice:
   * 1. collapse the dial (dots shrink back into the toggle),
   * 2. plant a ripple circle of the chosen background at the corner (scale 0),
   * 3. on the next frame, expand it — the 1s sweep paints the new background
   *    IN FROM THE CORNER, beneath the content, over the static old base.
   * The commit (bg + accent together) happens later in onRevealEnd, so nothing
   * about the page state changes mid-sweep -> no flash.
   */
  const pickTheme = (theme: Theme) => {
    if (theme.id === activeTheme.id) {
      setIsMenuOpen(false);
      return;
    }

    setIsMenuOpen(false);
    setRippleTheme(theme);
    setRippleOn(false);

    // Next frame: flip the flag so the CSS transition actually animates.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setRippleOn(true));
    });
  };

  /**
   * Fired when the ripple's transform transition fully finishes.
   * The circle has now covered the whole viewport, so:
   *   - commit the new theme (bg to the base layer, accent via the effect), THEN
   *   - silently reset the circle to scale(0).
   * Base === ripple background at this instant, so the reset is invisible.
   */
  const onRevealEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    // Only react to the transform sweep, not stray property transitions.
    if (e.propertyName !== 'transform' || !rippleTheme) return;
    setActiveTheme(rippleTheme); // base + accent now hold the new theme...
    setRippleOn(false);          // ...reset the circle (no transition on the way back)
    setRippleTheme(null);        // ...and drop it; identical surface underneath
  };

  const dotCount = PALETTE.length;

  return (
    <>
      {/* 1. Committed background — behind all page content */}
      <div className="theme-base" style={{ backgroundColor: activeTheme.bg }} aria-hidden />

      {/* 2. Transient ripple sweep (incoming background) */}
      {rippleTheme && (
        <div className="theme-reveal-wrap" aria-hidden>
          <div
            className={`theme-reveal ${rippleOn ? 'is-expanding' : ''}`}
            style={{ backgroundColor: rippleTheme.bg }}
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
          // Distribute dots along the lower-left quarter arc.
          // 0°=right, 90°=down, 180°=left → sweep straight down to straight left
          // so every dot stays below the top edge and left of the right edge.
          const startAngle = 90; // degrees (straight down)
          const endAngle = 180; // (straight left)
          const t = dotCount === 1 ? 0 : i / (dotCount - 1);
          const angle = (startAngle + (endAngle - startAngle) * t) * (Math.PI / 180);
          const radius = 74; // px from the toggle centre
          const tx = Math.cos(angle) * radius;
          const ty = Math.sin(angle) * radius;

          return (
            <button
              key={theme.id}
              className={`theme-dot ${activeTheme.id === theme.id ? 'is-active' : ''}`}
              style={{
                // Dot shows the theme's ACCENT — preview what you're switching to.
                backgroundColor: theme.accent,
                color: theme.accent, // drives the hover glow (currentColor)
                // Stagger the fan for a "dealing cards" feel.
                transitionDelay: isMenuOpen ? `${i * 45}ms` : '0ms',
                ['--tx' as string]: `${tx}px`,
                ['--ty' as string]: `${ty}px`,
              }}
              onClick={() => pickTheme(theme)}
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
