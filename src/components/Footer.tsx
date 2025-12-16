import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className='py-8 px-6 border-t border-border/50'>
      <div className='max-w-6xl mx-auto'>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className='flex flex-col md:flex-row items-center justify-between gap-4'
        >
          <p className='text-white text-center w-full text-sm'>
            © {new Date().getFullYear()} Aneesh Sharma. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
