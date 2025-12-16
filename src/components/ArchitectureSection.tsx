import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ArchitectureDiagram,
  mockArchitectureData,
  type ArchitectureNode,
  type ArchitectureEdge,
} from './ArchitectureDiagram';

interface ArchitectureSectionProps {
  nodes?: ArchitectureNode[];
  edges?: ArchitectureEdge[];
}

/**
 * Architecture Diagram Section Component
 *
 * A full section wrapper for the Interactive Architecture Diagram.
 * Can be used standalone or integrated into the portfolio.
 */
const ArchitectureSection = ({
  nodes = mockArchitectureData.nodes,
  edges = mockArchitectureData.edges,
}: ArchitectureSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id='architecture' className='py-32 px-6 relative' ref={ref}>
      <div className='max-w-7xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-bold mb-4'>
            System <span className='text-gradient'>Architecture</span>
          </h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Interactive diagram of a full-stack application architecture. Click
            components to explore technologies, design decisions, and
            trade-offs. Toggle to see how the system evolves at 10× scale.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ArchitectureDiagram
            nodes={nodes}
            edges={edges}
            className='glass-card p-8'
          />
        </motion.div>
      </div>
    </section>
  );
};

export default ArchitectureSection;
