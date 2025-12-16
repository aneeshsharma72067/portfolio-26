import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { cn } from '@/lib/utils';
import { Code2, Database, Cloud, Shield, Layers, Server } from 'lucide-react';

/**
 * Architecture layer type for organizing components
 */
export type ArchitectureLayer =
  | 'client'
  | 'api'
  | 'database'
  | 'cache'
  | 'auth'
  | 'cloud';

/**
 * Communication protocol between components
 */
export type Protocol =
  | 'HTTP'
  | 'WebSocket'
  | 'gRPC'
  | 'GraphQL'
  | 'TCP'
  | 'UDP';

/**
 * Architecture node representing a system component
 */
export interface ArchitectureNode {
  id: string;
  label: string;
  layer: ArchitectureLayer;
  techStack: string[];
  responsibilities: string[];
  decisions: string[];
  tradeoffs?: string[];
  x?: number; // Calculated position
  y?: number; // Calculated position
  // Scale-specific overrides (for "At 10× Scale" view)
  scale10x?: {
    label?: string;
    techStack?: string[];
    responsibilities?: string[];
    decisions?: string[];
    tradeoffs?: string[];
  };
}

/**
 * Edge connection between architecture components
 */
export interface ArchitectureEdge {
  from: string;
  to: string;
  protocol: Protocol;
  reason: string;
  // Scale-specific overrides
  scale10x?: {
    protocol?: Protocol;
    reason?: string;
  };
}

/**
 * Layer configuration for visual organization
 */
const LAYER_CONFIG: Record<
  ArchitectureLayer,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: {
      bg: string;
      border: string;
      text: string;
      fill: string; // SVG fill color
    };
    yPosition: number; // Vertical position in diagram
  }
> = {
  client: {
    label: 'Client Layer',
    icon: Layers,
    color: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      fill: 'rgb(96, 165, 250)', // blue-400
    },
    yPosition: 80,
  },
  api: {
    label: 'API Layer',
    icon: Server,
    color: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/50',
      text: 'text-purple-400',
      fill: 'rgb(196, 181, 253)', // purple-400
    },
    yPosition: 200,
  },
  auth: {
    label: 'Auth Service',
    icon: Shield,
    color: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/50',
      text: 'text-orange-400',
      fill: 'rgb(251, 146, 60)', // orange-400
    },
    yPosition: 200,
  },
  cache: {
    label: 'Cache Layer',
    icon: Database,
    color: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      fill: 'rgb(250, 204, 21)', // yellow-400
    },
    yPosition: 320,
  },
  database: {
    label: 'Database Layer',
    icon: Database,
    color: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/50',
      text: 'text-green-400',
      fill: 'rgb(74, 222, 128)', // green-400
    },
    yPosition: 440,
  },
  cloud: {
    label: 'Cloud Services',
    icon: Cloud,
    color: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/50',
      text: 'text-cyan-400',
      fill: 'rgb(34, 211, 238)', // cyan-400
    },
    yPosition: 560,
  },
};

/**
 * Protocol color mapping for edge visualization
 */
const PROTOCOL_COLORS: Record<Protocol, string> = {
  HTTP: 'stroke-blue-400',
  WebSocket: 'stroke-purple-400',
  gRPC: 'stroke-green-400',
  GraphQL: 'stroke-pink-400',
  TCP: 'stroke-orange-400',
  UDP: 'stroke-red-400',
};

/**
 * Calculate horizontal layout for nodes within a layer
 * Distributes nodes evenly across the width
 */
function calculateNodePositions(
  nodes: ArchitectureNode[],
  width: number
): ArchitectureNode[] {
  // Group nodes by layer
  const nodesByLayer: Record<ArchitectureLayer, ArchitectureNode[]> = {
    client: [],
    api: [],
    database: [],
    cache: [],
    auth: [],
    cloud: [],
  };

  nodes.forEach((node) => {
    nodesByLayer[node.layer].push(node);
  });

  const positionedNodes: ArchitectureNode[] = [];
  const padding = 100; // Horizontal padding
  const availableWidth = width - padding * 2;

  // Position nodes within each layer
  Object.entries(nodesByLayer).forEach(([layer, layerNodes]) => {
    if (layerNodes.length === 0) return;

    const layerConfig = LAYER_CONFIG[layer as ArchitectureLayer];
    const spacing =
      layerNodes.length > 1
        ? availableWidth / (layerNodes.length - 1)
        : width / 2;

    layerNodes.forEach((node, index) => {
      const x = layerNodes.length === 1 ? width / 2 : padding + index * spacing;
      positionedNodes.push({
        ...node,
        x,
        y: layerConfig.yPosition,
      });
    });
  });

  return positionedNodes;
}

