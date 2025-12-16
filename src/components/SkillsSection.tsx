import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { CardSpotlight } from './ui/card-spotlight';

const skills = [
  { name: 'JavaScript', level: 95, color: 'from-yellow-400 to-yellow-600' },
  { name: 'TypeScript', level: 92, color: 'from-blue-400 to-blue-600' },
  { name: 'Python', level: 85, color: 'from-green-400 to-green-600' },
  { name: 'React', level: 95, color: 'from-cyan-400 to-cyan-600' },
  { name: 'Next.js', level: 90, color: 'from-gray-400 to-gray-600' },
  { name: 'React Native', level: 88, color: 'from-purple-400 to-purple-600' },
  { name: 'Expo', level: 88, color: 'from-slate-400 to-slate-600' },

  { name: 'Vue.js', level: 80, color: 'from-emerald-400 to-emerald-600' },
  { name: 'Node.js', level: 90, color: 'from-lime-400 to-lime-600' },
  { name: 'Express.js', level: 88, color: 'from-stone-400 to-stone-600' },
  { name: 'NestJS', level: 85, color: 'from-red-400 to-red-600' },
  { name: 'Django', level: 80, color: 'from-emerald-400 to-emerald-600' },
  { name: 'MongoDB', level: 88, color: 'from-green-500 to-green-700' },
  { name: 'PostgreSQL', level: 80, color: 'from-sky-500 to-sky-700' },
];

const techCategories = [
  {
    title: 'Frontend',
    techs: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js'],
  },
  {
    title: 'Mobile',
    techs: ['React Native', 'Expo'],
  },
  {
    title: 'Backend',
    techs: ['Node.js', 'Express.js', 'NestJS', 'Python', 'Django'],
  },
  {
    title: 'Databases',
    techs: ['MongoDB', 'PostgreSQL', 'Firestore'],
  },
];

const SkillsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id='skills' className='py-32 px-6 relative' ref={ref}>
      <div className='max-w-6xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-bold mb-4'>
            Skills & <span className='text-gradient'>Technologies</span>
          </h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            A comprehensive toolkit for building modern applications
          </p>
        </motion.div>

        {/* Skill bars */}
        <div className='grid md:grid-cols-2 gap-6 mb-20'>
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className='space-y-2'
            >
              <div className='flex justify-between text-sm'>
                <span className='font-medium'>{skill.name}</span>
                <span className='text-muted-foreground'>{skill.level}%</span>
              </div>
              <div className='h-2 bg-muted rounded-full overflow-hidden'>
                <motion.div
                  className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${skill.level}%` } : {}}
                  transition={{ duration: 1, delay: 0.5 + index * 0.05 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tech categories */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {techCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className=''
              whileHover={{
                scale: 1.02,
                rotateY: 5,
              }}
            >
              <CardSpotlight className='glass-card min-h-48 p-6 hover-glow'>
                <h3 className='text-lg font-semibold mb-4 text-gradient'>
                  {category.title}
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {category.techs.map((tech) => (
                    <span
                      key={tech}
                      className='px-3 py-1 text-xs bg-primary/10 text-primary rounded-full border border-primary/20'
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </CardSpotlight>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
