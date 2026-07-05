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
 * Sinks click burst fireworks on click, shows pixel-dissolve preloader on mount.
 */
const App = () => {
  const [route, setRoute] = useState(window.location.pathname);

  /* Spawn ring-particle fireworks on every click — zero re-renders */
  useClickBurst();

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    // Listen for custom routing events in case pushState is triggered manually
    window.addEventListener('pushstate_change', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate_change', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  // Render terminal interface directly if pathname is /cli
  if (route === '/cli') {
    return <Terminal onNavigate={navigateTo} />;
  }

  return (
    <>
      {/* Pixel-dissolve preloader — self-managing, unmounts when done */}
      <Preloader />

      {/* Main app — always visible; preloader tiles cover it until reveal */}
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
    </>
  );
};

export default App;
