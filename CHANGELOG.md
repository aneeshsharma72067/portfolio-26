# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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
- All old multi-section page components from v1
