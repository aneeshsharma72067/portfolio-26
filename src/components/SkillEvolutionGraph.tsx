import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from './ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * Skill category type for grouping and coloring
 */
export type SkillCategory = 'frontend' | 'backend' | 'cloud' | 'system-design';

/**
 * Skill node representing a technology or skill
 */
export interface SkillNode {
  id: string;
  label: string;
  category: SkillCategory;
  startYear: number;
  proficiency: number; // 0-100
  learnedContext?: string; // How/where it was learned
  x?: number; // Calculated position
  y?: number; // Calculated position
}

/**
 * Edge connection between skills showing relationships
 */
export interface SkillEdge {
  from: string;
  to: string;
  yearIntroduced: number;
  reason: string; // Shown in tooltip
}

/**
 * Category color mapping for visual distinction
 */
const CATEGORY_COLORS: Record<
  SkillCategory,
  { bg: string; border: string; text: string }
> = {
  frontend: {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/50',
    text: 'text-cyan-400',
  },
  backend: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    text: 'text-purple-400',
  },
  cloud: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
  },
  'system-design': {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/50',
    text: 'text-emerald-400',
  },
};

/**
 * Simple force-directed layout algorithm
 * Positions nodes to minimize overlap and create readable graph
 */
function calculateLayout(
  nodes: SkillNode[],
  edges: SkillEdge[],
  width: number,
  height: number
): SkillNode[] {
  // Group nodes by category for better visual organization
  const categoryGroups: Record<SkillCategory, SkillNode[]> = {
    frontend: [],
    backend: [],
    cloud: [],
    'system-design': [],
  };

  nodes.forEach((node) => {
    categoryGroups[node.category].push(node);
  });

  // Calculate positions using a grid-based approach with category grouping
  const categoryPositions: Record<SkillCategory, { x: number; y: number }> = {
    frontend: { x: width * 0.25, y: height * 0.3 },
    backend: { x: width * 0.75, y: height * 0.3 },
    cloud: { x: width * 0.5, y: height * 0.7 },
    'system-design': { x: width * 0.5, y: height * 0.1 },
  };

  const positionedNodes: SkillNode[] = [];
  const nodeMap = new Map<string, SkillNode>();

  // Position nodes within their category groups
  Object.entries(categoryGroups).forEach(([category, categoryNodes]) => {
    const basePos = categoryPositions[category as SkillCategory];
    const angleStep = (2 * Math.PI) / categoryNodes.length;
    const radius = Math.min(width, height) * 0.15;

    categoryNodes.forEach((node, index) => {
      const angle = index * angleStep;
      const x =
        basePos.x + Math.cos(angle) * radius + (Math.random() - 0.5) * 50;
      const y =
        basePos.y + Math.sin(angle) * radius + (Math.random() - 0.5) * 50;

      const positionedNode: SkillNode = {
        ...node,
        x: Math.max(30, Math.min(width - 30, x)),
        y: Math.max(30, Math.min(height - 30, y)),
      };

      positionedNodes.push(positionedNode);
      nodeMap.set(node.id, positionedNode);
    });
  });

  // Apply simple force-directed adjustments based on edges
  const iterations = 50;
  const k = Math.sqrt((width * height) / nodes.length); // Optimal distance
  const temperature = 100;
  const coolingRate = 0.95;

  for (let iter = 0; iter < iterations; iter++) {
    const forces = new Map<string, { fx: number; fy: number }>();

    positionedNodes.forEach((node) => {
      forces.set(node.id, { fx: 0, fy: 0 });
    });

    // Repulsion between all nodes
    for (let i = 0; i < positionedNodes.length; i++) {
      for (let j = i + 1; j < positionedNodes.length; j++) {
        const nodeA = positionedNodes[i];
        const nodeB = positionedNodes[j];

        if (!nodeA.x || !nodeA.y || !nodeB.x || !nodeB.y) continue;

        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (k * k) / distance;

        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        const forceA = forces.get(nodeA.id)!;
        const forceB = forces.get(nodeB.id)!;

        forceA.fx -= fx;
        forceA.fy -= fy;
        forceB.fx += fx;
        forceB.fy += fy;
      }
    }

    // Attraction along edges
    edges.forEach((edge) => {
      const nodeA = nodeMap.get(edge.from);
      const nodeB = nodeMap.get(edge.to);

      if (!nodeA || !nodeB || !nodeA.x || !nodeA.y || !nodeB.x || !nodeB.y)
        return;

      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (distance * distance) / k;

      const fx = (dx / distance) * force * 0.1;
      const fy = (dy / distance) * force * 0.1;

      const forceA = forces.get(edge.from)!;
      const forceB = forces.get(edge.to)!;

      forceA.fx += fx;
      forceA.fy += fy;
      forceB.fx -= fx;
      forceB.fy -= fy;
    });

    // Apply forces with temperature (simulated annealing)
    const currentTemp = temperature * Math.pow(coolingRate, iter);
    positionedNodes.forEach((node) => {
      const force = forces.get(node.id)!;
      if (node.x && node.y) {
        node.x += force.fx * currentTemp * 0.01;
        node.y += force.fy * currentTemp * 0.01;

        // Keep nodes within bounds
        node.x = Math.max(30, Math.min(width - 30, node.x));
        node.y = Math.max(30, Math.min(height - 30, node.y));
      }
    });
  }

  return positionedNodes;
}

