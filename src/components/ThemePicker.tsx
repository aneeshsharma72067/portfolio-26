import { useEffect, useRef, useState } from 'react';
import { Palette } from 'lucide-react';
import { PALETTE, applyTheme, loadInitialTheme, type Theme } from '@/lib/themes';
import './ThemePicker.css';

/* Ring geometry. Dots sit on a circle centred on the viewport's top-right corner,
   so only the lower-left quarter of the ring falls on-screen (a real dial face). */
const RING_RADIUS = 96; // px from the corner centre to each dot
const STEP = 360 / PALETTE.length; // angular gap between dots
const SCROLL_SENSITIVITY = 0.35; // deg of ring rotation per wheel-delta unit

/**
 * ThemePicker — a corner-mounted rotating colour dial.
 *
 * The dial's centre sits exactly on the viewport's top-right corner; a full ring
 * of theme dots orbits it, but only the bottom-left quarter is visible (the rest
 * overflow off-screen). Scrolling the wheel while hovering rotates the ring, so
 * you can spin through more themes than fit in the visible arc. Picking a dot
 * fires the circular-reveal sweep and commits the (bg + accent) pair.
 *
 * Render this ONCE near the root, as a sibling of page content.
 */
const ThemePicker = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Ring rotation in degrees, driven by the scroll wheel.
  const [rotation, setRotation] = useState(0);

  // `activeTheme` is the (bg + accent) pair committed behind the page right now.
  // Seeded from persisted choice so a theme picked last visit (or via the
  // terminal `theme` command) is restored on load.
  const [activeTheme, setActiveTheme] = useState<Theme>(loadInitialTheme);

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

  /* Keep the live theme channels (--primary accent, --bg surface) in sync with
     the committed theme so every var-driven colour retints as a pair. Shared
     helper also persists the choice for the next visit. */
  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  /* Spin the ring on wheel. Bound as a NON-passive listener so we can
     preventDefault and stop the page from scrolling while spinning the dial. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!isMenuOpen) return;
      e.preventDefault();
      setRotation((r) => r + e.deltaY * SCROLL_SENSITIVITY);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isMenuOpen]);

  /**
   * Handle a theme choice: collapse the dial, plant a ripple of the chosen
   * background at the corner (scale 0), then expand it next frame. The (bg +
   * accent) commit happens later in onRevealEnd, so nothing flashes mid-sweep.
   */
  const pickTheme = (theme: Theme) => {
    if (theme.id === activeTheme.id) {
      setIsMenuOpen(false);
      return;
    }

    setIsMenuOpen(false);
    setRippleTheme(theme);
    setRippleOn(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setRippleOn(true));
    });
  };

  /**
   * Fired when the ripple's transform transition fully finishes: the circle now
   * covers the viewport, so commit the theme then silently reset to scale(0).
   * Base === ripple background at this instant, so the reset is invisible.
   */
  const onRevealEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== 'transform' || !rippleTheme) return;
    setActiveTheme(rippleTheme);
    setRippleOn(false);
    setRippleTheme(null);
  };

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

      {/* 3. Picker chrome — corner-centred rotating dial */}
      <div
        ref={rootRef}
        className={`theme-picker ${isMenuOpen ? 'is-open' : ''}`}
      >
        {/* Wheel hit-area — a disc centred on the corner spanning past the ring,
            so scrolling ANYWHERE inside the dial (over dots or gaps) spins it.
            Only shown/active while open; sits below the dots so clicks pass. */}
        <div
          className="theme-hit"
          style={{ width: (RING_RADIUS + 40) * 2, height: (RING_RADIUS + 40) * 2 }}
          aria-hidden
        />
        {/* The ring: a full circle of dots orbiting the corner. Its centre is the
            viewport corner; only the lower-left quarter shows. The whole ring
            rotates as one so dots slide through the visible arc on scroll. */}
        <div
          className="theme-ring"
          style={{ ['--rot' as string]: `${rotation}deg` }}
        >
          {PALETTE.map((theme, i) => {
            // Each dot sits at a fixed base angle; ring rotation is applied to the
            // parent, so we only need the static placement here.
            const angle = i * STEP;
            return (
              <button
                key={theme.id}
                className={`theme-dot ${activeTheme.id === theme.id ? 'is-active' : ''}`}
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accent, // drives the hover glow (currentColor)
                  // Place on the ring at the dot's base angle + the live ring
                  // spin, push out by the radius, then counter-rotate the whole
                  // amount so the swatch stays upright as the ring turns.
                  transform: `rotate(calc(${angle}deg + var(--rot))) translate(${RING_RADIUS}px) rotate(calc(-1 * (${angle}deg + var(--rot))))`,
                }}
                onClick={() => pickTheme(theme)}
                aria-label={`Switch theme to ${theme.label}`}
                title={theme.label}
              />
            );
          })}
        </div>

        {/* Central toggle — the only always-visible chrome, tucked in the corner. */}
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
