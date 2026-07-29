# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- **Terminal fullscreen FX never ending** (`src/components/TerminalFX.tsx`) — the `sudo rm -rf` blast left the screen blank and `sl` left the train overlay stuck. Root cause: `Terminal`'s once-a-second clock re-renders handed `TerminalFX` a fresh `onDone` identity each tick; since the auto-finish `useEffect` listed `onDone` as a dep, its `setTimeout` was cleared + restarted every second and, for effects longer than 1s (blast 2.6s, train 4.2s), never fired — so `onDone` (which navigates home for the blast) never ran. Fixed by holding `onDone` in a ref and depending only on `effect`, decoupling callback identity from the timer lifecycle.

- **Gallery overlay on mobile** (`src/components/GalleryOverlay.tsx`) — overlay now renders into `document.body` via `createPortal`, escaping the `main` element's `relative z-10` stacking context that was letting the fixed Header's "GitHub ↗" link paint over the close (X) button. Also added tap-to-close on the backdrop for touch devices (previously `handleTouchEnd` only handled swipes, so tapping outside never closed the gallery); swipe detection now ignores mostly-vertical gestures.

### Added
- **`/computer` virtual desktop — phase 1: route, egg, shell** (`src/os/types.ts`, `src/os/skins.ts`, `src/components/computer/Computer.tsx`, `src/components/ComputerEgg.tsx`, wired in `src/App.tsx`) — foundation for a fully interactive virtual OS at `/computer`, the bottom-LEFT twin of the bottom-right `/cli` egg.
  - **Code-split route** — `Computer` is `React.lazy`-loaded behind a `Suspense` boundary, so the entire OS ships as its own chunk (3.7 kB so far) and the main bundle is byte-for-byte unchanged for visitors who never open it. The fallback is a flat dark fill rather than a spinner because the existing pixel `Preloader` already covers the whole route transition.
  - **Five OS skins as pure data** (`skins.ts`) — Windows 11, macOS Sonoma, Fedora 40, Kali 2025.2 and Arch/i3 differ only by values in one table (panel kind, window-control style, radius, native font stack, surfaces, accent). Wallpapers are CSS gradients: zero bytes, instant decode, instant swap. The active skin is written as CSS custom properties onto a single root `div` — not `documentElement` — so switching OS invalidates style on one subtree and leaves the main site's theme vars alone. Choice persists in `localStorage`.
  - **`ComputerEgg`** — mirrors `EasterEgg`'s hover-reveal interaction, anchored bottom-left, sliding in from the left. Sits at `z-50`, below `DevMode`'s `z-9997`, so the Konami HUD (same corner) always wins.
- **`/computer` phase 2: virtual filesystem** (`src/os/fs.ts`) — a 59-node tree **derived** from `src/data/content.ts`, never copy-pasted, so a project edit updates the homepage, the `/cli` terminal and the desktop together. `~/Desktop` holds `Projects/` (one folder per project: generated `README.md` + preview image + `live.url`/`source.url` shortcuts), `Gallery/` (the 5 webps), and generated `about.md` / `experience.md` / `skills.md` / a genuinely-importable `contact.vcf` / `README.txt`; `~/Documents`, `~/Links` and a joke `~/.config` (`.bashrc`, `neofetch.conf`) round out the home dir. The real `resume.pdf` opens in a new tab rather than faking a PDF viewer. Text file sizes are the actual `Blob` byte length, not invented numbers. Built once at module scope with a flat `path → node` Map for O(1) resolution (a window persists only a path). Search is a linear scan over ~59 nodes with a `ponytail:` note on the threshold for moving to a worker-side index; a `__selfCheck()` asserts every source project reached the tree.
- **`/computer` phases 3–7: full virtual OS desktop experience** (`src/components/computer/Panel.tsx`, `src/components/computer/apps/Files.tsx`, `src/components/computer/apps/Reader.tsx`, `src/components/computer/apps/ImageViewer.tsx`, `src/components/computer/apps/Settings.tsx`, integrated in `src/components/computer/Computer.tsx`, `src/components/computer/Window.tsx`) — completed the interactive simulated operating system.
  - **Skins & Panels** (`Panel.tsx`) — Implemented native custom panels for Windows 11 Taskbar, macOS Sonoma MenuBar & Dock, Fedora GNOME TopBar, Kali XFCE Panel, and Arch i3-gaps Bar. Includes native SVG logo components, clock systems, quick status badges (Wifi, battery), active window managers, and full OS look toggles.
  - **Portfolio Apps** (`apps/`) — Created a set of 4 custom applications: `Files` (complete directory tree search/list navigation with sidebar shortcuts and view controls), `Reader` (custom-tailored lightweight markdown body renderer supporting links, lists, blocks, header styles, and raw file downloads), `ImageViewer` (interactive canvas containing rotation and scale adjustments), and `Settings` (interactive look selector and virtual cache purger).
  - **Mobile Fullscreen Adaptation** (`Window.tsx`) — Automatically maximizes window containers on mobile views (viewport width < 640px) to switch window interactions to single-app screens, hiding resize handlers.
