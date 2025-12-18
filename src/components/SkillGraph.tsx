import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

// Skill data structure
export interface SkillNode {
  id: string;
  name: string;
  logo: string;
  description: string;
  useCases: string[];
  connections: string[];
}

// Sample skill dataset
const sampleSkills: SkillNode[] = [
  {
    id: 'html',
    name: 'HTML',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/html5.svg',
    description:
      'Standard markup language for creating web pages and applications.',
    useCases: ['Web structure', 'Email templates', 'Static websites'],
    connections: ['css', 'javascript'],
  },
  {
    id: 'css',
    name: 'CSS',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/css3.svg',
    description:
      'Stylesheet language for describing presentation of HTML documents.',
    useCases: ['Responsive design', 'Animations', 'Layout systems'],
    connections: ['html', 'tailwind', 'javascript'],
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/tailwindcss.svg',
    description: 'Utility-first CSS framework for rapid UI development.',
    useCases: ['Modern web apps', 'Component styling', 'Rapid prototyping'],
    connections: ['css', 'react', 'nextjs', 'vite'],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/javascript.svg',
    description:
      'Dynamic programming language for web interactivity and server-side development.',
    useCases: ['Frontend logic', 'Backend services', 'Full-stack development'],
    connections: ['html', 'css', 'typescript', 'nodejs', 'react'],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/typescript.svg',
    description:
      'Typed superset of JavaScript for scalable application development.',
    useCases: ['Enterprise apps', 'Type-safe codebases', 'Large teams'],
    connections: ['javascript', 'react', 'nextjs', 'nestjs', 'nodejs'],
  },
  {
    id: 'react',
    name: 'React',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/react.svg',
    description: 'Component-based library for building modern user interfaces.',
    useCases: ['Single-page apps', 'Dynamic UIs', 'Cross-platform apps'],
    connections: [
      'javascript',
      'typescript',
      'nextjs',
      'reactnative',
      'tailwind',
      'vite',
    ],
  },
  {
    id: 'reactnative',
    name: 'React Native',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/react.svg',
    description: 'Framework for building native mobile apps using React.',
    useCases: ['iOS apps', 'Android apps', 'Cross-platform mobile'],
    connections: ['react', 'javascript', 'typescript', 'expo', 'nodejs'],
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/nextdotjs.svg',
    description:
      'React framework with server-side rendering and static generation.',
    useCases: ['SEO-optimized sites', 'Full-stack apps', 'Static sites'],
    connections: ['react', 'typescript', 'nodejs', 'tailwind'],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/nodedotjs.svg',
    description:
      'JavaScript runtime for building scalable server-side applications.',
    useCases: ['REST APIs', 'Real-time services', 'Microservices'],
    connections: [
      'javascript',
      'typescript',
      'express',
      'nestjs',
      'mongodb',
      'postgresql',
    ],
  },
  {
    id: 'express',
    name: 'Express',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/express.svg',
    description: 'Minimal and flexible Node.js web application framework.',
    useCases: ['REST APIs', 'Web servers', 'Middleware services'],
    connections: [
      'nodejs',
      'javascript',
      'typescript',
      'mongodb',
      'postgresql',
    ],
  },
  {
    id: 'nestjs',
    name: 'NestJS',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/nestjs.svg',
    description:
      'Progressive Node.js framework for building efficient server-side apps.',
    useCases: ['Enterprise backends', 'GraphQL APIs', 'Microservices'],
    connections: ['nodejs', 'typescript', 'mongodb', 'postgresql', 'docker'],
  },
  {
    id: 'python',
    name: 'Python',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/python.svg',
    description:
      'High-level programming language for web, data science, and automation.',
    useCases: ['Data analysis', 'Machine learning', 'Web backends'],
    connections: ['flask', 'postgresql', 'mongodb', 'docker'],
  },
  {
    id: 'flask',
    name: 'Flask',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/flask.svg',
    description:
      'Lightweight Python web framework for building web applications.',
    useCases: ['REST APIs', 'Microservices', 'Web apps'],
    connections: ['python', 'postgresql', 'mongodb', 'docker'],
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/mongodb.svg',
    description: 'NoSQL document database for flexible, scalable data storage.',
    useCases: ['Document storage', 'Real-time apps', 'Content management'],
    connections: ['nodejs', 'express', 'nestjs', 'python', 'flask', 'docker'],
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/postgresql.svg',
    description: 'Advanced open-source relational database system.',
    useCases: ['Relational data', 'Complex queries', 'Data integrity'],
    connections: ['nodejs', 'express', 'nestjs', 'python', 'flask', 'docker'],
  },
  {
    id: 'docker',
    name: 'Docker',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/docker.svg',
    description:
      'Platform for developing, shipping, and running applications in containers.',
    useCases: ['Containerization', 'Deployment', 'Development environments'],
    connections: ['nodejs', 'python', 'mongodb', 'postgresql', 'nestjs', 'aws'],
  },
  {
    id: 'vite',
    name: 'Vite',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/vite.svg',
    description: 'Next-generation frontend build tool for fast development.',
    useCases: ['Build tooling', 'Dev servers', 'Frontend optimization'],
    connections: ['react', 'javascript', 'typescript', 'tailwind'],
  },
  {
    id: 'expo',
    name: 'Expo',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/expo.svg',
    description: 'Framework and platform for universal React applications.',
    useCases: [
      'Mobile development',
      'Cross-platform apps',
      'Rapid prototyping',
    ],
    connections: ['reactnative', 'javascript', 'typescript', 'nodejs'],
  },
  {
    id: 'aws',
    name: 'AWS',
    logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/amazonaws.svg',
    description: 'Comprehensive cloud computing platform by Amazon.',
    useCases: ['Cloud hosting', 'Serverless functions', 'Database services'],
    connections: ['docker', 'nodejs', 'python', 'mongodb', 'postgresql'],
  },
];

