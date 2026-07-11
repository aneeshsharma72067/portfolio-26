import { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowUpRight, Github } from 'lucide-react';
import { projects } from '@/data/content';
import { useTranslation } from '@/context/TranslationContext';

interface ProjectModalProps {
  isOpen: boolean;
  index: number;
  /** Viewport rect of the grid card that opened this modal (for the morph). */
  originRect?: DOMRect | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

/** A plain box in viewport coordinates — the FLIP "first"/"last" frames. */
type Box = { left: number; top: number; width: number; height: number };

/** Morph duration + easing, shared by the ghost tween and the backdrop fade. */
const MORPH_MS = 460;
const MORPH_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * ProjectModal — full-screen gallery viewer for the project list.
 *
 * Projects are arranged on a 3D cylinder: the active project faces the viewer
 * as a full detail card, while neighbours curve away to the left and right
 * (rotated + pushed back in Z) like a rotating carousel. Navigation via arrow
 * buttons, ←/→ keys, pointer drag, touch swipe, clicking a side card, or the
 * dot rail — all mutate the parent-owned `index` so grid and modal stay synced.
 */
const ProjectModal = ({ isOpen, index, originRect, onClose, onIndexChange }: ProjectModalProps) => {
  const { t } = useTranslation();

  // Drag tracking for swipe-to-navigate.
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  // Narrower geometry on small screens.
  const [isMobile, setIsMobile] = useState(false);

  /* -------- morph lifecycle --------
   * 'morphing' : ghost is flying from the grid card to the centred detail box.
   * 'open'     : morph done — real carousel + chrome are interactive.
   * 'closing'  : ghost is flying back to the grid card, chrome hidden.
   * The ghost box holds the current FLIP frame the transition animates toward. */
  const [phase, setPhase] = useState<'morphing' | 'open' | 'closing'>('morphing');
  const [ghost, setGhost] = useState<Box | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = projects.length;

  const next = () => onIndexChange((index + 1) % count);
  const prev = () => onIndexChange((index - 1 + count) % count);

  // Track viewport width for cylinder geometry.
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // The centred box the active detail card occupies — the morph's destination.
  const targetBox = (): Box => {
    const width = isMobile ? Math.min(window.innerWidth * 0.86, 380) : Math.min(760, window.innerWidth * 0.78);
    const height = isMobile ? window.innerHeight * 0.68 : Math.min(460, window.innerHeight * 0.74);
    return {
      width,
      height,
      left: (window.innerWidth - width) / 2,
      top: (window.innerHeight - height) / 2,
    };
  };

  const clearTimers = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Opening: start the ghost at the grid card, then fly it to the centre box.
  useEffect(() => {
    if (!isOpen) return;
    clearTimers();

    // No source rect (edge case) → skip morph, open straight away.
    if (!originRect) {
      setGhost(null);
      setPhase('open');
      return;
    }

    setPhase('morphing');
    // First frame: ghost sits exactly over the clicked card.
    setGhost({ left: originRect.left, top: originRect.top, width: originRect.width, height: originRect.height });

    // Next frame: move ghost to the centred detail box (triggers the CSS transition).
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setGhost(targetBox()));
    });

