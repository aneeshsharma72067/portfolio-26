import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Work from '@/components/Work';
import Experience from '@/components/Experience';
import Stack from '@/components/Stack';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Preloader from '@/components/Preloader';
import EasterEgg from '@/components/EasterEgg';
import Terminal from '@/components/Terminal';
import ComputerEgg from '@/components/ComputerEgg';
import ThemePicker from '@/components/ThemePicker';
import DevMode from '@/components/DevMode';
import DarkHour from '@/components/DarkHour';
import TerminalFX, { fireConfetti, type FxEffect } from '@/components/TerminalFX';
import { useClickBurst } from '@/hooks/useClickBurst';
import { useKonami } from '@/hooks/useKonami';
import { useConsoleEggs } from '@/hooks/useConsoleEggs';
import { useDarkHour } from '@/hooks/useDarkHour';
import { initAnalytics, trackPageView } from '@/lib/analytics';

/* The virtual desktop is a whole OS worth of code (windows, filesystem, four
   apps, five skins). Lazy-loading it keeps every byte of it out of the main
   bundle — visitors who never find the bottom-left egg never download it. */
const Computer = lazy(() => import('@/components/computer/Computer'));

/**
 * Root layout — supports client-side pathname-based routing for '/cli' vs '/'.
 * Runs an intermediate pixelated preloader transition during transitions:
 * 1. Preloader pixels up (covers screen with green grid).
 * 2. Midpoint callback swaps the route state.
 * 3. Preloader pixels down (dissolves to reveal the new page).
 */
const App = () => {
  const [route, setRoute] = useState(window.location.pathname);
  const [preloaderMode, setPreloaderMode] = useState<'boot' | 'transition'>('boot');
  const [showPreloader, setShowPreloader] = useState(true);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  // Dev-mode HUD (Konami-unlocked) + a global fullscreen effect the console
  // eggs / Konami can fire over the main page (e.g. matrix rain, confetti).
  const [devMode, setDevMode] = useState(false);
  const [fx, setFx] = useState<FxEffect | null>(null);

  /* Spawn ring-particle fireworks on every click — zero re-renders */
  useClickBurst();

  /* GA4 ── initialize exactly once on mount. The gtag('config', ID) call
     inside initAnalytics() already sends the first page_view automatically,
     so we must NOT also call trackPageView here (that would double-count the
     landing load). */
  useEffect(() => {
    initAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* GA4 ── track SPA route changes. The initial value of `route` is skipped
     because the ref starts as false and flips to true after mount. */
  const routeRef = useRef(false);
  useEffect(() => {
    if (!routeRef.current) {
      routeRef.current = true;
      return;
    }
    trackPageView(route);
  }, [route]);

  /* Hidden Persona 3 "Dark Hour": auto-fires in the midnight window; can also be
     forced via terminal / #darkhour hash. */
  const { active: darkHour, dismiss: dismissDarkHour, force: forceDarkHour } = useDarkHour();

  /* Konami Code → confetti burst + toggle the dev-mode HUD. */
  useKonami(() => {
    fireConfetti(160);
    setDevMode((d) => !d);
  });

  /* Console banner + hire() global + tab-blur title + ?matrix/#konami/#darkhour. */
  useConsoleEggs({
    onMatrix: () => setFx('matrix'),
    onKonami: () => {
      fireConfetti(160);
      setDevMode(true);
    },
    onDarkHour: forceDarkHour,
  });

  /* Cross-component trigger: the terminal (a different route) dispatches this
     event so its `darkhour` command can summon the takeover on the GUI. */
  useEffect(() => {
    const onEvt = () => forceDarkHour();
    window.addEventListener('portfolio:darkhour', onEvt);
    return () => window.removeEventListener('portfolio:darkhour', onEvt);
  }, [forceDarkHour]);

  useEffect(() => {
    const handleLocationChange = () => {
      const targetPath = window.location.pathname;
      if (targetPath !== route) {
        setPendingRoute(targetPath);
        setPreloaderMode('transition');
        setShowPreloader(true);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('pushstate_change', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate_change', handleLocationChange);
    };
  }, [route]);

  const navigateTo = (path: string) => {
    if (path === route) return;
    setPendingRoute(path);
    setPreloaderMode('transition');
    setShowPreloader(true);
  };

  const handleMidpoint = () => {
    if (pendingRoute) {
      window.history.pushState({}, '', pendingRoute);
      setRoute(pendingRoute);
    }
  };

  const handleComplete = () => {
    setShowPreloader(false);
    setPendingRoute(null);
  };

  // Render terminal interface directly if pathname is /cli
  const renderView = () => {
    if (route === '/cli') {
      return <Terminal onNavigate={navigateTo} />;
    }

    if (route === '/computer') {
      /* The fallback is a plain dark fill, not a spinner: the pixel preloader is
         already covering the screen during the transition, so anything visible
         here would only flash if the chunk outlives the animation. */
      return (
        <Suspense fallback={<div className="fixed inset-0 bg-[#04162a]" />}>
          <Computer onNavigate={navigateTo} />
        </Suspense>
      );
    }

    return (
      <div id="top" className="relative min-h-screen overflow-x-hidden">
        {/* Ambient glow — restrained accent bloom near the top (follows theme) */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[2] h-[420px] opacity-60"
          style={{
            background:
              'radial-gradient(60% 100% at 50% 0%, rgb(var(--primary) / 0.10), transparent 70%)',
          }}
        />

        <Header />

        {/* Circular-reveal theme switcher (fixed top-right) */}
        <ThemePicker />

        <main className="relative z-10 mx-auto w-[90%] max-w-5xl pb-4 pt-24 md:w-[60%]">
          <Hero />
          <About />
          <Work />
          <Experience />
          <Stack />
          <Contact />
          <Footer />
        </main>

        {/* Easter egg in bottom right corner triggers the popup to /cli */}
        <EasterEgg onNavigate={navigateTo} />

        {/* Its bottom-left twin: boots the virtual desktop at /computer */}
        <ComputerEgg onNavigate={navigateTo} />
      </div>
    );
  };

  return (
    <>
      {/* Intermediate preloader transition screen */}
      {showPreloader && (
        <Preloader
          mode={preloaderMode}
          onMidpoint={handleMidpoint}
          onComplete={handleComplete}
        />
      )}

      {renderView()}

      {/* Konami-unlocked debug HUD (bottom-left) */}
      {devMode && <DevMode onClose={() => setDevMode(false)} />}

      {/* Global fullscreen effect fired from console eggs / hash triggers */}
      {fx && <TerminalFX effect={fx} onDone={() => setFx(null)} />}

      {/* Hidden Persona 3 Dark Hour takeover (midnight window / forced) */}
      {darkHour && <DarkHour onDismiss={dismissDarkHour} />}
    </>
  );
};

export default App;
