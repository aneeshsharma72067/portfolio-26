import { personal } from '@/data/content';

/**
 * Footer — hairline top rule, centred italic serif, green copyright line.
 */
const Footer = () => (
  <footer className="mt-28 border-t border-primary/10 py-12 text-center">
    <p className="font-body text-sm italic text-on-surface-variant">
      Designed &amp; built with intent, in the quiet hours.
    </p>
    <p className="mt-2 font-label text-[11px] font-bold uppercase tracking-label text-primary/70">
      © {new Date().getFullYear()} {personal.name}
    </p>
  </footer>
);

export default Footer;
