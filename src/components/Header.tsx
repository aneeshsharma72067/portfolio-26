import { useEffect, useState } from 'react';
import { personal, links } from '@/data/content';

/** In-page anchors shown in the centre of the nav. */
const navItems = [
  { name: 'About', href: '#about' },
  { name: 'Work', href: '#work' },
  { name: 'Stack', href: '#stack' },
  { name: 'Contact', href: '#contact' },
];

/**
 * Fixed glass header — brand left, nav centre, external link right.
 * Follows the Stdout house style: uppercase, wide-tracked mono-ish labels,
 * with a subtle blur that intensifies once the page is scrolled.
 */
const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 border-b transition-all duration-300 ${
        scrolled
          ? 'border-outline-variant/50 bg-surface-container-low/70 backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-full w-[90%] max-w-5xl items-center justify-between">
        {/* Brand */}
        <a
          href="#top"
          className="font-headline text-lg font-black tracking-tight text-on-surface"
        >
          {personal.name.split(' ')[0]}
          <span className="text-primary">.</span>
        </a>

        {/* Centre nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="font-label text-[11px] font-bold uppercase tracking-label text-outline transition-colors duration-300 hover:text-on-surface"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* External link */}
        <a
          href={links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="font-label text-[11px] font-bold uppercase tracking-label text-primary transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(85,221,173,0.8)]"
        >
          GitHub ↗
        </a>
      </div>
    </header>
  );
};

export default Header;