interface SkillEvolutionGraphProps {
  nodes: SkillNode[];
  edges: SkillEdge[];
  minYear?: number;
  maxYear?: number;
  className?: string;
}

/**
 * Skill Evolution Graph Component
 *
 * Displays an interactive graph of skills that evolve over time.
 * Features:
 * - Timeline slider to control visibility
 * - Animated node appearance and growth
 * - Edge connections that appear over time
 * - Hover tooltips with skill context
 * - Category-based coloring
 * - Responsive layout
 */
export const SkillEvolutionGraph = ({
  nodes,
  edges,
  minYear,
  maxYear,
  className,
}: SkillEvolutionGraphProps) => {
  // Calculate year range from data if not provided
  const yearRange = useMemo(() => {
    const allYears = [
      ...nodes.map((n) => n.startYear),
      ...edges.map((e) => e.yearIntroduced),
    ];

    // Default to current year if no data
    if (allYears.length === 0) {
      const currentYear = new Date().getFullYear();
      return {
        min: minYear ?? currentYear - 5,
        max: maxYear ?? currentYear,
      };
    }

    const calculatedMin = minYear ?? Math.min(...allYears);
    const calculatedMax = maxYear ?? Math.max(...allYears);
    return { min: calculatedMin, max: calculatedMax };
  }, [nodes, edges, minYear, maxYear]);

  const [selectedYear, setSelectedYear] = useState<number>(() => yearRange.max);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Update selectedYear when yearRange changes (e.g., on data load)
  useEffect(() => {
    if (selectedYear < yearRange.min || selectedYear > yearRange.max) {
      setSelectedYear(yearRange.max);
    }
  }, [yearRange.min, yearRange.max, selectedYear]);

  // Graph dimensions (responsive)
  const graphWidth = 800;
  const graphHeight = 600;

  // Filter visible nodes and edges based on selected year
  const visibleNodes = useMemo(() => {
    return nodes.filter((node) => node.startYear <= selectedYear);
  }, [nodes, selectedYear]);

  const visibleEdges = useMemo(() => {
    return edges.filter(
      (edge) =>
        edge.yearIntroduced <= selectedYear &&
        visibleNodes.some((n) => n.id === edge.from) &&
        visibleNodes.some((n) => n.id === edge.to)
    );
  }, [edges, selectedYear, visibleNodes]);

  // Calculate layout for visible nodes
  const positionedNodes = useMemo(() => {
    return calculateLayout(visibleNodes, visibleEdges, graphWidth, graphHeight);
  }, [visibleNodes, visibleEdges]);

  // Get nodes connected to hovered node
  const connectedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const connected = new Set<string>([hoveredNodeId]);
    visibleEdges.forEach((edge) => {
      if (edge.from === hoveredNodeId) connected.add(edge.to);
      if (edge.to === hoveredNodeId) connected.add(edge.from);
    });
    return connected;
  }, [hoveredNodeId, visibleEdges]);

  // Calculate node size based on proficiency
  const getNodeSize = useCallback((proficiency: number) => {
    const minSize = 20;
    const maxSize = 50;
    return minSize + (proficiency / 100) * (maxSize - minSize);
  }, []);

  // Calculate node opacity based on proficiency and year
  const getNodeOpacity = useCallback(
    (node: SkillNode) => {
      // Nodes that just appeared are slightly faded
      const yearsSinceStart = selectedYear - node.startYear;
      const fadeInDuration = 1; // years
      if (yearsSinceStart < fadeInDuration) {
        return 0.5 + (yearsSinceStart / fadeInDuration) * 0.5;
      }
      return 1;
    },
    [selectedYear]
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('w-full space-y-6', className)}>
        {/* Timeline Slider */}
        <div className='space-y-4 px-4'>
          <div className='flex items-center justify-between text-sm text-muted-foreground'>
            <span>{yearRange.min}</span>
            <span className='text-lg font-semibold text-foreground'>
              {selectedYear}
            </span>
            <span>{yearRange.max}</span>
          </div>
          <Slider
            value={[selectedYear]}
            onValueChange={(value) => setSelectedYear(value[0])}
            min={yearRange.min}
            max={yearRange.max}
            step={1}
            className='w-full'
          />
        </div>

        {/* Graph Container */}
        <div className='relative w-full overflow-hidden rounded-lg border bg-card/50 backdrop-blur-sm'>
          <svg
            width='100%'
            height='600'
            viewBox={`0 0 ${graphWidth} ${graphHeight}`}
            className='overflow-visible'
            preserveAspectRatio='xMidYMid meet'
          >
            {/* Edges */}
            <g>
              <AnimatePresence>
                {visibleEdges.map((edge) => {
                  const fromNode = positionedNodes.find(
                    (n) => n.id === edge.from
                  );
                  const toNode = positionedNodes.find((n) => n.id === edge.to);

                  if (
                    !fromNode ||
                    !toNode ||
                    !fromNode.x ||
                    !fromNode.y ||
                    !toNode.x ||
                    !toNode.y
                  ) {
                    return null;
                  }

                  const isHighlighted =
                    hoveredNodeId === edge.from || hoveredNodeId === edge.to;

                  return (
                    <motion.line
                      key={`${edge.from}-${edge.to}`}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={
                        isHighlighted
                          ? 'hsl(var(--primary))'
                          : 'hsl(var(--muted-foreground) / 0.3)'
                      }
                      strokeWidth={isHighlighted ? 2 : 1}
                      strokeDasharray={isHighlighted ? '0' : '4 4'}
                      initial={{ opacity: 0, pathLength: 0 }}
                      animate={{ opacity: 1, pathLength: 1 }}
                      exit={{ opacity: 0, pathLength: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  );
                })}
              </AnimatePresence>
            </g>

            {/* Nodes */}
            <g>
              <AnimatePresence>
                {positionedNodes.map((node) => {
                  if (!node.x || !node.y) return null;

                  const size = getNodeSize(node.proficiency);
                  const opacity = getNodeOpacity(node);
                  const isHighlighted = connectedNodeIds.has(node.id);
                  const categoryStyle = CATEGORY_COLORS[node.category];

                  return (
                    <Tooltip key={node.id}>
                      <TooltipTrigger asChild>
                        <motion.g
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity,
                            scale: isHighlighted ? 1.1 : 1,
                          }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          onMouseEnter={() => setHoveredNodeId(node.id)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          className='cursor-pointer'
                        >
                          {/* Node circle */}
                          <motion.circle
                            cx={node.x}
                            cy={node.y}
                            r={size}
                            fill={`hsl(var(--primary) / ${
                              isHighlighted ? 0.3 : 0.1
                            })`}
                            stroke={
                              isHighlighted
                                ? 'hsl(var(--primary))'
                                : categoryStyle.border
                            }
                            strokeWidth={isHighlighted ? 2 : 1.5}
                            className={cn(
                              'transition-all duration-300',
                              categoryStyle.bg
                            )}
                            animate={{
                              r: size * (isHighlighted ? 1.15 : 1),
                            }}
                            transition={{ duration: 0.2 }}
                          />
                          {/* Node label */}
                          <motion.text
                            x={node.x}
                            y={node.y + size + 16}
                            textAnchor='middle'
                            fontSize='12'
                            fontWeight='500'
                            fill={
                              isHighlighted
                                ? 'hsl(var(--primary))'
                                : 'hsl(var(--foreground))'
                            }
                            className={cn(
                              'pointer-events-none select-none',
                              categoryStyle.text
                            )}
                            animate={{
                              opacity: isHighlighted ? 1 : 0.8,
                            }}
                          >
                            {node.label}
                          </motion.text>
                        </motion.g>
                      </TooltipTrigger>
                      <TooltipContent side='top' className='max-w-xs'>
                        <div className='space-y-1'>
                          <p className='font-semibold'>{node.label}</p>
                          <p className='text-xs text-muted-foreground'>
                            Category: {node.category}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Proficiency: {node.proficiency}%
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Started: {node.startYear}
                          </p>
                          {node.learnedContext && (
                            <p className='text-xs mt-2 pt-2 border-t border-border'>
                              {node.learnedContext}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </AnimatePresence>
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className='flex flex-wrap items-center justify-center gap-4 text-sm'>
          {Object.entries(CATEGORY_COLORS).map(([category, colors]) => (
            <div key={category} className='flex items-center gap-2'>
              <div
                className={cn(
                  'w-3 h-3 rounded-full border',
                  colors.bg,
                  colors.border
                )}
              />
              <span className='text-muted-foreground capitalize'>
                {category.replace('-', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

/**
 * Example mock data for demonstration
 * Replace with your actual skill data
 */
export const mockSkillData = {
  nodes: [
    {
      id: 'js',
      label: 'JavaScript',
      category: 'frontend' as SkillCategory,
      startYear: 2021,
      proficiency: 95,
      learnedContext: 'Started with vanilla JS, built interactive web apps',
    },
    {
      id: 'ts',
      label: 'TypeScript',
      category: 'frontend' as SkillCategory,
      startYear: 2022,
      proficiency: 90,
      learnedContext: 'Adopted for type safety in React projects',
    },
    {
      id: 'react',
      label: 'React',
      category: 'frontend' as SkillCategory,
      startYear: 2021,
      proficiency: 95,
      learnedContext:
        'Built first SPA, fell in love with component architecture',
    },
    {
      id: 'nextjs',
      label: 'Next.js',
      category: 'frontend' as SkillCategory,
      startYear: 2023,
      proficiency: 88,
      learnedContext: 'Used for production portfolio and client projects',
    },
    {
      id: 'node',
      label: 'Node.js',
      category: 'backend' as SkillCategory,
      startYear: 2022,
      proficiency: 88,
      learnedContext: 'Backend development for full-stack applications',
    },
    {
      id: 'nestjs',
      label: 'NestJS',
      category: 'backend' as SkillCategory,
      startYear: 2023,
      proficiency: 82,
      learnedContext: 'Enterprise-grade API development',
    },
    {
      id: 'python',
      label: 'Python',
      category: 'backend' as SkillCategory,
      startYear: 2021,
      proficiency: 85,
      learnedContext: 'Data processing and automation scripts',
    },
    {
      id: 'aws',
      label: 'AWS',
      category: 'cloud' as SkillCategory,
      startYear: 2023,
      proficiency: 78,
      learnedContext:
        'Deployed production apps, learned serverless architecture',
    },
    {
      id: 'docker',
      label: 'Docker',
      category: 'cloud' as SkillCategory,
      startYear: 2023,
      proficiency: 75,
      learnedContext: 'Containerization for consistent deployments',
    },
    {
      id: 'system-design',
      label: 'System Design',
      category: 'system-design' as SkillCategory,
      startYear: 2024,
      proficiency: 70,
      learnedContext: 'Scalable architecture patterns and best practices',
    },
  ] as SkillNode[],
  edges: [
    {
      from: 'js',
      to: 'react',
      yearIntroduced: 2021,
      reason: 'React built on JavaScript fundamentals',
    },
    {
      from: 'js',
      to: 'ts',
      yearIntroduced: 2022,
      reason: 'TypeScript extends JavaScript with types',
    },
    {
      from: 'react',
      to: 'nextjs',
      yearIntroduced: 2023,
      reason: 'Next.js framework built on React',
    },
    {
      from: 'js',
      to: 'node',
      yearIntroduced: 2022,
      reason: 'Node.js uses JavaScript runtime',
    },
    {
      from: 'node',
      to: 'nestjs',
      yearIntroduced: 2023,
      reason: 'NestJS built for Node.js ecosystem',
    },
    {
      from: 'node',
      to: 'aws',
      yearIntroduced: 2023,
      reason: 'Deployed Node.js apps to AWS',
    },
    {
      from: 'aws',
      to: 'docker',
      yearIntroduced: 2023,
      reason: 'Containerized apps for AWS deployment',
    },
    {
      from: 'nestjs',
      to: 'system-design',
      yearIntroduced: 2024,
      reason: 'Learned system design through complex backend architecture',
    },
    {
      from: 'nextjs',
      to: 'aws',
      yearIntroduced: 2023,
      reason: 'Deployed Next.js apps to AWS',
    },
  ] as SkillEdge[],
};
