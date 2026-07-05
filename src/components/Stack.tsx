import { skillGroups } from '@/data/content';
import { useReveal } from '@/hooks/useReveal';
import SectionHeading from './SectionHeading';

/**
 * Stack — the toolkit, grouped by domain. Each group is a labelled column of
 * skill chips. Uses the surface ramp for depth rather than shadow.
 */
const Stack = () => {
  const { ref, visible } = useReveal();

  return (
    <section
      id="stack"
      ref={ref}
      className={`mt-28 transition-all duration-700 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <SectionHeading eyebrow="Toolkit" title="The" accent="stack." />

      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
        {skillGroups.map((group) => (
          <div key={group.title}>
            <div className="mb-4 flex items-center gap-3">
              <span className="meta-dot" />
              <h3 className="font-label text-[11px] font-bold uppercase tracking-label text-outline">
                {group.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="rounded-soft border border-outline-variant/40 bg-surface-container-low px-3 py-1.5 font-headline text-sm font-medium text-on-surface-variant transition-colors duration-300 hover:border-primary/30 hover:text-on-surface"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stack;
