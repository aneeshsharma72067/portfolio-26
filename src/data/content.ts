/**
 * Portfolio data — single source of truth for the UI.
 * Mirrors CONTENT.md at the project root. Update both together.
 */
import Traceon from '@/assets/image/traceon.png';
import AiGenPreview from '@/assets/image/aigenpreview.png';
import FolioPreview from '@/assets/image/folio.jpeg';
import RepetoPreview from '@/assets/image/repeto.jpeg';
import MyBasePreview from '@/assets/image/mybase.png';
import CryptoPreview from '@/assets/image/crypto.png';

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
    "I am Aneesh Sharma, a dreamy software engineer with an interest in building cool stuff: backend systems, CLI tools, and smooth animated frontends. I started learning to code in college after choosing Engineering (only to not get into agriculture like my family lol). I discovered this stuff was really fun. Before AI came along, I built a lot of stuff and learned a lot about software as well as hardware. Everything I built took time. I started like everyone else with YouTube tutorials and eventually ended up on documentation sites. Now with AI, I try stuff I never really attempted before.",
    "In my job I work with React, React Native, Next.js, Node.js, PostgreSQL, basically the whole JS family. Outside of work I personally enjoy Python and Rust. Python because I want to build Jarvis one day, and Rust because I want crazy fast performance. I'm also trying to learn RAG systems because I need to automate my life.",
    "When I'm not coding or socializing, you can find me playing chess, reading manhwas, or drawing. I like socializing, though it's quite draining for me, but being with people I can laugh and relax with is fun. In my career I want to go to new places, meet new people, learn all this crazy stuff, and explore the world.",
  ],
};

/* ------------------------------------------------------------------- links */

export const links = {
  github: 'https://github.com/jiffyaneesh',
  githubRepos: 'https://github.com/jiffyaneesh?tab=repositories',
  linkedin: 'https://www.linkedin.com/in/helloaneesh',
  twitter: 'https://x.com/aneeshdev03',
  email: 'mailto:aneeshsharma1024@gmail.com',
};

/* --------------------------------------------------------------- socials UI */

export type SocialLink = { label: string; handle: string; href: string };

export const socials: SocialLink[] = [
  { label: 'GitHub', handle: 'jiffyaneesh', href: links.github },
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
    github: 'https://github.com/jiffyaneesh/reposage',
    live: 'https://reposage-web.vercel.app/',
    image: Traceon,
  },
  {
    title: 'AI-Gen',
    year: '2025',
    description:
      'A standalone AI-powered CLI tool that generates complete project folder structures from natural language prompts. Scaffolds projects instantly with zero setup, powered by Google Gemini AI and shipped as a cross-platform executable.',
    tags: ['Python', 'CLI', 'Gemini AI', 'React', 'Vite', 'Tailwind'],
    github: 'https://github.com/jiffyaneesh/ai-structure-gen',
    live: 'https://ai-structure-gen.vercel.app/',
    image: AiGenPreview,
  },
  {
    title: 'Folio',
    year: '2025',
    description:
      'Browser-based PDF reader with note-taking built in, highly optimized, built with Svelte 5, SvelteKit, PDF.js, IndexedDB, can load 1000 pages without any lag or performance issue even on low end device.',
    tags: ['Svelte 5', 'SvelteKit', 'PDF.js', 'IndexedDB', 'Vite'],
    github: 'https://github.com/jiffyaneesh/folio',
    live: 'https://folioapp.pages.dev/',
    image: FolioPreview,
  },
  {
    title: 'Repeto',
    year: '2025',
    description:
      'Leetcode POTD email sender, custom time, no friction, no signup, built with Hono, React, Supabase, Cloudflare Workers. Real production tool with over 100 users.',
    tags: ['Hono', 'React', 'Supabase', 'Cloudflare Workers', 'Cron'],
    github: 'https://github.com/jiffyaneesh/repeto',
    live: 'https://repeto.dev',
    image: RepetoPreview,
  },
  {
    title: 'MyBase',
    year: '2025',
    description:
      'An all-in-one personal dashboard that unifies task management, goal tracking, hydration logging, and expense tracking into a single clean workspace. Designed to replace a dozen scattered apps with one fast, focused home base.',
    tags: ['React', 'TypeScript', 'Dashboard', 'Productivity'],
    github: 'https://github.com/jiffyaneesh/mybase',
    live: 'https://jiffyaneesh.github.io/mybase',
    image: MyBasePreview,
  },
  {
    title: 'CryptoPulse',
    year: '2025',
    description:
      'An advanced cryptocurrency screener with real-time prices, multi-timeframe market-cap change, sorting, currency conversion, and a watchlist. Built for traders who want to scan hundreds of assets at a glance.',
    tags: ['React', 'CoinGecko API', 'Screener', 'Real-time'],
    github: 'https://github.com/jiffyaneesh/cryptopulse',
    live: 'https://cryptopulse1.vercel.app/',
    image: CryptoPreview,
  },
];

/* -------------------------------------------------------------- experience */

export type Experience = {
  company: string;
  role: string;
  period: string;
  current?: boolean;
  description: string;
};

export const experiences: Experience[] = [
  {
    company: 'Resiliencesoft',
    role: 'Software Development Engineer',
    period: 'Feb 2025 — Present',
    current: true,
    description:
      'Architecting fault-tolerant, cloud-native systems at scale — shipping event-driven microservices, driving observability-first design, and turning ambiguous specs into resilient, low-latency infrastructure that just refuses to fall over.',
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
    items: ['Node.js', 'Express', 'NestJS', 'Python', 'Django', 'Flask', 'Rust'],
  },
  { title: 'Data', items: ['MongoDB', 'PostgreSQL', 'Firestore'] },
  { title: 'Cloud', items: ['AWS', 'Docker', 'Azure'] },
];

/* -------------------------------------------------------------- now playing */

export const nowPlaying = {
  track: "We Don't Talk Anymore",
  artist: 'Charlie Puth feat. Selena Gomez',
  href: 'https://open.spotify.com/',
  isPlaying: false,
};
