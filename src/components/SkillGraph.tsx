import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

// Skill data structure
export interface SkillNode {
  id: string;
  name: string;
  logo: string;
  description: string;
  useCases: string[];
  connections: string[];
  docs_url: string;
}

// Sample skill dataset with CDN logos
const sampleSkills: SkillNode[] = [
  {
    id: 'html',
    name: 'HTML',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    description:
      'Standard markup language for creating web pages and applications.',
    useCases: ['Web structure', 'Email templates', 'Static websites'],
    connections: ['css', 'javascript'],
    docs_url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
  },
  {
    id: 'css',
    name: 'CSS',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
    description:
      'Stylesheet language for describing presentation of HTML documents.',
    useCases: ['Responsive design', 'Animations', 'Layout systems'],
    connections: ['html', 'tailwind', 'javascript'],
    docs_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
    description: 'Utility-first CSS framework for rapid UI development.',
    useCases: ['Modern web apps', 'Component styling', 'Rapid prototyping'],
    connections: ['css', 'react', 'nextjs', 'vite'],
    docs_url: 'https://tailwindcss.com/docs',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    description:
      'Dynamic programming language for web interactivity and server-side development.',
    useCases: ['Frontend logic', 'Backend services', 'Full-stack development'],
    connections: ['html', 'css', 'typescript', 'nodejs', 'react'],
    docs_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    description:
      'Typed superset of JavaScript for scalable application development.',
    useCases: ['Enterprise apps', 'Type-safe codebases', 'Large teams'],
    connections: ['javascript', 'react', 'nextjs', 'nestjs', 'nodejs'],
    docs_url: 'https://www.typescriptlang.org/docs/',
  },
  {
    id: 'react',
    name: 'React',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
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
    docs_url: 'https://react.dev/',
  },
  {
    id: 'reactnative',
    name: 'React Native',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    description: 'Framework for building native mobile apps using React.',
    useCases: ['iOS apps', 'Android apps', 'Cross-platform mobile'],
    connections: ['react', 'javascript', 'typescript', 'expo', 'nodejs'],
    docs_url: 'https://reactnative.dev/docs/getting-started',
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
    description:
      'React framework with server-side rendering and static generation.',
    useCases: ['SEO-optimized sites', 'Full-stack apps', 'Static sites'],
    connections: ['react', 'typescript', 'nodejs', 'tailwind'],
    docs_url: 'https://nextjs.org/docs',
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
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
    docs_url: 'https://nodejs.org/en/docs',
  },
  {
    id: 'express',
    name: 'Express',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
    description: 'Minimal and flexible Node.js web application framework.',
    useCases: ['REST APIs', 'Web servers', 'Middleware services'],
    connections: [
      'nodejs',
      'javascript',
      'typescript',
      'mongodb',
      'postgresql',
    ],
    docs_url: 'https://expressjs.com/',
  },
  {
    id: 'nestjs',
    name: 'NestJS',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg',
    description:
      'Progressive Node.js framework for building efficient server-side apps.',
    useCases: ['Enterprise backends', 'GraphQL APIs', 'Microservices'],
    connections: ['nodejs', 'typescript', 'mongodb', 'postgresql', 'docker'],
    docs_url: 'https://docs.nestjs.com/',
  },
  {
    id: 'python',
    name: 'Python',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    description:
      'High-level programming language for web, data science, and automation.',
    useCases: ['Data analysis', 'Machine learning', 'Web backends'],
    connections: ['flask', 'postgresql', 'mongodb', 'docker'],
    docs_url: 'https://docs.python.org/3/',
  },
  {
    id: 'flask',
    name: 'Flask',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg',
    description:
      'Lightweight Python web framework for building web applications.',
    useCases: ['REST APIs', 'Microservices', 'Web apps'],
    connections: ['python', 'postgresql', 'mongodb', 'docker'],
    docs_url: 'https://flask.palletsprojects.com/',
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    description: 'NoSQL document database for flexible, scalable data storage.',
    useCases: ['Document storage', 'Real-time apps', 'Content management'],
    connections: ['nodejs', 'express', 'nestjs', 'python', 'flask', 'docker'],
    docs_url: 'https://www.mongodb.com/docs/',
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    description: 'Advanced open-source relational database system.',
    useCases: ['Relational data', 'Complex queries', 'Data integrity'],
    connections: ['nodejs', 'express', 'nestjs', 'python', 'flask', 'docker'],
    docs_url: 'https://www.postgresql.org/docs/',
  },
  {
    id: 'docker',
    name: 'Docker',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    description:
      'Platform for developing, shipping, and running applications in containers.',
    useCases: ['Containerization', 'Deployment', 'Development environments'],
    connections: ['nodejs', 'python', 'mongodb', 'postgresql', 'nestjs', 'aws'],
    docs_url: 'https://docs.docker.com/',
  },
  {
    id: 'vite',
    name: 'Vite',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg',
    description: 'Next-generation frontend build tool for fast development.',
    useCases: ['Build tooling', 'Dev servers', 'Frontend optimization'],
    connections: ['react', 'javascript', 'typescript', 'tailwind'],
    docs_url: 'https://vitejs.dev/guide/',
  },
  {
    id: 'expo',
    name: 'Expo',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/expo/expo-original.svg',
    description: 'Framework and platform for universal React applications.',
    useCases: [
      'Mobile development',
      'Cross-platform apps',
      'Rapid prototyping',
    ],
    connections: ['reactnative', 'javascript', 'typescript', 'nodejs'],
    docs_url: 'https://docs.expo.dev/',
  },
  {
    id: 'aws',
    name: 'AWS',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
    description: 'Comprehensive cloud computing platform by Amazon.',
    useCases: ['Cloud hosting', 'Serverless functions', 'Database services'],
    connections: ['docker', 'nodejs', 'python', 'mongodb', 'postgresql'],
    docs_url: 'https://docs.aws.amazon.com/',
  },
];

