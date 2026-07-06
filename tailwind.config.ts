import type { Config } from 'tailwindcss';

/**
 * "Stdout" design system — a dark, editorial theme.
 * Deep navy-black canvas with a single luminous mint-green accent.
 * Two typefaces: Manrope (structural / headings / labels) and
 * Noto Serif (long-form reading / quotes).
 *
 * Colours are declared as raw hex here (not CSS vars) so utilities read
 * directly from DESIGN.md tokens.
 */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Structural chrome: titles, headings, brand, labels
        headline: ['Manrope', 'sans-serif'],
        label: ['Manrope', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
        // The writing: body copy, quotes, descriptions
        body: ['"Noto Serif"', 'serif'],
        serif: ['"Noto Serif"', 'serif'],
      },
      colors: {
        // Accent — mint / teal green
        primary: {
          DEFAULT: '#55ddad',
          fixed: '#75fac8',
          container: '#2ebf91',
        },
        'on-primary': '#003827',
        secondary: {
          DEFAULT: '#a0d1ba',
          container: '#204f3d',
        },
        'on-secondary-container': '#8fbfa9',

        // Surfaces — dark navy ramp, lowest -> highest
        'surface-container-lowest': '#090e1b',
        background: '#0e1320',
        surface: '#0e1320',
        'surface-dim': '#0e1320',
        'surface-container-low': '#161b29',
        'surface-container': '#1a1f2d',
        'surface-container-high': '#252a38',
        'surface-container-highest': '#2f3443',
        'surface-variant': '#2f3443',
        'surface-bright': '#343948',

        // Text & lines
        'on-background': '#dee2f5',
        'on-surface': '#dee2f5',
        'on-surface-variant': '#bbcac1',
        outline: '#86948c',
        'outline-variant': '#3d4a43',
      },
      borderRadius: {
        soft: '0.25rem',
      },
      boxShadow: {
        soft: '0 12px 30px rgb(0 0 0 / 0.18)',
        floating: '0 24px 48px rgb(0 0 0 / 0.24)',
      },
      letterSpacing: {
        label: '0.2em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Pop-in used by the puzzle "solved" overlay and hint text.
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Single 360° spin for the "new puzzle" refresh icon.
        'spin-once': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'pop-in': 'pop-in 0.2s ease-out forwards',
        'spin-once': 'spin-once 0.5s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