- **Secret `eggs` command** (`src/components/Terminal.tsx`) — a hidden terminal command that lists every easter egg (sl, cmatrix, hack, darkhour, sudo gags, fork bomb, …) in one place. Deliberately absent from `help`.
- **Google Analytics 4 integration** (`src/lib/analytics.ts`, wired in `App.tsx`, `Hero.tsx`, `Header.tsx`, `Work.tsx`, `Contact.tsx`, `FlowingMenu.tsx`, `ProjectModal.tsx`) — production-ready GA4 via native `gtag.js` (no npm dep). Key points: idempotent init guards against StrictMode double-mount and clock re-renders; `send_page_view:false` at config time lets `trackPageView()` drive SPA navigation events without duplicates; dev mode logs every event to `console.debug`; Measurement ID is env-only (`VITE_GA_MEASUREMENT_ID`, never hardcoded); `.env` is now gitignored (`.env.example` committed). Custom events: `resume_download`, `github_click` (with location), `linkedin_click`, `contact_click`, `project_demo_click`, `project_source_click`, `external_link_click`.
- **Theme-wheel scroll sound** (`src/components/ThemePicker.tsx`) — spinning the dial now plays a crisp tick (`wheel-scroll.mp3`). The clip is preloaded once into a single `Audio` element (no per-tick fetch lag) and rewound to `0` on each play so rapid ticks retrigger instantly; a 70 ms throttle keeps the wheel's flood of events from smearing into a drone. Volume 0.35; autoplay-policy rejections before the first gesture are swallowed.
- **Dark Hour — hidden Persona 3 midnight takeover** (`src/hooks/useDarkHour.ts`, `src/components/DarkHour.tsx` + `.css`, wired in `App.tsx` / `Terminal.tsx` / `useConsoleEggs.ts`) — inspired by P3's secret "25th hour". Between **00:00:00 and 00:01:59** local time the site is overtaken in **two phases**: (1) a brief opaque **intro cinematic** (~3.8s) — green moon-clock backdrop (`dark-hour.webp`), glowing moon, rising coffin silhouettes, film grain + scanlines, crimson blood-water vignette, and a fading "The Dark Hour has come. / Memento mori." title card; then (2) it dissolves to an **ambient wash** where the portfolio shows through — still washed sickly green (hue-shift + drain filter) with its **animations frozen** ("time stands still") and any playing audio paused. In ambient the overlay is click-through (browse normally); a single top-centre HUD exits (or press Esc). **All electronics are dead** — every page control (buttons, links, audio/video, inputs) stops responding; the theme dial is additionally dimmed + flickering like a failing screen (also stops it overriding the green wash). A **periodic power-flicker** blinks the whole scene at irregular beats, and exiting plays a quick **"power restored" reverse fade** (bright flash → out) before the world snaps back. Fires **once per night** (localStorage guard, survives reload mid-window). Force it any time via the terminal **`darkhour`** command or the **`#darkhour`** hash. Restores the previous theme on exit. Honours `prefers-reduced-motion`.
- **Main-page interactive elements + easter eggs** (`src/App.tsx`, `src/components/Hero.tsx`, `src/components/Experience.tsx`, new `Typewriter.tsx` / `DevMode.tsx`, hooks `useKonami.ts` / `useConsoleEggs.ts`):
  - **Konami Code** (↑↑↓↓←→←→BA) — fires a confetti burst and toggles a **dev-mode HUD** (bottom-left): live FPS meter + a "secret theme" unlock. Ignores input fields so it never clashes with the terminal.
  - **Console eggs** — styled `console.log` recruiter banner on load with a real global **`hire()`** that opens the mailto; document title flips to a cheeky line when the tab loses focus; **`?matrix`** query param runs the matrix rain and **`#konami`** hash auto-unlocks dev mode.
  - **Hero typewriter** — the role line now types/deletes through a rotating set of real + playful one-liners (SDE / "future Jarvis builder" / "chess addict ♟" …) with a blinking caret.
  - **Avatar click-streak** — 5 fast clicks on the hero avatar spin it, swap to an alt photo, and pop confetti; a single click still opens the gallery.
  - **Experience timeline spine** — a gradient spine now draws itself top-to-bottom (`scaleY`) as the section scrolls in, with per-role node dots (pulsing on the current role).