// 3D Node component
interface NodeProps {
  position: [number, number, number];
  skill: SkillNode;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (hovered: boolean, id: string) => void;
  onClick: (id: string) => void;
}

const SkillNode: React.FC<NodeProps> = ({
  position,
  skill,
  isHovered,
  isSelected,
  onHover,
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.scale.lerp(
        new THREE.Vector3(
          isHovered || hovered || isSelected ? 1.3 : 1,
          isHovered || hovered || isSelected ? 1.3 : 1,
          isHovered || hovered || isSelected ? 1.3 : 1
        ),
        0.1
      );
    }
  });

  return (
    <Sphere
      ref={meshRef}
      args={[0.8, 32, 32]}
      position={position}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(true, skill.id);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHovered(false);
        onHover(false, skill.id);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(skill.id);
      }}
    >
      <meshStandardMaterial
        color={isHovered || hovered || isSelected ? '#60a5fa' : '#3b82f6'}
        emissive={isHovered || hovered || isSelected ? '#1e40af' : '#1e3a8a'}
        emissiveIntensity={isHovered || hovered || isSelected ? 0.3 : 0.1}
        roughness={0.1}
        metalness={0.8}
      />
    </Sphere>
  );
};

// Connection lines
interface EdgeProps {
  start: [number, number, number];
  end: [number, number, number];
  highlighted: boolean;
}

const SkillEdge: React.FC<EdgeProps> = ({ start, end, highlighted }) => {
  const points = [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
  ] as THREE.Vector3Tuple;

  return (
    <Line
      points={points}
      color={highlighted ? '#60a5fa' : '#94a3b8'}
      lineWidth={highlighted ? 3 : 1}
      opacity={highlighted ? 1 : 0.4}
      transparent
    />
  );
};

// Main 3D scene
interface SceneProps {
  skills: SkillNode[];
  hoveredNode: string | null;
  selectedNode: string | null;
  positions: Record<string, [number, number, number]>;
  onNodeHover: (hovered: boolean, id: string) => void;
  onNodeClick: (id: string) => void;
}

const SkillNetworkScene: React.FC<SceneProps> = ({
  skills,
  hoveredNode,
  selectedNode,
  positions,
  onNodeHover,
  onNodeClick,
}) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {skills.map((skill) => (
        <SkillNode
          key={skill.id}
          position={positions[skill.id]}
          skill={skill}
          isHovered={hoveredNode === skill.id}
          isSelected={selectedNode === skill.id}
          onHover={onNodeHover}
          onClick={onNodeClick}
        />
      ))}

      {skills.map((skill) =>
        skill.connections.map((connectedId) => {
          const connectedSkill = skills.find((s) => s.id === connectedId);
          if (
            !connectedSkill ||
            !positions[skill.id] ||
            !positions[connectedId]
          )
            return null;

          return (
            <SkillEdge
              key={`${skill.id}-${connectedId}`}
              start={positions[skill.id]}
              end={positions[connectedId]}
              highlighted={
                hoveredNode === skill.id ||
                hoveredNode === connectedId ||
                selectedNode === skill.id ||
                selectedNode === connectedId
              }
            />
          );
        })
      )}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
};

// Enhanced sidebar
interface SidebarProps {
  skill: SkillNode | null;
  onClose: () => void;
}

