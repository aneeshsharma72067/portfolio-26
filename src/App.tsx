import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Work from '@/components/Work';
import Stack from '@/components/Stack';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Preloader from '@/components/Preloader';

/**
 * Root layout — a single centred reading column (~60 % viewport on desktop).
 *
 * Boot sequence:
 *   1. <Preloader> sits at z-9999 and plays its ~1.5 s animation.
 *   2. Mid-exit it calls onDone() → `ready` flips true.
 *   3. The main app transitions from opacity-0 → opacity-1 (600 ms).
 *   4. Preloader finishes fading out; both crossfade completes cleanly.
 */
const App = () => {
  /* true once the preloader fires onDone() */
  const [ready, setReady] = useState(false);

  return (
    <>
      {/* Preloader — always in DOM but becomes opacity-0 / pointer-events-none after exit */}
      <Preloader onDone={() => setReady(true)} />

      {/* Main app — cross-fades in as the preloader fades out */}
      <div
        id="top"
        className="relative min-h-screen overflow-x-hidden"
        style={{
          opacity: ready ? 1 : 0,
          transition: 'opacity 600ms ease',
        }}
      >
        {/* Ambient glow — single restrained green bloom near the top */}
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
      </div>
    </>
  );
};

export default App;
