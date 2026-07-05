import { useEffect, useRef, useState } from 'react';
import { personal, links } from '@/data/content';
import { useTranslation } from '@/context/TranslationContext';
import { LANGUAGES, Language } from '@/data/translations';
import { Globe, ChevronDown } from 'lucide-react';

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
              {t(item.tKey)}
            </a>
          ))}
        </nav>

        {/* Action controls (Language Picker + GitHub Link) */}
        <div className="flex items-center gap-6">
          {/* Language selector button with dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-label text-outline transition-colors duration-300 hover:text-on-surface"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <Globe size={13} className="text-outline/80" />
              {LANGUAGES.find((lang) => lang.code === language)?.label || 'EN'}
              <ChevronDown size={11} className={`text-outline/60 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown panel */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-32 origin-top-right rounded border border-outline-variant/50 bg-[#0e1320] p-1 shadow-floating animate-in fade-in slide-in-from-top-1 duration-200">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full rounded px-3 py-2 text-left font-label text-[11px] font-bold uppercase tracking-wide transition-colors ${
                      language === lang.code
                        ? 'bg-primary/10 text-primary'
                        : 'text-outline/80 hover:bg-surface-container-high/50 hover:text-on-surface'
                    }`}
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
          <a
            href={links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-label text-[11px] font-bold uppercase tracking-label text-primary transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(85,221,173,0.8)]"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
