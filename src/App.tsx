import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Work from '@/components/Work';
import Stack from '@/components/Stack';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Preloader from '@/components/Preloader';
import { useClickBurst } from '@/hooks/useClickBurst';

/**
 * Root layout — a single centred reading column (~60 % viewport on desktop).
 *
 * Boot sequence:
 *   The <Preloader> sits at z-9999 and covers the entire viewport with a
 *   grid of pixel tiles. After the loading animation plays (~1.2 s), the
 *   tiles dissolve randomly over ~2 s, directly revealing the app below.
 *   No opacity transition on the app itself — the pixel reveal IS the
 *   transition. <Preloader> unmounts itself when completely done.
 */
const App = () => {
  /* Spawn ring-particle fireworks on every click — zero re-renders */
  useClickBurst();

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
    </div>
  </>
);

};

export default App;
