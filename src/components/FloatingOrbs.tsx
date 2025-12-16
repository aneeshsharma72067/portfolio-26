import { motion } from 'framer-motion';

const FloatingOrbs = () => {
  return (
    <div className='fixed inset-0 overflow-hidden pointer-events-none z-0'>
      {/* Primary large orb */}
      <motion.div
        className='orb orb-primary w-[600px] h-[600px] -top-48 -right-48'
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 50, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Secondary large orb */}
      <motion.div
        className='orb orb-secondary w-[500px] h-[500px] top-1/2 -left-64'
        animate={{
          x: [0, 80, -30, 0],
          y: [0, 60, -40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Small accent orb */}
      <motion.div
        className='orb orb-primary w-[300px] h-[300px] bottom-20 right-1/4'
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 40, -60, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Extra small orb */}
      <motion.div
        className='orb orb-secondary w-[200px] h-[200px] top-1/3 right-1/3 opacity-20'
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Gradient overlay for depth */}
      <div className='absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background pointer-events-none' />
    </div>
  );
};

export default FloatingOrbs;
