import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ExternalLink, Github, Layers } from 'lucide-react';
import AiGenPreview from '@/assets/image/aigenpreview.png';

const projects = [
  {
    title: 'AI-Gen — AI Project Structure Generator',
    description:
      'A standalone AI-powered CLI tool that generates complete project folder structures from natural language prompts. Built for developers to scaffold projects instantly with zero setup, powered by Google Gemini AI and distributed as a cross-platform executable.',
    image: AiGenPreview,
    tags: [
      'Python',
      'CLI Tool',
      'Google Gemini AI',
      'AI',
      'React',
      'Vite',
      'Tailwind CSS',
      'Vercel',
    ],
    github: 'https://github.com/aneeshsharma72067/ai-structure-gen', // replace with actual repo
    live: 'https://ai-structure-gen.vercel.app/',
  },
  {
    title: 'CryptoPulse — Crypto Screener Application',
    description:
      'A modern crypto screener application built with React.js and Tailwind CSS that displays real-time cryptocurrency market data using the CoinGecko API. Features a clean UI, responsive design, and fast data updates for tracking top cryptocurrencies.',
    image: 'https://aneesh-dev.netlify.app/assets/crypto-e693db22.png',
    tags: [
      'React',
      'Tailwind CSS',
      'API Integration',
      'CoinGecko API',
      'JavaScript',
      'Frontend',
      'Responsive UI',
    ],
    github: 'https://github.com/aneeshsharma72067/cryptopulse', // replace with actual repo
    live: 'https://cryptopulse1.vercel.app/', // replace if deployed
  },
  {
    title: 'Coderaven — Real-Time Collaborative Code Editor',
    description:
      'A real-time collaborative code editor supporting JavaScript and Python, enabling multiple users to write and edit code simultaneously. Built with low-latency synchronization and tested with up to 5 concurrent users to ensure stability and smooth collaboration.',
    image: 'https://aneesh-dev.netlify.app/assets/coderaven-07cbb033.png',
    tags: [
      'Real-Time Systems',
      'WebSockets',
      'JavaScript',
      'Python',
      'Collaborative Editing',
      'Concurrency',
      'Full Stack',
    ],
    github: 'https://github.com/aneeshsharma72067/coderaven-with-js', // add live link if deployed
    live: 'https://coderaven.onrender.com/', // replace with actual repo
  },
  {
    title: 'Sustainify — Solving Social Problems, Socially',
    description:
      'A social-impact web platform that enables users to connect, share environmental concerns, and collaborate on cleanup initiatives through image-based awareness campaigns. Built with a focus on community engagement, real-time interaction, and a clean, responsive UI.',
    image: 'https://aneesh-dev.netlify.app/assets/sustainify-46378aa3.png',
    tags: [
      'React',
      'Firebase',
      'Tailwind CSS',
      'Social Platform',
      'Environmental Tech',
      'Full Stack',
      'Web App',
    ],
    github: 'https://github.com/aneeshsharma72067/sustainify',
    live: 'https://sustainify-web.netlify.app/',
  },
];

const ProjectCard = ({
  project,
  index,
}: {
  project: (typeof projects)[0];
  index: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className='group relative perspective-1000'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className='glass-card overflow-hidden'
        animate={{
          rotateX: isHovered ? 5 : 0,
          rotateY: isHovered ? -5 : 0,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.3 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Image container */}
        <div className='relative h-48 overflow-hidden'>
          <motion.img
            src={project.image}
            alt={project.title}
            className='w-full h-full object-cover'
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4 }}
          />
          <div className='absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent' />

          {/* Overlay with links */}
          <motion.div
            className='absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center gap-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.a
              href={project.github}
              className='p-3 bg-background/80 rounded-full hover:bg-background transition-colors'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github size={20} />
            </motion.a>
            <motion.a
              href={project.live}
              className='p-3 bg-background/80 rounded-full hover:bg-background transition-colors'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink size={20} />
            </motion.a>
          </motion.div>
        </div>

        {/* Content */}
        <div className='p-6 space-y-4'>
          <div className='flex items-center gap-2'>
            <Layers className='text-primary' size={20} />
            <h3 className='text-xl font-semibold'>{project.title}</h3>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {project.description}
          </p>
          <div className='flex flex-wrap gap-2'>
            {project.tags.map((tag) => (
              <span
                key={tag}
                className='px-3 py-1 text-xs bg-primary/10 text-primary rounded-full'
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 3D lighting effect */}
        <motion.div
          className='absolute inset-0 pointer-events-none'
          animate={{
            background: isHovered
              ? 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, transparent 50%, hsl(var(--secondary) / 0.1) 100%)'
              : 'transparent',
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
};

const ProjectsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id='projects' className='py-32 px-6 relative' ref={ref}>
      <div className='max-w-6xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-bold mb-4'>
            Featured <span className='text-gradient'>Projects</span>
          </h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            A showcase of my recent work and creative endeavors
          </p>
        </motion.div>

        <div className='grid md:grid-cols-2 gap-8'>
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className='text-center mt-12'
        >
          <motion.a
            href='https://github.com/aneeshsharma72067?tab=repositories'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 px-6 py-3 glass-card glow-border font-medium hover-glow'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Github size={20} />
            View More on GitHub
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
