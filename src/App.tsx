import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Work from '@/components/Work';
import Stack from '@/components/Stack';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Preloader from '@/components/Preloader';
import EasterEgg from '@/components/EasterEgg';
import Terminal from '@/components/Terminal';
import { useClickBurst } from '@/hooks/useClickBurst';

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

  /* Spawn ring-particle fireworks on every click — zero re-renders */
  useClickBurst();

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

    return (
      <div id="top" className="relative min-h-screen overflow-x-hidden">
        {/* Ambient glow — restrained green bloom near the top */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 h-[420px] opacity-60"
          style={{
            background:
              'radial-gradient(60% 100% at 50% 0%, rgba(85,221,173,0.10), transparent 70%)',
          }}
        />

        <Header />

        <main className="relative z-10 mx-auto w-[90%] max-w-5xl pb-4 pt-24 md:w-[60%]">
          <Hero />
          <About />
          <Work />
          <Stack />
          <Contact />
          <Footer />
        </main>

        {/* Easter egg in bottom right corner triggers the popup to /cli */}
        <EasterEgg onNavigate={navigateTo} />
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
    </>
  );
};

export default App;
