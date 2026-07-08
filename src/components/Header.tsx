import { useEffect, useRef, useState } from 'react';
import { personal, links } from '@/data/content';
import { useTranslation } from '@/context/TranslationContext';
import { LANGUAGES, Language } from '@/data/translations';
import { Globe, ChevronDown, PenLine } from 'lucide-react';
import Magnetic from './Magnetic';

const navItems = [
  { name: 'About', href: '#about', tKey: 'navAbout' as const },
  { name: 'Work', href: '#work', tKey: 'navWork' as const },
  { name: 'Stack', href: '#stack', tKey: 'navStack' as const },
  { name: 'Contact', href: '#contact', tKey: 'navContact' as const },
];

/**
 * Fixed glass header — brand left, nav centre, language picker + external link right.
 */
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { language, setLanguage, t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleLanguageSelect = (code: Language) => {
    setLanguage(code);
    setDropdownOpen(false);
  };

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
          Aneesh<span className="text-primary">.</span>
        </a>

        {/* Navigation links */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="font-label text-[11px] font-bold uppercase tracking-label text-on-surface-variant transition-colors hover:text-white"
            >
              {t(item.tKey)}
            </a>
          ))}

          {/* Blogs — distinct pill UI, opens external blog in a new tab */}
          <a
            href="https://blogs.aneesh-sharma.me"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-label text-[11px] font-bold uppercase tracking-label text-primary transition-all duration-300 hover:border-primary hover:bg-primary/20 hover:drop-shadow-[0_0_10px_rgba(85,221,173,0.6)]"
          >
            <PenLine size={12} className="transition-transform duration-300 group-hover:-rotate-12" />
            {t('navBlogs')}
          </a>
        </nav>

        {/* Action controls (Language Picker + GitHub Link) */}
        <div className="flex items-center gap-4">
          {/* Language selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 rounded border border-outline-variant/30 bg-surface-container-low/40 px-2 py-1 font-mono text-[10px] text-on-surface-variant hover:border-primary/50 hover:text-white"
            >
              <Globe size={12} className="text-primary" />
              <span>{LANGUAGES.find((l) => l.code === language)?.label || 'EN'}</span>
              <ChevronDown size={10} className="opacity-60" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-24 rounded border border-outline-variant/30 bg-surface-container-high p-1 shadow-floating">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className="w-full rounded px-2 py-1 text-left font-mono text-[10px] text-on-surface-variant hover:bg-white/5 hover:text-white"
                  >
                    {lang.code === 'en' && 'English'}
                    {lang.code === 'ja' && '日本語'}
                    {lang.code === 'es' && 'Español'}
                    {lang.code === 'de' && 'Deutsch'}
                    {lang.code === 'zh' && '中文'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* External link */}
          <Magnetic strength={0.12}>
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label text-[11px] font-bold uppercase tracking-label text-primary transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(85,221,173,0.8)]"
            >
              GitHub ↗
            </a>
          </Magnetic>
        </div>
      </div>
    </header>
  );
};

export default Header;