// Logo Node component
interface NodeProps {
  position: [number, number, number];
  skill: SkillNode;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (hovered: boolean, id: string) => void;
  onClick: (id: string) => void;
}

const LogoNode: React.FC<NodeProps> = ({
  position,
  skill,
  isHovered,
  isSelected,
  onHover,
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const scale = isHovered || hovered || isSelected ? 1.4 : 1;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  const handlePointerEnter = () => {
    setHovered(true);
    onHover(true, skill.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerLeave = () => {
    setHovered(false);
    onHover(false, skill.id);
    document.body.style.cursor = 'auto';
  };

  const handleClick = () => {
    onClick(skill.id);
  };

  const isActive = isHovered || hovered || isSelected;

  return (
    <group ref={groupRef} position={position}>
      <Html
        center
        style={{
          transition: 'all 0.2s ease-out',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}
          onMouseEnter={handlePointerEnter}
          onMouseLeave={handlePointerLeave}
          onClick={handleClick}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: isActive
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))'
                : 'rgba(30, 41, 59, 0.6)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              border: isActive
                ? '2px solid rgba(96, 165, 250, 0.5)'
                : '2px solid rgba(71, 85, 105, 0.3)',
              boxShadow: isActive
                ? '0 8px 32px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.2)'
                : '0 4px 16px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease-out',
              backdropFilter: 'blur(10px)',
            }}
          >
            <img
              src={skill.logo}
              alt={skill.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: isActive
                  ? 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.6))'
                  : 'none',
              }}
            />
          </div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: isActive ? '#60a5fa' : '#94a3b8',
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s ease-out',
            }}
          >
            {skill.name}
          </div>
        </div>
      </Html>
    </group>
  );
};

// Connection lines
interface EdgeProps {
  start: [number, number, number];
  end: [number, number, number];
  highlighted: boolean;
}

