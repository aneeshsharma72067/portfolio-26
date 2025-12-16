import { motion } from 'framer-motion';
import { ArrowDown, Download, Sparkles } from 'lucide-react';
import profileImage from '@/assets/image/profile.jpg';
import { BackgroundRippleEffect } from './ui/background-ripple-effect';

const HeroSection = () => {
  return (
    <section
      id='home'
      className='min-h-screen flex items-center justify-center relative pt-20 px-6'
    >
      <BackgroundRippleEffect />
      <div className='max-w-6xl z-10 mx-auto w-full grid lg:grid-cols-2 gap-12 items-center'>
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className='space-y-6'
        >
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-primary'
          >
            <Sparkles size={16} className='animate-pulse-glow' />
            <span>Available for opportunities</span>
          </motion.div> */}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='text-5xl md:text-7xl font-bold leading-tight'
          >
            Hi, I'm <span className='text-gradient'>Aneesh Sharma</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='text-xl md:text-2xl text-muted-foreground'
          >
            Software Development Engineer crafting{' '}
            <span className='text-foreground'>
              exceptional digital experiences
            </span>{' '}
            with modern technologies.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='flex flex-wrap gap-4 pt-4'
          >
            <motion.a
              href='#projects'
              className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover-glow'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Projects
              <ArrowDown size={18} />
            </motion.a>
            <motion.a
              href='/pdf/Aneesh_Sharma-4.pdf'
              className='inline-flex items-center gap-2 px-6 py-3 glass-card glow-border font-medium hover-glow'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={18} />
              Download CV
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className='flex gap-8 pt-8'
          >
            {[
              { value: '2+', label: 'Years Experience' },
              { value: '5+', label: 'Projects Completed' },
              { value: '10+', label: 'Technologies' },
            ].map((stat, index) => (
              <div key={index} className='text-center'>
                <div className='text-3xl font-bold text-gradient'>
                  {stat.value}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right content - 3D Profile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className='relative flex justify-center'
        >
          <div className='relative'>
            {/* Glow effect behind image */}
            <div className='absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-110' />

            {/* 3D rotating ring */}
            <motion.div
              className='absolute inset-0 border-2 border-primary/30 rounded-full'
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{ scale: 1.2 }}
            />
            <motion.div
              className='absolute inset-0 border border-secondary/20 rounded-full'
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              style={{ scale: 1.35 }}
            />

            {/* Profile image */}
            <motion.div
              className='relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden glass-card p-2'
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={profileImage}
                alt='Aneesh Sharma'
                className='w-full h-full object-cover rounded-full'
              />
            </motion.div>

            {/* Floating badges */}
            <motion.div
              className='absolute -top-4 -right-4 px-4 py-2 glass-card text-sm font-medium'
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🚀 React Expert
            </motion.div>
            <motion.div
              className='absolute -bottom-4 -left-4 px-4 py-2 glass-card text-sm font-medium'
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              ⚡ Full Stack
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className='absolute bottom-10 left-1/2 -translate-x-1/2'
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ArrowDown className='text-muted-foreground' />
      </motion.div>
    </section>
  );
};

export default HeroSection;
