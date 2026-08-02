import { Fragment, type ReactNode } from 'react';
import { Quote } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';
import { useReveal } from '@/hooks/useReveal';
import type { Language } from '@/data/translations';
import SectionHeading from './SectionHeading';

/**
 * A single bio word that reveals an animated tooltip on hover/focus. The
 * `word` must appear verbatim in the localised bio prose so the matcher can
 * find and wrap it. `tip` is the short explanatory blurb shown in the card.
 */
type BioTooltip = { word: string; tip: string };

/**
 * Only a handful of "story" words get a tooltip — enough to reward curiosity
 * without turning the paragraph into a minefield of hover targets. Keyed by
 * language because the trigger word itself is localised (e.g. マンファ / 韩漫).
 */
const TOOLTIPS: Record<Language, BioTooltip[]> = {
  en: [
    { word: 'Jarvis', tip: "Iron Man's AI assistant — my someday personal-automation dream." },
    { word: 'Rust', tip: 'Systems language with zero-cost abstractions and no garbage collector.' },
    { word: 'RAG systems', tip: 'Retrieval-Augmented Generation — LLMs grounded in your own data.' },
    { word: 'manhwas', tip: 'Korean comics, usually read top-to-bottom in full colour.' },
  ],
  ja: [
    { word: 'Jarvis', tip: 'アイアンマンのAIアシスタント。いつか作りたい自動化の夢。' },
    { word: 'Rust', tip: 'ゼロコスト抽象化とGCなしを両立するシステムプログラミング言語。' },
    { word: 'RAGシステム', tip: '検索拡張生成。自分のデータに基づいて回答するLLMの仕組み。' },
    { word: 'マンファ', tip: '韓国の漫画。基本はフルカラーで縦スクロールで読む。' },
  ],
  es: [
    { word: 'Jarvis', tip: 'El asistente de IA de Iron Man; mi sueño de automatización personal.' },
    { word: 'Rust', tip: 'Lenguaje de sistemas con abstracciones sin coste y sin recolector de basura.' },
    { word: 'sistemas RAG', tip: 'Generación Aumentada por Recuperación: LLMs basados en tus propios datos.' },
    { word: 'manhwas', tip: 'Cómics coreanos, normalmente a todo color y de lectura vertical.' },
  ],
  de: [
    { word: 'Jarvis', tip: 'Iron Mans KI-Assistent — mein irgendwann-mal Automatisierungstraum.' },
    { word: 'Rust', tip: 'Systemsprache mit kostenfreien Abstraktionen und ohne Garbage Collector.' },
    { word: 'RAG-Systeme', tip: 'Retrieval-Augmented Generation: LLMs, die auf deinen eigenen Daten fußen.' },
    { word: 'Manhwas', tip: 'Koreanische Comics, meist in Farbe und vertikal zu lesen.' },
  ],
  zh: [
    { word: 'Jarvis', tip: '钢铁侠的 AI 助手 —— 我总有一天要做出来的个人自动化梦想。' },
    { word: 'Rust', tip: '拥有零成本抽象、且没有垃圾回收器的系统级编程语言。' },
    { word: 'RAG 系统', tip: '检索增强生成：让大模型基于你自己的数据来回答。' },
    { word: '韩漫', tip: '韩国漫画，通常是全彩、竖向滑动阅读。' },
  ],
};

/** Escape a string for safe interpolation into a RegExp. */
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A bio word wrapped with a CSS-only, fade + slide tooltip. */
const TooltipWord = ({ word, tip }: BioTooltip) => (
  <span className="group relative inline-block">
    {/* Trigger — dotted underline hints that it's interactive. tabIndex makes
        the tooltip keyboard-focusable too (group-focus-within). */}
    <span
      tabIndex={0}
      className="cursor-help font-medium text-primary underline decoration-dotted decoration-primary/50 underline-offset-4 outline-none"
    >
      {word}
    </span>

    {/* Card — hidden by default, fades + slides up on hover/focus. */}
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 translate-y-1 rounded-xl border border-primary/20 bg-surface-container-highest px-3.5 py-2.5 text-center font-body text-sm not-italic leading-snug text-on-surface opacity-0 shadow-floating transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
    >
      {tip}
      {/* Caret pointing down at the trigger word. */}
      <span className="absolute left-1/2 top-full -ml-1.5 border-x-[6px] border-t-[6px] border-x-transparent border-t-surface-container-highest" />
    </span>
  </span>
);

/**
 * Split a bio paragraph on any tooltip trigger word and re-wrap the matches
 * in <TooltipWord>. Longest-first ordering stops a short word from matching
 * inside a longer phrase (e.g. "RAG" inside "RAG systems").
 */
const renderBio = (text: string, tips: BioTooltip[]): ReactNode => {
  if (!tips.length) return text;
  const ordered = [...tips].sort((a, b) => b.word.length - a.word.length);
  const re = new RegExp(`(${ordered.map((t) => escapeRe(t.word)).join('|')})`, 'g');

  return text.split(re).map((part, i) => {
    const match = tips.find((t) => t.word === part);
    return match ? (
      <TooltipWord key={i} word={match.word} tip={match.tip} />
    ) : (
      <Fragment key={i}>{part}</Fragment>
    );
  });
};

/**
 * About — long-form serif prose (the "writing" voice) with a few animated
 * tooltip words, closed out by a signature quote. Generous whitespace signals
 * slow reading.
 */
const About = () => {
  const { ref, visible } = useReveal();
  const { t, tArray, language } = useTranslation();
  const tips = TOOLTIPS[language] ?? TOOLTIPS.en;

  return (
    <section
      id="about"
      ref={ref}
      className={`mt-28 transition-all duration-700 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <SectionHeading
        eyebrow={t('aboutEyebrow')}
        title={t('aboutTitle')}
        accent={t('aboutAccent')}
        accentWords={tArray('aboutAccentWords')}
      />

      <div className="space-y-6">
        <p className="font-body text-lg leading-[1.8] text-on-surface-variant">
          {renderBio(t('bio0'), tips)}
        </p>
        <p className="font-body text-lg leading-[1.8] text-on-surface-variant">
          {renderBio(t('bio1'), tips)}
        </p>
        <p className="font-body text-lg leading-[1.8] text-on-surface-variant">
          {renderBio(t('bio2'), tips)}
        </p>
      </div>

      {/* Signature quote — replaces the old value pills */}
      <figure className="relative mt-10 overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.06] p-6 pl-14 shadow-floating">
        {/* Accent bar on the left edge */}
        <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-primary-container" />
        {/* Oversized decorative quote glyph */}
        <Quote
          size={28}
          className="absolute left-5 top-5 text-primary/50"
          fill="currentColor"
        />
        <blockquote className="font-body text-lg italic leading-relaxed text-on-surface sm:text-xl">
          Corruption is just legacy code nobody wants to refactor.
        </blockquote>
        <figcaption className="mt-3 font-label text-[11px] font-bold uppercase tracking-label text-primary">
          ~ Me
        </figcaption>
      </figure>
    </section>
  );
};

export default About;