const SkillEdge: React.FC<EdgeProps> = ({ start, end, highlighted }) => {
  const points: [THREE.Vector3, THREE.Vector3] = [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
  ];

  return (
    <Line
      points={points}
      color={highlighted ? '#60a5fa' : '#475569'}
      lineWidth={highlighted ? 2.5 : 1}
      opacity={highlighted ? 0.8 : 0.3}
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
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

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

      {skills.map((skill) => (
        <LogoNode
          key={skill.id}
          position={positions[skill.id]}
          skill={skill}
          isHovered={hoveredNode === skill.id}
          isSelected={selectedNode === skill.id}
          onHover={onNodeHover}
          onClick={onNodeClick}
        />
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={80}
        autoRotate
        autoRotateSpeed={0.3}
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
  // if (!skill) {
  //   return (
  //     <div className='w-96 bg-gradient-to-br from-slate-900 to-slate-800 border-l border-slate-700 flex flex-col items-center justify-center p-8 text-center max-sm:absolute max-sm:w-full max-sm:top-0 max-sm:right-0 h-full'>
  //       <div className='w-16 h-16 z-50 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6'>
  //         <svg
  //           className='w-8 h-8 text-blue-400'
  //           fill='none'
  //           stroke='currentColor'
  //           viewBox='0 0 24 24'
  //         >
  //           <path
  //             strokeLinecap='round'
  //             strokeLinejoin='round'
  //             strokeWidth={2}
  //             d='M13 10V3L4 14h7v7l9-11h-7z'
  //           />
  //         </svg>
  //       </div>
  //       <h3 className='text-xl font-semibold text-white mb-3'>
  //         Explore Skills
  //       </h3>
  //       <p className='text-slate-400 text-sm leading-relaxed'>
  //         Click any skill node to view details and connections. Hover to
  //         highlight relationships in 3D space.
  //       </p>
  //     </div>ac
  //   );
  // }

  return (
    <div
      className={`w-96 bg-gradient-to-br z-[100] from-slate-900 to-slate-800 border-l border-slate-700 flex flex-col max-sm:absolute max-sm:w-full max-sm:top-0 transition-all duration-500 max-sm:right-0 h-full ${
        skill ? 'max-sm:translate-x-0' : 'max-sm:translate-x-full'
      }`}
    >
      {skill ? (
        <>
          <div className='p-6 border-b border-slate-700/50'>
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-4'>
                <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center p-3 shadow-lg shadow-blue-500/20'>
                  <img
                    src={skill.logo}
                    alt={skill.name}
                    className='w-full h-full object-contain'
                  />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-white'>
                    {skill.name}
                  </h2>
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

          <div className='flex-1 overflow-y-auto p-6 space-y-6'>
            <div>
              <h4 className='text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3'>
                About
              </h4>
              <p className='text-slate-300 leading-relaxed'>
                {skill.description}
              </p>
            </div>

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

          <div className='p-6 border-t border-slate-700/50'>
            <a
              href={skill.docs_url}
              target='_blank'
              className='w-full block text-center py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:scale-[1.02]'
            >
              Learn More
            </a>
          </div>
        </>
      ) : (
        <div className='w-96 bg-gradient-to-br from-slate-900 to-slate-800 border-l border-slate-700 flex flex-col items-center justify-center p-8 text-center max-sm:absolute max-sm:w-full max-sm:top-0 max-sm:right-0 h-full'>
          <div className='w-16 h-16 z-50 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6'>
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
      )}
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
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 25,
        ];
      });

      for (let iteration = 0; iteration < 60; iteration++) {
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

            const repulsion = 1200 / (distance * distance);
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

            const attraction = distance * 0.015;
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
      <div className='flex-1 relative'>
        <Canvas
          camera={{ position: [0, 0, 70], fov: 60 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <SkillNetworkScene
            skills={skills}
            hoveredNode={hoveredNode}
            selectedNode={selectedNode}
            positions={positions}
            onNodeHover={(hovered, id) => setHoveredNode(hovered ? id : null)}
            onNodeClick={setSelectedNode}
          />
        </Canvas>

        <div className='absolute top-6 left-6 pointer-events-none'>
          <h1 className='text-3xl font-bold text-white mb-2'>Skill Network</h1>
          <p className='text-slate-400 text-sm'>Interactive 3D visualization</p>
        </div>
      </div>

      <SkillSidebar
        skill={selectedSkill}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
};

export default SkillGraph;