    // When the flight ends, reveal the real carousel + chrome.
    timerRef.current = setTimeout(() => setPhase('open'), MORPH_MS);

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Reverse morph, then actually unmount via onClose.
  const closeWithMorph = () => {
    clearTimers();
    if (!originRect) {
      onClose();
      return;
    }
    setPhase('closing');
    setGhost(targetBox()); // start from the centre…
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() =>
        setGhost({ left: originRect.left, top: originRect.top, width: originRect.width, height: originRect.height })
      );
    });
    timerRef.current = setTimeout(onClose, MORPH_MS);
  };

  // Lock body scroll while open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard: arrows navigate (only when fully open), escape closes with morph.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWithMorph();
      else if (phase !== 'open') return;
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, index, phase]);

  if (!isOpen) return null;

  const activeProject = projects[index];
  const morphing = phase !== 'open';
  // Chrome (header/footer/carousel) is only live once the morph settles.
  const chromeVisible = phase === 'open';

  // Localised description mirrors the original Work-row switch.
  const describe = (title: string, fallback: string) => {
    switch (title) {
      case 'RepoSage':
        return t('reposageDesc');
      case 'AI-Gen':
        return t('aigenDesc');
      case 'Folio':
        return t('folioDesc');
      case 'Repeto':
        return t('repetoDesc');
      default:
        return fallback;
    }
  };

  /* -------- drag / swipe: measure delta on release, snap to prev/next -------- */

  const startDrag = (x: number, y: number) => setDragStart({ x, y });

  const endDrag = (x: number, y: number, target: EventTarget, current: EventTarget) => {
    if (!dragStart) return;
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    const dist = Math.hypot(dx, dy);

    if (phase === 'open' && dist > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    } else if (dist < 10 && target === current) {
      // Treated as a click on the backdrop → close with the reverse morph.
      closeWithMorph();
    }
    setDragStart(null);
  };

  // Cylinder geometry — tuned per breakpoint.
  const xOffset = isMobile ? 150 : 460;
  const zOffset = isMobile ? -160 : -260;
  const rotateAngle = isMobile ? 42 : 40;

  return (
    <div
      className="fixed inset-0 z-[10000] select-none"
      style={{
        // Backdrop tint + blur fade in/out over the morph, in lockstep with the ghost.
        backgroundColor: 'rgba(7, 9, 14, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        opacity: phase === 'closing' ? 0 : 1,
        transition: `opacity ${MORPH_MS}ms ${MORPH_EASE}`,
      }}
    >
      {/* ── Morph ghost ──
          A clone of the active project that flies between the grid card and the
          centred detail box. Shown only while morphing/closing; the real carousel
          takes over once open. */}
      {morphing && ghost && (
        <div
          className="absolute overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
          style={{
            left: ghost.left,
            top: ghost.top,
            width: ghost.width,
            height: ghost.height,
            transition: `all ${MORPH_MS}ms ${MORPH_EASE}`,
            zIndex: 50,
          }}
        >
          <img src={activeProject.image} alt={activeProject.title} draggable={false} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e]/90 via-[#07090e]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5">
            <span className="font-label text-[10px] font-bold uppercase tracking-label text-primary">
              {activeProject.year}
            </span>
            <h4 className="mt-1 font-headline text-lg font-bold text-white">{activeProject.title}</h4>
          </div>
        </div>
      )}

      {/* Chrome (header/carousel/footer) fades in only after the morph settles. */}
      <div
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onMouseUp={(e) => endDrag(e.clientX, e.clientY, e.target, e.currentTarget)}
        onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={(e) => endDrag(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e.target, e.currentTarget)}
        className="flex h-full w-full flex-col items-center justify-between p-4 sm:p-6"
        style={{
          opacity: chromeVisible ? 1 : 0,
          transition: 'opacity 200ms ease-out',
          pointerEvents: chromeVisible ? 'auto' : 'none',
        }}
      >
      {/* ── Header ── */}
      <div onClick={(e) => e.stopPropagation()} className="flex w-full max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="font-label text-[10px] uppercase tracking-widest text-primary">Aneesh. Work</span>
        </div>
        <button
          onClick={closeWithMorph}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          title="Close (Esc)"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Cylindrical carousel ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-6xl flex-1 items-center justify-center"
      >
        {/* Prev */}
        <button
          onClick={prev}
          className="absolute left-2 z-[60] hidden h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/5 bg-black/40 text-white/60 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-white sm:flex"
          aria-label="Previous project"
        >
          <ChevronLeft size={24} />
        </button>

        {/* 3D scene */}
        <div
          className="relative flex h-full w-full items-center justify-center"
          style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}
        >
          {projects.map((project, i) => {
            // Wrapped offset in range roughly [-count/2, count/2].
            let diff = i - index;
            if (diff > count / 2) diff -= count;
            if (diff < -count / 2) diff += count;

            const isActive = diff === 0;
            const side = diff > 0 ? 1 : -1;
            const mag = Math.abs(diff);

            let transform = '';
            let opacity = 1;
            let zIndex = 10;
            let filter = 'none';

            if (isActive) {
              transform = 'translate3d(0, 0, 0) rotateY(0deg) scale(1)';
            } else if (mag === 1) {
              transform = `translate3d(${side * xOffset}px, 0, ${zOffset}px) rotateY(${-side * rotateAngle}deg) scale(0.82)`;
              opacity = 0.55;
              zIndex = 8;
              filter = 'brightness(0.5) blur(0.5px)';
            } else if (mag === 2) {
              transform = `translate3d(${side * xOffset * 1.55}px, 0, ${zOffset * 2.1}px) rotateY(${-side * rotateAngle * 1.25}deg) scale(0.64)`;
              opacity = 0.22;
              zIndex = 4;
              filter = 'brightness(0.32) blur(1.5px)';
            } else {
              // Far cards hide behind the stack.
              transform = `translate3d(${side * xOffset * 1.9}px, 0, ${zOffset * 3}px) rotateY(${-side * rotateAngle * 1.4}deg) scale(0.5)`;
              opacity = 0;
              zIndex = 1;
            }

            // Only mount media for cards near the active frame.
            const near = mag <= 2;

            return (
              <div
                key={project.title}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isActive && mag === 1) onIndexChange(i);
                }}
                className={`absolute overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? 'cursor-default' : 'cursor-pointer'
                }`}
                style={{
                  width: isMobile ? 'min(86vw, 380px)' : 'min(760px, 78vw)',
                  height: isMobile ? '68vh' : 'min(460px, 74vh)',
                  transform,
                  opacity,
                  zIndex,
                  filter,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  pointerEvents: near ? 'auto' : 'none',
                }}
              >
                {isActive ? (
                  /* Full detail card */
                  <div className="flex h-full w-full flex-col bg-surface-container-low md:flex-row">
                    <div className="relative h-40 w-full shrink-0 overflow-hidden bg-black/40 md:h-full md:w-[52%]">
                      {near && (
                        <img src={project.image} alt={project.title} draggable={false} className="h-full w-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low/70 to-transparent md:bg-gradient-to-r" />
                    </div>

                    <div className="flex flex-1 flex-col overflow-y-auto p-6 sm:p-8">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">{project.title}</h3>
                        <span className="shrink-0 font-label text-[11px] font-bold uppercase tracking-label text-outline">
                          {project.year}
                        </span>
                      </div>

                      <p className="mt-3 font-body text-[15px] leading-[1.7] text-on-surface-variant">
                        {describe(project.title, project.description)}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-outline-variant/50 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-wide text-outline"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex items-center gap-6 pt-6">
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link inline-flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-label text-primary"
                        >
                          {t('liveDemo')}
                          <ArrowUpRight
                            size={14}
                            className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                          />
                        </a>
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-label text-outline transition-colors duration-300 hover:text-on-surface"
                        >
                          <Github size={14} />
                          {t('sourceCode')}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Side preview card */
                  <div className="relative h-full w-full">
                    {near && (
                      <img src={project.image} alt={project.title} draggable={false} className="h-full w-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07090e]/90 via-[#07090e]/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-5">
                      <span className="font-label text-[10px] font-bold uppercase tracking-label text-primary">
                        {project.year}
                      </span>
                      <h4 className="mt-1 font-headline text-lg font-bold text-white">{project.title}</h4>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Next */}
        <button
          onClick={next}
          className="absolute right-2 z-[60] hidden h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/5 bg-black/40 text-white/60 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-white sm:flex"
          aria-label="Next project"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* ── Footer ── */}
      <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-4">
        <span className="font-label text-xs tracking-widest text-white/40">
          <span className="font-bold text-white">{String(index + 1).padStart(2, '0')}</span> /{' '}
          {String(count).padStart(2, '0')}
        </span>
        <div className="flex gap-2">
          {projects.map((project, i) => (
            <button
              key={project.title}
              onClick={() => onIndexChange(i)}
              className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-primary' : 'w-1.5 bg-white/10 hover:bg-white/30'
              }`}
              aria-label={`Go to ${project.title}`}
            />
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProjectModal;
