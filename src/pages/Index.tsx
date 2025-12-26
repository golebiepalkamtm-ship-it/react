import Header from "@/components/Header";
import { useEffect } from 'react';
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import AuctionsSection from "@/components/AuctionsSection";
import ChampionsSection from "@/components/ChampionsSection";
import PressSection from "@/components/PressSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  // ensure body has a class on the homepage so we can target header/background reliably
  useEffect(() => {
    document.body.classList.add('home-page');
    return () => document.body.classList.remove('home-page');
  }, []);
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <AuctionsSection />
        <ChampionsSection />
        <PressSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