const SkillSidebar: React.FC<SidebarProps> = ({ skill, onClose }) => {
  if (!skill) {
    return (
      <div className='w-96 bg-gradient-to-br from-slate-900 to-slate-800 border-l border-slate-700 flex flex-col items-center justify-center p-8 text-center'>
        <div className='w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6'>
          <svg
            className='w-8 h-8 text-blue-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 10V3L4 14h7v7l9-11h-7z'
            />
          </svg>
        </div>
        <h3 className='text-xl font-semibold text-white mb-3'>
          Explore Skills
        </h3>
        <p className='text-slate-400 text-sm leading-relaxed'>
          Click any skill node to view details and connections. Hover to
          highlight relationships in 3D space.
        </p>
      </div>
    );
  }

  return (
    <div className='w-96 bg-gradient-to-br from-slate-900 to-slate-800 border-l border-slate-700 flex flex-col'>
      {/* Header */}
      <div className='p-6 border-b border-slate-700/50'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center p-3 shadow-lg shadow-blue-500/20'>
              <img
                src={skill.logo}
                alt={skill.name}
                className='w-full h-full object-contain brightness-0 invert'
              />
            </div>
            <div>
              <h2 className='text-2xl font-bold text-white'>{skill.name}</h2>
              <span className='inline-block mt-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded'>
                {skill.connections.length} connections
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-6 space-y-6'>
        {/* Description */}
        <div>
          <h4 className='text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3'>
            About
          </h4>
          <p className='text-slate-300 leading-relaxed'>{skill.description}</p>
        </div>

        {/* Use Cases */}
        <div>
          <h4 className='text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3'>
            Use Cases
          </h4>
          <div className='space-y-2'>
            {skill.useCases.map((useCase, index) => (
              <div
                key={index}
                className='flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-blue-500/30 hover:bg-slate-800/80 transition-all'
              >
                <div className='w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0' />
                <span className='text-slate-300 text-sm'>{useCase}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Skills */}
        <div>
          <h4 className='text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3'>
            Connected Skills
          </h4>
          <div className='flex flex-wrap gap-2'>
            {skill.connections.map((connId) => {
              const connSkill = sampleSkills.find((s) => s.id === connId);
              return connSkill ? (
                <span
                  key={connId}
                  className='px-3 py-1.5 bg-blue-500/10 text-blue-300 text-sm rounded-lg border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer'
                >
                  {connSkill.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='p-6 border-t border-slate-700/50'>
        <button className='w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:scale-[1.02]'>
          Learn More
        </button>
      </div>
    </div>
  );
};

// Main component
const SkillGraph: React.FC<{ skills?: SkillNode[] }> = ({
  skills = sampleSkills,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [positions, setPositions] = useState<
    Record<string, [number, number, number]>
  >({});

  useEffect(() => {
    const calculate3DPositions = (): Record<
      string,
      [number, number, number]
    > => {
      const nodePositions: Record<string, [number, number, number]> = {};

      skills.forEach((skill) => {
        nodePositions[skill.id] = [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
        ];
      });

      for (let iteration = 0; iteration < 50; iteration++) {
        const forces: Record<string, [number, number, number]> = {};

        skills.forEach((skill) => {
          forces[skill.id] = [0, 0, 0];
        });

        skills.forEach((skillA) => {
          skills.forEach((skillB) => {
            if (skillA.id === skillB.id) return;

            const posA = nodePositions[skillA.id];
            const posB = nodePositions[skillB.id];
            const dx = posB[0] - posA[0];
            const dy = posB[1] - posA[1];
            const dz = posB[2] - posA[2];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;

            const repulsion = 1000 / (distance * distance);
            forces[skillA.id][0] -= (dx / distance) * repulsion;
            forces[skillA.id][1] -= (dy / distance) * repulsion;
            forces[skillA.id][2] -= (dz / distance) * repulsion;
          });
        });

        skills.forEach((skill) => {
          skill.connections.forEach((connectedId) => {
            const connectedSkill = skills.find((s) => s.id === connectedId);
            if (!connectedSkill) return;

            const posA = nodePositions[skill.id];
            const posB = nodePositions[connectedSkill.id];
            const dx = posB[0] - posA[0];
            const dy = posB[1] - posA[1];
            const dz = posB[2] - posA[2];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;

            const attraction = distance * 0.01;
            forces[skill.id][0] += (dx / distance) * attraction;
            forces[skill.id][1] += (dy / distance) * attraction;
            forces[skill.id][2] += (dz / distance) * attraction;
          });
        });

        skills.forEach((skill) => {
          const currentPos = nodePositions[skill.id];
          const force = forces[skill.id];
          nodePositions[skill.id] = [
            currentPos[0] + force[0] * 0.01,
            currentPos[1] + force[1] * 0.01,
            currentPos[2] + force[2] * 0.01,
          ];
        });
      }

      return nodePositions;
    };

    setPositions(calculate3DPositions());
  }, [skills]);

  const selectedSkill =
    skills.find((skill) => skill.id === selectedNode) || null;

  return (
    <div className='fixed inset-0 bg-slate-950 flex'>
      {/* 3D Canvas - Takes remaining space */}
      <div className='flex-1 relative'>
        <Canvas
          camera={{ position: [0, 0, 60], fov: 60 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <SkillNetworkScene
            skills={skills}
            hoveredNode={hoveredNode}
            selectedNode={selectedNode}
            positions={positions}
            onNodeHover={setHoveredNode}
            onNodeClick={setSelectedNode}
          />
        </Canvas>

        {/* Title overlay */}
        <div className='absolute top-6 left-6 pointer-events-none'>
          <h1 className='text-3xl font-bold text-white mb-2'>Skill Network</h1>
          <p className='text-slate-400 text-sm'>Interactive 3D visualization</p>
        </div>
      </div>

      {/* Sidebar */}
      <SkillSidebar
        skill={selectedSkill}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
};

export default SkillGraph;
