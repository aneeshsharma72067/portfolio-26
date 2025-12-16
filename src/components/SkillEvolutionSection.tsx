import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  SkillEvolutionGraph,
  mockSkillData,
  type SkillNode,
  type SkillEdge,
} from './SkillEvolutionGraph';

interface SkillEvolutionSectionProps {
  nodes?: SkillNode[];
  edges?: SkillEdge[];
  minYear?: number;
  maxYear?: number;
}

/**
 * Skill Evolution Section Component
 *
 * A full section wrapper for the Skill Evolution Graph.
 * Can be used standalone or integrated into the portfolio.
 */
const SkillEvolutionSection = ({
  nodes = mockSkillData.nodes,
  edges = mockSkillData.edges,
  minYear,
  maxYear,
}: SkillEvolutionSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id='skill-evolution' className='py-32 px-6 relative' ref={ref}>
      <div className='max-w-7xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-bold mb-4'>
            Skill <span className='text-gradient'>Evolution</span>
          </h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Explore how my skills have grown and connected over time. Drag the
            timeline to see the journey unfold.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SkillEvolutionGraph
            nodes={nodes}
            edges={edges}
            minYear={minYear}
            maxYear={maxYear}
            className='glass-card p-8'
          />
        </motion.div>
      </div>
    </section>
  );
};

export default SkillEvolutionSection;
