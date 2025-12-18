import IMAGES from '@/assets/image/images';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type Skill = {
  name: string;
  icon: string; // image or svg path
  x: number; // percentage
  y: number; // percentage
};

type Layer = {
  depth: number;
  size: string;
  opacity: string;
  skills: Skill[];
};

const layers: Layer[] = [
  {
    depth: 1,
    size: 'w-20 h-20',
    opacity: 'opacity-100',
    skills: [
      {
        name: 'HTML',
        icon: IMAGES.skills.html,
        x: 15,
        y: 30,
      },
      {
        name: 'CSS',
        icon: IMAGES.skills.css,
        x: 40,
        y: 20,
      },
      {
        name: 'JavaScript',
        icon: IMAGES.skills.js,
        x: 65,
        y: 35,
      },
      {
        name: 'TypeScript',
        icon: IMAGES.skills.ts,
        x: 30,
        y: 60,
      },
      {
        name: 'React',
        icon: IMAGES.skills.react,
        x: 55,
        y: 55,
      },
      {
        name: 'Node.js',
        icon: IMAGES.skills.node,
        x: 75,
        y: 60,
      },
    ],
  },
  {
    depth: 0.6,
    size: 'w-16 h-16',
    opacity: 'opacity-80',
    skills: [
      {
        name: 'Next.js',
        icon: IMAGES.skills.next,
        x: 20,
        y: 10,
      },
      {
        name: 'React Native',
        icon: IMAGES.skills.reactNative,
        x: 70,
        y: 15,
      },
      {
        name: 'Express',
        icon: IMAGES.skills.node, // Express icon not present → using Node
        x: 10,
        y: 50,
      },
      {
        name: 'NestJS',
        icon: IMAGES.skills.nest,
        x: 85,
        y: 45,
      },
      {
        name: 'MongoDB',
        icon: IMAGES.skills.mongo,
        x: 25,
        y: 80,
      },
      {
        name: 'PostgreSQL',
        icon: IMAGES.skills.postgres,
        x: 60,
        y: 85,
      },
    ],
  },
  {
    depth: 0.35,
    size: 'w-12 h-12',
    opacity: 'opacity-60',
    skills: [
      {
        name: 'Tailwind',
        icon: IMAGES.skills.tailwind,
        x: 5,
        y: 20,
      },
      {
        name: 'Docker',
        icon: IMAGES.skills.docker,
        x: 90,
        y: 20,
      },
      {
        name: 'AWS',
        icon: IMAGES.skills.aws,
        x: 45,
        y: 5,
      },
      {
        name: 'Python',
        icon: IMAGES.skills.python,
        x: 10,
        y: 85,
      },
      {
        name: 'Flask',
        icon: IMAGES.skills.flask,
        x: 85,
        y: 80,
      },
      {
        name: 'Vite',
        icon: IMAGES.skills.vite,
        x: 50,
        y: 95,
      },
      {
        name: 'Expo',
        icon: IMAGES.skills.expo,
        x: 95,
        y: 55,
      },
    ],
  },
];

export default function SkillParallaxCloud() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

      setOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className='relative w-full h-[700px] flex items-center justify-center overflow-hidden'
    >
      <Link
        to={'/skill-graph'}
        className='
    relative inline-flex items-center justify-center z-10
    px-6 py-3
    text-sm font-medium tracking-wide
    text-white
    rounded-full
    bg-gradient-to-r from-primary to-secondary
    shadow-lg shadow-purple-500/30
    transition-all duration-300
    hover:shadow-xl hover:shadow-purple-500/50
    hover:scale-[1.03]
    focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-black
  '
      >
        Explore my skill network
      </Link>

      {layers.map((layer, layerIndex) => (
        <div key={layerIndex} className='absolute w-full h-[500px]'>
          {layer.skills.map((skill) => (
            <div
              key={skill.name}
              className={`
                absolute flex items-center justify-center
                rounded-xl bg-white/5 backdrop-blur-md
                shadow-lg border border-white/10
                transition-transform duration-200 ease-out
                ${layer.size} ${layer.opacity}
              `}
              style={{
                left: `${skill.x}%`,
                top: `${skill.y}%`,
                transform: `
                  translate(
                    ${offset.x * 40 * layer.depth}px,
                    ${offset.y * 40 * layer.depth}px
                  )
                `,
              }}
            >
              <img
                src={skill.icon}
                alt={skill.name}
                className='w-2/3 h-2/3 object-contain'
                draggable={false}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