- **Interactive terminal commands + fullscreen FX** (`src/components/Terminal.tsx`, `src/components/TerminalFX.tsx` + `.css`, `src/lib/themes.ts`) — the `/cli` terminal now does a lot more than print sections:
  - **`sudo rm -rf --no-preserve-root`** — fires a CRT-glitch deletion blast (fake wipe progress bar → screen melt → white flash) then drops you back on the homepage. Matches any `sudo rm -r… /` variant.
  - **Fullscreen cinematics** — `cmatrix` (green digital-rain canvas, dismiss on keypress/click), `sl` (ASCII steam locomotive chugs across), the `:(){ :|:& };:` fork bomb (text floods, jitters, "nice try 😏" recovery).
  - **`sudo` gags** — bare `sudo` → sudoers scolding; `sudo make me a sandwich` → xkcd #149; **`sudo hire aneesh`** → confetti burst + contact link.
  - **`hack` / `nmap`** — fake Hollywood hacking stream ending in "ACCESS GRANTED — just kidding".
  - **`neofetch`** — ASCII sigil + faux system-info card (shows the live theme name and a palette swatch strip).
  - **`theme <id>` / `persona <3|4|5>`** — switch the site theme straight from the terminal, reusing the shared palette; `persona` prints a tarot card and locks the matching P3R/P4/P5R theme.
  - **Shell staples** — `whoami`, `fortune` (rotating dev quips), `history`, `echo`, `date` (live clock), `pwd`, `uname`, `man`, `coffee`/`brew` (HTTP 418 teapot). Help now lists the useful ones and teases the hidden ones; all autocomplete via Tab.
