import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';
import Logo from '@/assets/image/logo.png';

const navItems = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Contact', href: '#contact' },
];

const socialLinks = [
  {
    icon: Github,
    href: 'https://github.com/aneeshsharma72067',
    label: 'GitHub',
  },
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/in/helloaneesh',
    label: 'LinkedIn',
  },
  { icon: Mail, href: 'mailto:aneeshsharma1024@gmail.com', label: 'Email' },
];

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className='fixed top-0 left-0 right-0 z-50 px-6 py-4'
    >
      <div className='max-w-6xl mx-auto flex items-center justify-between glass-card px-6 py-3'>
        <motion.a
          href='#home'
          className='text-xl font-bold text-gradient'
          whileHover={{ scale: 1.05 }}
        >
          <img src={Logo} className='w-10 h-auto rounded-full' alt='' />
        </motion.a>

        <ul className='hidden md:flex items-center gap-8'>
          {navItems.map((item, index) => (
            <motion.li
              key={item.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <a href={item.href} className='nav-link text-sm font-medium'>
                {item.name}
              </a>
            </motion.li>
          ))}
        </ul>

        <div className='flex items-center gap-4'>
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.label}
              href={social.href}
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground hover:text-primary transition-colors duration-300'
              whileHover={{ scale: 1.1, rotate: 5 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <social.icon size={20} />
            </motion.a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
