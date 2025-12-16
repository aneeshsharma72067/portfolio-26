import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Linkedin,
  Github,
  Twitter,
} from 'lucide-react';
import { toast } from 'sonner';
import { PinContainer } from '@/components/ui/3d-pin';
import GitHubProfileImage from '../assets/image/github.png';
import LinkedinProfileImage from '../assets/image/linkedin.png';
import TwitterProfileImage from '../assets/image/twitter.png';

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'aneeshsharma1024@gmail.com',
    href: 'mailto:aneeshsharma1024@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 72067 34591',
    href: 'tel:+917206734591',
  },
  { icon: MapPin, label: 'Location', value: 'Bilaspur, India', href: '#' },
];

const socialLinks = [
  {
    icon: Github,
    label: 'GitHub',
    href: 'https://github.com/aneeshsharma72067',
    image: GitHubProfileImage,
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/helloaneesh/',
    image: LinkedinProfileImage,
  },
  {
    icon: Twitter,
    label: 'Twitter',
    href: 'https://x.com/aneeshdev03',
    image: TwitterProfileImage,
  },
];

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! I'll get back to you soon.");
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id='contact' className='py-32 px-6 relative' ref={ref}>
      <div className='max-w-6xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-bold mb-4'>
            Let's <span className='text-gradient'>Connect</span>
          </h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Have a project in mind or want to collaborate? I'd love to hear from
            you!
          </p>
        </motion.div>

        <div className='gap-12'>
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='w-full'
          >
            <div className='gap-6 flex flex-wrap flex-col md:flex-row'>
              {contactInfo.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className='flex flex-1 items-center gap-4 glass-card p-4 hover-glow group'
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 10 }}
                >
                  <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                    <item.icon className='text-primary' size={24} />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {item.label}
                    </p>
                    <p className='font-medium'>{item.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>
            {/* <LocationMap
              location='San Francisco, CA'
              coordinates='22.007367361377206, 82.11045967492095'
            /> */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.6 }}
              className='pt-8'
            >
              <p className='text-muted-foreground mb-6'>Follow me on</p>
              <div className='flex gap-20 md:gap-6 mt-20 justify-start flex-col md:flex-row'>
                {socialLinks.map((social, index) => (
                  <motion.div
                    key={social.label}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    className='w-full bg-primary/10 rounded-xl h-64'
                  >
                    <PinContainer
                      title={social.label}
                      href={social.href}
                      containerClassName='w-full'
                    >
                      <div className='flex flex-col items-center justify-between p-4 w-full h-full'>
                        <div className='flex items-center justify-between w-full'>
                          <div className=''>
                            <h3 className='text-lg font-bold text-slate-100 mb-2'>
                              {social.label}
                            </h3>
                            <p className='text-sm text-slate-400 text-center'>
                              Connect with me on {social.label}
                            </p>
                          </div>
                          <div className='w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover/pin:bg-primary/20 transition-colors'>
                            <social.icon size={32} className='text-primary' />
                          </div>
                        </div>
                        <img src={social.image} className='rounded-xl' alt='' />
                      </div>
                    </PinContainer>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Contact form */}
          {/* <motion.form
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={handleSubmit}
            className='glass-card p-8 space-y-6'
          >
            <div className='space-y-2'>
              <label htmlFor='name' className='text-sm font-medium'>
                Name
              </label>
              <input
                type='text'
                id='name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className='w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
                placeholder='Your name'
              />
            </div>
            <div className='space-y-2'>
              <label htmlFor='email' className='text-sm font-medium'>
                Email
              </label>
              <input
                type='email'
                id='email'
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className='w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
                placeholder='your@email.com'
              />
            </div>
            <div className='space-y-2'>
              <label htmlFor='message' className='text-sm font-medium'>
                Message
              </label>
              <textarea
                id='message'
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
                rows={5}
                className='w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none'
                placeholder='Tell me about your project...'
              />
            </div>
            <motion.button
              type='submit'
              className='w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover-glow'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Send size={18} />
              Send Message
            </motion.button>
          </motion.form> */}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
