# Design System — "Stdout"

A dark, editorial blog. Reads like a printed literary journal that happens to
live on a terminal-dark screen. Built with Nuxt 4 + Tailwind CSS v4 (config-in-CSS
via `@theme` in `app/assets/css/main.css`).

---

## 1. Concept & Theme

**A quiet, nocturnal reading room for someone thinking out loud.**

The site is a personal essay blog. Its voice is reflective and unfinished on
purpose — "notes from someone still becoming." The design serves *slow reading*,
not scanning. Every choice pushes toward calm, long-form focus:

- **Editorial, not bloggy.** Big serif body copy, generous whitespace, magazine
  grid layouts, drop caps, pull-quotes. Feels like a manuscript, not a feed.
- **Dark by default.** `color-scheme: dark` is hard-set; there is no light mode.
  Deep navy-black canvas with a single luminous mint-green accent.
- **Terminal wink.** Name "Stdout", labels in uppercase mono-ish tracking, a
  developer's-journal tone. The tech identity is present but understated.
- **Restraint.** One accent color. One radius family. Two typefaces. Motion is
  slow and subtle. Nothing shouts.

Design language is loosely **Material 3** in its token naming (`surface`,
`on-surface`, `surface-container-*`, `primary`, `outline`) but styled as a custom
dark editorial theme rather than stock Material.

---

## 2. Color

Canvas is a cool near-black navy; the sole accent is a bright mint/teal green.
Neutrals carry a faint blue-green cast (never pure gray) so the dark stays warm-cold,
not muddy.

### Accent — Mint / Teal Green
| Token | Hex | Use |
|---|---|---|
| `primary` | `#55ddad` | Links, active nav, labels, accents |
| `primary-fixed` | `#75fac8` | Brightest highlight |
| `primary-fixed-dim` | `#55ddad` | — |
| `primary-container` | `#2ebf91` | Gradient partner, deeper accent |
| `on-primary` | `#003827` | Text/icons *on* a green fill |
| `secondary` | `#a0d1ba` | Muted green support |
| `secondary-container` | `#204f3d` | — |
| `on-secondary-container` | `#8fbfa9` | Quote text |

### Surfaces (dark navy ramp, lowest → highest)
| Token | Hex |
|---|---|
| `surface-container-lowest` | `#090e1b` |
| `background` / `surface` / `surface-dim` | `#0e1320` |
| `surface-container-low` | `#161b29` |
| `surface-container` | `#1a1f2d` |
| `surface-container-high` | `#252a38` |
| `surface-container-highest` / `surface-variant` | `#2f3443` |
| `surface-bright` | `#343948` |

### Text & lines
| Token | Hex | Use |
|---|---|---|
| `on-background` / `on-surface` | `#dee2f5` | Primary text (soft lavender-white) |
| `on-surface-variant` | `#bbcac1` | Body copy, secondary text |
| `outline` | `#86948c` | Meta labels, muted UI |
| `outline-variant` | `#3d4a43` | Hairline borders |

### Accent-alpha conventions
Green rarely appears at full opacity on large areas — it glows through transparency:
- Tint fills: `bg-primary/10`, borders `border-primary/20`
- Selection: `rgb(85 221 173 / 0.28)` bg, `#090e1b` text
- Hover glow: `drop-shadow-[0_0_12px_rgba(85,221,173,0.8)]`
- Divider dots / rules: `bg-primary/35`, `border-primary/10`

**Rule of thumb:** never more than one saturated green element competing per view.
Solid green fills are reserved for primary CTAs (`bg-primary` or the
`from-primary to-primary-container` gradient) with `on-primary` text.

---

## 3. Typography

Three roles, two families. Loaded from Google Fonts in `main.css`.

| Role | Family | Token | Where |
|---|---|---|---|
| Body / serif | **Noto Serif** | `--font-body`, `--font-serif` | Article text, quotes, dates-as-prose |
| Headline / sans | **Manrope** | `--font-headline` | Titles, headings, brand |
| Label / UI | **Manrope** | `--font-label` | Eyebrows, nav, meta, buttons |

Icons: **Material Symbols Outlined** (weight 100–700, optical size 24).

### The two voices
1. **Serif = the writing.** Body is Noto Serif, often *italic* for descriptions,
   quotes, and footer — gives a warm, human, literary feel. Body reads large:
   `text-lg`–`text-xl`, line-height `1.8`–`1.85`.
2. **Sans = the frame.** Manrope handles everything structural — big bold titles
   and tiny all-caps labels. Structural chrome feels crisp and modern against the
   soft serif prose.

### Type scale (Tailwind classes seen in use)
| Element | Classes |
|---|---|
| Hero title | `text-5xl md:text-7xl font-extrabold leading-none tracking-tight` |
| Post title (card) | `text-4xl font-bold leading-tight` |
| Article H1 | `text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight` |
| Article H2 / H3 | `2rem` / `1.5rem`, Manrope `font-weight:800` |
| Body copy | `text-lg leading-[1.8]` (serif) |
| Hero/quote lead | `text-xl italic leading-relaxed` |
| Eyebrow / label | `text-[10px]–[11px] font-bold uppercase tracking-[0.2em]` |
| Nav link | `text-[11px] font-bold uppercase tracking-[0.2em]` |
| Brand "Stdout" | `text-2xl font-black` |

