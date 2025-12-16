import FloatingOrbs from '@/components/FloatingOrbs';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import SkillsSection from '@/components/SkillsSection';
import ProjectsSection from '@/components/ProjectsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import ArchitectureSection from '@/components/ArchitectureSection';
import { mockArchitectureData } from '@/components/ArchitectureDiagram';
import RevealEffect from '@/components/RevealEffect';

const Index = () => {
  return (
    <div className='relative min-h-screen max-w-[100vw] overflow-x-hidden'>
      <RevealEffect />
      <FloatingOrbs />
      <Navbar />
      <main className='relative z-10'>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        {/* <SkillEvolutionSection
          nodes={skillNodes}
          edges={skillEdges}
          minYear={2020}
          maxYear={2025}
        /> */}
        {/* <ArchitectureSection
          edges={mockArchitectureData.edges}
          nodes={mockArchitectureData.nodes}
        /> */}

        <ProjectsSection />
        <ContactSection />
        <Footer />
      </main>
    </div>
  );
};

export default Index;
