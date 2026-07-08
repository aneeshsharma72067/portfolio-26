# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Functional music player** (`src/components/NowPlaying.tsx`) — now wraps a real `<audio>` element loading the bundled Charlie Puth – "We Don't Talk Anymore" track. Starts paused; play/pause, click-to-seek progress bar, restart, +10s forward, and mute are all wired to the native element with live time/duration readouts.
- **Blogs nav item** (`src/components/Header.tsx`) — distinct pill-style link (`PenLine` icon, mint outline) that opens `https://blogs.aneesh-sharma.me` in a new tab. New `navBlogs` translation key across all five languages.
- **Scramble hero accent** — the "thoughtful software." headline in `Hero.tsx` now uses `ScrambleText` and cycles through 7 phrases on hover (scalable solutions, resilient systems, elegant interfaces, performant backends, delightful products, clean architecture).

### Changed
- **Project links** (`src/data/content.ts`) — MyBase live URL → `aneeshsharma72067.github.io/mybase`; CryptoPulse live URL → `cryptopulse1.vercel.app`.
- **NowPlaying:** removed the "Offline" state text in favour of a live "Paused" label (new `paused` translation key in all five languages).

### Added (earlier)
- **MagicBento project grid** (`src/components/MagicBento.tsx` + `.css`) — interactive bento layout for the Work section, adapted from React Bits and re-themed to the mint "Stdout" palette. Cursor-driven global spotlight, per-card border glow, gsap star particles, magnetism, and click ripple; animations auto-disable on mobile (≤768px). Cards show only name + tags over a dimmed preview so text never fights the image.
- **ProjectModal** (`src/components/ProjectModal.tsx`) — full-screen gallery viewer opened on card click. Projects sit on a 3D cylinder: the active project faces the viewer as a full detail card (preview, localised description, tags, live/source links) while neighbours curve away left/right (rotateY + Z push) like a rotating carousel. Navigable via arrow buttons, ←/→ keys, pointer drag, touch swipe, clicking a side card, or a dot rail; Escape or backdrop click closes. Per-breakpoint geometry and neighbour-only image mounting keep it light.
- Two new projects in `src/data/content.ts`: **MyBase** (all-in-one personal dashboard) and **CryptoPulse** (crypto screener), bringing the grid to six tiles for a balanced 4-column bento with two feature-width cards.
- **Chess engine** (`src/lib/chessEngine.ts`) — dependency-free move generation, check/checkmate detection, and legal-move filtering for all six piece types
- **Chess puzzles** (`src/lib/chessPuzzles.ts`) — three verified "mate in 1" positions (back-rank, queen & king, smothered), each serving a random puzzle
- **ChessPuzzleModal** — animated pop-in puzzle window opened from the chess card; players move pieces with rule-checked legality, win condition decided by the engine, with hint and "new puzzle" controls
- Tailwind `pop-in` and `spin-once` keyframes/animations

### Changed
- **ChessProfile:** replaced the hand-drawn knight watermark SVG with the `chess-pieces.svg` vector art, tinted as subtle light background art via CSS mask
- **ChessProfile:** the mini board is now a clickable preview that opens the full interactive puzzle window instead of an inline mate-in-1
- **Translations:** added `chessBullet` (was missing), `chessSolve`, `chessNext`, `chessHint`, `chessCheck`, `chessNotMate`, `chessFindMate` across all five languages

## [2.0.1] — 2026-07-05

### Changed
- **Hero:** Added full-width landscape banner image at the top of the hero section
- **Hero:** Profile picture enlarged to 96px and repositioned to half-overlap the banner bottom edge
- **Layout:** Main column widened from ~68% to 60% of viewport width (`max-w-5xl` on desktop)

## [2.0.0] — 2026-07-05

### Added
- **CONTENT.md** — single source of truth for all portfolio data (personal info, links, projects, skills, now-playing)
- **src/data/content.ts** — TypeScript data module mirroring CONTENT.md, used by all UI components
- **src/hooks/useReveal.ts** — lightweight IntersectionObserver-based scroll-reveal hook, replaces framer-motion
- **src/components/Header.tsx** — fixed glass header with blur-on-scroll, brand left / nav centre / GitHub right
- **src/components/Hero.tsx** — opening section: portrait, two-tone headline, serif bio excerpt, CTAs, Spotify widget
- **src/components/NowPlaying.tsx** — Spotify "now playing" card with animated CSS equalizer bars
- **src/components/SectionHeading.tsx** — reusable eyebrow + serif-titled section heading
- **src/components/About.tsx** — long-form serif bio with value pills
- **src/components/Work.tsx** — project feed with preview image, description, tags, and ghost links
- **src/components/Stack.tsx** — skill groups displayed as labelled chip columns
- **src/components/Contact.tsx** — closing CTA with email button and social rows
- **src/components/Footer.tsx** — hairline-ruled minimal footer with copyright
- **DESIGN.md** "Stdout" theme applied: Manrope (structural) + Noto Serif (body), mint-green accent (#55ddad), deep navy surfaces

### Changed
- **tailwind.config.ts** — rewrote entirely with the Stdout design system; dropped all old HSL vars and radix-ui-style tokens
- **src/index.css** — slim base: Manrope + Noto Serif imports, dark color-scheme, custom scrollbar, `.eyebrow` / `.meta-dot` / `.hairline` helpers
- **src/lib/utils.ts** — replaced clsx + tailwind-merge with a minimal `cn()` helper (no deps)
- **src/App.tsx** — replaced multi-file page router with a single centred reading column (60-70% viewport)
- **index.html** — updated `theme-color` to `#0e1320` (surface background)
- **package.json** — removed heavy deps (framer-motion, radix-ui, react-router-dom, clsx, tailwind-merge, tailwindcss-animate, shadcn components); retained react, vite, tailwind, lucide-react

### Removed
- All old UI component library files (shadcn/ui, framer-motion, radix-ui-based components)
- **src/assets/image/images.ts** — replaced with direct asset imports per component
- **perf:** Compress profile.png from 4.4 MB → 254 KB (94% reduction, resized to 400 px max-dim via PIL)
- All old multi-section page components from v1