### Signature type treatments
- **Uppercase micro-labels** with wide letter-spacing (`tracking-[0.2em]` /
  `tracking-widest`) in green or `outline` — the connective tissue of the whole UI.
- **Two-tone headlines:** most of the title in `on-surface`, a trailing word in
  `text-primary` (sometimes italic) — e.g. "...Thinking Out **Loud.**".
- **Drop cap:** first letter of the first article paragraph floats in Manrope 800,
  `4.5rem`, green (`post-detail-body :deep(p:first-child)::first-letter`).
- **Pull-quotes / blockquotes:** left green rule, `primary/10` tint fill, italic,
  rounded on the right side only.

---

## 4. Spacing & Layout

Space is the primary design element. Layouts are wide, airy, and grid-driven; the
generosity of whitespace is what signals "read slowly."

### Containers & rhythm
- **Max widths:** `max-w-7xl` for feed/about shells, `max-w-5xl` for the reading
  column, `max-w-3xl`/`max-w-2xl` for prose measure, `max-w-3xl` for the hero.
- **Gutters:** `px-6 sm:px-8` everywhere. Content is always centered (`mx-auto`).
- **Top offset:** fixed header is `h-20`; pages start at `pt-32` to clear it.
- **Vertical breathing room is large and deliberate:**
  - Feed items separated by `gap-32`.
  - Hero bottom margin `mb-32`; section breaks `mb-32`.
  - Footer `mt-20 py-16`.
  - In-article paragraph gap `1.7rem`; heading top margin `2.4rem`.

### Grid patterns
- **Home post card:** 12-col grid — `md:col-span-8` text, `md:col-span-4` meta
  (label + date), meta right-aligned on desktop (`md:items-end`).
- **Article page:** `lg:grid-cols-[1fr_300px]` — reading column + sticky sidebar
  (author, related essays). Sidebar hidden below `lg`.
- **About page:** asymmetric 12-col editorial splits (`lg:col-span-8` / `-4`,
  `-3` / `-9`) with a `sticky top-32` portrait rail.

### Radius, elevation, motion
| Token | Value |
|---|---|
| `radius-soft` | `0.25rem` |
| `radius-pill` | `9999px` (badges, chips) |
| `shadow-soft` | `0 12px 30px rgb(0 0 0 / 0.18)` |
| `shadow-floating` | `0 24px 48px rgb(0 0 0 / 0.24)` |

Cards/quotes use larger ad-hoc radii (`rounded-xl`, `rounded-r-xl`). Motion is slow
and understated: `transition-all duration-300` on nav; the animated underline
indicator slides under the active nav item; hovers nudge (`hover:translate-x-1`),
gently scale down CTAs (`hover:scale-[0.98]`), or bloom a green glow. About-page
portrait fades from grayscale over `duration-700`.

---

## 5. Recurring Components & Patterns

- **Fixed glass header** — `bg-surface-container-low/70 backdrop-blur-xl`, brand
  left, nav center with sliding green underline indicator, external "Aneesh" link
  right (green, glow on hover).
- **Eyebrow label** — tiny uppercase wide-tracked green text above a heading.
- **Pill badge** — `rounded-full border border-primary/20 bg-primary/10` +
  green micro-label ("Featured", essay category).
- **Meta row** — uppercase `outline` text with a green dot separator
  (`h-1.5 w-1.5 rounded-full bg-primary/35`).
- **Primary CTA** — green gradient `bg-linear-to-br from-primary to-primary-container`,
  `on-primary` text, uppercase label, subtle shrink on hover.
- **Ghost link CTA** — green uppercase label + Material arrow, slides on hover.
- **Content card** — `bg-surface-container-low` → hover `-high`, `rounded-xl`,
  generous `p-8`/`p-12` padding.
- **Footer** — hairline `border-primary/10` top, centered italic serif, RSS link,
  green copyright line.

---

## 6. Working With This System — Guidelines

1. **One accent, used sparingly.** Green marks the *one* thing that matters in a
   view. If two greens compete, demote one to `outline` or an alpha tint.
2. **Serif is for reading, sans is for labeling.** Never set long prose in Manrope
   or micro-labels in Noto Serif.
3. **Reach for space before decoration.** New sections earn separation via margin
   (`mb-32`, `gap-32`), not borders or boxes.
4. **Labels are always** uppercase, `font-label`, bold, wide tracking, tiny
   (`10–11px`). This is the house style for all non-prose UI text.
5. **Depth via surface ramp, not shadow.** Layer with `surface-container-*` steps;
   reserve shadows for genuinely floating elements.
6. **Motion is calm.** 300ms+ eases, small transforms, soft glows — never bouncy
   or fast.
7. **Prose styling lives in** `post-detail-body :deep(...)` in `posts/[id].vue`
   (drop cap, blockquote, headings, lists, code, links). Extend there for new HTML
   article elements.
8. **Global tokens live in** `app/assets/css/main.css` `@theme`. Add colors/fonts
   there so they surface as Tailwind utilities (`bg-*`, `text-*`, `font-*`).
