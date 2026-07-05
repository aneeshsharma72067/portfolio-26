import { useState, useEffect } from 'react';
import { ArrowUpRight, Github } from 'lucide-react';
import { projects, links, type Project } from '@/data/content';
import { useReveal } from '@/hooks/useReveal';
import SectionHeading from './SectionHeading';

type ProjectCardProps = {
  project: Project;
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  isDesktop: boolean;
};

/**
 * ProjectCard — a card representing a single project.
 *
 * Appears as part of a stacked card deck.
 * - On desktop: Absolutely positioned, dynamically translated and rotated
 *   based on which card in the deck is currently hovered.
 * - On mobile: Stacks vertically with negative margin overlap. Tapping/hovering
 *   a card shifts it up, scales it, and brings it to the foreground.
 */
const ProjectCard = ({
  project,
  index,
  hoveredIndex,
  setHoveredIndex,
  isDesktop,
}: ProjectCardProps) => {
  const { ref, visible } = useReveal();

  // Desktop deck transforms
  const getDesktopStyle = () => {
    const isHovered = hoveredIndex === index;
    const isAnyHovered = hoveredIndex !== null;

    let y = index * 60;
    let rotate = index * 2 - 3; // slight alternating rotations
    let scale = 1;
    let zIndex = 10 + index;

    if (isHovered) {
      y = index * 60 - 45; // lift up
      rotate = 0; // align straight for reading
      scale = 1.02; // pop out
      zIndex = 50; // top layer
    } else if (isAnyHovered) {
      if (index < (hoveredIndex as number)) {
        y = index * 60 - 20; // draw up slightly
        scale = 0.97; // push back slightly
      } else {
        y = index * 60 + 200; // push down significantly to reveal the hovered card
        scale = 0.97;
      }
    }

    return {
      transform: `translateY(${y}px) rotate(${rotate}deg) scale(${scale})`,
      zIndex,
    };
  };

  // Mobile stacked margin offsets
  const getMobileStyle = () => {
    const isHovered = hoveredIndex === index;
    return {
      zIndex: isHovered ? 30 : 10 + index,
      transform: isHovered ? 'translateY(-24px) scale(1.02)' : 'translateY(0) scale(1)',
    };
  };

  const dynamicStyle = isDesktop ? getDesktopStyle() : getMobileStyle();

  return (
    <article
      ref={ref}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      onClick={() => setHoveredIndex(hoveredIndex === index ? null : index)}
      style={{
        ...dynamicStyle,
        transition: 'transform 550ms cubic-bezier(0.25, 1, 0.5, 1), z-index 550ms ease, opacity 700ms ease',
        cursor: 'pointer',
      }}
      className={`w-full overflow-hidden rounded-soft border border-outline-variant/40 bg-surface-container-low shadow-floating transition-all select-none ${
        isDesktop ? 'absolute top-0 left-0 h-[360px]' : '-mt-24 first:mt-0'
      } ${visible ? 'opacity-100' : 'opacity-0 translate-y-4'}`}
    >
      <div className="grid h-full md:grid-cols-[280px_1fr]">
        {/* Preview image */}
        <div className="relative h-44 overflow-hidden border-b border-outline-variant/30 md:h-full md:border-b-0 md:border-r">
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low/80 to-transparent md:bg-gradient-to-r" />
        </div>

        {/* Content body */}
        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
                {project.title}
              </h3>
              <span className="shrink-0 font-label text-[11px] font-bold uppercase tracking-label text-outline">
                {project.year}
              </span>
            </div>

            <p className="mt-3 font-body text-[14px] sm:text-[15px] leading-[1.65] text-on-surface-variant">
              {project.description}
            </p>
          </div>

          <div className="mt-6">
            {/* Tech tags */}
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-outline-variant/40 px-2.5 py-0.5 font-label text-[9px] font-bold uppercase tracking-wide text-outline"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action links */}
            <div className="mt-6 flex items-center gap-6">
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="group/link inline-flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-label text-primary"
              >
                Live Demo
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                />
              </a>
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-label text-outline transition-colors duration-300 hover:text-on-surface"
              >
                <Github size={14} />
                Source
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

/**
 * Work — Displays projects in an interactive deck-of-cards format.
 */
const Work = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section id="work" className="mt-28">
      <SectionHeading eyebrow="Selected Work" title="Things I've" accent="built." />

      {/* 
        Container wraps the deck:
        - On desktop: relative, fixed height of 560px for overlapping absolute cards.
        - On mobile: flex-col, allows overlapping layout using negative margins.
      */}
      <div
        className={`w-full transition-all duration-300 ${
          isDesktop ? 'relative h-[560px]' : 'flex flex-col pt-12 pb-6'
        }`}
      >
        {projects.map((project, i) => (
          <ProjectCard
            key={project.title}
            project={project}
            index={i}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            isDesktop={isDesktop}
          />
        ))}
      </div>

      <div className="mt-12 flex justify-start">
        <a
          href={links.githubRepos}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-label text-primary"
        >
          More on GitHub
          <ArrowUpRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      </div>
    </section>
  );
};

export default Work;
