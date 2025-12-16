import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Code2, Lightbulb, Rocket, Users } from 'lucide-react';
import { HoverEffect } from './ui/card-hover-effect';

const highlights = [
  {
    icon: Code2,
    title: 'Clean Code',
    description:
      'Writing maintainable, scalable code that stands the test of time.',
  },
  {
    icon: Lightbulb,
    title: 'Problem Solver',
    description: 'Turning complex challenges into elegant, simple solutions.',
  },
  {
    icon: Rocket,
    title: 'Performance',
    description:
      'Optimizing for speed and delivering blazing-fast experiences.',
  },
  {
    icon: Users,
    title: 'Team Player',
    description:
      'Collaborating effectively to build amazing products together.',
  },
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id='about' className='py-32 px-6 relative' ref={ref}>
      <div className='max-w-6xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-bold mb-4'>
            About <span className='text-gradient'>Me</span>
          </h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Passionate about creating impactful software solutions
          </p>
        </motion.div>

        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='space-y-6'
          >
            <p className='text-lg text-muted-foreground leading-relaxed'>
              I’m a Software Development Engineer who enjoys building
              thoughtful, reliable digital products. I work across
              <span className='text-foreground'>
                {' '}
                frontend, backend, and mobile development
              </span>
              , focusing on creating experiences that are both intuitive and
              scalable.
            </p>

            <p className='text-lg text-muted-foreground leading-relaxed'>
              Over time, I’ve developed a strong foundation in modern
              technologies like <span className='text-primary'>React</span>,{' '}
              <span className='text-primary'>Next.js</span>,{' '}
              <span className='text-primary'>Python</span>, and{' '}
              <span className='text-primary'>AWS</span>. I enjoy breaking down
              complex problems, writing clean code, and constantly improving the
              systems I work on.
            </p>

            <p className='text-lg text-muted-foreground leading-relaxed'>
              Beyond coding, I spend time exploring machine learning, keeping up
              with new tech trends, contributing to open-source projects, and
              sharpening my thinking through chess. I also enjoy sharing what I
              learn with the developer community.
            </p>
          </motion.div>

          {/* Highlight cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                className="glass-card p-6 hover-glow group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  rotateX: 5,
                  rotateY: 5,
                }}
              >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="text-primary" size={24} />
                  </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))} */}
            <HoverEffect items={highlights} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
