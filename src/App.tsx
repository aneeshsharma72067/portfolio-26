import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Work from '@/components/Work';
import Stack from '@/components/Stack';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

/**
 * Root layout — a single centred reading column (~65% viewport on desktop),
 * echoing the bharath.codes structure but skinned in the Stdout theme.
 * A soft radial glow sits behind the top of the page for depth.
 */
const App = () => {
  return (
    <div id="top" className="relative min-h-screen overflow-x-hidden">
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

      <main className="relative z-10 mx-auto w-[90%] max-w-3xl pb-4 pt-24 md:w-[68%]">
        <Hero />
        <About />
        <Work />
        <Stack />
        <Contact />
        <Footer />
      </main>
    </div>
  );
};

export default App;