interface ArchitectureDiagramProps {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  className?: string;
}

/**
 * Interactive Architecture Diagram Component
 *
 * Displays a layered architecture diagram with interactive nodes and edges.
 * Features:
 * - Click nodes to view detailed information in side panel
 * - Hover to highlight connections
 * - Toggle between current architecture and 10× scale view
 * - Clean, engineering-focused design
 * - Responsive layout
 */
export const ArchitectureDiagram = ({
  nodes,
  edges,
  className,
}: ArchitectureDiagramProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [isScale10x, setIsScale10x] = useState(false);

  // Graph dimensions
  const graphWidth = 1000;
  const graphHeight = 700;

  // Calculate node positions
  const positionedNodes = useMemo(() => {
    return calculateNodePositions(nodes, graphWidth);
  }, [nodes]);

  // Get selected node with scale overrides applied
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = positionedNodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;

    if (isScale10x && node.scale10x) {
      return {
        ...node,
        label: node.scale10x.label ?? node.label,
        techStack: node.scale10x.techStack ?? node.techStack,
        responsibilities:
          node.scale10x.responsibilities ?? node.responsibilities,
        decisions: node.scale10x.decisions ?? node.decisions,
        tradeoffs: node.scale10x.tradeoffs ?? node.tradeoffs,
      };
    }
    return node;
  }, [selectedNodeId, positionedNodes, isScale10x]);

  // Get connected node IDs for hover highlighting
  const connectedNodeIds = useMemo(() => {
    if (!hoveredNodeId && !hoveredEdgeId) return new Set<string>();

    const connected = new Set<string>();

    if (hoveredNodeId) {
      connected.add(hoveredNodeId);
      edges.forEach((edge) => {
        if (edge.from === hoveredNodeId) connected.add(edge.to);
        if (edge.to === hoveredNodeId) connected.add(edge.from);
      });
    }

    if (hoveredEdgeId) {
      const edge = edges.find((e) => `${e.from}-${e.to}` === hoveredEdgeId);
      if (edge) {
        connected.add(edge.from);
        connected.add(edge.to);
      }
    }

    return connected;
  }, [hoveredNodeId, hoveredEdgeId, edges]);

  // Get visible edges with scale overrides
  const visibleEdges = useMemo(() => {
    return edges.map((edge) => {
      if (isScale10x && edge.scale10x) {
        return {
          ...edge,
          protocol: edge.scale10x.protocol ?? edge.protocol,
          reason: edge.scale10x.reason ?? edge.reason,
        };
      }
      return edge;
    });
  }, [edges, isScale10x]);

  // Get node display info with scale overrides
  const getNodeDisplayInfo = useCallback(
    (node: ArchitectureNode) => {
      if (isScale10x && node.scale10x) {
        return {
          label: node.scale10x.label ?? node.label,
          layer: node.layer,
        };
      }
      return {
        label: node.label,
        layer: node.layer,
      };
    },
    [isScale10x]
  );

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleEdgeClick = useCallback(
    (
      edge: ArchitectureEdge,
      fromNode: ArchitectureNode,
      toNode: ArchitectureNode
    ) => {
      // Show edge info in a tooltip or update selected node
      // For simplicity, we'll show the target node details
      setSelectedNodeId(toNode.id);
    },
    []
  );

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Scale Toggle */}
      <div className='flex items-center justify-between px-4'>
        <div className='flex items-center gap-4'>
          <label className='text-sm font-medium text-muted-foreground'>
            Architecture View:
          </label>
          <div className='flex gap-2'>
            <button
              onClick={() => setIsScale10x(false)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                !isScale10x
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Current Architecture
            </button>
            <button
              onClick={() => setIsScale10x(true)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                isScale10x
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              At 10× Scale
            </button>
          </div>
        </div>
      </div>

      {/* Diagram Container */}
      <div className='relative w-full overflow-hidden rounded-lg border bg-card/50 backdrop-blur-sm'>
        <svg
          width='100%'
          height='700'
          viewBox={`0 0 ${graphWidth} ${graphHeight}`}
          className='overflow-visible'
          preserveAspectRatio='xMidYMid meet'
        >
          {/* Layer Backgrounds */}
          <g>
            {Object.entries(LAYER_CONFIG).map(([layer, config]) => {
              const layerNodes = positionedNodes.filter(
                (n) => n.layer === layer
              );
              if (layerNodes.length === 0) return null;

              return (
                <motion.rect
                  key={layer}
                  x={50}
                  y={config.yPosition - 40}
                  width={graphWidth - 100}
                  height={80}
                  fill='currentColor'
                  className='text-muted/5'
                  rx={8}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}
          </g>

          {/* Layer Labels */}
          <g>
            {Object.entries(LAYER_CONFIG).map(([layer, config]) => {
              const layerNodes = positionedNodes.filter(
                (n) => n.layer === layer
              );
              if (layerNodes.length === 0) return null;

              return (
                <motion.g
                  key={`label-${layer}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <text
                    x={50}
                    y={config.yPosition - 10}
                    fontSize='14'
                    fontWeight='600'
                    fill={config.color.fill}
                  >
                    {config.label}
                  </text>
                </motion.g>
              );
            })}
          </g>

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

                const edgeId = `${edge.from}-${edge.to}`;
                const isHighlighted =
                  connectedNodeIds.has(edge.from) &&
                  connectedNodeIds.has(edge.to);
                const protocolColor =
                  PROTOCOL_COLORS[edge.protocol] || 'stroke-muted-foreground';

                return (
                  <motion.g
                    key={edgeId}
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    exit={{ opacity: 0, pathLength: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      strokeWidth={isHighlighted ? 3 : 2}
                      className={cn(
                        protocolColor,
                        isHighlighted ? 'opacity-100' : 'opacity-40',
                        'cursor-pointer'
                      )}
                      strokeDasharray={
                        edge.protocol === 'WebSocket' ? '5 5' : '0'
                      }
                      onMouseEnter={() => setHoveredEdgeId(edgeId)}
                      onMouseLeave={() => setHoveredEdgeId(null)}
                      onClick={() => handleEdgeClick(edge, fromNode, toNode)}
                      animate={{
                        strokeWidth: isHighlighted ? 3 : 2,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    {/* Protocol label at midpoint */}
                    <motion.text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 - 5}
                      textAnchor='middle'
                      fontSize='10'
                      fill={
                        isHighlighted
                          ? 'hsl(var(--foreground))'
                          : 'hsl(var(--muted-foreground))'
                      }
                      className='pointer-events-none'
                      opacity={isHighlighted ? 1 : 0.6}
                    >
                      {edge.protocol}
                    </motion.text>
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </g>

          {/* Nodes */}
          <g>
            <AnimatePresence>
              {positionedNodes.map((node) => {
                if (!node.x || !node.y) return null;

                const displayInfo = getNodeDisplayInfo(node);
                const layerConfig = LAYER_CONFIG[node.layer];
                const isHighlighted = connectedNodeIds.has(node.id);
                const isSelected = selectedNodeId === node.id;

                return (
                  <motion.g
                    key={node.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Node rectangle */}
                    <motion.rect
                      x={node.x - 80}
                      y={node.y - 30}
                      width={160}
                      height={60}
                      rx={8}
                      fill='hsl(var(--background))'
                      stroke={
                        isSelected
                          ? 'hsl(var(--primary))'
                          : isHighlighted
                          ? layerConfig.color.border
                          : 'hsl(var(--border))'
                      }
                      strokeWidth={isSelected ? 3 : isHighlighted ? 2 : 1.5}
                      className={cn(
                        'cursor-pointer transition-all',
                        layerConfig.color.bg,
                        isSelected && 'ring-2 ring-primary'
                      )}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => handleNodeClick(node.id)}
                      whileHover={{ scale: 1.05 }}
                      animate={{
                        strokeWidth: isSelected ? 3 : isHighlighted ? 2 : 1.5,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    {/* Node label */}
                    <motion.text
                      x={node.x}
                      y={node.y + 5}
                      textAnchor='middle'
                      fontSize='14'
                      fontWeight='600'
                      fill={
                        isSelected
                          ? 'hsl(var(--primary))'
                          : isHighlighted
                          ? layerConfig.color.fill
                          : 'hsl(var(--foreground))'
                      }
                      className='pointer-events-none select-none cursor-pointer'
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => handleNodeClick(node.id)}
                    >
                      {displayInfo.label}
                    </motion.text>
                    {/* Tech stack hint */}
                    <motion.text
                      x={node.x}
                      y={node.y + 20}
                      textAnchor='middle'
                      fontSize='10'
                      fill='hsl(var(--muted-foreground))'
                      className='pointer-events-none'
                      opacity={0.7}
                    >
                      {node.techStack.slice(0, 2).join(', ')}
                      {node.techStack.length > 2 && '...'}
                    </motion.text>
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </g>
        </svg>
      </div>

      {/* Side Panel for Node Details */}
      <Sheet
        open={!!selectedNode}
        onOpenChange={(open) => !open && setSelectedNodeId(null)}
      >
        <SheetContent
          side='right'
          className='w-full sm:max-w-2xl overflow-y-auto'
        >
          {selectedNode && (
            <>
              <SheetHeader>
                <SheetTitle className='text-2xl'>
                  {selectedNode.label}
                </SheetTitle>
                <SheetDescription>
                  {LAYER_CONFIG[selectedNode.layer].label}
                  {isScale10x && (
                    <span className='ml-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded'>
                      10× Scale View
                    </span>
                  )}
                </SheetDescription>
              </SheetHeader>

              <div className='mt-6 space-y-6'>
                {/* Tech Stack */}
                <div>
                  <h3 className='text-sm font-semibold mb-3 flex items-center gap-2'>
                    <Code2 className='w-4 h-4' />
                    Technology Stack
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {selectedNode.techStack.map((tech) => (
                      <span
                        key={tech}
                        className='px-3 py-1 text-xs bg-primary/10 text-primary rounded-md border border-primary/20'
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Responsibilities */}
                <div>
                  <h3 className='text-sm font-semibold mb-3'>
                    Responsibilities
                  </h3>
                  <ul className='space-y-2'>
                    {selectedNode.responsibilities.map((resp, index) => (
                      <li
                        key={index}
                        className='text-sm text-muted-foreground flex items-start gap-2'
                      >
                        <span className='text-primary mt-1.5'>•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Design Decisions */}
                <div>
                  <h3 className='text-sm font-semibold mb-3'>
                    Key Design Decisions
                  </h3>
                  <ul className='space-y-2'>
                    {selectedNode.decisions.map((decision, index) => (
                      <li
                        key={index}
                        className='text-sm text-muted-foreground flex items-start gap-2'
                      >
                        <span className='text-primary mt-1.5'>→</span>
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trade-offs */}
                {selectedNode.tradeoffs &&
                  selectedNode.tradeoffs.length > 0 && (
                    <div>
                      <h3 className='text-sm font-semibold mb-3'>
                        Trade-offs & Alternatives
                      </h3>
                      <ul className='space-y-2'>
                        {selectedNode.tradeoffs.map((tradeoff, index) => (
                          <li
                            key={index}
                            className='text-sm text-muted-foreground flex items-start gap-2'
                          >
                            <span className='text-orange-400 mt-1.5'>⚖</span>
                            <span>{tradeoff}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Connected Edges Info */}
                <div>
                  <h3 className='text-sm font-semibold mb-3'>Connections</h3>
                  <div className='space-y-2'>
                    {visibleEdges
                      .filter(
                        (e) =>
                          e.from === selectedNode.id || e.to === selectedNode.id
                      )
                      .map((edge) => {
                        const otherNodeId =
                          edge.from === selectedNode.id ? edge.to : edge.from;
                        const otherNode = positionedNodes.find(
                          (n) => n.id === otherNodeId
                        );
                        return (
                          <div
                            key={`${edge.from}-${edge.to}`}
                            className='p-3 rounded-md bg-muted/50 border border-border'
                          >
                            <div className='flex items-center justify-between mb-1'>
                              <span className='text-sm font-medium'>
                                {otherNode?.label ?? otherNodeId}
                              </span>
                              <span
                                className={cn(
                                  'text-xs px-2 py-0.5 rounded',
                                  PROTOCOL_COLORS[edge.protocol]?.replace(
                                    'stroke-',
                                    'bg-'
                                  ) || 'bg-muted'
                                )}
                              >
                                {edge.protocol}
                              </span>
                            </div>
                            <p className='text-xs text-muted-foreground'>
                              {edge.reason}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

/**
 * Example mock architecture data for a full-stack application
 * Replace with your actual architecture data
 */
export const mockArchitectureData = {
  nodes: [
    {
      id: 'react-client',
      label: 'React Frontend',
      layer: 'client' as ArchitectureLayer,
      techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
      responsibilities: [
        'Render user interface and handle user interactions',
        'Manage client-side state with React hooks',
        'Communicate with API via REST endpoints',
      ],
      decisions: [
        'Chose React for component reusability and ecosystem',
        'TypeScript for type safety and better DX',
        'Vite for fast development and build times',
      ],
      tradeoffs: [
        'Considered Next.js but chose Vite for simpler setup and faster builds',
        'Could use Redux for complex state, but hooks are sufficient for this scale',
      ],
      scale10x: {
        label: 'React + Next.js Frontend',
        techStack: [
          'Next.js',
          'TypeScript',
          'React Server Components',
          'Tailwind CSS',
        ],
        responsibilities: [
          'Server-side rendering for SEO and performance',
          'Static generation for marketing pages',
          'API routes for server-side logic',
          'Edge functions for global distribution',
        ],
        decisions: [
          'Migrate to Next.js for SSR and better performance',
          'Implement React Server Components for reduced client bundle',
          'Use Edge Runtime for low-latency responses globally',
        ],
        tradeoffs: [
          'Next.js adds complexity but provides better performance and SEO',
          'Server components reduce bundle size but require Node.js runtime',
        ],
      },
    },
    {
      id: 'api-gateway',
      label: 'API Gateway',
      layer: 'api' as ArchitectureLayer,
      techStack: ['NestJS', 'TypeScript', 'Express'],
      responsibilities: [
        'Route requests to appropriate microservices',
        'Handle authentication and authorization',
        'Rate limiting and request validation',
        'Request/response transformation',
      ],
      decisions: [
        'NestJS for structured, scalable backend architecture',
        'Single API gateway to simplify client integration',
        'JWT-based authentication for stateless scaling',
      ],
      tradeoffs: [
        'Single gateway is simpler but can become bottleneck',
        'Could use GraphQL but REST is sufficient for current needs',
      ],
      scale10x: {
        label: 'API Gateway + Load Balancer',
        techStack: ['Kong', 'NestJS', 'Redis', 'Nginx'],
        responsibilities: [
          'Multi-region load balancing',
          'Advanced rate limiting with Redis',
          'Circuit breakers for fault tolerance',
          'Request routing based on geographic location',
        ],
        decisions: [
          'Introduce Kong for advanced API management',
          'Use Redis for distributed rate limiting',
          'Implement circuit breakers for resilience',
        ],
        tradeoffs: [
          'Kong adds infrastructure complexity but provides better control',
          'Multi-region increases latency management complexity',
        ],
      },
    },
    {
      id: 'auth-service',
      label: 'Auth Service',
      layer: 'auth' as ArchitectureLayer,
      techStack: ['NestJS', 'JWT', 'bcrypt', 'PostgreSQL'],
      responsibilities: [
        'User registration and authentication',
        'JWT token generation and validation',
        'Password hashing and security',
        'Session management',
      ],
      decisions: [
        'JWT for stateless authentication',
        'bcrypt for secure password hashing',
        'Separate service for security isolation',
      ],
      tradeoffs: [
        "JWT can't be revoked easily, but refresh tokens mitigate this",
        'Could use OAuth providers but need custom user management',
      ],
      scale10x: {
        label: 'Auth Service + OAuth',
        techStack: ['Auth0', 'NestJS', 'Redis', 'OAuth 2.0'],
        responsibilities: [
          'Multi-factor authentication',
          'OAuth 2.0 integration with social providers',
          'Distributed session management with Redis',
          'Advanced security features (brute force protection, etc.)',
        ],
        decisions: [
          'Integrate Auth0 for enterprise-grade auth',
          'Use Redis for distributed session storage',
          'Support OAuth for third-party integrations',
        ],
        tradeoffs: [
          'Auth0 adds vendor dependency but reduces security burden',
          'OAuth increases complexity but improves user experience',
        ],
      },
    },
    {
      id: 'postgres-db',
      label: 'PostgreSQL',
      layer: 'database' as ArchitectureLayer,
      techStack: ['PostgreSQL', 'pgBouncer'],
      responsibilities: [
        'Primary data storage for application data',
        'ACID transactions for data consistency',
        'Complex queries with SQL',
      ],
      decisions: [
        'PostgreSQL for relational data and ACID guarantees',
        'pgBouncer for connection pooling',
        'Single database for simplicity',
      ],
      tradeoffs: [
        'PostgreSQL is excellent but may need read replicas at scale',
        'Could use NoSQL for some data but relational fits most needs',
      ],
      scale10x: {
        label: 'PostgreSQL Cluster',
        techStack: ['PostgreSQL', 'Read Replicas', 'pgBouncer', 'Patroni'],
        responsibilities: [
          'Primary database with automatic failover',
          'Read replicas for query scaling',
          'Connection pooling across cluster',
          'Automated backups and point-in-time recovery',
        ],
        decisions: [
          'Implement read replicas for read-heavy workloads',
          'Use Patroni for high availability',
          'Separate read/write connections',
        ],
        tradeoffs: [
          'Read replicas add complexity but significantly improve read performance',
          'Failover adds latency but ensures availability',
        ],
      },
    },
    {
      id: 'redis-cache',
      label: 'Redis Cache',
      layer: 'cache' as ArchitectureLayer,
      techStack: ['Redis', 'Node.js'],
      responsibilities: [
        'Cache frequently accessed data',
        'Session storage',
        'Rate limiting counters',
      ],
      decisions: [
        'Redis for in-memory caching performance',
        'Simple key-value structure for speed',
      ],
      tradeoffs: [
        'Redis is fast but requires memory management',
        'Could use Memcached but Redis has more features',
      ],
      scale10x: {
        label: 'Redis Cluster',
        techStack: ['Redis Cluster', 'Sentinel', 'Persistence'],
        responsibilities: [
          'Distributed caching across multiple nodes',
          'High availability with Sentinel',
          'Persistent storage for critical cache data',
          'Pub/Sub for real-time features',
        ],
        decisions: [
          'Redis Cluster for horizontal scaling',
          'Sentinel for automatic failover',
          'Enable persistence for critical data',
        ],
        tradeoffs: [
          'Cluster mode adds complexity but enables scaling',
          'Persistence reduces performance but ensures data durability',
        ],
      },
    },
    {
      id: 'aws-services',
      label: 'AWS Services',
      layer: 'cloud' as ArchitectureLayer,
      techStack: ['EC2', 'S3', 'CloudFront', 'RDS'],
      responsibilities: [
        'Host application servers on EC2',
        'Store static assets in S3',
        'CDN distribution via CloudFront',
        'Managed database with RDS',
      ],
      decisions: [
        'AWS for comprehensive cloud services',
        'EC2 for flexibility and control',
        'S3 for cost-effective storage',
      ],
      tradeoffs: [
        'EC2 requires more management than serverless',
        'Could use Lambda but need more control',
      ],
      scale10x: {
        label: 'Multi-Region AWS',
        techStack: [
          'ECS/EKS',
          'S3',
          'CloudFront',
          'Multi-Region RDS',
          'Route 53',
        ],
        responsibilities: [
          'Container orchestration with ECS/EKS',
          'Multi-region deployment for global users',
          'Global CDN with edge locations',
          'Multi-region database replication',
          'DNS-based failover and load balancing',
        ],
        decisions: [
          'Move to containers for better scalability',
          'Multi-region for global availability',
          'EKS for Kubernetes orchestration',
        ],
        tradeoffs: [
          'Containers add complexity but provide better resource utilization',
          'Multi-region increases costs but improves latency globally',
        ],
      },
    },
  ] as ArchitectureNode[],
  edges: [
    {
      from: 'react-client',
      to: 'api-gateway',
      protocol: 'HTTP' as Protocol,
      reason: 'REST API calls for data fetching and mutations',
      scale10x: {
        protocol: 'HTTP' as Protocol,
        reason:
          'REST API with GraphQL for complex queries, HTTP/2 for multiplexing',
      },
    },
    {
      from: 'api-gateway',
      to: 'auth-service',
      protocol: 'HTTP' as Protocol,
      reason: 'Authentication and authorization checks',
    },
    {
      from: 'api-gateway',
      to: 'postgres-db',
      protocol: 'TCP' as Protocol,
      reason: 'Database queries via connection pool',
    },
    {
      from: 'api-gateway',
      to: 'redis-cache',
      protocol: 'TCP' as Protocol,
      reason: 'Cache reads and writes for performance',
    },
    {
      from: 'react-client',
      to: 'aws-services',
      protocol: 'HTTP' as Protocol,
      reason: 'Static asset delivery via CloudFront CDN',
    },
    {
      from: 'api-gateway',
      to: 'aws-services',
      protocol: 'HTTP' as Protocol,
      reason: 'File uploads to S3, infrastructure management',
    },
  ] as ArchitectureEdge[],
};
