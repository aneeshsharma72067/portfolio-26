/**
 * Portfolio data — single source of truth for the UI.
 * Mirrors CONTENT.md at the project root. Update both together.
 */
import Traceon from '@/assets/image/traceon.png';
import AiGenPreview from '@/assets/image/aigenpreview.png';

/* ---------------------------------------------------------------- personal */

export const personal = {
  name: 'Aneesh Sharma',
  role: 'Software Development Engineer',
  // Short two-tone hero line; the trailing word renders in the accent colour.
  headline: 'Building thoughtful software, one system at a time.',
  location: 'Bilaspur, India',
  email: 'aneeshsharma1024@gmail.com',
  phone: '+91 72067 34591',
  resume: '/pdf/Aneesh_Sharma-4.pdf',
  domain: 'https://aneesh-sharma.me',
  bio: [
    "I'm a Software Development Engineer who enjoys building thoughtful, reliable digital products. I work across frontend, backend, and mobile development, focusing on experiences that are both intuitive and scalable.",
    "Over time, I've built a strong foundation in modern technologies like React, Next.js, Python, and AWS. I enjoy breaking down complex problems, writing clean code, and constantly improving the systems I work on.",
    'Beyond coding, I explore machine learning, keep up with new tech trends, contribute to open-source projects, and sharpen my thinking through chess.',
  ],
};

/* ------------------------------------------------------------------- links */

export const links = {
  github: 'https://github.com/aneeshsharma72067',
  githubRepos: 'https://github.com/aneeshsharma72067?tab=repositories',
  linkedin: 'https://www.linkedin.com/in/helloaneesh',
  twitter: 'https://x.com/aneeshdev03',
  email: 'mailto:aneeshsharma1024@gmail.com',
};

/* --------------------------------------------------------------- socials UI */

export type SocialLink = { label: string; handle: string; href: string };

export const socials: SocialLink[] = [
  { label: 'GitHub', handle: 'aneeshsharma72067', href: links.github },
  { label: 'LinkedIn', handle: 'in/helloaneesh', href: links.linkedin },
  { label: 'Twitter', handle: '@aneeshdev03', href: links.twitter },
  { label: 'Email', handle: personal.email, href: links.email },
];

/* ---------------------------------------------------------------- projects */

export type Project = {
  title: string;
  year: string;
  description: string;
  tags: string[];
  github: string;
  live: string;
  image: string;
};

export const projects: Project[] = [
  {
    title: 'RepoSage',
    year: '2025',
    description:
      'Event-driven AI system that analyzes GitHub repository events and detects engineering risks such as large commits and architectural drift. A serverless Fastify API on Vercel ingests webhooks in under 100ms and queues jobs to Redis via BullMQ, while distributed AI workers on Azure store runs in Postgres and power a Next.js dashboard.',
    tags: ['Fastify', 'Next.js', 'Redis', 'BullMQ', 'Postgres', 'Azure', 'AI'],
    github: 'https://github.com/aneeshsharma72067/reposage',
    live: 'https://reposage-web.vercel.app/',
    image: Traceon,
  },
  {
    title: 'AI-Gen',
    year: '2025',
    description:
      'A standalone AI-powered CLI tool that generates complete project folder structures from natural language prompts. Scaffolds projects instantly with zero setup, powered by Google Gemini AI and shipped as a cross-platform executable.',
    tags: ['Python', 'CLI', 'Gemini AI', 'React', 'Vite', 'Tailwind'],
    github: 'https://github.com/aneeshsharma72067/ai-structure-gen',
    live: 'https://ai-structure-gen.vercel.app/',
    image: AiGenPreview,
  },
  {
    title: 'CryptoPulse',
    year: '2024',
    description:
      'A modern crypto screener built with React and Tailwind CSS that displays real-time market data via the CoinGecko API. Clean UI, responsive design, and fast updates for tracking top cryptocurrencies.',
    tags: ['React', 'Tailwind', 'CoinGecko API', 'JavaScript'],
    github: 'https://github.com/aneeshsharma72067/cryptopulse',
    live: 'https://cryptopulse1.vercel.app/',
    image: 'https://aneesh-dev-old.netlify.app/assets/crypto-e693db22.png',
  },
  {
    title: 'Coderaven',
    year: '2024',
    description:
      'A real-time collaborative code editor supporting JavaScript and Python, letting multiple users write and edit code simultaneously. Built with low-latency synchronization and tested with up to 5 concurrent users for stability.',
    tags: ['WebSockets', 'JavaScript', 'Python', 'Real-Time', 'Full Stack'],
    github: 'https://github.com/aneeshsharma72067/coderaven-with-js',
    live: 'https://coderaven.onrender.com/',
    image: 'https://aneesh-dev-old.netlify.app/assets/coderaven-07cbb033.png',
  },
];

/* ------------------------------------------------------------------ skills */

export type SkillGroup = { title: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  {
    title: 'Frontend',
    items: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Tailwind'],
  },
  { title: 'Mobile', items: ['React Native', 'Expo'] },
  {
    title: 'Backend',
    items: ['Node.js', 'Express', 'NestJS', 'Python', 'Django', 'Flask'],
  },
  { title: 'Data', items: ['MongoDB', 'PostgreSQL', 'Firestore'] },
  { title: 'Cloud', items: ['AWS', 'Docker', 'Azure'] },
];

/* -------------------------------------------------------------- now playing */

export const nowPlaying = {
  track: 'Weightless',
  artist: 'Marconi Union',
  href: 'https://open.spotify.com/',
  isPlaying: true,
};