- **Shared theme module** (`src/lib/themes.ts`) — palette + `applyTheme`/`findTheme`/`loadInitialTheme` extracted from `ThemePicker` so the dial and the terminal drive one source of truth. Theme choice now **persists** to `localStorage` and is restored on load.
- **Persona tribute themes** (`src/components/ThemePicker.tsx`) — three new dial themes keyed to each game's signature UI colour: **P3 Reload** (electric Tartarus blue `#37aaff` on deep navy), **P4** (Midnight-Channel yellow `#ffe500` on warm black), and **P5 Royal** (velvet-room red `#ff2233` on near-black). Palette now 15 themes; ring geometry (`STEP`) auto-derives from `PALETTE.length`, so dial spacing self-adjusts.
- **Paired theme switching** (`tailwind.config.ts`, `src/index.css`, `src/components/ThemePicker.tsx`) — each theme is now a matched (background, accent) pair, not just a background. Tailwind's `primary` accent reads from a runtime `--primary` RGB-channel CSS var (default mint `85 221 173` in `:root`), so all 46 `primary` uses and every `primary/NN` opacity modifier retint live. The picker commits background + accent together at the end of the reveal sweep; dial dots now preview each theme's accent.
- **Theme-aware accent surfaces** (`src/components/MagicBento.tsx` + `.css`, `src/components/Work.tsx`, `src/App.tsx`, `src/index.css`) — every previously-hardcoded mint (`#55ddad` / `rgba(85,221,173,…)`) now flows through the live `--primary` channel via modern `rgb(var(--primary) / a)` syntax: the Work grid's border-glow, spotlight, particles, hover shadow, and click ripple, plus the page's top ambient bloom. Added a paired `--bg` surface channel (default navy `14 19 32`); the project cards' scrim gradient now fades to the active theme background instead of a fixed navy. Refreshed the 5-theme palette (Stdout / Ocean / Grape / Sunset / Sakura) for better bg↔accent contrast. (Canvas-drawn greens in Stack/GitHub graph still use static hex — separate follow-up.)
- **Rotating dial theme picker** (`src/components/ThemePicker.tsx` + `.css`) — the fanned arc is now a full rotating ring of 12 themes centred on the viewport's top-right corner. Only the lower-left quarter of the ring is on-screen (the rest overflows past the edges), so it reads like a real dial face. Scrolling the wheel while the dial is open spins the ring (`--rot`, non-passive `wheel` listener with `preventDefault`) to bring more colours into the visible arc; each dot counter-rotates to stay upright. Picking a dot still fires the circular-reveal sweep and commits the (bg + accent) pair.
- **Circular-reveal theme picker** (`src/components/ThemePicker.tsx` + `.css`) — fixed top-right toggle (`Palette` icon, rotates 135° when open) that fans out a radial dial of 5 colour dots along a ~150° arc with a staggered "dealing cards" delay. Picking a colour plants a `border-radius:50%`, `250vw` circle at the top-right corner and expands it `scale(0)→scale(1)` over a 1s `cubic-bezier` sweep (liquid ripple) above page content, then commits the colour to a base layer (`.theme-base`, `z-0`) and drops the ripple seamlessly. Three-layer z-stack (base < ripple < chrome); `overflow:hidden` on the ripple wrap prevents scrollbars; honours `prefers-reduced-motion`. Wired into `App.tsx` as a root sibling.
- **Functional music player** (`src/components/NowPlaying.tsx`) — now wraps a real `<audio>` element loading the bundled Charlie Puth – "We Don't Talk Anymore" track. Starts paused; play/pause, click-to-seek progress bar, restart, +10s forward, and mute are all wired to the native element with live time/duration readouts.
- **Blogs nav item** (`src/components/Header.tsx`) — distinct pill-style link (`PenLine` icon, mint outline) that opens `https://blogs.aneesh-sharma.me` in a new tab. New `navBlogs` translation key across all five languages.
- **Signature quote** (`src/components/About.tsx`) — replaced the four value pills (Clean Code / Problem Solver / Performance / Team Player) with a styled `blockquote`: "Corruption is just legacy code nobody wants to refactor. ~ Me" — accent bar, decorative quote glyph, mint-tinted card.
- **Experience section** (`src/components/Experience.tsx`) — vertical timeline with a mint gradient spine, `Briefcase` node markers (pulsing ring on the current role), and a light staggered fade/slide-in on scroll (CSS-only, via `useReveal`). Seeded with Resiliencesoft SDE (Feb 2025 — Present). New `#experience` nav item + `expEyebrow`/`expTitle`/`expAccent`/`navExperience` keys and an `experiences` data model across all five languages.

### Changed
- **About bio rewrite** (`bio0`/`bio1`/`bio2` in `src/data/translations.ts`, `personal.bio` in `src/data/content.ts`) — new first-person story covering background, stack, and interests, fully translated across all five languages (EN/JA/ES/DE/ZH). Hero lead swapped from `bio0` to the shorter `headline` so it stays a one-liner.
- **Animated bio tooltips** (`src/components/About.tsx`) — four "story" words (`Jarvis`, `Rust`, `RAG systems`, `manhwas`, localised per language) now carry a dotted underline and a CSS-only fade + slide tooltip card explaining the reference. Keyboard-focusable via `group-focus-within`. Replaces the earlier keyword-highlight accent spans.
- **GitHub username** — updated all links, handles, and the contributions API/terminal prompt from `aneeshsharma72067` to `jiffyaneesh` (`src/data/content.ts`, `src/components/GitHubContributions.tsx`, `src/components/Terminal.tsx`, `index.html`, `CONTENT.md`).
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
