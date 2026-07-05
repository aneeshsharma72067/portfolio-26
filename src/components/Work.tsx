import { ArrowUpRight, Github } from 'lucide-react';
import { projects, links, type Project } from '@/data/content';
import { useReveal } from '@/hooks/useReveal';
import SectionHeading from './SectionHeading';

/**
 * A single project row — editorial card with a preview image, two-tone title,
 * serif description, tag list, and ghost links. Hover lifts the surface and
 * gently zooms the preview.
 */
const ProjectRow = ({ project, index }: { project: Project; index: number }) => {
  const { ref, visible } = useReveal();

  return (
    <article
      ref={ref}
      style={{ transitionDelay: `${index * 80}ms` }}
      className={`group overflow-hidden rounded-soft border border-outline-variant/40 bg-surface-container-low transition-all duration-500 hover:border-primary/20 hover:bg-surface-container ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <div className="grid md:grid-cols-[280px_1fr]">
        {/* Preview */}
        <div className="relative h-44 overflow-hidden border-b border-outline-variant/30 md:h-full md:border-b-0 md:border-r">
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low/60 to-transparent md:bg-gradient-to-r" />
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
              {project.title}
            </h3>
            <span className="shrink-0 font-label text-[11px] font-bold uppercase tracking-label text-outline">
              {project.year}
            </span>
          </div>

          <p className="mt-3 font-body text-[15px] leading-[1.7] text-on-surface-variant">
            {project.description}
          </p>

          {/* Tags */}
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

          {/* Links */}
          <div className="mt-6 flex items-center gap-6">
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-label text-primary"
            >
              Live
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
              Source
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

/**
 * Work — the project feed. Items separated by generous vertical rhythm.
 */
const Work = () => {
  return (
    <section id="work" className="mt-28">
      <SectionHeading eyebrow="Selected Work" title="Things I've" accent="built." />

      <div className="flex flex-col gap-8">
        {projects.map((project, i) => (
          <ProjectRow key={project.title} project={project} index={i} />
        ))}
      </div>

      <a
        href={links.githubRepos}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-10 inline-flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-label text-primary"
      >
        More on GitHub
        <ArrowUpRight
          size={14}
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </a>
    </section>
  );
};

export default Work;
