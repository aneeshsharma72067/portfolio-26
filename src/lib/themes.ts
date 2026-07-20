/**
 * Shared theme palette + apply helpers.
 *
 * A Theme is a matched (background, accent) PAIR. The runtime drives two RGB
 * channel CSS vars — `--primary` (accent) and `--bg` (surface) — so every
 * var-consuming colour on the page retints together when the pair changes.
 *
 * This module is the single source of truth for the palette. Both the visual
 * ThemePicker dial and the terminal's `theme` / `persona` / `neofetch` commands
 * read and mutate the theme through here, so they can never drift apart.
 */

/** A selectable (background, accent) pair. */
export interface Theme {
  id: string;
  label: string;
  bg: string; // hex — used for solid fills (ripple, base layer)
  bgRgb: string; // "R G B" channel form for the --bg CSS var
  accent: string; // hex — dial dot colour
  accentRgb: string; // "R G B" channel form for the --primary CSS var
}

/* Palette — a full ring of moods. Default first = the site's navy + mint. */
export const PALETTE: Theme[] = [
  { id: 'stdout', label: 'Stdout',  bg: '#0e1320', bgRgb: '14 19 32',  accent: '#55ddad', accentRgb: '85 221 173' },
  { id: 'ocean',  label: 'Ocean',   bg: '#0a1626', bgRgb: '10 22 38',  accent: '#38bdf8', accentRgb: '56 189 248' },
  { id: 'azure',  label: 'Azure',   bg: '#0b1330', bgRgb: '11 19 48',  accent: '#6366f1', accentRgb: '99 102 241' },
  { id: 'grape',  label: 'Grape',   bg: '#161029', bgRgb: '22 16 41',  accent: '#a78bfa', accentRgb: '167 139 250' },
  { id: 'orchid', label: 'Orchid',  bg: '#1c0f26', bgRgb: '28 15 38',  accent: '#c084fc', accentRgb: '192 132 252' },
  { id: 'sakura', label: 'Sakura',  bg: '#20121a', bgRgb: '32 18 26',  accent: '#f472b6', accentRgb: '244 114 182' },
  { id: 'rose',   label: 'Rose',    bg: '#1f1013', bgRgb: '31 16 19',  accent: '#fb7185', accentRgb: '251 113 133' },
  { id: 'sunset', label: 'Sunset',  bg: '#1f1512', bgRgb: '31 21 18',  accent: '#fb923c', accentRgb: '251 146 60' },
  { id: 'amber',  label: 'Amber',   bg: '#1c1607', bgRgb: '28 22 7',   accent: '#fbbf24', accentRgb: '251 191 36' },
  { id: 'lime',   label: 'Lime',    bg: '#131c0c', bgRgb: '19 28 12',  accent: '#a3e635', accentRgb: '163 230 53' },
  { id: 'forest', label: 'Forest',  bg: '#0c1f16', bgRgb: '12 31 22',  accent: '#34d399', accentRgb: '52 211 153' },
  { id: 'mono',   label: 'Mono',    bg: '#121212', bgRgb: '18 18 18',  accent: '#e5e7eb', accentRgb: '229 231 235' },
  // Persona tribute trio — each keyed to that game's signature UI colour.
  // P3 Reload: electric Tartarus blue. P4: Midnight-Channel yellow. P5 Royal: velvet-room red.
  { id: 'p3r',    label: 'P3 Reload', bg: '#08111f', bgRgb: '8 17 31',   accent: '#37aaff', accentRgb: '55 170 255' },
  { id: 'p4g',    label: 'P4',        bg: '#171408', bgRgb: '23 20 8',   accent: '#ffe500', accentRgb: '255 229 0' },
  { id: 'p5r',    label: 'P5 Royal',  bg: '#150708', bgRgb: '21 7 8',    accent: '#ff2233', accentRgb: '255 34 51' },
];

/** Where the committed theme id is persisted between visits. */
const STORAGE_KEY = 'portfolio-theme';

/** Look a theme up by id (case-insensitive); undefined if unknown. */
export const findTheme = (id: string): Theme | undefined =>
  PALETTE.find((t) => t.id.toLowerCase() === id.toLowerCase());

/**
 * Push a theme's channels onto the document root so all var-driven colours
 * retint immediately, and remember the choice for the next visit. Both the dial
 * and the terminal call this, so a switch from either surface sticks everywhere.
 */
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement.style;
  root.setProperty('--primary', theme.accentRgb);
  root.setProperty('--bg', theme.bgRgb);
  try {
    localStorage.setItem(STORAGE_KEY, theme.id);
  } catch {
    /* storage may be blocked (private mode) — the live vars are still applied */
  }
};

/** The theme to boot with: last committed if still valid, else the default. */
export const loadInitialTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const match = findTheme(saved);
      if (match) return match;
    }
  } catch {
    /* ignore — fall through to default */
  }
  return PALETTE[0];
};
