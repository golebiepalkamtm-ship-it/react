import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { AchievementsSection } from '@/components/AchievementsSection';
import { BreedingSection } from '@/components/BreedingSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <AchievementsSection />
      <BreedingSection />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default Index;
